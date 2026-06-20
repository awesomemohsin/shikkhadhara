'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ExamsPage() {
  const token = useAuthStore((state) => state.token);
  const [exams, setExams] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'exams' | 'results'>('exams');
  const [showForm, setShowForm] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
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

  const [sections, setSections] = useState<any[]>([]);
  const [subjectGroups, setSubjectGroups] = useState<any[]>([]);

  useEffect(() => {
    fetchExams();
    fetchResults();
    fetchAcademics();
  }, []);

  const fetchExams = async () => {
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

  const fetchResults = async () => {
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
    }
  };

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
      console.error('Failed to fetch academics details:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      totalMarks: parseInt(formData.totalMarks) || 0,
      passingMarks: parseInt(formData.passingMarks) || 0,
      duration: parseInt(formData.duration) || 0,
      date: new Date(formData.date),
    };

    try {
      if (editingExamId) {
        // Edit exam
        const response = await fetch(`/api/exams/${editingExamId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const data = await response.json();
          setExams(exams.map((ex) => (ex._id === editingExamId ? data.exam : ex)));
          resetForm();
        }
      } else {
        // Add exam
        const response = await fetch('/api/exams', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const data = await response.json();
          setExams([...exams, data.exam]);
          resetForm();
        }
      }
    } catch (error) {
      console.error('Failed to save exam:', error);
    }
  };

  const handleEditClick = (exam: any) => {
    setEditingExamId(exam._id);
    
    // Format date string for datetime-local input
    let formattedDate = '';
    if (exam.date) {
      const d = new Date(exam.date);
      // Adjust timezone offset to local time format: YYYY-MM-DDTHH:MM
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
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      class: '',
      subject: '',
      date: '',
      totalMarks: '',
      passingMarks: '',
      duration: '',
      status: 'scheduled',
    });
    setEditingExamId(null);
    setShowForm(false);
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
    // Collect subjects from ALL groups for this class (e.g., Science + Commerce + Arts for Class 9–12)
    const allSubjectsForClass = subjectGroups
      .filter((sg) => sg.class === className)
      .flatMap((sg) => sg.subjects || []);
    return Array.from(new Set(allSubjectsForClass)).sort();
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Exams & Results</h1>
        <p className="text-gray-600 dark:text-slate-400 mt-1">Manage exams and track student performance</p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow border border-border/40">
        <div className="flex border-b border-gray-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('exams')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'exams'
                ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400'
                : 'text-gray-600 dark:text-slate-400'
            }`}
          >
            Exams
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'results'
                ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400'
                : 'text-gray-600 dark:text-slate-400'
            }`}
          >
            Results
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'exams' && (
            <div className="space-y-4">
              <Button
                onClick={() => {
                  if (showForm) resetForm();
                  else setShowForm(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus size={20} className="mr-2" />
                {showForm ? 'View List' : 'Add Exam'}
              </Button>

              {showForm && (
                <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-slate-950 p-4 rounded-xl space-y-4 border border-border/30">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {editingExamId ? 'Edit Exam Details' : 'Add New Exam'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Exam Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                    <select
                      value={formData.class}
                      onChange={(e) => setFormData({ ...formData, class: e.target.value, subject: '' })}
                      className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-slate-800"
                      required
                    >
                      <option value="">Select Class</option>
                      {classesList.map((c: string) => (
                        <option key={c} value={c}>Class {c}</option>
                      ))}
                    </select>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-slate-800"
                      disabled={!formData.class}
                      required
                    >
                      <option value="">Select Subject</option>
                      {getSubjectsForClass(formData.class).map((s: string) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <input
                      type="datetime-local"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Total Marks"
                      value={formData.totalMarks}
                      onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Passing Marks"
                      value={formData.passingMarks}
                      onChange={(e) => setFormData({ ...formData, passingMarks: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Duration (minutes)"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    {editingExamId && (
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                      </select>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {editingExamId ? 'Save Changes' : 'Create Exam'}
                    </Button>
                    <Button
                      type="button"
                      onClick={resetForm}
                      className="bg-gray-400 hover:bg-gray-500 text-white"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {loading ? (
                <div className="text-center py-12 text-slate-500">Loading exams...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-slate-800 border-b border-border/30">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-500 dark:text-slate-400 uppercase">Name</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-500 dark:text-slate-400 uppercase">Class</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-500 dark:text-slate-400 uppercase">Subject</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-500 dark:text-slate-400 uppercase">Date</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-500 dark:text-slate-400 uppercase">Total Marks</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-500 dark:text-slate-400 uppercase">Status</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-500 dark:text-slate-400 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {exams.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-4 text-center text-slate-500">No exams scheduled</td>
                        </tr>
                      ) : (
                        exams.map((exam) => (
                          <tr key={exam._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/20">
                            <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{exam.name}</td>
                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300">Class {exam.class}</td>
                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{exam.subject}</td>
                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                              {new Date(exam.date).toLocaleDateString()} at {new Date(exam.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="px-4 py-3 text-right text-slate-800 dark:text-slate-200 font-bold">{exam.totalMarks}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  exam.status === 'scheduled'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400'
                                    : exam.status === 'ongoing'
                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-amber-950/20 dark:text-amber-400'
                                      : 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400'
                                }`}
                              >
                                {exam.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 flex space-x-2.5">
                              <button onClick={() => handleEditClick(exam)} className="text-yellow-600 dark:text-amber-500 hover:text-yellow-800 dark:hover:text-amber-450">
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => handleDeleteExam(exam._id)} className="text-red-600 dark:text-rose-500 hover:text-red-800 dark:hover:text-rose-450">
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

          {activeTab === 'results' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-slate-800 border-b border-border/30">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-500 dark:text-slate-400 uppercase">Student</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-500 dark:text-slate-400 uppercase">Exam</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-500 dark:text-slate-400 uppercase">Subject</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-500 dark:text-slate-400 uppercase">Marks</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-500 dark:text-slate-400 uppercase">Percentage</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-500 dark:text-slate-400 uppercase">Grade</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-500 dark:text-slate-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {results.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-4 text-center text-slate-500">No results recorded yet</td>
                    </tr>
                  ) : (
                    results.map((result) => (
                      <tr key={result._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/20">
                        <td className="px-4 py-3 font-medium text-slate-850 dark:text-slate-200">
                          {result.studentId?.firstName} {result.studentId?.lastName}
                        </td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{result.examId?.name}</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{result.examId?.subject}</td>
                        <td className="px-4 py-3 text-right text-slate-800 dark:text-slate-200 font-bold">{result.marksObtained}</td>
                        <td className="px-4 py-3 text-right text-slate-800 dark:text-slate-200">
                          {result.percentage?.toFixed(1)}%
                        </td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-semibold">{result.grade}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              result.status === 'pass'
                                ? 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-rose-950/20 dark:text-rose-400'
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
    </div>
  );
}
