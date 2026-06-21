'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useUIStore, useAuthStore } from '@/lib/store';
import { useTenantSlug } from '@/lib/hooks/use-tenant-slug';
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  BookMarked,
  Users,
  DollarSign,
  Heart,
  Award,
  Contact,
  FileText,
  ClipboardList,
  TrendingUp,
  TrendingDown,
  Briefcase,
  MessageSquare,
  BarChart3,
  Settings,
  CreditCard,
  User,
  Smartphone,
  KeyRound,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Mail,
  Truck,
  HelpCircle,
  Globe,
  Clock,
  Home
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', roles: ['owner', 'admin', 'teacher', 'student', 'parent'] },
  { label: 'Sessions', icon: Calendar, href: '/dashboard/sessions', roles: ['owner', 'admin'] },
  {
    label: 'Classes',
    icon: BookOpen,
    href: '/dashboard/classes',
    roles: ['admin'],
    subItems: [
      { label: 'Classes Setup', href: '/dashboard/classes' },
      { label: 'Add Class', href: '/dashboard/classes/add' }
    ]
  },
  { label: 'Subjects', icon: BookMarked, href: '/dashboard/classes/subjects', roles: ['admin', 'teacher'] },
  { label: 'Timetable', icon: Clock, href: '/dashboard/routines', roles: ['admin', 'teacher', 'student', 'parent'] },
  {
    label: 'Students',
    icon: Users,
    href: '/dashboard/students',
    roles: ['admin', 'teacher'],
    subItems: [
      { label: 'Student Details', href: '/dashboard/students' },
      { label: 'Promote Students', href: '/dashboard/students/promote' },
      { label: 'Student Admission', href: '/dashboard/students/admission' },
      { label: 'Student Bulk Import', href: '/dashboard/students/import' },
      { label: 'Student Attendance', href: '/dashboard/students/attendance' },
      { label: 'Student Leave', href: '/dashboard/students/leaves' }
    ]
  },
  {
    label: 'Fees',
    icon: DollarSign,
    href: '/dashboard/fees',
    roles: ['admin'],
    subItems: [
      { label: 'Collect Fees', href: '/dashboard/fees/collect' },
      { label: 'Fee Due', href: '/dashboard/fees/due' },
      { label: 'Collection History', href: '/dashboard/fees/payments' },
      { label: 'Previous Balance', href: '/dashboard/fees/balance' },
      { label: 'Fee Structure', href: '/dashboard/fees/structure' },
      { label: 'Fee Types', href: '/dashboard/fees/types' }
    ]
  },
  { label: 'Behaviour', icon: Heart, href: '/dashboard/behaviour', roles: ['admin', 'teacher'] },
  {
    label: 'Certificates',
    icon: Award,
    href: '/dashboard/certificates',
    roles: ['admin', 'teacher'],
    subItems: [
      { label: 'Transfer Certificate', href: '/dashboard/certificates/transfer' },
      { label: 'Student ID Card', href: '/dashboard/certificates/student-id' },
      { label: 'Staff ID Card', href: '/dashboard/certificates/staff-id' },
      { label: 'Student Certificates', href: '/dashboard/certificates/student-cert' },
      { label: 'Student Certificate Settings', href: '/dashboard/certificates/student-cert-settings' },
      { label: 'Staff Certificates', href: '/dashboard/certificates/staff-cert' },
      { label: 'Staff Certificate Settings', href: '/dashboard/certificates/staff-cert-settings' },
      { label: 'ID Card Settings', href: '/dashboard/certificates/id-settings' }
    ]
  },
  { label: 'Reception', icon: Contact, href: '/dashboard/reception', roles: ['admin', 'staff'] },
  { label: 'Invitation', icon: Mail, href: '/dashboard/invitation', roles: ['admin'] },
  { label: 'Question Paper', icon: FileText, href: '/dashboard/question-paper', roles: ['admin', 'teacher'] },
  { label: 'Calendar', icon: Calendar, href: '/dashboard/calendar', roles: ['owner', 'admin', 'teacher', 'student', 'parent'] },
  { label: 'Lesson Plan', icon: ClipboardList, href: '/dashboard/lesson-plan', roles: ['admin', 'teacher'] },
  {
    label: 'Exams',
    icon: BookOpen,
    href: '/dashboard/exams',
    roles: ['admin', 'teacher'],
    subItems: [
      { label: 'Exams List', href: '/dashboard/exams' },
      { label: 'Add Exam', href: '/dashboard/exams/add' },
      { label: 'Exam Results', href: '/dashboard/exams/results' }
    ]
  },
  { label: 'Income', icon: TrendingUp, href: '/dashboard/income', roles: ['admin'] },
  { label: 'Expenses', icon: TrendingDown, href: '/dashboard/expenses', roles: ['admin'] },
  {
    label: 'Staff',
    icon: Briefcase,
    href: '/dashboard/staffs',
    roles: ['admin'],
    subItems: [
      { label: 'Staff List', href: '/dashboard/staffs' },
      { label: 'Add Staff', href: '/dashboard/staffs/add' }
    ]
  },
  { label: 'Payroll', icon: DollarSign, href: '/dashboard/salaries', roles: ['admin'] },
  { label: 'Library', icon: BookOpen, href: '/dashboard/library', roles: ['admin', 'teacher', 'student'] },
  { label: 'Hostel', icon: Home, href: '/dashboard/hostels', roles: ['admin', 'teacher', 'student'] },
  { label: 'Transport', icon: Truck, href: '/dashboard/transport', roles: ['admin', 'teacher', 'student'] },
  { label: 'Communication', icon: MessageSquare, href: '/dashboard/communication', roles: ['admin'] },
  { label: 'Reports', icon: BarChart3, href: '/dashboard/reports', roles: ['admin'] },
  { label: 'Website', icon: Globe, href: '/dashboard/frontend', roles: ['owner', 'admin'] },
  { label: 'Settings', icon: Settings, href: '/dashboard/settings', roles: ['owner', 'admin'] },
  { label: 'Billing', icon: CreditCard, href: '/dashboard/billing', roles: ['owner', 'admin'] },
  { label: 'Support', icon: HelpCircle, href: '/dashboard/support', roles: ['owner', 'admin', 'teacher', 'student', 'parent', 'staff'] },
  { label: 'Profile', icon: User, href: '/dashboard/settings?tab=profile', roles: ['owner', 'admin', 'teacher', 'student', 'parent', 'staff'] },
  { label: 'Active Sessions', icon: Smartphone, href: '/dashboard/active-sessions', roles: ['owner', 'admin', 'teacher', 'student', 'parent', 'staff'] },
  { label: 'Password', icon: KeyRound, href: '/dashboard/settings?tab=security', roles: ['owner', 'admin', 'teacher', 'student', 'parent', 'staff'] }
];

