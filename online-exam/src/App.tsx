// import { useState } from 'react';
// import { Login } from './components/Login';
// import { StudentDashboard } from './components/StudentDashboard';
// import { InstructorDashboard } from './components/InstructorDashboard';
// import { AdminDashboard } from './components/AdminDashboard';
// import { ExamInstructions } from './components/ExamInstructions';
// import { ProctoringSetup } from './components/ProctoringSetup';
// import { LiveExam } from './components/LiveExam';
// import { ExamSubmission } from './components/ExamSubmission';
// import { Results } from './components/Results';
// import { CreateExam } from './components/CreateExam';
// import { LiveProctoring } from './components/LiveProctoring';

// export type UserRole = 'student' | 'instructor' | 'admin' | null;
// export type Screen = 
//   | 'login'
//   | 'student-dashboard'
//   | 'instructor-dashboard'
//   | 'admin-dashboard'
//   | 'exam-instructions'
//   | 'proctoring-setup'
//   | 'live-exam'
//   | 'exam-submission'
//   | 'results'
//   | 'create-exam'
//   | 'live-proctoring';

// export default function App() {
//   const [currentScreen, setCurrentScreen] = useState<Screen>('login');
//   const [userRole, setUserRole] = useState<UserRole>(null);
//   const [selectedExamId, setSelectedExamId] = useState<string | null>(null);

//   const handleLogin = (role: UserRole) => {
//     setUserRole(role);
//     if (role === 'student') {
//       setCurrentScreen('student-dashboard');
//     } else if (role === 'instructor') {
//       setCurrentScreen('instructor-dashboard');
//     } else if (role === 'admin') {
//       setCurrentScreen('admin-dashboard');
//     }
//   };

//   const handleLogout = () => {
//     setUserRole(null);
//     setCurrentScreen('login');
//     setSelectedExamId(null);
//   };

//   const handleStartExam = (examId: string) => {
//     setSelectedExamId(examId);
//     setCurrentScreen('exam-instructions');
//   };

//   const handleProceedToSetup = () => {
//     setCurrentScreen('proctoring-setup');
//   };

//   const handleStartLiveExam = () => {
//     setCurrentScreen('live-exam');
//   };

//   const handleSubmitExam = () => {
//     setCurrentScreen('exam-submission');
//   };

//   const handleViewResults = () => {
//     setCurrentScreen('results');
//   };

//   const handleBackToDashboard = () => {
//     if (userRole === 'student') {
//       setCurrentScreen('student-dashboard');
//     } else if (userRole === 'instructor') {
//       setCurrentScreen('instructor-dashboard');
//     } else if (userRole === 'admin') {
//       setCurrentScreen('admin-dashboard');
//     }
//   };

//   const handleCreateExam = () => {
//     setCurrentScreen('create-exam');
//   };

//   const handleMonitorExam = (examId: string) => {
//     setSelectedExamId(examId);
//     setCurrentScreen('live-proctoring');
//   };

//   return (
    
//     <div className="min-h-screen bg-slate-50">
//       {currentScreen === 'login' && (
//         <Login onLogin={handleLogin} />
//       )}
//       {currentScreen === 'student-dashboard' && (
//         <StudentDashboard 
//           onStartExam={handleStartExam}
//           onViewResults={handleViewResults}
//           onLogout={handleLogout}
//         />
//       )}
//       {currentScreen === 'instructor-dashboard' && (
//         <InstructorDashboard
//           onCreateExam={handleCreateExam}
//           onMonitorExam={handleMonitorExam}
//           onLogout={handleLogout}
//         />
//       )}
//       {currentScreen === 'admin-dashboard' && (
//         <AdminDashboard onLogout={handleLogout} />
//       )}
//       {currentScreen === 'exam-instructions' && (
//         <ExamInstructions
//           examId={selectedExamId}
//           onProceed={handleProceedToSetup}
//           onBack={handleBackToDashboard}
//         />
//       )}
//       {currentScreen === 'proctoring-setup' && (
//         <ProctoringSetup
//           onStartExam={handleStartLiveExam}
//           onBack={() => setCurrentScreen('exam-instructions')}
//         />
//       )}
//       {currentScreen === 'live-exam' && (
//         <LiveExam
//           examId={selectedExamId}
//           onSubmit={handleSubmitExam}
//         />
//       )}
//       {currentScreen === 'exam-submission' && (
//         <ExamSubmission
//           onBackToDashboard={handleBackToDashboard}
//         />
//       )}
//       {currentScreen === 'results' && (
//         <Results
//           onBack={handleBackToDashboard}
//         />
//       )}
//       {currentScreen === 'create-exam' && (
//         <CreateExam onBack={handleBackToDashboard} />
//       )}
//       {currentScreen === 'live-proctoring' && (
//         <LiveProctoring
//           examId={selectedExamId}
//           onBack={handleBackToDashboard}
//         />
//       )}; 
//     </div>
    
