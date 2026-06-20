'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Search, Bell, Settings, User, LogOut } from 'lucide-react';

export function TopNavbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('organization');
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-10 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-border/50 transition-all duration-300 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center flex-1">
          <div className="flex items-center bg-slate-100/70 dark:bg-slate-800/50 rounded-xl px-3 py-1.5 w-full max-w-md border border-slate-200/20 dark:border-slate-800/20 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all duration-200">
            <Search size={16} className="text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search anything..."
              className="bg-transparent ml-2 flex-1 outline-none text-xs sm:text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2.5 ml-4">
          <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors duration-200">
            <Bell size={18} />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors duration-200">
            <Settings size={18} />
          </button>

          <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* Profile menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2.5 p-1.5 pr-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
            >
              <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md shadow-indigo-500/10 uppercase">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 hidden sm:inline">
                {user?.firstName}
              </span>
            </button>

            {showProfileMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                <div className="absolute right-0 mt-2 w-56 backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border border-border/80 rounded-2xl shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-border/50">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user?.email}</p>
                    <span className="inline-flex mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/30 capitalize">
                      {user?.role.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="py-1">
                    <button className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150">
                      <User size={15} className="text-slate-400" />
                      <span className="font-medium">My Profile</span>
                    </button>
                    <button className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150">
                      <Settings size={15} className="text-slate-400" />
                      <span className="font-medium">Settings</span>
                    </button>
                  </div>
                  <div className="border-t border-border/50 py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors duration-150"
                    >
                      <LogOut size={15} />
                      <span className="font-semibold">Logout</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
