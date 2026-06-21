'use client';

import { useEffect, useState, Suspense } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Layers, CheckCircle2, AlertCircle, RefreshCw, ListChecks, UserCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

function PromotePageContent() {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();

  const [sections, setSections] = useState<any[]>([]);
  const [sourceClass, setSourceClass] = useState('');
  const [sourceSection, setSourceSection] = useState('');
  const [targetClass, setTargetClass] = useState('');
  const [targetSection, setTargetSection] = useState('');
  
  const [promoStudents, setPromoStudents] = useState<any[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [newRollNumbers, setNewRollNumbers] = useState<{ [studentId: string]: string }>({});

  const [loadingPromoStudents, setLoadingPromoStudents] = useState(false);
  const [submittingPromo, setSubmittingPromo] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const res = await fetch('/api/sections', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setSections(data.sections || []);
      }
    } catch (err) {
      console.error('Failed to fetch sections:', err);
    }
  };

  const loadPromoStudents = async () => {
    if (!sourceClass) return;
    setLoadingPromoStudents(true);
    setPromoError('');
    setPromoSuccess('');
    try {
      const params = new URLSearchParams();
      params.append('class', sourceClass);
      params.append('status', 'active');

      const response = await fetch(`/api/students?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const filtered = sourceSection 
          ? (data.students || []).filter((s: any) => s.section === sourceSection)
          : (data.students || []);

        setPromoStudents(filtered);
        setSelectedStudentIds(filtered.map((s: any) => s._id));
        const rolls: any = {};
        filtered.forEach((s: any) => {
          rolls[s._id] = s.rollNumber || '';
        });
        setNewRollNumbers(rolls);
      } else {
        setPromoError('Failed to load students');
      }
    } catch (err) {
      setPromoError('Connection failed');
    } finally {
      setLoadingPromoStudents(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudentIds(promoStudents.map((s) => s._id));
    } else {
      setSelectedStudentIds([]);
    }
  };

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudentIds((prev) => [...prev, studentId]);
    } else {
      setSelectedStudentIds((prev) => prev.filter((id) => id !== studentId));
    }
  };

  const handleRollChange = (studentId: string, value: string) => {
    setNewRollNumbers((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  const handlePromoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetClass) {
      setPromoError('Please select a target class');
      return;
    }
    if (selectedStudentIds.length === 0) {
      setPromoError('Please select at least one student to promote');
      return;
    }

    setSubmittingPromo(true);
    setPromoError('');
    setPromoSuccess('');

    try {
      const promotions = selectedStudentIds.map((id) => ({
        studentId: id,
        rollNumber: newRollNumbers[id] || '',
      }));

      const response = await fetch('/api/students/promote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetClass,
          targetSection,
          promotions,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPromoSuccess(`Successfully promoted ${data.modifiedCount} students to ${targetClass} ${targetSection ? `(Section ${targetSection})` : ''}!`);
        loadPromoStudents();
      } else {
        const data = await response.json();
        setPromoError(data.message || 'Failed to complete promotion');
      }
    } catch (err) {
      setPromoError('Promotion request failed');
    } finally {
      setSubmittingPromo(false);
    }
  };

  const uniqueClasses = Array.from(new Set(sections.map((s) => s.class))).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const sourceSections = sections.filter((s) => s.class === sourceClass);
  const targetSections = sections.filter((s) => s.class === targetClass);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-955 dark:text-white tracking-tight flex items-center space-x-2">
            <Layers className="text-indigo-600" size={28} />
            <span>Class Promotions & Roll-over</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Promote students to next class level and re-assign roll numbers for the new academic year
          </p>
        </div>
      </div>

      <div className="space-y-6 animate-in fade-in duration-200">
        {promoSuccess && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-2xl flex items-center space-x-2 text-sm font-semibold">
            <CheckCircle2 size={18} className="text-emerald-550 mr-1" />
            <span>{promoSuccess}</span>
          </div>
        )}

        {promoError && (
          <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-2xl flex items-center space-x-2 text-sm font-semibold">
            <AlertCircle size={18} className="text-red-500 mr-1" />
            <span>{promoError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            
            {/* Source configuration card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-4">
              <h2 className="font-bold text-slate-800 dark:text-slate-200 text-base flex items-center gap-2">
                <span className="bg-indigo-50 dark:bg-indigo-955/40 text-indigo-650 dark:text-indigo-400 px-2 py-0.5 text-xs rounded-full">Step 1</span>
                Source Class Details
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Class Name</label>
                  <select
                    value={sourceClass}
                    onChange={(e) => {
                      setSourceClass(e.target.value);
                      setSourceSection('');
                      setPromoStudents([]);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                  >
                    <option value="">Select Source Class</option>
                    {uniqueClasses.map((cls) => (
                      <option key={cls} value={cls}>
                        Class {cls}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Section</label>
                  <select
                    value={sourceSection}
                    disabled={!sourceClass}
                    onChange={(e) => {
                      setSourceSection(e.target.value);
                      setPromoStudents([]);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold disabled:opacity-50"
                  >
                    <option value="">All Sections</option>
                    {sourceSections.map((sec) => (
                      <option key={sec._id} value={sec.name}>
                        Section {sec.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  onClick={loadPromoStudents}
                  disabled={!sourceClass || loadingPromoStudents}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5"
                >
                  {loadingPromoStudents ? (
                    <RefreshCw className="animate-spin" size={16} />
                  ) : (
                    <ListChecks size={16} />
                  )}
                  <span>Load Students</span>
                </Button>
              </div>
            </div>

            {/* Destination configuration card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-4">
              <h2 className="font-bold text-slate-800 dark:text-slate-200 text-base flex items-center gap-2">
                <span className="bg-indigo-50 dark:bg-indigo-955/40 text-indigo-655 dark:text-indigo-400 px-2 py-0.5 text-xs rounded-full">Step 2</span>
                Target Class Destination
              </h2>
              <form onSubmit={handlePromoteSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target Class</label>
                  <select
                    value={targetClass}
                    onChange={(e) => {
                      setTargetClass(e.target.value);
                      setTargetSection('');
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                    required
                  >
                    <option value="">Select Target Class</option>
                    {uniqueClasses.map((cls) => (
                      <option key={cls} value={cls}>
                        Class {cls}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target Section</label>
                  <select
                    value={targetSection}
                    disabled={!targetClass}
                    onChange={(e) => setTargetSection(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold disabled:opacity-50"
                  >
                    <option value="">Keep current / None</option>
                    {targetSections.map((sec) => (
                      <option key={sec._id} value={sec.name}>
                        Section {sec.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-100 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400 rounded-xl text-xs flex gap-2">
                  <AlertCircle size={16} className="text-amber-600 shrink-0" />
                  <p>This action permanently updates students class records. Recheck student lists before running promotions.</p>
                </div>

                <Button
                  type="submit"
                  disabled={submittingPromo || promoStudents.length === 0 || selectedStudentIds.length === 0}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  {submittingPromo ? (
                    <RefreshCw className="animate-spin" size={16} />
                  ) : (
                    <UserCheck size={18} />
                  )}
                  <span>Promote Selected Students</span>
                </Button>
              </form>
            </div>

          </div>

          {/* Students Selection Table */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h2 className="font-bold text-slate-800 dark:text-slate-200 text-base">Select Students to Promote</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Checked students will be promoted to the target class destination.</p>
                </div>
                <span className="text-xs font-bold text-indigo-655 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400 px-3 py-1 rounded-full">
                  {selectedStudentIds.length} of {promoStudents.length} Selected
                </span>
              </div>

              {loadingPromoStudents ? (
                <div className="text-center py-20 text-slate-450">
                  <RefreshCw size={24} className="animate-spin mx-auto text-indigo-500 mb-2" />
                  <span className="text-sm font-semibold">Loading student list...</span>
                </div>
              ) : promoStudents.length === 0 ? (
                <div className="text-center py-24 text-slate-400 italic">
                  No students loaded. Select a source class and click "Load Students".
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50/50 dark:bg-slate-850/50">
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold">
                        <th className="px-4 py-3 text-left w-12">
                          <input
                            type="checkbox"
                            checked={selectedStudentIds.length === promoStudents.length}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="rounded text-indigo-650 focus:ring-indigo-500 h-4 w-4 border-slate-300"
                          />
                        </th>
                        <th className="px-4 py-3 text-left">Enrollment ID</th>
                        <th className="px-4 py-3 text-left">Student Name</th>
                        <th className="px-4 py-3 text-left">Current Sec</th>
                        <th className="px-4 py-3 text-left w-24">Current Roll</th>
                        <th className="px-4 py-3 text-left w-32">Target Roll</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {promoStudents.map((student) => (
                        <tr key={student._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-850/30 transition-colors">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedStudentIds.includes(student._id)}
                              onChange={(e) => handleSelectStudent(student._id, e.target.checked)}
                              className="rounded text-indigo-650 focus:ring-indigo-500 h-4 w-4 border-slate-300"
                            />
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-500">{student.enrollmentId}</td>
                          <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">
                            {student.firstName} {student.lastName}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-500">
                              Sec {student.section || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">{student.rollNumber || 'N/A'}</td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={newRollNumbers[student._id] || ''}
                              onChange={(e) => handleRollChange(student._id, e.target.value)}
                              className="w-20 px-2 py-1 border border-slate-200 dark:border-slate-805 dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-550"
                              placeholder="Target Roll"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PromoteStudentsPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-slate-500">Loading promotion wizard...</div>}>
      <PromotePageContent />
    </Suspense>
  );
}
