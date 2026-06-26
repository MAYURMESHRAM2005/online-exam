import { ArrowLeft, Trophy, Clock, Target, TrendingUp, Download, CheckCircle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ResultsProps {
  onBack: () => void;
}

const scoreData = [
  { section: 'MCQ', score: 85 },
  { section: 'Theory', score: 90 },
  { section: 'Coding', score: 78 }
];

const timeData = [
  { name: 'Fast', value: 12 },
  { name: 'Optimal', value: 28 },
  { name: 'Slow', value: 8 }
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b'];

const questionResults = [
  { id: 1, question: 'What is the time complexity of binary search?', yourAnswer: 'O(log n)', correct: true, timeSpent: '45s' },
  { id: 2, question: 'Which data structure uses LIFO principle?', yourAnswer: 'Stack', correct: true, timeSpent: '32s' },
  { id: 3, question: 'Best case time complexity of QuickSort?', yourAnswer: 'O(n)', correct: false, correctAnswer: 'O(n log n)', timeSpent: '1m 12s' },
  { id: 4, question: 'Difference between stack and queue', yourAnswer: 'Descriptive answer...', correct: true, timeSpent: '3m 45s' },
  { id: 5, question: 'Which is NOT a searching algorithm?', yourAnswer: 'Merge Sort', correct: true, timeSpent: '28s' }
];

export function Results({ onBack }: ResultsProps) {
  const totalScore = 87;
  const correctAnswers = questionResults.filter(q => q.correct).length;
  const totalQuestions = questionResults.length;

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
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Exam Results</h1>
          <p className="text-slate-600">Data Structures & Algorithms - CS301 • Completed on Feb 1, 2026</p>
        </div>

        {/* Score Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 rounded-lg mb-4">
              <Trophy className="w-7 h-7" />
            </div>
            <p className="text-green-100 text-sm mb-1">Overall Score</p>
            <p className="text-5xl font-bold mb-1">{totalScore}%</p>
            <p className="text-green-100 text-sm">Great performance!</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Accuracy</p>
                <p className="text-2xl font-bold text-slate-900">
                  {correctAnswers}/{totalQuestions}
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
                <p className="text-2xl font-bold text-slate-900">83 min</p>
              </div>
            </div>
            <p className="text-xs text-slate-500">Out of 90 minutes</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Percentile</p>
                <p className="text-2xl font-bold text-slate-900">92nd</p>
              </div>
            </div>
            <p className="text-xs text-slate-500">Among all test takers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Section-wise Performance */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Section-wise Performance</h2>
              <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                View Details
              </button>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="section" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="score" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Time Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Time per Question</h2>
            </div>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={timeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {timeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              {timeData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index] }}
                  ></div>
                  <span className="text-sm text-slate-600">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Question Analysis */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Question-by-Question Analysis</h2>
            <button className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Download Report</span>
            </button>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {questionResults.map((result) => (
                <div
                  key={result.id}
                  className={`border-2 rounded-lg p-5 ${
                    result.correct 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-1 bg-white rounded text-xs font-medium text-slate-700">
                          Q{result.id}
                        </span>
                        {result.correct ? (
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
                      <p className="text-slate-900 font-medium mb-2">{result.question}</p>
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="text-slate-600">Your answer:</span>{' '}
                          <span className={result.correct ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                            {result.yourAnswer}
                          </span>
                        </p>
                        {!result.correct && result.correctAnswer && (
                          <p className="text-sm">
                            <span className="text-slate-600">Correct answer:</span>{' '}
                            <span className="text-green-700 font-medium">{result.correctAnswer}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{result.timeSpent}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Feedback */}
        <div className="mt-8 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Performance Feedback</h3>
          <div className="space-y-3 text-slate-700">
            <p className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Strong performance in theoretical concepts and MCQ sections</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Excellent time management - completed exam with time to spare</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-amber-600 mt-0.5">→</span>
              <span>Focus on time complexity analysis for coding problems</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-amber-600 mt-0.5">→</span>
              <span>Review sorting algorithms and their variations</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
