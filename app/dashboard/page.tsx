'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useTenantSlug } from '@/lib/hooks/use-tenant-slug';
import { FeesChart, StudentsChart } from '@/components/dashboard/charts';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  ShieldAlert,
  Award,
  Contact
} from 'lucide-react';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const tenant = useAuthStore((state) => state.tenant);
  const token = useAuthStore((state) => state.token);
  const tenantSlug = useTenantSlug();
  const router = useRouter();

  const [stats, setStats] = useState<any>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchoolProfile, setSelectedSchoolProfile] = useState('main_campus');

  const getHref = (href: string) => {
    if (user?.role === 'owner') {
      return href;
    }
    return tenantSlug ? `/${tenantSlug}${href}` : href;
  };

  useEffect(() => {
    if (user) {
      if (user.role === 'student') {
        router.push(getHref('/dashboard/student-portal'));
      } else if (user.role === 'parent') {
        router.push(getHref('/dashboard/parent-portal'));
      }
    }
  }, [user, tenantSlug]);

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
                { title: 'Take Student Attendance', desc: 'Record attendance for Class A & B', href: '/dashboard/students/attendance', icon: CheckSquare },
                { title: 'Record Exam Marks', desc: 'Publish scores for Mathematics', href: '/dashboard/exams', icon: FileText },
                { title: 'Student Directory', desc: 'View profiles of assigned classes', href: '/dashboard/students', icon: Users },
                { title: 'Class Timetable', desc: 'Review scheduled lectures', href: '/dashboard/students/attendance', icon: Calendar }
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
  
    const schoolProfiles = [
    { id: 'main_campus', name: 'ShikkhaDhara Main Campus' },
    { id: 'branch_dhaka', name: 'ShikkhaDhara Dhaka Branch' }
  ];

  const planStats = {
    studentsLimit: 500,
    studentsUsed: stats.totalStudents,
    staffLimit: 50,
    staffUsed: stats.totalStaff,
  };

  const dashboardKPIs = [
    { title: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30' },
    { title: 'Total Staff', value: stats.totalStaff, icon: Briefcase, color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30' },
    { title: 'Classes Setup', value: stats.totalClasses, icon: BookOpen, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' },
    { title: 'Student Attendance', value: stats.studentAttendance || '95%', icon: CheckCircle, color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30' },
    { title: 'Staff Attendance', value: stats.staffAttendance || '98%', icon: UserCheck, color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/30' },
    { title: 'Fee Collection', value: `৳${stats.collectedFees.toLocaleString()}`, icon: DollarSign, color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30' },
    { title: 'Due Fees', value: `৳${stats.pendingFees.toLocaleString()}`, icon: DollarSign, color: 'text-rose-600 dark:text-rose-455 bg-rose-50 dark:bg-rose-950/30' },
    { title: 'Income', value: `৳${stats.collectedFees.toLocaleString()}`, icon: DollarSign, color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/30' },
    { title: 'Expenses', value: `৳${stats.totalExpenses.toLocaleString()}`, icon: DollarSign, color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30' },
    { title: 'Profit / Loss', value: `৳${(stats.collectedFees - stats.totalExpenses).toLocaleString()}`, icon: DollarSign, color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30' },
    { title: 'Admission Enquiries', value: stats.enquiriesCount || 0, icon: Contact, color: 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/30' },
    { title: 'Leave Requests', value: stats.pendingLeaves || 0, icon: Calendar, color: 'text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-50 dark:bg-fuchsia-950/30' },
    { title: 'Support Tickets', value: stats.openTickets || 0, icon: HelpCircle, color: 'text-rose-650 dark:text-rose-455 bg-rose-50 dark:bg-rose-950/30' }
  ];

  const quickActionCards = [
    { title: 'Add Student', desc: 'Admission register', href: '/dashboard/students/admission', icon: Users, color: 'text-indigo-500 bg-indigo-500/10' },
    { title: 'Collect Fees', desc: 'Process payment records', href: '/dashboard/fees/collect', icon: DollarSign, color: 'text-green-500 bg-green-500/10' },
    { title: 'Take Attendance', desc: 'Student class check', href: '/dashboard/students/attendance', icon: CheckSquare, color: 'text-teal-500 bg-teal-500/10' },
    { title: 'Add Staff', desc: 'Create employee page', href: '/dashboard/staffs/add', icon: Briefcase, color: 'text-violet-500 bg-violet-500/10' },
    { title: 'Create Exam', desc: 'Schedule evaluation', href: '/dashboard/exams/add', icon: FileText, color: 'text-amber-500 bg-amber-500/10' },
    { title: 'Send SMS/WhatsApp', desc: 'Broadcast gateway', href: '/dashboard/communication', icon: Bell, color: 'text-rose-500 bg-rose-500/10' },
    { title: 'Issue Certificate', desc: 'Printable templates', href: '/dashboard/certificates', icon: Award, color: 'text-cyan-500 bg-cyan-500/10' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Upper banner section */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Welcome Block */}
        <div className="flex-1 relative bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white overflow-hidden shadow-xl border border-slate-800 flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 border border-indigo-400/20 rounded-full text-indigo-300 text-xs font-semibold">
              <Sparkles size={14} className="animate-pulse" />
              SaaS Institution Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-2">
              Welcome back, {user?.firstName || 'Admin'}!
            </h1>
            <p className="text-slate-355 text-sm max-w-xl font-medium">
              Logged into <span className="font-semibold text-indigo-300">{tenant?.name || 'Main Campus'}</span>. Manage operations easily.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-white/10 relative z-10">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Academic Year</p>
              <p className="text-sm font-semibold text-white">{stats.activeSession || '2026-2027'}</p>
            </div>
            <div className="h-6 w-[1px] bg-white/15" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Select School Profile</p>
              <select
                value={selectedSchoolProfile}
                onChange={(e) => setSelectedSchoolProfile(e.target.value)}
                className="bg-slate-900/60 text-xs text-indigo-300 outline-none border border-indigo-500/25 rounded-lg py-1 px-2 font-bold cursor-pointer"
              >
                {schoolProfiles.map((prof) => (
                  <option key={prof.id} value={prof.id} className="bg-slate-955 text-white">{prof.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Subscription Limit Gauge */}
        <div className="w-full lg:w-80 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Subscription Limit Allocation</h3>
            <p className="text-[11px] text-slate-450 mt-1 font-semibold">Active Plan: Professional Multi-School</p>
          </div>

          <div className="space-y-3.5 my-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>STUDENTS</span>
                <span>{planStats.studentsUsed} / {planStats.studentsLimit}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${(planStats.studentsUsed / planStats.studentsLimit) * 100}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>STAFF LIMIT</span>
                <span>{planStats.staffUsed} / {planStats.staffLimit}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-indigo-650 rounded-full" style={{ width: `${(planStats.staffUsed / planStats.staffLimit) * 100}%` }} />
              </div>
            </div>
          </div>

          <Link href={getHref('/dashboard/billing')} className="text-center w-full py-2 bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-350 border">
            View Billing & Subscription
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {dashboardKPIs.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-805 rounded-2xl p-4 flex items-center justify-between shadow-xs">
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider truncate">{card.title}</p>
                <p className="text-lg font-black text-slate-800 dark:text-white mt-1.5 tracking-tight">{card.value}</p>
              </div>
              <div className={`${card.color} p-2 rounded-xl shrink-0 ml-2`}>
                <Icon size={16} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Action shortcuts & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Actions Grid */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-850 dark:text-white text-base mb-4">Quick Executive Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {quickActionCards.map((act, idx) => {
                const Icon = act.icon;
                return (
                  <Link
                    key={idx}
                    href={getHref(act.href)}
                    className="flex items-start gap-3.5 p-3.5 rounded-2xl border border-slate-100 hover:border-slate-250 dark:border-slate-850/60 dark:hover:border-slate-800 bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-955/20 dark:hover:bg-slate-955/40 transition-all duration-150 group"
                  >
                    <div className={`${act.color} p-2.5 rounded-xl group-hover:scale-105 transition-transform duration-150`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors truncate">{act.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{act.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Fee Collections charts */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-850 dark:text-white text-base">Monthly Billing Performance</h3>
              <span className="text-[10px] font-bold bg-green-500/10 text-green-600 px-3 py-1 rounded-full uppercase">Collected: ৳{stats.collectedFees.toLocaleString()}</span>
            </div>
            <FeesChart />
          </div>
        </div>

        {/* Right Column: Pending Tasks & Help Desk */}
        <div className="space-y-6">
          
          {/* Recent Activities Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-805 dark:text-slate-202 text-sm border-b pb-2 mb-4">Recent Activities Log</h3>
            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
              {!stats.recentActivities || stats.recentActivities.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">No recent logs recorded in active session.</p>
              ) : (
                stats.recentActivities.map((log: any, idx: number) => (
                  <div key={idx} className="flex items-start justify-between bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 p-3 rounded-xl gap-2">
                    <div className="min-w-0">
                      <span className="text-[9px] font-black uppercase text-indigo-650 bg-indigo-50 dark:bg-indigo-950 dark:text-indigo-400 px-1.5 py-0.2 rounded mr-1.5">{log.action}</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">{log.entity}</span>
                      <p className="text-[10px] text-slate-600 dark:text-slate-405 font-semibold mt-1 truncate">{log.details}</p>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap shrink-0">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Help & Support Ticket Card */}
          <div className="bg-gradient-to-br from-indigo-50/55 to-violet-50/25 dark:from-indigo-950/20 dark:to-violet-950/15 border border-indigo-100/50 dark:border-indigo-950/40 rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-850 dark:text-white text-sm">Help & Support Desk</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed font-semibold">
                Require direct support? Connect with our global SaaS technical panel immediately via direct support desk.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <Link href={getHref('/dashboard/support')} className="flex items-center justify-center gap-1.5 p-2.5 bg-indigo-650 text-white rounded-xl shadow-sm hover:bg-indigo-755 transition-colors">
                <span>Support Desk</span>
              </Link>
              <a href="mailto:support@shikkhadhara.com" className="flex items-center justify-center gap-1.5 p-2.5 bg-slate-105 border hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl shadow-sm transition-colors">
                <span>Email Support</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

