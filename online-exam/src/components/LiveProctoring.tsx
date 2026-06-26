import { ArrowLeft, Camera, AlertTriangle, Users, Clock, Search, Flag, Eye } from 'lucide-react';
import { useState } from 'react';

interface LiveProctoringProps {
  examId: string | null;
  onBack: () => void;
}

const students = [
  { id: 1, name: 'Alice Johnson', status: 'active', violations: 0, progress: 78, cameraActive: true },
  { id: 2, name: 'Bob Smith', status: 'active', violations: 2, progress: 65, cameraActive: true },
  { id: 3, name: 'Carol Williams', status: 'active', violations: 0, progress: 82, cameraActive: true },
  { id: 4, name: 'David Brown', status: 'warning', violations: 3, progress: 45, cameraActive: false },
  { id: 5, name: 'Emma Davis', status: 'active', violations: 1, progress: 90, cameraActive: true },
  { id: 6, name: 'Frank Miller', status: 'active', violations: 0, progress: 71, cameraActive: true },
  { id: 7, name: 'Grace Wilson', status: 'active', violations: 0, progress: 88, cameraActive: true },
  { id: 8, name: 'Henry Moore', status: 'active', violations: 1, progress: 56, cameraActive: true },
];

const recentViolations = [
  { id: 1, student: 'Bob Smith', type: 'Tab Switch', time: '2 min ago', severity: 'medium' },
  { id: 2, student: 'David Brown', type: 'Face Not Detected', time: '5 min ago', severity: 'high' },
  { id: 3, student: 'Emma Davis', type: 'Multiple People', time: '8 min ago', severity: 'high' },
  { id: 4, student: 'Henry Moore', type: 'Tab Switch', time: '12 min ago', severity: 'medium' },
];

export function LiveProctoring({ onBack }: LiveProctoringProps) {
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'warning'>('all');

  const filteredStudents = students.filter(
    s => filterStatus === 'all' || s.status === filterStatus
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <div className="h-8 w-px bg-slate-300"></div>
              <div>
                <h1 className="font-semibold text-slate-900">Live Proctoring Monitor</h1>
                <p className="text-xs text-slate-600">Data Structures & Algorithms</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Live</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">1:23:45</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Total Students</span>
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">145</p>
            <p className="text-xs text-green-600 mt-1">89 submitted</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Active Now</span>
              <Camera className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">56</p>
            <p className="text-xs text-slate-500 mt-1">Taking exam</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Violations</span>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">7</p>
            <p className="text-xs text-red-600 mt-1">Needs review</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Avg Progress</span>
              <Flag className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">72%</p>
            <p className="text-xs text-slate-500 mt-1">Questions answered</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Student Grid */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-slate-900">Student Monitoring</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilterStatus('all')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                        filterStatus === 'all'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilterStatus('active')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                        filterStatus === 'active'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Active
                    </button>
                    <button
                      onClick={() => setFilterStatus('warning')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                        filterStatus === 'warning'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Warnings
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    className="w-full pl-11 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => setSelectedStudent(student.id)}
                      className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedStudent === student.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : student.violations > 2
                          ? 'border-red-200 hover:border-red-300'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Camera Feed Placeholder */}
                      <div className="aspect-video bg-slate-900 rounded-lg mb-3 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Camera className="w-8 h-8 text-slate-600" />
                        </div>
                        {student.cameraActive && (
                          <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                        {student.violations > 0 && (
                          <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded">
                            {student.violations} ⚠
                          </div>
                        )}
                      </div>

                      <div className="mb-2">
                        <p className="font-medium text-slate-900 text-sm truncate">{student.name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-slate-600">Progress</span>
                          <span className="text-xs font-medium text-slate-900">{student.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-indigo-600 h-1.5 rounded-full"
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="flex-1 px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700">
                          <Eye className="w-3 h-3 inline mr-1" />
                          View
                        </button>
                        <button className="px-2 py-1 border border-red-300 text-red-600 text-xs rounded hover:bg-red-50">
                          Warn
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Violations & Details */}
          <div className="space-y-6">
            {/* Recent Violations */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900">Recent Violations</h3>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {recentViolations.map((violation) => (
                    <div
                      key={violation.id}
                      className={`p-3 rounded-lg border ${
                        violation.severity === 'high'
                          ? 'bg-red-50 border-red-200'
                          : 'bg-orange-50 border-orange-200'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          violation.severity === 'high' ? 'text-red-600' : 'text-orange-600'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {violation.student}
                          </p>
                          <p className="text-xs text-slate-600">{violation.type}</p>
                          <p className="text-xs text-slate-500 mt-1">{violation.time}</p>
                        </div>
                        <button className="text-indigo-600 hover:text-indigo-700 text-xs font-medium">
                          Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Student Details */}
            {selectedStudent && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-900">Student Details</h3>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <p className="text-lg font-semibold text-slate-900">
                      {students.find(s => s.id === selectedStudent)?.name}
                    </p>
                    <p className="text-sm text-slate-600">ID: STU-{selectedStudent.toString().padStart(4, '0')}</p>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Status:</span>
                      <span className="font-medium text-green-600">Active</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Progress:</span>
                      <span className="font-medium text-slate-900">
                        {students.find(s => s.id === selectedStudent)?.progress}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Violations:</span>
                      <span className={`font-medium ${
                        (students.find(s => s.id === selectedStudent)?.violations || 0) > 0
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}>
                        {students.find(s => s.id === selectedStudent)?.violations || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Camera:</span>
                      <span className="font-medium text-green-600">Active</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                      View Full Screen
                    </button>
                    <button className="w-full px-4 py-2 border border-orange-300 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-50">
                      Send Warning
                    </button>
                    <button className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50">
                      Terminate Exam
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
              <h3 className="font-semibold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 py-2 rounded-lg text-sm font-medium transition-colors">
                  Export Violation Report
                </button>
                <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 py-2 rounded-lg text-sm font-medium transition-colors">
                  Broadcast Message
                </button>
                <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 py-2 rounded-lg text-sm font-medium transition-colors">
                  End Exam for All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      
      </div> 
    
  );
}
