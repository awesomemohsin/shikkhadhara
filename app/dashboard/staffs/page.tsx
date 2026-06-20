'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Plus, Edit2, Trash2, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StaffsPage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const isTeacher = user?.role === 'teacher';
  const [teachers, setTeachers] = useState<any[]>([]);
  const getTodayString = () => new Date().toISOString().split('T')[0];

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [viewingTeacher, setViewingTeacher] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    qualification: '',
    specialization: '',
    subjects: [] as string[],
    assignedClasses: [] as string[],
    salary: '',
    joinDate: getTodayString(),
    position: 'teacher',
    status: 'active',
  });

  const [sections, setSections] = useState<any[]>([]);
  const [subjectGroups, setSubjectGroups] = useState<any[]>([]);

  const [classFilter, setClassFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchTeachers();
    fetchAcademics();
  }, []);

  useEffect(() => {
    if (!loading && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const classParam = params.get('class');
      const idParam = params.get('id');

      if (classParam) {
        setClassFilter(classParam);
      }
      if (idParam) {
        const matchingTeacher = teachers.find((t) => t._id === idParam);
        if (matchingTeacher) {
          setViewingTeacher(matchingTeacher);
        }
      }
    }
  }, [loading, teachers]);

  const handleClearFilter = () => {
    setClassFilter(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('class');
      url.searchParams.delete('id');
      window.history.replaceState ? window.history.replaceState(null, '', url.pathname + url.search) : window.history.pushState({}, '', url.toString());
    }
  };

  const handleCloseTeacherDetails = () => {
    setViewingTeacher(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('id');
      window.history.replaceState ? window.history.replaceState(null, '', url.pathname + url.search) : window.history.pushState({}, '', url.toString());
    }
  };

  const handleOpenTeacherDetails = (teacher: any) => {
    setViewingTeacher(teacher);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('id', teacher._id);
      window.history.replaceState ? window.history.replaceState(null, '', url.pathname + url.search) : window.history.pushState({}, '', url.toString());
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

  const allSubjects = Array.from(new Set(
    subjectGroups.flatMap(sg => sg.subjects || [])
  )).filter(Boolean).sort();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formattedData = {
      ...formData,
      subjects: formData.subjects,
      assignedClasses: formData.assignedClasses,
      salary: parseFloat(formData.salary) || 0,
    };

    try {
      if (editingTeacherId) {
        // Edit staff
        const response = await fetch(`/api/staffs/${editingTeacherId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formattedData),
        });

        if (response.ok) {
          const data = await response.json();
          setTeachers(teachers.map((t) => (t._id === editingTeacherId ? data.teacher : t)));
          resetForm();
        }
      } else {
        // Add staff
        const response = await fetch('/api/staffs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formattedData),
        });

        if (response.ok) {
          const data = await response.json();
          setTeachers([...teachers, data.teacher]);
          resetForm();
        }
      }
    } catch (error) {
      console.error('Failed to save staff member:', error);
    }
  };

  const handleEditClick = (teacher: any) => {
    setEditingTeacherId(teacher._id);
    setFormData({
      firstName: teacher.firstName || '',
      lastName: teacher.lastName || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      qualification: teacher.qualification || '',
      specialization: teacher.specialization || '',
      subjects: teacher.subjects || [],
      assignedClasses: teacher.assignedClasses || [],
      salary: teacher.salary?.toString() || '',
      joinDate: teacher.joinDate ? new Date(teacher.joinDate).toISOString().split('T')[0] : getTodayString(),
      position: teacher.position || 'teacher',
      status: teacher.status || 'active',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      qualification: '',
      specialization: '',
      subjects: [],
      assignedClasses: [],
      salary: '',
      joinDate: getTodayString(),
      position: 'teacher',
      status: 'active',
    });
    setEditingTeacherId(null);
    setShowForm(false);
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
    if (!classFilter) return true;
    return t.assignedClasses?.some((c: string) => c.startsWith(`${classFilter} - `) || c === classFilter);
  });

  const getRoleLabel = (pos: string) => {
    switch (pos) {
      case 'teacher': return 'Teacher';
      case 'senior_teacher': return 'Senior Teacher';
      case 'headmaster': return 'Headmaster';
      case 'associate_headmaster': return 'Associate Headmaster';
      case 'other': return 'Other / Support Staff';
      default: return pos || 'Teacher';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Staffs</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">Manage all staffs and institutional employees</p>
        </div>
        {!isTeacher && (
          <Button
            onClick={() => {
              if (showForm) resetForm();
              else setShowForm(true);
            }}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus size={20} />
            <span>{showForm ? 'View List' : 'Add Staff'}</span>
          </Button>
        )}
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6 border border-border/40">
          <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">
            {editingTeacherId ? 'Edit Staff Details' : 'Add New Staff'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Qualification (e.g., B.Ed, M.Ed)"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Specialization"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Designation / Role</label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  required
                >
                  <option value="teacher">Teacher</option>
                  <option value="senior_teacher">Senior Teacher</option>
                  <option value="headmaster">Headmaster</option>
                  <option value="associate_headmaster">Associate Headmaster</option>
                  <option value="other">Other / Support Staff</option>
                </select>
              </div>

              <input
                type="number"
                placeholder="Monthly Salary"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <div className="flex flex-col border border-gray-300 dark:border-slate-800 rounded-lg p-3 max-h-40 overflow-y-auto">
                <span className="text-xs font-semibold text-slate-400 uppercase mb-2">Assigned Classes</span>
                {sections.length === 0 ? (
                  <span className="text-xs text-slate-500">No class-sections configured.</span>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sections.map((sec) => {
                      const label = `${sec.class} - ${sec.name}`;
                      const isChecked = formData.assignedClasses.includes(label);
                      return (
                        <label key={sec._id} className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-350 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const updated = e.target.checked
                                ? [...formData.assignedClasses, label]
                                : formData.assignedClasses.filter((c) => c !== label);
                              setFormData({ ...formData, assignedClasses: updated });
                            }}
                            className="rounded border-gray-300 focus:ring-blue-500"
                          />
                          <span>Class {label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex flex-col border border-gray-300 dark:border-slate-800 rounded-lg p-3 max-h-40 overflow-y-auto">
                <span className="text-xs font-semibold text-slate-400 uppercase mb-2">Subjects</span>
                {allSubjects.length === 0 ? (
                  <span className="text-xs text-slate-500">No subjects configured.</span>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {allSubjects.map((sub) => {
                      const isChecked = formData.subjects.includes(sub);
                      return (
                        <label key={sub} className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-355 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const updated = e.target.checked
                                ? [...formData.subjects, sub]
                                : formData.subjects.filter((s) => s !== sub);
                              setFormData({ ...formData, subjects: updated });
                            }}
                            className="rounded border-gray-300 focus:ring-blue-500"
                          />
                          <span>{sub}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Join Date</label>
                <input
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-2 pt-2">
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                {editingTeacherId ? 'Save Changes' : 'Add Staff'}
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
        </div>
      )}

      {classFilter && (
        <div className="flex items-center justify-between bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/30 rounded-2xl p-4 text-sm text-indigo-850 dark:text-indigo-300">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-350">Active Filter:</span>
            <span className="bg-indigo-600 text-white px-2.5 py-0.5 rounded-lg text-xs font-bold">Class: {classFilter}</span>
          </div>
          <button
            onClick={handleClearFilter}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline"
          >
            Clear Filter
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading staffs...</div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow overflow-x-auto border border-border/40">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Designation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Subjects</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Qualification</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Join Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {displayedTeachers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-slate-400 font-medium">
                    {teachers.length === 0 ? 'No staff found' : 'No staff found matching this class filter'}
                  </td>
                </tr>
              ) : (
                displayedTeachers.map((teacher) => (
                  <tr key={teacher._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-200">
                      {teacher.firstName} {teacher.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-300 font-medium">
                      {getRoleLabel(teacher.position)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-350">{teacher.email || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-355">
                      {teacher.subjects?.join(', ') || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-350">{teacher.qualification || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-350">
                      {teacher.joinDate ? new Date(teacher.joinDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        teacher.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {teacher.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm flex space-x-2.5">
                      <button onClick={() => handleOpenTeacherDetails(teacher)} className="text-blue-600 dark:text-indigo-400 hover:text-blue-800 dark:hover:text-indigo-350">
                        <Eye size={18} />
                      </button>
                      {!isTeacher && (
                        <>
                          <button onClick={() => handleEditClick(teacher)} className="text-yellow-600 dark:text-amber-500 hover:text-yellow-800 dark:hover:text-amber-450">
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteTeacher(teacher._id)}
                            className="text-red-600 dark:text-rose-500 hover:text-red-800 dark:hover:text-rose-450"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Details View Modal */}
      {viewingTeacher && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={handleCloseTeacherDetails} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border border-border/80 rounded-3xl shadow-2xl z-50 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Staff Profile Details</h3>
              <button onClick={handleCloseTeacherDetails} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md shadow-indigo-500/20">
                  {viewingTeacher.firstName?.[0]}{viewingTeacher.lastName?.[0]}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">{viewingTeacher.firstName} {viewingTeacher.lastName}</h4>
                  <span className="inline-flex mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/30 capitalize">
                    {getRoleLabel(viewingTeacher.position)} - Active
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-4">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Designation</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 capitalize">{getRoleLabel(viewingTeacher.position)}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Qualification</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{viewingTeacher.qualification || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Specialization</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{viewingTeacher.specialization || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subjects</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{viewingTeacher.subjects?.join(', ') || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly Salary</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{viewingTeacher.salary ? `${viewingTeacher.salary.toLocaleString()} BDT` : 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{viewingTeacher.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Join Date</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {viewingTeacher.joinDate ? new Date(viewingTeacher.joinDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">{viewingTeacher.email || 'N/A'}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Assigned Classes</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {!viewingTeacher.assignedClasses || viewingTeacher.assignedClasses.length === 0 ? (
                      <span className="text-xs text-slate-500 italic">No classes assigned.</span>
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
            
            <div className="mt-8 flex justify-end">
              <Button onClick={handleCloseTeacherDetails} className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/80 dark:text-slate-300 font-semibold px-5 rounded-xl border border-border/20">
                Close
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
