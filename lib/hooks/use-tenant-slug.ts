'use client';

import { usePathname } from 'next/navigation';

/**
 * Custom hook to extract the tenantSlug from the URL path.
 * E.g., for /schoolA/dashboard/attendance, it extracts 'schoolA'.
 */
export function useTenantSlug(): string {
  const pathname = usePathname() || '';
  const segments = pathname.split('/').filter(Boolean);
  
  if (segments.length > 0) {
    const firstSegment = segments[0];
    const ignoredSegments = ['dashboard', 'login', 'register', 'api', '_next', 'public'];
    
    if (!ignoredSegments.includes(firstSegment) && !firstSegment.includes('.')) {
      return firstSegment;
    }
  }
  
  return '';
}
