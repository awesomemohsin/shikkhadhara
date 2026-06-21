'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ExamResultsPage() {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/exam-results', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      }
    } catch (error) {
      console.error('Failed to fetch results:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <BookOpen className="text-indigo-600" size={28} />
            <span>Student Exam Results</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">View student performances and recorded marks details</p>
        </div>

        <div>
          <Button
            onClick={() => router.push('/dashboard/exams')}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border"
          >
            <ArrowLeft size={14} />
            <span>Back to Exams</span>
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading results...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-850">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Exam</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Marks</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Percentage</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Grade</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">No results recorded yet</td>
                  </tr>
                ) : (
                  results.map((result) => (
                    <tr key={result._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all duration-150">
                      <td className="px-6 py-4 font-medium text-slate-850 dark:text-slate-200">
                        {result.studentId?.firstName} {result.studentId?.lastName}
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-350 font-medium">{result.examId?.name}</td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-350 font-semibold">{result.examId?.subject}</td>
                      <td className="px-6 py-4 text-right text-slate-800 dark:text-slate-200 font-bold">{result.marksObtained}</td>
                      <td className="px-6 py-4 text-right text-slate-805 dark:text-slate-200 font-semibold">
                        {result.percentage?.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-bold text-center sm:text-left">{result.grade}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            result.status === 'pass'
                              ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-100 dark:border-green-900/30'
                              : 'bg-red-50 text-red-700 dark:bg-rose-950/20 dark:text-rose-400 border border-red-100 dark:border-rose-900/30'
                          }`}
                        >
                          {result.status}
                        </span>
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
