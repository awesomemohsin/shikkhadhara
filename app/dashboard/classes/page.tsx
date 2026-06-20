'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Plus, Edit2, Trash2, Layers, BookOpen, Save, X, BookMarked } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ClassesPage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const [activeTab, setActiveTab] = useState<'classes' | 'subjects'>('classes');

  const [sections, setSections] = useState<any[]>([]);
  const [subjectGroups, setSubjectGroups] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [allTeachers, setAllTeachers] = useState<any[]>([]);
  const [viewingClassDetails, setViewingClassDetails] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Forms Visibility
  const [showClassForm, setShowClassForm] = useState(false);
  const [showSubjectForm, setShowSubjectForm] = useState(false);

  // Editing state
  const [editingClassName, setEditingClassName] = useState<string | null>(null);

  // Class Form states
  const [classFormData, setClassFormData] = useState({
    className: '',
    monthlyFee: '',
    sections: 'A', // Initial section
  });

  // Subject Form states
  const [subjectFormData, setSubjectFormData] = useState({
    class: '',
    subject: '',
  });

  // Inline inputs for additions
  const [newSectionName, setNewSectionName] = useState('');
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
      const [resSec, resSub, resStudents, resTeachers] = await Promise.all([
        fetch('/api/sections', { headers }),
        fetch('/api/subject-groups', { headers }),
        fetch('/api/students', { headers }).catch(() => null),
        fetch('/api/staffs', { headers }).catch(() => null),
      ]);

      if (resSec.ok) {
        const data = await resSec.json();
        setSections(data.sections || []);
      }
      if (resSub.ok) {
        const data = await resSub.json();
        setSubjectGroups(data.subjectGroups || []);
      }
      if (resStudents && resStudents.ok) {
        const data = await resStudents.json();
        setAllStudents(data.students || []);
      }
      if (resTeachers && resTeachers.ok) {
        const data = await resTeachers.json();
        setAllTeachers(data.teachers || []);
      }
    } catch (err) {
      console.error('Failed to fetch academics data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClassClick = (className: string) => {
    const classSections = sections.filter((s) => s.class === className);
    setEditingClassName(className);
    setClassFormData({
      className: className,
      monthlyFee: (classSections[0]?.monthlyFee || 0).toString(),
      sections: classSections.map(s => s.name).join(', '),
    });
    setShowClassForm(true);
  };

  const handleEditSubjectsClick = (className: string) => {
    setEditingClassName(className);
    setShowSubjectForm(true);
  };

  const resetClassForm = () => {
    setClassFormData({
      className: '',
      monthlyFee: '',
      sections: 'A',
    });
    setEditingClassName(null);
    setShowClassForm(false);
    setNewSectionName('');
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

  const handleClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const className = classFormData.className.trim();
    const fee = parseFloat(classFormData.monthlyFee) || 0;

    if (!className) return;

    try {
      if (editingClassName) {
        // Name update cascade
        if (editingClassName !== className) {
          const classSections = sections.filter(s => s.class === editingClassName);
          for (const sec of classSections) {
            await fetch(`/api/sections?id=${sec._id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ class: className })
            });
          }
          const classGroup = subjectGroups.find(sg => sg.class === editingClassName);
          if (classGroup) {
            await fetch(`/api/subject-groups?id=${classGroup._id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ class: className })
            });
          }
        }

        // Fee update
        await fetch(`/api/sections?class=${encodeURIComponent(className)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ monthlyFee: fee })
        });

        resetClassForm();
        fetchAcademics();
      } else {
        // Create new class
        const parsedSections = classFormData.sections.split(',').map(s => s.trim()).filter(Boolean);
        const sectionsToCreate = parsedSections.length > 0 ? parsedSections : ['A'];

        for (const secName of sectionsToCreate) {
          await fetch('/api/sections', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ class: className, name: secName, monthlyFee: fee })
          });
        }

        // Create initial General subject group
        await fetch('/api/subject-groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            class: className,
            name: 'General',
            subjects: [],
            description: `General subjects for ${className}`
          })
        });

        resetClassForm();
        fetchAcademics();
      }
    } catch (err) {
      console.error(err);
    }
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

  const handleDeleteClass = async (className: string) => {
    if (!confirm(`Are you sure you want to delete ${className}? This will delete all sections and subjects configured for this class.`)) return;

    try {
      await fetch(`/api/sections?class=${encodeURIComponent(className)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      await fetch(`/api/subject-groups?class=${encodeURIComponent(className)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchAcademics();
    } catch (err) {
      console.error('Failed to delete class:', err);
    }
  };

  const handleAddSection = async () => {
    if (!newSectionName.trim() || !editingClassName) return;
    const name = newSectionName.trim();
    const classSections = sections.filter(s => s.class === editingClassName);
    const fee = classSections[0]?.monthlyFee || 0;

    try {
      const res = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ class: editingClassName, name, monthlyFee: fee })
      });
      if (res.ok) {
        setNewSectionName('');
        const dataSec = await (await fetch('/api/sections', { headers: { Authorization: `Bearer ${token}` } })).json();
        setSections(dataSec.sections || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return;
    try {
      const res = await fetch(`/api/sections?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const dataSec = await (await fetch('/api/sections', { headers: { Authorization: `Bearer ${token}` } })).json();
        setSections(dataSec.sections || []);
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
  ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  useEffect(() => {
    if (!loading && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const classParam = params.get('class');
      if (classParam && classesList.includes(classParam)) {
        setViewingClassDetails(classParam);
      }
    }
  }, [loading, classesList]);

  const handleCloseClassDetails = () => {
    setViewingClassDetails(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('class');
      window.history.pushState({}, '', url.toString());
    }
  };

  if (user?.role === 'owner') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">Access Denied</h1>
        <p className="text-sm text-slate-500">Only school administrators can access class setups.</p>
      </div>
    );
  }

  // Loaded items for inline operations
  const editingClassSections = sections.filter(s => s.class === editingClassName);
  const editingClassGroup = subjectGroups.find(sg => sg.class === editingClassName);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Classes & Subjects</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Configure classes, monthly tuition fees, sections, and subjects.</p>
        </div>

        <div className="flex gap-2">
          {activeTab === 'classes' ? (
            <Button
              onClick={() => {
                if (showClassForm) resetClassForm();
                else setShowClassForm(true);
              }}
              className="flex items-center space-x-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl px-5 font-bold shadow-md"
            >
              <Plus size={20} />
              <span>{showClassForm ? 'View List' : 'Add Class'}</span>
            </Button>
          ) : (
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
          )}
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200/80 dark:border-slate-800 gap-6">
        <button
          onClick={() => {
            setActiveTab('classes');
            resetClassForm();
            resetSubjectForm();
          }}
          className={`pb-3 text-sm font-bold border-b-2 transition-all duration-150 flex items-center gap-1.5 ${
            activeTab === 'classes'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-500'
              : 'border-transparent text-slate-450 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Layers size={16} />
          Manage Classes
        </button>
        <button
          onClick={() => {
            setActiveTab('subjects');
            resetClassForm();
            resetSubjectForm();
          }}
          className={`pb-3 text-sm font-bold border-b-2 transition-all duration-150 flex items-center gap-1.5 ${
            activeTab === 'subjects'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-500'
              : 'border-transparent text-slate-450 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BookMarked size={16} />
          Manage Subjects
        </button>
      </div>

      {/* Tab content 1: Manage Classes Form overlay */}
      {showClassForm && activeTab === 'classes' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-6 animate-in fade-in duration-200">
          <h2 className="text-lg font-bold text-slate-850 dark:text-white border-b pb-3 border-slate-100 dark:border-slate-800">
            {editingClassName ? `Edit Class Details - ${editingClassName}` : 'Add New Class'}
          </h2>
          <form onSubmit={handleClassSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Class Name</label>
                <input
                  type="text"
                  placeholder="e.g. Class 9, Class 10"
                  value={classFormData.className}
                  onChange={(e) => setClassFormData({ ...classFormData, className: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 focus:border-indigo-500 text-slate-800 dark:bg-slate-955 dark:border-slate-800 dark:text-white rounded-xl text-sm focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Monthly Tuition Fee (BDT)</label>
                <input
                  type="number"
                  placeholder="e.g. 1500"
                  value={classFormData.monthlyFee}
                  onChange={(e) => setClassFormData({ ...classFormData, monthlyFee: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 focus:border-indigo-500 text-slate-800 dark:bg-slate-955 dark:border-slate-800 dark:text-white rounded-xl text-sm focus:outline-none"
                  required
                />
              </div>

              {!editingClassName && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Initial Sections (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. A, B, C"
                    value={classFormData.sections}
                    onChange={(e) => setClassFormData({ ...classFormData, sections: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 focus:border-indigo-500 text-slate-800 dark:bg-slate-955 dark:border-slate-800 dark:text-white rounded-xl text-sm focus:outline-none"
                  />
                </div>
              )}
            </div>

            {editingClassName && (
              <div className="space-y-3 border-t border-slate-100 dark:border-slate-850 pt-5 max-w-md">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Manage Sections</span>
                <div className="flex flex-wrap gap-2 min-h-10 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {editingClassSections.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No sections created.</span>
                  ) : (
                    editingClassSections.map((sec) => (
                      <div key={sec._id} className="inline-flex items-center gap-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 text-xs px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span>Section {sec.name}</span>
                        <button type="button" onClick={() => handleDeleteSection(sec._id)} className="text-slate-400 hover:text-rose-500 transition-colors ml-1 font-bold">×</button>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="New Section (e.g. B)"
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    className="px-3 py-2 text-xs border border-slate-200 focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-white rounded-lg focus:outline-none flex-1"
                  />
                  <button type="button" onClick={handleAddSection} className="bg-slate-105 dark:bg-slate-800 hover:bg-slate-200 text-[10px] font-bold px-3 rounded-lg border border-slate-200/50 dark:border-slate-700 text-slate-700 dark:text-slate-350">Add</button>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2 justify-end border-t border-slate-100 dark:border-slate-800 pt-4">
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 font-bold shadow-md">
                {editingClassName ? 'Save Changes' : 'Add Class'}
              </Button>
              <Button type="button" onClick={resetClassForm} className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-xl px-5">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tab content 2: Manage Subjects Form overlay */}
      {showSubjectForm && activeTab === 'subjects' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-6 animate-in fade-in duration-200">
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
                  <button type="button" onClick={handleAddSubject} className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-250 text-[10px] font-bold px-3 rounded-lg border border-slate-200/50 dark:border-slate-700 text-slate-700 dark:text-slate-300">Add</button>
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
          <span className="text-sm font-medium">Fetching academic records...</span>
        </div>
      ) : (
        /* Tab 1 Table View: Classes */
        activeTab === 'classes' ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl overflow-x-auto shadow-sm">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-850">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Class Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Fee</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Sections</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {classesList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-455 dark:text-slate-500 text-sm font-semibold">
                      No classes configured yet.
                    </td>
                  </tr>
                ) : (
                  classesList.map((className) => {
                    const classSections = sections.filter((s) => s.class === className);

                    return (
                      <tr key={className} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all duration-150">
                        <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-slate-200">
                          <button
                            onClick={() => setViewingClassDetails(className)}
                            className="font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline text-left"
                          >
                            {className}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                          ৳{(classSections[0]?.monthlyFee || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {classSections.map((sec) => (
                              <span key={sec._id} className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 animate-in zoom-in-95 duration-100">
                                {sec.name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm flex space-x-3.5">
                          <button
                            onClick={() => handleEditClassClick(className)}
                            className="text-amber-605 dark:text-amber-500 hover:text-amber-800"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClass(className)}
                            className="text-rose-600 dark:text-rose-500 hover:text-rose-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Tab 2 Table View: Subjects */
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
                          {className}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex flex-wrap gap-1.5 max-w-xl">
                            {!classGroup || !classGroup.subjects || classGroup.subjects.length === 0 ? (
                              <span className="text-xs text-slate-400 italic">No subjects configured.</span>
                            ) : (
                              classGroup.subjects.map((sub: string, index: number) => (
                                <span key={index} className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-lg text-indigo-500 border border-indigo-100/30 animate-in zoom-in-95 duration-100">
                                  {sub}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleEditSubjectsClick(className)}
                            className="text-amber-605 dark:text-amber-500 hover:text-amber-800"
                          >
                            <Edit2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )
      )}
      {/* Class Details Modal */}
      {viewingClassDetails && (() => {
        const classSections = sections.filter((s) => s.class === viewingClassDetails);
        const classGroup = subjectGroups.find((sg) => sg.class === viewingClassDetails);
        const classStudents = allStudents.filter((s) => s.class === viewingClassDetails);
        const classTeachers = allTeachers.filter((t) =>
          t.assignedClasses?.some((c: string) => c.startsWith(`${viewingClassDetails} - `) || c === viewingClassDetails)
        );

        return (
          <>
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={handleCloseClassDetails} />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-50 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-4 mb-5">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Class Details: {viewingClassDetails}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Relations mapping for subjects, students, and staff members.</p>
                </div>
                <button onClick={handleCloseClassDetails} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <X size={18} className="text-slate-400" />
                </button>
              </div>

              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
                {/* General Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly Fee</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-250">
                      ৳{(classSections[0]?.monthlyFee || 0).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Sections</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-250">{classSections.length}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Students</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-250">{classStudents.length}</span>
                  </div>
                </div>

                {/* Sections list */}
                <div>
                  <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">Sections Configured</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {classSections.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">No sections created.</span>
                    ) : (
                      classSections.map((sec) => (
                        <span key={sec._id} className="text-[10px] font-bold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-350 border border-slate-200/50 dark:border-slate-700/50">
                          Section {sec.name}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Assigned Subjects */}
                <div>
                  <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">Subjects Assigned</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {!classGroup || !classGroup.subjects || classGroup.subjects.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">No subjects configured.</span>
                    ) : (
                      classGroup.subjects.map((sub: string, idx: number) => (
                        <span key={idx} className="text-[10px] font-bold px-2.5 py-1 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-lg text-indigo-650 dark:text-indigo-400 border border-indigo-150/20 dark:border-indigo-900/30">
                          {sub}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Enrolled Students */}
                <div>
                  <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">Enrolled Students ({classStudents.length})</h4>
                  <div className="border border-slate-200/60 dark:border-slate-850 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                    <div className="max-h-40 overflow-y-auto animate-in fade-in duration-300">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-400 uppercase sticky top-0 border-b border-slate-100 dark:border-slate-850 z-10">
                          <tr>
                            <th className="px-4 py-2">ID</th>
                            <th className="px-4 py-2">Student Name</th>
                            <th className="px-4 py-2">Roll</th>
                            <th className="px-4 py-2">Sec</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                          {classStudents.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-4 py-6 text-center text-slate-400 italic">No students enrolled in this class.</td>
                            </tr>
                          ) : (
                            classStudents.map((std) => (
                              <tr key={std._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors">
                                <td className="px-4 py-2.5 font-medium text-slate-500">
                                  <a href={`/dashboard/students?id=${std._id}`} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 hover:underline">
                                    {std.enrollmentId || 'N/A'}
                                  </a>
                                </td>
                                <td className="px-4 py-2.5 font-bold text-slate-800 dark:text-slate-200">
                                  <a href={`/dashboard/students?id=${std._id}`} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 hover:underline">
                                    {std.firstName} {std.lastName}
                                  </a>
                                </td>
                                <td className="px-4 py-2.5 text-slate-600 dark:text-slate-450">{std.rollNumber || 'N/A'}</td>
                                <td className="px-4 py-2.5 text-slate-600 dark:text-slate-450">{std.section || 'N/A'}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Assigned Staffs */}
                <div>
                  <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-2">Assigned Staffs ({classTeachers.length})</h4>
                  <div className="border border-slate-200/60 dark:border-slate-850 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                    <div className="max-h-40 overflow-y-auto animate-in fade-in duration-300">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-400 uppercase sticky top-0 border-b border-slate-100 dark:border-slate-850 z-10">
                          <tr>
                            <th className="px-4 py-2">ID</th>
                            <th className="px-4 py-2">Staff Name</th>
                            <th className="px-4 py-2">Qualification</th>
                            <th className="px-4 py-2">Sections Assigned</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                          {classTeachers.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-4 py-6 text-center text-slate-400 italic">No staff assigned to this class.</td>
                            </tr>
                          ) : (
                            classTeachers.map((t) => (
                              <tr key={t._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors">
                                <td className="px-4 py-2.5 font-medium text-slate-500">
                                  <a href={`/dashboard/staffs?id=${t._id}`} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 hover:underline">
                                    {t.employeeId || 'N/A'}
                                  </a>
                                </td>
                                <td className="px-4 py-2.5 font-bold text-slate-800 dark:text-slate-200">
                                  <a href={`/dashboard/staffs?id=${t._id}`} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 hover:underline">
                                    {t.firstName} {t.lastName}
                                  </a>
                                </td>
                                <td className="px-4 py-2.5 text-slate-600 dark:text-slate-450">{t.qualification || 'N/A'}</td>
                                <td className="px-4 py-2.5 text-slate-600 dark:text-slate-450 max-w-[150px] truncate">
                                  {t.assignedClasses?.filter((c: string) => c.startsWith(`${viewingClassDetails} - `) || c === viewingClassDetails).map((c: string) => c.split(' - ')[1] || c).join(', ')}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
                <Button onClick={handleCloseClassDetails} className="bg-slate-105 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/80 dark:text-slate-350 font-bold px-5 rounded-xl border border-slate-200/50 dark:border-slate-750">
                  Close Details
                </Button>
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
}
