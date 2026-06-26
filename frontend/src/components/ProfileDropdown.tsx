import { useState, useRef, useEffect } from "react";
import { LogOut, Settings, User } from "lucide-react";

interface ProfileDropdownProps {
  userName: string | null;
  onLogout: () => void;
  onProfile: () => void;  
}

export function ProfileDropdown({ userName, onLogout,onProfile }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dark, setDark] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const firstLetter = userName ? userName.charAt(0).toUpperCase() : "U";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 focus:outline-none"
      >
        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
          {firstLetter}
        </div>
        <span className="hidden md:block text-sm font-medium text-slate-800">
          {userName || "User"}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-3 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50 animate-fadeIn">
          
          <div className="px-4 py-2 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-900">
              {userName || "User"}
            </p>
            <p className="text-xs text-slate-500">
              Account Settings
            </p>
          </div>

          <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
            <User size={16} />
            Profile
          </button>

          <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
            <Settings size={16} />
            Settings
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut size={16} />
            Logout
           </button>
{/* //         <button
//   onClick={onProfile}
//   className="flex items-center gap-3 w-full px-4 py-2 hover:bg-slate-100"
// >
//   Profile
// </button>  */}
{/* //  <button
//   onClick={() => {
//     document.documentElement.classList.toggle("dark");
//     setDark(!dark);
//   }}
//   className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-slate-100"
// >
   🌙 Toggle Dark Mode
      </button>  */}
        </div>
      )}
    </div>
  );
}