'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { KeyRound, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ChangePasswordPage() {
  const token = useAuthStore((state) => state.token);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (response.ok) {
        setSuccess('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to change password');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
          <KeyRound className="text-indigo-650" size={28} />
          <span>Change Password</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Update your secure sign-in password parameters.</p>
      </div>

      {success && (
        <div className="max-w-md rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
          <p className="text-xs text-emerald-600 font-semibold">{success}</p>
        </div>
      )}

      {error && (
        <div className="max-w-md rounded-xl bg-rose-500/10 border border-rose-500/20 p-4">
          <p className="text-xs text-rose-600 font-semibold">{error}</p>
        </div>
      )}

      <div className="max-w-md bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <form onSubmit={handleChangePassword} className="space-y-4 text-xs font-semibold">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Current Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-205 dark:border-slate-850 dark:bg-slate-950 rounded-xl outline-none text-slate-800 dark:text-slate-200"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-205 dark:border-slate-855 dark:bg-slate-950 rounded-xl outline-none text-slate-800 dark:text-slate-200"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Confirm New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-205 dark:border-slate-855 dark:bg-slate-950 rounded-xl outline-none text-slate-800 dark:text-slate-200"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
          >
            <Save size={16} />
            <span>{loading ? 'Changing Password...' : 'Change Password'}</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
