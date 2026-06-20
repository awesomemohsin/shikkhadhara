'use client';

import { ReactNode, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { TopNavbar } from '@/components/dashboard/top-navbar';
import { useAuthStore } from '@/lib/store';
import { useTenantSlug } from '@/lib/hooks/use-tenant-slug';
import { usePathname, useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const tenantSlug = useTenantSlug();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (user?.role === 'owner' && tenantSlug) {
      // Strip the subdomain prefix for owner roles
      const cleanPath = pathname.replace(new RegExp(`^\\/${tenantSlug}`), '') || '/dashboard';
      router.push(cleanPath);
    }
  }, [user, tenantSlug, pathname, router]);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />
        <main className="flex-1 overflow-auto">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
