'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Download, Printer, Calendar, ShieldAlert, Award, FileText, CheckCircle, TrendingUp, TrendingDown, Percent, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatCards } from '@/components/dashboard/stat-cards';
import { PremiumTable } from '@/components/dashboard/premium-table';
import { useAuthStore } from '@/lib/store';
import { formatClassName } from '@/lib/utils';

export default function ReportsHubPage() {
  const { token } = useAuthStore();
  const [reportType, setReportType] = useState<'attendance' | 'income' | 'expenses' | 'behaviour'>('attendance');
  const [selectedClass, setSelectedClass] = useState('8');
  const [dateFrom, setDateFrom] = useState('2026-06-01');
  const [dateTo, setDateTo] = useState('2026-06-30');

  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReportData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/reports?type=${reportType}&class=${selectedClass}&dateFrom=${dateFrom}&dateTo=${dateTo}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setReportData(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchReportData();
    }
  }, [token, reportType, selectedClass, dateFrom, dateTo]);

  const handleExportCSV = () => {
    if (reportData.length === 0) {
      alert('No data available to export.');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    const headers = getTableHeaders();
    csvContent += headers.join(',') + '\r\n';

    reportData.forEach((row) => {
      let rowData: string[] = [];
      if (reportType === 'attendance') {
        rowData = [row.name, row.roll, row.present, row.absent, row.percentage];
      } else if (reportType === 'income') {
        rowData = [row.title, row.category, row.payer, row.amount];
      } else if (reportType === 'expenses') {
        rowData = [row.title, row.category, row.vendor, row.amount];
      } else if (reportType === 'behaviour') {
        rowData = [row.name, row.roll, row.incident, row.type, row.points];
      }
      const escapedRow = rowData.map((val) => `"${String(val).replace(/"/g, '""')}"`);
      csvContent += escapedRow.join(',') + '\r\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${reportType}_report_${dateFrom}_to_${dateTo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const getAttendanceRate = () => {
    if (reportType !== 'attendance' || reportData.length === 0) return '92.5%';
    const rates = reportData.map((r) => parseFloat(r.percentage) || 100);
    const avg = rates.reduce((sum, val) => sum + val, 0) / rates.length;
    return `${Math.round(avg)}%`;
  };

  const getIncomeTotal = () => {
    if (reportType !== 'income') return 0;
    return reportData.reduce((sum, r) => sum + (r.amount || 0), 0);
  };

  const getExpensesTotal = () => {
    if (reportType !== 'expenses') return 0;
    return reportData.reduce((sum, r) => sum + (r.amount || 0), 0);
  };

  const getIncidentsCount = () => {
    if (reportType !== 'behaviour') return 0;
    return reportData.length;
  };

  const reportStats = [
    { title: 'Attendance Rate', value: getAttendanceRate(), icon: Percent, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30', description: 'Average active rate' },
    { title: 'Income Generated', value: `৳${getIncomeTotal().toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30', description: 'Selected period' },
    { title: 'Expenses Incurred', value: `৳${getExpensesTotal().toLocaleString()}`, icon: TrendingDown, color: 'text-rose-600 bg-rose-50 dark:bg-rose-955/30', description: 'Voucher outflows' },
    { title: 'Incident logs', value: getIncidentsCount().toString(), icon: ShieldAlert, color: 'text-amber-600 bg-amber-50 dark:bg-amber-955/30', description: 'Points evaluations' }
  ];

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
              onClick={handleExportCSV}
              variant="outline"
              className="flex items-center space-x-1.5 text-slate-700 bg-white border border-slate-205 hover:bg-slate-50 font-bold text-xs"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </Button>
            <Button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 font-bold text-xs shadow-sm cursor-pointer"
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
          {loading ? (
            <div className="py-16 text-center text-slate-450 font-medium bg-white dark:bg-slate-900 border rounded-3xl">
              <RefreshCw className="animate-spin inline-block mr-2 text-indigo-650" size={16} />
              Aggregating statistics from database...
            </div>
          ) : (
            <PremiumTable
              headers={getTableHeaders()}
              stickyHeader={true}
              totalRecords={reportData.length}
            >
              {reportType === 'attendance' &&
                reportData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{row.name}</td>
                    <td className="px-6 py-4 font-bold text-slate-500">{row.roll}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-700 dark:text-slate-300">{row.present} Days</td>
                    <td className="px-6 py-4 text-xs font-semibold text-rose-600">{row.absent} Days</td>
                    <td className="px-6 py-4 text-xs font-extrabold text-emerald-600">{row.percentage}</td>
                  </tr>
                ))}

              {reportType === 'income' &&
                reportData.map((row, idx) => (
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
                reportData.map((row, idx) => (
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
                reportData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{row.name}</p>
                      <span className="text-[10px] text-slate-400 font-bold">Roll: {row.roll}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-650">{row.incident}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-550">{row.type}</td>
                    <td className={`px-6 py-4 text-xs font-black ${row.type?.toLowerCase() === 'positive' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {row.points}
                    </td>
                  </tr>
                ))}
            </PremiumTable>
          )}
        </div>
      </div>
    </div>
  );
}
