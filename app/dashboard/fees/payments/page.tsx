'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { DollarSign, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentLogsPage() {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchPayments();
    }
  }, [token]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payments', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
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
            <span>Fees Payment Logs</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Review transaction histories, methods, and receipt identifiers</p>
        </div>

        <div>
          <Button
            onClick={() => router.push('/dashboard/fees')}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border"
          >
            <ArrowLeft size={14} />
            <span>Back to Fees Registry</span>
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-slate-500 font-medium">Loading transaction registers...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-850">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-slate-550 uppercase tracking-wider">Transaction ID</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-550 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-right font-semibold text-slate-550 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-550 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-550 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-550 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">No payment transactions recorded</td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all duration-150">
                      <td className="px-6 py-4 font-mono text-xs text-indigo-500 font-semibold">
                        {payment.transactionId}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-850 dark:text-slate-200">
                        {payment.studentId?.firstName} {payment.studentId?.lastName}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-850 dark:text-slate-200 font-bold">৳{payment.amount}</td>
                      <td className="px-6 py-4 capitalize text-slate-600 dark:text-slate-350 font-medium">
                        {payment.paymentMethod?.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-50 text-green-700 border border-green-100 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30">
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-450 dark:text-slate-400 font-medium font-semibold">
                        {new Date(payment.paymentDate).toLocaleDateString()}
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
