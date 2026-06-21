'use client';

import { useEffect, useState, Suspense } from 'react';
import { useAuthStore } from '@/lib/store';
import { Plus, Edit2, Trash2, Eye, X, Layers, User, Users, UserCheck, Award, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatCards } from '@/components/dashboard/stat-cards';
import { PremiumTable } from '@/components/dashboard/premium-table';
import { PremiumModal } from '@/components/dashboard/premium-modal';

function StudentsPageContent() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const isTeacher = user?.role === 'teacher';
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [students, setStudents] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [classFilter, setClassFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewingStudent, setViewingStudent] = useState<any | null>(null);
  const [modalTab, setModalTab] = useState<'personal' | 'address' | 'parent' | 'documents'>('personal');

  // Search filter local state
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStudents();
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

    if (idParam && students.length > 0) {
      const matchingStudent = students.find((s) => s._id === idParam);
      if (matchingStudent) {
        setViewingStudent(matchingStudent);
      }
    } else {
      setViewingStudent(null);
    }
  }, [searchParams, students]);

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

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('class');
    params.delete('id');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCloseStudentDetails = () => {
    setModalTab('personal');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('id');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleOpenStudentDetails = (student: any) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('id', student._id);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      const response = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setStudents(students.filter((s) => s._id !== id));
      }
    } catch (error) {
      console.error('Failed to delete student:', error);
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

  // Filter students based on both text search and class select filter
  const displayedStudents = students.filter((s) => {
    const matchesClass = !classFilter || s.class === classFilter;
    const nameStr = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
    const emailStr = (s.email || '').toLowerCase();
    const rollStr = (s.rollNumber || '').toLowerCase();
    
    const matchesSearch = nameStr.includes(searchQuery.toLowerCase()) ||
                          emailStr.includes(searchQuery.toLowerCase()) ||
                          rollStr.includes(searchQuery.toLowerCase());

    return matchesClass && matchesSearch;
  });

  // Dynamic statistics
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'active').length;
  const specialStudents = students.filter(s => s.isSpecialChild).length;
  const otherStudents = totalStudents - activeStudents;

  const statCards = [
    { title: 'Total Registered', value: totalStudents, icon: Users, color: 'text-indigo-650 bg-indigo-50 dark:bg-indigo-950/30' },
    { title: 'Active Students', value: activeStudents, icon: UserCheck, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
    { title: 'Special Scholarship', value: specialStudents, icon: Award, color: 'text-amber-600 bg-amber-50 dark:bg-amber-955/30' },
    { title: 'Inactive / Transferred', value: otherStudents, icon: GraduationCap, color: 'text-slate-500 bg-slate-100 dark:bg-slate-800' }
  ];

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Students Directory"
        description="Search profiles, check documentation logs, manage classroom distribution, and overview roll rosters."
        breadcrumbs={[{ label: 'Students' }]}
        actions={
          !isTeacher && (
            <Button
              onClick={() => router.push('/dashboard/students/admission')}
              className="flex items-center space-x-1.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl px-5 py-2 font-bold text-xs shadow-sm"
            >
              <Plus size={16} />
              <span>Add Student</span>
            </Button>
          )
        }
      />

      {/* KPI summaries */}
      <StatCards cards={statCards} />

      {classFilter && (
        <div className="flex items-center justify-between bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/30 rounded-2xl p-4 text-xs font-semibold text-indigo-850 dark:text-indigo-300">
          <div className="flex items-center gap-2">
            <span>Active Grade Filter:</span>
            <span className="bg-indigo-600 text-white px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase">{classFilter.startsWith('Class') ? classFilter : `Class ${classFilter}`}</span>
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
          <span className="text-sm font-semibold">Updating student ledger records...</span>
        </div>
      ) : (
        <PremiumTable
          headers={['Student Name', 'Email address', 'Class & Section', 'Subject Group', 'Roll No.', 'Join Date', 'Status', 'Actions']}
          searchPlaceholder="Search by student name, email, roll..."
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
          filterPlaceholder="All Grades"
          filterOptions={classes.map(cls => ({ label: `Class ${cls}`, value: cls }))}
          totalRecords={displayedStudents.length}
        >
          {displayedStudents.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-6 py-12 text-center text-slate-455 dark:text-slate-500 text-sm font-semibold">
                No student directory profiles matched the filter criteria.
              </td>
            </tr>
          ) : (
            displayedStudents.map((student) => (
              <tr
                key={student._id}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all duration-150 group"
              >
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <button
                      onClick={() => handleOpenStudentDetails(student)}
                      className="font-bold text-left hover:underline text-indigo-650 dark:text-indigo-400 font-bold"
                    >
                      {student.firstName} {student.lastName}
                    </button>
                    {student.isSpecialChild && (
                      <span className="mt-1 self-start px-1.5 py-0.2 text-[9px] font-black uppercase bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded">
                        Special Child ({student.discountPercentage || 0}% Disc.)
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {student.email || '—'}
                </td>
                <td className="px-6 py-4 text-xs font-bold text-slate-750 dark:text-slate-300">
                  {student.class?.startsWith('Class') ? student.class : `Class ${student.class}`} — {student.section || 'N/A'}
                </td>
                <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                  {student.subjectGroup || 'N/A'}
                </td>
                <td className="px-6 py-4 text-xs font-mono font-bold text-slate-700 dark:text-slate-350">
                  {student.rollNumber || '—'}
                </td>
                <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                  {student.joinDate ? new Date(student.joinDate).toLocaleDateString() : '—'}
                </td>
                <td className="px-6 py-4 text-xs">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${
                    student.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {student.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3 print:hidden opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenStudentDetails(student)}
                      className="text-indigo-600 hover:text-indigo-800 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="View Student Profile"
                    >
                      <Eye size={15} />
                    </button>
                    {!isTeacher && (
                      <>
                        <button
                          onClick={() => router.push(`/dashboard/students/admission?edit=${student._id}`)}
                          className="text-amber-600 dark:text-amber-500 hover:text-amber-800 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Profile Details"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student._id)}
                          className="text-rose-600 dark:text-rose-500 hover:text-rose-805 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Delete Student"
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
      {viewingStudent && (
        <PremiumModal
          isOpen={!!viewingStudent}
          onClose={handleCloseStudentDetails}
          title={`${viewingStudent.firstName} ${viewingStudent.lastName} — Profile Details`}
          icon={User}
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-2 pb-4 border-b border-slate-100 dark:border-slate-850">
              <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-md overflow-hidden shrink-0">
                {viewingStudent.studentPhoto ? (
                  <img src={viewingStudent.studentPhoto} alt="Student" className="w-full h-full object-cover" />
                ) : (
                  <span>{viewingStudent.firstName?.[0]}{viewingStudent.lastName?.[0]}</span>
                )}
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-205">{viewingStudent.firstName} {viewingStudent.lastName}</h4>
                <span className={`inline-flex mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                  viewingStudent.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}>
                  Status: {viewingStudent.status}
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-850 text-xs font-bold gap-4 overflow-x-auto pb-1.5">
              {[
                { id: 'personal', label: 'Academic & Personal' },
                { id: 'address', label: 'Address & Contact' },
                { id: 'parent', label: 'Parent / Guardian' },
                { id: 'documents', label: 'Documents & Photos' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setModalTab(tab.id as any)}
                  className={`pb-2 border-b-2 transition-colors duration-155 whitespace-nowrap cursor-pointer ${
                    modalTab === tab.id
                      ? 'border-indigo-600 text-indigo-650 dark:border-indigo-500 dark:text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="pt-2">
              {modalTab === 'personal' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Admission No</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{viewingStudent.admissionNo || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Admission Date</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {viewingStudent.admissionDate ? new Date(viewingStudent.admissionDate).toLocaleDateString() : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Class</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{viewingStudent.class?.startsWith('Class') ? viewingStudent.class : `Class ${viewingStudent.class}`}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Section</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{viewingStudent.section || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Subject Group</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{viewingStudent.subjectGroup || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Roll Number</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{viewingStudent.rollNumber || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Date of Birth</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {viewingStudent.dateOfBirth ? new Date(viewingStudent.dateOfBirth).toLocaleDateString() : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Gender</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 capitalize">{viewingStudent.gender || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Blood Group</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{viewingStudent.bloodGroup || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Religion</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{viewingStudent.religion || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Height / Weight</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {viewingStudent.height ? `${viewingStudent.height} cm` : '—'} / {viewingStudent.weight ? `${viewingStudent.weight} kg` : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Discount Status</span>
                    <span className="text-sm font-bold text-indigo-650 dark:text-indigo-400">
                      {viewingStudent.isSpecialChild 
                        ? `Special Scholarship (${viewingStudent.discountPercentage || 0}% Discount)`
                        : 'Standard (No Discount)'}
                    </span>
                  </div>
                </div>
              )}

              {modalTab === 'address' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Mobile Number</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{viewingStudent.mobileNumber || viewingStudent.phone || '—'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Email Address</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{viewingStudent.email || '—'}</span>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-850 pt-3">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Address</span>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{viewingStudent.address || '—'}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-850 pt-3">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">City</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{viewingStudent.city || '—'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">State</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{viewingStudent.state || '—'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Pincode</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{viewingStudent.pincode || '—'}</span>
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'parent' && (
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Father's Name</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{viewingStudent.fatherName || '—'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Father's Phone</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{viewingStudent.fatherPhone || '—'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Father's Occupation</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{viewingStudent.fatherOccupation || '—'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-850 pt-3">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Mother's Name</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{viewingStudent.motherName || '—'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Mother's Phone</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{viewingStudent.motherPhone || '—'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Mother's Occupation</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{viewingStudent.motherOccupation || '—'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-850 pt-3">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Guardian's Name</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{viewingStudent.guardianName || '—'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Relation with Student</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{viewingStudent.relationWithStudent || '—'}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Guardian's Phone</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{viewingStudent.guardianPhone || '—'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Guardian's Email</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{viewingStudent.guardianEmail || '—'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Guardian's Occupation</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{viewingStudent.guardianOccupation || '—'}</span>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-850 pt-3">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Guardian's Address</span>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{viewingStudent.guardianAddress || '—'}</p>
                  </div>
                </div>
              )}

              {modalTab === 'documents' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Student NID No</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{viewingStudent.nidNo || '—'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Father's NID No</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{viewingStudent.fatherNidNo || '—'}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Mother's NID No</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{viewingStudent.motherNidNo || '—'}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-850 pt-3 space-y-2">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Uploaded Document Copies & Photos</span>
                    {[
                      { label: "Student's NID Card Copy", field: 'studentNidCard' },
                      { label: "Father's NID Card Copy", field: 'fatherNidCard' },
                      { label: "Mother's NID Card Copy", field: 'motherNidCard' },
                      { label: 'Birth Certificate Copy', field: 'birthCertificate' },
                      { label: "Father's Photo Copy", field: 'fatherPhoto' },
                      { label: "Mother's Photo Copy", field: 'motherPhoto' },
                      { label: "Guardian's Photo Copy", field: 'guardianPhoto' },
                    ].map((doc) => {
                      const url = viewingStudent[doc.field];
                      return (
                        <div key={doc.field} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl text-xs">
                          <span className="font-semibold text-slate-650 dark:text-slate-400">{doc.label}</span>
                          {url ? (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-650 hover:text-indigo-850 dark:text-indigo-400 dark:hover:text-indigo-305 font-bold hover:underline"
                            >
                              View Document
                            </a>
                          ) : (
                            <span className="text-slate-400 italic">Not Uploaded</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </PremiumModal>
      )}
    </div>
  );
}

export default function StudentsPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-slate-500">Loading directory...</div>}>
      <StudentsPageContent />
    </Suspense>
  );
}
