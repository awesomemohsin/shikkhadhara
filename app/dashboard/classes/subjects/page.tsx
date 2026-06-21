'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { BookMarked, Trash2, Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SubjectsPage() {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();

  const [sections, setSections] = useState<any[]>([]);
  const [subjectGroups, setSubjectGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms Visibility
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  // Editing state (shows single class subject list for inline add/delete)
  const [editingClassName, setEditingClassName] = useState<string | null>(null);

  // Subject Form states (for adding new subject to any class)
  const [subjectFormData, setSubjectFormData] = useState({
    class: '',
    subject: '',
  });

  // Inline input for subject additions
  const [newSubjectName, setNewSubjectName] = useState('');

  useEffect(() => {
    if (token) {
      fetchAcademics();
    }
  }, [token]);

  const fetchAcademics = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [resSec, resSub] = await Promise.all([
        fetch('/api/sections', { headers }),
        fetch('/api/subject-groups', { headers }),
      ]);

      if (resSec.ok) {
        const data = await resSec.json();
        setSections(data.sections || []);
      }
      if (resSub.ok) {
        const data = await resSub.json();
        setSubjectGroups(data.subjectGroups || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubjectsClick = (className: string) => {
    setEditingClassName(className);
    setShowSubjectForm(true);
  };

  const resetSubjectForm = () => {
    setSubjectFormData({
      class: '',
      subject: '',
    });
    setEditingClassName(null);
    setShowSubjectForm(false);
    setNewSubjectName('');
  };

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const className = subjectFormData.class;
    const subjectName = subjectFormData.subject.trim();

    if (!className || !subjectName) return;

    const classGroup = subjectGroups.find(sg => sg.class === className);
    const subjectsList = classGroup ? [...(classGroup.subjects || []), subjectName] : [subjectName];

    try {
      let res;
      if (classGroup) {
        res = await fetch(`/api/subject-groups?id=${classGroup._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ...classGroup, subjects: subjectsList })
        });
      } else {
        res = await fetch('/api/subject-groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            class: className,
            name: 'General',
            subjects: subjectsList,
            description: `General subjects for ${className}`
          })
        });
      }

      if (res.ok) {
        resetSubjectForm();
        fetchAcademics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSubject = async () => {
    if (!newSubjectName.trim() || !editingClassName) return;
    const subject = newSubjectName.trim();
    const classGroup = subjectGroups.find(sg => sg.class === editingClassName);
    const subjectsList = classGroup ? [...(classGroup.subjects || []), subject] : [subject];

    try {
      let res;
      if (classGroup) {
        res = await fetch(`/api/subject-groups?id=${classGroup._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ...classGroup, subjects: subjectsList })
        });
      } else {
        res = await fetch('/api/subject-groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            class: editingClassName,
            name: 'General',
            subjects: subjectsList,
            description: `General subjects for ${editingClassName}`
          })
        });
      }

      if (res.ok) {
        setNewSubjectName('');
        const dataSub = await (await fetch('/api/subject-groups', { headers: { Authorization: `Bearer ${token}` } })).json();
        setSubjectGroups(dataSub.subjectGroups || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSubject = async (index: number) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    const classGroup = subjectGroups.find(sg => sg.class === editingClassName);
    if (!classGroup) return;
    const updatedSubjects = [...classGroup.subjects];
    updatedSubjects.splice(index, 1);

    try {
      const res = await fetch(`/api/subject-groups?id=${classGroup._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...classGroup, subjects: updatedSubjects })
      });
      if (res.ok) {
        const dataSub = await (await fetch('/api/subject-groups', { headers: { Authorization: `Bearer ${token}` } })).json();
        setSubjectGroups(dataSub.subjectGroups || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const classesList = Array.from(
    new Set([
      ...sections.map((s) => s.class),
      ...subjectGroups.map((sg) => sg.class),
    ])
  ).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ''), 10);
    const numB = parseInt(b.replace(/\D/g, ''), 10);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b);
  });

  const editingClassGroup = subjectGroups.find(sg => sg.class === editingClassName);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <BookMarked className="text-indigo-600" size={28} />
            <span>Manage Subjects Setup</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Configure subjects lists assigned to different class levels.</p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => router.push('/dashboard/classes')}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border"
          >
            <ArrowLeft size={14} />
            <span>Back to Classes</span>
          </Button>
          <Button
            onClick={() => {
              if (showSubjectForm) resetSubjectForm();
              else setShowSubjectForm(true);
            }}
            className="flex items-center space-x-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl px-5 font-bold shadow-md"
          >
            <Plus size={20} />
            <span>{showSubjectForm ? 'View List' : 'Add Subject'}</span>
          </Button>
        </div>
      </div>

      {showSubjectForm && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-850 dark:text-white border-b pb-3 border-slate-100 dark:border-slate-800">
            {editingClassName ? `Edit Class Subjects - ${editingClassName}` : 'Add Subject to Class'}
          </h2>
          
          <form onSubmit={handleSubjectSubmit} className="space-y-6">
            {!editingClassName ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Select Class</label>
                  <select
                    value={subjectFormData.class}
                    onChange={(e) => setSubjectFormData({ ...subjectFormData, class: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 focus:border-indigo-500 text-slate-850 dark:bg-slate-955 dark:border-slate-800 dark:text-white rounded-xl text-sm focus:outline-none"
                    required
                  >
                    <option value="">-- Choose Class --</option>
                    {classesList.map(c => (
                      <option key={c} value={c}>Class {c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Subject Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Physics"
                    value={subjectFormData.subject}
                    onChange={(e) => setSubjectFormData({ ...subjectFormData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 focus:border-indigo-500 text-slate-805 dark:bg-slate-955 dark:border-slate-800 dark:text-white rounded-xl text-sm focus:outline-none"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-w-md">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subjects Setup</span>
                <div className="flex flex-wrap gap-2 min-h-10 p-3 bg-slate-550/5 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {!editingClassGroup || !editingClassGroup.subjects || editingClassGroup.subjects.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No subjects configured.</span>
                  ) : (
                    editingClassGroup.subjects.map((sub: string, index: number) => (
                      <div key={index} className="inline-flex items-center gap-1 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 text-xs px-2.5 py-1 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30">
                        <span>{sub}</span>
                        <button type="button" onClick={() => handleDeleteSubject(index)} className="text-indigo-455 hover:text-rose-500 transition-colors ml-1 font-bold">×</button>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="New Subject (e.g. Chemistry)"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    className="px-3 py-2 text-xs border border-slate-200 focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg focus:outline-none flex-1"
                  />
                  <button type="button" onClick={handleAddSubject} className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-bold px-3 rounded-lg border border-slate-200/50 dark:border-slate-700 text-slate-700 dark:text-slate-350">Add</button>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2 justify-end border-t border-slate-100 dark:border-slate-800 pt-4">
              {!editingClassName && (
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 font-bold shadow-md">
                  Add Subject
                </Button>
              )}
              <Button type="button" onClick={resetSubjectForm} className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-xl px-5">
                {editingClassName ? 'Close' : 'Cancel'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-slate-400">
          <span className="text-sm font-medium">Fetching academic subjects...</span>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl overflow-x-auto shadow-sm">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-850">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Class Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Subjects List</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {classesList.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-455 dark:text-slate-500 text-sm font-semibold">
                    No classes or subjects configured yet.
                  </td>
                </tr>
              ) : (
                classesList.map((className) => {
                  const classGroup = subjectGroups.find((sg) => sg.class === className);

                  return (
                    <tr key={className} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all duration-150">
                      <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-slate-200">
                        Class {className}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-wrap gap-1.5 max-w-lg">
                          {!classGroup || !classGroup.subjects || classGroup.subjects.length === 0 ? (
                            <span className="text-xs text-slate-400 italic">No subjects configured</span>
                          ) : (
                            classGroup.subjects.map((sub: string) => (
                              <span key={sub} className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50/50 dark:bg-indigo-950/25 border border-indigo-100/50 dark:border-indigo-900/30 rounded-lg text-indigo-650 dark:text-indigo-400">
                                {sub}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Button
                          onClick={() => handleEditSubjectsClick(className)}
                          className="bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold px-3 py-1.5 rounded-xl border border-indigo-100/60"
                        >
                          Manage Subjects
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
