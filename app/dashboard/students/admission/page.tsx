'use client';

import { useEffect, useState, Suspense } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Lock, Upload, Camera, RefreshCw, CheckCircle2, User, Layers, FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

function AdmissionPageContent() {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingStudentId = searchParams.get('edit');

  const [sections, setSections] = useState<any[]>([]);
  const [subjectGroups, setSubjectGroups] = useState<any[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<{ [key: string]: boolean }>({});
  
  const getTodayString = () => new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    admissionNo: '',
    admissionDate: getTodayString(),
    rollNumber: '',
    class: '',
    section: '',
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    bloodGroup: '',
    category: '',
    religion: '',
    mobileNumber: '',
    email: '',
    nidNo: '',
    house: '',
    height: 0,
    weight: 0,
    address: '',
    city: '',
    state: '',
    pincode: '',
    fatherName: '',
    fatherPhone: '',
    fatherOccupation: '',
    motherName: '',
    motherPhone: '',
    motherOccupation: '',
    guardianName: '',
    relationWithStudent: '',
    guardianPhone: '',
    guardianEmail: '',
    guardianOccupation: '',
    guardianAddress: '',
    fatherNidNo: '',
    motherNidNo: '',
    studentPhoto: '',
    fatherPhoto: '',
    motherPhoto: '',
    guardianPhoto: '',
    studentNidCard: '',
    fatherNidCard: '',
    motherNidCard: '',
    birthCertificate: '',
    subjectGroup: '',
    phone: '',
    joinDate: getTodayString(),
    isSpecialChild: false,
    discountPercentage: 0,
    status: 'active',
  });

  useEffect(() => {
    fetchAcademics();
  }, []);

  useEffect(() => {
    if (editingStudentId && token) {
      fetch(`/api/students/${editingStudentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        const student = data.student;
        if (student) {
          setFormData({
            admissionNo: student.admissionNo || '',
            admissionDate: student.admissionDate ? new Date(student.admissionDate).toISOString().split('T')[0] : getTodayString(),
            rollNumber: student.rollNumber || '',
            class: student.class || '',
            section: student.section || '',
            firstName: student.firstName || '',
            lastName: student.lastName || '',
            gender: student.gender || '',
            dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
            bloodGroup: student.bloodGroup || '',
            category: student.category || '',
            religion: student.religion || '',
            mobileNumber: student.mobileNumber || '',
            email: student.email || '',
            nidNo: student.nidNo || '',
            house: student.house || '',
            height: student.height || 0,
            weight: student.weight || 0,
            address: student.address || '',
            city: student.city || '',
            state: student.state || '',
            pincode: student.pincode || '',
            fatherName: student.fatherName || '',
            fatherPhone: student.fatherPhone || '',
            fatherOccupation: student.fatherOccupation || '',
            motherName: student.motherName || '',
            motherPhone: student.motherPhone || '',
            motherOccupation: student.motherOccupation || '',
            guardianName: student.guardianName || '',
            relationWithStudent: student.relationWithStudent || '',
            guardianPhone: student.guardianPhone || '',
            guardianEmail: student.guardianEmail || '',
            guardianOccupation: student.guardianOccupation || '',
            guardianAddress: student.guardianAddress || '',
            fatherNidNo: student.fatherNidNo || '',
            motherNidNo: student.motherNidNo || '',
            studentPhoto: student.studentPhoto || '',
            fatherPhoto: student.fatherPhoto || '',
            motherPhoto: student.motherPhoto || '',
            guardianPhoto: student.guardianPhoto || '',
            studentNidCard: student.studentNidCard || '',
            fatherNidCard: student.fatherNidCard || '',
            motherNidCard: student.motherNidCard || '',
            birthCertificate: student.birthCertificate || '',
            subjectGroup: student.subjectGroup || '',
            phone: student.phone || '',
            joinDate: student.joinDate ? new Date(student.joinDate).toISOString().split('T')[0] : getTodayString(),
            isSpecialChild: student.isSpecialChild || false,
            discountPercentage: student.discountPercentage || 0,
            status: student.status || 'active',
          });
        }
      })
      .catch(err => console.error('Failed to load student details for editing:', err));
    }
  }, [editingStudentId, token]);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFiles(prev => ({ ...prev, [fieldName]: true }));
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataUpload,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          [fieldName]: data.url,
        }));
      } else {
        alert('File upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('File upload failed due to network error');
    } finally {
      setUploadingFiles(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingStudentId) {
        const response = await fetch(`/api/students/${editingStudentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          router.push('/dashboard/students');
        } else {
          alert('Failed to update student profile');
        }
      } else {
        const response = await fetch('/api/students', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          router.push('/dashboard/students');
        } else {
          alert('Failed to submit student admission');
        }
      }
    } catch (error) {
      console.error('Failed to save student:', error);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-955 dark:text-white tracking-tight flex items-center space-x-2">
            <User className="text-indigo-600" size={28} />
            <span>{editingStudentId ? 'Edit Student Details' : 'Student Admission'}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            {editingStudentId ? 'Modify student registry records and uploaded files' : 'Register and enroll a new student profile in the system'}
          </p>
        </div>
      </div>

      <div className="bg-slate-50/50 dark:bg-slate-950/20 rounded-3xl p-6 border border-border/40 shadow-inner">
        <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6">
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <User className="text-indigo-650" size={24} />
            <span>{editingStudentId ? 'Edit Student Details' : 'Student Admission Form'}</span>
          </h2>
          <Button
            type="button"
            onClick={() => router.push('/dashboard/students')}
            className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
          >
            <X size={14} />
            <span>Cancel & Go Back</span>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Column - 2/3 Width */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Basic Details Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="bg-blue-600 dark:bg-blue-750 px-5 py-3.5 text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                  <User size={16} />
                  <span>Basic Details</span>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Admission No <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.admissionNo}
                      onChange={(e) => setFormData({ ...formData, admissionNo: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-slate-850 dark:text-slate-202 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Roll Number</label>
                    <input
                      type="text"
                      value={formData.rollNumber}
                      onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-202 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Admission Date <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={formData.admissionDate}
                      onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-202 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Class <span className="text-red-500">*</span></label>
                    <select
                      value={formData.class}
                      onChange={(e) => {
                        const selectedClass = e.target.value;
                        setFormData({ ...formData, class: selectedClass, section: '', subjectGroup: '' });
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-202 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                      required
                    >
                      <option value="">Select Class</option>
                      {classes.map((cls) => (
                        <option key={cls} value={cls}>Class {cls}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Section <span className="text-red-500">*</span></label>
                    <select
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-202 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                      disabled={!formData.class}
                      required
                    >
                      <option value="">Select Section</option>
                      {sections
                        .filter((sec) => sec.class === formData.class)
                        .map((sec) => (
                          <option key={sec._id} value={sec.name}>{sec.name}</option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Subject Group</label>
                    <select
                      value={formData.subjectGroup}
                      onChange={(e) => setFormData({ ...formData, subjectGroup: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-202 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                      disabled={!formData.class}
                    >
                      <option value="">Select Subject Group</option>
                      {subjectGroups
                        .filter((sg) => sg.class === formData.class)
                        .map((sg) => (
                          <option key={sg._id} value={sg.name}>{sg.name}</option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">First Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-202 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-202 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Gender <span className="text-red-500">*</span></label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-202 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date of Birth <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-202 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Blood Group</label>
                    <select
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-202 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                    >
                      <option value="">Select Blood Group</option>
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>


                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Religion</label>
                    <input
                      type="text"
                      value={formData.religion}
                      onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-202 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mobile Number</label>
                    <input
                      type="text"
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-202 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-202 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">NID No</label>
                    <input
                      type="text"
                      placeholder="National ID Number"
                      value={formData.nidNo}
                      onChange={(e) => setFormData({ ...formData, nidNo: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-202 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Enter National ID number (optional)</span>
                  </div>


                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Height (cm)</label>
                    <input
                      type="number"
                      value={formData.height || ''}
                      onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-202 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Weight (kg)</label>
                    <input
                      type="number"
                      value={formData.weight || ''}
                      onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-202 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <label className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer pt-6">
                      <input
                        type="checkbox"
                        checked={formData.isSpecialChild}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          isSpecialChild: e.target.checked,
                          discountPercentage: e.target.checked ? formData.discountPercentage : 0 
                        })}
                        className="rounded border-gray-300 text-indigo-650 focus:ring-indigo-500 h-4 w-4"
                      />
                      <span className="font-bold">Special Child Status</span>
                    </label>
                  </div>

                  {formData.isSpecialChild && (
                    <div className="md:col-span-3">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Discount Percentage (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="e.g. 20"
                        value={formData.discountPercentage || ''}
                        onChange={(e) => setFormData({ ...formData, discountPercentage: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-202 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                        required
                      />
                    </div>
                  )}

                  {editingStudentId && (
                    <div className="md:col-span-3">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-202 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="graduated">Graduated</option>
                        <option value="transferred">Transferred</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Address Information Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="bg-blue-600 dark:bg-blue-750 px-5 py-3.5 text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                  <Layers size={16} />
                  <span>Address Information</span>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Address</label>
                    <textarea
                      rows={3}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-202 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-202 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">State</label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-202 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pincode</label>
                      <input
                        type="text"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-202 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Parent/Guardian Information Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="bg-blue-600 dark:bg-blue-750 px-5 py-3.5 text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                  <User size={16} />
                  <span>Parent/Guardian Information</span>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Father's Name</label>
                      <input
                        type="text"
                        value={formData.fatherName}
                        onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-202 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Father's Phone</label>
                      <input
                        type="text"
                        value={formData.fatherPhone}
                        onChange={(e) => setFormData({ ...formData, fatherPhone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-202 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Father's Occupation</label>
                    <input
                      type="text"
                      value={formData.fatherOccupation}
                      onChange={(e) => setFormData({ ...formData, fatherOccupation: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-202 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mother's Name</label>
                      <input
                        type="text"
                        value={formData.motherName}
                        onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-202 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mother's Phone</label>
                      <input
                        type="text"
                        value={formData.motherPhone}
                        onChange={(e) => setFormData({ ...formData, motherPhone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-202 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mother's Occupation</label>
                    <input
                      type="text"
                      value={formData.motherOccupation}
                      onChange={(e) => setFormData({ ...formData, motherOccupation: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-202 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Guardian's Name</label>
                      <input
                        type="text"
                        value={formData.guardianName}
                        onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-202 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Relation with Student</label>
                      <input
                        type="text"
                        value={formData.relationWithStudent}
                        onChange={(e) => setFormData({ ...formData, relationWithStudent: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-202 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Guardian's Phone</label>
                      <input
                        type="text"
                        value={formData.guardianPhone}
                        onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-202 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Guardian's Email</label>
                      <input
                        type="email"
                        value={formData.guardianEmail}
                        onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-202 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Guardian's Occupation</label>
                    <input
                      type="text"
                      value={formData.guardianOccupation}
                      onChange={(e) => setFormData({ ...formData, guardianOccupation: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-202 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Guardian's Address</label>
                    <textarea
                      rows={2}
                      value={formData.guardianAddress}
                      onChange={(e) => setFormData({ ...formData, guardianAddress: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-202 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Father's NID No</label>
                      <input
                        type="text"
                        placeholder="National ID Number"
                        value={formData.fatherNidNo}
                        onChange={(e) => setFormData({ ...formData, fatherNidNo: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-202 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Enter National ID number (optional)</span>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mother's NID No</label>
                      <input
                        type="text"
                        placeholder="National ID Number"
                        value={formData.motherNidNo}
                        onChange={(e) => setFormData({ ...formData, motherNidNo: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-202 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Enter National ID number (optional)</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column - 1/3 Width */}
            <div className="space-y-6">
              
              {/* Student Photo Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="bg-blue-600 dark:bg-blue-750 px-5 py-3.5 text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                  <Camera size={16} />
                  <span>Student Photo</span>
                </div>
                <div className="p-6 flex flex-col items-center">
                  <div className="border border-dashed border-gray-300 dark:border-slate-800 rounded-2xl w-40 aspect-[4/5] flex items-center justify-center bg-slate-50/50 dark:bg-slate-955/20 relative overflow-hidden group">
                    {formData.studentPhoto ? (
                      <>
                        <img src={formData.studentPhoto} alt="Student Profile" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <label className="cursor-pointer bg-white/20 hover:bg-white/40 text-white rounded-full p-2.5 backdrop-blur-md transition-colors">
                            <Camera size={20} />
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'studentPhoto')} className="hidden" />
                          </label>
                        </div>
                      </>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full text-slate-450 hover:text-indigo-550 transition-colors p-4 text-center">
                        {uploadingFiles.studentPhoto ? (
                          <RefreshCw className="animate-spin text-indigo-550 mb-2" size={28} />
                        ) : (
                          <Camera className="mb-2" size={28} />
                        )}
                        <span className="text-xs font-bold">Choose File</span>
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'studentPhoto')} className="hidden" />
                      </label>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-3 text-center">Max file size: 2MB. Allowed formats: JPG, PNG, GIF</p>
                </div>
              </div>

              {/* Parent Photos Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="bg-cyan-550 dark:bg-cyan-700 px-5 py-3.5 text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                  <User size={16} />
                  <span>Parent Photos</span>
                </div>
                <div className="p-6 grid grid-cols-3 gap-3">
                  {/* Father Photo */}
                  <div className="flex flex-col items-center">
                    <div className="border border-dashed border-gray-300 dark:border-slate-800 rounded-xl w-full aspect-square flex items-center justify-center bg-slate-50/50 dark:bg-slate-955/20 relative overflow-hidden group">
                      {formData.fatherPhoto ? (
                        <>
                          <img src={formData.fatherPhoto} alt="Father" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <label className="cursor-pointer bg-white/20 hover:bg-white/40 text-white rounded-full p-1 backdrop-blur-sm transition-colors">
                              <Camera size={12} />
                              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'fatherPhoto')} className="hidden" />
                            </label>
                          </div>
                        </>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-indigo-550 transition-colors">
                          {uploadingFiles.fatherPhoto ? (
                            <RefreshCw className="animate-spin text-indigo-550" size={16} />
                          ) : (
                            <Camera size={16} />
                          )}
                          <span className="text-[8px] mt-1 font-bold">Choose</span>
                          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'fatherPhoto')} className="hidden" />
                        </label>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 font-semibold">Father</span>
                    <span className="text-[8px] text-slate-400">Optional</span>
                  </div>

                  {/* Mother Photo */}
                  <div className="flex flex-col items-center">
                    <div className="border border-dashed border-gray-300 dark:border-slate-800 rounded-xl w-full aspect-square flex items-center justify-center bg-slate-50/50 dark:bg-slate-955/20 relative overflow-hidden group">
                      {formData.motherPhoto ? (
                        <>
                          <img src={formData.motherPhoto} alt="Mother" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <label className="cursor-pointer bg-white/20 hover:bg-white/40 text-white rounded-full p-1 backdrop-blur-sm transition-colors">
                              <Camera size={12} />
                              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'motherPhoto')} className="hidden" />
                            </label>
                          </div>
                        </>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-indigo-550 transition-colors">
                          {uploadingFiles.motherPhoto ? (
                            <RefreshCw className="animate-spin text-indigo-550" size={16} />
                          ) : (
                            <Camera size={16} />
                          )}
                          <span className="text-[8px] mt-1 font-bold">Choose</span>
                          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'motherPhoto')} className="hidden" />
                        </label>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 font-semibold">Mother</span>
                    <span className="text-[8px] text-slate-400">Optional</span>
                  </div>

                  {/* Guardian Photo */}
                  <div className="flex flex-col items-center">
                    <div className="border border-dashed border-gray-300 dark:border-slate-800 rounded-xl w-full aspect-square flex items-center justify-center bg-slate-50/50 dark:bg-slate-955/20 relative overflow-hidden group">
                      {formData.guardianPhoto ? (
                        <>
                          <img src={formData.guardianPhoto} alt="Guardian" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <label className="cursor-pointer bg-white/20 hover:bg-white/40 text-white rounded-full p-1 backdrop-blur-sm transition-colors">
                              <Camera size={12} />
                              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'guardianPhoto')} className="hidden" />
                            </label>
                          </div>
                        </>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-indigo-550 transition-colors">
                          {uploadingFiles.guardianPhoto ? (
                            <RefreshCw className="animate-spin text-indigo-550" size={16} />
                          ) : (
                            <Camera size={16} />
                          )}
                          <span className="text-[8px] mt-1 font-bold">Choose</span>
                          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'guardianPhoto')} className="hidden" />
                        </label>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 font-semibold">Guardian</span>
                    <span className="text-[8px] text-slate-400">Optional</span>
                  </div>
                </div>
              </div>

              {/* Documents Upload Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="bg-amber-500 dark:bg-amber-650 px-5 py-3.5 text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                  <FileText size={16} />
                  <span>Documents Upload</span>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    { label: "Student's NID Card", field: 'studentNidCard', helper: 'Upload NID card copy (optional)' },
                    { label: "Father's NID Card", field: 'fatherNidCard', helper: 'Upload NID card copy (optional)' },
                    { label: "Mother's NID Card", field: 'motherNidCard', helper: 'Upload NID card copy (optional)' },
                    { label: 'Birth Certificate', field: 'birthCertificate', helper: 'Upload birth certificate (optional)' },
                  ].map((doc) => (
                    <div key={doc.field} className="flex flex-col">
                      <span className="text-xs font-bold text-slate-500 mb-1.5">{doc.label}</span>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-slate-700 dark:text-slate-350 rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-805 shrink-0 transition-colors">
                          <Upload size={14} />
                          <span>Choose File</span>
                          <input type="file" onChange={(e) => handleFileUpload(e, doc.field)} className="hidden" />
                        </label>
                        <span className="text-xs text-slate-450 truncate">
                          {uploadingFiles[doc.field] ? (
                            <span className="text-indigo-650 flex items-center gap-1"><RefreshCw size={12} className="animate-spin" /> Uploading...</span>
                          ) : formData[doc.field as keyof typeof formData] ? (
                            <span className="text-emerald-600 font-semibold flex items-center gap-1"><CheckCircle2 size={12} /> Uploaded</span>
                          ) : (
                            'No file chosen'
                          )}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-400 mt-1">{doc.helper}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Action Card */}
              <div className="space-y-3 pt-2">
                <Button
                  type="submit"
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-violet-600/10 hover:shadow-xl hover:shadow-violet-600/20 transition-all duration-200 text-sm"
                >
                  <Lock size={16} />
                  <span>{editingStudentId ? 'Save Student Profile' : 'Submit Admission Form'}</span>
                </Button>
                <Button
                  type="button"
                  onClick={() => router.push('/dashboard/students')}
                  className="w-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 font-bold py-3 px-6 rounded-xl transition-all duration-200 text-sm"
                >
                  Cancel
                </Button>
              </div>

            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StudentAdmissionPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-slate-500">Loading admission form...</div>}>
      <AdmissionPageContent />
    </Suspense>
  );
}
