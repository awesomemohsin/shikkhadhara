'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Plus, DollarSign, TrendingUp, Settings, Trash2, Calendar, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FeesPage() {
  const token = useAuthStore((state) => state.token);
  const [fees, setFees] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'fees' | 'payments' | 'configs'>('fees');
  
  // Payment Form state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'cash',
    notes: '',
  });

  // Config Form states
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');

  const [showAllocationForm, setShowAllocationForm] = useState(false);
  const [allocData, setAllocData] = useState({
    feeCategoryId: '',
    class: '',
    amount: '',
    dueDate: '',
    month: new Date().toLocaleString('default', { month: 'short' }),
    year: new Date().getFullYear().toString(),
    description: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchFees();
    fetchPayments();
    fetchCategories();
    fetchAllocations();
    fetchSections();
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

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/fees/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchAllocations = async () => {
    try {
      const response = await fetch('/api/fees/allocations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAllocations(data.allocations || []);
      }
    } catch (error) {
      console.error('Failed to fetch allocations:', error);
    }
  };

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/sections', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSections(data.sections || []);
      }
    } catch (error) {
      console.error('Failed to fetch sections:', error);
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
        setShowPaymentForm(false);
        fetchFees();
        fetchPayments();
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to record payment');
      }
    } catch (error) {
      setError('Connection failed');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/fees/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: categoryName, description: categoryDesc }),
      });

      if (response.ok) {
        setSuccess('Fee category created!');
        setCategoryName('');
        setCategoryDesc('');
        setShowCategoryForm(false);
        fetchCategories();
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to create category');
      }
    } catch (error) {
      setError('Connection failed');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fee category?')) return;
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/fees/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setSuccess('Fee category deleted!');
        fetchCategories();
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to delete category');
      }
    } catch (error) {
      setError('Connection failed');
    }
  };

  const handleTriggerAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/fees/allocations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(allocData),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Fees successfully allocated! Generated ${data.generatedInvoicesCount} student invoices.`);
        setAllocData({
          feeCategoryId: '',
          class: '',
          amount: '',
          dueDate: '',
          month: new Date().toLocaleString('default', { month: 'short' }),
          year: new Date().getFullYear().toString(),
          description: '',
        });
        setShowAllocationForm(false);
        fetchAllocations();
        fetchFees();
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to trigger fee allocation');
      }
    } catch (error) {
      setError('Connection failed');
    }
  };

  const totalPending = fees
    .filter((f) => f.status === 'pending' || f.status === 'overdue')
    .reduce((sum, f) => sum + (f.amount - (f.amountPaid || 0)), 0);

  const totalCollected = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const uniqueClasses = Array.from(new Set(sections.map((s) => s.class)));

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <DollarSign className="text-indigo-600" size={28} />
            <span>Fees & Invoices Management</span>
          </h1>
          <p className="text-slate-500 mt-1">Allocate fees per class, track transactions, and record student payments</p>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Pending</p>
              <p className="text-2xl font-extrabold text-slate-800 mt-2">
                ৳{totalPending.toLocaleString()}
              </p>
            </div>
            <DollarSign size={24} className="text-rose-500" />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Collected</p>
              <p className="text-2xl font-extrabold text-emerald-600 mt-2">
                ৳{totalCollected.toLocaleString()}
              </p>
            </div>
            <TrendingUp size={24} className="text-emerald-500" />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Invoices Count</p>
              <p className="text-2xl font-extrabold text-indigo-600 mt-2">
                {fees.length}
              </p>
            </div>
            <TrendingUp size={24} className="text-indigo-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('fees')}
            className={`flex-1 py-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'fees'
                ? 'text-indigo-600 border-indigo-600 bg-white'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            Fees Registry
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex-1 py-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'payments'
                ? 'text-indigo-600 border-indigo-600 bg-white'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            Payment Logs
          </button>
          <button
            onClick={() => setActiveTab('configs')}
            className={`flex-1 py-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'configs'
                ? 'text-indigo-600 border-indigo-600 bg-white'
                : 'text-slate-500 hover:text-slate-800 border-transparent'
            }`}
          >
            Billing Configs
          </button>
        </div>

        <div className="p-6">
          {/* Fees Registry Tab */}
          {activeTab === 'fees' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Button
                  onClick={() => setShowPaymentForm(!showPaymentForm)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-md flex items-center space-x-1.5"
                >
                  <Plus size={16} />
                  <span>Record Payment</span>
                </Button>
              </div>

              {showPaymentForm && (
                <form onSubmit={handleRecordPayment} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 animate-in fade-in duration-200">
                  <h3 className="font-bold text-slate-800 text-sm">Add Payment Log</h3>
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
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-750"
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
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-750"
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
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-750"
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
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-750"
                      rows={2}
                    />
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-xl"
                    >
                      Record Payment
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setShowPaymentForm(false)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-650 font-medium px-4 py-2 rounded-xl"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {loading ? (
                <div className="text-center py-12 text-slate-450 font-medium">Loading fees...</div>
              ) : (
                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-slate-550">Student</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-550">Fee Type</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-550">Period</th>
                        <th className="px-4 py-3 text-right font-semibold text-slate-550">Amount</th>
                        <th className="px-4 py-3 text-right font-semibold text-slate-550">Paid</th>
                        <th className="px-4 py-3 text-right font-semibold text-slate-550">Pending</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-550">Status</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-550">Due Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {fees.map((fee) => (
                        <tr key={fee._id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {fee.studentId?.firstName} {fee.studentId?.lastName}
                          </td>
                          <td className="px-4 py-3 text-slate-600 font-medium">{fee.feeType}</td>
                          <td className="px-4 py-3 text-slate-500 font-semibold text-xs uppercase">{fee.month} {fee.year}</td>
                          <td className="px-4 py-3 text-right text-slate-800 font-medium">৳{fee.amount}</td>
                          <td className="px-4 py-3 text-right text-slate-800">৳{fee.amountPaid}</td>
                          <td className="px-4 py-3 text-right text-slate-850 font-bold">৳{fee.amount - fee.amountPaid}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                fee.status === 'paid'
                                  ? 'bg-green-50 text-green-700 border border-green-100'
                                  : fee.status === 'partial'
                                    ? 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                                    : 'bg-red-50 text-red-700 border border-red-100'
                              }`}
                            >
                              {fee.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-450 font-medium">
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

          {/* Payment Logs Tab */}
          {activeTab === 'payments' && (
            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-550">Transaction ID</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-550">Student</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-550">Amount</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-550">Method</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-550">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-550">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-indigo-500 font-semibold">
                        {payment.transactionId}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {payment.studentId?.firstName} {payment.studentId?.lastName}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-850 font-bold">৳{payment.amount}</td>
                      <td className="px-4 py-3 capitalize text-slate-600 font-medium">
                        {payment.paymentMethod.replace('_', ' ')}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-50 text-green-700 border border-green-100">
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-450 font-medium">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Configurations Tab */}
          {activeTab === 'configs' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Category Configurations Panel */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 text-base">Fee Billing Categories</h3>
                  <Button
                    onClick={() => setShowCategoryForm(!showCategoryForm)}
                    className="bg-indigo-550/10 hover:bg-indigo-500/20 text-indigo-600 font-semibold px-2.5 py-1.5 text-xs rounded-xl"
                  >
                    <Plus size={14} className="mr-1 inline" />
                    <span>Create Category</span>
                  </Button>
                </div>

                {showCategoryForm && (
                  <form onSubmit={handleCreateCategory} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Admission Fee"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-750"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                      <input
                        type="text"
                        placeholder="Describe the fee purpose..."
                        value={categoryDesc}
                        onChange={(e) => setCategoryDesc(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-750"
                      />
                    </div>
                    <div className="flex space-x-2 pt-1">
                      <Button type="submit" className="bg-indigo-650 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-xl">
                        Save Category
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShowCategoryForm(false)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-650 font-medium px-4 py-2 rounded-xl"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 space-y-3">
                  {categories.length === 0 ? (
                    <p className="text-slate-450 text-xs italic p-4 text-center">No custom fee categories defined.</p>
                  ) : (
                    categories.map((cat) => (
                      <div key={cat._id} className="flex justify-between items-center bg-white border border-slate-100 rounded-xl p-3 shadow-xs">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{cat.name}</p>
                          <p className="text-xs text-slate-450 mt-0.5">{cat.description || 'No description'}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteCategory(cat._id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Class Allocation Trigger panel */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 text-base">Allocate Fees to Class</h3>
                  <Button
                    onClick={() => setShowAllocationForm(!showAllocationForm)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-2.5 py-1.5 text-xs rounded-xl shadow-md"
                  >
                    <Plus size={14} className="mr-1 inline" />
                    <span>Run Allocation</span>
                  </Button>
                </div>

                {showAllocationForm && (
                  <form onSubmit={handleTriggerAllocation} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 animate-in fade-in duration-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fee Category</label>
                        <select
                          value={allocData.feeCategoryId}
                          onChange={(e) => setAllocData({ ...allocData, feeCategoryId: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-750"
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target Class</label>
                        <select
                          value={allocData.class}
                          onChange={(e) => setAllocData({ ...allocData, class: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-750"
                          required
                        >
                          <option value="">Select Class</option>
                          {uniqueClasses.map((cls) => (
                            <option key={cls} value={cls}>
                              {cls}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Amount (BDT)</label>
                        <input
                          type="number"
                          placeholder="e.g. 5000"
                          value={allocData.amount}
                          onChange={(e) => setAllocData({ ...allocData, amount: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-750"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Due Date</label>
                        <input
                          type="date"
                          value={allocData.dueDate}
                          onChange={(e) => setAllocData({ ...allocData, dueDate: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-750"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billing Month</label>
                        <select
                          value={allocData.month}
                          onChange={(e) => setAllocData({ ...allocData, month: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-750"
                        >
                          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billing Year</label>
                        <input
                          type="number"
                          value={allocData.year}
                          onChange={(e) => setAllocData({ ...allocData, year: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-750"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description / Invoice Notes</label>
                      <input
                        type="text"
                        placeholder="e.g. Term 2 exam fees"
                        value={allocData.description}
                        onChange={(e) => setAllocData({ ...allocData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-750"
                      />
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button type="submit" className="bg-indigo-650 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-xl">
                        Trigger Allocations
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShowAllocationForm(false)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-650 font-medium px-4 py-2 rounded-xl"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

                {/* Past Allocations History */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Allocations Audit Ledger</h4>
                  {allocations.length === 0 ? (
                    <p className="text-slate-450 text-xs italic py-4 text-center">No allocations processed.</p>
                  ) : (
                    allocations.map((alloc) => (
                      <div key={alloc._id} className="bg-white border border-slate-100 rounded-xl p-3 shadow-xs text-xs space-y-1">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>{alloc.category ? alloc.category.name : 'Unknown Fee'}</span>
                          <span className="text-indigo-650">৳{alloc.amount}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Class: <span className="font-semibold text-slate-700">{alloc.class}</span> | {alloc.month} {alloc.year}</span>
                          <span>Due: {new Date(alloc.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
