'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Mail, Plus, Trash2, ShieldAlert, CheckCircle2, UserPlus, Search, Filter, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InvitationPage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('teacher');
  const [showAddForm, setShowAddForm] = useState(false);

  // Search/Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const isAdmin = user && ['admin', 'super_admin', 'owner'].includes(user.role);

  useEffect(() => {
    if (token && isAdmin) {
      fetchInvitations();
    } else {
      setLoading(false);
    }
  }, [token, isAdmin]);

  const fetchInvitations = async () => {
    try {
      const response = await fetch('/api/invitations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setInvitations(data.invitations || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email address is required');
      return;
    }
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, phone, role }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Invitation sent successfully to ${email}!`);
        setEmail('');
        setPhone('');
        setRole('teacher');
        setShowAddForm(false);
        fetchInvitations();
      } else {
        setError(data.message || 'Failed to send invitation');
      }
    } catch (err) {
      setError('Connection failed. Please check network.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteInvitation = async (id: string, targetEmail: string) => {
    if (!confirm(`Are you sure you want to cancel the invitation for "${targetEmail}"?`)) {
      return;
    }
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/invitations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setSuccess('Invitation cancelled successfully.');
        fetchInvitations();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to cancel invitation');
      }
    } catch (err) {
      setError('Connection failed.');
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <ShieldAlert size={48} className="text-rose-500" />
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">Access Denied</h1>
        <p className="text-sm text-slate-500">Only institutional administrators can manage user invitations.</p>
      </div>
    );
  }

  // Filter & Search logic
  const filteredInvitations = invitations.filter((inv) => {
    const matchesSearch = inv.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (inv.phone && inv.phone.includes(searchQuery));
    const matchesRole = filterRole === 'all' || inv.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Mail className="text-blue-600" size={28} />
            <span>Invitation Manager</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Send secure access passes to candidates, parents, teachers, and staffs.</p>
        </div>

        <Button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setError('');
            setSuccess('');
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-5 shadow-sm flex items-center space-x-1.5 text-xs"
        >
          <UserPlus size={16} />
          <span>{showAddForm ? 'View Active Invites' : 'Invite User'}</span>
        </Button>
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-semibold text-center flex items-center justify-center gap-2 max-w-xl animate-in fade-in duration-300">
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-455 rounded-2xl text-xs font-semibold text-center flex items-center justify-center gap-2 max-w-xl animate-in fade-in duration-300">
          <ShieldAlert size={16} />
          {error}
        </div>
      )}

      {showAddForm ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 p-6 sm:p-8 max-w-lg shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <h2 className="text-base font-bold text-slate-850 dark:text-white mb-4">Send New Invitation Pass</h2>
          <form onSubmit={handleSendInvitation} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                placeholder="candidate@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number (Optional)</label>
              <input
                type="tel"
                placeholder="+8801XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Assigned User Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-950 text-slate-800 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
              >
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
                <option value="parent">Parent</option>
                <option value="staff">Office Staff</option>
                <option value="admin">School Admin</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-5 shadow-sm transition-all flex items-center gap-1.5"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <span>Generate Invite Link</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-xl px-5"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Filters Panel */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-3 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search invites by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs font-semibold"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="text-slate-400" size={16} />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs font-semibold w-full sm:w-40"
              >
                <option value="all">All Roles</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
                <option value="parent">Parent</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Table Directory */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
              <Loader2 size={32} className="animate-spin text-blue-500" />
              <p className="text-sm font-semibold">Loading active invitation lists...</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl overflow-x-auto shadow-sm">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-850">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Candidate Email</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Role</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Pass token</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Expires At</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {filteredInvitations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-455 dark:text-slate-500 text-sm font-semibold">
                        No invitations match the search query.
                      </td>
                    </tr>
                  ) : (
                    filteredInvitations.map((invite) => (
                      <tr key={invite._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all duration-155">
                        <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-slate-200">
                          {invite.email}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-500">
                          {invite.phone || '—'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="capitalize text-xs font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                            {invite.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400 font-mono font-medium max-w-[120px] truncate" title={invite.token}>
                          {invite.token}
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                          {new Date(invite.expiresAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase ${
                            invite.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                              : invite.status === 'accepted'
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                          }`}>
                            {invite.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleDeleteInvitation(invite._id, invite.email)}
                            className="text-rose-600 dark:text-rose-500 hover:text-rose-800"
                            title="Cancel Invite"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
