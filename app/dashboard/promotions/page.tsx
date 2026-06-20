'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTenantSlug } from '@/lib/hooks/use-tenant-slug';

export default function PromotionsRedirect() {
  const router = useRouter();
  const tenantSlug = useTenantSlug();

  useEffect(() => {
    const target = tenantSlug ? `/${tenantSlug}/dashboard/students` : '/dashboard/students';
    router.replace(target);
  }, [router, tenantSlug]);

  return null;
}
