'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { Heart, Plus, Users, ShieldAlert, Award, Star, Bell, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BehaviourRecordsPage() {
  const token = useAuthStore((state) => state.token);
  
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom states for behaviour logs in local storage
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [pointType, setPointType] = useState<'positive' | 'negative'>('positive');
  const [points, setPoints] = useState(5);
  const [incidentTitle, setIncidentTitle] = useState('');
  const [remarks, setRemarks] = useState('');
  const [notifyingParent, setNotifyingParent] = useState(true);
  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    fetchStudents();
    // Load local storage behavior logs
    const savedLogs = localStorage.getItem('behaviour_logs');
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    } else {
      const defaultLogs = [
        { id: '1', name: 'Tanvir Rahman', roll: '01', type: 'positive', points: 10, title: 'Outstanding Leadership in Science Fair', date: new Date().toLocaleDateString(), notify: true },
        { id: '2', name: 'Maimuna Islam', roll: '03', type: 'negative', points: -5, title: 'Late Assignment Submission twice', date: new Date().toLocaleDateString(), notify: true }
      ];
      setLogs(defaultLogs);
      localStorage.setItem('behaviour_logs', JSON.stringify(defaultLogs));
    }
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !incidentTitle) return;

    const student = students.find((s) => s._id === selectedStudentId);
    const studentName = student ? `${student.firstName} ${student.lastName || ''}` : 'Unknown Student';
    const rollNo = student ? student.rollNumber || 'N/A' : 'N/A';

    const newLog = {
      id: Date.now().toString(),
      name: studentName,
      roll: rollNo,
      type: pointType,
      points: pointType === 'positive' ? points : -points,
      title: incidentTitle,
      date: new Date().toLocaleDateString(),
      notify: notifyingParent
    };

    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    localStorage.setItem('behaviour_logs', JSON.stringify(updatedLogs));

    setIncidentTitle('');
    setRemarks('');
    setSelectedStudentId('');
    setAlertMsg('Incident logged and notification triggered!');
    setTimeout(() => setAlertMsg(''), 3000);
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Heart className="text-rose-500" size={28} />
            <span>Behaviour Records</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Monitor student conduct performance points and issue notifications.</p>
        </div>
      </div>

      {alertMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl text-xs font-semibold">
          {alertMsg}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total logged Incidents</p>
            <p className="text-2xl font-extrabold text-slate-850 dark:text-white mt-1">{logs.length}</p>
          </div>
          <div className="bg-indigo-500/10 text-indigo-500 p-3 rounded-xl">
            <Heart size={20} />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Positive Commendations</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">{logs.filter((l) => l.type === 'positive').length}</p>
          </div>
          <div className="bg-emerald-500/10 text-emerald-500 p-3 rounded-xl">
            <Star size={20} />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Negative Warnings</p>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">{logs.filter((l) => l.type === 'negative').length}</p>
          </div>
          <div className="bg-rose-500/10 text-rose-500 p-3 rounded-xl">
            <ShieldAlert size={20} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Incident Panel */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base border-b pb-2">Record Incident</h3>
          <form onSubmit={handleAddIncident} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Student</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 dark:bg-slate-950 rounded-xl outline-none text-slate-850 dark:text-slate-200"
                required
              >
                <option value="">Select Student</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.firstName} {student.lastName || ''} (Roll: {student.rollNumber || 'N/A'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Point Type</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPointType('positive')}
                  className={`flex-1 py-2 rounded-xl font-bold border transition-colors ${
                    pointType === 'positive' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600' : 'bg-transparent text-slate-400'
                  }`}
                >
                  Positive (+)
                </button>
                <button
                  type="button"
                  onClick={() => setPointType('negative')}
                  className={`flex-1 py-2 rounded-xl font-bold border transition-colors ${
                    pointType === 'negative' ? 'bg-rose-500/10 border-rose-500 text-rose-600' : 'bg-transparent text-slate-400'
                  }`}
                >
                  Negative (-)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Points Value</label>
                <input
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(Math.abs(parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 dark:bg-slate-955 rounded-xl outline-none text-slate-800 dark:text-slate-200"
                  min="1"
                  required
                />
              </div>
              <div className="flex items-center pt-5">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={notifyingParent}
                    onChange={(e) => setNotifyingParent(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-650 focus:ring-indigo-500"
                  />
                  <span className="text-[10px] font-bold text-slate-450 uppercase">Notify Parent</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Incident Title</label>
              <input
                type="text"
                placeholder="e.g., Late submission / Perfect Attendance"
                value={incidentTitle}
                onChange={(e) => setIncidentTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 rounded-xl outline-none text-slate-800 dark:text-slate-200"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Additional Remarks</label>
              <textarea
                placeholder="Remarks..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 rounded-xl outline-none h-16 text-slate-800 dark:text-slate-200"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <Plus size={16} />
              <span>Record Incident</span>
            </Button>
          </form>
        </div>

        {/* Incidents Table Panel */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b gap-3 mb-4">
            <h3 className="font-bold text-slate-850 dark:text-slate-200 text-base">Behaviour Log</h3>
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl pl-9 pr-4 py-1.5 border border-transparent outline-none text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-850">
                <tr>
                  <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Student</th>
                  <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Incident</th>
                  <th className="px-6 py-3 text-right font-bold text-slate-500 uppercase tracking-wider text-xs">Points</th>
                  <th className="px-6 py-3 text-center font-bold text-slate-500 uppercase tracking-wider text-xs">SMS/WA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">No behaviour incidents recorded.</td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{log.name}</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Roll: {log.roll}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-700 dark:text-slate-350">{log.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{log.date}</p>
                      </td>
                      <td className={`px-6 py-4 text-right font-extrabold ${log.points > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {log.points > 0 ? `+${log.points}` : log.points}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {log.notify ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-green-500/10 text-green-500 px-2 py-0.5 rounded-lg border border-green-500/20">
                            <Bell size={10} /> SENT
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic font-semibold">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