//   );
// }
// import { useState } from "react";
// import { Login } from "./components/Login";
// import { StudentDashboard } from "./components/StudentDashboard";
// import { ProctoringSetup } from "./components/ProctoringSetup";
// import { Results } from "./components/Results";
// import type { UserRole } from "./types";

// type Page = "dashboard" | "proctoring" | "results";

// export default function App() {
//   const [userRole, setUserRole] = useState<UserRole | null>(null);
//   const [currentPage, setCurrentPage] = useState<Page>("dashboard");

//   if (!userRole) {
//     return <Login onLogin={setUserRole} />;
//   }

//   if (userRole === "student") {
//     if (currentPage === "dashboard") {
//       return (
//         <StudentDashboard
//           onStartExam={() => setCurrentPage("proctoring")}
//           onViewResults={() => setCurrentPage("results")}
//           onLogout={() => setUserRole(null)}
//         />
//       );
//     }

//     if (currentPage === "proctoring") {
//       return (
//         <ProctoringSetup
//           onStartExam={() => alert("Exam Started 🚀")}
//           onBack={() => setCurrentPage("dashboard")}
//         />
//       );
//     }

//     if (currentPage === "results") {
//       return <Results onBack={() => setCurrentPage("dashboard")} />;
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center text-2xl">
//       Dashboard for {userRole} coming soon...
//     </div>
//   );
// }


// import { useState, useEffect } from 'react';
// import { jwtDecode } from 'jwt-decode';

// import { Login } from './components/Login';
// import { StudentDashboard } from './components/StudentDashboard';
// import { InstructorDashboard } from './components/InstructorDashboard';
// import { AdminDashboard } from './components/AdminDashboard';
// import { ExamInstructions } from './components/ExamInstructions';
// import { ProctoringSetup } from './components/ProctoringSetup';
// import { LiveExam } from './components/LiveExam';
// import { ExamSubmission } from './components/ExamSubmission';
// import { Results } from './components/Results';
// import { CreateExam } from './components/CreateExam';
// import { LiveProctoring } from './components/LiveProctoring';

// export type UserRole = 'student' | 'instructor' | 'admin' | null;

// interface JwtPayload {
//   id: string;
//   role: UserRole;
//   exp: number;
// }

// export type Screen =
//   | 'login'
//   | 'student-dashboard'
//   | 'instructor-dashboard'
//   | 'admin-dashboard'
//   | 'exam-instructions'
//   | 'proctoring-setup'
//   | 'live-exam'
//   | 'exam-submission'
//   | 'results'
//   | 'create-exam'
//   | 'live-proctoring';

// export default function App() {
//   const [currentScreen, setCurrentScreen] = useState<Screen>('login');
//   const [userRole, setUserRole] = useState<UserRole>(null);
//   const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
//   const [userName, setUserName] = useState<string | null>(null);

//   // 🔥 AUTO LOGIN + EXPIRY CHECK
//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!token) return;

//     try {
//       const decoded = jwtDecode<JwtPayload>(token);

//       // Check expiry
//       if (decoded.exp * 1000 < Date.now()) {
//         localStorage.removeItem('token');
//         return;
//       }

//       setUserRole(decoded.role);

//       if (decoded.role === 'student')
//         setCurrentScreen('student-dashboard');
//       if (decoded.role === 'instructor')
//         setCurrentScreen('instructor-dashboard');
//       if (decoded.role === 'admin')
//         setCurrentScreen('admin-dashboard');

//     } catch (error) {
//       localStorage.removeItem('token');
//     }
//   }, []);

//   const handleLogin = (role: UserRole,  name: string) => {
//     setUserRole(role);
//     setUserName(name);

//     if (role === 'student') setCurrentScreen('student-dashboard');
//     if (role === 'instructor') setCurrentScreen('instructor-dashboard');
//     if (role === 'admin') setCurrentScreen('admin-dashboard');
//   };

//   // 🔥 Proper Logout
//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     setUserRole(null);
//     setCurrentScreen('login');
//     setSelectedExamId(null);
//   };

