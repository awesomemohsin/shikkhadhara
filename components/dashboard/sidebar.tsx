'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useUIStore, useAuthStore } from '@/lib/store';
import { useTenantSlug } from '@/lib/hooks/use-tenant-slug';
import {
  BarChart3,
  Users,
  BookOpen,
  Calendar,
  DollarSign,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Layers,
  Archive,
  Home,
  Image as ImageIcon,
  FileText,
  Briefcase
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: BarChart3, href: '/dashboard', roles: ['owner', 'admin', 'teacher', 'student', 'parent'] },
  { label: 'Tenant Manager', icon: Layers, href: '/dashboard/tenants', roles: ['owner'] },
  { label: 'Student Portal', icon: Users, href: '/dashboard/student-portal', roles: ['student'] },
  { label: 'Parent Portal', icon: Users, href: '/dashboard/parent-portal', roles: ['parent'] },
  { label: 'Classes & Subjects', icon: BookOpen, href: '/dashboard/classes', roles: ['admin'] },
  { label: 'Students', icon: Users, href: '/dashboard/students', roles: ['admin', 'teacher'] },
  { label: 'Staffs', icon: Briefcase, href: '/dashboard/staffs', roles: ['admin'] },
  { label: 'Attendance', icon: Calendar, href: '/dashboard/attendance', roles: ['admin', 'teacher'] },
  { label: 'Class Routine', icon: Calendar, href: '/dashboard/routines', roles: ['admin', 'teacher', 'student', 'parent'] },
  { label: 'Exams', icon: BookOpen, href: '/dashboard/exams', roles: ['admin', 'teacher'] },
  { label: 'Leaves Management', icon: FileText, href: '/dashboard/leaves', roles: ['admin', 'teacher', 'staff'] },
  { label: 'Fees', icon: DollarSign, href: '/dashboard/fees', roles: ['admin'] },
  { label: 'Salaries', icon: Layers, href: '/dashboard/salaries', roles: ['admin'] },
  { label: 'Inventory', icon: Archive, href: '/dashboard/inventory', roles: ['admin', 'teacher'] },
  { label: 'Hostels', icon: Home, href: '/dashboard/hostels', roles: ['admin', 'teacher'] },
  { label: 'Gallery', icon: ImageIcon, href: '/dashboard/gallery', roles: ['owner', 'admin', 'teacher'] },
  { label: 'Notifications', icon: Bell, href: '/dashboard/notifications', roles: ['owner', 'admin', 'teacher'] },
  { label: 'Audit Logs', icon: FileText, href: '/dashboard/logs', roles: ['owner', 'admin'] },
  { label: 'Settings', icon: Settings, href: '/dashboard/settings', roles: ['owner', 'admin'] },
];

export function Sidebar() {
  const tenantSlug = useTenantSlug();
  const pathname = usePathname();
  const router = useRouter();
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

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
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-300">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:static inset-y-0 left-0 z-20 w-64 bg-slate-950 border-r border-slate-900 text-slate-300 overflow-y-auto transition-transform duration-300 ease-in-out md:transition-none flex flex-col`}
      >
        <div className="flex items-center justify-between px-6 py-6 border-b border-slate-900">
          <Link href={getHref('/dashboard')} className="flex items-center">
            <Image
              src="/logo.png"
              alt={process.env.NEXT_PUBLIC_APP_NAME || 'ShikkhaDhara'}
              width={140}
              height={36}
              priority
              className="h-9 w-auto object-contain brightness-110"
            />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 px-4 py-6">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const resolvedHref = getHref(item.href);
            const isActive =
              pathname === resolvedHref || pathname.startsWith(resolvedHref + '/');

            return (
              <Link
                key={item.href}
                href={resolvedHref}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500 font-semibold shadow-[inset_1px_0_0_rgba(99,102,241,0.05)]'
                    : 'text-slate-400 hover:bg-slate-900/60 hover:text-white'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-indigo-400' : 'text-slate-500'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-900 bg-slate-900/20 backdrop-blur-sm">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20 text-xs uppercase">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] text-slate-500 truncate capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 text-slate-400 hover:text-rose-400 w-full px-3 py-2.5 rounded-xl hover:bg-rose-500/10 transition-all duration-200 font-medium text-sm"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
