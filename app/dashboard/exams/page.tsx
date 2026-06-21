'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function ExamsPage() {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/exams', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setExams(data.exams || []);
      }
    } catch (error) {
      console.error('Failed to fetch exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;

    try {
      const response = await fetch(`/api/exams/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setExams(exams.filter((ex) => ex._id !== id));
      }
    } catch (error) {
      console.error('Failed to delete exam:', error);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 flex items-center space-x-2">
            <BookOpen className="text-indigo-600" size={28} />
            <span>Exams List</span>
          </h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">Manage scheduled exams and academic terms</p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => router.push('/dashboard/exams/results')}
            className="flex items-center space-x-2 bg-slate-150 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-350 dark:hover:bg-slate-700 rounded-xl px-4 font-bold border border-slate-250/20"
          >
            <BookOpen size={16} />
            <span>Exam Results</span>
          </Button>
          <Button
            onClick={() => router.push('/dashboard/exams/add')}
            className="flex items-center space-x-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl px-5 font-bold shadow-md shadow-indigo-600/10"
          >
            <Plus size={20} className="mr-1" />
            <span>Add Exam</span>
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-slate-500 font-medium">Loading scheduled exams...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-850">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-right font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Total Marks</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {exams.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">No exams scheduled</td>
                  </tr>
                ) : (
                  exams.map((exam) => (
                    <tr key={exam._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all duration-150">
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{exam.name}</td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">Class {exam.class}</td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{exam.subject}</td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">
                        {new Date(exam.date).toLocaleDateString()} at {new Date(exam.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-800 dark:text-slate-200 font-extrabold">{exam.totalMarks}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                            exam.status === 'scheduled'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-955/20 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30'
                              : exam.status === 'ongoing'
                                ? 'bg-yellow-50 text-yellow-700 dark:bg-amber-955/20 dark:text-amber-400 border border-yellow-100 dark:border-amber-900/30'
                                : 'bg-green-50 text-green-700 dark:bg-green-955/20 dark:text-green-400 border border-green-100 dark:border-green-900/30'
                          }`}
                        >
                          {exam.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex space-x-3.5">
                        <button
                          onClick={() => router.push(`/dashboard/exams/add?edit=${exam._id}`)}
                          className="text-yellow-600 dark:text-amber-500 hover:text-yellow-800"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteExam(exam._id)}
                          className="text-red-650 dark:text-rose-500 hover:text-red-800"
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
    </div>
  );
}
