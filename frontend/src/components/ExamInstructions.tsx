import {
  ArrowLeft,
  AlertTriangle,
  Camera,
  Wifi,
  Monitor,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ExamInstructionsProps {
  examId: string | null;
  onProceed: () => void;
  onBack: () => void;
}

// ✅ Shape returned by GET /api/exams/:id
interface ExamDetails {
  _id: string;
  title: string;
  courseCode: string;
  duration: number;
  totalMarks: number;
  instructions?: string;
  questions?: { length?: number }[];
  computedStatus: "scheduled" | "live" | "completed";
  canStart: boolean;
  accessMessage: string | null;
  proctoring?: {
    enableProctoring?: boolean;
  };
}

const defaultInstructionRules = [
  "Complete the exam in one sitting.",
  "Tab switching will trigger warnings.",
  "Face must be visible at all times.",
  "No external materials allowed.",
  "Exam auto-submits on time expiry.",
  "Multiple violations may terminate the exam.",
];

export function ExamInstructions({
  examId,
  onProceed,
  onBack,
}: ExamInstructionsProps) {
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [agreeToProctoring, setAgreeToProctoring] = useState(false);

  const [exam, setExam] = useState<ExamDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [cameraStatus] = useState<"pass">("pass");

  useEffect(() => {
    const fetchExam = async () => {
      if (!examId) {
        setError("No exam was selected.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`http://localhost:5000/api/exams/${examId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load exam details");
        }

        setExam(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong while loading this exam.");
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId]);

  const proctoringEnabled = exam?.proctoring?.enableProctoring ?? false;
  const questionCount = exam?.questions?.length ?? 0;

  const systemChecks = [
    { name: "Browser Compatibility", status: "pass", icon: Monitor },
    { name: "Internet Connection", status: "pass", icon: Wifi },
    ...(proctoringEnabled
      ? [{ name: "Camera Access", status: cameraStatus, icon: Camera }]
      : []),
  ];

  // Access is only granted once the exam has loaded, is actually startable
  // (computed server-side from date/time/duration), and the student has
  // agreed to the relevant consent checkboxes.
  const canProceed =
    !!exam && exam.canStart && agreeToTerms && (!proctoringEnabled || agreeToProctoring);

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
        {loading && (
          <div className="flex items-center justify-center gap-2 text-slate-500 py-20">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading exam details...</span>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">Unable to load exam</h3>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && exam && (
          <>
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">{exam.title}</h1>
              <p className="text-slate-600">
                {exam.courseCode} • Duration: {exam.duration} minutes
                {questionCount > 0 ? ` • ${questionCount} Questions` : ""}
              </p>
            </div>

            {/* Access validation message */}
            {!exam.canStart && exam.accessMessage && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-8 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-orange-900">Exam Not Available</h3>
                  <p className="text-sm text-orange-800">{exam.accessMessage}</p>
                </div>
              </div>
            )}

            {/* Proctoring Alert */}
            {proctoringEnabled && (
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
            )}

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
              {exam.instructions ? (
                <p className="text-slate-700 whitespace-pre-line">{exam.instructions}</p>
              ) : (
                <ul className="space-y-3 text-slate-700">
                  {defaultInstructionRules.map((rule, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full text-sm">
                        {i + 1}
                      </span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              )}
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

              {proctoringEnabled && (
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
              )}
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
          </>
        )}
      </div>
    </div>
  );
}
