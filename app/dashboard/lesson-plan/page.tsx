'use client';

import { useState, useEffect } from 'react';
import { ClipboardList, Plus, Star, CheckCircle, RefreshCw, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store';

export default function LessonPlanPage() {
  const { token } = useAuthStore();
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [className, setClassName] = useState('8');
  const [subject, setSubject] = useState('Mathematics');
  const [topic, setTopic] = useState('');
  const [status, setStatus] = useState('pending');
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/lesson-plan', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setLessons(data.lessons || []);
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to fetch lesson plan topics');
      }
    } catch (err) {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !subject) return;
    setError('');

    try {
      const response = await fetch('/api/lesson-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          class: `Class ${className}`,
          subject,
          topic,
          status,
          completion: status === 'completed' ? 100 : status === 'pending' ? 0 : completion
        })
      });

      if (response.ok) {
        setTopic('');
        setCompletion(0);
        fetchLessons();
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to record curriculum topic');
      }
    } catch (err) {
      setError('Failed to connect to server');
    }
  };

  const handleUpdateStatus = async (id: string, newStat: string) => {
    setError('');
    const target = lessons.find((l) => l._id === id);
    if (!target) return;

    const newComp = newStat === 'completed' ? 100 : newStat === 'pending' ? 0 : target.completion === 100 ? 50 : target.completion;

    try {
      const response = await fetch(`/api/lesson-plan?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStat,
          completion: newComp
        })
      });

      if (response.ok) {
        fetchLessons();
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to update topic status');
      }
    } catch (err) {
      setError('Failed to connect to server');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this curriculum topic?')) return;
    setError('');

    try {
      const response = await fetch(`/api/lesson-plan?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        fetchLessons();
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to remove topic');
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
            <ClipboardList className="text-indigo-650" size={28} />
            <span>Lesson Plan & Syllabus Status</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Organize academic curricula chapters, monitor progress bars, and teacher topics coverage.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Setup form */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4 h-fit">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base border-b pb-2">Add Curriculum Topic</h3>
          
          <form onSubmit={handleCreateLesson} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Class</label>
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-250 dark:border-slate-850 dark:bg-slate-950 rounded-xl outline-none"
              >
                {['6', '7', '8', '9', '10'].map((c) => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Subject</label>
              <input
                type="text"
                placeholder="e.g., Mathematics"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-slate-250 dark:border-slate-850 dark:bg-slate-955 rounded-xl outline-none text-slate-800 dark:text-slate-200"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Topic Name / Lesson Chapter</label>
              <input
                type="text"
                placeholder="e.g., Chapter 2: Cell Roster"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 border border-slate-250 dark:border-slate-850 dark:bg-slate-955 rounded-xl outline-none text-slate-800 dark:text-slate-200"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Coverage Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-250 dark:border-slate-850 dark:bg-slate-955 rounded-xl outline-none text-slate-800 dark:text-slate-200"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Progress Completion %</label>
                <input
                  type="number"
                  value={completion}
                  onChange={(e) => setCompletion(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full px-3 py-2 border border-slate-250 dark:border-slate-850 dark:bg-slate-955 rounded-xl outline-none text-slate-800 dark:text-slate-200"
                  min="0"
                  max="100"
                  disabled={status !== 'in_progress'}
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl cursor-pointer">
              <Plus size={16} />
              <span>Record Lesson Plan</span>
            </Button>
          </form>
        </div>

        {/* Display Status Progress Tracker */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm overflow-hidden">
          <h3 className="font-bold text-slate-850 dark:text-slate-200 text-base border-b pb-2 mb-4">Syllabus Progress Tracker</h3>

          <div className="space-y-4">
            {lessons.length === 0 ? (
              <div className="text-center py-12 text-slate-400">No lessons planned.</div>
            ) : (
              lessons.map((les) => (
                <div key={les.id} className="p-4 border dark:border-slate-850 rounded-2xl bg-slate-50/50 dark:bg-slate-955/20 flex flex-col gap-3 group">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded-lg uppercase">{les.className}</span>
                      <h4 className="font-extrabold text-sm text-slate-850 dark:text-slate-200 mt-1">{les.topic}</h4>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold">Subject: {les.subject}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={les.status}
                        onChange={(e) => handleUpdateStatus(les.id, e.target.value)}
                        className="text-xs px-2.5 py-1 border rounded-lg bg-white dark:bg-slate-950 font-semibold"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                      <button onClick={() => handleDelete(les.id)} className="text-slate-400 hover:text-rose-600 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>PROGRESS</span>
                      <span>{les.completion}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          les.status === 'completed' ? 'bg-emerald-500' : les.status === 'in_progress' ? 'bg-indigo-650' : 'bg-slate-300'
                        }`}
                        style={{ width: `${les.completion}%` }}
                      />
                    </div>
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
