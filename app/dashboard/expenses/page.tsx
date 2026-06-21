'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Plus, Search, RefreshCw, Trash2, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Utility Bills');
  const [vendor, setVendor] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('approved');
  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('expense_ledger');
    if (saved) {
      setExpenses(JSON.parse(saved));
      setLoading(false);
    } else {
      const initial = [
        { id: '1', title: 'Monthly Electricity Bill June', amount: 8400, category: 'Utility Bills', vendor: 'DESCO Power Co.', date: new Date().toLocaleDateString(), status: 'approved' },
        { id: '2', title: 'Whiteboards & Markers Procurement', amount: 12000, category: 'Stationery', vendor: 'PaperBack Suppliers Ltd.', date: new Date().toLocaleDateString(), status: 'pending' }
      ];
      setExpenses(initial);
      localStorage.setItem('expense_ledger', JSON.stringify(initial));
      setLoading(false);
    }
  }, []);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    const newExp = {
      id: Date.now().toString(),
      title,
      amount: parseFloat(amount) || 0,
      category,
      vendor: vendor || 'Unknown Vendor',
      date: new Date(date).toLocaleDateString(),
      status
    };

    const updated = [newExp, ...expenses];
    setExpenses(updated);
    localStorage.setItem('expense_ledger', JSON.stringify(updated));

    setTitle('');
    setAmount('');
    setVendor('');
    setAlertMsg('Expense logged successfully!');
    setTimeout(() => setAlertMsg(''), 3000);
  };

  const handleDelete = (id: string) => {
    const updated = expenses.filter((exp) => exp.id !== id);
    setExpenses(updated);
    localStorage.setItem('expense_ledger', JSON.stringify(updated));
  };

  const toggleApproval = (id: string) => {
    const updated = expenses.map((exp) =>
      exp.id === id ? { ...exp, status: exp.status === 'approved' ? 'pending' : 'approved' } : exp
    );
    setExpenses(updated);
    localStorage.setItem('expense_ledger', JSON.stringify(updated));
  };

  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <TrendingDown className="text-rose-500" size={28} />
            <span>Expense Ledger</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Monitor utility costs, teacher payroll expenses, and vendor acquisitions.</p>
        </div>
      </div>

      {alertMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl text-xs font-semibold">
          {alertMsg}
        </div>
      )}

      {/* KPI */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Cumulative Expenses</p>
          <p className="text-2xl font-extrabold text-slate-850 dark:text-white mt-1">৳{totalExpense.toLocaleString()}</p>
        </div>
        <div className="bg-rose-500/10 text-rose-500 p-3 rounded-xl">
          <DollarSign size={20} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Expense Form */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4 h-fit">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base border-b pb-2">Record Outgoing Payment</h3>
          
          <form onSubmit={handleAddExpense} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Expense Description</label>
              <input
                type="text"
                placeholder="e.g., Office Stationery items"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 dark:bg-slate-950 rounded-xl outline-none text-slate-850 dark:text-slate-200"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Amount (৳)</label>
                <input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 dark:bg-slate-955 rounded-xl outline-none text-slate-800 dark:text-slate-200"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Billing Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 dark:bg-slate-955 rounded-xl outline-none text-slate-800 dark:text-slate-200"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Expense Head</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 dark:bg-slate-955 rounded-xl outline-none text-slate-800 dark:text-slate-200"
              >
                <option value="Utility Bills">Utility Electricity & Water</option>
                <option value="Stationery">Stationery & Class Tools</option>
                <option value="Maintenance">School Repairs / Maintenance</option>
                <option value="Salary Outsourced">Outsourced Cleaner/Staff</option>
                <option value="Other">Other Expenses</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Vendor</label>
                <input
                  type="text"
                  placeholder="Supplier Company"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 dark:bg-slate-955 rounded-xl outline-none text-slate-800 dark:text-slate-200"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Approval Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 dark:bg-slate-955 rounded-xl outline-none text-slate-800 dark:text-slate-200"
                >
                  <option value="approved">Approved</option>
                  <option value="pending">Pending Admin Review</option>
                </select>
              </div>
            </div>

            <Button type="submit" className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl cursor-pointer">
              <span>Log Expense</span>
            </Button>
          </form>
        </div>

        {/* Display expense logs */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm overflow-hidden">
          <h3 className="font-bold text-slate-850 dark:text-slate-200 text-base border-b pb-2 mb-4">Logged Outgoings</h3>

          {loading ? (
            <div className="text-center py-12 text-slate-400">Syncing database files...</div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-12 text-slate-400">No expenses recorded.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-850">
                  <tr>
                    <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Details</th>
                    <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Vendor</th>
                    <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Head</th>
                    <th className="px-6 py-3 text-right font-bold text-slate-500 uppercase tracking-wider text-xs">Amount</th>
                    <th className="px-6 py-3 text-center font-bold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-850 dark:text-slate-200">{exp.title}</p>
                        <p className="text-[10px] text-slate-450 mt-0.5">{exp.date}</p>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-650">{exp.vendor}</td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-bold">{exp.category}</td>
                      <td className="px-6 py-4 text-right text-rose-600 font-extrabold">৳{exp.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => toggleApproval(exp.id)}
                          className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                            exp.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                          }`}
                        >
                          {exp.status}
                        </button>
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
