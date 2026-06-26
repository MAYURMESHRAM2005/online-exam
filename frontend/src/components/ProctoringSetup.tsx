import { ArrowLeft, Camera, Mic, Monitor, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ProctoringSetupProps {
  onStartExam: () => void;
  onBack: () => void;
}

export function ProctoringSetup({ onStartExam, onBack }: ProctoringSetupProps) {
  const [cameraStatus, setCameraStatus] = useState<'checking' | 'ready' | 'failed'>('checking');
  const [micStatus, setMicStatus] = useState<'checking' | 'ready' | 'failed'>('checking');
  const [faceDetected, setFaceDetected] = useState<'checking' | 'detected' | 'not-detected'>('checking');

  useEffect(() => {
    // Simulate camera check
    setTimeout(() => setCameraStatus('ready'), 1500);
    setTimeout(() => setMicStatus('ready'), 2000);
    setTimeout(() => setFaceDetected('detected'), 2500);
  }, []);

  const allChecksPass = cameraStatus === 'ready' && micStatus === 'ready' && faceDetected === 'detected';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={onBack}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Camera Preview */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">Camera Preview</h2>
            </div>
            <div className="p-6">
              <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden relative mb-4">
                {/* Simulated camera view */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-16 h-16 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">Camera feed active</p>
                  </div>
                </div>
                
                {/* Face detection overlay */}
                {faceDetected === 'detected' && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-48 h-64 border-2 border-green-400 rounded-lg"></div>
                  </div>
                )}
              </div>

              {/* Face Detection Status */}
              <div className={`p-4 rounded-lg flex items-center gap-3 ${
                faceDetected === 'detected' 
                  ? 'bg-green-50 border border-green-200' 
                  : faceDetected === 'checking'
                  ? 'bg-blue-50 border border-blue-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                {faceDetected === 'detected' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-900">Face Detected</p>
                      <p className="text-sm text-green-700">Position looks good</p>
                    </div>
                  </>
                ) : faceDetected === 'checking' ? (
                  <>
                    <Loader2 className="w-5 h-5 text-blue-600 flex-shrink-0 animate-spin" />
                    <div>
                      <p className="font-medium text-blue-900">Detecting Face...</p>
                      <p className="text-sm text-blue-700">Please look at the camera</p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-900">Face Not Detected</p>
                      <p className="text-sm text-red-700">Please adjust your position</p>
                    </div>
                  </>
                )}
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
                  : 'Please allow camera access'}
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
                  : 'Please allow microphone access'}
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
            onClick={onBack}
            className="px-6 py-3 text-slate-600 hover:text-slate-900 font-medium"
          >
            Back to Instructions
          </button>
          <button
            onClick={onStartExam}
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
