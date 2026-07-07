import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { Camera, Loader2, AlertCircle } from "lucide-react";
import { getProctorStream, setProctorStream } from "../lib/proctorStream";

interface FaceDetectionMonitorProps {
  sessionId: string | null;
}

type FaceStatus =
  | "loading" | "detecting" | "face" | "no_face" | "multiple_face" | "camera_error";

// Phase 3
type HeadDirection =
  | "forward" | "left" | "right" | "up" | "down" | "away" | "unknown";

// Phase 4
type EyeStatus =
  | "screen"   // eyes open, looking at screen
  | "away"     // gaze directed away from screen
  | "closed"   // both eyes closed (potential blink or sustained close)
  | "missing"  // eye landmarks unreliable (sunglasses, hand covering, poor light)
  | "unknown"; // face not detected, eye status not available

type ViolationType =
  | "NO_FACE" | "MULTIPLE_FACE"
  | "HEAD_LEFT" | "HEAD_RIGHT" | "HEAD_UP" | "HEAD_DOWN" | "LOOKING_AWAY"
  | "EYES_CLOSED" | "EYES_MISSING";

// ─── Detection intervals / thresholds ───────────────────────────────────────
const DETECTION_INTERVAL_MS    = 500;
const VIOLATION_COOLDOWN_MS    = 5000;
const POSE_VIOLATION_MS        = 3000;

// Phase 4 — EAR thresholds
// Typical open-eye EAR: 0.27–0.35; typical closed: ~0.15
const EAR_OPEN_THRESHOLD    = 0.20; // above this = eyes open
const EAR_MISSING_THRESHOLD = 0.08; // below this = landmarks unreliable

// Phase 4 — sustained duration thresholds
const EYES_CLOSED_VIOLATION_MS  = 2000; // closed continuously before logging
const EYES_AWAY_VIOLATION_MS    = 3000; // looking away continuously
const EYES_MISSING_VIOLATION_MS = 3000; // missing continuously

// Phase 4 — gaze-away thresholds (more sensitive than Phase 3 head-turn thresholds)
const GAZE_YAW_THRESHOLD   = 0.08;
const GAZE_PITCH_UP         = 0.40;
const GAZE_PITCH_DOWN       = 0.58;

// Phase 3 — head-pose thresholds
const YAW_THRESHOLD         = 0.12;
const PITCH_UP_THRESHOLD    = 0.38;
const PITCH_DOWN_THRESHOLD  = 0.60;
const AWAY_THRESHOLD        = 0.22;

const MODEL_URL = "/models";

// ─── Module-level model promise (reset on failure so next mount can retry) ──
let modelsLoadPromise: Promise<void> | null = null;

function loadModelsOnce(): Promise<void> {
  if (!modelsLoadPromise) {
    modelsLoadPromise = Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    ])
      .then(() => undefined)
      .catch((err) => { modelsLoadPromise = null; throw err; });
  }
  return modelsLoadPromise;
}

// ─── Camera error reason ────────────────────────────────────────────────────
function getCameraErrorReason(err: unknown): string {
  const e = err as { name?: string; message?: string } | null;
  if (!e) return "MediaStream is null — proctoring setup may have been skipped.";
  switch (e.name) {
    case "NotAllowedError":
    case "PermissionDeniedError": return "Camera permission denied. Allow access in your browser settings.";
    case "NotFoundError":
    case "DevicesNotFoundError":  return "No webcam detected. Connect a camera and try again.";
    case "NotReadableError":
    case "TrackStartError":       return "Camera is already in use by another application.";
    default: return e.message ? `Camera error: ${e.message}` : "Camera unavailable.";
  }
}

