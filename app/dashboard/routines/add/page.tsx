'use client';

import { useEffect, useState, Suspense } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Calendar, Save, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function AddRoutineSlotContent() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const [sections, setSections] = useState<any[]>([]);
  const [staffs, setStaffs] = useState<any[]>([]);
  const [subjectGroups, setSubjectGroups] = useState<any[]>([]);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    class: '',
    section: '',
    subject: '',
    teacherId: '',
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '09:45',
    room: '',
  });

  useEffect(() => {
    if (token) {
      fetchAcademics();
      fetchStaffs();
    }
  }, [token]);

  const fetchAcademics = async () => {
    try {
      const resSec = await fetch('/api/sections', { headers: { Authorization: `Bearer ${token}` } });
      const resSub = await fetch('/api/subject-groups', { headers: { Authorization: `Bearer ${token}` } });
      if (resSec.ok && resSub.ok) {
        const dataSec = await resSec.json();
        const dataSub = await resSub.json();
        setSections(dataSec.sections || []);
        setSubjectGroups(dataSub.subjectGroups || []);
      }
    } catch (err) {
      console.error('Failed to fetch academic settings:', err);
    }
  };

  const fetchStaffs = async () => {
    try {
      const response = await fetch('/api/staffs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStaffs(data.teachers || []);
      }
    } catch (err) {
      console.error('Failed to fetch staff directory:', err);
    }
  };

  const handleAddRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/routines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Routine slot created successfully!');
        setTimeout(() => {
          router.push('/dashboard/routines');
        }, 1500);
      } else {
        setError(data.message || 'Failed to create routine');
      }
    } catch (err) {
      setError('Network request failed');
    } finally {
      setSubmitting(false);
    }
  };

  const getFormClassSubjects = () => {
    const subjectsForClass = subjectGroups
      .filter((sg) => sg.class === formData.class)
      .flatMap((sg) => sg.subjects || []);
    return Array.from(new Set(subjectsForClass)).sort();
  };

  const uniqueClasses = Array.from(new Set(sections.map((s) => s.class))).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ''), 10);
    const numB = parseInt(b.replace(/\D/g, ''), 10);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b);
  });

  const isAdmin = user && ['admin', 'super_admin', 'owner'].includes(user.role);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">Access Denied</h1>
        <p className="text-sm text-slate-500">Only administrators can configure timetable routine slots.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Calendar className="text-indigo-600" size={28} />
            <span>Add Timetable Routine Slot</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Schedule class subject periods and assign teaching staff</p>
        </div>

        <div>
          <Button
            onClick={() => router.push('/dashboard/routines')}
            className="bg-slate-101 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border"
          >
            <ArrowLeft size={14} />
            <span>Back to Timetable</span>
          </Button>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-sm font-semibold">
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-2 text-sm font-semibold">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleAddRoutine} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Class</label>
              <select
                value={formData.class}
                onChange={(e) => {
                  setFormData({ ...formData, class: e.target.value, section: '', subject: '' });
                }}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm font-semibold text-slate-750"
                required
              >
                <option value="">Select Class</option>
                {uniqueClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Section</label>
              <select
                value={formData.section}
                disabled={!formData.class}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm font-semibold text-slate-750 disabled:opacity-50"
                required
              >
                <option value="">Select Section</option>
                {sections
                  .filter((s) => s.class === formData.class)
                  .map((sec) => (
                    <option key={sec._id} value={sec.name}>
                      Section {sec.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Subject</label>
              <select
                value={formData.subject}
                disabled={!formData.class}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm font-semibold text-slate-750 disabled:opacity-50"
                required
              >
                <option value="">Select Subject</option>
                {getFormClassSubjects().map((sub: string) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Teacher / Staff</label>
              <select
                value={formData.teacherId}
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm font-semibold text-slate-750"
                required
              >
                <option value="">Assign Teacher</option>
                {staffs.map((staff) => (
                  <option key={staff._id} value={staff._id}>
                    {staff.firstName} {staff.lastName || ''} ({staff.position?.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Day</label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm font-semibold text-slate-750"
                required
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">End Time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm font-semibold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Room (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Room 204"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm font-semibold"
            />
          </div>

          <div className="flex space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-indigo-650 hover:bg-indigo-700 text-white flex-1 font-medium py-2.5 rounded-xl shadow-md"
            >
              {submitting ? 'Saving Slot...' : 'Save Slot'}
            </Button>
            <Button
              type="button"
              onClick={() => router.push('/dashboard/routines')}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 flex-1 font-medium py-2.5 rounded-xl border border-slate-200/50"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AddRoutineSlotPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-slate-500">Loading form...</div>}>
      <AddRoutineSlotContent />
    </Suspense>
  );
}
