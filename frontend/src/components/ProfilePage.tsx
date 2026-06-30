import { useEffect, useState } from "react";
import { ArrowLeft, User, Mail, Phone, FileText, Loader2, AlertCircle, CheckCircle } from "lucide-react";

interface ProfilePageProps {
  userName: string | null;
  email?: string;
  onBack: () => void;
}

interface Profile {
  name: string;
  email: string;
  phone: string;
  bio: string;
  profileCompletionPercent: number;
}

export function ProfilePage({ userName, onBack }: ProfilePageProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to load profile");

        setProfile(data);
        setPhone(data.phone || "");
        setBio(data.bio || "");
      } catch (err: any) {
        setError(err.message || "Something went wrong while loading your profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const res = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone, bio }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      setProfile(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.message || "Something went wrong while saving your profile.");
    } finally {
      setSaving(false);
    }
  };

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

        {loading && (
          <div className="flex items-center gap-2 text-slate-500 py-6">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading your profile...</span>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 mb-4">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!loading && profile && (
          <>
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <User />
                <span>{userName || profile.name}</span>
              </div>

              <div className="flex items-center gap-3">
                <Mail />
                <span>{profile.email || "No Email"}</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Add a phone number"
                  className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-start gap-3">
                <FileText className="text-slate-400 mt-2" />
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Add a short bio"
                  className="flex-1 border rounded-lg px-3 py-2 h-24 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Profile completion</span>
                <span className="font-medium text-slate-900">
                  {profile.profileCompletionPercent}%
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all"
                  style={{ width: `${profile.profileCompletionPercent}%` }}
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saved && <CheckCircle className="w-4 h-4" />}
              {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
