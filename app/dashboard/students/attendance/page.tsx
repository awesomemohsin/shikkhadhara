'use client';

import { useEffect, useState, Suspense } from 'react';
import { useAuthStore } from '@/lib/store';
import { Calendar, CheckCircle2, UserCheck, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

function AttendancePageContent() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('');
  const [attendanceData, setAttendanceData] = useState<{ [key: string]: string }>({});
  const [sections, setSections] = useState<any[]>([]);
  const [subjectGroups, setSubjectGroups] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isAuthorized = user && ['super_admin', 'admin', 'teacher', 'staff', 'owner'].includes(user.role);

  useEffect(() => {
    if (isAuthorized) {
      fetchAttendance();
      fetchStudents();
      fetchAcademics();
    }
  }, [selectedDate, selectedClass, isAuthorized]);

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
    }
  };

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

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedClass) params.append('class', selectedClass);
      if (selectedDate) params.append('date', selectedDate);

      const response = await fetch(`/api/attendance?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAttendance(data.attendance || []);
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const records = Object.entries(attendanceData).map(([studentId, status]) => ({
        studentId,
        class: selectedClass,
        date: selectedDate,
        status,
      }));

      if (records.length === 0) {
        setError('Please record at least one student status.');
        setSubmitting(false);
        return;
      }

      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(records),
      });

      if (response.ok) {
        setSuccess('Attendance marked successfully');
        setAttendanceData({});
        fetchAttendance();
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to mark attendance');
      }
    } catch (error) {
      console.error('Failed to mark attendance:', error);
      setError('Connection failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStudentsByClass = () => {
    if (!selectedClass) return [];
    return students.filter((s) => s.class === selectedClass);
  };

  const classesList = Array.from(
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

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-rose-100 dark:border-rose-950/20 shadow-xl max-w-xl mx-auto mt-12 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/30 text-rose-500 dark:text-rose-400 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-850 dark:text-white mb-2">Access Denied</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md">
          Only Institutional Admins, Teachers, and Staff members have authorization to access and record student attendance.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-955 dark:text-white tracking-tight flex items-center space-x-2">
            <Calendar className="text-indigo-600" size={28} />
            <span>Attendance Management</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Mark daily student registry logs and track current session attendance records
          </p>
        </div>
      </div>

      <div className="space-y-6 animate-in fade-in duration-200">
        {success && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400 px-4 py-3 rounded-2xl flex items-center text-sm font-semibold">
            <CheckCircle2 size={18} className="text-emerald-550 mr-2" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400 px-4 py-3 rounded-2xl flex items-center text-sm font-semibold">
            <AlertCircle size={18} className="text-red-500 mr-2" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-4">
              <h2 className="font-bold text-slate-805 dark:text-slate-202 text-base flex items-center gap-2">
                <span className="bg-indigo-50 dark:bg-indigo-955/40 text-indigo-650 dark:text-indigo-400 px-2 py-0.5 text-xs rounded-full">Filters</span>
                Select Roster Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Class</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value);
                      setAttendanceData({});
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-550 text-sm font-semibold"
                    required
                  >
                    <option value="">Select a class</option>
                    {classesList.map((c) => (
                      <option key={c} value={c}>
                        Class {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Mark Form / Records Table */}
          <div className="lg:col-span-2 space-y-6">
            {selectedClass ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h2 className="font-bold text-slate-805 dark:text-slate-202 text-base">Record Attendance</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Choose status for each student on the roster.</p>
                  </div>
                  <span className="text-xs font-bold text-indigo-655 bg-indigo-50 dark:bg-indigo-955/40 dark:text-indigo-400 px-3 py-1 rounded-full">
                    Class {selectedClass}
                  </span>
                </div>

                <form onSubmit={handleMarkAttendance} className="space-y-4">
                  <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
                    {getStudentsByClass().length === 0 ? (
                      <p className="text-sm text-slate-400 py-12 text-center font-medium italic">No students registered in Class {selectedClass}</p>
                    ) : (
                      getStudentsByClass().map((student) => (
                        <div key={student._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 border border-slate-100 dark:border-slate-800 rounded-xl gap-3">
                          <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                            {student.firstName} {student.lastName}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { status: 'present', activeColor: 'bg-emerald-500 text-white border-emerald-500', baseColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-500/10 border-emerald-200 dark:border-emerald-900/30' },
                              { status: 'absent', activeColor: 'bg-rose-500 text-white border-rose-500', baseColor: 'text-rose-600 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-500/10 border-rose-200 dark:border-rose-900/30' },
                              { status: 'late', activeColor: 'bg-amber-500 text-white border-amber-500', baseColor: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-500/10 border-amber-200 dark:border-amber-900/30' },
                              { status: 'excused', activeColor: 'bg-sky-500 text-white border-sky-500', baseColor: 'text-sky-600 bg-sky-50 dark:bg-sky-950/20 hover:bg-sky-500/10 border-sky-200 dark:border-sky-900/30' }
                            ].map((item) => {
                              const isChecked = attendanceData[student._id] === item.status;
                              return (
                                <button
                                  key={item.status}
                                  type="button"
                                  onClick={() =>
                                    setAttendanceData({
                                      ...attendanceData,
                                      [student._id]: item.status,
                                    })
                                  }
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize border transition-all duration-150 cursor-pointer ${
                                    isChecked ? item.activeColor : item.baseColor
                                  }`}
                                >
                                  {item.status}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {getStudentsByClass().length > 0 && (
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2"
                    >
                      {submitting ? <RefreshCw className="animate-spin" size={16} /> : <UserCheck size={18} />}
                      <span>Save & Lock Attendance</span>
                    </Button>
                  )}
                </form>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-8 shadow-sm text-center text-slate-400 italic font-medium">
                Please select a class filter to view and log rosters.
              </div>
            )}

            {/* Attendance Logs Viewer */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-4">
              <h2 className="font-bold text-slate-805 dark:text-slate-202 text-base">Attendance Logs</h2>
              {loading ? (
                <div className="flex items-center justify-center py-12 text-slate-400">
                  <RefreshCw className="animate-spin mr-2" size={18} />
                  <span className="font-semibold">Loading log registers...</span>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-100 dark:border-slate-805 rounded-xl">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50/50 dark:bg-slate-850/50">
                      <tr className="border-b border-slate-100 dark:border-slate-805 text-slate-550 dark:text-slate-400 text-xs font-bold uppercase">
                        <th className="px-4 py-3 text-left">Student</th>
                        <th className="px-4 py-3 text-left">Class</th>
                        <th className="px-4 py-3 text-left">Date</th>
                        <th className="px-4 py-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {attendance.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">
                            No attendance records logged for this filter.
                          </td>
                        </tr>
                      ) : (
                        attendance.map((record) => (
                          <tr key={record._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-850/30 transition-colors">
                            <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">
                              {record.studentId?.firstName} {record.studentId?.lastName}
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-500">Class {record.class}</td>
                            <td className="px-4 py-3 text-slate-550">
                              {new Date(record.date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                  record.status === 'present'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                                    : record.status === 'absent'
                                      ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
                                      : record.status === 'late'
                                        ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'
                                        : 'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/30'
                                }`}
                              >
                                {record.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
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

export default function AttendancePage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-slate-500">Loading attendance...</div>}>
      <AttendancePageContent />
    </Suspense>
  );
}
