'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Info, Bell, Trash2, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store';

export default function AnnualCalendarPage() {
  const { token, user } = useAuthStore();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [type, setType] = useState('event');
  const [desc, setDesc] = useState('');

  const isAdmin = user && ['super_admin', 'admin', 'owner'].includes(user.role);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/calendar', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to fetch calendar events');
      }
    } catch (err) {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;
    setError('');

    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          type,
          date,
          endDate: endDate || date,
          desc
        })
      });

      if (response.ok) {
        setTitle('');
        setDate('');
        setEndDate('');
        setDesc('');
        fetchEvents();
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to add event');
      }
    } catch (err) {
      setError('Failed to connect to server');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to remove this scheduled event?')) return;
    setError('');

    try {
      const response = await fetch(`/api/calendar?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        fetchEvents();
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to delete event');
      }
    } catch (err) {
      setError('Failed to connect to server');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <CalendarIcon className="text-indigo-600" size={28} />
            <span>Annual Calendar & Events</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Schedule holidays, academic deadlines, term examinations, and notices.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-3 max-w-xl">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-slate-400 font-medium">Loading academic calendar...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form - Only show to admin roles */}
          {isAdmin && (
            <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4 h-fit">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base border-b pb-2">Schedule Academic Event</h3>
              <form onSubmit={handleAddEvent} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Event Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Independence Day"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-205 dark:border-slate-850 dark:bg-slate-955 rounded-xl outline-none text-slate-800 dark:text-slate-200"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Start Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-205 dark:border-slate-850 dark:bg-slate-955 rounded-xl outline-none text-slate-805 dark:text-slate-202"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">End Date (Opt)</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-205 dark:border-slate-850 dark:bg-slate-955 rounded-xl outline-none text-slate-805 dark:text-slate-202"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Event Classification</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-205 dark:border-slate-850 dark:bg-slate-955 rounded-xl outline-none text-slate-805 dark:text-slate-202"
                  >
                    <option value="event">Institutional Event</option>
                    <option value="holiday">Official Holiday</option>
                    <option value="exam">Examination Schedule</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    placeholder="Details..."
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-205 dark:border-slate-850 dark:bg-slate-955 rounded-xl outline-none h-16 text-slate-800 dark:text-slate-200"
                  />
                </div>

                <Button type="submit" className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl cursor-pointer">
                  <Plus size={16} />
                  <span>Schedule Event</span>
                </Button>
              </form>
            </div>
          )}

          {/* Display List */}
          <div className={`${isAdmin ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm overflow-hidden`}>
            <h3 className="font-bold text-slate-850 dark:text-slate-200 text-base border-b pb-2 mb-4">Scheduled Events Timeline</h3>
            
            <div className="space-y-4">
              {events.length === 0 ? (
                <div className="text-center py-12 text-slate-400">No events scheduled. Academic calendar is clear.</div>
              ) : (
                events.map((ev) => (
                  <div key={ev._id} className="flex items-start gap-4 p-4 border border-slate-100 dark:border-slate-850 rounded-2xl bg-slate-50/50 dark:bg-slate-955/20 group animate-in fade-in duration-200">
                    <div className={`p-3 rounded-xl uppercase font-bold text-xs shrink-0 text-center w-16 ${
                      ev.type === 'holiday' ? 'bg-rose-500/10 text-rose-500' : ev.type === 'exam' ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-500/10 text-indigo-500'
                    }`}>
                      <span>{new Date(ev.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">{ev.title}</h4>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteEvent(ev._id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Remove Event"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-450 dark:text-slate-505 font-semibold mt-1">
                        Type: <span className="capitalize">{ev.type}</span> | Timeline: {ev.date} {ev.endDate !== ev.date ? `to ${ev.endDate}` : ''}
                      </p>
                      {ev.desc && <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium leading-relaxed">{ev.desc}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
