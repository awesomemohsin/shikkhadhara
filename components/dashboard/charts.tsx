'use client';

import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const studentsData = [
  { class: 'Class 1', students: 45 },
  { class: 'Class 2', students: 52 },
  { class: 'Class 3', students: 48 },
  { class: 'Class 4', students: 61 },
  { class: 'Class 5', students: 55 },
  { class: 'Class 6', students: 67 },
];

const attendanceData = [
  { name: 'Present', value: 92, color: '#10b981' },
  { name: 'Absent', value: 5, color: '#f43f5e' },
  { name: 'Late', value: 3, color: '#f59e0b' },
];

const feesData = [
  { month: 'Jan', collected: 45000, pending: 12000 },
  { month: 'Feb', collected: 52000, pending: 8000 },
  { month: 'Mar', collected: 48000, pending: 15000 },
  { month: 'Apr', collected: 61000, pending: 6000 },
  { month: 'May', collected: 55000, pending: 10000 },
  { month: 'Jun', collected: 67000, pending: 5000 },
];

// Custom Premium Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border border-slate-200/50 dark:border-slate-800/50 px-4 py-3 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">{label}</p>
        <div className="space-y-1">
          {payload.map((pld: any) => (
            <div key={pld.name} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pld.color || pld.fill }} />
              <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                {pld.name}: <span className="font-bold text-slate-800 dark:text-slate-100">{pld.value.toLocaleString()}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function StudentsChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={studentsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.4} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
        <XAxis dataKey="class" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.04)', radius: 8 }} />
        <Bar dataKey="students" fill="url(#barGradient)" radius={[6, 6, 0, 0]} maxBarSize={45} name="Students" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AttendanceChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={attendanceData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(entry) => `${entry.name}: ${entry.value}%`}
          outerRadius={80}
          innerRadius={50}
          paddingAngle={4}
          dataKey="value"
        >
          {attendanceData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function FeesChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={feesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="collectedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="pendingGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} />
        <Area type="monotone" dataKey="collected" stroke="#10b981" fillOpacity={1} fill="url(#collectedGrad)" strokeWidth={2.5} name="Collected" />
        <Area type="monotone" dataKey="pending" stroke="#f59e0b" fillOpacity={1} fill="url(#pendingGrad)" strokeWidth={2.5} name="Pending" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
