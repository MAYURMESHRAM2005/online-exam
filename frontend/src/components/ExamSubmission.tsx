import { CheckCircle, Clock, FileText, AlertCircle } from "lucide-react";

interface ExamSubmissionProps {
  onBackToDashboard: () => void;
}

export function ExamSubmission({ onBackToDashboard }: ExamSubmissionProps) {
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
            {/* Submission Details */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-slate-600" />
                  <span className="font-medium text-slate-900">Exam Name</span>
                </div>
                <span className="text-slate-700">
                  Data Structures & Algorithms
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-slate-600" />
                  <span className="font-medium text-slate-900">Time Taken</span>
                </div>
                <span className="text-slate-700">1 hour 23 minutes</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-slate-600" />
                  <span className="font-medium text-slate-900">
                    Questions Answered
                  </span>
                </div>
                <span className="text-slate-700">48 / 50</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-slate-600" />
                  <span className="font-medium text-slate-900">
                    Proctoring Warnings
                  </span>
                </div>
                <span className="text-green-600 font-medium">
                  0 violations
                </span>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-8">
              <h3 className="font-semibold text-blue-900 mb-2">
                What happens next?
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Instructor will review answers and proctoring footage</li>
                <li>• Results will be published in 3–5 business days</li>
                <li>• You’ll get an email when results are available</li>
                <li>• Check dashboard for detailed score breakdown</li>
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
              <button className="px-6 py-3 border border-slate-300 rounded-lg font-medium hover:bg-slate-50">
                Download Receipt
              </button>
            </div>
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
