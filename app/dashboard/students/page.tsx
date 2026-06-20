'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Plus, Edit2, Trash2, Eye, X, Layers, ArrowRight, UserCheck, RefreshCw, AlertCircle, CheckCircle2, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StudentsPage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const isTeacher = user?.role === 'teacher';
  const [students, setStudents] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [subjectGroups, setSubjectGroups] = useState<any[]>([]);
  const [classFilter, setClassFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [viewingStudent, setViewingStudent] = useState<any | null>(null);
  const getTodayString = () => new Date().toISOString().split('T')[0];

  // Active Tab
  const [activeTab, setActiveTab] = useState<'directory' | 'promotions'>('directory');

  // Promotions Wizard states
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

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    class: '',
    section: '',
    subjectGroup: '',
    rollNumber: '',
    guardianName: '',
    guardianPhone: '',
    joinDate: getTodayString(),
    isSpecialChild: false,
    discountPercentage: 0,
    status: 'active',
  });

  useEffect(() => {
    fetchStudents();
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
        const matchingStudent = students.find((s) => s._id === idParam);
        if (matchingStudent) {
          setViewingStudent(matchingStudent);
        }
      }
    }
  }, [loading, students]);

  const handleClearFilter = () => {
    setClassFilter(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('class');
      url.searchParams.delete('id');
      window.history.replaceState ? window.history.replaceState(null, '', url.pathname + url.search) : window.history.pushState({}, '', url.toString());
    }
  };

  const handleCloseStudentDetails = () => {
    setViewingStudent(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('id');
      window.history.replaceState ? window.history.replaceState(null, '', url.pathname + url.search) : window.history.pushState({}, '', url.toString());
    }
  };

  const handleOpenStudentDetails = (student: any) => {
    setViewingStudent(student);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('id', student._id);
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

  const classes = Array.from(
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingStudentId) {
        // Edit student
        const response = await fetch(`/api/students/${editingStudentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const data = await response.json();
          setStudents(students.map((s) => (s._id === editingStudentId ? data.student : s)));
          resetForm();
        }
      } else {
        // Add student
        const response = await fetch('/api/students', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const data = await response.json();
          setStudents([...students, data.student]);
          resetForm();
        }
      }
    } catch (error) {
      console.error('Failed to save student:', error);
    }
  };

  const handleEditClick = (student: any) => {
    setEditingStudentId(student._id);
    setFormData({
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      email: student.email || '',
      phone: student.phone || '',
      class: student.class || '',
      section: student.section || '',
      subjectGroup: student.subjectGroup || '',
      rollNumber: student.rollNumber || '',
      guardianName: student.guardianName || '',
      guardianPhone: student.guardianPhone || '',
      joinDate: student.joinDate ? new Date(student.joinDate).toISOString().split('T')[0] : getTodayString(),
      isSpecialChild: student.isSpecialChild || false,
      discountPercentage: student.discountPercentage || 0,
      status: student.status || 'active',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      class: '',
      section: '',
      subjectGroup: '',
      rollNumber: '',
      guardianName: '',
      guardianPhone: '',
      joinDate: getTodayString(),
      isSpecialChild: false,
      discountPercentage: 0,
      status: 'active',
    });
    setEditingStudentId(null);
    setShowForm(false);
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

  const loadPromoStudents = async () => {
    if (!sourceClass) return;
    setLoadingPromoStudents(true);
    setPromoError('');
    setPromoSuccess('');
    try {
      const params = new URLSearchParams();
      params.append('class', sourceClass);
      if (sourceSection) {
        params.append('status', 'active');
      }

      const response = await fetch(`/api/students?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        // Filter by section on client side if section was selected
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
        fetchStudents(); // Refresh main directory list
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

  const displayedStudents = students.filter((s) => !classFilter || s.class === classFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight flex items-center space-x-2">
            <Layers className="text-indigo-600" size={28} />
            <span>Students Directory & Promotions</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Manage student profiles, enrollments, registrations, and academic year class promotions</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200/80 dark:border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('directory')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all duration-150 flex items-center gap-1.5 ${
            activeTab === 'directory'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-500'
              : 'border-transparent text-slate-450 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Student List
        </button>
        {!isTeacher && (
          <button
            onClick={() => setActiveTab('promotions')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all duration-150 flex items-center gap-1.5 ${
              activeTab === 'promotions'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-500'
                : 'border-transparent text-slate-455 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Class Promotions & Roll-over
          </button>
        )}
      </div>

      {activeTab === 'directory' ? (
        <div className="space-y-6 animate-in fade-in duration-250">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 border border-border/40 dark:border-slate-800 rounded-2xl shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={classFilter || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    setClassFilter(val);
                    if (typeof window !== 'undefined') {
                      const url = new URL(window.location.href);
                      url.searchParams.set('class', val);
                      window.history.replaceState ? window.history.replaceState(null, '', url.pathname + url.search) : window.history.pushState({}, '', url.toString());
                    }
                  } else {
                    handleClearFilter();
                  }
                }}
                className="px-3 py-2 border border-gray-300 dark:border-slate-800 dark:bg-slate-950 rounded-lg text-sm bg-white text-slate-805 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Filter by Class (All)</option>
                {classes.map((cls) => (
                  <option key={cls} value={cls}>Class {cls}</option>
                ))}
              </select>
            </div>

            {!isTeacher && (
              <Button
                onClick={() => {
                  if (showForm) resetForm();
                  else setShowForm(true);
                }}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-600/10 rounded-xl"
              >
                <Plus size={18} />
                <span>{showForm ? 'View List' : 'Add Student'}</span>
              </Button>
            )}
          </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6 border border-border/40">
          <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">
            {editingStudentId ? 'Edit Student Details' : 'Add New Student'}
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
              <select
                value={formData.class}
                onChange={(e) => {
                  const selectedClass = e.target.value;
                  setFormData({ ...formData, class: selectedClass, section: '', subjectGroup: '' });
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800"
                required
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls} value={cls}>Class {cls}</option>
                ))}
              </select>
              <select
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800"
                disabled={!formData.class}
              >
                <option value="">Select Section</option>
                {sections
                  .filter((sec) => sec.class === formData.class)
                  .map((sec) => (
                    <option key={sec._id} value={sec.name}>{sec.name}</option>
                  ))}
              </select>
              <select
                value={formData.subjectGroup}
                onChange={(e) => setFormData({ ...formData, subjectGroup: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800"
                disabled={!formData.class}
              >
                <option value="">Select Subject Group</option>
                {subjectGroups
                  .filter((sg) => sg.class === formData.class)
                  .map((sg) => (
                    <option key={sg._id} value={sg.name}>{sg.name}</option>
                  ))}
              </select>
              <input
                type="text"
                placeholder="Roll Number"
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Guardian Name"
                value={formData.guardianName}
                onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                placeholder="Guardian Phone"
                value={formData.guardianPhone}
                onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
              <div className="flex items-center space-x-3 pt-6">
                <label className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-350 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isSpecialChild}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      isSpecialChild: e.target.checked,
                      discountPercentage: e.target.checked ? formData.discountPercentage : 0 
                    })}
                    className="rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="font-semibold">Special Child</span>
                </label>
              </div>
              {formData.isSpecialChild && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Discount Percentage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g. 20"
                    value={formData.discountPercentage || ''}
                    onChange={(e) => setFormData({ ...formData, discountPercentage: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800"
                    required
                  />
                </div>
              )}
              {editingStudentId && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="graduated">Graduated</option>
                    <option value="transferred">Transferred</option>
                  </select>
                </div>
              )}
            </div>
            <div className="flex space-x-2 pt-2">
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                {editingStudentId ? 'Save Changes' : 'Add Student'}
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
        <div className="text-center py-12 text-slate-500">Loading students...</div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow overflow-x-auto border border-border/40">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Section</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Subject Group</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Roll Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Join Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {displayedStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500 dark:text-slate-400 font-medium">
                    {students.length === 0 ? 'No students found' : 'No students found matching this class filter'}
                  </td>
                </tr>
              ) : (
                displayedStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-200">
                      <div className="flex flex-col">
                        <button
                          onClick={() => handleOpenStudentDetails(student)}
                          className="font-bold text-left hover:underline text-indigo-655 hover:text-indigo-850 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          {student.firstName} {student.lastName}
                        </button>
                        {student.isSpecialChild && (
                          <span className="mt-1 self-start px-1.5 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-850 dark:bg-amber-950/40 dark:text-amber-400 rounded border border-amber-200/50">
                            Special ({student.discountPercentage}% Disc.)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-355">{student.email || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-355">
                      <a
                        href={`/dashboard/classes?class=${encodeURIComponent(student.class)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-650 hover:text-indigo-850 dark:text-indigo-400 dark:hover:text-indigo-350 font-bold hover:underline"
                      >
                        Class {student.class}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-350">{student.section || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-350">{student.subjectGroup || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-350">{student.rollNumber || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-350">
                      {student.joinDate ? new Date(student.joinDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm flex space-x-2.5">
                      <button onClick={() => handleOpenStudentDetails(student)} className="text-blue-600 dark:text-indigo-400 hover:text-blue-800 dark:hover:text-indigo-350">
                        <Eye size={18} />
                      </button>
                      {!isTeacher && (
                        <>
                          <button onClick={() => handleEditClick(student)} className="text-yellow-600 dark:text-amber-500 hover:text-yellow-800 dark:hover:text-amber-450">
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student._id)}
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

        </div>
      ) : (
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
                  <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 px-2 py-0.5 text-xs rounded-full">Step 1</span>
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
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                    >
                      <option value="">Select Source Class</option>
                      {uniqueClasses.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
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
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold disabled:opacity-50"
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
                  <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-655 dark:text-indigo-400 px-2 py-0.5 text-xs rounded-full">Step 2</span>
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
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                      required
                    >
                      <option value="">Select Target Class</option>
                      {uniqueClasses.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
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
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold disabled:opacity-50"
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
      )}

      {/* Details View Modal */}
      {viewingStudent && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={handleCloseStudentDetails} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border border-border/80 rounded-3xl shadow-2xl z-50 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Student Profile Details</h3>
              <button onClick={handleCloseStudentDetails} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md shadow-indigo-500/20">
                  {viewingStudent.firstName?.[0]}{viewingStudent.lastName?.[0]}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">{viewingStudent.firstName} {viewingStudent.lastName}</h4>
                  <span className="inline-flex mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/30 capitalize">
                    Student - Active
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-4">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <a
                      href={`/dashboard/classes?class=${encodeURIComponent(viewingStudent.class)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-650 hover:text-indigo-850 dark:text-indigo-400 dark:hover:text-indigo-350 font-bold hover:underline"
                    >
                      Class {viewingStudent.class}
                    </a>
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Section</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{viewingStudent.section || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subject Group</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{viewingStudent.subjectGroup || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Roll Number</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{viewingStudent.rollNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate block">{viewingStudent.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{viewingStudent.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Guardian Name</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{viewingStudent.guardianName || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Guardian Phone</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{viewingStudent.guardianPhone || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Join Date</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {viewingStudent.joinDate ? new Date(viewingStudent.joinDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Discount Status</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {viewingStudent.isSpecialChild 
                      ? `Special Child (${viewingStudent.discountPercentage || 0}% Discount)`
                      : 'None'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <Button onClick={handleCloseStudentDetails} className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/80 dark:text-slate-300 font-semibold px-5 rounded-xl border border-border/20">
                Close
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