//   const handleStartExam = (examId: string) => {
//     setSelectedExamId(examId);
//     setCurrentScreen('exam-instructions');
//   };

//   const handleProceedToSetup = () => {
//     setCurrentScreen('proctoring-setup');
//   };

//   const handleStartLiveExam = () => {
//     setCurrentScreen('live-exam');
//   };

//   const handleSubmitExam = () => {
//     setCurrentScreen('exam-submission');
//   };

//   const handleViewResults = () => {
//     setCurrentScreen('results');
//   };

//   const handleBackToDashboard = () => {
//     if (userRole === 'student') setCurrentScreen('student-dashboard');
//     if (userRole === 'instructor') setCurrentScreen('instructor-dashboard');
//     if (userRole === 'admin') setCurrentScreen('admin-dashboard');
//   };

//   const handleCreateExam = () => {
//     setCurrentScreen('create-exam');
//   };

//   const handleMonitorExam = (examId: string) => {
//     setSelectedExamId(examId);
//     setCurrentScreen('live-proctoring');
//   };

//   return (
//     <div className="min-h-screen bg-slate-50">

//       {currentScreen === 'login' && <Login onLogin={handleLogin} />}

//       {currentScreen === 'student-dashboard' && userRole === 'student' && (
//         <StudentDashboard
//           onStartExam={handleStartExam}
//           onViewResults={handleViewResults}
//           onLogout={handleLogout}
//         />
//       )}

//       {currentScreen === 'instructor-dashboard' && userRole === 'instructor' && (
//         <InstructorDashboard
//           onCreateExam={handleCreateExam}
//           onMonitorExam={handleMonitorExam}
//           onLogout={handleLogout}
//         />
//       )}

//       {currentScreen === 'admin-dashboard' && userRole === 'admin' && (
//         <AdminDashboard onLogout={handleLogout} />
//       )}

//       {currentScreen === 'exam-instructions' && (
//         <ExamInstructions
//           examId={selectedExamId}
//           onProceed={handleProceedToSetup}
//           onBack={handleBackToDashboard}
//         />
//       )}

//       {currentScreen === 'proctoring-setup' && (
//         <ProctoringSetup
//           onStartExam={handleStartLiveExam}
//           onBack={() => setCurrentScreen('exam-instructions')}
//         />
//       )}

//       {currentScreen === 'live-exam' && (
//         <LiveExam
//           examId={selectedExamId}
//           onSubmit={handleSubmitExam}
//         />
//       )}

//       {currentScreen === 'exam-submission' && (
//         <ExamSubmission
//           onBackToDashboard={handleBackToDashboard}
//         />
//       )}

//       {currentScreen === 'results' && (
//         <Results onBack={handleBackToDashboard} />
//       )}

//       {currentScreen === 'create-exam' && (
//         <CreateExam onBack={handleBackToDashboard} />
//       )}

//       {currentScreen === 'live-proctoring' && (
//         <LiveProctoring
//           examId={selectedExamId}
//           onBack={handleBackToDashboard}
//         />
//       )}
//     </div>
//   );
// }
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

import { Login } from './components/Login';
import { StudentDashboard } from './components/StudentDashboard';
import { InstructorDashboard } from './components/InstructorDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ExamInstructions } from './components/ExamInstructions';
import { ProctoringSetup } from './components/ProctoringSetup';
import { LiveExam } from './components/LiveExam';
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

  const handleSubmitExam = () => {
    setCurrentScreen('exam-submission');
  };

  const handleViewResults = () => {
    setCurrentScreen('results');
  };

  const handleBackToDashboard = () => {
    if (userRole === 'student') setCurrentScreen('student-dashboard');
    if (userRole === 'instructor') setCurrentScreen('instructor-dashboard');
    if (userRole === 'admin') setCurrentScreen('admin-dashboard');
  };

  const handleCreateExam = () => {
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
          onStartExam={handleStartLiveExam}
          onBack={() => setCurrentScreen('exam-instructions')}
        />
      )}

      {currentScreen === 'live-exam' && (
        <LiveExam
          examId={selectedExamId}
          onSubmit={handleSubmitExam}
        />
      )}

      {currentScreen === 'exam-submission' && (
        <ExamSubmission
          onBackToDashboard={handleBackToDashboard}
        />
      )}

      {currentScreen === 'results' && (
        <Results onBack={handleBackToDashboard} />
      )}

      {currentScreen === 'create-exam' && (
        <CreateExam onBack={handleBackToDashboard} />
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