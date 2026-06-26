import {
  ArrowLeft,
  AlertTriangle,
  Camera,
  Wifi,
  Monitor,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useState } from "react";

interface ExamInstructionsProps {
  examId: string | null;
  onProceed: () => void;
  onBack: () => void;
}

export function ExamInstructions({
  onProceed,
  onBack,
}: ExamInstructionsProps) {
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [agreeToProctoring, setAgreeToProctoring] = useState(false);

  const systemChecks = [
    { name: "Browser Compatibility", status: "pass", icon: Monitor },
    { name: "Internet Connection", status: "pass", icon: Wifi },
    { name: "Camera Access", status: "pending", icon: Camera },
  ];

  const canProceed = agreeToTerms && agreeToProctoring;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Data Structures & Algorithms – Midterm
          </h1>
          <p className="text-slate-600">
            CS301 • Duration: 90 minutes • 50 Questions
          </p>
        </div>

        {/* Alert */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">
              AI Proctoring Enabled
            </h3>
            <p className="text-sm text-red-800">
              Webcam, microphone, and screen activity will be monitored
              throughout the exam.
            </p>
          </div>
        </div>

        {/* System Check */}
        <div className="bg-white border rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            System Requirements Check
          </h2>
          <div className="space-y-3">
            {systemChecks.map((check) => (
              <div
                key={check.name}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <check.icon className="w-5 h-5 text-slate-400" />
                  <span className="font-medium">{check.name}</span>
                </div>

                {check.status === "pass" ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    Ready
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-orange-600">
                    <XCircle className="w-5 h-5" />
                    Pending
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white border rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Exam Instructions</h2>
          <ul className="space-y-3 text-slate-700">
            {[
              "Complete the exam in one sitting.",
              "Tab switching will trigger warnings.",
              "Face must be visible at all times.",
              "No external materials allowed.",
              "Exam auto-submits on time expiry.",
              "Multiple violations may terminate the exam.",
            ].map((rule, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full text-sm">
                  {i + 1}
                </span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Consent */}
        <div className="bg-white border rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Acknowledgment & Consent
          </h2>

          <label className="flex gap-3 mb-4">
            <input
              type="checkbox"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="w-5 h-5"
            />
            <span>
              I have read and understood all exam instructions.
            </span>
          </label>

          <label className="flex gap-3">
            <input
              type="checkbox"
              checked={agreeToProctoring}
              onChange={(e) => setAgreeToProctoring(e.target.checked)}
              className="w-5 h-5"
            />
            <span>
              I consent to AI proctoring during the exam.
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="px-6 py-3 text-slate-600"
          >
            Cancel
          </button>
          <button
            onClick={onProceed}
            disabled={!canProceed}
            className={`px-8 py-3 rounded-lg font-medium ${
              canProceed
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            Proceed to Setup
          </button>
        </div>
      </div>
    </div>
  );
}
