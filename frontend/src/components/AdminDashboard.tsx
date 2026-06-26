// import {
//   Bell,
//   LogOut,
//   User,
//   Users,
//   FileText,
//   AlertTriangle,
//   Settings,
//   TrendingUp,
//   Download,
//   Search,
//   MoreVertical,
//   Shield,
//   Database,
// } from "lucide-react";
// import {
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts";

// interface AdminDashboardProps {
//   onLogout: () => void;
// }

// const examStats = [
//   { month: "Aug", exams: 45, violations: 12 },
//   { month: "Sep", exams: 52, violations: 8 },
//   { month: "Oct", exams: 61, violations: 15 },
//   { month: "Nov", exams: 58, violations: 10 },
//   { month: "Dec", exams: 48, violations: 6 },
//   { month: "Jan", exams: 55, violations: 11 },
//   { month: "Feb", exams: 42, violations: 7 },
// ];

// const userDistribution = [
//   { name: "Students", value: 2845 },
//   { name: "Instructors", value: 124 },
//   { name: "Admins", value: 12 },
// ];

// const COLORS = ["#6366f1", "#8b5cf6", "#ec4899"];

// const recentUsers = [
//   {
//     id: 1,
//     name: "John Doe",
//     role: "Student",
//     email: "john@university.edu",
//     joined: "2026-02-01",
//   },
//   {
//     id: 2,
//     name: "Dr. Sarah Johnson",
//     role: "Instructor",
//     email: "sarah@university.edu",
//     joined: "2026-01-28",
//   },
//   {
//     id: 3,
//     name: "Emily Chen",
//     role: "Student",
//     email: "emily@university.edu",
//     joined: "2026-01-25",
//   },
//   {
//     id: 4,
//     name: "Prof. Michael Brown",
//     role: "Instructor",
//     email: "michael@university.edu",
//     joined: "2026-01-20",
//   },
// ];

// const systemLogs = [
//   {
//     id: 1,
//     action: "User Login",
//     user: "john@university.edu",
//     time: "2 min ago",
//     status: "success",
//   },
//   {
//     id: 2,
//     action: "Exam Created",
//     user: "sarah@university.edu",
//     time: "15 min ago",
//     status: "success",
//   },
//   {
//     id: 3,
//     action: "Violation Flagged",
//     user: "System",
//     time: "23 min ago",
//     status: "warning",
//   },
//   {
//     id: 4,
//     action: "Failed Login Attempt",
//     user: "unknown@domain.com",
//     time: "45 min ago",
//     status: "error",
//   },
// ];

// export function AdminDashboard({ onLogout }: AdminDashboardProps) {
//   return (
//     <div className="min-h-screen bg-slate-50">
//       {/* Header */}
//       <header className="bg-white border-b sticky top-0 z-10">
//         <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
//               <Shield className="w-6 h-6 text-white" />
//             </div>
//             <h1 className="text-xl font-semibold">ExamSecure AI</h1>
//             <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs">
//               Admin
//             </span>
//           </div>

//           <div className="flex items-center gap-4">
//             <button className="relative p-2 rounded-lg hover:bg-slate-100">
//               <Bell className="w-5 h-5" />
//               <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
//             </button>
//             <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100">
//               <User className="w-5 h-5" />
//               <span className="text-sm">Admin</span>
//             </button>
//             <button
//               onClick={onLogout}
//               className="p-2 rounded-lg hover:bg-red-50 text-red-600"
//             >
//               <LogOut className="w-5 h-5" />
//             </button>
//           </div>
//         </div>
//       </header>

//       <div className="max-w-7xl mx-auto p-8">
//         <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
//         <p className="text-slate-600 mb-8">
//           System overview and management
//         </p>

//         {/* Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//           <StatCard title="Total Users" value="2,981" icon={<Users />} />
//           <StatCard title="Total Exams" value="361" icon={<FileText />} />
//           <StatCard title="System Uptime" value="99.9%" icon={<TrendingUp />} />
//           <StatCard title="Violations" value="69" icon={<AlertTriangle />} />
//         </div>

//         {/* Charts */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
//           <div className="lg:col-span-2 bg-white p-6 rounded-xl border">
//             <h3 className="text-xl font-semibold mb-4">
//               Exam Activity & Violations
//             </h3>
//             <ResponsiveContainer width="100%" height={300}>
//               <LineChart data={examStats}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="month" />
//                 <YAxis />
//                 <Tooltip />
//                 <Line dataKey="exams" stroke="#6366f1" strokeWidth={3} />
//                 <Line dataKey="violations" stroke="#ef4444" strokeWidth={3} />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>

