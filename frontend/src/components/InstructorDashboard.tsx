import { Bell, Plus, Users, FileText, AlertTriangle, TrendingUp, Eye, Edit, X, Loader2, ArrowUpDown, Trash2, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ProfileDropdown } from "./ProfileDropdown";
import { useEffect, useState } from "react";

interface Exam {
  _id: string;
  title: string;
  courseCode: string;
  duration: number;
  date: string;
  time: string;
  computedStatus?: 'scheduled' | 'live' | 'completed';
  students?: number;
  submitted?: number;
  violations?: number;
  avgScore?: number | null;
}

interface InstructorStats {
  totalExams: number;
  activeStudents: number;
  avgScore: number | null;
  violations: number;
  nextExam: {
    examId: string;
    title: string;
    courseCode: string;
    date: string;
    time: string;
    registeredStudents: number;
  } | null;
}

interface ExamResultRow {
  resultId: string;
  studentName: string;
  studentEmail: string;
  obtainedMarks: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  timeTakenSeconds: number;
  submittedAt: string;
  violations: number;
}

interface InstructorDashboardProps {
  userName: string | null;
  onCreateExam: () => void;
  onEditExam: (examId: string) => void;
  onMonitorExam: (examId: string) => void;
  onLogout: () => void;
}

const formatDate = (date: string) => {
  if (!date) return 'Date TBD';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Date TBD';
  return d.toLocaleDateString("en-GB"); // DD/MM/YYYY
};

const formatDuration = (seconds: number) => {
  const m = Math.round(seconds / 60);
  return `${m} min`;
};

const getTimeLeft = (date: string, time: string) => {
  if (!date || !time) return 'TBD';
  const datePart = date.split('T')[0];
  const examTime = new Date(`${datePart}T${time}`);
  const now = new Date();
  const diff = examTime.getTime() - now.getTime();
  if (isNaN(diff)) return "TBD";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  return `${hours}h ${minutes}m`;
};

