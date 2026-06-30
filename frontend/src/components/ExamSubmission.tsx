import { useEffect, useState } from "react";
import { CheckCircle, Clock, FileText, AlertCircle, Loader2, Award } from "lucide-react";

interface ExamSubmissionProps {
  resultId: string | null;
  onBackToDashboard: () => void;
  onViewResults: () => void;
}

interface SubmissionSummary {
  examTitle: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  passed: boolean;
  correctCount: number;
  wrongCount: number;
  unattemptedCount: number;
  submittedAt: string;
  timeTakenSeconds: number;
}

const formatDuration = (totalSeconds: number) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h} hour${h > 1 ? "s" : ""} ${m} minute${m !== 1 ? "s" : ""}`;
  return `${m} minute${m !== 1 ? "s" : ""}`;
};

export function ExamSubmission({ resultId, onBackToDashboard, onViewResults }: ExamSubmissionProps) {
  const [summary, setSummary] = useState<SubmissionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!resultId) {
        setError("No submission found.");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/results/${resultId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load submission details");
        }

        setSummary(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong while loading your submission.");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [resultId]);

  const totalQuestions = summary
    ? summary.correctCount + summary.wrongCount + summary.unattemptedCount
    : 0;
  const answeredCount = summary ? summary.correctCount + summary.wrongCount : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Exam Submitted Successfully!
            </h1>
            <p className="text-green-100">
              Your answers have been recorded and saved
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {loading && (
              <div className="flex items-center justify-center gap-2 text-slate-500 py-12">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading your submission details...</span>
              </div>
            )}

            {!loading && error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 mb-8">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!loading && !error && summary && (
              <>
                {/* Submission Details */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-slate-600" />
                      <span className="font-medium text-slate-900">Exam Name</span>
                    </div>
                    <span className="text-slate-700">{summary.examTitle}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-slate-600" />
                      <span className="font-medium text-slate-900">Time Taken</span>
                    </div>
                    <span className="text-slate-700">
                      {formatDuration(summary.timeTakenSeconds)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-slate-600" />
                      <span className="font-medium text-slate-900">
                        Questions Answered
                      </span>
                    </div>
                    <span className="text-slate-700">
                      {answeredCount} / {totalQuestions}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-slate-600" />
                      <span className="font-medium text-slate-900">Score</span>
                    </div>
                    <span
                      className={`font-semibold ${
                        summary.passed ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {summary.obtainedMarks} / {summary.totalMarks} ({summary.percentage}%) —{" "}
                      {summary.passed ? "Passed" : "Failed"}
                    </span>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-8">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    What happens next?
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li>• MCQ questions have been auto-graded and your score is ready now</li>
                    <li>• Any subjective/coding questions will be reviewed by your instructor</li>
                    <li>• You can view your full, question-by-question results below</li>
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button
                    onClick={onBackToDashboard}
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-md hover:shadow-lg"
                  >
                    Back to Dashboard
                  </button>
                  <button
                    onClick={onViewResults}
                    className="px-6 py-3 border border-slate-300 rounded-lg font-medium hover:bg-slate-50"
                  >
                    View Full Results
                  </button>
                </div>
              </>
            )}

            {!loading && error && (
              <div className="flex gap-4">
                <button
                  onClick={onBackToDashboard}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-md hover:shadow-lg"
                >
                  Back to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Support */}
        <div className="text-center mt-6 text-sm text-slate-600">
          Having issues? Contact{" "}
          <span className="text-indigo-600 font-medium">
            support@examsecure.ai
          </span>
        </div>
      </div>
    </div>
  );
}