// ─── PHASE 3: Head pose helpers ─────────────────────────────────────────────
function estimateHeadDirection(
  landmarks: faceapi.FaceLandmarks68
): { direction: HeadDirection; yaw: number; pitch: number } {
  const pts = landmarks.positions;
  const leftEye  = pts[36]; const rightEye = pts[45];
  const noseTip  = pts[30]; const chin     = pts[8];
  const eyeMidX  = (leftEye.x + rightEye.x) / 2;
  const eyeMidY  = (leftEye.y + rightEye.y) / 2;
  const faceWidth  = rightEye.x - leftEye.x;
  const faceHeight = chin.y - eyeMidY;
  if (faceWidth < 1 || faceHeight < 1) return { direction: "unknown", yaw: 0, pitch: 0 };
  const yaw   = (noseTip.x - eyeMidX) / faceWidth;
  const pitch = (noseTip.y - eyeMidY) / faceHeight;
  const isYawExtreme   = Math.abs(yaw) > AWAY_THRESHOLD;
  const isPitchExtreme = pitch < PITCH_UP_THRESHOLD - 0.08 || pitch > PITCH_DOWN_THRESHOLD + 0.08;
  if (isYawExtreme && isPitchExtreme) return { direction: "away",  yaw, pitch };
  if (pitch < PITCH_UP_THRESHOLD)     return { direction: "up",    yaw, pitch };
  if (pitch > PITCH_DOWN_THRESHOLD)   return { direction: "down",  yaw, pitch };
  if (yaw < -YAW_THRESHOLD)           return { direction: "left",  yaw, pitch };
  if (yaw >  YAW_THRESHOLD)           return { direction: "right", yaw, pitch };
  return { direction: "forward", yaw, pitch };
}

function drawNoseDirectionLine(
  ctx: CanvasRenderingContext2D,
  landmarks: faceapi.FaceLandmarks68,
  direction: HeadDirection,
  scaleX: number, scaleY: number
) {
  const pts = landmarks.positions;
  const bridgeX = pts[27].x * scaleX; const bridgeY = pts[27].y * scaleY;
  const tipX    = pts[30].x * scaleX; const tipY    = pts[30].y * scaleY;
  const dx = tipX - bridgeX; const dy = tipY - bridgeY;
  const endX = tipX + dx * 1.5; const endY = tipY + dy * 1.5;
  const lineColor = direction === "forward" ? "#22c55e" : direction === "away" ? "#ef4444" : "#f59e0b";
  ctx.beginPath(); ctx.moveTo(bridgeX, bridgeY); ctx.lineTo(endX, endY);
  ctx.strokeStyle = lineColor; ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.stroke();
  ctx.beginPath(); ctx.arc(endX, endY, 4, 0, 2 * Math.PI);
  ctx.fillStyle = lineColor; ctx.fill();
}

// ─── PHASE 4: Eye Aspect Ratio helpers ──────────────────────────────────────
interface Point { x: number; y: number; }

