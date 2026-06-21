'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { DollarSign, TrendingUp, Plus, Calendar, CheckCircle, Percent, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatCards } from '@/components/dashboard/stat-cards';
import { PremiumTable } from '@/components/dashboard/premium-table';

export default function FeesPage() {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();

  const [fees, setFees] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (token) {
      fetchFees();
      fetchPayments();
    }
  }, [token]);

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

  const totalPending = fees
    .filter((f) => f.status === 'pending' || f.status === 'overdue')
    .reduce((sum, f) => sum + (f.amount - (f.amountPaid || 0)), 0);

  const totalCollected = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  // Filters application
  const filteredFees = fees.filter((fee) => {
    const studentName = `${fee.studentId?.firstName || ''} ${fee.studentId?.lastName || ''}`.toLowerCase();
    const typeStr = (fee.feeType || '').toLowerCase();
    const periodStr = `${fee.month || ''} ${fee.year || ''}`.toLowerCase();

    const matchesSearch = studentName.includes(searchQuery.toLowerCase()) ||
                          typeStr.includes(searchQuery.toLowerCase()) ||
                          periodStr.includes(searchQuery.toLowerCase());

    const matchesStatus = !statusFilter || fee.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // KPI Stat Cards
  const statCards = [
    {
      title: 'Total Pending',
      value: `৳${totalPending.toLocaleString()}`,
      icon: AlertCircle,
      color: 'text-rose-600 bg-rose-50 dark:bg-rose-955/30',
      description: 'Awaiting fee completion'
    },
    {
      title: 'Total Collected',
      value: `৳${totalCollected.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30',
      description: 'Successfully processed'
    },
    {
      title: 'Active Invoices',
      value: fees.length,
      icon: DollarSign,
      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30',
      description: 'Recorded fee vouchers'
    },
    {
      title: 'Collections Rate',
      value: fees.length > 0 ? `${Math.round((totalCollected / (totalCollected + totalPending || 1)) * 100)}%` : '0%',
      icon: Percent,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30',
      description: 'Overall collection efficiency'
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Fees Registry & Invoices"
        description="Monitor student financial ledgers, configure fee schedules, track collected revenues, and handle pending balances."
        breadcrumbs={[{ label: 'Fees' }]}
        actions={
          <>
            <Button
              onClick={() => router.push('/dashboard/fees/configs')}
              variant="outline"
              className="flex items-center space-x-1.5 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl px-4 py-2 font-bold text-xs shrink-0"
            >
              <span>Billing Configs</span>
            </Button>
            <Button
              onClick={() => router.push('/dashboard/fees/payments')}
              variant="outline"
              className="flex items-center space-x-1.5 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl px-4 py-2 font-bold text-xs shrink-0"
            >
              <span>Payment Logs</span>
            </Button>
            <Button
              onClick={() => router.push('/dashboard/fees/record')}
              className="flex items-center space-x-1.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl px-5 py-2 font-bold text-xs shadow-sm shrink-0"
            >
              <Plus size={16} />
              <span>Record Payment</span>
            </Button>
          </>
        }
      />

      {/* Stats summaries */}
      <StatCards cards={statCards} />

      {/* Invoices grid table */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">
          <span className="text-sm font-semibold">Updating billing ledgers...</span>
        </div>
      ) : (
        <PremiumTable
          headers={['Student Name', 'Fee Type', 'Period', 'Amount Due', 'Amount Paid', 'Remaining Balance', 'Status', 'Due Date']}
          searchPlaceholder="Search student name, fee type, month..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          filterValue={statusFilter}
          onFilterChange={setStatusFilter}
          filterPlaceholder="All Invoices"
          filterOptions={[
            { label: 'Show All', value: '' },
            { label: 'Fully Paid', value: 'paid' },
            { label: 'Partially Paid', value: 'partial' },
            { label: 'Unpaid / Pending', value: 'pending' },
            { label: 'Overdue Balance', value: 'overdue' },
          ]}
          onPrint={() => window.print()}
          onExport={() => alert('Exporting fees list as spreadsheet...')}
          totalRecords={filteredFees.length}
        >
          {filteredFees.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-6 py-12 text-center text-slate-455 dark:text-slate-500 text-sm font-semibold">
                No fee records matched the active search filters.
              </td>
            </tr>
          ) : (
            filteredFees.map((fee) => {
              const pendingAmount = fee.amount - (fee.amountPaid || 0);
              return (
                <tr
                  key={fee._id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all duration-155"
                >
                  <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                    {fee.studentId?.firstName} {fee.studentId?.lastName}
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-350">
                    {fee.feeType}
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                    {fee.month} {fee.year}
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-800 dark:text-slate-205">
                    ৳{fee.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    ৳{(fee.amountPaid || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-xs font-extrabold text-slate-850 dark:text-slate-200">
                    ৳{pendingAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${
                        fee.status === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : fee.status === 'partial'
                            ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                      }`}
                    >
                      {fee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-450 dark:text-slate-400">
                    {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : '—'}
                  </td>
                </tr>
              );
            })
          )}
        </PremiumTable>
      )}
    </div>
  );
}
