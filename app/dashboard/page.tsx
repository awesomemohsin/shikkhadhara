'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useTenantSlug } from '@/lib/hooks/use-tenant-slug';
import { FeesChart, StudentsChart } from '@/components/dashboard/charts';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  Briefcase,
  DollarSign,
  CheckCircle,
  HelpCircle,
  FileText,
  QrCode,
  Calendar,
  Layers,
  Archive,
  Home,
  Image as ImageIcon,
  Bell,
  CheckSquare,
  Sparkles,
  ChevronRight,
  Settings,
  BookOpen,
  Plus,
  TrendingUp,
  LayoutDashboard,
  ShieldAlert
} from 'lucide-react';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const tenant = useAuthStore((state) => state.tenant);
  const token = useAuthStore((state) => state.token);
  const tenantSlug = useTenantSlug();

  const [stats, setStats] = useState<any>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getHref = (href: string) => {
    if (user?.role === 'owner') {
      return href;
    }
    return tenantSlug ? `/${tenantSlug}${href}` : href;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (user?.role === 'owner') {
          const response = await fetch('/api/tenants', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            const fetchedTenants = data.tenants || [];
            setTenants(fetchedTenants);
            
            const activeCount = fetchedTenants.filter((t: any) => t.status === 'active').length;
            const platformRevenue = activeCount * 15000;

            setStats({
              registeredSchools: fetchedTenants.length,
              activeSubscriptions: activeCount,
              platformRevenue: platformRevenue,
              pendingTickets: fetchedTenants.filter((t: any) => t.status === 'suspended').length,
            });
          }
        } else {
          const response = await fetch('/api/dashboard/stats', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            setStats(data.stats);
          }
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };

    if (token && user) {
      fetchDashboardData();
    }
  }, [token, user]);

  // Loading Skeleton
  if (loading || !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  // 1. SYSTEM OWNER DASHBOARD VIEW
  if (user?.role === 'owner') {
    return (
      <div className="space-y-6">
        {/* Welcome */}
        <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white overflow-hidden shadow-xl border border-slate-800">
          <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-500/20 border border-violet-400/20 rounded-full text-violet-300 text-xs font-semibold">
                <ShieldAlert size={14} />
                SaaS Super Console
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">System Owner Panel</h1>
              <p className="text-slate-300 text-sm max-w-xl">
                Logged in as <span className="font-semibold text-violet-300">{user.email}</span>. Manage SaaS subscription plans, provision new school tenants, and review platform-wide billing details.
              </p>
            </div>
            <Link
              href={getHref('/dashboard/tenants')}
              className="flex items-center gap-2 text-slate-900 dark:text-white hover:text-indigo-650 font-bold transition-all duration-150 self-start md:self-auto text-sm px-4 py-2"
            >
              <Plus size={16} className="text-slate-900 dark:text-white" />
              Register New School
            </Link>
          </div>
        </div>

        {/* Global SaaS Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { title: 'Registered Schools', value: stats?.registeredSchools?.toString() || '0', icon: Home, color: 'text-indigo-400 bg-indigo-500/10' },
            { title: 'Active Subscriptions', value: stats?.activeSubscriptions?.toString() || '0', icon: CheckCircle, color: 'text-emerald-400 bg-emerald-500/10' },
            { title: 'Total Platform Revenue', value: `৳${(stats?.platformRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-amber-400 bg-amber-500/10' },
            { title: 'Pending Support Tickets', value: stats?.pendingTickets?.toString() || '0', icon: HelpCircle, color: 'text-rose-400 bg-rose-500/10' },
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{card.title}</p>
                  <p className="text-2xl font-extrabold text-slate-850 dark:text-white mt-1.5 tracking-tight">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-xl`}>
                  <Icon size={24} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick SaaS Management Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">SaaS Platform Activity</h2>
            <div className="space-y-4">
              {tenants.length === 0 ? (
                <p className="text-sm text-slate-400 font-medium py-4 text-center">No registered schools found.</p>
              ) : (
                tenants.slice(0, 5).map((t, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3 last:border-b-0 last:pb-0">
                    <div>
                      <p className="text-sm font-bold text-slate-850 dark:text-slate-200">{t.name}</p>
                      <p className="text-xs text-slate-450 dark:text-slate-500">subdomain: {t.subdomain}.shikkhadhara.com</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg capitalize">{t.type}</span>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${t.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-md font-bold text-slate-800 dark:text-white">Platform Configurations</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manage base features, server nodes, global notification pipelines, and payment processors.</p>
            <div className="space-y-2.5">
              <Link href="/dashboard/tenants" className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs font-semibold text-slate-700 dark:text-slate-350">
                <span>Configure Subscriptions</span>
                <ChevronRight size={14} />
              </Link>
              <Link href="/dashboard/settings" className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs font-semibold text-slate-700 dark:text-slate-350">
                <span>SMS / WhatsApp Gateways</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. TEACHER DASHBOARD VIEW
  if (user?.role === 'teacher') {
    return (
      <div className="space-y-6">
        {/* Welcome */}
        <div className="relative bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white overflow-hidden shadow-xl border border-slate-800">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 border border-indigo-400/20 rounded-full text-indigo-300 text-xs font-semibold">
                <Sparkles size={14} className="animate-pulse" />
                Teacher Workspace
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Welcome back, {user.firstName || 'Teacher'}!
              </h1>
              <p className="text-slate-300 text-sm max-w-xl">
                Logged in as Teacher for <span className="font-semibold text-indigo-300">{tenant?.name || 'School'}</span>. Set student attendance, check class exam schedules, and record grades.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 self-start md:self-auto">
              <Calendar className="text-indigo-400 size-6" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Academic Year</p>
                <p className="text-sm font-semibold text-white">{stats.activeSession || '2026-2027'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Teacher metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: 'My Classes', value: '2', icon: BookOpen, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30' },
            { title: 'My Students', value: stats.totalStudents, icon: Users, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' },
            { title: 'Class Attendance Today', value: stats.studentAttendance, icon: CheckCircle, color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30' },
            { title: 'Active Exams', value: '1', icon: FileText, color: 'text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-50 dark:bg-fuchsia-950/30' }
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">{card.title}</p>
                  <p className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-white mt-1">{card.value}</p>
                </div>
                <div className={`${card.color} p-2 rounded-lg`}>
                  <Icon size={18} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Teacher actions grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">My Class Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: 'Take Student Attendance', desc: 'Record attendance for Class A & B', href: '/dashboard/attendance', icon: CheckSquare },
                { title: 'Record Exam Marks', desc: 'Publish scores for Mathematics', href: '/dashboard/exams', icon: FileText },
                { title: 'Student Directory', desc: 'View profiles of assigned classes', href: '/dashboard/students', icon: Users },
                { title: 'Class Timetable', desc: 'Review scheduled lectures', href: '/dashboard/attendance', icon: Calendar }
              ].map((link, idx) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={idx}
                    href={getHref(link.href)}
                    className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 hover:border-slate-200 dark:border-slate-800 bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950/20 dark:hover:bg-slate-950/50 transition-all duration-150 group"
                  >
                    <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl group-hover:scale-105 transition-transform duration-150">
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-150">{link.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{link.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Students Distribution Chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
            <h2 className="text-md font-bold text-slate-800 dark:text-white mb-4">Class Overview</h2>
            <StudentsChart />
          </div>
        </div>
      </div>
    );
  }

  // 3. SCHOOL ADMINISTRATOR DASHBOARD VIEW
  const statCards = [
    { title: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30', href: '/dashboard/students' },
    { title: 'Total Staff', value: stats.totalStaff, icon: Briefcase, color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30', href: '/dashboard/staffs' },
    { title: 'Classes', value: stats.totalClasses, icon: BookOpen, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30', href: '/dashboard/settings' },
    { title: 'Expenses', value: `৳${stats.totalExpenses.toLocaleString()}`, icon: DollarSign, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30', href: '/dashboard/fees' },
    { title: 'Student Attendance', value: stats.studentAttendance, icon: CheckCircle, color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30', href: '/dashboard/attendance' },
    { title: 'Staff Attendance', value: stats.staffAttendance, icon: UserCheck, color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/30', href: '/dashboard/attendance' },
    { title: 'Help & Support', value: 'Support', icon: HelpCircle, color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30', href: '/dashboard/settings' },
    { title: 'Attendance Reports', value: 'Reports', icon: FileText, color: 'text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-50 dark:bg-fuchsia-950/30', href: '/dashboard/attendance' },
    { title: 'Income Reports', value: 'Finance', icon: DollarSign, color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30', href: '/dashboard/fees' },
    { title: 'Expenses Reports', value: 'Reports', icon: FileText, color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30', href: '/dashboard/fees' },
    { title: 'QR Attendance', value: 'Scanner', icon: QrCode, color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/30', href: '/dashboard/attendance' },
    { title: 'Student Leave', value: 'Requests', icon: Calendar, color: 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/30', href: '/dashboard/attendance' },
  ];

  const quickLinks = [
    { title: 'Student Admission', desc: 'Register new students', icon: Users, href: '/dashboard/students', bg: 'bg-indigo-500/10 text-indigo-500' },
    { title: 'Staff Management', desc: 'Manage teachers and employees', icon: Briefcase, href: '/dashboard/staffs', bg: 'bg-violet-500/10 text-violet-500' },
    { title: 'Classes Setup', desc: 'Setup class groups', icon: BookOpen, href: '/dashboard/settings', bg: 'bg-emerald-500/10 text-emerald-500' },
    { title: 'Session Manager', desc: 'Academic calendar periods', icon: Calendar, href: '/dashboard/settings', bg: 'bg-teal-500/10 text-teal-500' },
    { title: 'Section Settings', desc: 'Add sections and groups', icon: Layers, href: '/dashboard/settings', bg: 'bg-orange-500/10 text-orange-500' },
    { title: 'Subject Groups', desc: 'Course catalog groupings', icon: Archive, href: '/dashboard/settings', bg: 'bg-sky-500/10 text-sky-500' },
    { title: 'Exam Scheduler', desc: 'Create exam timetables', icon: Calendar, href: '/dashboard/exams', bg: 'bg-amber-500/10 text-amber-500' },
    { title: 'Exam Results', desc: 'Publish academic grades', icon: FileText, href: '/dashboard/exams', bg: 'bg-fuchsia-500/10 text-fuchsia-500' },
    { title: 'Fees Collection', desc: 'Process tuition invoices', icon: DollarSign, href: '/dashboard/fees', bg: 'bg-green-500/10 text-green-500' },
    { title: 'Expense Tracker', desc: 'Record bills and payouts', icon: DollarSign, href: '/dashboard/fees', bg: 'bg-rose-500/10 text-rose-500' },
    { title: 'Income Register', desc: 'Track external earnings', icon: DollarSign, href: '/dashboard/fees', bg: 'bg-cyan-500/10 text-cyan-500' },
    { title: 'Support Desk', desc: 'Handle system queries', icon: HelpCircle, href: '/dashboard/settings', bg: 'bg-slate-500/10 text-slate-500' },
    { title: 'Hostel Booking', desc: 'Manage room boarding', icon: Home, href: '/dashboard/hostels', bg: 'bg-blue-500/10 text-blue-500' },
    { title: 'Library Catalog', desc: 'Track books and inventory', icon: Archive, href: '/dashboard/settings', bg: 'bg-purple-500/10 text-purple-500' },
    { title: 'Transport Routes', desc: 'Configure school bus plans', icon: Layers, href: '/dashboard/settings', bg: 'bg-yellow-500/10 text-yellow-500' },
    { title: 'Salaries Pay', desc: 'Staff payroll runs', icon: Layers, href: '/dashboard/salaries', bg: 'bg-indigo-500/10 text-indigo-500' },
    { title: 'Gallery Showcase', desc: 'View institution records', icon: ImageIcon, href: '/dashboard/gallery', bg: 'bg-pink-500/10 text-pink-500' },
    { title: 'Notifications', desc: 'Send circulars & alerts', icon: Bell, href: '/dashboard/notifications', bg: 'bg-violet-500/10 text-violet-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 border border-indigo-400/20 rounded-full text-indigo-300 text-xs font-semibold">
              <Sparkles size={14} className="animate-pulse" />
              SaaS Institution Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome back, {user?.firstName || 'User'}!
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              You are currently logged into <span className="font-semibold text-indigo-300">{tenant?.name || 'TEST MOHSIN'}</span>. Use the central dashboard to manage administrative workflow.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 self-start md:self-auto">
            <Calendar className="text-indigo-400 size-6" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Academic Year</p>
              <p className="text-sm font-semibold text-white">{stats.activeSession || '2026-2027'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top 12 Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              href={getHref(card.href)}
              className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-4 hover:shadow-lg dark:hover:shadow-indigo-500/5 transition-all duration-200 hover:-translate-y-0.5 group flex flex-col justify-between h-28"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider line-clamp-1">{card.title}</span>
                <div className={`${card.color} p-1.5 rounded-lg group-hover:scale-105 transition-transform duration-200`}>
                  <Icon size={16} />
                </div>
              </div>
              <div className="mt-2 flex items-end justify-between">
                <span className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">{card.value}</span>
                <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform duration-200" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Sections Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: 18 Quick Links Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Quick Administration Links</h2>
                <p className="text-xs text-slate-400 mt-0.5">Quick shortcuts to access modules and directories</p>
              </div>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">18 Modules Configured</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {quickLinks.map((link, idx) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={idx}
                    href={getHref(link.href)}
                    className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-100 hover:border-slate-200 dark:border-slate-800/50 dark:hover:border-slate-700 bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-950/30 dark:hover:bg-slate-950/60 transition-all duration-150 group"
                  >
                    <div className={`${link.bg} p-2 rounded-xl group-hover:scale-105 transition-transform duration-150`}>
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-150 truncate">{link.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{link.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Analytics Chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Fee Collection Analytics</h2>
                <p className="text-xs text-slate-400 mt-0.5">Monthly summary of tuition and utility fees</p>
              </div>
              <div className="flex gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-lg">
                  Collected: ৳{stats.collectedFees.toLocaleString()}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded-lg">
                  Pending: ৳{stats.pendingFees.toLocaleString()}
                </span>
              </div>
            </div>
            <FeesChart />
          </div>
        </div>

        {/* Right Side: Setup Progress & Charts */}
        <div className="space-y-6">
          {/* Setup / Onboarding Checklist */}
          <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/20 dark:from-indigo-950/20 dark:to-purple-950/10 border border-indigo-100/50 dark:border-indigo-950/40 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <CheckSquare className="text-indigo-600 dark:text-indigo-400 size-5" />
              <h2 className="text-md font-bold text-slate-800 dark:text-white">Getting Started Checklist</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Complete these settings to fully initialize the institution configuration.
            </p>

            <div className="space-y-3.5">
              {[
                { title: 'Create Academic Session', completed: true },
                { title: 'Configure Classes & Sections', completed: true },
                { title: 'Add Subject Groups', completed: true },
                { title: 'Register Students & Admins', completed: true },
                { title: 'Setup Fee Collection Plans', completed: false }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-250/30 dark:border-slate-800/40 rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <div className={`size-5 rounded-full flex items-center justify-center border ${item.completed ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-700'}`}>
                      {item.completed && <span className="text-[10px]">✓</span>}
                    </div>
                    <span className={`text-xs font-semibold ${item.completed ? 'text-slate-450 line-through' : 'text-slate-700 dark:text-slate-300'}`}>{item.title}</span>
                  </div>
                  {!item.completed && (
                    <Link href={getHref('/dashboard/settings')} className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                      Configure
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Students Distribution Chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
            <h2 className="text-md font-bold text-slate-800 dark:text-white mb-4">Class-wise Students Overview</h2>
            <StudentsChart />
          </div>
        </div>
      </div>
    </div>
  );
}

