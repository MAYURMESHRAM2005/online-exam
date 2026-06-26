
import { Bell, Plus, Users, FileText, AlertTriangle, TrendingUp, Eye, Edit, MoreVertical } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ProfileDropdown } from "./ProfileDropdown";
import { useEffect, useState } from "react";

  
  interface Exam {
  _id: string;
  title: string;
  courseCode: string;
  duration: number;
  date: string;
  time: string;
  status?: string;

  students?: number;
  submitted?: number;
  violations?: number;
  }


interface InstructorDashboardProps {
  userName: string | null;
  onCreateExam: () => void;
  onMonitorExam: (examId: string) => void;
  onLogout: () => void;
}                     

const performanceData = [
  { exam: 'Quiz 1', avg: 78 },
  { exam: 'Quiz 2', avg: 82 },
  { exam: 'Midterm', avg: 85 },
  { exam: 'Quiz 3', avg: 88 }
];

const violationData = [
  { type: 'Tab Switch', count: 24 },
  { type: 'Face Not Visible', count: 18 },
  { type: 'Multiple People', count: 8 },
  { type: 'Phone Detected', count: 5 }
];

export function InstructorDashboard({  userName,onCreateExam, onMonitorExam, onLogout }: InstructorDashboardProps) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("all");

useEffect(() => {
  const interval = setInterval(() => {
    setCurrentTime(new Date());
  }, 60000); // update every 1 min

  return () => clearInterval(interval);
}, []);
  useEffect(() => {
  const fetchExams = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/exams/my-exams", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setExams(data);

    } catch (error) {
      console.error(error);
    }
  };

  fetchExams();
}, []);
const getExamStatus = (exam: any) => {
  if (!exam.date || !exam.time) return "scheduled"; // fallback

  const now = new Date();
  const examStart = new Date(`${exam.date}T${exam.time}`);
  const examEnd = new Date(examStart.getTime() + exam.duration * 60000);

  if (now < examStart) return "scheduled";
  if (now >= examStart && now <= examEnd) return "live";
  return "completed";
};
const filteredExams = exams.filter((exam) => {
  const status = getExamStatus(exam);

  if (activeTab === "all") return true;
  if (activeTab === "live") return status === "live";
  if (activeTab === "scheduled") return status === "scheduled";

  return true;
});
// const getCountdown = (exam: any) => {
//   const now = new Date();
//   const examStart = new Date(`${exam.date}T${exam.time}`);
//   const diff = examStart.getTime() - now.getTime();

//   if (diff <= 0) return "Started";

//   const hours = Math.floor(diff / (1000 * 60 * 60));
//   const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

//   return `${hours}h ${mins}m`;
// };
const getTimeLeft = (date: string, time: string) => {
  const examTime = new Date(`${date}T${time}`);
  const now = new Date();

  const diff = examTime.getTime() - now.getTime();

  if (isNaN(diff)) return "Invalid time";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  return `${hours}h ${minutes}m`;
};
const formatDate = (date: string) => {
  const d = new Date(date);
  return d.toLocaleDateString("en-GB"); // DD/MM/YYYY
};
// const formatDate = (date: string) => {
//   const d = new Date(date);
//   return d.toLocaleDateString("en-IN", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// };
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
            
            {/* <div className="flex items-center gap-4">
              <button className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                <User className="w-5 h-5" />
                <span className="text-sm font-medium">{userName || "Instructor"} </span>
              </button>
              <button
                onClick={onLogout}
                className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            
            </div> */}
            <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

              <ProfileDropdown
                userName={userName}
                onLogout={onLogout} 
               onProfile={() => console.log("Go to profile")}              />
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Total Exams</span>
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">24</p>
            <p className="text-xs text-green-600 mt-1">+3 this month</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Active Students</span>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">433</p>
            <p className="text-xs text-slate-500 mt-1">Across 3 courses</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Avg. Score</span>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">84%</p>
            <p className="text-xs text-green-600 mt-1">+2% from last exam</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Violations</span>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">11</p>
            <p className="text-xs text-red-600 mt-1">Flagged for review</p>
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
  <button
    onClick={() => setActiveTab("all")}
    className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
      activeTab === "all"
        ? "text-indigo-600 bg-indigo-50"
        : "text-slate-600 hover:bg-slate-100"
    }`}
  >
    All
  </button>

  <button
    onClick={() => setActiveTab("live")}
    className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
      activeTab === "live"
        ? "text-indigo-600 bg-indigo-50"
        : "text-slate-600 hover:bg-slate-100"
    }`}
  >
    Live
  </button>

  <button
    onClick={() => setActiveTab("scheduled")}
    className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
      activeTab === "scheduled"
        ? "text-indigo-600 bg-indigo-50"
        : "text-slate-600 hover:bg-slate-100"
    }`}
  >
    Scheduled
  </button>
</div>
              </div>
              <div className="p-6 space-y-4">
                {exams.map((exam) => (
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
                            {/* {exam.status
                             ? exam.status.charAt(0).toUpperCase() + exam.status.slice(1)
                             : "Scheduled"} */}
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                           </span>   
                          
                        </div>
                        <p className="text-sm text-slate-600">{exam.courseCode} • {formatDate(exam.date)} • {exam.duration} min</p>
                      </div>
                      <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                    {status === "scheduled" && (
                       <p className="text-xs text-blue-600 mt-1">
                         Starts in: {getTimeLeft(exam.date, exam.time)}
                       </p>
                     )}

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <p className="text-2xl font-bold text-slate-900">{exam.students}</p>
                        <p className="text-xs text-slate-600">Total Students</p>
                      </div>
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{exam.submitted}</p>
                        <p className="text-xs text-slate-600">Submitted</p>
                      </div>
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{exam.violations}</p>
                        <p className="text-xs text-slate-600">Violations</p>
                      </div>
                    </div>
 
                    <div className="flex gap-3">
                    {exam.status === 'live' && (
                         <button
                           onClick={() => onMonitorExam(exam._id)}
                           className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                         >
                           <Eye className="w-4 h-4" />
                           Monitor Live
                         </button>
                       )}
                       <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                         <Edit className="w-4 h-4" />
                         Edit
                       </button>
                       <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                         View Results
                       </button>
                     </div>
                   
                  </div>
                ))}
              </div>
            </div>
 
            {/* Performance Analytics  */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-6">Student Performance Trend</h3>
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
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={violationData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" stroke="#64748b" />
                    <YAxis dataKey="type" type="category" stroke="#64748b" width={100} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="count" fill="#ef4444" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-3 text-left border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all group">
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

                <button className="w-full px-4 py-3 text-left border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all group">
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

                <button className="w-full px-4 py-3 text-left border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-600 transition-colors">
                      <AlertTriangle className="w-5 h-5 text-amber-600 group-hover:text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Review Violations</p>
                      <p className="text-xs text-slate-600">11 pending reviews</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Upcoming Schedule */}
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
              <h3 className="font-semibold mb-3">Next Exam</h3>
              <p className="text-purple-100 text-sm mb-1">Database Systems Final</p>
              <p className="text-2xl font-bold mb-1">Feb 15, 2026</p>
              <p className="text-purple-100 text-sm mb-4">2:00 PM • 132 students enrolled</p>
              <button className="w-full bg-white text-indigo-600 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
