import { useEffect, useState } from 'react';
import { Bell, Calendar, Clock, FileText, LogOut, User, AlertCircle, CheckCircle, Trophy, Loader2 } from 'lucide-react';

interface StudentDashboardProps {
  userName: string | null;
  onStartExam: (examId: string) => void;
  onViewResults: (resultId?: string) => void;
  onLogout: () => void;
}

// ✅ Shape returned by GET /api/exams/available
interface AvailableExam {
  _id: string;
  title: string;
  courseCode: string;
  date: string;
  time: string;
  duration: number;
  computedStatus: 'scheduled' | 'live' | 'completed';
  proctoring?: {
    enableProctoring?: boolean;
  };
}

// ✅ Shape returned by GET /api/results/mine
interface MyResult {
  resultId: string;
  examTitle: string;
  courseCode: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
}

// ✅ Shape returned by GET /api/auth/me
interface Profile {
  name: string;
  email: string;
  profileCompletionPercent: number;
}

interface Notification {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning';
  time: string;
  sortKey: number;
}

const formatDate = (dateString: string | undefined | null) => {
  if (!dateString) return 'Date TBD';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Date TBD';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Date TBD';
  }
};

const timeAgo = (dateString: string) => {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

export function StudentDashboard({ userName, onStartExam, onViewResults, onLogout }: StudentDashboardProps) {
  const [exams, setExams] = useState<AvailableExam[]>([]);
  const [results, setResults] = useState<MyResult[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [examsRes, resultsRes, profileRes] = await Promise.all([
          fetch('http://localhost:5000/api/exams/available', { headers }),
          fetch('http://localhost:5000/api/results/mine', { headers }),
          fetch('http://localhost:5000/api/auth/me', { headers }),
        ]);

        const [examsData, resultsData, profileData] = await Promise.all([
          examsRes.json(),
          resultsRes.json(),
          profileRes.json(),
        ]);

        if (!examsRes.ok) throw new Error(examsData.message || 'Failed to load exams');
        if (!resultsRes.ok) throw new Error(resultsData.message || 'Failed to load results');
        if (!profileRes.ok) throw new Error(profileData.message || 'Failed to load profile');

        setExams(examsData);
        setResults(resultsData);
        setProfile(profileData);
      } catch (err: any) {
        setError(err.message || 'Something went wrong while loading your dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ===== Derived stats (all computed from real data — nothing hardcoded) =====
  const completedCount = results.length;
  const averageScore =
    results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
      : null;

  // ===== Notifications: generated from real exams/results/profile data =====
  const notifications: Notification[] = [];

  // Safely computes an exam's start timestamp, returning null instead of
  // throwing if date/time are missing or malformed (e.g. a legacy record).
  const safeExamTime = (exam: AvailableExam): number | null => {
    if (!exam.date || !exam.time) return null;
    try {
      const datePart = exam.date.split('T')[0];
      const t = new Date(`${datePart}T${exam.time}`).getTime();
      return isNaN(t) ? null : t;
    } catch {
      return null;
    }
  };

  exams.forEach((exam) => {
    const examTime = safeExamTime(exam);
    const hoursAway = examTime !== null ? (examTime - Date.now()) / (1000 * 60 * 60) : null;
    const fallbackSortKey = examTime ?? Date.now();

    if (exam.computedStatus === 'scheduled' && hoursAway !== null && hoursAway <= 48) {
      notifications.push({
        id: `reminder-${exam._id}`,
        text: `Reminder: "${exam.title}" starts ${formatDate(exam.date)} at ${exam.time || 'TBD'}`,
        type: 'info',
        time: 'Upcoming',
        sortKey: fallbackSortKey,
      });
    } else if (exam.computedStatus === 'scheduled' || exam.computedStatus === 'live') {
      notifications.push({
        id: `assigned-${exam._id}`,
        text: `New exam assigned: "${exam.title}" (${exam.courseCode})`,
        type: 'info',
        time: formatDate(exam.date),
        sortKey: fallbackSortKey,
      });
    }
  });

  results.slice(0, 3).forEach((r) => {
    const submittedTime = new Date(r.submittedAt).getTime();
    notifications.push({
      id: `result-${r.resultId}`,
      text: `Result published for "${r.examTitle}": ${r.percentage}% (${r.passed ? 'Passed' : 'Failed'})`,
      type: 'success',
      time: timeAgo(r.submittedAt),
      sortKey: submittedTime,
    });
  });

  if (results.length > 0) {
    const latest = results[0];
    notifications.push({
      id: `submitted-${latest.resultId}`,
      text: `You successfully submitted "${latest.examTitle}"`,
      type: 'success',
      time: timeAgo(latest.submittedAt),
      sortKey: new Date(latest.submittedAt).getTime() + 1, // appears just after the result-published entry
    });
  }

  if (profile && profile.profileCompletionPercent < 100) {
    notifications.push({
      id: 'profile-incomplete',
      text: `Your profile is ${profile.profileCompletionPercent}% complete. Complete it to access all features.`,
      type: 'warning',
      time: 'Ongoing',
      sortKey: Date.now(),
    });
  }

  notifications.sort((a, b) => b.sortKey - a.sortKey);
  const visibleNotifications = notifications.slice(0, 6);

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
            </div>
            
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                {visibleNotifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                <User className="w-5 h-5" />
                <span className="text-sm font-medium">{userName || "Student"}</span>
              </button>
              <button
                onClick={onLogout}
                className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, {userName || 'Student'}!</h2>
          <p className="text-slate-600">Here's your exam schedule and performance overview</p>
        </div>

        {!loading && error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 mb-8">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Upcoming Exams</span>
              <Calendar className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{loading ? '–' : exams.length}</p>
            <p className="text-xs text-slate-500 mt-1">
              {loading ? 'Loading...' : exams.length > 0 ? `${exams.length} exam(s) available` : 'No exams scheduled'}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Completed</span>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{loading ? '–' : completedCount}</p>
            <p className="text-xs text-slate-500 mt-1">Exams submitted</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Avg. Score</span>
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {loading ? '–' : averageScore !== null ? `${averageScore}%` : 'N/A'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {averageScore !== null ? `Across ${completedCount} exam(s)` : 'No exams completed yet'}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Profile</span>
              <User className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {loading ? '–' : `${profile?.profileCompletionPercent ?? 0}%`}
            </p>
            <p className="text-xs text-orange-600 mt-1">
              {profile && profile.profileCompletionPercent < 100 ? 'Complete profile' : 'Profile complete'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Exams */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-xl font-semibold text-slate-900">Upcoming Exams</h3>
              </div>
              <div className="p-6 space-y-4">
                {loading && (
                  <div className="flex items-center justify-center gap-2 text-slate-500 py-8">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading your exams...</span>
                  </div>
                )}

                {!loading && !error && exams.length === 0 && (
                  <p className="text-sm text-slate-500 py-8 text-center">
                    No exams are available right now. Check back later.
                  </p>
                )}

                {!loading && !error && exams.map((exam) => (
                  <div
                    key={exam._id}
                    className="border border-slate-200 rounded-lg p-5 hover:border-indigo-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">{exam.title}</h4>
                        <p className="text-sm text-slate-600">{exam.courseCode}</p>
                      </div>
                      {exam.proctoring?.enableProctoring && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          AI Proctored
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(exam.date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{exam.time}</span>
                      </div>
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs">{exam.duration} min</span>
                      {exam.computedStatus === 'live' && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                          Live Now
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => onStartExam(exam._id)}
                      className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Start Exam
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Results */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-xl font-semibold text-slate-900">Recent Results</h3>
              </div>
              <div className="p-6">
                {loading && (
                  <div className="flex items-center justify-center gap-2 text-slate-500 py-8">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading your results...</span>
                  </div>
                )}

                {!loading && !error && results.length === 0 && (
                  <p className="text-sm text-slate-500 py-8 text-center">
                    You haven't completed any exams yet.
                  </p>
                )}

                {!loading && !error && results.length > 0 && (
                  <div className="space-y-3">
                    {results.slice(0, 5).map((r) => (
                      <div
                        key={r.resultId}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 mb-1">{r.examTitle}</h4>
                          <div className="flex items-center gap-3 text-sm text-slate-600">
                            <span>{r.courseCode}</span>
                            <span>•</span>
                            <span>{formatDate(r.submittedAt)}</span>
                            <span>•</span>
                            <span className={r.passed ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                              {r.passed ? 'Passed' : 'Failed'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`text-2xl font-bold ${r.passed ? 'text-green-600' : 'text-red-600'}`}>
                              {r.obtainedMarks}
                            </p>
                            <p className="text-xs text-slate-500">out of {r.totalMarks} ({r.percentage}%)</p>
                          </div>
                          <button
                            onClick={() => onViewResults(r.resultId)}
                            className="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notifications */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900">Notifications</h3>
              </div>
              <div className="p-4">
                {loading && (
                  <div className="flex items-center justify-center gap-2 text-slate-500 py-6">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                )}

                {!loading && visibleNotifications.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-6">No notifications right now.</p>
                )}

                {!loading && visibleNotifications.length > 0 && (
                  <div className="space-y-3">
                    {visibleNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 rounded-lg border ${
                          notif.type === 'warning'
                            ? 'bg-orange-50 border-orange-200'
                            : notif.type === 'success'
                            ? 'bg-green-50 border-green-200'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {notif.type === 'warning' ? (
                            <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          ) : notif.type === 'success' ? (
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          ) : (
                            <Bell className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="text-xs text-slate-700 mb-1">{notif.text}</p>
                            <p className="text-xs text-slate-500">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Instructions Reminder */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
              <h3 className="font-semibold mb-2">Exam Preparation</h3>
              <p className="text-sm text-indigo-100 mb-4">
                Make sure your device meets all technical requirements before starting an exam.
              </p>
              <button className="w-full bg-white text-indigo-600 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors">
                View Requirements
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
