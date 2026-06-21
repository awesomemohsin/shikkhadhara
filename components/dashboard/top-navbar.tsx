'use client';

import { useState, useEffect } from 'react';
import { useAuthStore, useUIStore } from '@/lib/store';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Bell, Settings, User, LogOut, Grid, X, ChevronRight, Menu, ChevronDown } from 'lucide-react';
import { useTenantSlug } from '@/lib/hooks/use-tenant-slug';

export function TopNavbar() {
  const user = useAuthStore((state) => state.user);
  const tenant = useAuthStore((state) => state.tenant);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const tenantSlug = useTenantSlug();

  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);

  const pathname = usePathname();

  // Keyboard shortcut for Search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getHref = (href: string) => {
    if (user?.role === 'owner') return href;
    return tenantSlug ? `/${tenantSlug}${href}` : href;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('organization');
    logout();
    router.push(getHref('/login'));
  };

  const navigateTo = (path: string) => {
    setIsNavigating(true);
    router.push(getHref(path));
    setShowSearchModal(false);
    setShowMegaMenu(false);
    setTimeout(() => setIsNavigating(false), 800);
  };

  // Generate breadcrumbs dynamically based on path segments
  const generateBreadcrumbs = () => {
    // Strip tenant prefix from path segments
    let cleanPath = pathname;
    if (tenantSlug) {
      cleanPath = pathname.replace(new RegExp(`^\\/${tenantSlug}`), '');
    }
    const segments = cleanPath.split('/').filter(Boolean);
    return segments.map((seg, idx) => {
      const href = '/' + segments.slice(0, idx + 1).join('/');
      const label = seg
        .replace(/-/g, ' ')
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      return { label, href };
    });
  };

  const breadcrumbs = generateBreadcrumbs();

  const allSearchablePages = [
    { title: 'Dashboard', desc: 'Main control workspace', path: '/dashboard' },
    { title: 'Sessions Setup', desc: 'Academic calendar years', path: '/dashboard/sessions' },
    { title: 'Classes Setup', desc: 'Grade and tuition fees', path: '/dashboard/classes' },
    { title: 'Subjects Directory', desc: 'Course catalogs', path: '/dashboard/classes/subjects' },
    { title: 'Student List', desc: 'Directory rosters', path: '/dashboard/students' },
    { title: 'Fee Register', desc: 'Billing payment collect', path: '/dashboard/fees' },
    { title: 'Collect Fees', desc: 'Process payment records', path: '/dashboard/fees/collect' },
    { title: 'Behaviour Records', desc: 'Conduct rating metrics', path: '/dashboard/behaviour' },
    { title: 'Certificates Generator', desc: 'Issue TC and ID badges', path: '/dashboard/certificates' },
    { title: 'Reception Desk', desc: 'Visitor records and call logs', path: '/dashboard/reception' },
    { title: 'Question Paper AI', desc: 'Exam questions bank builder', path: '/dashboard/question-paper' },
    { title: 'Annual Calendar', desc: 'Academic holidays list', path: '/dashboard/calendar' },
    { title: 'Lesson Syllabus Plan', desc: 'Topic status track', path: '/dashboard/lesson-plan' },
    { title: 'Exams Roster', desc: 'Grade listings and exam schedules', path: '/dashboard/exams' },
    { title: 'Income ledger', desc: 'Record school cash logs', path: '/dashboard/income' },
    { title: 'Expenses book', desc: 'Add payment vouchers', path: '/dashboard/expenses' },
    { title: 'Staff Roster', desc: 'Employee pay records', path: '/dashboard/staffs' },
    { title: 'Communication Gateway', desc: 'SMS logs and dispatch templates', path: '/dashboard/communication' },
    { title: 'Reports Hub', desc: 'Download XLS audit sheets', path: '/dashboard/reports' },
    { title: 'SaaS Billing Plans', desc: 'Capacity limits billing info', path: '/dashboard/billing' },
    { title: 'My Profile', desc: 'Update details', path: '/dashboard/profile' },
    { title: 'Change Password', desc: 'Modify credentials', path: '/dashboard/change-password' }
  ];

  const filteredSearchResults = allSearchablePages.filter((page) =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Top navigation loading indicator */}
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 h-[3px] bg-blue-600 z-50 animate-pulse transition-all duration-300" />
      )}

      <header className="sticky top-0 z-10 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200/50 dark:border-slate-850/80 transition-all duration-300 shadow-xs">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 h-[72px]">
          
          {/* Hamburger (Mobile) & Dynamic Breadcrumbs */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              <Menu size={18} />
            </button>

            {/* Breadcrumbs (Desktop only or responsive truncation) */}
            <div className="hidden sm:flex items-center space-x-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider min-w-0">
              <span className="hover:text-slate-600 cursor-pointer" onClick={() => navigateTo('/dashboard')}>Home</span>
              {breadcrumbs.map((crumb, idx) => (
                <div key={idx} className="flex items-center space-x-1 min-w-0">
                  <ChevronRight size={12} className="text-slate-300 shrink-0" />
                  <span
                    className={`truncate ${
                      idx === breadcrumbs.length - 1
                        ? 'text-slate-700 dark:text-slate-200 font-extrabold'
                        : 'hover:text-slate-600 cursor-pointer'
                    }`}
                    onClick={() => idx < breadcrumbs.length - 1 && navigateTo(crumb.href)}
                  >
                    {crumb.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Global search trigger bar */}
          <div className="flex items-center mx-4">
            <button
              onClick={() => setShowSearchModal(true)}
              className="flex items-center justify-between bg-slate-100/60 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 rounded-xl px-4 py-2 w-48 sm:w-60 border border-slate-200/30 dark:border-slate-800/30 transition-all duration-200 text-left cursor-pointer group"
            >
              <div className="flex items-center">
                <Search size={14} className="text-slate-450 mr-2 group-hover:text-blue-500" />
                <span className="text-[11px] text-slate-400 font-bold select-none uppercase">Search...</span>
              </div>
              <span className="hidden sm:inline-block text-[9px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-550 font-bold">
                ⌘K
              </span>
            </button>
          </div>

          {/* Quick links, mega menu & profile */}
          <div className="flex items-center space-x-2 ml-4 shrink-0">
            
            {/* Mega menu popover */}
            <div className="relative">
              <button
                onClick={() => setShowMegaMenu(!showMegaMenu)}
                className="flex items-center space-x-1.5 p-2 bg-slate-100/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200/20 dark:border-slate-800/20 text-slate-650 dark:text-slate-350 hover:text-blue-600 rounded-xl transition-all duration-200 cursor-pointer font-bold text-xs"
              >
                <Grid size={14} />
                <span className="hidden sm:inline">Actions</span>
                <ChevronDown size={11} className={`transition-transform duration-200 ${showMegaMenu ? 'rotate-180' : ''}`} />
              </button>

              {showMegaMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMegaMenu(false)} />
                  <div className="absolute right-0 mt-3 w-[450px] max-w-[90vw] backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider mb-3 pb-1 border-b">ERP Quick Panel</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-bold text-xs text-blue-605 mb-2">Academics</h4>
                        <div className="space-y-1.5 text-xs font-semibold">
                          <button onClick={() => navigateTo('/dashboard/classes')} className="block text-slate-600 dark:text-slate-300 hover:text-blue-500 w-full text-left">Classes Setup</button>
                          <button onClick={() => navigateTo('/dashboard/classes/subjects')} className="block text-slate-600 dark:text-slate-300 hover:text-blue-500 w-full text-left">Subjects Directory</button>
                          <button onClick={() => navigateTo('/dashboard/routines')} className="block text-slate-600 dark:text-slate-300 hover:text-blue-500 w-full text-left">Timetable Period</button>
                          <button onClick={() => navigateTo('/dashboard/exams')} className="block text-slate-600 dark:text-slate-300 hover:text-blue-500 w-full text-left">Exams List</button>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-blue-605 mb-2">Finance & HR</h4>
                        <div className="space-y-1.5 text-xs font-semibold">
                          <button onClick={() => navigateTo('/dashboard/fees/collect')} className="block text-slate-600 dark:text-slate-300 hover:text-blue-500 w-full text-left">Collect Fees</button>
                          <button onClick={() => navigateTo('/dashboard/income')} className="block text-slate-600 dark:text-slate-300 hover:text-blue-500 w-full text-left">Add Income</button>
                          <button onClick={() => navigateTo('/dashboard/expenses')} className="block text-slate-600 dark:text-slate-300 hover:text-blue-500 w-full text-left">Add Expense</button>
                          <button onClick={() => navigateTo('/dashboard/salaries')} className="block text-slate-600 dark:text-slate-300 hover:text-blue-500 w-full text-left">Staff Payroll</button>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-blue-605 mb-2">Students</h4>
                        <div className="space-y-1.5 text-xs font-semibold">
                          <button onClick={() => navigateTo('/dashboard/students/admission')} className="block text-slate-600 dark:text-slate-300 hover:text-blue-500 w-full text-left">Admission Form</button>
                          <button onClick={() => navigateTo('/dashboard/students/import')} className="block text-slate-600 dark:text-slate-300 hover:text-blue-500 w-full text-left">Bulk Import</button>
                          <button onClick={() => navigateTo('/dashboard/students/attendance')} className="block text-slate-600 dark:text-slate-300 hover:text-blue-500 w-full text-left">Attendance Sheet</button>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-blue-605 mb-2">System Configs</h4>
                        <div className="space-y-1.5 text-xs font-semibold">
                          <button onClick={() => navigateTo('/dashboard/sessions')} className="block text-slate-600 dark:text-slate-300 hover:text-blue-500 w-full text-left">Academic Sessions</button>
                          <button onClick={() => navigateTo('/dashboard/settings')} className="block text-slate-600 dark:text-slate-300 hover:text-blue-500 w-full text-left">School Configs</button>
                          <button onClick={() => navigateTo('/dashboard/billing')} className="block text-slate-600 dark:text-slate-300 hover:text-blue-500 w-full text-left">Subscription & Limits</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Notifications info */}
            <button
              onClick={() => navigateTo('/dashboard/notifications')}
              className="p-2.5 text-slate-450 hover:text-blue-600 hover:bg-slate-100/80 dark:hover:bg-slate-800 rounded-xl transition-all duration-200 cursor-pointer border border-transparent hover:border-slate-200/20"
            >
              <Bell size={15} />
            </button>

            {/* System config shortcuts */}
            <button
              onClick={() => navigateTo('/dashboard/settings')}
              className="p-2.5 text-slate-450 hover:text-blue-600 hover:bg-slate-100/80 dark:hover:bg-slate-800 rounded-xl transition-all duration-200 cursor-pointer border border-transparent hover:border-slate-200/20"
            >
              <Settings size={15} />
            </button>

            <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800 mx-1" />

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2.5 p-1 rounded-xl hover:bg-slate-100/60 dark:hover:bg-slate-850 transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-black shadow-md uppercase">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </div>
                <span className="text-xs font-extrabold text-slate-700 dark:text-slate-350 hidden sm:inline">
                  {user?.firstName}
                </span>
              </button>

              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                  <div className="absolute right-0 mt-3 w-56 backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-extrabold text-slate-850 dark:text-slate-200 truncate">{user?.firstName} {user?.lastName}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate font-semibold mt-0.5">{user?.email}</p>
                      <span className="inline-flex mt-2 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30 capitalize">
                        {user?.role.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="py-1">
                      <button onClick={() => navigateTo('/dashboard/profile')} className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs text-slate-650 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150 font-bold text-left">
                        <User size={14} className="text-slate-450" />
                        <span>My Profile</span>
                      </button>
                      <button onClick={() => navigateTo('/dashboard/settings')} className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs text-slate-650 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150 font-bold text-left">
                        <Settings size={14} className="text-slate-450" />
                        <span>Settings</span>
                      </button>
                    </div>
                    <div className="border-t border-slate-100 dark:border-slate-800 py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors duration-150 font-bold text-left"
                      >
                        <LogOut size={14} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Global Command Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 backdrop-blur-sm bg-black/40">
          <div className="fixed inset-0" onClick={() => setShowSearchModal(false)} />
          
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[60vh]">
            <div className="flex items-center px-4 py-3 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-955/20">
              <Search size={18} className="text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Type directory path to navigate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 font-medium py-1"
                autoFocus
              />
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-1 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {filteredSearchResults.length === 0 ? (
                <div className="p-8 text-center text-xs font-semibold text-slate-400">
                  No matching directory links found.
                </div>
              ) : (
                filteredSearchResults.map((result) => (
                  <button
                    key={result.path}
                    onClick={() => navigateTo(result.path)}
                    className="w-full flex items-center justify-between p-3 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:bg-blue-500/10 rounded-2xl transition-colors duration-150 text-left group"
                  >
                    <div>
                      <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-blue-600">{result.title}</p>
                      <p className="text-[10px] text-slate-400 group-hover:text-blue-500 font-semibold mt-0.5">{result.desc}</p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-500 border px-2 py-0.5 rounded-lg capitalize">
                      Go
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
