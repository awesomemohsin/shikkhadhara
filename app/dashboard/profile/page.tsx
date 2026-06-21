'use client';

import { useAuthStore } from '@/lib/store';
import { User, Shield, Phone, Mail, Award, Clock } from 'lucide-react';

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
          <User className="text-indigo-650" size={28} />
          <span>My Profile</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Review your account parameters, contact details, and institutional roles.</p>
      </div>

      <div className="max-w-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-lg uppercase">
          {user?.firstName?.[0]}
          {user?.lastName?.[0]}
        </div>

        <div className="flex-grow space-y-3.5 text-xs font-semibold text-slate-650 dark:text-slate-350">
          <div>
            <h2 className="text-xl font-extrabold text-slate-850 dark:text-white uppercase">
              {user?.firstName} {user?.lastName}
            </h2>
            <span className="inline-flex mt-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 capitalize">
              Role: {user?.role.replace('_', ' ')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 border-t border-slate-100 pt-3.5">
            <div className="flex items-center space-x-2">
              <Mail size={14} className="text-slate-400" />
              <span>Email: {user?.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone size={14} className="text-slate-400" />
              <span>Phone: {user?.phone || 'Not Configured'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield size={14} className="text-slate-400" />
              <span>Status: Active Account</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock size={14} className="text-slate-400" />
              <span>System ID: #{user?._id || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
