'use client';

import { useState } from 'react';
import { BarChart3, Download, Printer, Calendar, ShieldAlert, Award, FileText, CheckCircle, TrendingUp, TrendingDown, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatCards } from '@/components/dashboard/stat-cards';
import { PremiumTable } from '@/components/dashboard/premium-table';

export default function ReportsHubPage() {
  const [reportType, setReportType] = useState<'attendance' | 'income' | 'expenses' | 'behaviour'>('attendance');
  const [selectedClass, setSelectedClass] = useState('8');
  const [dateFrom, setDateFrom] = useState('2026-06-01');
  const [dateTo, setDateTo] = useState('2026-06-30');

  // Mock records
  const reportMockData = {
    attendance: [
      { name: 'Tanvir Rahman', roll: '01', present: 22, absent: 2, percentage: '91%' },
      { name: 'Maimuna Islam', roll: '03', present: 24, absent: 0, percentage: '100%' },
      { name: 'Jannat Ara', roll: '05', present: 20, absent: 4, percentage: '83%' }
    ],
    income: [
      { title: 'Canteen Rent July', amount: 15000, category: 'Leases/Rent', payer: 'Mamun Canteen Co.', date: '01/07/2026' },
      { title: 'Admission Form Sales Grade 6', amount: 25000, category: 'Admission Forms', payer: 'Various Applicants', date: '04/07/2026' }
    ],
    expenses: [
      { title: 'Monthly Electricity Bill June', amount: 8400, category: 'Utility Bills', vendor: 'DESCO Power Co.', date: '25/06/2026' },
      { title: 'Whiteboards Procurement', amount: 12000, category: 'Stationery', vendor: 'PaperBack Suppliers', date: '28/06/2026' }
    ],
    behaviour: [
      { name: 'Tanvir Rahman', roll: '01', incident: 'Outstanding Leadership in Science Fair', type: 'Positive', points: '+10' },
      { name: 'Maimuna Islam', roll: '03', incident: 'Late Assignment Submission twice', type: 'Negative', points: '-5' }
    ]
  };

  const handleExport = (format: string) => {
    alert(`Exporting ${reportType} report as ${format.toUpperCase()}...`);
  };

  const handlePrint = () => {
    window.print();
  };

  // Dynamic summary calculations
  const totalIncome = reportMockData.income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = reportMockData.expenses.reduce((sum, item) => sum + item.amount, 0);

  const reportStats = [
    { title: 'Attendance Rate', value: '91.3%', icon: Percent, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30', description: 'Average active rate' },
    { title: 'Income Generated', value: `৳${totalIncome.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30', description: 'Selected period' },
    { title: 'Expenses Incurred', value: `৳${totalExpenses.toLocaleString()}`, icon: TrendingDown, color: 'text-rose-600 bg-rose-50 dark:bg-rose-955/30', description: 'Voucher outflows' },
    { title: 'Incident logs', value: reportMockData.behaviour.length, icon: ShieldAlert, color: 'text-amber-600 bg-amber-50 dark:bg-amber-955/30', description: 'Points evaluations' }
  ];

  // Dynamic table headers mapping
  const getTableHeaders = () => {
    switch (reportType) {
      case 'attendance':
        return ['Student Name', 'Roll No.', 'Present Days', 'Absent Days', 'Attendance Rate'];
      case 'income':
        return ['Income Title & Date', 'Source Category', 'Payer Details', 'Amount Paid'];
      case 'expenses':
        return ['Expense Description & Date', 'Voucher Category', 'Vendor Recipient', 'Outflow Amount'];
      case 'behaviour':
        return ['Student Details', 'Incident Description', 'Classification', 'Points Scale'];
    }
  };

  return (
    <div className="space-y-6 font-sans print:p-0 print:m-0">
      <PageHeader
        title="Central Reports Hub"
        description="Extract student attendance records, income collections invoices, school budget expenses, and student conduct sheets."
        breadcrumbs={[{ label: 'Reports' }]}
        actions={
          <div className="flex gap-2 print:hidden">
            <Button
              onClick={() => handleExport('excel')}
              variant="outline"
              className="flex items-center space-x-1.5 text-slate-700 bg-white border border-slate-205 hover:bg-slate-50 font-bold text-xs"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </Button>
            <Button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 font-bold text-xs shadow-sm"
            >
              <Printer size={14} />
              <span>Print Report</span>
            </Button>
          </div>
        }
      />

      {/* KPI Visualizer */}
      <StatCards cards={reportStats} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 print:grid-cols-1">
        {/* Left selector panel */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-805 rounded-3xl p-5 shadow-xs h-fit print:hidden">
          <h3 className="font-extrabold text-slate-850 dark:text-white text-sm border-b pb-2 mb-4">Report Parameters</h3>
          
          <div className="space-y-4 text-xs font-bold text-slate-600 dark:text-slate-350">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Report classification</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 rounded-xl outline-none"
              >
                <option value="attendance">Student Attendance Sheet</option>
                <option value="income">Income Collections Ledger</option>
                <option value="expenses">Expenses Voucher Logs</option>
                <option value="behaviour">Behaviour Conduct Scorecards</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Target Grade Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 rounded-xl outline-none"
              >
                {['6', '7', '8', '9', '10'].map((c) => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Start Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">End Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 rounded-xl outline-none"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-850 space-y-2">
              <Button
                onClick={handlePrint}
                className="w-full bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl py-2.5 font-bold flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer text-xs"
              >
                <Printer size={14} />
                <span>Print Document</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Right table view */}
        <div className="lg:col-span-3">
          <PremiumTable
            headers={getTableHeaders()}
            stickyHeader={true}
            totalRecords={reportMockData[reportType].length}
          >
            {reportType === 'attendance' &&
              reportMockData.attendance.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{row.name}</td>
                  <td className="px-6 py-4 font-bold text-slate-500">{row.roll}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-700 dark:text-slate-300">{row.present} Days</td>
                  <td className="px-6 py-4 text-xs font-semibold text-rose-600">{row.absent} Days</td>
                  <td className="px-6 py-4 text-xs font-extrabold text-emerald-600">{row.percentage}</td>
                </tr>
              ))}

            {reportType === 'income' &&
              reportMockData.income.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{row.title}</p>
                    <span className="text-[10px] text-slate-400 font-bold">{row.date}</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500">{row.category}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-650">{row.payer}</td>
                  <td className="px-6 py-4 text-xs font-extrabold text-emerald-600">৳{row.amount.toLocaleString()}</td>
                </tr>
              ))}

            {reportType === 'expenses' &&
              reportMockData.expenses.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{row.title}</p>
                    <span className="text-[10px] text-slate-400 font-bold">{row.date}</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500">{row.category}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-650">{row.vendor}</td>
                  <td className="px-6 py-4 text-xs font-extrabold text-rose-600">৳{row.amount.toLocaleString()}</td>
                </tr>
              ))}

            {reportType === 'behaviour' &&
              reportMockData.behaviour.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{row.name}</p>
                    <span className="text-[10px] text-slate-400 font-bold">Roll: {row.roll}</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-650">{row.incident}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-550">{row.type}</td>
                  <td className={`px-6 py-4 text-xs font-black ${row.type === 'Positive' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {row.points}
                  </td>
                </tr>
              ))}
          </PremiumTable>
        </div>
      </div>
    </div>
  );
}
