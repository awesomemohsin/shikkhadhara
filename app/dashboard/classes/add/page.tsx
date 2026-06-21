'use client';

import { useEffect, useState, Suspense } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter, useSearchParams } from 'next/navigation';
import { Save, X, Trash2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

function ClassFormContent() {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingClassName = searchParams.get('edit');

  const [sections, setSections] = useState<any[]>([]);
  const [subjectGroups, setSubjectGroups] = useState<any[]>([]);
  const [allTeachers, setAllTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Class Form states
  const [classFormData, setClassFormData] = useState({
    className: '',
    monthlyFee: '',
    sections: 'A', // Initial section
  });

  // Inline inputs for section additions
  const [newSectionName, setNewSectionName] = useState('');

  useEffect(() => {
    if (token) {
      fetchAcademics();
    }
  }, [token]);

  useEffect(() => {
    if (editingClassName && sections.length > 0) {
      const classSections = sections.filter((s) => s.class === editingClassName);
      setClassFormData({
        className: editingClassName,
        monthlyFee: (classSections[0]?.monthlyFee || 0).toString(),
        sections: classSections.map(s => s.name).join(', '),
      });
    }
  }, [editingClassName, sections]);

  const fetchAcademics = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [resSec, resSub, resTeachers] = await Promise.all([
        fetch('/api/sections', { headers }),
        fetch('/api/subject-groups', { headers }),
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

        router.push('/dashboard/classes');
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

        // Determine which subject groups to create
        // Classes 9–12 get Science, Commerce, Arts; all others get General
        const upperClasses = ['Class 9', 'Class 10', 'Class 11', 'Class 12'];
        const isUpperClass = upperClasses.includes(className);

        if (isUpperClass) {
          const groups = [
            { name: 'Science', subjects: ['Physics', 'Chemistry', 'Biology', 'Higher Mathematics', 'ICT'], description: `Science stream for ${className}` },
            { name: 'Commerce', subjects: ['Accounting', 'Business Studies', 'Economics', 'Finance & Banking', 'ICT'], description: `Commerce stream for ${className}` },
            { name: 'Arts', subjects: ['Bangla', 'English', 'History', 'Civics', 'Economics', 'Geography'], description: `Arts stream for ${className}` },
          ];
          for (const grp of groups) {
            await fetch('/api/subject-groups', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ class: className, ...grp })
            });
          }
        } else {
          await fetch('/api/subject-groups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              class: className,
              name: 'General',
              subjects: ['Bangla', 'English', 'Mathematics', 'Science', 'Social Studies', 'Religious Studies', 'ICT'],
              description: `General subjects for ${className}`
            })
          });
        }

        router.push('/dashboard/classes');
      }
    } catch (err) {
      console.error(err);
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

  const handleUpdateSectionTeacher = async (sectionId: string, teacherId: string) => {
    try {
      const res = await fetch(`/api/sections?id=${sectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ classTeacherId: teacherId || null })
      });
      if (res.ok) {
        const dataSec = await (await fetch('/api/sections', { headers: { Authorization: `Bearer ${token}` } })).json();
        setSections(dataSec.sections || []);
      }
    } catch (err) {
      console.error('Failed to update section teacher:', err);
    }
  };

  const editingClassSections = sections.filter(s => s.class === editingClassName);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Layers className="text-indigo-600" size={28} />
            <span>{editingClassName ? `Edit Class: ${editingClassName}` : 'Add New Class'}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            {editingClassName ? 'Update tuition configurations and manage section teachers' : 'Define a new class level and monthly tuition fees'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading academic details...</div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-6">
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
                  disabled={!!editingClassName}
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
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Manage Sections & Class Teachers</span>
                <div className="space-y-2 max-h-60 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-955/20 rounded-2xl border border-slate-100 dark:border-slate-800">
                  {editingClassSections.length === 0 ? (
                    <span className="text-xs text-slate-400 italic p-2 block">No sections created.</span>
                  ) : (
                    editingClassSections.map((sec) => (
                      <div key={sec._id} className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 gap-4 shadow-sm">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200">Section {sec.name}</span>
                        <div className="flex items-center gap-2">
                          <select
                            value={sec.classTeacherId || ''}
                            onChange={(e) => handleUpdateSectionTeacher(sec._id, e.target.value)}
                            className="px-2 py-1 text-xs border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-700 dark:text-slate-350 rounded-lg focus:outline-none"
                          >
                            <option value="">No Class Teacher</option>
                            {allTeachers.map((t) => (
                              <option key={t._id} value={t._id}>
                                {t.firstName} {t.lastName} ({t.position || 'Teacher'})
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleDeleteSection(sec._id)}
                            className="text-slate-400 hover:text-rose-650 transition-colors p-1"
                            title="Delete Section"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
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
                  <button type="button" onClick={handleAddSection} className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-bold px-3 rounded-lg border border-slate-200/50 dark:border-slate-700 text-slate-700 dark:text-slate-300">Add</button>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2 justify-end border-t border-slate-100 dark:border-slate-800 pt-4">
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 font-bold shadow-md">
                {editingClassName ? 'Save Changes' : 'Create Class'}
              </Button>
              <Button type="button" onClick={() => router.push('/dashboard/classes')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-350 rounded-xl px-5">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function ClassFormPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-slate-500">Loading form...</div>}>
      <ClassFormContent />
    </Suspense>
  );
}
