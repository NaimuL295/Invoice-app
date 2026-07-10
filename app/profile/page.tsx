"use client";

import { useSession, signOut } from "next-auth/react";
import { LogOut, User, Mail, ShieldCheck } from "lucide-react";

const Profile = () => {
  // 1. Fetch the session data via the client hook
  const { data: session, status } = useSession();

  // 2. Handle a smooth logout action
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login" });
  };

  // 3. Render the loader while checking authentication state
  if (status === "loading") return <LoadingSkeleton />;

  // 4. Return fallback if no user data exists
  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        Access Denied. Please log in.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Header/Banner Area */}
        <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {/* Profile Content */}
        <div className="px-8 pb-8">
          <div className="relative">
            {/* Avatar */}
            <div className="absolute -top-12 left-0 p-1 bg-white rounded-2xl shadow-md">
              <div className="h-24 w-24 bg-slate-200 rounded-xl flex items-center justify-center text-slate-500 overflow-hidden">
                {session.user.image ? (
                  <img 
                    src={session.user.image} 
                    alt={session.user.name || "User"} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User size={48} />
                )}
              </div>
            </div>
          </div>

          <div className="mt-16">
            <h1 className="text-2xl font-bold text-slate-800">
              {session.user.name || "Account Settings"}
            </h1>
            <p className="text-slate-500 text-sm">Manage your profile and security</p>
          </div>

          {/* Info Rows */}
          <div className="mt-8 space-y-4">
            <div className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
              <Mail className="text-indigo-500 mr-4 flex-shrink-0" size={20} />
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Email Address</p>
                {/* Fixed: changed from 'user.email' to 'session.user.email' */}
                <p className="text-slate-700 font-medium">{session.user.email}</p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
              <ShieldCheck className="text-green-500 mr-4 flex-shrink-0" size={20} />
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Account Status</p>
                <p className="text-slate-700 font-medium">Verified User</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-white border-2 border-red-100 text-red-500 py-3 rounded-xl font-semibold hover:bg-red-50 hover:border-red-200 transition-all active:scale-95"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// A simple loading placeholder
const LoadingSkeleton = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="animate-pulse flex flex-col items-center">
      <div className="h-12 w-12 bg-slate-200 rounded-full mb-4"></div>
      <div className="h-4 w-32 bg-slate-200 rounded"></div>
    </div>
  </div>
);

export default Profile;