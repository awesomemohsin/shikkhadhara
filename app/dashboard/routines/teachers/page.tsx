'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function TeacherSchedulePage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const [routines, setRoutines] = useState<any[]>([]);
  const [staffs, setStaffs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedTeacherId, setSelectedTeacherId] = useState('');

  useEffect(() => {
    if (token) {
      fetchStaffs();
    }
  }, [token]);

  useEffect(() => {
    if (staffs.length > 0 && user?.role === 'teacher') {
      const matchedTeacher = staffs.find((t) => t.userId === user._id || t.email === user.email);
      if (matchedTeacher) {
        setSelectedTeacherId(matchedTeacher._id);
      }
    }
  }, [staffs, user]);

  useEffect(() => {
    if (selectedTeacherId) {
      fetchTeacherRoutines();
    } else {
      setRoutines([]);
      setLoading(false);
    }
  }, [selectedTeacherId]);

  const fetchStaffs = async () => {
    try {
      const response = await fetch('/api/staffs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStaffs(data.teachers || []);
      }
    } catch (err) {
      console.error('Failed to fetch staff directory:', err);
    }
  };

  const fetchTeacherRoutines = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.append('teacherId', selectedTeacherId);

      const response = await fetch(`/api/routines?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setRoutines(data.routines || []);
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to fetch routines');
      }
    } catch (err) {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const getDayRoutines = (day: string) => {
    return routines
      .filter((r) => r.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Calendar className="text-indigo-600" size={28} />
            <span>Teacher Schedule Timetable</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Query and inspect specific schedules of teaching staff</p>
        </div>

        <div>
          <Button
            onClick={() => router.push('/dashboard/routines')}
            className="bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border"
          >
            <ArrowLeft size={14} />
            <span>Back to Class Timetable</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold">
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-150 p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Select Teacher</label>
          <select
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
            className="w-64 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-700"
          >
            <option value="">Choose Teacher...</option>
            {staffs.map((teacher) => (
              <option key={teacher._id} value={teacher._id}>
                {teacher.firstName} {teacher.lastName} ({teacher.position?.replace('_', ' ') || 'Teacher'})
              </option>
            ))}
          </select>
        </div>

        <div className="text-right text-xs text-slate-450 font-medium">
          {selectedTeacherId && (() => {
            const teacher = staffs.find((t) => t._id === selectedTeacherId);
            return teacher ? (
              <span>Showing Schedule for Teacher: <span className="font-bold text-indigo-600">{teacher.firstName} {teacher.lastName}</span></span>
            ) : null;
          })()}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 text-slate-400 font-medium">Loading schedule...</div>
      ) : !selectedTeacherId ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-450 font-medium shadow-sm">
          <Calendar size={48} className="mx-auto text-slate-200 mb-4" />
          <p>Please select a Teacher from the filter above to display their personal timetable schedule.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {DAYS_OF_WEEK.map((day) => {
            const daySlots = getDayRoutines(day);

            return (
              <div key={day} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="bg-slate-50/50 dark:bg-slate-800/40 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="font-bold text-slate-805 dark:text-slate-200 text-base">{day}</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-550 dark:text-slate-400">
                    {daySlots.length} Periods Booked
                  </span>
                </div>
                <div className="p-6">
                  {daySlots.length === 0 ? (
                    <p className="text-slate-400 text-xs italic">No timetable periods scheduled for {day}.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {daySlots.map((slot) => (
                        <div key={slot._id} className="relative group bg-slate-50/60 hover:bg-indigo-50/20 border border-slate-100 hover:border-indigo-100/50 rounded-xl p-4 transition-all duration-200">
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-50 text-indigo-700 uppercase">
                                {slot.subject}
                              </span>
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-700 uppercase">
                                {slot.class} - {slot.section}
                              </span>
                              {slot.room && (
                                <span className="text-[10px] font-semibold text-slate-400 flex items-center">
                                  <MapPin size={10} className="mr-0.5" />
                                  Rm {slot.room}
                                </span>
                              )}
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex items-center text-xs font-semibold text-slate-600">
                                <Clock size={12} className="mr-1.5 text-slate-400" />
                                <span>{slot.startTime} - {slot.endTime}</span>
                              </div>
                              <div className="flex items-center text-xs text-slate-500 font-medium">
                                <User size={12} className="mr-1.5 text-slate-400" />
                                <span>
                                  {slot.teacher ? `${slot.teacher.firstName} ${slot.teacher.lastName || ''}` : 'No teacher'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