function euclidean(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/**
 * EAR = (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)
 * Points: [outerCorner, upperLeft, upperRight, innerCorner, lowerRight, lowerLeft]
 */
function computeEAR(eye: Point[]): number {
  const A = euclidean(eye[1], eye[5]); // vertical top-left  to bottom-left
  const B = euclidean(eye[2], eye[4]); // vertical top-right to bottom-right
  const C = euclidean(eye[0], eye[3]); // horizontal outer   to inner corner
  if (C < 0.5) return 0;               // degenerate — landmarks on top of each other
  return (A + B) / (2.0 * C);
}

/**
 * Analyses eye status using the 68-landmark positions.
 * Landmarks used:
 *   Left eye:  36 outer, 37 upper-L, 38 upper-R, 39 inner, 40 lower-R, 41 lower-L
 *   Right eye: 42 inner, 43 upper-L, 44 upper-R, 45 outer, 46 lower-R, 47 lower-L
 *
 * "Looking Away" uses yaw/pitch from head-pose as a proxy for gaze direction,
 * with a MORE SENSITIVE threshold (0.08) than Phase 3 head-turn (0.12), so it
 * fires for subtle gaze shifts that don't yet constitute a full head turn.
 */
function analyzeEyes(
  landmarks: faceapi.FaceLandmarks68,
  yaw: number,
  pitch: number
): { eyeStatus: EyeStatus; leftEAR: number; rightEAR: number } {
  const pts = landmarks.positions;

  const leftEyePts:  Point[] = [pts[36], pts[37], pts[38], pts[39], pts[40], pts[41]];
  const rightEyePts: Point[] = [pts[42], pts[43], pts[44], pts[45], pts[46], pts[47]];

  const leftEAR  = computeEAR(leftEyePts);
  const rightEAR = computeEAR(rightEyePts);
  const avgEAR   = (leftEAR + rightEAR) / 2;

  // Unreliable landmarks (occluded eyes, sunglasses, hand, very poor light)
  if (avgEAR <= EAR_MISSING_THRESHOLD) {
    return { eyeStatus: "missing", leftEAR, rightEAR };
  }

  // Eyes closed (sustained blink or deliberate closure)
  if (avgEAR <= EAR_OPEN_THRESHOLD) {
    return { eyeStatus: "closed", leftEAR, rightEAR };
  }

  // Eyes open — check gaze direction via head-pose proxy
  const gazedAway =
    Math.abs(yaw) > GAZE_YAW_THRESHOLD ||
    pitch < GAZE_PITCH_UP ||
    pitch > GAZE_PITCH_DOWN;

  return { eyeStatus: gazedAway ? "away" : "screen", leftEAR, rightEAR };
}

/** Draws the 12 eye landmark dots, coloured by eye status. */
function drawEyeLandmarks(
  ctx: CanvasRenderingContext2D,
  landmarks: faceapi.FaceLandmarks68,
  eyeStatus: EyeStatus,
  scaleX: number, scaleY: number
) {
  const pts = landmarks.positions;
  const eyeIndices = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47];
  const dotColor =
    eyeStatus === "screen" ? "#22c55e" :
    eyeStatus === "away"   ? "#f59e0b" :
    eyeStatus === "closed" ? "#f59e0b" :
    "#ef4444"; // missing

  eyeIndices.forEach((i) => {
    ctx.beginPath();
    ctx.arc(pts[i].x * scaleX, pts[i].y * scaleY, 2.5, 0, 2 * Math.PI);
    ctx.fillStyle = dotColor;
    ctx.fill();
  });
}

