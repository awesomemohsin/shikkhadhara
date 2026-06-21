'use client';

import { useEffect, useState, Suspense } from 'react';
import { useAuthStore } from '@/lib/store';
import { Plus, Edit2, Trash2, Eye, X, Briefcase, Users, UserCheck, ShieldAlert, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatCards } from '@/components/dashboard/stat-cards';
import { PremiumTable } from '@/components/dashboard/premium-table';
import { PremiumModal } from '@/components/dashboard/premium-modal';

function StaffsPageContent() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const isTeacher = user?.role === 'teacher';
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingTeacher, setViewingTeacher] = useState<any | null>(null);

  const [sections, setSections] = useState<any[]>([]);
  const [classFilter, setClassFilter] = useState<string | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTeachers();
    fetchSections();
  }, []);

  useEffect(() => {
    const classParam = searchParams.get('class');
    const idParam = searchParams.get('id');

    if (classParam) {
      setClassFilter(classParam);
    } else {
      setClassFilter(null);
    }

    if (idParam && teachers.length > 0) {
      const matchingTeacher = teachers.find((t) => t._id === idParam);
      if (matchingTeacher) {
        setViewingTeacher(matchingTeacher);
      }
    } else {
      setViewingTeacher(null);
    }
  }, [searchParams, teachers]);

  const handleClearFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('class');
    params.delete('id');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCloseTeacherDetails = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('id');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleOpenTeacherDetails = (teacher: any) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('id', teacher._id);
    router.push(`${pathname}?${params.toString()}`);
  };

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

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/staffs', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTeachers(data.teachers || []);
      }
    } catch (error) {
      console.error('Failed to fetch staffs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;

    try {
      const response = await fetch(`/api/staffs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setTeachers(teachers.filter((t) => t._id !== id));
      }
    } catch (error) {
      console.error('Failed to delete staff member:', error);
    }
  };

  const displayedTeachers = teachers.filter((t) => {
    // Class filter
    const matchesClass = !classFilter || t.assignedClasses?.some((c: string) => c.startsWith(`${classFilter} - `) || c === classFilter);
    
    // Search query
    const fullName = `${t.firstName || ''} ${t.lastName || ''}`.toLowerCase();
    const emailStr = (t.email || '').toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || emailStr.includes(searchQuery.toLowerCase());

    return matchesClass && matchesSearch;
  });

  const getRoleLabel = (pos: string) => {
    switch (pos) {
      case 'teacher': return 'Teacher';
      case 'senior_teacher': return 'Senior Teacher';
      case 'headmaster': return 'Headmaster';
      case 'associate_headmaster': return 'Associate Headmaster';
      case 'other': return 'Support Staff';
      default: return pos || 'Teacher';
    }
  };

  const classes = Array.from(
    new Set(sections.map((s) => s.class))
  ).filter(Boolean).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ''), 10);
    const numB = parseInt(b.replace(/\D/g, ''), 10);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b);
  });

  // Calculate Metrics
  const totalStaff = teachers.length;
  const activeStaff = teachers.filter(t => t.status === 'active').length;
  const totalAcademic = teachers.filter(t => t.position !== 'other').length;
  const totalSupport = totalStaff - totalAcademic;

  const statCards = [
    { title: 'Total Employees', value: totalStaff, icon: Users, color: 'text-indigo-650 bg-indigo-50 dark:bg-indigo-950/30' },
    { title: 'Academic Faculty', value: totalAcademic, icon: Briefcase, color: 'text-violet-600 bg-violet-50 dark:bg-violet-955/30' },
    { title: 'Active Status', value: activeStaff, icon: UserCheck, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
    { title: 'Support Members', value: totalSupport, icon: Award, color: 'text-amber-600 bg-amber-50 dark:bg-amber-955/30' }
  ];

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Staff Directory"
        description="Monitor educational facilitators, office managers, employee profiles, qualifications, and classroom distribution lists."
        breadcrumbs={[{ label: 'Staff' }]}
        actions={
          !isTeacher && (
            <Button
              onClick={() => router.push('/dashboard/staffs/add')}
              className="flex items-center space-x-1.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl px-5 py-2 font-bold text-xs shadow-sm shrink-0"
            >
              <Plus size={16} />
              <span>Add Staff</span>
            </Button>
          )
        }
      />

      {/* KPI summaries */}
      <StatCards cards={statCards} />

      {classFilter && (
        <div className="flex items-center justify-between bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/30 rounded-2xl p-4 text-xs font-semibold text-indigo-850 dark:text-indigo-300">
          <div className="flex items-center gap-2">
            <span>Filter Assigned Grade:</span>
            <span className="bg-indigo-600 text-white px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase">Class {classFilter}</span>
          </div>
          <button
            onClick={handleClearFilter}
            className="text-xs font-bold text-indigo-650 hover:underline cursor-pointer"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Table grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">
          <span className="text-sm font-semibold">Updating employee directory logs...</span>
        </div>
      ) : (
        <PremiumTable
          headers={['Staff Name', 'Designation', 'Email Address', 'Teaching Subjects', 'Qualification', 'Join Date', 'Status', 'Actions']}
          searchPlaceholder="Search staff by name or email..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          filterValue={classFilter || ''}
          onFilterChange={(val) => {
            const params = new URLSearchParams(searchParams.toString());
            if (val) {
              params.set('class', val);
            } else {
              params.delete('class');
            }
            router.push(`${pathname}?${params.toString()}`);
          }}
          filterPlaceholder="All Assigned Classes"
          filterOptions={classes.map(cls => ({ label: `Class ${cls}`, value: cls }))}
          totalRecords={displayedTeachers.length}
        >
          {displayedTeachers.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-6 py-12 text-center text-slate-455 dark:text-slate-500 text-sm font-semibold">
                No staff profiles matched the query options.
              </td>
            </tr>
          ) : (
            displayedTeachers.map((teacher) => (
              <tr
                key={teacher._id}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all duration-150 group"
              >
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleOpenTeacherDetails(teacher)}
                    className="font-bold text-left hover:underline text-indigo-650 dark:text-indigo-400 font-bold"
                  >
                    {teacher.firstName} {teacher.lastName}
                  </button>
                </td>
                <td className="px-6 py-4 text-xs font-bold text-slate-700 dark:text-slate-300">
                  {getRoleLabel(teacher.position)}
                </td>
                <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                  {teacher.email || '—'}
                </td>
                <td className="px-6 py-4 text-xs font-semibold text-slate-550 max-w-[150px] truncate">
                  {teacher.subjects?.join(', ') || '—'}
                </td>
                <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                  {teacher.qualification || '—'}
                </td>
                <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                  {teacher.joinDate ? new Date(teacher.joinDate).toLocaleDateString() : '—'}
                </td>
                <td className="px-6 py-4 text-xs">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${
                    teacher.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {teacher.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3 print:hidden opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenTeacherDetails(teacher)}
                      className="text-indigo-600 hover:text-indigo-800 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="View Staff Profile"
                    >
                      <Eye size={15} />
                    </button>
                    {!isTeacher && (
                      <>
                        <button
                          onClick={() => router.push(`/dashboard/staffs/add?edit=${teacher._id}`)}
                          className="text-amber-600 dark:text-amber-500 hover:text-amber-800 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Employee Information"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteTeacher(teacher._id)}
                          className="text-rose-600 dark:text-rose-500 hover:text-rose-805 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Delete Employee"
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </PremiumTable>
      )}

      {/* Details View Modal */}
      {viewingTeacher && (
        <PremiumModal
          isOpen={!!viewingTeacher}
          onClose={handleCloseTeacherDetails}
          title={`${viewingTeacher.firstName} {viewingTeacher.lastName} — Profile Details`}
          icon={Briefcase}
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-2 pb-4 border-b border-slate-100 dark:border-slate-850">
              <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-md shrink-0">
                {viewingTeacher.firstName?.[0]}{viewingTeacher.lastName?.[0]}
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-205">{viewingTeacher.firstName} {viewingTeacher.lastName}</h4>
                <span className={`inline-flex mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                  viewingTeacher.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}>
                  {getRoleLabel(viewingTeacher.position)} — {viewingTeacher.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Designation</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 capitalize">{getRoleLabel(viewingTeacher.position)}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Qualification</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{viewingTeacher.qualification || '—'}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Specialization</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{viewingTeacher.specialization || '—'}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Subjects</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{viewingTeacher.subjects?.join(', ') || '—'}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Monthly Salary</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {viewingTeacher.salary ? `৳${viewingTeacher.salary.toLocaleString()}` : '—'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Phone Number</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{viewingTeacher.phone || '—'}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Join Date</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {viewingTeacher.joinDate ? new Date(viewingTeacher.joinDate).toLocaleDateString() : '—'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Email Address</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate block">{viewingTeacher.email || '—'}</span>
              </div>
              <div className="col-span-2 border-t border-slate-100 dark:border-slate-850 pt-3">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Assigned Classes Setup</span>
                <div className="flex flex-wrap gap-1.5">
                  {!viewingTeacher.assignedClasses || viewingTeacher.assignedClasses.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No classroom routines currently assigned.</span>
                  ) : (
                    viewingTeacher.assignedClasses.map((clsLabel: string) => {
                      const baseClass = clsLabel.split(' - ')[0]?.trim() || clsLabel;
                      return (
                        <a
                          key={clsLabel}
                          href={`/dashboard/classes?class=${encodeURIComponent(baseClass)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-[10px] font-bold px-2.5 py-1 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-950/80 transition-colors"
                        >
                          Class {clsLabel}
                        </a>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </PremiumModal>
      )}
    </div>
  );
}

export default function StaffsPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-slate-500">Loading directory...</div>}>
      <StaffsPageContent />
    </Suspense>
  );
}
