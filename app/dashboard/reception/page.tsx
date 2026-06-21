'use client';

import { useState, useEffect } from 'react';
import { Contact, Plus, Search, RefreshCw, UserCheck, PhoneCall, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReceptionLogsPage() {
  const [activeTab, setActiveTab] = useState<'visitors' | 'enquiries' | 'calls'>('visitors');
  
  // Custom states synced to local storage
  const [visitors, setVisitors] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [calls, setCalls] = useState<any[]>([]);

  // Form states
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitorPurpose, setVisitorPurpose] = useState('');
  
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [studentClass, setStudentClass] = useState('6');
  
  const [callerName, setCallerName] = useState('');
  const [callerPhone, setCallerPhone] = useState('');
  const [callNotes, setCallNotes] = useState('');

  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    // Sync local storage records
    const v = localStorage.getItem('reception_visitors');
    const e = localStorage.getItem('reception_enquiries');
    const c = localStorage.getItem('reception_calls');

    if (v) setVisitors(JSON.parse(v));
    else {
      const init = [{ id: '1', name: 'Ziaul Haque', phone: '+880 1711-223344', purpose: 'Meet Principal regarding science project', checkIn: new Date().toLocaleTimeString(), status: 'checked_in' }];
      setVisitors(init);
      localStorage.setItem('reception_visitors', JSON.stringify(init));
    }

    if (e) setEnquiries(JSON.parse(e));
    else {
      const init = [{ id: '1', guardianName: 'Sufia Begum', phone: '+880 1819-334455', class: 'Class 8', date: new Date().toLocaleDateString(), status: 'pending' }];
      setEnquiries(init);
      localStorage.setItem('reception_enquiries', JSON.stringify(init));
    }

    if (c) setCalls(JSON.parse(c));
    else {
      const init = [{ id: '1', caller: 'Rahim Ali', phone: '+880 1912-445566', notes: 'Enquired about admission dates', date: new Date().toLocaleDateString() }];
      setCalls(init);
      localStorage.setItem('reception_calls', JSON.stringify(init));
    }
  }, []);

  const handleAddVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName || !visitorPhone) return;

    const newVisitor = {
      id: Date.now().toString(),
      name: visitorName,
      phone: visitorPhone,
      purpose: visitorPurpose || 'General Enquiry',
      checkIn: new Date().toLocaleTimeString(),
      status: 'checked_in'
    };

    const updated = [newVisitor, ...visitors];
    setVisitors(updated);
    localStorage.setItem('reception_visitors', JSON.stringify(updated));
    setVisitorName('');
    setVisitorPhone('');
    setVisitorPurpose('');
    triggerAlert('Visitor record added successfully!');
  };

  const handleAddEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guardianName || !guardianPhone) return;

    const newEnquiry = {
      id: Date.now().toString(),
      guardianName,
      phone: guardianPhone,
      class: `Class ${studentClass}`,
      date: new Date().toLocaleDateString(),
      status: 'pending'
    };

    const updated = [newEnquiry, ...enquiries];
    setEnquiries(updated);
    localStorage.setItem('reception_enquiries', JSON.stringify(updated));
    setGuardianName('');
    setGuardianPhone('');
    triggerAlert('Admission enquiry recorded!');
  };

  const handleAddCall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callerName || !callerPhone) return;

    const newCall = {
      id: Date.now().toString(),
      caller: callerName,
      phone: callerPhone,
      notes: callNotes,
      date: new Date().toLocaleDateString()
    };

    const updated = [newCall, ...calls];
    setCalls(updated);
    localStorage.setItem('reception_calls', JSON.stringify(updated));
    setCallerName('');
    setCallerPhone('');
    setCallNotes('');
    triggerAlert('Phone log recorded!');
  };

  const toggleCheckout = (id: string) => {
    const updated = visitors.map((vis) =>
      vis.id === id ? { ...vis, status: vis.status === 'checked_in' ? 'checked_out' : 'checked_in' } : vis
    );
    setVisitors(updated);
    localStorage.setItem('reception_visitors', JSON.stringify(updated));
  };

  const triggerAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(''), 3000);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Contact className="text-indigo-650" size={28} />
            <span>Reception Desk</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Register institution visitors, incoming phone logs, and admission leads.</p>
        </div>
      </div>

      {alertMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl text-xs font-semibold">
          {alertMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-2 border-b pb-1 text-xs font-bold uppercase tracking-wider text-slate-400">
        {[
          { id: 'visitors', label: 'Visitor Logs', icon: UserCheck },
          { id: 'enquiries', label: 'Admission Enquiries', icon: Contact },
          { id: 'calls', label: 'Phone Logs', icon: PhoneCall }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-transparent transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-900 text-indigo-650 border-slate-200 shadow-sm'
                  : 'hover:text-slate-700'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entry Register Form */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base border-b pb-2 capitalize">
            Add {activeTab === 'visitors' ? 'Visitor Log' : activeTab === 'enquiries' ? 'Admission Lead' : 'Phone Call Log'}
          </h3>

          {activeTab === 'visitors' && (
            <form onSubmit={handleAddVisitor} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Visitor Name</label>
                <input
                  type="text"
                  placeholder="Visitor Full Name"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 dark:bg-slate-950 rounded-xl outline-none text-slate-850 dark:text-slate-200"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Visitor Phone</label>
                <input
                  type="text"
                  placeholder="+880"
                  value={visitorPhone}
                  onChange={(e) => setVisitorPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 dark:bg-slate-950 rounded-xl outline-none text-slate-855 dark:text-slate-200"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Meeting Purpose</label>
                <input
                  type="text"
                  placeholder="Purpose of visit"
                  value={visitorPurpose}
                  onChange={(e) => setVisitorPurpose(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 dark:bg-slate-950 rounded-xl outline-none text-slate-855 dark:text-slate-200"
                />
              </div>
              <Button type="submit" className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl cursor-pointer">
                <span>Check In Visitor</span>
              </Button>
            </form>
          )}

          {activeTab === 'enquiries' && (
            <form onSubmit={handleAddEnquiry} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Guardian Name</label>
                <input
                  type="text"
                  placeholder="Guardian Name"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 dark:bg-slate-955 rounded-xl outline-none text-slate-800 dark:text-slate-200"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Contact Phone</label>
                <input
                  type="text"
                  placeholder="+880"
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-855 dark:bg-slate-955 rounded-xl outline-none text-slate-800 dark:text-slate-200"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Grade/Class Interest</label>
                <select
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-855 dark:bg-slate-955 rounded-xl outline-none text-slate-800 dark:text-slate-200"
                >
                  {['6', '7', '8', '9', '10'].map((c) => (
                    <option key={c} value={c}>Class {c}</option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl cursor-pointer">
                <span>Record Enquiry</span>
              </Button>
            </form>
          )}

          {activeTab === 'calls' && (
            <form onSubmit={handleAddCall} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Caller / Recipient Name</label>
                <input
                  type="text"
                  placeholder="Name"
                  value={callerName}
                  onChange={(e) => setCallerName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 rounded-xl outline-none text-slate-800 dark:text-slate-200"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                <input
                  type="text"
                  placeholder="+880"
                  value={callerPhone}
                  onChange={(e) => setCallerPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 rounded-xl outline-none text-slate-800 dark:text-slate-200"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Call Summary Notes</label>
                <textarea
                  placeholder="Notes..."
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 rounded-xl outline-none h-20 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl cursor-pointer">
                <span>Save Call Log</span>
              </Button>
            </form>
          )}
        </div>

        {/* Display Records Panel */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm overflow-hidden">
          <h3 className="font-bold text-slate-850 dark:text-slate-200 text-base border-b pb-2 mb-4">Logged Entries</h3>

          {activeTab === 'visitors' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-850">
                  <tr>
                    <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Visitor Details</th>
                    <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Purpose</th>
                    <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Time</th>
                    <th className="px-6 py-3 text-center font-bold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {visitors.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No visitors logged today.</td></tr>
                  ) : (
                    visitors.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-850 dark:text-slate-200">{v.name}</p>
                          <p className="text-[10px] text-slate-450 font-semibold">{v.phone}</p>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-600 max-w-[200px] truncate">{v.purpose}</td>
                        <td className="px-6 py-4 text-xs text-slate-500">{v.checkIn}</td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => toggleCheckout(v.id)}
                            className={`text-[10px] font-bold px-3 py-1 rounded-full cursor-pointer ${
                              v.status === 'checked_in' ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' : 'bg-slate-100 text-slate-550'
                            }`}
                          >
                            {v.status === 'checked_in' ? 'Checked In' : 'Checked Out'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'enquiries' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-850">
                  <tr>
                    <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Guardian Details</th>
                    <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Grade Interest</th>
                    <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Date</th>
                    <th className="px-6 py-3 text-center font-bold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {enquiries.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No active enquiries recorded.</td></tr>
                  ) : (
                    enquiries.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800 dark:text-slate-200">{e.guardianName}</p>
                          <p className="text-[10px] text-slate-450 font-semibold">{e.phone}</p>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-600">{e.class}</td>
                        <td className="px-6 py-4 text-xs text-slate-500">{e.date}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-[10px] font-bold px-2.5 py-1 bg-yellow-500/10 text-yellow-600 rounded-full border border-yellow-500/20 uppercase">
                            {e.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'calls' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-850">
                  <tr>
                    <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Caller Details</th>
                    <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Notes Summary</th>
                    <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {calls.length === 0 ? (
                    <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400">No calls registered.</td></tr>
                  ) : (
                    calls.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-850 dark:text-slate-200">{c.caller}</p>
                          <p className="text-[10px] text-slate-450 font-semibold">{c.phone}</p>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-650 max-w-[240px] truncate">{c.notes}</td>
                        <td className="px-6 py-4 text-xs text-slate-500">{c.date}</td>
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
  );
}
