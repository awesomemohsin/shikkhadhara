'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { useTenantSlug } from '@/lib/hooks/use-tenant-slug';
import { useAuthStore } from '@/lib/store';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  const tenantSlug = useTenantSlug();
  const user = useAuthStore((state) => state.user);

  const getHref = (href: string) => {
    if (user?.role === 'owner') {
      return href;
    }
    return tenantSlug ? `/${tenantSlug}${href}` : href;
  };

  return (
    <div className="flex flex-col gap-3 pb-5 border-b border-slate-100 dark:border-slate-850/80 mb-6">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-1 text-slate-400 dark:text-slate-500 text-[10px] font-bold tracking-wider uppercase">
          <Link href={getHref('/dashboard')} className="hover:text-indigo-600 transition-colors flex items-center">
            <Home size={11} className="mr-1" />
            <span>Dashboard</span>
          </Link>
          {breadcrumbs.map((item, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight size={10} className="shrink-0 text-slate-350" />
              {item.href ? (
                <Link href={getHref(item.href)} className="hover:text-indigo-600 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-600 dark:text-slate-300 font-semibold">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Main Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
