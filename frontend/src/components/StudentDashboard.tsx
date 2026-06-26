import { Bell, Calendar, Clock, FileText, LogOut, User, AlertCircle, CheckCircle, Trophy } from 'lucide-react';

interface StudentDashboardProps {
   userName: string | null;
  onStartExam: (examId: string) => void;
  onViewResults: () => void;
  onLogout: () => void;
}

const upcomingExams = [
  {
    id: '1',
    title: 'Data Structures & Algorithms',
    course: 'CS301',
    date: '2026-02-12',
    time: '10:00 AM',
    duration: '90 min',
    status: 'scheduled',
    proctoring: true
  },
  {
    id: '2',
    title: 'Database Management Systems',
    course: 'CS302',
    date: '2026-02-15',
    time: '2:00 PM',
    duration: '120 min',
    status: 'scheduled',
    proctoring: true
  }
];

const pastExams = [
  {
    id: '3',
    title: 'Web Development Fundamentals',
    course: 'CS201',
    date: '2026-02-01',
    score: 87,
    total: 100,
    status: 'completed'
  },
  {
    id: '4',
    title: 'Operating Systems',
    course: 'CS303',
    date: '2026-01-28',
    score: 92,
    total: 100,
    status: 'completed'
  }
];

const notifications = [
  { id: 1, text: 'Your exam "Data Structures" is scheduled for Feb 12', type: 'info', time: '2 hours ago' },
  { id: 2, text: 'Results published for "Web Development Fundamentals"', type: 'success', time: '1 day ago' },
  { id: 3, text: 'Complete your profile to access all features', type: 'warning', time: '2 days ago' }
];

export function StudentDashboard({ userName,onStartExam, onViewResults, onLogout }: StudentDashboardProps) {
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
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
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
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, John!</h2>
          <p className="text-slate-600">Here's your exam schedule and performance overview</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Upcoming Exams</span>
              <Calendar className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">2</p>
            <p className="text-xs text-slate-500 mt-1">Next in 4 days</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Completed</span>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">12</p>
            <p className="text-xs text-slate-500 mt-1">This semester</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Avg. Score</span>
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">85%</p>
            <p className="text-xs text-green-600 mt-1">+3% from last month</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Profile</span>
              <User className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900">80%</p>
            <p className="text-xs text-orange-600 mt-1">Complete profile</p>
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
                {upcomingExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="border border-slate-200 rounded-lg p-5 hover:border-indigo-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">{exam.title}</h4>
                        <p className="text-sm text-slate-600">{exam.course}</p>
                      </div>
                      {exam.proctoring && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          AI Proctored
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{exam.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{exam.time}</span>
                      </div>
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs">{exam.duration}</span>
                    </div>

                    <button
                      onClick={() => onStartExam(exam.id)}
                      className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Start Exam
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Past Exams */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-xl font-semibold text-slate-900">Recent Results</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {pastExams.map((exam) => (
                    <div
                      key={exam.id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 mb-1">{exam.title}</h4>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <span>{exam.course}</span>
                          <span>•</span>
                          <span>{exam.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            {exam.score}
                          </p>
                          <p className="text-xs text-slate-500">out of {exam.total}</p>
                        </div>
                        <button
                          onClick={onViewResults}
                          className="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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
                <div className="space-y-3">
                  {notifications.map((notif) => (
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
