'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { DollarSign, TrendingUp, AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FeeDuePage() {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();

  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchFees();
    }
  }, [token]);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/fees', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        // Sift out only unpaid/partially paid fees
        const dueFees = (data.fees || []).filter(
          (f: any) => f.status === 'pending' || f.status === 'partial' || f.status === 'overdue'
        );
        setFees(dueFees);
      }
    } catch (error) {
      console.error('Failed to fetch fees:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalDueAmount = fees.reduce((sum, f) => sum + (f.amount - (f.amountPaid || 0)), 0);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <DollarSign className="text-indigo-600" size={28} />
            <span>Outstanding Due Fees</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Review, track, and process outstanding tuition invoices</p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => router.push('/dashboard/fees/collect')}
            className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl px-5 shadow-md flex items-center space-x-1.5 text-xs"
          >
            <Plus size={16} />
            <span>Collect Fees</span>
          </Button>
        </div>
      </div>

      {/* Due Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Net Due</p>
            <p className="text-2xl font-extrabold text-rose-500 mt-2">
              ৳{totalDueAmount.toLocaleString()}
            </p>
          </div>
          <DollarSign size={24} className="text-rose-500 bg-rose-50 dark:bg-rose-950/20 p-1.5 rounded-full" />
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Due Invoices Count</p>
            <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">
              {fees.length}
            </p>
          </div>
          <TrendingUp size={24} className="text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 p-1.5 rounded-full" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-slate-450 font-medium">Loading outstanding invoices...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-850">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fee Type</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Period</th>
                  <th className="px-6 py-4 text-right font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-right font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Paid</th>
                  <th className="px-6 py-4 text-right font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Outstanding</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {fees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">All fees collected! Zero pending invoices.</td>
                  </tr>
                ) : (
                  fees.map((fee) => (
                    <tr key={fee._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all duration-150">
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                        {fee.studentId?.firstName} {fee.studentId?.lastName}
                      </td>
                      <td className="px-6 py-4 text-slate-650 dark:text-slate-350 font-semibold">{fee.feeType}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase">{fee.month} {fee.year}</td>
                      <td className="px-6 py-4 text-right text-slate-805 dark:text-slate-205 font-medium">৳{fee.amount}</td>
                      <td className="px-6 py-4 text-right text-slate-805 dark:text-slate-205">৳{fee.amountPaid}</td>
                      <td className="px-6 py-4 text-right text-rose-600 dark:text-rose-400 font-extrabold">৳{fee.amount - fee.amountPaid}</td>
                      <td className="px-6 py-4 text-slate-450 dark:text-slate-400 font-medium font-semibold">
                        {new Date(fee.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          onClick={() => router.push('/dashboard/fees/collect')}
                          className="bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/40 text-indigo-650 dark:text-indigo-400 text-xs font-bold px-3 py-1.5 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30 cursor-pointer"
                        >
                          Collect
                        </Button>
                      </td>
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
