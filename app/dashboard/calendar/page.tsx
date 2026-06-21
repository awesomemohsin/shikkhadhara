'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, Plus, Info, Bell, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AnnualCalendarPage() {
  const [events, setEvents] = useState<any[]>([
    { id: '1', title: 'Summer Vacation Break', type: 'holiday', date: '2026-07-01', endDate: '2026-07-15', desc: 'Summer institutional break' },
    { id: '2', title: 'Mid-Term Exam Evaluation', type: 'exam', date: '2026-08-10', endDate: '2026-08-20', desc: 'Formal assessments' },
    { id: '3', title: 'Annual Cultural Festival', type: 'event', date: '2026-09-05', endDate: '2026-09-05', desc: 'Co-curricular sports and awards' }
  ]);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [type, setType] = useState('event');
  const [desc, setDesc] = useState('');

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;

    const newEvent = {
      id: Date.now().toString(),
      title,
      type,
      date,
      endDate: endDate || date,
      desc
    };

    setEvents([...events, newEvent].sort((a, b) => a.date.localeCompare(b.date)));
    setTitle('');
    setDate('');
    setEndDate('');
    setDesc('');
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter((ev) => ev.id !== id));
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
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
                className="w-full px-3 py-2 border border-slate-205 dark:border-slate-850 dark:bg-slate-950 rounded-xl outline-none text-slate-800 dark:text-slate-200"
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
                  className="w-full px-3 py-2 border border-slate-205 dark:border-slate-850 dark:bg-slate-950 rounded-xl outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">End Date (Opt)</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-205 dark:border-slate-850 dark:bg-slate-955 rounded-xl outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Event Classification</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-205 dark:border-slate-850 dark:bg-slate-955 rounded-xl outline-none text-slate-800 dark:text-slate-200"
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

        {/* Display List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm overflow-hidden">
          <h3 className="font-bold text-slate-850 dark:text-slate-200 text-base border-b pb-2 mb-4">Scheduled Events Timeline</h3>
          
          <div className="space-y-4">
            {events.length === 0 ? (
              <div className="text-center py-12 text-slate-400">No events scheduled. Academic calendar is clear.</div>
            ) : (
              events.map((ev) => (
                <div key={ev.id} className="flex items-start gap-4 p-4 border border-slate-100 dark:border-slate-850 rounded-2xl bg-slate-50/50 dark:bg-slate-955/20 group">
                  <div className={`p-3 rounded-xl uppercase font-bold text-xs shrink-0 text-center w-16 ${
                    ev.type === 'holiday' ? 'bg-rose-500/10 text-rose-500' : ev.type === 'exam' ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-500/10 text-indigo-500'
                  }`}>
                    <span>{new Date(ev.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                  </div>

                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">{ev.title}</h4>
                      <button
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove Event"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-slate-450 dark:text-slate-500 font-semibold mt-1">
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
    </div>
  );
}
