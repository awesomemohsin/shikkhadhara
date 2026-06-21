'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTenantSlug } from '@/lib/hooks/use-tenant-slug';

export default function AttendanceRedirect() {
  const router = useRouter();
  const tenantSlug = useTenantSlug();

  useEffect(() => {
    const target = tenantSlug ? `/${tenantSlug}/dashboard/students/attendance` : '/dashboard/students/attendance';
    router.replace(target);
  }, [router, tenantSlug]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] text-slate-400 font-semibold text-sm">
      Redirecting to Student Attendance...
    </div>
  );
}
