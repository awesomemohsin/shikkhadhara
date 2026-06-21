'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useTenantSlug } from '@/lib/hooks/use-tenant-slug';
import { DollarSign, AlertCircle, Search, Filter, RefreshCw, Printer, CheckCircle2, Trash2, CreditCard, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SalariesPage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const tenantSlug = useTenantSlug();

  const [salaries, setSalaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Pay Salary modal state
  const [showPayModal, setShowPayModal] = useState<any | null>(null);
  const [paymentDetails, setPaymentDetails] = useState({
    allowances: 0,
    deductions: 0,
    paymentMethod: 'cash',
  });

  // Selected salary record for printable slip
  const [selectedSlip, setSelectedSlip] = useState<any | null>(null);

  const isAuthorized = user && ['super_admin', 'admin'].includes(user.role);

  useEffect(() => {
    if (isAuthorized) {
      fetchSalaries();
    } else {
      setLoading(false);
    }
  }, [tenantSlug, isAuthorized]);

  const fetchSalaries = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/salaries?tenant=${tenantSlug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSalaries(data.salaries || []);
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to fetch salary data');
      }
    } catch (err: any) {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRunPayroll = async () => {
    if (!confirm('Are you sure you want to run payroll calculations for the current month?')) return;
    setRunning(true);
    setError('');
    setSuccess('');
    try {
      const resTeachers = await fetch('/api/staffs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resTeachers.ok) {
        throw new Error('Failed to fetch staff directory');
      }
      const dataTeachers = await resTeachers.json();
      const teachersList = dataTeachers.teachers || [];

      const today = new Date();
      const currentMonth = today.toLocaleString('default', { month: 'short' });
      const currentYear = today.getFullYear();

      let createdCount = 0;

      for (const teacher of teachersList) {
        const alreadyExists = salaries.some(
          (s) =>
            (s.employeeId?._id === teacher._id || s.employeeId === teacher._id) &&
            s.paymentMonth === currentMonth &&
            s.paymentYear === currentYear
        );

        if (!alreadyExists) {
          const res = await fetch('/api/salaries', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              employeeId: teacher._id,
              employeeType: 'Teacher',
              basicSalary: teacher.salary || 0,
              allowances: 0,
              deductions: 0,
              netSalary: teacher.salary || 0,
              paymentMonth: currentMonth,
              paymentYear: currentYear,
              status: 'pending',
              paymentMethod: 'cash',
            }),
          });
          if (res.ok) {
            createdCount++;
          }
        }
      }

      if (createdCount > 0) {
        setSuccess(`Payroll run completed! Generated ${createdCount} pending salary entries for ${currentMonth} ${currentYear}.`);
        fetchSalaries();
      } else {
        setSuccess(`Payroll is already up to date for ${currentMonth} ${currentYear}. No new entries created.`);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to run payroll');
    } finally {
      setRunning(false);
    }
  };

  const handlePayConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPayModal) return;
    setError('');
    setSuccess('');

    try {
      const basic = showPayModal.basicSalary || 0;
      const net = basic + Number(paymentDetails.allowances) - Number(paymentDetails.deductions);

      const response = await fetch(`/api/salaries/${showPayModal._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          allowances: Number(paymentDetails.allowances),
          deductions: Number(paymentDetails.deductions),
          netSalary: net,
          paymentMethod: paymentDetails.paymentMethod,
          status: 'paid',
          paymentDate: new Date(),
        }),
      });

      if (response.ok) {
        setSuccess(`Salary paid successfully to ${showPayModal.employeeId?.firstName || 'Staff'}!`);
        setShowPayModal(null);
        setPaymentDetails({ allowances: 0, deductions: 0, paymentMethod: 'cash' });
        fetchSalaries();
      } else {
        const err = await response.json();
        setError(err.message || 'Failed to record payment');
      }
    } catch (err) {
      setError('Connection failed');
    }
  };

  const handleDeleteSalary = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the payroll entry for ${name}?`)) return;
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/salaries/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setSuccess('Salary record deleted.');
        fetchSalaries();
      } else {
        const err = await response.json();
        setError(err.message || 'Failed to delete record');
      }
    } catch (err) {
      setError('Connection failed');
    }
  };

  const handlePrintSlip = (salary: any) => {
    setSelectedSlip(salary);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white rounded-2xl shadow-sm border border-rose-50">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h2>
        <p className="text-slate-555 max-w-sm font-medium">
          Salary sheets and payouts are restricted to Institutional Administrators and Super Admins.
        </p>
      </div>
    );
  }

  // Filter & Search matching
  const filteredSalaries = salaries.filter((s) => {
    const empName = s.employeeId ? `${s.employeeId.firstName} ${s.employeeId.lastName || ''}`.toLowerCase() : '';
    const matchesSearch = empName.includes(searchQuery.toLowerCase());
    const matchesMonth = filterMonth === 'all' || s.paymentMonth === filterMonth;
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchesSearch && matchesMonth && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans print:bg-white print:p-0">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <DollarSign className="text-indigo-650" size={28} />
            <span>Payroll & Salaries</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Disburse payouts, apply allowances/deductions, and generate salary registers.</p>
        </div>
        <Button
          onClick={handleRunPayroll}
          disabled={running}
          className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md flex items-center space-x-1.5 text-xs"
        >
          {running ? <RefreshCw className="animate-spin" size={14} /> : <DollarSign size={15} />}
          <span>{running ? 'Processing...' : 'Run Payroll'}</span>
        </Button>
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-semibold text-center flex items-center justify-center gap-2 max-w-xl animate-in fade-in duration-300 print:hidden">
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-455 rounded-2xl text-xs font-semibold text-center flex items-center justify-center gap-2 max-w-xl animate-in fade-in duration-300 print:hidden">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Filters Board */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-805 p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between print:hidden">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-3 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search employees by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-550 text-xs font-semibold"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="text-slate-400" size={16} />
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-3 py-2 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-550 text-xs font-semibold w-28"
          >
            <option value="all">All Months</option>
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-slate-200 dark:border-slate-805 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-550 text-xs font-semibold w-28"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2 print:hidden">
          <RefreshCw className="animate-spin text-indigo-500" size={32} />
          <p className="text-sm font-semibold">Updating salary records...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl overflow-x-auto shadow-sm print:hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-850">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Employee Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Month / Year</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Basic Salary</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Allowances / Deduct</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Net Amount</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {filteredSalaries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-455 dark:text-slate-500 text-sm font-semibold">
                    No payroll registry matching options.
                  </td>
                </tr>
              ) : (
                filteredSalaries.map((salary) => {
                  const empName = salary.employeeId ? `${salary.employeeId.firstName} ${salary.employeeId.lastName || ''}` : 'N/A';
                  return (
                    <tr key={salary._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all duration-150">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{empName}</div>
                        <div className="text-xs text-slate-500 font-semibold capitalize">{salary.employeeType}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-350">
                        {salary.paymentMonth} {salary.paymentYear}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-750 dark:text-slate-300">
                        ৳{salary.basicSalary.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                        <span className="text-emerald-600">+৳{salary.allowances}</span> / <span className="text-rose-600">-৳{salary.deductions}</span>
                      </td>
                      <td className="px-6 py-4 font-black text-slate-850 dark:text-slate-200">
                        ৳{salary.netSalary.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase ${
                          salary.status === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        }`}>
                          {salary.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="flex items-center space-x-3.5">
                          {salary.status === 'pending' ? (
                            <button
                              onClick={() => setShowPayModal(salary)}
                              className="text-emerald-600 hover:underline font-bold"
                            >
                              Pay Staff
                            </button>
                          ) : (
                            <button
                              onClick={() => handlePrintSlip(salary)}
                              className="text-indigo-600 hover:underline font-bold flex items-center gap-0.5"
                            >
                              <Printer size={12} />
                              Receipt
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteSalary(salary._id, empName)}
                            className="text-rose-600 hover:text-rose-800"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pay Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/60 backdrop-blur-xs animate-in fade-in duration-200 print:hidden">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard size={20} className="text-indigo-500" />
                Process Salary Disbursement
              </h2>
              <button onClick={() => setShowPayModal(null)} className="text-slate-400 hover:text-slate-650">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePayConfirm} className="space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Staff Target</p>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-805 rounded-xl">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {showPayModal.employeeId?.firstName} {showPayModal.employeeId?.lastName}
                  </p>
                  <p className="text-xs text-slate-500 font-semibold capitalize mt-0.5">
                    {showPayModal.employeeType} | Basic Base: ৳{showPayModal.basicSalary.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Allowances / Bonus (৳)</label>
                  <input
                    type="number"
                    min="0"
                    value={paymentDetails.allowances}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, allowances: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Deductions (৳)</label>
                  <input
                    type="number"
                    min="0"
                    value={paymentDetails.deductions}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, deductions: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Method</label>
                <select
                  value={paymentDetails.paymentMethod}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, paymentMethod: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-250 dark:border-slate-800 dark:bg-slate-950 rounded-xl text-sm"
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="bkash">bKash Mobile Money</option>
                  <option value="nagad">Nagad Mobile Money</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-805 flex justify-between items-center text-sm font-bold text-slate-800 dark:text-white">
                <span>Computed Net Pay:</span>
                <span className="text-lg text-indigo-650">
                  ৳{(showPayModal.basicSalary + paymentDetails.allowances - paymentDetails.deductions).toLocaleString()}
                </span>
              </div>

              <div className="flex gap-2 pt-4 justify-end">
                <Button
                  type="button"
                  onClick={() => setShowPayModal(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-350 rounded-xl px-5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold px-6 shadow-sm"
                >
                  Confirm Payout
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Salary Slip View (hidden except during print) */}
      {selectedSlip && (
        <div className="hidden print:block font-serif text-slate-900 bg-white max-w-xl mx-auto p-8 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black uppercase tracking-wider">Greenwood High School</h2>
            <p className="text-xs italic text-slate-550">Uttara Campus, Dhaka | Salary Pay Slip</p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-y border-slate-200 py-4 text-xs font-semibold">
            <div>
              <p><span className="text-slate-400">Employee:</span> {selectedSlip.employeeId?.firstName} {selectedSlip.employeeId?.lastName}</p>
              <p><span className="text-slate-400">Designation:</span> {selectedSlip.employeeId?.position || selectedSlip.employeeType}</p>
            </div>
            <div className="text-right">
              <p><span className="text-slate-400">Month:</span> {selectedSlip.paymentMonth} {selectedSlip.paymentYear}</p>
              <p><span className="text-slate-400">Disbursement:</span> {selectedSlip.paymentDate ? new Date(selectedSlip.paymentDate).toLocaleDateString() : '—'}</p>
            </div>
          </div>

          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 font-bold">
                <th className="py-2">Description</th>
                <th className="py-2 text-right">Amount (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr>
                <td className="py-2">Basic Base Salary</td>
                <td className="py-2 text-right">৳{selectedSlip.basicSalary.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="py-2 text-emerald-600">Bonuses / Allowances</td>
                <td className="py-2 text-right text-emerald-600">+৳{selectedSlip.allowances.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="py-2 text-rose-600">Taxes / Deductions</td>
                <td className="py-2 text-right text-rose-600">-৳{selectedSlip.deductions.toLocaleString()}</td>
              </tr>
              <tr className="border-t-2 border-slate-300 font-black text-sm text-slate-850">
                <td className="py-2 font-bold">Total Disbursed Net Pay</td>
                <td className="py-2 text-right">৳{selectedSlip.netSalary.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div className="grid grid-cols-2 gap-8 pt-16 text-[9px] text-center font-bold font-sans">
            <div>
              <div className="border-t border-slate-400 pt-1.5 max-w-[150px] mx-auto">Recipient Signature</div>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1.5 max-w-[150px] mx-auto">Authorized Accountant</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
