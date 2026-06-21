'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Award, Printer, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TransferCertificatePage() {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();

  const [students, setStudents] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const [formData, setFormData] = useState({
    character: 'Excellent',
    reason: 'Completion of school term',
    leavingDate: new Date().toISOString().split('T')[0],
    issueDate: new Date().toISOString().split('T')[0],
  });

  const [loading, setLoading] = useState(true);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    if (token) {
      fetchStudents();
    }
  }, [token]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/students', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (cls: string) => {
    setSelectedClass(cls);
    setSelectedStudentId('');
    setSelectedStudent(null);
    setShowCertificate(false);
  };

  const handleStudentChange = (id: string) => {
    setSelectedStudentId(id);
    const student = students.find((s) => s._id === id);
    setSelectedStudent(student || null);
    setShowCertificate(false);
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudent) {
      setShowCertificate(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const classesList = Array.from(new Set(students.map((s) => s.class))).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ''), 10);
    const numB = parseInt(b.replace(/\D/g, ''), 10);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b);
  });

  const filteredStudents = students.filter((s) => s.class === selectedClass);

  return (
    <div className="space-y-6 font-sans print:p-0 print:m-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Award className="text-indigo-600" size={28} />
            <span>Generate Transfer Certificate</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Issue and print formal leaving and transfer certificates for students</p>
        </div>

        <div>
          <Button
            onClick={() => router.push('/dashboard')}
            className="bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border"
          >
            <ArrowLeft size={14} />
            <span>Back to Dashboard</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:block print:w-full">
        {/* Setup Form Panel */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm print:hidden h-fit space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base border-b pb-2">Certificate Setup</h3>
          
          {loading ? (
            <div className="text-center py-6 text-slate-450 flex items-center justify-center gap-2">
              <RefreshCw className="animate-spin" size={16} /> Loading roster...
            </div>
          ) : (
            <form onSubmit={handleGenerate} className="space-y-4 text-sm font-semibold">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 dark:bg-slate-955 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
                  required
                >
                  <option value="">Select Class</option>
                  {classesList.map((c) => (
                    <option key={c} value={c}>Class {c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Student</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => handleStudentChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 dark:bg-slate-955 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200 disabled:opacity-50"
                  disabled={!selectedClass}
                  required
                >
                  <option value="">Select Student</option>
                  {filteredStudents.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.firstName} {s.lastName || ''} (Roll: {s.rollNumber || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Character Conduct</label>
                <select
                  value={formData.character}
                  onChange={(e) => setFormData({ ...formData, character: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 dark:bg-slate-955 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Very Good">Very Good</option>
                  <option value="Good">Good</option>
                  <option value="Satisfactory">Satisfactory</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Leaving Reason</label>
                <input
                  type="text"
                  placeholder="Leaving Reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 dark:bg-slate-955 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date of Leaving</label>
                <input
                  type="date"
                  value={formData.leavingDate}
                  onChange={(e) => setFormData({ ...formData, leavingDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 dark:bg-slate-955 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Issue Date</label>
                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 dark:bg-slate-955 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center space-x-1.5"
                disabled={!selectedStudent}
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
              <p className="font-semibold text-sm">Please select a student and configure the leaving parameters to preview the formal Transfer Certificate.</p>
            </div>
          ) : (
            <div className="w-full space-y-4 print:w-full">
              <div className="flex justify-end print:hidden">
                <Button
                  onClick={handlePrint}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-xl flex items-center space-x-2"
                >
                  <Printer size={16} />
                  <span>Print Certificate</span>
                </Button>
              </div>

              {/* Printable Certificate Sheet */}
              <div className="w-full aspect-[1.414/1] bg-white border-[16px] border-double border-indigo-900/40 p-12 relative flex flex-col justify-between shadow-md print:shadow-none print:border-[10px] print:w-full print:aspect-auto select-text font-serif text-slate-800 print:text-black">
                {/* Header Section */}
                <div className="text-center space-y-2 border-b border-indigo-900/10 pb-4">
                  <h2 className="text-2xl font-extrabold tracking-widest text-indigo-900 uppercase">SHIKKHADHARA ACADEMIA</h2>
                  <p className="text-xs uppercase font-sans font-bold tracking-widest text-slate-500">Dhaka, Bangladesh | Registration No: 80942512</p>
                  <div className="h-[2px] bg-gradient-to-r from-transparent via-indigo-900/30 to-transparent w-full my-1" />
                  <h3 className="text-xl font-bold italic tracking-wide text-indigo-900/80 font-serif">Transfer Certificate</h3>
                </div>

                {/* Certificate Content Body */}
                <div className="py-6 space-y-4 text-sm leading-relaxed text-justify px-4">
                  <p className="indent-8">
                    This is to certify that <span className="font-bold border-b border-dashed border-slate-600 px-2 font-sans text-indigo-950 uppercase">{selectedStudent.firstName} {selectedStudent.lastName || ''}</span>,
                    son/daughter of <span className="font-semibold border-b border-dashed border-slate-600 px-2">{selectedStudent.fatherName || 'N/A'}</span> (Father)
                    and <span className="font-semibold border-b border-dashed border-slate-600 px-2">{selectedStudent.motherName || 'N/A'}</span> (Mother),
                    was admitted to this institution on <span className="font-semibold border-b border-dashed border-slate-600 px-2">{new Date(selectedStudent.joinDate || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span> on an admission register log under Class <span className="font-bold border-b border-dashed border-slate-600 px-2">{selectedStudent.class}</span>.
                  </p>
                  <p>
                    He/She has successfully completed all necessary course terms and left the institution on <span className="font-bold border-b border-dashed border-slate-600 px-2">{new Date(formData.leavingDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>.
                    All outstanding institutional tuition fees and financial dues have been fully cleared. His/Her conduct and character
                    during the tenure in this school were observed to be <span className="font-bold border-b border-dashed border-slate-600 px-2 text-indigo-900">{formData.character}</span>.
                  </p>
                  <p>
                    Reason for leaving: <span className="italic border-b border-dashed border-slate-600 px-2 font-sans text-xs">{formData.reason}</span>.
                  </p>
                  <p>
                    We wish him/her the very best in all future academic ventures.
                  </p>
                </div>

                {/* Footer Section */}
                <div className="flex justify-between items-end pt-12 text-xs font-sans font-semibold">
                  <div className="text-center space-y-1.5 w-1/3">
                    <p className="border-t border-slate-400 pt-1.5 text-slate-500">Prepared By</p>
                  </div>
                  <div className="text-center space-y-1.5 w-1/3">
                    <p className="text-[10px] text-slate-450 italic">Date of Issue: {new Date(formData.issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="text-center space-y-1.5 w-1/3">
                    <p className="border-t border-slate-400 pt-1.5 text-slate-650 font-bold">Principal Signature</p>
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
