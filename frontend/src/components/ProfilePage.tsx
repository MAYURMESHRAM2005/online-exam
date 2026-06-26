import { ArrowLeft, User, Mail } from "lucide-react";

interface ProfilePageProps {
  userName: string | null;
  email?: string;
  onBack: () => void;
}

export function ProfilePage({ userName, email, onBack }: ProfilePageProps) {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-6 text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft /> Back
      </button>

      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-6">Profile</h2>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <User />
            <span>{userName}</span>
          </div>

          <div className="flex items-center gap-3">
            <Mail />
            <span>{email || "No Email"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}