'use client';

import { useEffect, useState, Suspense } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Briefcase, Plus, Save, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

function StaffFormPageContent() {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingTeacherId = searchParams.get('edit');

  const getTodayString = () => new Date().toISOString().split('T')[0];

  const [sections, setSections] = useState<any[]>([]);
  const [subjectGroups, setSubjectGroups] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    fetchAcademics();
  }, []);

  useEffect(() => {
    if (editingTeacherId && token) {
      fetch(`/api/staffs/${editingTeacherId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        const teacher = data.teacher;
        if (teacher) {
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
        }
      })
      .catch(err => console.error('Failed to load staff details for editing:', err));
    }
  }, [editingTeacherId, token]);

  const fetchAcademics = async () => {
    try {
      const resSec = await fetch('/api/sections', { headers: { Authorization: `Bearer ${token}` } });
      if (resSec.ok) {
        const dataSec = await resSec.json();
        setSections(dataSec.sections || []);
      }
    } catch (err) {
      console.error('Failed to fetch sections:', err);
    }

    try {
      const resSub = await fetch('/api/subject-groups', { headers: { Authorization: `Bearer ${token}` } });
      if (resSub.ok) {
        const dataSub = await resSub.json();
        setSubjectGroups(dataSub.subjectGroups || []);
      }
    } catch (err) {
      console.error('Failed to fetch subject groups:', err);
    }
  };

  const allSubjects = Array.from(new Set(
    subjectGroups.flatMap(sg => sg.subjects || [])
  )).filter(Boolean).sort();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const formattedData = {
      ...formData,
      subjects: formData.subjects,
      assignedClasses: formData.assignedClasses,
      salary: parseFloat(formData.salary) || 0,
    };

    try {
      if (editingTeacherId) {
        const response = await fetch(`/api/staffs/${editingTeacherId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formattedData),
        });

        if (response.ok) {
          router.push('/dashboard/staffs');
        } else {
          alert('Failed to update staff member');
        }
      } else {
        const response = await fetch('/api/staffs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formattedData),
        });

        if (response.ok) {
          router.push('/dashboard/staffs');
        } else {
          alert('Failed to register staff member');
        }
      }
    } catch (error) {
      console.error('Failed to save staff member:', error);
      alert('Network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-955 dark:text-white tracking-tight flex items-center space-x-2">
            <Briefcase className="text-indigo-600" size={28} />
            <span>{editingTeacherId ? 'Edit Staff Profile' : 'Staff Admission'}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            {editingTeacherId ? 'Modify credentials, designations, and class schedules' : 'Register and enroll a new employee in the institution roster'}
          </p>
        </div>
      </div>

      <div className="bg-slate-50/50 dark:bg-slate-955/10 rounded-3xl p-6 border border-border/40 shadow-inner">
        <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6">
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Briefcase className="text-indigo-650" size={24} />
            <span>{editingTeacherId ? 'Modify Staff Record' : 'Institutional Staff Registration Form'}</span>
          </h2>
          <Button
            type="button"
            onClick={() => router.push('/dashboard/staffs')}
            className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <X size={14} />
            <span>Cancel & Go Back</span>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">Personal & Contact Info</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">First Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Last Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="name@institution.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                <input
                  type="tel"
                  placeholder="Contact number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">Academic & Position Registry</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Qualification (e.g. B.Ed, M.Ed, PhD)</label>
                <input
                  type="text"
                  placeholder="Highest degree"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Specialization</label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics, Sciences"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Designation / Role <span className="text-red-500">*</span></label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                  required
                >
                  <option value="teacher">Teacher</option>
                  <option value="senior_teacher">Senior Teacher</option>
                  <option value="headmaster">Headmaster</option>
                  <option value="associate_headmaster">Associate Headmaster</option>
                  <option value="other">Other / Support Staff</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Monthly Salary (BDT)</label>
                <input
                  type="number"
                  placeholder="Monthly pay"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Join Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status <span className="text-red-500">*</span></label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-col border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-950/20 max-h-56 overflow-y-auto">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Assign Classes & Sections</span>
                {sections.length === 0 ? (
                  <span className="text-xs text-slate-400 italic font-semibold">No class-sections configured.</span>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5">
                    {sections.map((sec) => {
                      const label = `${sec.class} - ${sec.name}`;
                      const isChecked = formData.assignedClasses.includes(label);
                      return (
                        <label key={sec._id} className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:text-indigo-650 transition-colors">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const updated = e.target.checked
                                ? [...formData.assignedClasses, label]
                                : formData.assignedClasses.filter((c) => c !== label);
                              setFormData({ ...formData, assignedClasses: updated });
                            }}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                          />
                          <span>Class {label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex flex-col border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-950/20 max-h-56 overflow-y-auto">
                <span className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3">Assign Subjects</span>
                {allSubjects.length === 0 ? (
                  <span className="text-xs text-slate-400 italic font-semibold">No subjects configured.</span>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5">
                    {allSubjects.map((sub) => {
                      const isChecked = formData.subjects.includes(sub);
                      return (
                        <label key={sub} className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:text-indigo-650 transition-colors">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const updated = e.target.checked
                                ? [...formData.subjects, sub]
                                : formData.subjects.filter((s) => s !== sub);
                              setFormData({ ...formData, subjects: updated });
                            }}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                          />
                          <span>{sub}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-indigo-650 hover:bg-indigo-750 text-white font-bold px-6 py-3 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? <RefreshCw className="animate-spin" size={16} /> : <Save size={18} />}
              <span>{editingTeacherId ? 'Save Changes' : 'Register Staff'}</span>
            </Button>
            <Button
              type="button"
              onClick={() => router.push('/dashboard/staffs')}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-650 dark:text-slate-300 font-bold px-6 py-3 rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StaffFormPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-slate-500">Loading form...</div>}>
      <StaffFormPageContent />
    </Suspense>
  );
}
