'use client';

import { Award, Users, Settings, UserCheck, FileText, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useTenantSlug } from '@/lib/hooks/use-tenant-slug';

export default function CertificatesPortalPage() {
  const router = useRouter();
  const tenantSlug = useTenantSlug();
  const user = useAuthStore((state) => state.token);

  const getHref = (href: string) => {
    return tenantSlug ? `/${tenantSlug}${href}` : href;
  };

  const portalCards = [
    { title: 'Transfer Certificate', desc: 'Generate printable transfer leaving forms', href: '/dashboard/certificates/transfer', icon: Award, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30' },
    { title: 'Student ID Card', desc: 'Create vertical/horizontal badge layouts', href: '/dashboard/certificates/student-id', icon: Users, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
    { title: 'Staff ID Card', desc: 'Generate staff passport identification cards', href: '/dashboard/certificates/staff-id', icon: UserCheck, color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/30' },
    { title: 'Student Certificates', desc: 'Bonafide, Merit and Character certificate papers', href: '/dashboard/certificates/student-cert', icon: FileText, color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/30' },
    { title: 'Student Cert Settings', desc: 'Branding borders, logos, and signatures', href: '/dashboard/certificates/student-cert-settings', icon: Settings, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/30' },
    { title: 'Staff Certificates', desc: 'Experience letter NOCs and relief certificates', href: '/dashboard/certificates/staff-cert', icon: FileText, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' },
    { title: 'Staff Cert Settings', desc: 'Authorized signature definitions', href: '/dashboard/certificates/staff-cert-settings', icon: Settings, color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/30' },
    { title: 'ID Card Settings', desc: 'Orientation alignments and template colors', href: '/dashboard/certificates/id-settings', icon: Settings, color: 'text-fuchsia-600 bg-fuchsia-50 dark:bg-fuchsia-950/30' }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
          <Award className="text-indigo-650" size={28} />
          <span>Certificates Portal</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Design, customize, and batch-print institutional certificates and employee identity badges.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {portalCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <button
              key={idx}
              onClick={() => router.push(getHref(card.href))}
              className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 hover:shadow-lg transition-all duration-200 text-left group flex flex-col justify-between h-44 cursor-pointer"
            >
              <div className={`${card.color} p-2.5 rounded-xl shrink-0 w-fit group-hover:scale-105 transition-transform duration-200`}>
                <Icon size={20} />
              </div>

              <div>
                <h3 className="font-extrabold text-slate-850 dark:text-slate-200 text-sm group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                  {card.title}
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-1 leading-relaxed">
                  {card.desc}
                </p>
              </div>

              <span className="text-[9px] font-bold text-slate-400 group-hover:text-indigo-400 flex items-center gap-1 mt-2">
                <span>Configure Portal</span>
                <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform duration-200" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
