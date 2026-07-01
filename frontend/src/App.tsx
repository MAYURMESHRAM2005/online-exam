import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

import { Login } from './components/Login';
import { StudentDashboard } from './components/StudentDashboard';
import { InstructorDashboard } from './components/InstructorDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ExamInstructions } from './components/ExamInstructions';
import { ProctoringSetup } from './components/ProctoringSetup';
import { LiveExam } from './components/LiveExam';
import { stopProctorStream } from './lib/proctorStream';
import { ExamSubmission } from './components/ExamSubmission';
import { Results } from './components/Results';
import { CreateExam } from './components/CreateExam';
import { LiveProctoring } from './components/LiveProctoring';
import { ProfilePage } from './components/ProfilePage';

export type UserRole = 'student' | 'instructor' | 'admin' | null;

interface JwtPayload {
  id: string;
  role: UserRole;
  name: string;   // ✅ added
  exp: number;
}

export type Screen =
  | 'login'
  | 'student-dashboard'
  | 'instructor-dashboard'
  | 'admin-dashboard'
  | 'exam-instructions'
  | 'proctoring-setup'
  | 'live-exam'
  | 'exam-submission'
  | 'results'
  | 'create-exam'
  | 'live-proctoring'
  | 'profile';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [proctorSessionId, setProctorSessionId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  // 🔥 AUTO LOGIN + EXPIRY CHECK
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const decoded = jwtDecode<JwtPayload>(token);

      // Expiry check
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        return;
      }

      setUserRole(decoded.role);
      setUserName(decoded.name); // ✅ set name

      if (decoded.role === 'student')
        setCurrentScreen('student-dashboard');
      if (decoded.role === 'instructor')
        setCurrentScreen('instructor-dashboard');
      if (decoded.role === 'admin')
        setCurrentScreen('admin-dashboard');

    } catch (error) {
      localStorage.removeItem('token');
    }
  }, []);

  const handleLogin = (role: UserRole, name: string) => {
    setUserRole(role);
    setUserName(name);

    if (role === 'student') setCurrentScreen('student-dashboard');
    if (role === 'instructor') setCurrentScreen('instructor-dashboard');
    if (role === 'admin') setCurrentScreen('admin-dashboard');
  };

  // 🔥 Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserRole(null);
    setUserName(null);
    setCurrentScreen('login');
    setSelectedExamId(null);
    setSelectedResultId(null);
    setProctorSessionId(null);
    stopProctorStream();
  };

  const handleStartExam = (examId: string) => {
    setSelectedExamId(examId);
    setCurrentScreen('exam-instructions');
  };

  const handleProceedToSetup = () => {
    setCurrentScreen('proctoring-setup');
  };

  const handleStartLiveExam = () => {
    setCurrentScreen('live-exam');
  };

  const handleSubmitExam = (resultId: string) => {
    setSelectedResultId(resultId);
    setCurrentScreen('exam-submission');
  };

  const handleViewResults = (resultId?: string) => {
    if (resultId) setSelectedResultId(resultId);
    setCurrentScreen('results');
  };

  const handleBackToDashboard = () => {
    if (userRole === 'student') setCurrentScreen('student-dashboard');
    if (userRole === 'instructor') setCurrentScreen('instructor-dashboard');
    if (userRole === 'admin') setCurrentScreen('admin-dashboard');
  };

  const handleCreateExam = () => {
    setSelectedExamId(null);
    setCurrentScreen('create-exam');
  };

  const handleEditExam = (examId: string) => {
    setSelectedExamId(examId);
    setCurrentScreen('create-exam');
  };

  const handleMonitorExam = (examId: string) => {
    setSelectedExamId(examId);
    setCurrentScreen('live-proctoring');
  };
  const handleOpenProfile = () => {
  setCurrentScreen('profile');
};

  return (
    <div className="min-h-screen bg-slate-50">

      {currentScreen === 'login' && (
        <Login onLogin={handleLogin} />
      )}

      {currentScreen === 'student-dashboard' && userRole === 'student' && (
        <StudentDashboard
          userName={userName}     // ✅ pass name
          onStartExam={handleStartExam}
          onViewResults={handleViewResults}
          onLogout={handleLogout}
        />
      )}

      {currentScreen === 'instructor-dashboard' && userRole === 'instructor' && (
        <InstructorDashboard
          userName={userName}     // ✅ pass name
          onCreateExam={handleCreateExam}
          onEditExam={handleEditExam}
          onMonitorExam={handleMonitorExam}
          onLogout={handleLogout}
        />
      )}

      {currentScreen === 'admin-dashboard' && userRole === 'admin' && (
        <AdminDashboard
          userName={userName}     // ✅ pass name
          onLogout={handleLogout}
        />
      )}

      {currentScreen === 'exam-instructions' && (
        <ExamInstructions
          examId={selectedExamId}
          onProceed={handleProceedToSetup}
          onBack={handleBackToDashboard}
        />
      )}

      {currentScreen === 'proctoring-setup' && (
        <ProctoringSetup
          examId={selectedExamId}
          onStartExam={handleStartLiveExam}
          onBack={() => setCurrentScreen('exam-instructions')}
          onSessionStarted={setProctorSessionId}
        />
      )}

      {currentScreen === 'live-exam' && (
        <LiveExam
          examId={selectedExamId}
          proctorSessionId={proctorSessionId}
          onSubmit={handleSubmitExam}
        />
      )}

      {currentScreen === 'exam-submission' && (
        <ExamSubmission
          resultId={selectedResultId}
          onBackToDashboard={handleBackToDashboard}
          onViewResults={() => handleViewResults()}
        />
      )}

      {currentScreen === 'results' && (
        <Results resultId={selectedResultId} onBack={handleBackToDashboard} />
      )}

      {currentScreen === 'create-exam' && (
        <CreateExam onBack={handleBackToDashboard} examId={selectedExamId} />
      )}

      {currentScreen === 'live-proctoring' && (
        <LiveProctoring
          examId={selectedExamId}
          onBack={handleBackToDashboard}
        />
      )}
      {currentScreen === 'profile' && (
  <ProfilePage
    userName={userName}
    onBack={handleBackToDashboard}
  />
)}
    </div>
  );
}