export function InstructorDashboard({ userName, onCreateExam, onEditExam, onMonitorExam, onLogout }: InstructorDashboardProps) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [stats, setStats] = useState<InstructorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'scheduled' | 'completed'>('all');

  // View Results modal state
  const [resultsModalExam, setResultsModalExam] = useState<Exam | null>(null);
  const [resultsData, setResultsData] = useState<ExamResultRow[] | null>(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState<string | null>(null);
  const [resultsSort, setResultsSort] = useState<'highest' | 'lowest' | 'latest'>('latest');

  // Delete Exam modal state
  const [deleteTarget, setDeleteTarget] = useState<Exam | null>(null);
  const [deleteStage, setDeleteStage] = useState<1 | 2>(1);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const token = localStorage.getItem("token");

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [examsRes, statsRes] = await Promise.all([
        fetch("http://localhost:5000/api/exams/my-exams", { headers }),
        fetch("http://localhost:5000/api/exams/instructor/stats", { headers }),
      ]);
      const [examsData, statsData] = await Promise.all([examsRes.json(), statsRes.json()]);

      if (!examsRes.ok) throw new Error(examsData.message || "Failed to load exams");
      if (!statsRes.ok) throw new Error(statsData.message || "Failed to load dashboard stats");

      setExams(examsData);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || "Something went wrong while loading your dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredExams = exams.filter((exam) => {
    if (activeTab === "all") return true;
    return exam.computedStatus === activeTab;
  });

  // Performance trend: real average score per exam (only exams with submitted results)
  const performanceData = exams
    .filter((e) => e.avgScore !== null && e.avgScore !== undefined)
    .map((e) => ({ exam: e.title, avg: e.avgScore as number }));

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openDeleteModal = (exam: Exam) => {
    setDeleteTarget(exam);
    setDeleteStage(1);
    setDeleteError(null);
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    setDeleteStage(1);
    setDeleteError(null);
  };

  const handleConfirmDelete = () => {
    // Extra protection: if students have already submitted, require a
    // second, more explicit confirmation before actually deleting.
    if (deleteTarget && (deleteTarget.submitted ?? 0) > 0 && deleteStage === 1) {
      setDeleteStage(2);
      return;
    }
    performDelete();
  };

  const performDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`http://localhost:5000/api/exams/${deleteTarget._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete exam");
      }

      setExams((prev) => prev.filter((e) => e._id !== deleteTarget._id));
      closeDeleteModal();
      showToast("Exam deleted successfully.", "success");
    } catch (err: any) {
      setDeleteError(err.message || "Something went wrong while deleting this exam.");
    } finally {
      setDeleting(false);
    }
  };


  const openResultsModal = async (exam: Exam, sort: 'highest' | 'lowest' | 'latest' = 'latest') => {
    setResultsModalExam(exam);
    setResultsSort(sort);
    setResultsLoading(true);
    setResultsError(null);
    setResultsData(null);
    try {
      const res = await fetch(`http://localhost:5000/api/results/exam/${exam._id}?sort=${sort}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load results");
      setResultsData(data.results);
    } catch (err: any) {
      setResultsError(err.message || "Something went wrong while loading results.");
    } finally {
      setResultsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-semibold text-slate-900">ExamSecure AI</h1>
              <span className="ml-3 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                Instructor
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <ProfileDropdown
                userName={userName}
                onLogout={onLogout}
                onProfile={() => console.log("Go to profile")}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Instructor Dashboard</h2>
            <p className="text-slate-600">Manage exams, monitor students, and analyze performance</p>
          </div>
          <button
            onClick={onCreateExam}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            Create New Exam
          </button>
        </div>

        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 mb-8">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Total Exams</span>
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{loading ? '–' : stats?.totalExams ?? 0}</p>
            <p className="text-xs text-slate-500 mt-1">Created by you</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Active Students</span>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{loading ? '–' : stats?.activeStudents ?? 0}</p>
            <p className="text-xs text-slate-500 mt-1">Started or submitted your exams</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Avg. Score</span>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {loading ? '–' : stats?.avgScore !== null && stats?.avgScore !== undefined ? `${stats.avgScore}%` : 'N/A'}
            </p>
            <p className="text-xs text-slate-500 mt-1">Across all submitted results</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Violations</span>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{loading ? '–' : stats?.violations ?? 0}</p>
            <p className="text-xs text-slate-500 mt-1">AI Proctoring not yet enabled</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Exams List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900">All Exams</h3>

                <div className="flex gap-2">
                  {(['all', 'live', 'scheduled', 'completed'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                        activeTab === tab
                          ? "text-indigo-600 bg-indigo-50"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-6 space-y-4">
                {loading && (
                  <div className="flex items-center justify-center gap-2 text-slate-500 py-8">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading your exams...</span>
                  </div>
                )}

                {!loading && filteredExams.length === 0 && (
                  <p className="text-sm text-slate-500 py-8 text-center">
                    No exams found{activeTab !== 'all' ? ` for "${activeTab}"` : ''}.
                  </p>
                )}

                {!loading && filteredExams.map((exam) => {
                  const status = exam.computedStatus || 'scheduled';
                  return (
                    <div
                      key={exam._id}
                      className="border border-slate-200 rounded-lg p-5 hover:border-indigo-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-slate-900">{exam.title}</h4>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              status === 'live'
                                ? 'bg-green-100 text-green-700'
                                : status === 'scheduled'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">
                            {exam.courseCode} • {formatDate(exam.date)} • {exam.time} • {exam.duration} min
                          </p>
                          {status === "scheduled" && (
                            <p className="text-xs text-blue-600 mt-1">
                              Starts in: {getTimeLeft(exam.date, exam.time)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                          <p className="text-2xl font-bold text-slate-900">{exam.students ?? 0}</p>
                          <p className="text-xs text-slate-600">Total Students</p>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">{exam.submitted ?? 0}</p>
                          <p className="text-xs text-slate-600">Submitted</p>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                          <p className="text-2xl font-bold text-red-600">{exam.violations ?? 0}</p>
                          <p className="text-xs text-slate-600">Violations</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        {status === 'live' && (
                          <button
                            onClick={() => onMonitorExam(exam._id)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            Monitor Live
                          </button>
                        )}
                        <button
                          onClick={() => onEditExam(exam._id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => openResultsModal(exam, 'latest')}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                        >
                          View Results
                        </button>
                        <button
                          onClick={() => openDeleteModal(exam)}
                          title="Delete Exam"
                          className="flex items-center justify-center px-4 py-2 border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Performance Analytics  */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-6">Student Performance Trend</h3>
              {performanceData.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-12">
                  No submitted results yet — this chart will populate once students complete your exams.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="exam" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="avg"
                      stroke="#6366f1"
                      strokeWidth={3}
                      dot={{ fill: '#6366f1', r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Violations Report */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900">Recent Violations</h3>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-500 text-center py-8">
                  No violation data available.
                  <br />
                  <span className="text-xs">(AI Proctoring module not yet enabled)</span>
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => alert('Question bank import is coming in a future update.')}
                  className="w-full px-4 py-3 text-left border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                      <Plus className="w-5 h-5 text-indigo-600 group-hover:text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Import Questions</p>
                      <p className="text-xs text-slate-600">From question bank</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => alert('Student management is coming in a future update.')}
                  className="w-full px-4 py-3 text-left border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                      <Users className="w-5 h-5 text-blue-600 group-hover:text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Manage Students</p>
                      <p className="text-xs text-slate-600">Add or remove students</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => alert('No violations to review — AI Proctoring is not yet enabled.')}
                  className="w-full px-4 py-3 text-left border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-600 transition-colors">
                      <AlertTriangle className="w-5 h-5 text-amber-600 group-hover:text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Review Violations</p>
                      <p className="text-xs text-slate-600">{stats?.violations ?? 0} pending reviews</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Upcoming Schedule */}
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
              <h3 className="font-semibold mb-3">Next Exam</h3>
              {loading ? (
                <p className="text-purple-100 text-sm">Loading...</p>
              ) : stats?.nextExam ? (
                <>
                  <p className="text-purple-100 text-sm mb-1">{stats.nextExam.title}</p>
                  <p className="text-2xl font-bold mb-1">{formatDate(stats.nextExam.date)}</p>
                  <p className="text-purple-100 text-sm mb-4">
                    {stats.nextExam.time} • {stats.nextExam.registeredStudents} student(s) registered
                  </p>
                  <button
                    onClick={() => onEditExam(stats.nextExam!.examId)}
                    className="w-full bg-white text-indigo-600 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors"
                  >
                    View Details
                  </button>
                </>
              ) : (
                <p className="text-purple-100 text-sm">No upcoming exams scheduled.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* View Results Modal */}
      {resultsModalExam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{resultsModalExam.title}</h3>
                <p className="text-sm text-slate-600">{resultsModalExam.courseCode} — Results</p>
              </div>
              <button
                onClick={() => setResultsModalExam(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <ArrowUpDown className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-600 mr-2">Sort by:</span>
                {(['highest', 'lowest', 'latest'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => openResultsModal(resultsModalExam, s)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                      resultsSort === s
                        ? "text-indigo-600 bg-indigo-50"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {s === 'highest' ? 'Highest Score' : s === 'lowest' ? 'Lowest Score' : 'Latest Submission'}
                  </button>
                ))}
              </div>

              {resultsLoading && (
                <div className="flex items-center justify-center gap-2 text-slate-500 py-12">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading results...</span>
                </div>
              )}

              {!resultsLoading && resultsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                  {resultsError}
                </div>
              )}

              {!resultsLoading && !resultsError && resultsData && resultsData.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-12">
                  No students have submitted this exam yet.
                </p>
              )}

              {!resultsLoading && !resultsError && resultsData && resultsData.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500 border-b border-slate-200">
                        <th className="py-2 pr-4">Student</th>
                        <th className="py-2 pr-4">Email</th>
                        <th className="py-2 pr-4">Score</th>
                        <th className="py-2 pr-4">%</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2 pr-4">Time Taken</th>
                        <th className="py-2 pr-4">Submitted</th>
                        <th className="py-2 pr-4">Violations</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultsData.map((r) => (
                        <tr key={r.resultId} className="border-b border-slate-100">
                          <td className="py-3 pr-4 font-medium text-slate-900">{r.studentName}</td>
                          <td className="py-3 pr-4 text-slate-600">{r.studentEmail}</td>
                          <td className="py-3 pr-4 text-slate-900">{r.obtainedMarks}/{r.totalMarks}</td>
                          <td className="py-3 pr-4 text-slate-900">{r.percentage}%</td>
                          <td className="py-3 pr-4">
                            <span className={r.passed ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                              {r.passed ? 'Pass' : 'Fail'}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-slate-600">{formatDuration(r.timeTakenSeconds)}</td>
                          <td className="py-3 pr-4 text-slate-600">
                            {new Date(r.submittedAt).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                          <td className="py-3 pr-4 text-slate-600">{r.violations}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Exam Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            {deleteStage === 1 ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Delete Exam</h3>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 mb-4 space-y-1 text-sm">
                  <p className="font-medium text-slate-900">{deleteTarget.title}</p>
                  <p className="text-slate-600">{deleteTarget.courseCode}</p>
                  <p className="text-slate-600">
                    {formatDate(deleteTarget.date)} at {deleteTarget.time}
                  </p>
                  <p className="text-slate-600">{deleteTarget.duration} min</p>
                </div>

                <p className="text-sm text-slate-700 mb-6">
                  Are you sure you want to delete this exam? This action cannot be undone.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">This Exam Has Submissions</h3>
                </div>

                <p className="text-sm text-slate-700 mb-6">
                  This exam already contains student submissions. Deleting it will
                  permanently remove all associated results and submissions. Do you
                  still want to continue?
                </p>
              </>
            )}

            {deleteError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {deleting ? 'Deleting...' : 'Yes, Delete Exam'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
            toast.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
}
