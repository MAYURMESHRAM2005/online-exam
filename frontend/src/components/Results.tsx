import { useEffect, useState } from 'react';
import { ArrowLeft, Trophy, Clock, Target, TrendingUp, CheckCircle, XCircle, MinusCircle, Loader2, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ResultsProps {
  resultId: string | null;
  onBack: () => void;
}

interface QuestionResult {
  questionId: string;
  questionText: string;
  type: string;
  options?: string[];
  yourAnswer: string;
  correctAnswer?: string;
  isCorrect: boolean;
  marksAwarded: number;
  marks: number;
}

interface ResultDetails {
  resultId: string;
  examTitle: string;
  courseCode: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  passed: boolean;
  correctCount: number;
  wrongCount: number;
  unattemptedCount: number;
  submittedAt: string;
  timeTakenSeconds: number;
  examDurationSeconds: number;
  questionResults: QuestionResult[];
}

const COLORS = ['#10b981', '#ef4444', '#94a3b8']; // correct, wrong, unattempted

const formatMinutes = (seconds: number) => {
  const m = Math.round(seconds / 60);
  return `${m} min`;
};

export function Results({ resultId, onBack }: ResultsProps) {
  const [result, setResult] = useState<ResultDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      if (!resultId) {
        setError('No result selected. Open this from your dashboard after completing an exam.');
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/results/${resultId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Failed to load results');
        }

        setResult(data);
      } catch (err: any) {
        setError(err.message || 'Something went wrong while loading your results.');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [resultId]);

  const totalQuestions = result
    ? result.correctCount + result.wrongCount + result.unattemptedCount
    : 0;

  const scoreBreakdownData = result
    ? [
        { name: 'Correct', value: result.correctCount },
        { name: 'Wrong', value: result.wrongCount },
        { name: 'Unattempted', value: result.unattemptedCount },
      ]
    : [];

  const marksData = result
    ? [
        { name: 'Marks Obtained', value: result.obtainedMarks },
        { name: 'Marks Lost', value: result.totalMarks - result.obtainedMarks },
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="flex items-center justify-center gap-2 text-slate-500 py-24">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading your results...</span>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-6">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">Unable to load results</h3>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && result && (
          <>
            {/* Title */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Exam Results</h1>
              <p className="text-slate-600">
                {result.examTitle} - {result.courseCode} • Completed on{' '}
                {new Date(result.submittedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>

            {/* Score Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              <div
                className={`lg:col-span-1 rounded-xl p-6 text-white shadow-lg ${
                  result.passed
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                    : 'bg-gradient-to-br from-red-500 to-rose-600'
                }`}
              >
                <div className="flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 rounded-lg mb-4">
                  <Trophy className="w-7 h-7" />
                </div>
                <p className="text-white/80 text-sm mb-1">Overall Score</p>
                <p className="text-5xl font-bold mb-1">{result.percentage}%</p>
                <p className="text-white/80 text-sm">
                  {result.obtainedMarks} / {result.totalMarks} marks
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Accuracy</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {result.correctCount}/{totalQuestions}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-500">Questions answered correctly</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Time Taken</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {formatMinutes(result.timeTakenSeconds)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Out of {formatMinutes(result.examDurationSeconds)}
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      result.passed ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    <TrendingUp
                      className={`w-5 h-5 ${result.passed ? 'text-green-600' : 'text-red-600'}`}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Status</p>
                    <p
                      className={`text-2xl font-bold ${
                        result.passed ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {result.passed ? 'Passed' : 'Failed'}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-500">Final outcome</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Marks Breakdown */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-slate-900">Marks Breakdown</h2>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={marksData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Answer Breakdown */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-slate-900">Answer Breakdown</h2>
                </div>
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={scoreBreakdownData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {scoreBreakdownData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-6 mt-4">
                  {scoreBreakdownData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index] }}
                      ></div>
                      <span className="text-sm text-slate-600">
                        {item.name}: {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Detailed Question Analysis */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Question-by-Question Analysis</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {result.questionResults.map((q, idx) => {
                    const isUnattempted = !q.yourAnswer;
                    const cardStyle = isUnattempted
                      ? 'border-slate-200 bg-slate-50'
                      : q.isCorrect
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50';

                    return (
                      <div key={q.questionId} className={`border-2 rounded-lg p-5 ${cardStyle}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="px-2 py-1 bg-white rounded text-xs font-medium text-slate-700">
                                Q{idx + 1}
                              </span>
                              {isUnattempted ? (
                                <div className="flex items-center gap-1 text-slate-500">
                                  <MinusCircle className="w-4 h-4" />
                                  <span className="text-sm font-medium">Not Answered</span>
                                </div>
                              ) : q.isCorrect ? (
                                <div className="flex items-center gap-1 text-green-700">
                                  <CheckCircle className="w-4 h-4" />
                                  <span className="text-sm font-medium">Correct</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-red-700">
                                  <XCircle className="w-4 h-4" />
                                  <span className="text-sm font-medium">Incorrect</span>
                                </div>
                              )}
                            </div>
                            <p className="text-slate-900 font-medium mb-2">{q.questionText}</p>
                            <div className="space-y-1">
                              <p className="text-sm">
                                <span className="text-slate-600">Your answer:</span>{' '}
                                <span
                                  className={
                                    isUnattempted
                                      ? 'text-slate-500 italic'
                                      : q.isCorrect
                                      ? 'text-green-700 font-medium'
                                      : 'text-red-700 font-medium'
                                  }
                                >
                                  {q.yourAnswer || 'No answer given'}
                                </span>
                              </p>
                              {!q.isCorrect && q.correctAnswer && (
                                <p className="text-sm">
                                  <span className="text-slate-600">Correct answer:</span>{' '}
                                  <span className="text-green-700 font-medium">{q.correctAnswer}</span>
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <span className="text-sm font-medium text-slate-700">
                              {q.marksAwarded}/{q.marks} marks
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Performance Feedback */}
            <div className="mt-8 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Performance Summary</h3>
              <div className="space-y-3 text-slate-700">
                <p className="flex items-start gap-2">
                  <span className={result.passed ? 'text-green-600 mt-0.5' : 'text-red-600 mt-0.5'}>
                    {result.passed ? '✓' : '✗'}
                  </span>
                  <span>
                    You {result.passed ? 'passed' : 'did not pass'} this exam with{' '}
                    {result.percentage}% ({result.obtainedMarks}/{result.totalMarks} marks).
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>
                    You answered {result.correctCount} out of {totalQuestions} questions correctly.
                  </span>
                </p>
                {result.unattemptedCount > 0 && (
                  <p className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">→</span>
                    <span>
                      You left {result.unattemptedCount} question
                      {result.unattemptedCount > 1 ? 's' : ''} unanswered — review the time
                      remaining next time to make sure every question gets attempted.
                    </span>
                  </p>
                )}
                <p className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-0.5">•</span>
                  <span>
                    You used {formatMinutes(result.timeTakenSeconds)} out of the{' '}
                    {formatMinutes(result.examDurationSeconds)} available.
                  </span>
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
