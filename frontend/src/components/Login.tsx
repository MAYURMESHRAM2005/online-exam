
// import { useState } from 'react';
// import type React from 'react';
// import type { UserRole } from '../types';
// import { GraduationCap, Lock, Mail, Eye, EyeOff } from 'lucide-react';

// interface LoginProps {
//   onLogin: (role: UserRole,name: string) => void;
// }

// export function Login({ onLogin }: LoginProps) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [role, setRole] = useState<'student' | 'instructor' | 'admin'>('student');
//   const [showPassword, setShowPassword] = useState(false);
//   const [isRegister, setIsRegister] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const endpoint = isRegister
//         ? 'http://localhost:5000/api/auth/register'
//         : 'http://localhost:5000/api/auth/login';

//       const bodyData = isRegister
//         ? { email, password, role }
//         : { email, password };

//       const response = await fetch(endpoint, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(bodyData),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || 'Something went wrong');
//       }

//       // Save token
//       localStorage.setItem('token', data.token);
//       localStorage.setItem('name', data.name); 

//       alert(isRegister ? 'Account Created Successfully' : 'Login Successful');

//       // Backend should return role inside response
//       onLogin(data.role,data.name);

//     } catch (error: any) {
//       alert(error.message || 'Server error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-4">
//       <div className="w-full max-w-md">

//         {/* Logo */}
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4">
//             <GraduationCap className="w-8 h-8 text-white" />
//           </div>
//           <h1 className="text-3xl font-bold text-slate-900 mb-2">
//             ExamSecure AI
//           </h1>
//           <p className="text-slate-600">Secure Online Examination System</p>
//         </div>

//         {/* Card */}
//         <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
//           <h2 className="text-2xl font-semibold text-slate-900 mb-6">
//             {isRegister ? 'Create Account' : 'Welcome Back'}
//           </h2>

//           <form onSubmit={handleSubmit} className="space-y-5">

//             {/* Role Selection (Only for Register) */}
//             {isRegister && (
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   I am a
//                 </label>
//                 <div className="grid grid-cols-3 gap-2">
//                   {(['student', 'instructor', 'admin'] as const).map(r => (
//                     <button
//                       key={r}
//                       type="button"
//                       onClick={() => setRole(r)}
//                       className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
//                         role === r
//                           ? 'bg-indigo-600 text-white'
//                           : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//                       }`}
//                     >
//                       {r.charAt(0).toUpperCase() + r.slice(1)}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Email */}
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-2">
//                 Email
//               </label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
//                 <input
//                   type="email"
//                   required
//                   value={email}
//                   onChange={e => setEmail(e.target.value)}
//                   className="w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
//                 />
//               </div>
//             </div>

//             {/* Password */}
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-2">
//                 Password
//               </label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
//                 <input
//                   type={showPassword ? 'text' : 'password'}
//                   required
//                   value={password}
//                   onChange={e => setPassword(e.target.value)}
//                   className="w-full pl-11 pr-11 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2"
//                 >
//                   {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                 </button>
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-60"
//             >
//               {loading
//                 ? 'Please wait...'
//                 : isRegister
//                 ? 'Create Account'
//                 : 'Sign In'}
//             </button>
//           </form>

//           <div className="mt-6 text-center text-sm">
//             {isRegister ? 'Already have an account?' : "Don't have an account?"}
//             <button
//               onClick={() => setIsRegister(!isRegister)}
//               className="ml-1 text-indigo-600 font-medium"
//             >
//               {isRegister ? 'Sign In' : 'Register'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useState } from 'react';
import type React from 'react';
import type { UserRole } from '../types';
import { GraduationCap, Lock, Mail, Eye, EyeOff, User } from 'lucide-react';

interface LoginProps {
  onLogin: (role: UserRole,name: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'instructor' | 'admin'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const toggleMode = () => {
  setIsRegister((prev) => !prev);
  setRole('student');
};

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isRegister
        ? 'http://localhost:5000/api/auth/register'
        : 'http://localhost:5000/api/auth/login';

      const bodyData = isRegister
        ? { name, email, password, role }
        : { email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      // Save token
      localStorage.setItem('token', data.token);
      localStorage.setItem('name', data.name); 

      alert(isRegister ? 'Account Created Successfully' : 'Login Successful');

      // Backend should return role inside response
      onLogin(data.role,data.name);

    } catch (error: any) {
      alert(error.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            ExamSecure AI
          </h1>
          <p className="text-slate-600">Secure Online Examination System</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Role Selection (Only for Register) */}
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  I am a
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['student', 'instructor', 'admin'] as const).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        role === r
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Full Name (Only for Register) */}
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-60"
            >
              {loading
                ? 'Please wait...'
                : isRegister
                ? 'Create Account'
                : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="ml-1 text-indigo-600 font-medium"
            >
              {isRegister ? 'Sign In' : 'Register'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
