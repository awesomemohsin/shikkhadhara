'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { DashboardCard } from '@/components/dashboard/dashboard-card';
import { StudentsChart, AttendanceChart, FeesChart } from '@/components/dashboard/charts';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalStaff: 0,
    monthlyFees: 0,
    attendanceRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading dashboard stats
    setStats({
      totalStudents: 1250,
      totalTeachers: 85,
      totalStaff: 45,
      monthlyFees: 2500000,
      attendanceRate: 92.5,
    });
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back, {user?.firstName}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <DashboardCard
          title="Total Students"
          value={stats.totalStudents.toLocaleString()}
          icon="users"
          color="blue"
        />
        <DashboardCard
          title="Teachers"
          value={stats.totalTeachers.toLocaleString()}
          icon="user-check"
          color="green"
        />
        <DashboardCard
          title="Staff"
          value={stats.totalStaff.toLocaleString()}
          icon="briefcase"
          color="purple"
        />
        <DashboardCard
          title="Monthly Fees"
          value={`${(stats.monthlyFees / 100000).toFixed(1)}L`}
          icon="dollar-sign"
          color="orange"
        />
        <DashboardCard
          title="Attendance Rate"
          value={`${stats.attendanceRate}%`}
          icon="check-circle"
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Students Overview</h2>
          <StudentsChart />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Attendance Today</h2>
          <AttendanceChart />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Fees Collection</h2>
        <FeesChart />
      </div>
    </div>
  );
}
