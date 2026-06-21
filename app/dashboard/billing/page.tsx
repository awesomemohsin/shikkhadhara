'use client';

import { useState } from 'react';
import { CreditCard, CheckCircle2, Shield, Layers, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BillingPlansPage() {
  const [activePlan, setActivePlan] = useState('professional');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const planStats = {
    studentsLimit: 500,
    studentsUsed: 342,
    staffLimit: 50,
    staffUsed: 18
  };

  const plans = [
    {
      id: 'basic',
      name: 'Basic School Plan',
      price: '৳5,000/mo',
      studentsLimit: 200,
      staffLimit: 20,
      features: ['Basic Student Registry', 'Class & Routines Timetable', 'Email Broadcast Notifications', 'Monthly fee invoices']
    },
    {
      id: 'professional',
      name: 'Professional School Plan',
      price: '৳15,000/mo',
      studentsLimit: 1000,
      staffLimit: 100,
      features: ['All basic features', 'AI Question Paper Generator', 'WhatsApp/SMS gateway integration', 'Behavior Records tracking', 'Unlimited Certificates design']
    },
    {
      id: 'enterprise',
      name: 'Enterprise Cloud System',
      price: 'Custom Price',
      studentsLimit: 'Unlimited',
      staffLimit: 'Unlimited',
      features: ['Dedicated server deployment', 'Custom mobile app branding', '24/7 Priority support hotline', 'Custom API data triggers', 'Audit logs archive backup']
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <CreditCard className="text-indigo-650" size={28} />
            <span>SaaS Billing & Limits</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Monitor system usage limitations, active subscription tiers, and school accounts allocation.</p>
        </div>
      </div>

      {/* Plan limits indicator gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex justify-between items-center text-xs font-bold text-slate-450 uppercase">
            <span>Student Registration Limits</span>
            <span>{planStats.studentsUsed} / {planStats.studentsLimit}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${(planStats.studentsUsed / planStats.studentsLimit) * 100}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 font-semibold">Uses 68% of subscription allocation limit.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex justify-between items-center text-xs font-bold text-slate-455 uppercase">
            <span>Staff / Employee Limits</span>
            <span>{planStats.staffUsed} / {planStats.staffLimit}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-indigo-650 rounded-full" style={{ width: `${(planStats.staffUsed / planStats.staffLimit) * 100}%` }} />
          </div>
          <p className="text-[10px] text-slate-450 font-semibold">Uses 36% of subscription allocation limit.</p>
        </div>
      </div>

      {/* Plan comparisons cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div
            key={p.id}
            className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6 ${
              activePlan === p.id ? 'border-2 border-indigo-500 relative' : 'border-slate-200/60 dark:border-slate-800'
            }`}
          >
            {activePlan === p.id && (
              <span className="absolute -top-3.5 left-6 text-[9px] font-bold bg-indigo-500 text-white px-3 py-1 rounded-full uppercase tracking-wider">
                CURRENT ACTIVE PLAN
              </span>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-850 dark:text-white text-base">{p.name}</h3>
                <p className="text-2xl font-black text-indigo-950 dark:text-indigo-400 mt-2">{p.price}</p>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2 text-xs font-semibold text-slate-650 dark:text-slate-350">
                <p>Capacity limits:</p>
                <div className="pl-2 space-y-1">
                  <p>• Students: {p.studentsLimit}</p>
                  <p>• Staffs: {p.staffLimit}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2">
                {p.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-550 dark:text-slate-400 font-semibold">
                    <CheckCircle2 size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {activePlan !== p.id ? (
              <Button
                onClick={() => setShowUpgradeModal(true)}
                className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl cursor-pointer"
              >
                Upgrade Subscription
              </Button>
            ) : (
              <div className="text-center py-2.5 text-slate-400 font-bold text-xs uppercase tracking-wide bg-slate-50 dark:bg-slate-800 rounded-xl">
                Active Tier
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Upgrade contact modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="font-extrabold text-slate-850 dark:text-white text-base">Contact Sales Administrator</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              Please contact the ShikkhaDhara cloud sales system panel to upgrade school profile quotas or student storage registers.
            </p>
            <div className="space-y-2 text-xs font-semibold text-slate-650">
              <p>Email: sales@shikkhadhara.com</p>
              <p>Hotline Support: +880 9612-345678</p>
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={() => setShowUpgradeModal(false)} className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
