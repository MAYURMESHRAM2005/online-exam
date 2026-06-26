import { useState, useEffect } from "react";
import {
  Clock,
  Camera,
  AlertTriangle,
  Wifi,
  Check,
  ChevronLeft,
  ChevronRight,
  Flag,
} from "lucide-react";

interface LiveExamProps {
  examId: string | null;
  onSubmit: () => void;
}

const questions = [
  {
    id: 1,
    type: "mcq",
    question: "What is the time complexity of binary search in a sorted array?",
    options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
  },
  {
    id: 2,
    type: "mcq",
    question: "Which data structure uses LIFO (Last In First Out) principle?",
    options: ["Queue", "Stack", "Tree", "Graph"],
  },
  {
    id: 3,
    type: "mcq",
    question: "What is the best case time complexity of QuickSort?",
    options: ["O(n²)", "O(n log n)", "O(n)", "O(log n)"],
  },
  {
    id: 4,
    type: "text",
    question:
      "Explain the difference between a stack and a queue with examples.",
  },
  {
    id: 5,
    type: "mcq",
    question: "Which of the following is NOT a searching algorithm?",
    options: ["Linear Search", "Binary Search", "Merge Sort", "Jump Search"],
  },
];

export function LiveExam({ onSubmit }: LiveExamProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(90 * 60);
  const [warnings] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onSubmit]);

  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      setAutoSaved(true);
      const t = setTimeout(() => setAutoSaved(false), 1500);
      return () => clearTimeout(t);
    }
  }, [answers]);

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const question = questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div>
            <h1 className="font-semibold">Data Structures & Algorithms</h1>
            <p className="text-xs text-slate-600">CS301 – Midterm Exam</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-green-600">
              <Wifi className="w-4 h-4" />
              Connected
            </div>

            {autoSaved && (
              <div className="flex items-center gap-1 text-green-600">
                <Check className="w-4 h-4" /> Saved
              </div>
            )}

            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                timeLeft < 600
                  ? "bg-red-100 text-red-700"
                  : "bg-slate-100"
              }`}
            >
              <Clock className="w-5 h-5" />
              <span className="font-semibold">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Main */}
        <div className="flex-1 p-8">
          {warnings > 0 && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 text-sm">
                Warning {warnings}/3 – suspicious activity detected
              </p>
            </div>
          )}

          <div className="bg-white border rounded-xl p-8 mb-6">
            <div className="flex justify-between mb-4">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                Question {currentQuestion + 1} / {questions.length}
              </span>
              {answers[question.id] && (
                <span className="text-green-600 flex gap-1 items-center">
                  <Check className="w-4 h-4" /> Answered
                </span>
              )}
            </div>

            <h2 className="text-xl mb-6">{question.question}</h2>

            {question.type === "mcq" ? (
              <div className="space-y-3">
                {question.options?.map((opt) => (
                  <label
                    key={opt}
                    className={`flex gap-3 p-4 border rounded-lg cursor-pointer ${
                      answers[question.id] === opt
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-slate-200"
                    }`}
                  >
                    <input
                      type="radio"
                      checked={answers[question.id] === opt}
                      onChange={() =>
                        setAnswers({ ...answers, [question.id]: opt })
                      }
                    />
                    {opt}
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                value={answers[question.id] || ""}
                onChange={(e) =>
                  setAnswers({ ...answers, [question.id]: e.target.value })
                }
                className="w-full h-40 border rounded-lg p-4"
                placeholder="Type your answer…"
              />
            )}
          </div>

          <div className="flex justify-between">
            <button
              disabled={currentQuestion === 0}
              onClick={() => setCurrentQuestion((q) => q - 1)}
              className="flex items-center gap-2 text-slate-600 disabled:opacity-40"
            >
              <ChevronLeft /> Previous
            </button>

            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
              >
                Submit Exam <Flag />
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestion((q) => q + 1)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
              >
                Next <ChevronRight />
              </button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white border-l p-6">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Camera className="w-4 h-4" /> Camera Monitor
          </h3>
          <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center mb-6">
            <Camera className="w-10 h-10 text-slate-600" />
          </div>

          <p className="text-sm mb-2">
            Progress: {answeredCount}/{questions.length}
          </p>
          <div className="w-full bg-slate-200 h-2 rounded-full mb-4">
            <div
              className="bg-indigo-600 h-2 rounded-full"
              style={{
                width: `${(answeredCount / questions.length) * 100}%`,
              }}
            />
          </div>

          <div className="grid grid-cols-5 gap-2">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQuestion(i)}
                className={`p-2 rounded ${
                  i === currentQuestion
                    ? "bg-indigo-600 text-white"
                    : answers[questions[i].id]
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg flex items-center justify-center gap-2"
          >
            <Flag /> Submit Exam
          </button>
        </div>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-2">Submit Exam?</h3>
            <p className="text-slate-600 mb-4">
              Answered {answeredCount} / {questions.length} questions
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 border py-2 rounded-lg"
              >
                Review
              </button>
              <button
                onClick={onSubmit}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