export function Sidebar() {
  const tenantSlug = useTenantSlug();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
  
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const setSidebarCollapsed = useUIStore((state) => state.setSidebarCollapsed);

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    // Automatically expand menus based on route
    if (pathname.includes('/students')) setOpenMenus((prev) => ({ ...prev, Students: true }));
    if (pathname.includes('/staffs')) setOpenMenus((prev) => ({ ...prev, Staff: true }));
    if (pathname.includes('/classes')) setOpenMenus((prev) => ({ ...prev, Classes: true }));
    if (pathname.includes('/exams')) setOpenMenus((prev) => ({ ...prev, Exams: true }));
    if (pathname.includes('/fees')) setOpenMenus((prev) => ({ ...prev, Fees: true }));
    if (pathname.includes('/certificates')) setOpenMenus((prev) => ({ ...prev, Certificates: true }));
  }, [pathname]);

  const toggleMenu = (label: string) => {
    if (sidebarCollapsed) {
      setSidebarCollapsed(false);
    }
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const getHref = (href: string) => {
    if (user?.role === 'owner') {
      return href;
    }
    return tenantSlug ? `/${tenantSlug}${href}` : href;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    localStorage.removeItem('user');
    localStorage.removeItem('organization');
    logout();
    router.push(getHref('/login'));
  };

  const visibleNavItems = navItems.filter(
    (item) => !item.roles || (user?.role && item.roles.includes(user.role))
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-0 left-0 z-30 p-4">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-600 bg-white hover:bg-slate-100 p-2.5 rounded-xl border border-slate-200/60 shadow-sm cursor-pointer">
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar container */}
      <div
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:static inset-y-0 left-0 z-20 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } bg-white dark:bg-slate-900 border-r border-slate-250/60 dark:border-slate-850 text-slate-700 dark:text-slate-300 overflow-y-auto transition-all duration-300 ease-in-out flex flex-col`}
      >
        {/* School Logo Area */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100 dark:border-slate-850 h-[72px]">
          <Link href={getHref('/dashboard')} className="flex items-center gap-2 overflow-hidden">
            {!sidebarCollapsed ? (
              <span className="font-extrabold text-lg text-slate-850 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate tracking-tight uppercase">
                {process.env.NEXT_PUBLIC_APP_NAME || 'ShikkhaDhara'}
              </span>
            ) : (
              <span className="font-black text-blue-600 text-xl mx-auto tracking-widest">SD</span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;

            if (item.subItems) {
              const isOpen = !!openMenus[item.label];

              return (
                <div key={item.label} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleMenu(item.label)}
                    className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl transition-all duration-200 text-xs font-bold text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 dark:hover:bg-slate-800 dark:text-slate-350 cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon size={16} className="text-slate-400 dark:text-slate-500 shrink-0" />
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    {!sidebarCollapsed && (
                      <ChevronDown size={12} className={`transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  {isOpen && !sidebarCollapsed && (
                    <div className="pl-3.5 space-y-1 border-l border-slate-100 dark:border-slate-800 ml-5 py-1">
                      {item.subItems.map((subItem) => {
                        const resolvedHref = getHref(subItem.href);
                        const isSubActive = resolvedHref === pathname;

                        return (
                          <Link
                            key={subItem.href}
                            href={resolvedHref}
                            className={`flex items-center px-4 py-2 rounded-xl transition-all duration-200 text-[11px] font-bold ${
                              isSubActive
                                ? 'bg-blue-500/10 text-blue-650 dark:text-blue-400 border-l-2 border-blue-550 font-bold'
                                : 'text-slate-500 hover:bg-slate-100/70 hover:text-slate-900 dark:hover:bg-slate-800/80 dark:text-slate-300'
                            }`}
                          >
                            <span className="truncate">{subItem.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const resolvedHref = getHref(item.href);
            const isActive = pathname === resolvedHref || (resolvedHref !== '/dashboard' && pathname.startsWith(resolvedHref + '/'));

            return (
              <Link
                key={item.href}
                href={resolvedHref}
                title={sidebarCollapsed ? item.label : undefined}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-xs font-bold ${
                  isActive
                    ? 'bg-blue-500/10 text-blue-650 dark:text-blue-400 border-l-2 border-blue-550 font-bold shadow-[inset_1px_0_0_rgba(59,130,246,0.05)]'
                    : 'text-slate-500 hover:bg-slate-100/70 hover:text-slate-900 dark:hover:bg-slate-800/80 dark:text-slate-300'
                }`}
              >
                <Icon size={16} className={`${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'} shrink-0`} />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer info & collapse toggle */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col gap-2">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-3 mb-2 px-2.5">
              <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xs uppercase shadow-md shadow-blue-500/10">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
          )}

          {/* Toggle sidebar button (desktop only) */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex items-center justify-center p-2.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer w-full text-xs font-bold"
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <div className="flex items-center gap-2"><ChevronLeft size={16} /><span>Collapse Menu</span></div>}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 text-slate-400 hover:text-rose-600 p-2.5 rounded-xl hover:bg-rose-500/10 transition-all font-bold text-xs cursor-pointer w-full"
          >
            <LogOut size={16} />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/45 backdrop-blur-xs z-10"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
