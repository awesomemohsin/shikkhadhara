'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useTenantSlug } from '@/lib/hooks/use-tenant-slug';

export default function ProfilePageRedirect() {
  const router = useRouter();
  const tenantSlug = useTenantSlug();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const getHref = (href: string) => {
      if (user?.role === 'owner') return href;
      return tenantSlug ? `/${tenantSlug}${href}` : href;
    };
    router.replace(getHref('/dashboard/settings?tab=profile'));
  }, [router, tenantSlug, user]);

  return (
    <div className="py-12 text-center text-slate-400">
      Redirecting to profile settings...
    </div>
  );
}
