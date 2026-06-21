'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Calendar, Plus, Archive, ShieldAlert, CheckCircle2, AlertCircle, RefreshCw, Trash2, Edit2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SessionsPage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Form States
  const [newSessionName, setNewSessionName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editingSession, setEditingSession] = useState<any | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = user && ['super_admin', 'admin', 'owner'].includes(user.role);

  useEffect(() => {
    if (token) {
      fetchSessions();
    }
  }, [token]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sessions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionName) return;
    setAdding(true);
    setMsg({ type: '', text: '' });

    try {
      const url = editingSession ? `/api/sessions/${editingSession._id}` : '/api/sessions';
      const method = editingSession ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newSessionName,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
      });

      if (response.ok) {
        setNewSessionName('');
        setStartDate('');
        setEndDate('');
        setEditingSession(null);
        setMsg({ type: 'success', text: 'Session details saved successfully!' });
        fetchSessions();
      } else {
        const d = await response.json();
        setMsg({ type: 'error', text: d.message || 'Failed to save session' });
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setAdding(false);
    }
  };

  const handleEditClick = (session: any) => {
    setEditingSession(session);
    setNewSessionName(session.name);
    setStartDate(session.startDate ? session.startDate.split('T')[0] : '');
    setEndDate(session.endDate ? session.endDate.split('T')[0] : '');
  };

  const handleActivateSession = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to activate the academic session "${name}"? All other sessions will be deactivated.`)) return;
    setMsg({ type: '', text: '' });

    try {
      const response = await fetch(`/api/sessions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'active' }),
      });

      if (response.ok) {
        setMsg({ type: 'success', text: `Session "${name}" is now the active academic calendar.` });
        fetchSessions();
      } else {
        const d = await response.json();
        setMsg({ type: 'error', text: d.message || 'Failed to activate session' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Connection failed' });
    }
  };

  const handleDeleteSession = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete academic session "${name}"?`)) return;
    setMsg({ type: '', text: '' });

    try {
      const response = await fetch(`/api/sessions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setMsg({ type: 'success', text: 'Session deleted successfully.' });
        fetchSessions();
      } else {
        const d = await response.json();
        setMsg({ type: 'error', text: d.message || 'Failed to delete session' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Connection failed' });
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <ShieldAlert size={48} className="text-rose-500" />
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">Access Denied</h1>
        <p className="text-sm text-slate-500">Only school administrators can configure academic sessions.</p>
      </div>
    );
  }

  const filteredSessions = sessions.filter((s) => {
    return s.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Calendar className="text-indigo-650" size={28} />
            <span>Academic Sessions</span>
          </h1>
          <p className="text-slate-550 dark:text-slate-400 mt-1 text-sm">Create and activate academic calendars and promote student registers.</p>
        </div>
      </div>

      {msg.text && (
        <div className={`p-4 rounded-xl border ${msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-rose-500/10 border-rose-500/20 text-rose-600'} text-xs font-semibold`}>
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Session Form */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4 h-fit">
          <h3 className="font-bold text-slate-850 dark:text-white text-base border-b pb-2">
            {editingSession ? 'Edit Session' : 'Add New Session'}
          </h3>
          <form onSubmit={handleCreateSession} className="space-y-4 text-xs font-bold">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Session Name</label>
              <input
                type="text"
                placeholder="e.g., 2026-2027"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-250 dark:border-slate-800 dark:bg-slate-950 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-250 dark:border-slate-800 dark:bg-slate-950 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-250 dark:border-slate-800 dark:bg-slate-950 rounded-xl outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={adding}
                className="flex-1 bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm text-xs"
              >
                <span>{adding ? 'Saving...' : 'Save Session'}</span>
              </Button>
              {editingSession && (
                <Button
                  type="button"
                  onClick={() => {
                    setEditingSession(null);
                    setNewSessionName('');
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-xl px-4 py-2 text-xs"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Sessions list */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b pb-4">
            <h3 className="font-bold text-slate-850 dark:text-white text-base">Configured Sessions</h3>
            <input
              type="text"
              placeholder="Search session names..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none text-xs font-semibold w-full sm:w-48"
            />
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400 font-semibold flex items-center justify-center gap-2">
              <RefreshCw className="animate-spin" size={16} /> Computing session logs...
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-semibold">No academic sessions found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-850">
                  <tr>
                    <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Session Name</th>
                    <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Timeline</th>
                    <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                    <th className="px-6 py-3 text-center font-bold text-slate-500 uppercase tracking-wider text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {filteredSessions.map((sess) => (
                    <tr key={sess._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all duration-150">
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{sess.name}</td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                        {sess.startDate ? new Date(sess.startDate).toLocaleDateString() : '—'} to{' '}
                        {sess.endDate ? new Date(sess.endDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${sess.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-slate-100 text-slate-550'}`}>
                          {sess.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-3.5">
                          {sess.status !== 'active' && (
                            <button
                              onClick={() => handleActivateSession(sess._id, sess.name)}
                              className="text-emerald-600 hover:text-emerald-800"
                              title="Activate Session"
                            >
                              <Play size={15} />
                            </button>
                          )}
                          <button
                            onClick={() => handleEditClick(sess)}
                            className="text-amber-605 dark:text-amber-500 hover:text-amber-800"
                            title="Edit Session"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteSession(sess._id, sess.name)}
                            className="text-rose-600 dark:text-rose-500 hover:text-rose-800"
                            title="Delete Session"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
