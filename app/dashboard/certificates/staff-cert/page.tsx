'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Award, Printer, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StaffCertificatesPage() {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();

  const [staffs, setStaffs] = useState<any[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<any>(null);

  const [letterType, setLetterType] = useState<'experience' | 'noc' | 'relief'>('experience');
  const [customRemarks, setCustomRemarks] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(true);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    if (token) {
      fetchStaffs();
    }
  }, [token]);

  const fetchStaffs = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleStaffChange = (id: string) => {
    setSelectedStaffId(id);
    const staff = staffs.find((s) => s._id === id);
    setSelectedStaff(staff || null);
    setShowCertificate(false);
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStaff) {
      setShowCertificate(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getLetterTitle = () => {
    switch (letterType) {
      case 'experience': return 'EXPERIENCE CERTIFICATE';
      case 'noc': return 'NO OBJECTION CERTIFICATE (NOC)';
      case 'relief': return 'RELIEF LETTER / RELEASE CERTIFICATE';
    }
  };

  const getPositionLabel = (pos: string) => {
    switch (pos) {
      case 'teacher': return 'Teacher';
      case 'senior_teacher': return 'Senior Teacher';
      case 'headmaster': return 'Headmaster';
      case 'associate_headmaster': return 'Associate Headmaster';
      default: return pos || 'Staff Member';
    }
  };

  return (
    <div className="space-y-6 font-sans print:p-0 print:m-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Award className="text-indigo-600" size={28} />
            <span>Generate Staff Certificates</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Issue formal experience, release, and NOC certificates to teachers and employees</p>
        </div>

        <div>
          <Button
            onClick={() => router.push('/dashboard')}
            className="bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-355 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border"
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:block print:w-full">
        {/* Setup Form Panel */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm print:hidden h-fit space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base border-b pb-2">Document Options</h3>
          
          {loading ? (
            <div className="text-center py-6 text-slate-450 flex items-center justify-center gap-2">
              <RefreshCw className="animate-spin" size={16} /> Loading employees...
            </div>
          ) : (
            <form onSubmit={handleGenerate} className="space-y-4 text-sm font-semibold">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Employee</label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => handleStaffChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 dark:bg-slate-955 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
                  required
                >
                  <option value="">Select Staff Member</option>
                  {staffs.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.firstName} {s.lastName || ''} ({getPositionLabel(s.position)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Letter Type</label>
                <select
                  value={letterType}
                  onChange={(e) => setLetterType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 dark:bg-slate-955 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
                >
                  <option value="experience">Experience Certificate</option>
                  <option value="noc">No Objection Letter (NOC)</option>
                  <option value="relief">Relief / Release Letter</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date of Issue</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 dark:bg-slate-955 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Additional Remarks (Optional)</label>
                <textarea
                  placeholder="e.g. He left the organization voluntarily..."
                  value={customRemarks}
                  onChange={(e) => setCustomRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 dark:bg-slate-955 rounded-xl focus:outline-none text-slate-800 dark:text-slate-200"
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center space-x-1.5"
                disabled={!selectedStaff}
              >
                <span>Generate Preview</span>
              </Button>
            </form>
          )}
        </div>

        {/* Certificate Display Panel */}
        <div className="lg:col-span-2 flex flex-col items-center print:w-full">
          {!showCertificate ? (
            <div className="w-full bg-slate-50 dark:bg-slate-950/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center text-slate-400 print:hidden flex flex-col justify-center items-center gap-3">
              <Award size={48} className="text-slate-300" />
              <p className="font-semibold text-sm">Please select an employee and letter type to preview the official release or experience document.</p>
            </div>
          ) : (
            <div className="w-full space-y-4 print:w-full">
              <div className="flex justify-end print:hidden">
                <Button
                  onClick={handlePrint}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-xl flex items-center space-x-2"
                >
                  <Printer size={16} />
                  <span>Print Document</span>
                </Button>
              </div>

              {/* Printable Letter Sheet */}
              <div className="w-full aspect-[1.414/1] bg-white border border-slate-300 p-16 relative flex flex-col justify-between shadow-md print:shadow-none print:border-none print:w-full print:aspect-auto select-text font-serif text-slate-800 print:text-black">
                {/* Header Section */}
                <div className="text-center space-y-2 border-b border-indigo-900/10 pb-4">
                  <h2 className="text-2xl font-extrabold tracking-widest text-indigo-900 uppercase">SHIKKHADHARA ACADEMIA</h2>
                  <p className="text-xs uppercase font-sans font-bold tracking-widest text-slate-500">Dhaka, Bangladesh | Registration No: 80942512</p>
                  <div className="h-[2px] bg-indigo-900/10 w-full my-1" />
                  <h3 className="text-base font-bold tracking-wider text-slate-700 dark:text-slate-600 font-sans mt-2">{getLetterTitle()}</h3>
                </div>

                {/* Content Body */}
                <div className="py-6 space-y-4 text-sm leading-relaxed text-justify px-4">
                  <p className="text-right text-xs font-sans text-slate-450 italic mb-4">Date: {new Date(issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  
                  {letterType === 'experience' && (
                    <p className="indent-8">
                      This is to certify that <span className="font-bold border-b border-dashed border-slate-600 px-2 font-sans text-indigo-950 uppercase">{selectedStaff.firstName} {selectedStaff.lastName || ''}</span> has
                      been working in ShikkhaDhara Academia in the position of <span className="font-bold border-b border-dashed border-slate-600 px-2">{getPositionLabel(selectedStaff.position)}</span> from
                      <span className="font-semibold border-b border-dashed border-slate-600 px-2">{new Date(selectedStaff.joinDate || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span> to the present date.
                      During his/her employment tenure, we found him/her to be highly professional, honest, and dedicated.
                      He/she has performed all assigned curriculum and administrative jobs efficiently.
                      {customRemarks && <span className="block mt-3 border-l-2 border-slate-200 pl-3 italic text-xs font-sans text-slate-600">{customRemarks}</span>}
                    </p>
                  )}

                  {letterType === 'noc' && (
                    <p className="indent-8">
                      This is to certify that <span className="font-bold border-b border-dashed border-slate-600 px-2 font-sans text-indigo-950 uppercase">{selectedStaff.firstName} {selectedStaff.lastName || ''}</span> is
                      a permanent employee of ShikkhaDhara Academia, serving as a <span className="font-bold border-b border-dashed border-slate-600 px-2">{getPositionLabel(selectedStaff.position)}</span>.
                      The management has no objection whatsoever to him/her pursuing higher academic coursework, passports processing, or visa applications.
                      ShikkhaDhara Academia has no financial or legal claims outstanding against him/her.
                      {customRemarks && <span className="block mt-3 border-l-2 border-slate-200 pl-3 italic text-xs font-sans text-slate-600">{customRemarks}</span>}
                    </p>
                  )}

                  {letterType === 'relief' && (
                    <p className="indent-8">
                      This relief letter is issued to confirm that <span className="font-bold border-b border-dashed border-slate-600 px-2 font-sans text-indigo-950 uppercase">{selectedStaff.firstName} {selectedStaff.lastName || ''}</span> has
                      resigned from the position of <span className="font-bold border-b border-dashed border-slate-600 px-2">{getPositionLabel(selectedStaff.position)}</span>.
                      He/she is hereby officially relieved of his/her institutional duties effective from <span className="font-semibold border-b border-dashed border-slate-600 px-2">{new Date(issueDate).toLocaleDateString()}</span>.
                      All assets, student papers, and keys belonging to the school have been successfully returned. We confirm that
                      he/she bears zero outstanding liabilities.
                      {customRemarks && <span className="block mt-3 border-l-2 border-slate-200 pl-3 italic text-xs font-sans text-slate-600">{customRemarks}</span>}
                    </p>
                  )}
                </div>

                {/* Footer Section */}
                <div className="flex justify-between items-end pt-16 text-xs font-sans font-semibold">
                  <div className="text-center space-y-1.5 w-1/3">
                    <p className="border-t border-slate-400 pt-1.5 text-slate-500">Prepared By</p>
                  </div>
                  <div className="text-center space-y-1.5 w-1/3">
                    {/* Centered spacer */}
                  </div>
                  <div className="text-center space-y-1.5 w-1/3">
                    <p className="border-t border-slate-400 pt-1.5 text-slate-655 font-bold">Authorized Signature</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
