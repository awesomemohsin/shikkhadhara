'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AttendancePage() {
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

  const isAuthorized = user && ['super_admin', 'admin', 'teacher', 'staff'].includes(user.role);

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

  const fetchAttendance = async () => {
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
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const records = Object.entries(attendanceData).map(([studentId, status]) => ({
        studentId,
        class: selectedClass,
        date: selectedDate,
        status,
      }));

      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(records),
      });

      if (response.ok) {
        alert('Attendance marked successfully');
        setAttendanceData({});
        fetchAttendance();
      }
    } catch (error) {
      console.error('Failed to mark attendance:', error);
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white rounded-lg shadow-sm border border-red-100">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-650 max-w-md">
          Only Institutional Admins, Teachers, and Staff members have authorization to access and record student attendance.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
        <p className="text-gray-600 mt-1">Mark and manage student attendance</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {selectedClass && !loading && (
          <form onSubmit={handleMarkAttendance}>
            <div className="space-y-3 mb-6">
              <h3 className="font-semibold text-gray-900">Mark Attendance</h3>
              {getStudentsByClass().length === 0 ? (
                <p className="text-gray-500">No students in this class</p>
              ) : (
                getStudentsByClass().map((student) => (
                  <div key={student._id} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                    <span className="flex-1 font-medium">
                      {student.firstName} {student.lastName}
                    </span>
                    <div className="flex space-x-3">
                      {['present', 'absent', 'late', 'excused'].map((status) => (
                        <label key={status} className="flex items-center space-x-1">
                          <input
                            type="radio"
                            name={`attendance-${student._id}`}
                            value={status}
                            checked={attendanceData[student._id] === status}
                            onChange={(e) =>
                              setAttendanceData({
                                ...attendanceData,
                                [student._id]: e.target.value,
                              })
                            }
                            className="rounded-full"
                          />
                          <span className="text-sm capitalize">{status}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2"
            >
              Save Attendance
            </Button>
          </form>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">Loading attendance data...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No attendance records
                  </td>
                </tr>
              ) : (
                attendance.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {record.studentId?.firstName} {record.studentId?.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{record.class}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.status === 'present'
                            ? 'bg-green-100 text-green-800'
                            : record.status === 'absent'
                              ? 'bg-red-100 text-red-800'
                              : record.status === 'late'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
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
  );
}
