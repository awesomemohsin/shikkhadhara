'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Calendar, Plus, Trash2, Clock, MapPin, User, ChevronRight, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function RoutinesPage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const isAdmin = user && ['admin', 'super_admin', 'owner'].includes(user.role);

  const [routines, setRoutines] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [staffs, setStaffs] = useState<any[]>([]);
  const [subjectGroups, setSubjectGroups] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters state
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [viewMode, setViewMode] = useState<'class' | 'teacher'>('class');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');

  // Routine Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    class: '',
    section: '',
    subject: '',
    teacherId: '',
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '09:45',
    room: '',
  });

  useEffect(() => {
    fetchAcademics();
    fetchStaffs();
  }, []);

  useEffect(() => {
    if (staffs.length > 0 && user?.role === 'teacher') {
      const matchedTeacher = staffs.find((t) => t.userId === user._id || t.email === user.email);
      if (matchedTeacher) {
        setSelectedTeacherId(matchedTeacher._id);
        setViewMode('teacher');
      }
    }
  }, [staffs, user]);

  useEffect(() => {
    fetchRoutines();
  }, [selectedClass, selectedSection, selectedTeacherId, viewMode]);

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

  const fetchRoutines = async () => {
    if (viewMode === 'class' && (!selectedClass || !selectedSection)) return;
    if (viewMode === 'teacher' && !selectedTeacherId) return;
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (viewMode === 'class') {
        params.append('class', selectedClass);
        params.append('section', selectedSection);
      } else {
        params.append('teacherId', selectedTeacherId);
      }

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

  const handleAddRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/routines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Routine slot created successfully!');
        setShowForm(false);
        setFormData({
          class: selectedClass,
          section: selectedSection,
          subject: '',
          teacherId: '',
          dayOfWeek: 'Monday',
          startTime: '09:00',
          endTime: '09:45',
          room: '',
        });
        fetchRoutines();
      } else {
        setError(data.message || 'Failed to create routine');
      }
    } catch (err) {
      setError('Network request failed');
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

  // Get active subjects based on chosen class in routine form (merge all groups)
  const getFormClassSubjects = () => {
    const subjectsForClass = subjectGroups
      .filter((sg) => sg.class === formData.class)
      .flatMap((sg) => sg.subjects || []);
    return Array.from(new Set(subjectsForClass)).sort();
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Calendar className="text-indigo-600" size={28} />
            <span>Academic Class Routine</span>
          </h1>
          <p className="text-slate-500 mt-1">Configure and manage class timetables and teacher bookings</p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                class: selectedClass,
                section: selectedSection,
              }));
              setShowForm(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-md shadow-indigo-600/10 flex items-center space-x-1.5"
          >
            <Plus size={16} />
            <span>Add Routine Slot</span>
          </Button>
        )}
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

      {/* View Mode Tabs */}
      <div className="flex border-b border-slate-200/80 dark:border-slate-800 gap-6">
        <button
          onClick={() => setViewMode('class')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all duration-150 flex items-center gap-1.5 ${
            viewMode === 'class'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-500'
              : 'border-transparent text-slate-450 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Class Timetable
        </button>
        <button
          onClick={() => setViewMode('teacher')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all duration-150 flex items-center gap-1.5 ${
            viewMode === 'teacher'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-500'
              : 'border-transparent text-slate-450 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Teacher Schedule
        </button>
      </div>

      {/* Filters header panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        {viewMode === 'class' ? (
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
                className="w-48 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-700"
              >
                <option value="">Select Class</option>
                {uniqueClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
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
                className="w-40 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-700 disabled:opacity-50"
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
        ) : (
          <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
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
          </div>
        )}

        <div className="text-right text-xs text-slate-450 font-medium">
          {viewMode === 'class' ? (
            selectedClass && selectedSection && (
              <span>Showing Routine for <span className="font-bold text-indigo-600">{selectedClass} - {selectedSection}</span></span>
            )
          ) : (
            selectedTeacherId && (() => {
              const teacher = staffs.find((t) => t._id === selectedTeacherId);
              return teacher ? (
                <span>Showing Schedule for Teacher: <span className="font-bold text-indigo-600">{teacher.firstName} {teacher.lastName}</span></span>
              ) : null;
            })()
          )}
        </div>
      </div>

      {/* Routine Timetable Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64 text-slate-450 font-medium">Loading timetable...</div>
      ) : (viewMode === 'class' && (!selectedClass || !selectedSection)) ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-450 font-medium shadow-sm">
          <Calendar size={48} className="mx-auto text-slate-200 mb-4" />
          <p>Please select a Class and Section from the filters above to display the timetable.</p>
        </div>
      ) : (viewMode === 'teacher' && !selectedTeacherId) ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-455 font-medium shadow-sm">
          <Calendar size={48} className="mx-auto text-slate-200 mb-4" />
          <p>Please select a Teacher from the filters above to display their personal timetable.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {DAYS_OF_WEEK.map((day) => {
            const daySlots = getDayRoutines(day);

            return (
              <div key={day} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 text-base">{day}</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded-full text-slate-500">
                    {daySlots.length} Periods Scheduled
                  </span>
                </div>
                <div className="p-6">
                  {daySlots.length === 0 ? (
                    <p className="text-slate-400 text-xs italic">No routine blocks configured for {day}.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {daySlots.map((slot) => (
                        <div key={slot._id} className="relative group bg-slate-50/60 hover:bg-indigo-50/20 border border-slate-100 hover:border-indigo-100/50 rounded-xl p-4 transition-all duration-200">
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteRoutine(slot._id)}
                              className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                              title="Delete Slot"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-50 text-indigo-700 uppercase">
                                {slot.subject}
                              </span>
                              {viewMode === 'teacher' && (
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-700 uppercase">
                                  {slot.class} - {slot.section}
                                </span>
                              )}
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

      {/* Add Routine Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-100 w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="font-bold text-slate-800 text-lg">Add Timetable Routine Slot</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-450 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddRoutine} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Class</label>
                  <select
                    value={formData.class}
                    onChange={(e) => {
                      setFormData({ ...formData, class: e.target.value, section: '', subject: '' });
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-750"
                    required
                  >
                    <option value="">Select Class</option>
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
                    value={formData.section}
                    disabled={!formData.class}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-750 disabled:opacity-50"
                    required
                  >
                    <option value="">Select Section</option>
                    {sections
                      .filter((s) => s.class === formData.class)
                      .map((sec) => (
                        <option key={sec._id} value={sec.name}>
                          Section {sec.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Subject</label>
                  <select
                    value={formData.subject}
                    disabled={!formData.class}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-750 disabled:opacity-50"
                    required
                  >
                    <option value="">Select Subject</option>
                    {getFormClassSubjects().map((sub: string) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Teacher / Staff</label>
                  <select
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-750"
                    required
                  >
                    <option value="">Assign Teacher</option>
                    {staffs.map((staff) => (
                      <option key={staff._id} value={staff._id}>
                        {staff.firstName} {staff.lastName || ''} ({staff.position?.replace('_', ' ')})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Day</label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-750"
                    required
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-750"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-750"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Room (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Room 204"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-750"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1 font-medium py-2.5 rounded-xl shadow-md">
                  Save Slot
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-650 flex-1 font-medium py-2.5 rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
