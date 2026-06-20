'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { User, Calendar, BookOpen, DollarSign, Award, Clock, MapPin, CheckCircle, AlertCircle, Heart } from 'lucide-react';

export default function ParentPortalPage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);

  const [routines, setRoutines] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [childLoading, setChildLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'routine' | 'fees' | 'grades'>('routine');

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const response = await fetch('/api/students', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const childrenList = data.students || [];
        setChildren(childrenList);
        if (childrenList.length > 0) {
          setSelectedChild(childrenList[0]);
          fetchChildData(childrenList[0]);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchChildData = async (childDoc: any) => {
    setChildLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [resRoutine, resFees, resResults] = await Promise.all([
        fetch(`/api/routines?class=${childDoc.class}&section=${childDoc.section}`, { headers }),
        fetch(`/api/fees?studentId=${childDoc._id}`, { headers }),
        fetch(`/api/exam-results?studentId=${childDoc._id}`, { headers }),
      ]);

      if (resRoutine.ok) {
        const routineData = await resRoutine.json();
        setRoutines(routineData.routines || []);
      }
      if (resFees.ok) {
        const feesData = await resFees.json();
        setFees(feesData.fees || []);
      }
      if (resResults.ok) {
        const resultsData = await resResults.json();
        setResults(resultsData.results || []);
      }
    } catch (err) {
      console.error('Failed to fetch relation profiles:', err);
    } finally {
      setChildLoading(false);
      setLoading(false);
    }
  };

  const handleSelectChild = (child: any) => {
    setSelectedChild(child);
    fetchChildData(child);
  };

  // Group routines by day of the week
  const getDayRoutines = (day: string) => {
    return routines
      .filter((r) => r.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-slate-400 font-medium">
        Loading parent portal profile...
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-white rounded-2xl shadow-sm border border-red-50">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">No Linked Students</h2>
        <p className="text-slate-550 max-w-sm">
          No student accounts are linked to this guardian profile. Please contact the school register desk.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Children Selection Bar */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
          <Heart size={14} className="text-rose-500 mr-1.5" />
          <span>My Children</span>
        </h2>
        <div className="flex flex-wrap gap-3">
          {children.map((child) => (
            <button
              key={child._id}
              onClick={() => handleSelectChild(child)}
              className={`px-4 py-3 rounded-2xl border text-sm font-semibold transition-all flex items-center space-x-2.5 ${
                selectedChild?._id === child._id
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/10'
                  : 'bg-white text-slate-700 border-slate-100 hover:bg-slate-50'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                selectedChild?._id === child._id ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'
              }`}>
                {child.firstName[0]}
              </div>
              <span>{child.firstName} {child.lastName}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedChild && (
        <>
          {/* Child Details Card */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-y-8 translate-x-8 opacity-10">
              <User size={180} />
            </div>
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center font-bold text-3xl shadow-inner border border-white/10">
                {selectedChild.firstName[0]}
                {selectedChild.lastName[0]}
              </div>
              <div className="flex-1 text-center md:text-left space-y-2">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                  {selectedChild.firstName} {selectedChild.lastName}
                </h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm text-slate-300 font-medium">
                  <span className="bg-white/5 px-2.5 py-1 rounded-lg">Class: {selectedChild.class}</span>
                  <span className="bg-white/5 px-2.5 py-1 rounded-lg">Section: {selectedChild.section}</span>
                  <span className="bg-white/5 px-2.5 py-1 rounded-lg">Roll No: {selectedChild.rollNumber || 'N/A'}</span>
                </div>
                <p className="text-xs text-slate-400">Enrollment ID: {selectedChild.enrollmentId}</p>
              </div>
            </div>
          </div>

          {/* Child Related Info Tabs */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex border-b border-slate-100 bg-slate-50/50">
              {[
                { id: 'routine', label: 'Class Timetable', icon: Calendar },
                { id: 'fees', label: 'Fees & Invoices', icon: DollarSign },
                { id: 'grades', label: 'Exam Grades', icon: Award },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-4 text-sm font-semibold transition-all border-b-2 ${
                      activeTab === tab.id
                        ? 'text-indigo-600 border-indigo-600 bg-white shadow-[0_-2px_0_inset_#4f46e5]'
                        : 'text-slate-550 hover:text-slate-800 border-transparent'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-6">
              {childLoading ? (
                <div className="flex justify-center items-center h-48 text-slate-400">Fetching child data...</div>
              ) : (
                <>
                  {/* Routine Tab */}
                  {activeTab === 'routine' && (
                    <div className="space-y-6">
                      {DAYS.map((day) => {
                        const daySlots = getDayRoutines(day);
                        if (daySlots.length === 0) return null;

                        return (
                          <div key={day} className="border border-slate-50 rounded-xl overflow-hidden shadow-xs">
                            <div className="bg-slate-50/80 px-4 py-2 border-b border-slate-100 font-bold text-xs text-slate-500 uppercase tracking-wider">
                              {day}
                            </div>
                            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                              {daySlots.map((slot) => (
                                <div key={slot._id} className="bg-slate-50/30 border border-slate-100 rounded-xl p-3 space-y-2.5">
                                  <div className="flex justify-between items-center">
                                    <span className="px-2 py-0.5 text-[9px] font-bold bg-indigo-50 text-indigo-700 rounded uppercase">
                                      {slot.subject}
                                    </span>
                                    {slot.room && (
                                      <span className="text-[9px] text-slate-450 font-semibold flex items-center">
                                        <MapPin size={10} className="mr-0.5" />
                                        Rm {slot.room}
                                      </span>
                                    )}
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs font-semibold text-slate-700 flex items-center">
                                      <Clock size={11} className="mr-1 text-slate-400" />
                                      <span>{slot.startTime} - {slot.endTime}</span>
                                    </p>
                                    <p className="text-[10px] text-slate-450 font-medium">
                                      Teacher: {slot.teacher ? `${slot.teacher.firstName} ${slot.teacher.lastName || ''}` : 'N/A'}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      {routines.length === 0 && (
                        <div className="text-center py-12 text-slate-450 text-sm">No routine blocks are active for this class.</div>
                      )}
                    </div>
                  )}

                  {/* Fees Tab */}
                  {activeTab === 'fees' && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider text-xs">Period</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider text-xs">Invoice details</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-500 uppercase tracking-wider text-xs">Billing Dues</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-500 uppercase tracking-wider text-xs">Paid</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider text-xs">Due Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {fees.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-4 py-8 text-center text-slate-400">No invoices found.</td>
                            </tr>
                          ) : (
                            fees.map((fee) => (
                              <tr key={fee._id} className="hover:bg-slate-50/40 transition-colors">
                                <td className="px-4 py-3 font-semibold text-slate-800">{fee.month} {fee.year}</td>
                                <td className="px-4 py-3 text-slate-650 max-w-xs truncate" title={fee.description}>{fee.feeType}</td>
                                <td className="px-4 py-3 text-right font-semibold text-slate-700">৳{fee.amount}</td>
                                <td className="px-4 py-3 text-right font-semibold text-slate-700">৳{fee.amountPaid || 0}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    fee.status === 'paid'
                                      ? 'bg-green-50 text-green-700 border border-green-100'
                                      : fee.status === 'partial'
                                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                        : 'bg-red-50 text-red-700 border border-red-100'
                                  }`}>
                                    {fee.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-slate-500">{new Date(fee.dueDate).toLocaleDateString()}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Grades Tab */}
                  {activeTab === 'grades' && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider text-xs">Subject</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider text-xs">Exam Name</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-500 uppercase tracking-wider text-xs">Marks Obtained</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-500 uppercase tracking-wider text-xs">Percentage</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider text-xs">Grade</th>
                            <th className="px-4 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider text-xs">Result</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {results.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-4 py-8 text-center text-slate-400">No grades registered.</td>
                            </tr>
                          ) : (
                            results.map((res) => (
                              <tr key={res._id} className="hover:bg-slate-50/40 transition-colors">
                                <td className="px-4 py-3 font-semibold text-slate-800 capitalize">{res.examId?.subject}</td>
                                <td className="px-4 py-3 text-slate-650">{res.examId?.name}</td>
                                <td className="px-4 py-3 text-right font-semibold text-slate-700">{res.marksObtained}</td>
                                <td className="px-4 py-3 text-right font-semibold text-slate-700">{res.percentage?.toFixed(1)}%</td>
                                <td className="px-4 py-3 font-bold text-indigo-600">{res.grade}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                    res.status === 'pass' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                                  }`}>
                                    {res.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