// ─── Component ───────────────────────────────────────────────────────────────
export function FaceDetectionMonitor({ sessionId }: FaceDetectionMonitorProps) {
  const [status,       setStatus]       = useState<FaceStatus>("loading");
  const [headDirection,setHeadDirection]= useState<HeadDirection>("unknown");
  const [eyeStatus,   setEyeStatus]    = useState<EyeStatus>("unknown");
  const [modelError,  setModelError]   = useState<string | null>(null);
  const [cameraErrMsg,setCameraErrMsg] = useState<string | null>(null);

  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Refs: read by interval without stale-closure issues
  const modelsReadyRef = useRef(false);
  const cameraReadyRef = useRef(false);
  const stoppedRef     = useRef(false);

  // Violation cooldown (shared across all types)
  const lastViolationRef = useRef<{ type: string; loggedAt: number } | null>(null);

  // Phase 3 — head pose sustained timer
  const poseStartRef = useRef<{ direction: HeadDirection; since: number } | null>(null);

  // Phase 4 — eye sustained timers
  const eyesClosedSinceRef  = useRef<number | null>(null);
  const eyesAwaySinceRef    = useRef<number | null>(null);
  const eyesMissingSinceRef = useRef<number | null>(null);

  const token = localStorage.getItem("token");

  // ─── Shared violation logger ────────────────────────────────────────────
  const logViolation = async (eventType: ViolationType, details?: string) => {
    if (!sessionId) return;
    const now  = Date.now();
    const last = lastViolationRef.current;
    if (last && last.type === eventType && now - last.loggedAt < VIOLATION_COOLDOWN_MS) return;
    lastViolationRef.current = { type: eventType, loggedAt: now };
    try {
      await fetch(`http://localhost:5000/api/proctor/${sessionId}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ eventType, details }),
      });
    } catch { /* best-effort */ }
  };

  // ─── Phase 3: head pose violation handler ───────────────────────────────
  const handlePoseViolation = (direction: HeadDirection) => {
    const now = Date.now();
    const dirToViolation: Partial<Record<HeadDirection, ViolationType>> = {
      left: "HEAD_LEFT", right: "HEAD_RIGHT",
      up:   "HEAD_UP",   down:  "HEAD_DOWN",  away: "LOOKING_AWAY",
    };
    if (direction === "forward" || direction === "unknown") {
      poseStartRef.current = null; return;
    }
    const pose = poseStartRef.current;
    if (!pose || pose.direction !== direction) {
      poseStartRef.current = { direction, since: now }; return;
    }
    if (now - pose.since >= POSE_VIOLATION_MS) {
      const vt = dirToViolation[direction];
      if (vt) logViolation(vt, `Sustained ${Math.round((now - pose.since)/1000)}s`);
    }
  };

  // ─── Phase 4: eye violation handler ─────────────────────────────────────
  const handleEyeViolation = (es: EyeStatus) => {
    const now = Date.now();

    // Reset timers for inactive states
    if (es !== "closed")  eyesClosedSinceRef.current  = null;
    if (es !== "away")    eyesAwaySinceRef.current    = null;
    if (es !== "missing") eyesMissingSinceRef.current = null;

    if (es === "closed") {
      if (!eyesClosedSinceRef.current) { eyesClosedSinceRef.current = now; return; }
      if (now - eyesClosedSinceRef.current >= EYES_CLOSED_VIOLATION_MS) {
        logViolation("EYES_CLOSED", `Closed for ${Math.round((now - eyesClosedSinceRef.current)/1000)}s`);
      }
    } else if (es === "away") {
      if (!eyesAwaySinceRef.current) { eyesAwaySinceRef.current = now; return; }
      if (now - eyesAwaySinceRef.current >= EYES_AWAY_VIOLATION_MS) {
        logViolation("LOOKING_AWAY", `Eyes away for ${Math.round((now - eyesAwaySinceRef.current)/1000)}s`);
      }
    } else if (es === "missing") {
      if (!eyesMissingSinceRef.current) { eyesMissingSinceRef.current = now; return; }
      if (now - eyesMissingSinceRef.current >= EYES_MISSING_VIOLATION_MS) {
        logViolation("EYES_MISSING", `Missing for ${Math.round((now - eyesMissingSinceRef.current)/1000)}s`);
      }
    }
  };

  // ─── EFFECT 1: Load models ───────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    console.log("[FaceDetection] Loading AI models from", MODEL_URL);
    loadModelsOnce()
      .then(() => {
        if (cancelled) return;
        console.log("[FaceDetection] ✅ Models loaded");
        modelsReadyRef.current = true;
        setStatus((prev) => prev === "loading" ? "detecting" : prev);
      })
      .catch((err) => {
        if (cancelled) return;
        const msg = err?.message || String(err);
        console.error("[FaceDetection] ❌ Model load failed:", err);
        setModelError(`Failed to load AI proctoring models: ${msg}. Check /models/ is accessible.`);
      });
    return () => { cancelled = true; };
  }, []);

  // ─── EFFECT 2: Attach webcam stream ─────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    let ownStream: MediaStream | null = null;

    const attachStream = async () => {
      let stream = getProctorStream();
      const tracks = stream?.getVideoTracks() ?? [];
      const isLive = tracks.length > 0 && tracks[0].readyState !== "ended";

      if (!stream || !isLive) {
        console.warn("[FaceDetection] Inherited stream unavailable — requesting directly");
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          ownStream = stream; setProctorStream(stream);
          console.log("[FaceDetection] ✅ Fallback camera acquired");
        } catch (err) {
          if (cancelled) return;
          setCameraErrMsg(getCameraErrorReason(err));
          setStatus("camera_error"); return;
        }
      } else {
        console.log("[FaceDetection] ✅ Inherited stream is live");
      }

      if (cancelled) { ownStream?.getTracks().forEach((t) => t.stop()); return; }

      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        const markReady = () => {
          if (cancelled) return;
          console.log("[FaceDetection] ✅ Video ready —",
            video.videoWidth, "x", video.videoHeight, "readyState:", video.readyState);
          cameraReadyRef.current = true;
        };
        if (video.readyState >= 2) markReady();
        else video.addEventListener("loadeddata", markReady, { once: true });

        const [track] = stream.getVideoTracks();
        if (track) {
          track.addEventListener("ended", () => {
            stoppedRef.current = true; cameraReadyRef.current = false;
            setCameraErrMsg("Camera disconnected."); setStatus("camera_error");
          });
        }
      }
    };

    attachStream();
    return () => {
      cancelled = true;
      if (ownStream) ownStream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // ─── EFFECT 3: Detection interval (runs once; reads refs each tick) ──────
  useEffect(() => {
    let tickCount = 0;

    const detect = async () => {
      if (stoppedRef.current)  return;
      if (!modelsReadyRef.current || !cameraReadyRef.current) return;

      const video  = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || video.readyState < 2) return;

      tickCount++;
      try {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
          .withFaceLandmarks();

        if (stoppedRef.current) return;

        const count = detections.length;
        console.log(`[FaceDetection] tick#${tickCount} — faces: ${count}`);

        let newFaceStatus: FaceStatus;
        let newDirection:  HeadDirection = "unknown";
        let newEyeStatus:  EyeStatus    = "unknown";

        if (count === 0) {
          newFaceStatus = "no_face";
          logViolation("NO_FACE");
          poseStartRef.current       = null;
          eyesClosedSinceRef.current = null;
          eyesAwaySinceRef.current   = null;
          eyesMissingSinceRef.current= null;
        } else if (count > 1) {
          newFaceStatus = "multiple_face";
          logViolation("MULTIPLE_FACE");
          poseStartRef.current       = null;
          eyesClosedSinceRef.current = null;
          eyesAwaySinceRef.current   = null;
          eyesMissingSinceRef.current= null;
        } else {
          // ── Single face: Phase 3 head pose ──────────────────────────────
          newFaceStatus = "face";
          const pose = estimateHeadDirection(detections[0].landmarks);
          newDirection = pose.direction;
          handlePoseViolation(pose.direction);

          // ── Single face: Phase 4 eye tracking ───────────────────────────
          const { eyeStatus: es, leftEAR, rightEAR } =
            analyzeEyes(detections[0].landmarks, pose.yaw, pose.pitch);
          newEyeStatus = es;
          handleEyeViolation(es);
          console.log(`[FaceDetection] tick#${tickCount} — head: ${newDirection} | eye: ${es} | EAR L:${leftEAR.toFixed(2)} R:${rightEAR.toFixed(2)}`);
        }

        setStatus(newFaceStatus);
        setHeadDirection(newDirection);
        setEyeStatus(newEyeStatus);

        // ── Canvas drawing ───────────────────────────────────────────────
        if (canvas && video.clientWidth > 0 && video.clientHeight > 0) {
          const displaySize = { width: video.clientWidth, height: video.clientHeight };
          faceapi.matchDimensions(canvas, displaySize);
          const resized = faceapi.resizeResults(detections, displaySize);
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const boxColor = count === 1 ? "#22c55e" : "#ef4444";

            resized.forEach((d, idx) => {
              // Bounding box (Phase 2)
              const { x, y, width, height } = d.detection.box;
              ctx.strokeStyle = boxColor; ctx.lineWidth = 3;
              ctx.strokeRect(x, y, width, height);

              if (count === 1 && video.videoWidth > 0 && video.videoHeight > 0) {
                const scaleX = displaySize.width  / video.videoWidth;
                const scaleY = displaySize.height / video.videoHeight;

                // Nose direction line (Phase 3)
                drawNoseDirectionLine(ctx, detections[idx].landmarks, newDirection, scaleX, scaleY);

                // Eye landmark dots (Phase 4)
                drawEyeLandmarks(ctx, detections[idx].landmarks, newEyeStatus, scaleX, scaleY);
              }
            });
          }
        }
      } catch (err) {
        console.error("[FaceDetection] detect() error:", err);
      }
    };

    console.log("[FaceDetection] Detection interval started");
    const id = setInterval(detect, DETECTION_INTERVAL_MS);
    return () => { clearInterval(id); stoppedRef.current = true; };
  }, []); // empty deps — reads all live values via refs

  // ─── Status display configs ──────────────────────────────────────────────
  const faceStatusConfig: Record<FaceStatus, { label: string; dot: string; textColor: string }> = {
    loading:       { label: "Loading AI models...",    dot: "bg-yellow-400", textColor: "text-yellow-700" },
    detecting:     { label: "Detecting...",            dot: "bg-yellow-400", textColor: "text-yellow-700" },
    face:          { label: "Face Detected",           dot: "bg-green-500",  textColor: "text-green-700"  },
    no_face:       { label: "No Face Detected",        dot: "bg-red-500",    textColor: "text-red-700"    },
    multiple_face: { label: "Multiple Faces Detected", dot: "bg-red-500",    textColor: "text-red-700"    },
    camera_error:  { label: "Camera Unavailable",      dot: "bg-red-500",    textColor: "text-red-700"    },
  };

  const headStatusConfig: Record<HeadDirection, { label: string; dot: string; textColor: string }> = {
    forward: { label: "Looking Forward", dot: "bg-green-500",  textColor: "text-green-700"  },
    left:    { label: "Looking Left",    dot: "bg-yellow-400", textColor: "text-yellow-700" },
    right:   { label: "Looking Right",   dot: "bg-yellow-400", textColor: "text-yellow-700" },
    up:      { label: "Looking Up",      dot: "bg-yellow-400", textColor: "text-yellow-700" },
    down:    { label: "Looking Down",    dot: "bg-yellow-400", textColor: "text-yellow-700" },
    away:    { label: "Looking Away",    dot: "bg-red-500",    textColor: "text-red-700"    },
    unknown: { label: "Detecting...",    dot: "bg-yellow-400", textColor: "text-yellow-700" },
  };

  const eyeStatusConfig: Record<EyeStatus, { label: string; dot: string; textColor: string }> = {
    screen:  { label: "Looking at Screen", dot: "bg-green-500",  textColor: "text-green-700"  },
    away:    { label: "Looking Away",      dot: "bg-yellow-400", textColor: "text-yellow-700" },
    closed:  { label: "Eyes Closed",       dot: "bg-yellow-400", textColor: "text-yellow-700" },
    missing: { label: "Eyes Missing",      dot: "bg-red-500",    textColor: "text-red-700"    },
    unknown: { label: "Detecting...",      dot: "bg-yellow-400", textColor: "text-yellow-700" },
  };

  const faceCfg = faceStatusConfig[status];
  const headCfg = headStatusConfig[headDirection];
  const eyeCfg  = eyeStatusConfig[eyeStatus];

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div>
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Camera className="w-4 h-4" /> Camera Monitor
      </h3>

      <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden relative mb-3">
        {modelError ? (
          <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
            <div>
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-300 text-xs leading-relaxed">{modelError}</p>
            </div>
          </div>
        ) : status === "camera_error" ? (
          <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
            <div>
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-300 text-xs leading-relaxed">
                {cameraErrMsg || "Camera is unavailable."}
              </p>
            </div>
          </div>
        ) : (
          <>
            <video ref={videoRef} autoPlay muted playsInline
              className="w-full h-full object-cover" />
            <canvas ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none" />
            {status === "loading" && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-spin" />
                  <p className="text-slate-300 text-xs">Loading AI models...</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Live Status Panel — three rows stacked */}
      <div className="space-y-1.5">
        {/* Row 1 — Face detection (Phase 2) */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${faceCfg.dot}`} />
          <span className={`text-sm font-medium ${faceCfg.textColor}`}>{faceCfg.label}</span>
        </div>

        {/* Rows 2 + 3 — only visible when exactly one face is detected */}
        {status === "face" && (
          <>
            {/* Row 2 — Head pose (Phase 3) */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${headCfg.dot}`} />
              <span className={`text-sm font-medium ${headCfg.textColor}`}>{headCfg.label}</span>
            </div>

            {/* Row 3 — Eye tracking (Phase 4) */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${eyeCfg.dot}`} />
              <span className={`text-sm font-medium ${eyeCfg.textColor}`}>{eyeCfg.label}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
