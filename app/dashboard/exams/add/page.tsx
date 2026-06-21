'use client';

import { useEffect, useState, Suspense } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

function ExamFormContent() {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingExamId = searchParams.get('edit');

  const [sections, setSections] = useState<any[]>([]);
  const [subjectGroups, setSubjectGroups] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    class: '',
    subject: '',
    date: '',
    totalMarks: '',
    passingMarks: '',
    duration: '',
    status: 'scheduled',
  });

  useEffect(() => {
    fetchAcademics();
  }, []);

  useEffect(() => {
    if (editingExamId && token) {
      fetch(`/api/exams/${editingExamId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        const exam = data.exam;
        if (exam) {
          let formattedDate = '';
          if (exam.date) {
            const d = new Date(exam.date);
            const offset = d.getTimezoneOffset() * 60000;
            const localISOTime = new Date(d.getTime() - offset).toISOString().slice(0, 16);
            formattedDate = localISOTime;
          }

          setFormData({
            name: exam.name || '',
            class: exam.class || '',
            subject: exam.subject || '',
            date: formattedDate,
            totalMarks: exam.totalMarks?.toString() || '',
            passingMarks: exam.passingMarks?.toString() || '',
            duration: exam.duration?.toString() || '',
            status: exam.status || 'scheduled',
          });
        }
      })
      .catch(err => console.error('Failed to load exam details:', err));
    }
  }, [editingExamId, token]);

  const fetchAcademics = async () => {
    try {
      const resSec = await fetch('/api/sections', { headers: { Authorization: `Bearer ${token}` } });
      const resSub = await fetch('/api/subject-groups', { headers: { Authorization: `Bearer ${token}` } });
      if (resSec.ok) {
        const dataSec = await resSec.json();
        setSections(dataSec.sections || []);
      }
      if (resSub.ok) {
        const dataSub = await resSub.json();
        setSubjectGroups(dataSub.subjectGroups || []);
      }
    } catch (err) {
      console.error('Failed to fetch academics details:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      ...formData,
      totalMarks: parseInt(formData.totalMarks) || 0,
      passingMarks: parseInt(formData.passingMarks) || 0,
      duration: parseInt(formData.duration) || 0,
      date: new Date(formData.date),
    };

    try {
      let response;
      if (editingExamId) {
        response = await fetch(`/api/exams/${editingExamId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('/api/exams', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        router.push('/dashboard/exams');
      } else {
        alert('Failed to save exam details');
      }
    } catch (error) {
      console.error('Failed to save exam:', error);
      alert('Network request failed');
    } finally {
      setSubmitting(false);
    }
  };

  const classesList = Array.from(
    new Set([
      ...sections.map((s) => s.class),
      ...subjectGroups.map((sg) => sg.class),
    ])
  ).filter(Boolean).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ''), 10);
    const numB = parseInt(b.replace(/\D/g, ''), 10);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b);
  });

  const getSubjectsForClass = (className: string) => {
    if (!className) return [];
    const allSubjectsForClass = subjectGroups
      .filter((sg) => sg.class === className)
      .flatMap((sg) => sg.subjects || []);
    return Array.from(new Set(allSubjectsForClass)).sort();
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <BookOpen className="text-indigo-600" size={28} />
            <span>{editingExamId ? 'Edit Exam Details' : 'Add New Exam'}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            {editingExamId ? 'Update dates, passing marks thresholds, and exam statuses' : 'Schedule a new exam block for classes and subjects'}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/60 dark:border-slate-800/80 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            {editingExamId ? 'Update Exam Record' : 'Create Exam Registry'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Exam Name</label>
              <input
                type="text"
                placeholder="Exam Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 text-slate-800 dark:bg-slate-955 dark:border-slate-800 dark:text-white rounded-xl text-sm focus:outline-none font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target Class</label>
              <select
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value, subject: '' })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 text-slate-800 dark:bg-slate-955 dark:border-slate-800 dark:text-white rounded-xl text-sm focus:outline-none font-semibold"
                required
              >
                <option value="">Select Class</option>
                {classesList.map((c: string) => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Exam Subject</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 text-slate-800 dark:bg-slate-955 dark:border-slate-800 dark:text-white rounded-xl text-sm focus:outline-none font-semibold disabled:opacity-50"
                disabled={!formData.class}
                required
              >
                <option value="">Select Subject</option>
                {getSubjectsForClass(formData.class).map((s: string) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date & Time</label>
              <input
                type="datetime-local"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 text-slate-800 dark:bg-slate-955 dark:border-slate-800 dark:text-white rounded-xl text-sm focus:outline-none font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Marks</label>
              <input
                type="number"
                placeholder="Total Marks"
                value={formData.totalMarks}
                onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 text-slate-800 dark:bg-slate-955 dark:border-slate-800 dark:text-white rounded-xl text-sm focus:outline-none font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Passing Marks</label>
              <input
                type="number"
                placeholder="Passing Marks"
                value={formData.passingMarks}
                onChange={(e) => setFormData({ ...formData, passingMarks: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 text-slate-800 dark:bg-slate-955 dark:border-slate-800 dark:text-white rounded-xl text-sm focus:outline-none font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Duration (minutes)</label>
              <input
                type="number"
                placeholder="Duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 text-slate-800 dark:bg-slate-955 dark:border-slate-800 dark:text-white rounded-xl text-sm focus:outline-none font-semibold"
              />
            </div>
            {editingExamId && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Exam Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 text-slate-800 dark:bg-slate-955 dark:border-slate-800 dark:text-white rounded-xl text-sm focus:outline-none font-semibold"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-xl"
            >
              {editingExamId ? 'Save Changes' : 'Create Exam'}
            </Button>
            <Button
              type="button"
              onClick={() => router.push('/dashboard/exams')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-xl px-6 py-2.5"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AddExamPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-slate-500">Loading form...</div>}>
      <ExamFormContent />
    </Suspense>
  );
}
