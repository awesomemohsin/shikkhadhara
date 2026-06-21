'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { DollarSign, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RecordPaymentPage() {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();

  const [fees, setFees] = useState<any[]>([]);
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'cash',
    notes: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
        setFees(data.fees || []);
      }
    } catch (error) {
      console.error('Failed to fetch fees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedFee || !paymentData.amount) {
      setError('Please select a fee and enter amount');
      return;
    }

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          feeId: selectedFee._id,
          studentId: selectedFee.studentId._id,
          amount: parseFloat(paymentData.amount),
          paymentMethod: paymentData.paymentMethod,
          notes: paymentData.notes,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess('Payment recorded successfully! Trans ID: ' + data.transactionId);
        setPaymentData({ amount: '', paymentMethod: 'cash', notes: '' });
        setSelectedFee(null);
        setTimeout(() => {
          router.push('/dashboard/fees');
        }, 1500);
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to record payment');
      }
    } catch (error) {
      setError('Connection failed');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <DollarSign className="text-indigo-600" size={28} />
            <span>Record Student Payment</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Log transactional details and update outstanding balances</p>
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

      {success && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl flex items-center space-x-2 text-sm font-semibold">
          <CheckCircle size={16} className="text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-2 text-sm font-semibold">
          <AlertCircle size={16} className="text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading pending invoices...</div>
        ) : (
          <form onSubmit={handleRecordPayment} className="space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Add Payment Log Details</h3>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Select Pending Fee Invoice
              </label>
              <select
                value={selectedFee?._id || ''}
                onChange={(e) => {
                  const fee = fees.find((f) => f._id === e.target.value);
                  setSelectedFee(fee);
                  if (fee) {
                    setPaymentData((prev) => ({ ...prev, amount: (fee.amount - fee.amountPaid).toString() }));
                  }
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
                required
              >
                <option value="">Select a pending invoice</option>
                {fees
                  .filter((f) => f.status === 'pending' || f.status === 'partial')
                  .map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.studentId?.firstName} {f.studentId?.lastName} - {f.feeType} ({f.month} {f.year}) (Pending: ৳{f.amount - f.amountPaid})
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Amount Paid (BDT)</label>
                <input
                  type="number"
                  placeholder="Amount"
                  value={paymentData.amount}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, amount: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Method</label>
                <select
                  value={paymentData.paymentMethod}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, paymentMethod: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
                >
                  <option value="cash">Cash Payment</option>
                  <option value="card">Card Payment</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="bkash">bKash (MFS)</option>
                  <option value="nagad">Nagad (MFS)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notes</label>
              <textarea
                placeholder="Add transaction remarks..."
                value={paymentData.notes}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, notes: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
                rows={3}
              />
            </div>

            <div className="flex space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2.5 rounded-xl"
              >
                Record Payment
              </Button>
              <Button
                type="button"
                onClick={() => router.push('/dashboard/fees')}
                className="bg-slate-105 hover:bg-slate-200 text-slate-650 dark:bg-slate-800 dark:text-slate-300 font-medium px-6 py-2.5 rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
