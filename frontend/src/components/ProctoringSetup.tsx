import { ArrowLeft, Camera, Mic, Monitor, CheckCircle2, AlertCircle, Loader2, ShieldAlert } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { setProctorStream, stopProctorStream } from '../lib/proctorStream';

interface ProctoringSetupProps {
  examId: string | null;
  onStartExam: () => void;
  onBack: () => void;
  onSessionStarted?: (sessionId: string) => void;
}

type DeviceStatus = 'checking' | 'ready' | 'denied' | 'unavailable';

export function ProctoringSetup({ examId, onStartExam, onBack, onSessionStarted }: ProctoringSetupProps) {
  const [browserSupported, setBrowserSupported] = useState<boolean | null>(null);
  const [cameraStatus, setCameraStatus] = useState<DeviceStatus>('checking');
  const [micStatus, setMicStatus] = useState<DeviceStatus>('checking');
  const [sessionError, setSessionError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const handedOffRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);

  const token = localStorage.getItem('token');

  // ===== Backend helpers =====
  const startProctorSession = async () => {
    if (!examId) return;
    try {
      const res = await fetch('http://localhost:5000/api/proctor/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          examId,
          browserInfo: navigator.userAgent,
          browserSupported: true,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        sessionIdRef.current = data.sessionId;
        onSessionStarted?.(data.sessionId);
      } else {
        setSessionError(data.message || 'Failed to start proctoring session');
      }
    } catch {
      setSessionError('Network error while starting the proctoring session.');
    }
  };

  const logEvent = async (eventType: string, details?: string) => {
    const sid = sessionIdRef.current;
    if (!sid) return;
    try {
      await fetch(`http://localhost:5000/api/proctor/${sid}/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventType, details }),
      });
    } catch {
      // best-effort logging — never blocks the exam flow
    }
  };

  // ===== Browser compatibility check =====
  useEffect(() => {
    const supported =
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function';

    setBrowserSupported(supported);

    if (!supported) {
      setCameraStatus('unavailable');
      setMicStatus('unavailable');
    }
  }, []);

  // ===== Start proctor session as soon as the screen loads =====
  useEffect(() => {
    if (browserSupported === null) return; // wait for the compatibility check first
    startProctorSession();
    if (!browserSupported) {
      logEvent('browser_unsupported', navigator.userAgent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [browserSupported]);

  // ===== Real camera + microphone permission request =====
  useEffect(() => {
    if (!browserSupported) return;

    let cancelled = false;

    const requestDevices = async () => {
      logEvent('camera_requested');
      logEvent('microphone_requested');

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        // ✅ Store the stream in the shared module immediately on acquisition,
        // not only at click time. This eliminates the React effect ordering
        // race: FaceDetectionMonitor's mount effect reads getProctorStream()
        // and will find a live stream regardless of when React schedules it
        // relative to ProctoringSetup's unmount cleanup.
        setProctorStream(stream);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        const hasVideoTrack = stream.getVideoTracks().length > 0;
        const hasAudioTrack = stream.getAudioTracks().length > 0;

        setCameraStatus(hasVideoTrack ? 'ready' : 'unavailable');
        setMicStatus(hasAudioTrack ? 'ready' : 'unavailable');

        logEvent(hasVideoTrack ? 'camera_granted' : 'device_unavailable', 'camera');
        logEvent(hasAudioTrack ? 'microphone_granted' : 'device_unavailable', 'microphone');
      } catch (err: any) {
        if (cancelled) return;

        // NotFoundError = no camera/mic device exists on this machine.
        // NotAllowedError / PermissionDeniedError = user denied permission.
        if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
          setCameraStatus('unavailable');
          setMicStatus('unavailable');
          logEvent('device_unavailable', err?.message);
        } else {
          setCameraStatus('denied');
          setMicStatus('denied');
          logEvent('camera_denied', err?.message);
          logEvent('microphone_denied', err?.message);
        }
      }
    };

    requestDevices();

    return () => {
      cancelled = true;
      // Only stop the stream here if it was NOT handed off via handleStart
      // (i.e. the student is navigating away without proceeding to the exam).
      // handleStart() calls setProctorStream() synchronously before
      // triggering the screen change, so by the time this cleanup runs we
      // can safely check whether the stream is still "ours" or has moved on.
      if (!handedOffRef.current) {
        streamRef.current?.getTracks().forEach((t) => t.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [browserSupported]);

  // ===== Retry handler for the permission-denied screen =====
  const handleRetry = () => {
    setCameraStatus('checking');
    setMicStatus('checking');
    // Re-running the effect requires a new "tick" — simplest reliable way
    // without restructuring state is to just re-invoke the same logic.
    (async () => {
      logEvent('camera_requested');
      logEvent('microphone_requested');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        setProctorStream(stream); // keep shared module in sync immediately
        if (videoRef.current) videoRef.current.srcObject = stream;
        const hasVideoTrack = stream.getVideoTracks().length > 0;
        const hasAudioTrack = stream.getAudioTracks().length > 0;
        setCameraStatus(hasVideoTrack ? 'ready' : 'unavailable');
        setMicStatus(hasAudioTrack ? 'ready' : 'unavailable');
        logEvent(hasVideoTrack ? 'camera_granted' : 'device_unavailable', 'camera');
        logEvent(hasAudioTrack ? 'microphone_granted' : 'device_unavailable', 'microphone');
      } catch (err: any) {
        if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
          setCameraStatus('unavailable');
          setMicStatus('unavailable');
          logEvent('device_unavailable', err?.message);
        } else {
          setCameraStatus('denied');
          setMicStatus('denied');
          logEvent('camera_denied', err?.message);
          logEvent('microphone_denied', err?.message);
        }
      }
    })();
  };

  const allChecksPass = cameraStatus === 'ready' && micStatus === 'ready' && browserSupported === true;
  const permissionDenied = cameraStatus === 'denied' || micStatus === 'denied';
  const deviceUnavailable = cameraStatus === 'unavailable' || micStatus === 'unavailable';

  const handleStart = () => {
    // ✅ Hand the already-granted camera/mic stream off to Face Detection
    // (Phase 2) instead of stopping it — this is what makes "use the webcam
    // already initialized in Phase 1" actually true.
    handedOffRef.current = true;
    // setProctorStream(streamRef.current);
    if (streamRef.current) {
    setProctorStream(streamRef.current);
} else {
    console.error("MediaStream not initialized.");
    return;
}
    onStartExam();
  };

  const handleBack = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    stopProctorStream();
    if (sessionIdRef.current) {
      fetch(`http://localhost:5000/api/proctor/${sessionIdRef.current}/end`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    onBack();
  };

  // ===== Browser not supported screen =====
  if (browserSupported === false) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border rounded-xl p-8 max-w-md text-center">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Browser Not Supported</h2>
          <p className="text-slate-600 text-sm mb-6">
            Your browser does not support camera/microphone access required for
            AI proctoring. Please use an up-to-date version of Chrome, Firefox,
            or Edge.
          </p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300"
          >
            Back to Instructions
          </button>
        </div>
      </div>
    );
  }

  // ===== Permission denied screen =====
  if (permissionDenied) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border rounded-xl p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Camera/Microphone Access Denied</h2>
          <p className="text-slate-600 text-sm mb-6">
            This exam requires camera and microphone access for AI proctoring.
            Please allow access in your browser settings and try again.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleBack}
              className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300"
            >
              Back
            </button>
            <button
              onClick={handleRetry}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Proctoring Setup
          </h1>
          <p className="text-slate-600">Verify your devices before starting the exam</p>
        </div>

        {sessionError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 mb-6 max-w-3xl mx-auto">
            {sessionError}
          </div>
        )}

        {deviceUnavailable && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 mb-6 max-w-3xl mx-auto">
            One or more required devices (camera/microphone) could not be found
            on this device. Please connect a camera and microphone, then go
            back and try again.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Camera Preview */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">Camera Preview</h2>
            </div>
            <div className="p-6">
              <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden relative mb-4">
                {/* Real live camera feed */}
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`w-full h-full object-cover ${cameraStatus === 'ready' ? 'block' : 'hidden'}`}
                />

                {cameraStatus !== 'ready' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      {cameraStatus === 'checking' ? (
                        <Loader2 className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-spin" />
                      ) : (
                        <Camera className="w-16 h-16 text-slate-600 mx-auto mb-3" />
                      )}
                      <p className="text-slate-400 text-sm">
                        {cameraStatus === 'checking'
                          ? 'Requesting camera access...'
                          : cameraStatus === 'unavailable'
                          ? 'No camera detected'
                          : 'Camera unavailable'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Device summary (face detection not implemented in this phase) */}
              <div className="p-4 rounded-lg flex items-center gap-3 bg-blue-50 border border-blue-200">
                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-900">Foundation Setup</p>
                  <p className="text-sm text-blue-700">
                    Face detection will be enabled in a future update.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* System Checks */}
          <div className="space-y-6">
            {/* Camera Check */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    cameraStatus === 'ready' 
                      ? 'bg-green-100' 
                      : cameraStatus === 'checking'
                      ? 'bg-blue-100'
                      : 'bg-red-100'
                  }`}>
                    <Camera className={`w-6 h-6 ${
                      cameraStatus === 'ready'
                        ? 'text-green-600'
                        : cameraStatus === 'checking'
                        ? 'text-blue-600'
                        : 'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Camera Access</h3>
                    <p className="text-sm text-slate-600">Webcam monitoring</p>
                  </div>
                </div>
                {cameraStatus === 'ready' ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : cameraStatus === 'checking' ? (
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                )}
              </div>
              <p className="text-sm text-slate-600">
                {cameraStatus === 'ready'
                  ? 'Camera is working properly'
                  : cameraStatus === 'checking'
                  ? 'Checking camera access...'
                  : cameraStatus === 'unavailable'
                  ? 'No camera device found'
                  : 'Camera access denied'}
              </p>
            </div>

            {/* Microphone Check */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    micStatus === 'ready' 
                      ? 'bg-green-100' 
                      : micStatus === 'checking'
                      ? 'bg-blue-100'
                      : 'bg-red-100'
                  }`}>
                    <Mic className={`w-6 h-6 ${
                      micStatus === 'ready'
                        ? 'text-green-600'
                        : micStatus === 'checking'
                        ? 'text-blue-600'
                        : 'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Microphone Access</h3>
                    <p className="text-sm text-slate-600">Audio monitoring</p>
                  </div>
                </div>
                {micStatus === 'ready' ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : micStatus === 'checking' ? (
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                )}
              </div>
              <p className="text-sm text-slate-600">
                {micStatus === 'ready'
                  ? 'Microphone is working properly'
                  : micStatus === 'checking'
                  ? 'Checking microphone access...'
                  : micStatus === 'unavailable'
                  ? 'No microphone device found'
                  : 'Microphone access denied'}
              </p>
            </div>

            {/* Screen Recording */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Monitor className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Screen Monitoring</h3>
                    <p className="text-sm text-slate-600">Tab switching detection</p>
                  </div>
                </div>
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm text-slate-600">
                Screen activity will be monitored
              </p>
            </div>

            {/* Important Notes */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Important Reminders
              </h3>
              <ul className="space-y-2 text-sm text-amber-800">
                <li>• Ensure your face is clearly visible</li>
                <li>• Stay in a well-lit environment</li>
                <li>• Remove any background noise</li>
                <li>• Do not leave the exam screen</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handleBack}
            className="px-6 py-3 text-slate-600 hover:text-slate-900 font-medium"
          >
            Back to Instructions
          </button>
          <button
            onClick={handleStart}
            disabled={!allChecksPass}
            className={`px-8 py-3 rounded-lg font-medium transition-all ${
              allChecksPass
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {allChecksPass ? 'Start Exam Now' : 'Completing Checks...'}
          </button>
        </div>
      </div>
    </div>
  );
}
