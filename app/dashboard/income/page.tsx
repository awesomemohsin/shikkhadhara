'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Plus, Search, RefreshCw, Trash2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store';

export default function IncomePage() {
  const token = useAuthStore((state) => state.token);
  
  const [incomes, setIncomes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Admission Forms');
  const [payer, setPayer] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    // Sourced from local storage or fallback to payments
    const saved = localStorage.getItem('income_ledger');
    if (saved) {
      setIncomes(JSON.parse(saved));
      setLoading(false);
    } else {
      // Default setup
      const initial = [
        { id: '1', title: 'Canteen Rent July', amount: 15000, category: 'Leases/Rent', payer: 'Mamun Canteen Co.', date: new Date().toLocaleDateString() },
        { id: '2', title: 'Admission Form Sales Grade 6', amount: 25000, category: 'Admission Forms', payer: 'Various Applicants', date: new Date().toLocaleDateString() }
      ];
      setIncomes(initial);
      localStorage.setItem('income_ledger', JSON.stringify(initial));
      setLoading(false);
    }
  }, []);

  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    const newInc = {
      id: Date.now().toString(),
      title,
      amount: parseFloat(amount) || 0,
      category,
      payer: payer || 'Anonymous',
      date: new Date(date).toLocaleDateString()
    };

    const updated = [newInc, ...incomes];
    setIncomes(updated);
    localStorage.setItem('income_ledger', JSON.stringify(updated));

    setTitle('');
    setAmount('');
    setPayer('');
    setAlertMsg('Income logged successfully!');
    setTimeout(() => setAlertMsg(''), 3000);
  };

  const handleDelete = (id: string) => {
    const updated = incomes.filter((inc) => inc.id !== id);
    setIncomes(updated);
    localStorage.setItem('income_ledger', JSON.stringify(updated));
  };

  const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <TrendingUp className="text-emerald-500" size={28} />
            <span>Income Ledger</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Record outside and supplementary school revenues, sales, and leases.</p>
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
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Cumulative Income</p>
          <p className="text-2xl font-extrabold text-slate-850 dark:text-white mt-1">৳{totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-emerald-500/10 text-emerald-500 p-3 rounded-xl">
          <DollarSign size={20} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create income form */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4 h-fit">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base border-b pb-2">Record Income Received</h3>
          <form onSubmit={handleAddIncome} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Income Title</label>
              <input
                type="text"
                placeholder="e.g., Canteen rent"
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
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 dark:bg-slate-950 rounded-xl outline-none text-slate-850 dark:text-slate-200"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Received Date</label>
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
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Category Source</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 dark:bg-slate-955 rounded-xl outline-none text-slate-800 dark:text-slate-200"
              >
                <option value="Admission Forms">Admission Forms Sales</option>
                <option value="Leases/Rent">Institutional Leases/Rent</option>
                <option value="Donation">Charitable Donation</option>
                <option value="Sponsorship">Event Sponsorship</option>
                <option value="Other">Other Miscellaneous</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Payer Details</label>
              <input
                type="text"
                placeholder="Payer Company or Individual"
                value={payer}
                onChange={(e) => setPayer(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 dark:bg-slate-955 rounded-xl outline-none text-slate-800 dark:text-slate-200"
              />
            </div>

            <Button type="submit" className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl cursor-pointer">
              <span>Log Income</span>
            </Button>
          </form>
        </div>

        {/* Display logs */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm overflow-hidden">
          <h3 className="font-bold text-slate-850 dark:text-slate-200 text-base border-b pb-2 mb-4">Logged Transactions</h3>

          {loading ? (
            <div className="text-center py-12 text-slate-400"><RefreshCw className="animate-spin inline mr-2" /> Syncing finance database...</div>
          ) : incomes.length === 0 ? (
            <div className="text-center py-12 text-slate-400">No transactions recorded.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-850">
                  <tr>
                    <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Details</th>
                    <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Payer</th>
                    <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-xs">Category</th>
                    <th className="px-6 py-3 text-right font-bold text-slate-500 uppercase tracking-wider text-xs">Amount</th>
                    <th className="px-6 py-3 text-center font-bold text-slate-500 tracking-wider text-xs"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {incomes.map((inc) => (
                    <tr key={inc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-850 dark:text-slate-200">{inc.title}</p>
                        <p className="text-[10px] text-slate-450 mt-0.5">{inc.date}</p>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-650">{inc.payer}</td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-bold">{inc.category}</td>
                      <td className="px-6 py-4 text-right text-emerald-600 font-extrabold">৳{inc.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => handleDelete(inc.id)} className="text-slate-400 hover:text-rose-600 transition-colors">
                          <Trash2 size={14} />
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