//           <div className="bg-white p-6 rounded-xl border">
//             <h3 className="text-xl font-semibold mb-4">User Distribution</h3>
//             <ResponsiveContainer width="100%" height={250}>
//               <PieChart>
//                 <Pie data={userDistribution} dataKey="value" outerRadius={80}>
//                   {userDistribution.map((_, i) => (
//                     <Cell key={i} fill={COLORS[i]} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function StatCard({
//   title,
//   value,
//   icon,
// }: {
//   title: string;
//   value: string;
//   icon:  React.ReactNode;
// }) {
//   return (
//     <div className="bg-white p-6 rounded-xl border">
//       <div className="flex items-center justify-between mb-2">
//         <span className="text-sm text-slate-600">{title}</span>
//         {icon}
//       </div>
//       <p className="text-3xl font-bold">{value}</p>
//     </div>
//   );
// }
import { 
  Bell, LogOut, User, Users, FileText, AlertTriangle, Settings, 
  TrendingUp, Download, Search, MoreVertical, Shield, Database 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface AdminDashboardProps {
  userName: string | null;
  onLogout: () => void;
}

const examStats = [
  { month: 'Aug', exams: 45, violations: 12 },
  { month: 'Sep', exams: 52, violations: 8 },
  { month: 'Oct', exams: 61, violations: 15 },
  { month: 'Nov', exams: 58, violations: 10 },
  { month: 'Dec', exams: 48, violations: 6 },
  { month: 'Jan', exams: 55, violations: 11 },
  { month: 'Feb', exams: 42, violations: 7 }
];

const userDistribution = [
  { name: 'Students', value: 2845 },
  { name: 'Instructors', value: 124 },
  { name: 'Admins', value: 12 }
];

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899'];

const recentUsers = [
  { id: 1, name: 'John Doe', role: 'Student', email: 'john@university.edu', status: 'active', joined: '2026-02-01' },
  { id: 2, name: 'Dr. Sarah Johnson', role: 'Instructor', email: 'sarah@university.edu', status: 'active', joined: '2026-01-28' },
  { id: 3, name: 'Emily Chen', role: 'Student', email: 'emily@university.edu', status: 'active', joined: '2026-01-25' },
  { id: 4, name: 'Prof. Michael Brown', role: 'Instructor', email: 'michael@university.edu', status: 'active', joined: '2026-01-20' }
];

const systemLogs = [
  { id: 1, action: 'User Login', user: 'john@university.edu', time: '2 min ago', status: 'success' },
  { id: 2, action: 'Exam Created', user: 'sarah@university.edu', time: '15 min ago', status: 'success' },
  { id: 3, action: 'Violation Flagged', user: 'System', time: '23 min ago', status: 'warning' },
  { id: 4, action: 'Failed Login Attempt', user: 'unknown@domain.com', time: '45 min ago', status: 'error' }
];

export function AdminDashboard({ userName, onLogout }: AdminDashboardProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-semibold text-slate-900">ExamSecure AI</h1>
              <span className="ml-3 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                Admin
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                <User className="w-5 h-5" />
                <span className="text-sm font-medium">Admin</span>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h2>
            <p className="text-slate-600">System overview and management</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all">
            <Settings className="w-5 h-5" />
            System Settings
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Total Users</span>
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">2,981</p>
            <p className="text-xs text-green-600 mt-1">+12% this month</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Total Exams</span>
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">361</p>
            <p className="text-xs text-slate-500 mt-1">This semester</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">System Uptime</span>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">99.9%</p>
            <p className="text-xs text-green-600 mt-1">Excellent</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Violations</span>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">69</p>
            <p className="text-xs text-red-600 mt-1">This week</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Exam Activity Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-900">Exam Activity & Violations</h3>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={examStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }} 
                />
                <Line type="monotone" dataKey="exams" stroke="#6366f1" strokeWidth={3} name="Exams" />
                <Line type="monotone" dataKey="violations" stroke="#ef4444" strokeWidth={3} name="Violations" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* User Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-6">User Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={userDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}

                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {userDistribution.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index] }}
                    ></div>
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                  <span className="font-medium text-slate-900">{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Management */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-slate-900">User Management</h3>
                <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                  View All
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full pl-11 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-600">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'Admin'
                            ? 'bg-red-100 text-red-700'
                            : user.role === 'Instructor'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {user.role}
                        </span>
                        <p className="text-xs text-slate-500 mt-1">{user.joined}</p>
                      </div>
                      <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Logs */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-900">System Activity Logs</h3>
              <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                View All
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {systemLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-4 rounded-lg border ${
                      log.status === 'error'
                        ? 'bg-red-50 border-red-200'
                        : log.status === 'warning'
                        ? 'bg-orange-50 border-orange-200'
                        : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-slate-900 text-sm">{log.action}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            log.status === 'error'
                              ? 'bg-red-100 text-red-700'
                              : log.status === 'warning'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {log.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{log.user}</p>
                      </div>
                      <span className="text-xs text-slate-500">{log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <Database className="w-10 h-10 mb-3 opacity-80" />
            <h3 className="font-semibold mb-2">Database Backup</h3>
            <p className="text-sm text-indigo-100 mb-4">Last backup: 2 hours ago</p>
            <button className="w-full bg-white text-indigo-600 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors">
              Backup Now
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
            <Users className="w-10 h-10 mb-3 opacity-80" />
            <h3 className="font-semibold mb-2">Bulk User Import</h3>
            <p className="text-sm text-blue-100 mb-4">Add multiple users at once</p>
            <button className="w-full bg-white text-blue-600 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
              Import Users
            </button>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
            <Shield className="w-10 h-10 mb-3 opacity-80" />
            <h3 className="font-semibold mb-2">Security Settings</h3>
            <p className="text-sm text-purple-100 mb-4">Configure system security</p>
            <button className="w-full bg-white text-purple-600 py-2 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors">
              Manage Security
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
