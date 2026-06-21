'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { HelpCircle, Plus, Trash2, CheckCircle2, AlertCircle, Loader2, Search, Filter, MessageSquare, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SupportPage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form toggles & states
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    category: 'Technical',
    priority: 'medium',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');

  const isAdmin = user && ['super_admin', 'admin', 'owner'].includes(user.role);

  useEffect(() => {
    fetchTickets();
  }, [token]);

  const fetchTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/support', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to fetch tickets');
      }
    } catch (err) {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.message) {
      setError('Subject and message description are required');
      return;
    }
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess('Support ticket filed successfully! Our engineers will review it.');
        setShowForm(false);
        setFormData({ subject: '', message: '', category: 'Technical', priority: 'medium' });
        fetchTickets();
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to file ticket');
      }
    } catch (err) {
      setError('Connection failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveTicket = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'open' ? 'closed' : 'open';
    try {
      const response = await fetch(`/api/support/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (response.ok) {
        setSuccess(`Ticket status updated to ${nextStatus}.`);
        fetchTickets();
      }
    } catch (err) {
      setError('Failed to update ticket');
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;

    try {
      const response = await fetch(`/api/support/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setSuccess('Ticket removed successfully.');
        fetchTickets();
      }
    } catch (err) {
      setError('Failed to delete ticket');
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'all' || t.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <HelpCircle className="text-indigo-650" size={28} />
            <span>Support Helpdesk</span>
          </h1>
          <p className="text-slate-550 dark:text-slate-400 mt-1 text-sm">File inquiry tickets, view engineering resolution, and get platform support.</p>
        </div>

        <Button
          onClick={() => {
            setShowForm(!showForm);
            setError('');
            setSuccess('');
          }}
          className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl px-5 shadow-sm text-xs"
        >
          <Plus size={16} className="mr-1" />
          <span>{showForm ? 'View Tickets' : 'New Ticket'}</span>
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
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {showForm ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 p-6 sm:p-8 max-w-xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <h2 className="text-base font-bold text-slate-850 dark:text-white mb-4">File a Support Inquiry Ticket</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Subject / Headline</label>
              <input
                type="text"
                placeholder="e.g. Invoicing error in class 5 fees calculation"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-sm focus:outline-none"
                >
                  <option value="Technical">Technical Glitch</option>
                  <option value="Billing">Billing & Plan</option>
                  <option value="Academic">Academic Module Setup</option>
                  <option value="General">General Question</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Priority Tier</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-sm focus:outline-none"
                >
                  <option value="low">Low - Routine inquiry</option>
                  <option value="medium">Medium - Normal operational issues</option>
                  <option value="high">High - Critical workflow blocker</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Description / Message</label>
              <textarea
                placeholder="Please describe what error occurred, steps to reproduce, or details of your request."
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-250 dark:border-slate-800 dark:bg-slate-955 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl font-bold px-6 shadow-sm transition-all"
              >
                {submitting ? 'Submitting Ticket...' : 'File Ticket'}
              </Button>
              <Button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-355 rounded-xl px-5"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Search Panel */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-3 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search ticket subjects, descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-semibold"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="text-slate-400" size={16} />
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-semibold w-full sm:w-40"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
              <Loader2 size={32} className="animate-spin text-indigo-500" />
              <p className="text-sm font-semibold">Fetching ticket history...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400">
              <MessageSquare className="mx-auto mb-4 text-slate-300" size={48} />
              <p className="text-sm">No support tickets filed in this registry.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTickets.map((ticket) => (
                <div key={ticket._id} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl shadow-sm p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded border mr-2 ${
                        ticket.priority === 'high' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                        ticket.priority === 'medium' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 
                        'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {ticket.priority}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">{ticket.category}</span>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-2">{ticket.subject}</h3>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      ticket.status === 'open' ? 'bg-blue-500/10 text-blue-600' : 'bg-emerald-500/10 text-emerald-600'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-semibold leading-relaxed line-clamp-3">
                    {ticket.message}
                  </p>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-805 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-bold">
                      Filed by: {ticket.userEmail}
                    </span>
                    <div className="flex items-center gap-2 text-xs">
                      {isAdmin && (
                        <button
                          onClick={() => handleResolveTicket(ticket._id, ticket.status)}
                          className="text-blue-600 hover:underline font-bold text-xs"
                        >
                          {ticket.status === 'open' ? 'Close Ticket' : 'Reopen'}
                        </button>
                      )}
                      {(isAdmin || ticket.userEmail === user?.email) && (
                        <button
                          onClick={() => handleDeleteTicket(ticket._id)}
                          className="text-rose-600 hover:text-rose-800"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
