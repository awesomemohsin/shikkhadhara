'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Edit2, Trash2, Layers, Plus, BookMarked, BookOpen, UserCheck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatCards } from '@/components/dashboard/stat-cards';
import { PremiumTable } from '@/components/dashboard/premium-table';

export default function ClassesPage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const [sections, setSections] = useState<any[]>([]);
  const [subjectGroups, setSubjectGroups] = useState<any[]>([]);
  const [allTeachers, setAllTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('all');

  useEffect(() => {
    if (token) {
      fetchAcademics();
    }
  }, [token]);

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

  const handleDeleteClass = async (className: string) => {
    if (!confirm(`Are you sure you want to delete Class ${className}? This will delete all sections and subjects configured for this class.`)) return;

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

  // Calculate Metrics
  const totalClasses = classesList.length;
  const totalSections = sections.length;
  const assignedTeachersSet = new Set(sections.map((s) => s.classTeacherId).filter(Boolean));
  const totalAssignedTeachers = assignedTeachersSet.size;
  const totalUnassignedTeachers = Math.max(0, allTeachers.length - totalAssignedTeachers);

  // Apply filters
  const filteredClasses = classesList.filter((clsName) => {
    const matchesSearch = clsName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const classSections = sections.filter((s) => s.class === clsName);
    const hasAssigned = classSections.some((s) => s.classTeacherId);
    const hasUnassigned = classSections.some((s) => !s.classTeacherId);

    let matchesFilter = true;
    if (teacherFilter === 'assigned') {
      matchesFilter = hasAssigned;
    } else if (teacherFilter === 'unassigned') {
      matchesFilter = hasUnassigned;
    }

    return matchesSearch && matchesFilter;
  });

  if (user?.role === 'owner') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">Access Denied</h1>
        <p className="text-sm text-slate-500">Only school administrators can access class setups.</p>
      </div>
    );
  }

  // Stat Card Config
  const statCards = [
    { title: 'Total Classes', value: totalClasses, icon: BookOpen, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30' },
    { title: 'Total Sections', value: totalSections, icon: Layers, color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/30' },
    { title: 'Assigned Teachers', value: totalAssignedTeachers, icon: UserCheck, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
    { title: 'Unassigned Teachers', value: totalUnassignedTeachers, icon: Users, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' }
  ];

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Classes Setup"
        description="Configure institutional grade streams, sections, monthly tuition rates, and class teacher supervisors."
        breadcrumbs={[{ label: 'Classes Setup' }]}
        actions={
          <>
            <Button
              onClick={() => router.push('/dashboard/classes/subjects')}
              variant="outline"
              className="flex items-center space-x-1.5 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl px-4 py-2 font-bold text-xs shrink-0"
            >
              <BookMarked size={14} className="text-slate-500" />
              <span>Manage Subjects</span>
            </Button>
            <Button
              onClick={() => router.push('/dashboard/classes/add')}
              className="flex items-center space-x-1.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl px-5 py-2 font-bold text-xs shadow-sm shrink-0"
            >
              <Plus size={16} />
              <span>Add Class</span>
            </Button>
          </>
        }
      />

      {/* KPI Stats */}
      <StatCards cards={statCards} />

      {/* Table registries */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">
          <span className="text-sm font-semibold">Updating grade registries...</span>
        </div>
      ) : (
        <PremiumTable
          headers={['Class Name', 'Monthly Tuition Fee', 'Sections', 'Assigned Class Teachers', 'Actions']}
          searchPlaceholder="Search classes by grade..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          filterValue={teacherFilter}
          onFilterChange={setTeacherFilter}
          filterPlaceholder="Teacher Allocation"
          filterOptions={[
            { label: 'Show All', value: '' },
            { label: 'Has Assigned Teachers', value: 'assigned' },
            { label: 'Has Unassigned Teachers', value: 'unassigned' },
          ]}
          totalRecords={filteredClasses.length}
        >
          {filteredClasses.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-slate-455 dark:text-slate-500 text-sm font-semibold">
                No class configurations match the current filter selection.
              </td>
            </tr>
          ) : (
            filteredClasses.map((className) => {
              const classSections = sections.filter((s) => s.class === className);

              return (
                <tr
                  key={className}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all duration-150 group"
                >
                  <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-slate-200">
                    Class {className}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    ৳{(classSections[0]?.monthlyFee || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5 max-w-xs">
                      {classSections.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">No sections</span>
                      ) : (
                        classSections.map((sec) => (
                          <span
                            key={sec._id}
                            className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 border border-slate-200/40"
                          >
                            Section {sec.name}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      {classSections.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">No supervisors</span>
                      ) : (
                        classSections.map((sec) => {
                          const teacher = allTeachers.find((t) => t._id === sec.classTeacherId);
                          return (
                            <div key={sec._id} className="flex items-center gap-2">
                              <span className="font-bold text-[9px] px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 border border-slate-200/30">
                                {sec.name}
                              </span>
                              {teacher ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-750 dark:text-slate-300">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                  {teacher.firstName} {teacher.lastName}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 italic">
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                  Unassigned
                                </span>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3 print:hidden opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => router.push(`/dashboard/classes/add?edit=${encodeURIComponent(className)}`)}
                        className="text-amber-600 dark:text-amber-500 hover:text-amber-800 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit Class details"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteClass(className)}
                        className="text-rose-600 dark:text-rose-500 hover:text-rose-800 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Delete Class"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </PremiumTable>
      )}
    </div>
  );
}
