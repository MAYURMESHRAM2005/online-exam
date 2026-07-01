import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { Camera, Loader2, AlertCircle } from "lucide-react";
import { getProctorStream } from "../lib/proctorStream";

interface FaceDetectionMonitorProps {
  sessionId: string | null;
}

type FaceStatus = "loading" | "detecting" | "face" | "no_face" | "multiple_face" | "camera_error";

const DETECTION_INTERVAL_MS = 500;
const VIOLATION_COOLDOWN_MS = 5000; // log the same ongoing violation at most once every 5s
const MODEL_URL = "/models";

// Models are loaded once and shared across every mount of this component
// (e.g. if it were ever remounted), rather than reloading on each render.
let modelsLoadPromise: Promise<void> | null = null;

function loadModelsOnce(): Promise<void> {
  if (!modelsLoadPromise) {
    modelsLoadPromise = Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    ]).then(() => undefined);
  }
  return modelsLoadPromise;
}

export function FaceDetectionMonitor({ sessionId }: FaceDetectionMonitorProps) {
  const [status, setStatus] = useState<FaceStatus>("loading");
  const [modelError, setModelError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastViolationRef = useRef<{ type: string; loggedAt: number } | null>(null);
  const stoppedRef = useRef(false);

  const token = localStorage.getItem("token");

  const logViolation = async (eventType: "NO_FACE" | "MULTIPLE_FACE") => {
    if (!sessionId) return;

    const now = Date.now();
    const last = lastViolationRef.current;

    // Debounce: only log once every 5s while the SAME violation continues.
    // A different violation type always logs immediately (state change).
    if (last && last.type === eventType && now - last.loggedAt < VIOLATION_COOLDOWN_MS) {
      return;
    }

    lastViolationRef.current = { type: eventType, loggedAt: now };

    try {
      await fetch(`http://localhost:5000/api/proctor/${sessionId}/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventType }),
      });
    } catch {
      // Best-effort — never blocks the exam UI on a logging failure.
    }
  };

  // ===== Load models once on mount =====
  useEffect(() => {
    let cancelled = false;

    loadModelsOnce()
      .then(() => {
        if (!cancelled) setStatus("detecting");
      })
      .catch((err) => {
        if (!cancelled) {
          setModelError(
            "Failed to load AI proctoring models. Please refresh the page or check your connection."
          );
          console.error("Face detection model load failed:", err);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ===== Attach the inherited webcam stream (from Phase 1) =====
  useEffect(() => {
    const stream = getProctorStream();

    if (!stream || stream.getVideoTracks().length === 0) {
      setStatus("camera_error");
      return;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }

    // If the underlying camera track ends unexpectedly (device unplugged,
    // OS-level revoke, etc.), stop detection gracefully instead of erroring.
    const [track] = stream.getVideoTracks();
    const handleTrackEnded = () => {
      stoppedRef.current = true;
      setStatus("camera_error");
    };
    track.addEventListener("ended", handleTrackEnded);

    return () => {
      track.removeEventListener("ended", handleTrackEnded);
    };
  }, []);

  // ===== Run detection every 500ms once models are ready =====
  useEffect(() => {
    if (status === "loading" || status === "camera_error" || modelError) return;

    const detect = async () => {
      if (stoppedRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || video.readyState < 2) return; // not enough data yet

      try {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks();

        if (stoppedRef.current) return;

        const count = detections.length;
        let newStatus: FaceStatus;

        if (count === 0) {
          newStatus = "no_face";
          logViolation("NO_FACE");
        } else if (count > 1) {
          newStatus = "multiple_face";
          logViolation("MULTIPLE_FACE");
        } else {
          newStatus = "face";
        }

        setStatus(newStatus);

        // ===== Draw bounding box overlay =====
        if (canvas) {
          const displaySize = { width: video.clientWidth, height: video.clientHeight };
          faceapi.matchDimensions(canvas, displaySize);
          const resized = faceapi.resizeResults(detections, displaySize);

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const boxColor = count === 1 ? "#22c55e" : "#ef4444"; // green if exactly one face, red otherwise

            resized.forEach((d) => {
              const { x, y, width, height } = d.detection.box;
              ctx.strokeStyle = boxColor;
              ctx.lineWidth = 3;
              ctx.strokeRect(x, y, width, height);
            });
          }
        }
      } catch (err) {
        // A transient detection error shouldn't crash the exam — log once
        // to the console and keep trying on the next tick.
        console.error("Face detection error:", err);
      }
    };

    intervalRef.current = setInterval(detect, DETECTION_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status === "loading", modelError]);

  // ===== Stop everything cleanly on unmount (exam ends / user leaves) =====
  useEffect(() => {
    return () => {
      stoppedRef.current = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const statusConfig: Record<
    FaceStatus,
    { label: string; dot: string; textColor: string }
  > = {
    loading: { label: "Loading AI models...", dot: "bg-yellow-400", textColor: "text-yellow-700" },
    detecting: { label: "Detecting...", dot: "bg-yellow-400", textColor: "text-yellow-700" },
    face: { label: "Face Detected", dot: "bg-green-500", textColor: "text-green-700" },
    no_face: { label: "No Face Detected", dot: "bg-red-500", textColor: "text-red-700" },
    multiple_face: { label: "Multiple Faces Detected", dot: "bg-red-500", textColor: "text-red-700" },
    camera_error: { label: "Camera Unavailable", dot: "bg-red-500", textColor: "text-red-700" },
  };

  const current = statusConfig[status];

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
              <p className="text-red-300 text-xs">{modelError}</p>
            </div>
          </div>
        ) : status === "camera_error" ? (
          <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
            <div>
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-300 text-xs">
                Camera is unavailable. Proctoring cannot continue without it.
              </p>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
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

      {/* Live Status Panel */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
        <span className={`w-2.5 h-2.5 rounded-full ${current.dot}`} />
        <span className={`text-sm font-medium ${current.textColor}`}>{current.label}</span>
      </div>
    </div>
  );
}
