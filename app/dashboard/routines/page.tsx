'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Calendar, Plus, Trash2, Clock, MapPin, User, ChevronRight, AlertCircle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function RoutinesPage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const isAdmin = user && ['admin', 'super_admin', 'owner'].includes(user.role);

  const [routines, setRoutines] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [subjectGroups, setSubjectGroups] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters state
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  useEffect(() => {
    if (token) {
      fetchAcademics();
    }
  }, [token]);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchRoutines();
    } else {
      setRoutines([]);
      setLoading(false);
    }
  }, [selectedClass, selectedSection]);

  const fetchAcademics = async () => {
    try {
      const resSec = await fetch('/api/sections', { headers: { Authorization: `Bearer ${token}` } });
      const resSub = await fetch('/api/subject-groups', { headers: { Authorization: `Bearer ${token}` } });
      if (resSec.ok && resSub.ok) {
        const dataSec = await resSec.json();
        const dataSub = await resSub.json();
        setSections(dataSec.sections || []);
        setSubjectGroups(dataSub.subjectGroups || []);
        
        // Auto-select first class & section if available
        if (dataSec.sections && dataSec.sections.length > 0) {
          setSelectedClass(dataSec.sections[0].class);
          setSelectedSection(dataSec.sections[0].name);
        }
      }
    } catch (err) {
      console.error('Failed to fetch academic settings:', err);
    }
  };

  const fetchRoutines = async () => {
    if (!selectedClass || !selectedSection) return;
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.append('class', selectedClass);
      params.append('section', selectedSection);

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
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoutine = async (id: string) => {
    if (!confirm('Are you sure you want to delete this routine slot?')) return;
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/routines/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setSuccess('Routine slot deleted!');
        fetchRoutines();
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to delete routine');
      }
    } catch (err) {
      setError('Connection failed');
    }
  };

  // Group routines by day for grid display
  const getDayRoutines = (day: string) => {
    return routines
      .filter((r) => r.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  // Get sections belonging to chosen class in filter
  const getFilterClassSections = () => {
    return sections.filter((s) => s.class === selectedClass);
  };

  const uniqueClasses = Array.from(new Set(sections.map((s) => s.class))).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ''), 10);
    const numB = parseInt(b.replace(/\D/g, ''), 10);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Calendar className="text-indigo-600" size={28} />
            <span>Class Timetable Routine</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Configure and manage academic timetables</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => router.push('/dashboard/routines/teachers')}
            className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-355 dark:hover:bg-slate-700 rounded-xl px-4 py-2 font-bold border border-slate-250/20 text-xs"
          >
            <BookOpen size={16} />
            <span>Teacher Schedule</span>
          </Button>
          {isAdmin && (
            <Button
              onClick={() => router.push('/dashboard/routines/add')}
              className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl px-5 shadow-md flex items-center space-x-1.5 text-xs"
            >
              <Plus size={16} />
              <span>Add Routine Slot</span>
            </Button>
          )}
        </div>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl flex items-center space-x-2 text-sm font-semibold">
          <ChevronRight size={16} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-2 text-sm font-semibold">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Filters header panel */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Class Selection</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                const matchingSecs = sections.filter((s) => s.class === e.target.value);
                if (matchingSecs.length > 0) {
                  setSelectedSection(matchingSecs[0].name);
                } else {
                  setSelectedSection('');
                }
              }}
              className="w-48 px-3 py-2 bg-slate-50 border border-slate-105 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-700 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-800"
            >
              <option value="">Select Class</option>
              {uniqueClasses.map((cls) => (
                <option key={cls} value={cls}>
                  Class {cls}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Section</label>
            <select
              value={selectedSection}
              disabled={!selectedClass}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-40 px-3 py-2 bg-slate-50 border border-slate-105 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-700 dark:text-slate-300 dark:bg-slate-800 dark:border-slate-800 disabled:opacity-50"
            >
              <option value="">Select Section</option>
              {getFilterClassSections().map((sec) => (
                <option key={sec._id} value={sec.name}>
                  Section {sec.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-right text-xs text-slate-450 dark:text-slate-400 font-semibold font-medium">
          {selectedClass && selectedSection && (
            <span>Showing Routine for <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedClass} - {selectedSection}</span></span>
          )}
        </div>
      </div>

      {/* Routine Timetable Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64 text-slate-450 font-medium">Loading timetable...</div>
      ) : (!selectedClass || !selectedSection) ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center text-slate-450 font-medium shadow-sm">
          <Calendar size={48} className="mx-auto text-slate-200 mb-4" />
          <p>Please select a Class and Section from the filters above to display the timetable.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {DAYS_OF_WEEK.map((day) => {
            const daySlots = getDayRoutines(day);

            return (
              <div key={day} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="bg-slate-50/50 dark:bg-slate-800/40 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">{day}</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-550 dark:text-slate-400">
                    {daySlots.length} Periods Scheduled
                  </span>
                </div>
                <div className="p-6">
                  {daySlots.length === 0 ? (
                    <p className="text-slate-400 text-xs italic">No routine blocks configured for {day}.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {daySlots.map((slot) => (
                        <div key={slot._id} className="relative group bg-slate-50/60 hover:bg-indigo-50/20 dark:bg-slate-950/40 dark:hover:bg-indigo-950/10 border border-slate-100 dark:border-slate-800 hover:border-indigo-100/50 rounded-xl p-4 transition-all duration-200">
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteRoutine(slot._id)}
                              className="absolute top-3 right-3 text-slate-400 hover:text-rose-650 opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1"
                              title="Delete Slot"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 uppercase">
                                {slot.subject}
                              </span>
                              {slot.room && (
                                <span className="text-[10px] font-semibold text-slate-400 flex items-center">
                                  <MapPin size={10} className="mr-0.5" />
                                  Rm {slot.room}
                                </span>
                              )}
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex items-center text-xs font-semibold text-slate-650 dark:text-slate-350">
                                <Clock size={12} className="mr-1.5 text-slate-400" />
                                <span>{slot.startTime} - {slot.endTime}</span>
                              </div>
                              <div className="flex items-center text-xs text-slate-500 font-medium dark:text-slate-400">
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
