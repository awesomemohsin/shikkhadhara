'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Plus, DollarSign, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FeesPage() {
  const token = useAuthStore((state) => state.token);
  const [fees, setFees] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'fees' | 'payments'>('fees');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'cash',
    notes: '',
  });

  useEffect(() => {
    fetchFees();
    fetchPayments();
  }, []);

  const fetchFees = async () => {
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

  const fetchPayments = async () => {
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
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFee || !paymentData.amount) {
      alert('Please select a fee and enter amount');
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
        alert('Payment recorded: ' + data.transactionId);
        setPaymentData({ amount: '', paymentMethod: 'cash', notes: '' });
        setSelectedFee(null);
        setShowPaymentForm(false);
        fetchFees();
        fetchPayments();
      }
    } catch (error) {
      console.error('Failed to record payment:', error);
    }
  };

  const totalPending = fees
    .filter((f) => f.status === 'pending' || f.status === 'overdue')
    .reduce((sum, f) => sum + (f.amount - (f.amountPaid || 0)), 0);

  const totalCollected = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
        <p className="text-gray-600 mt-1">Track fees and payments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Pending</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {totalPending.toLocaleString()}
              </p>
            </div>
            <DollarSign size={24} className="text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Collected</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {totalCollected.toLocaleString()}
              </p>
            </div>
            <TrendingUp size={24} className="text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Collection Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {fees.length > 0
                  ? ((
                      (payments.filter((p) => p.status === 'completed').length /
                        fees.length) *
                      100
                    ).toFixed(1) as any)
                  : 0}
                %
              </p>
            </div>
            <TrendingUp size={24} className="text-blue-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('fees')}
            className={`flex-1 px-6 py-3 font-medium ${
              activeTab === 'fees'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600'
            }`}
          >
            Fees
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex-1 px-6 py-3 font-medium ${
              activeTab === 'payments'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600'
            }`}
          >
            Payments
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'fees' && (
            <div className="space-y-4">
              <Button
                onClick={() => setShowPaymentForm(!showPaymentForm)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus size={20} className="mr-2" />
                Record Payment
              </Button>

              {showPaymentForm && (
                <form onSubmit={handleRecordPayment} className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Fee
                    </label>
                    <select
                      value={selectedFee?._id || ''}
                      onChange={(e) => {
                        const fee = fees.find((f) => f._id === e.target.value);
                        setSelectedFee(fee);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    >
                      <option value="">Select a pending fee</option>
                      {fees
                        .filter((f) => f.status === 'pending' || f.status === 'partial')
                        .map((f) => (
                          <option key={f._id} value={f._id}>
                            {f.studentId?.firstName} {f.studentId?.lastName} - {f.feeType} (Pending:{' '}
                            {f.amount - f.amountPaid})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="number"
                      placeholder="Amount"
                      value={paymentData.amount}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, amount: e.target.value })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                    <select
                      value={paymentData.paymentMethod}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, paymentMethod: e.target.value })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="bkash">bKash</option>
                      <option value="nagad">Nagad</option>
                    </select>
                  </div>

                  <textarea
                    placeholder="Notes"
                    value={paymentData.notes}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, notes: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={2}
                  />

                  <div className="flex space-x-2">
                    <Button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Record Payment
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setShowPaymentForm(false)}
                      className="bg-gray-400 hover:bg-gray-500 text-white"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {loading ? (
                <div className="text-center py-12">Loading fees...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Student</th>
                        <th className="px-4 py-2 text-left">Fee Type</th>
                        <th className="px-4 py-2 text-right">Amount</th>
                        <th className="px-4 py-2 text-right">Paid</th>
                        <th className="px-4 py-2 text-right">Pending</th>
                        <th className="px-4 py-2 text-left">Status</th>
                        <th className="px-4 py-2 text-left">Due Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {fees.map((fee) => (
                        <tr key={fee._id} className="hover:bg-gray-50">
                          <td className="px-4 py-2">
                            {fee.studentId?.firstName} {fee.studentId?.lastName}
                          </td>
                          <td className="px-4 py-2">{fee.feeType}</td>
                          <td className="px-4 py-2 text-right">{fee.amount}</td>
                          <td className="px-4 py-2 text-right">{fee.amountPaid}</td>
                          <td className="px-4 py-2 text-right">
                            {fee.amount - fee.amountPaid}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                fee.status === 'paid'
                                  ? 'bg-green-100 text-green-800'
                                  : fee.status === 'partial'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {fee.status}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            {new Date(fee.dueDate).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Transaction ID</th>
                    <th className="px-4 py-2 text-left">Student</th>
                    <th className="px-4 py-2 text-right">Amount</th>
                    <th className="px-4 py-2 text-left">Method</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-xs">
                        {payment.transactionId}
                      </td>
                      <td className="px-4 py-2">
                        {payment.studentId?.firstName} {payment.studentId?.lastName}
                      </td>
                      <td className="px-4 py-2 text-right">{payment.amount}</td>
                      <td className="px-4 py-2 capitalize">
                        {payment.paymentMethod.replace('_', ' ')}
                      </td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
