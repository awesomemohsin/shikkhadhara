'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Plus, Edit2, Trash2, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StudentsPage() {
  const token = useAuthStore((state) => state.token);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [viewingStudent, setViewingStudent] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    class: '',
    rollNumber: '',
    guardianName: '',
    guardianPhone: '',
    status: 'active',
  });

  useEffect(() => {
    fetchStudents();
  }, []);

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
      rollNumber: student.rollNumber || '',
      guardianName: student.guardianName || '',
      guardianPhone: student.guardianPhone || '',
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
      rollNumber: '',
      guardianName: '',
      guardianPhone: '',
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Students</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">Manage all students in your organization</p>
        </div>
        <Button
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus size={20} />
          <span>{showForm ? 'View List' : 'Add Student'}</span>
        </Button>
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
              <input
                type="text"
                placeholder="Class"
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Roll Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-slate-400">
                    No students found
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-200">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-350">{student.email || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-350">Class {student.class}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-350">{student.rollNumber || 'N/A'}</td>
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
                      <button onClick={() => setViewingStudent(student)} className="text-blue-600 dark:text-indigo-400 hover:text-blue-800 dark:hover:text-indigo-350">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => handleEditClick(student)} className="text-yellow-600 dark:text-amber-500 hover:text-yellow-800 dark:hover:text-amber-450">
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student._id)}
                        className="text-red-600 dark:text-rose-500 hover:text-red-800 dark:hover:text-rose-450"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Details View Modal */}
      {viewingStudent && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setViewingStudent(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border border-border/80 rounded-3xl shadow-2xl z-50 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Student Profile Details</h3>
              <button onClick={() => setViewingStudent(null)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
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
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Class {viewingStudent.class}</span>
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
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <Button onClick={() => setViewingStudent(null)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/80 dark:text-slate-300 font-semibold px-5 rounded-xl border border-border/20">
                Close
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
