'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { DollarSign, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PreviousBalancePage() {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();

  const [studentBalances, setStudentBalances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchStudentBalances();
    }
  }, [token]);

  const fetchStudentBalances = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/fees', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const feesList = data.fees || [];

        // Aggregate by student
        const studentMap: { [key: string]: any } = {};

        feesList.forEach((fee: any) => {
          if (!fee.studentId) return;
          const studentId = fee.studentId._id;
          if (!studentMap[studentId]) {
            studentMap[studentId] = {
              name: `${fee.studentId.firstName} ${fee.studentId.lastName || ''}`,
              class: fee.studentId.class,
              section: fee.studentId.section || 'N/A',
              rollNumber: fee.studentId.rollNumber || 'N/A',
              totalBilled: 0,
              totalPaid: 0,
              outstanding: 0,
              invoiceCount: 0,
            };
          }
          studentMap[studentId].totalBilled += fee.amount;
          studentMap[studentId].totalPaid += fee.amountPaid || 0;
          studentMap[studentId].outstanding += (fee.amount - (fee.amountPaid || 0));
          studentMap[studentId].invoiceCount += 1;
        });

        // Filter and convert to array
        const list = Object.values(studentMap)
          .filter((st: any) => st.outstanding > 0)
          .sort((a: any, b: any) => b.outstanding - a.outstanding);

        setStudentBalances(list);
      }
    } catch (error) {
      console.error('Failed to compute student balances:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <DollarSign className="text-indigo-600" size={28} />
            <span>Previous Outstanding Balances</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Monitor total cumulative arrears and balances per student account</p>
        </div>

        <div>
          <Button
            onClick={() => router.push('/dashboard/fees')}
            className="bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-355 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border"
          >
            <ArrowLeft size={14} />
            <span>Back to Registry</span>
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-slate-450 font-medium">Computing student balance ledgers...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-850">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Class & Section</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Roll No.</th>
                  <th className="px-6 py-4 text-right font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Billed</th>
                  <th className="px-6 py-4 text-right font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Paid</th>
                  <th className="px-6 py-4 text-right font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Outstanding Balance</th>
                  <th className="px-6 py-4 text-center font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Billed Invoices</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {studentBalances.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">No outstanding balances found. All student sheets are cleared.</td>
                  </tr>
                ) : (
                  studentBalances.map((student, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all duration-150">
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 text-slate-650 dark:text-slate-350 font-semibold">
                        Class {student.class} - {student.section}
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-450 font-semibold">{student.rollNumber}</td>
                      <td className="px-6 py-4 text-right text-slate-805 dark:text-slate-200">৳{student.totalBilled.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right text-slate-805 dark:text-slate-200">৳{student.totalPaid.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right text-rose-600 dark:text-rose-400 font-extrabold">৳{student.outstanding.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-300 font-bold">{student.invoiceCount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
