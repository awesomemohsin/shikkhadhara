'use client';

import { Smartphone, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ActiveSessionsPage() {
  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
          <Smartphone className="text-indigo-650" size={28} />
          <span>Active Login Sessions</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Review devices currently signed into your ShikkhaDhara account.</p>
      </div>

      <div className="max-w-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm border-b pb-2 mb-3">Current Active Device</h3>

        <div className="p-4 border border-indigo-500/20 rounded-2xl bg-indigo-500/5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl">
              <Smartphone size={20} />
            </div>
            <div className="text-xs font-semibold text-slate-650 dark:text-slate-350">
              <p className="font-bold text-sm text-slate-850 dark:text-slate-200 flex items-center gap-2">
                <span>Windows PC (This Browser)</span>
                <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase">
                  CURRENT
                </span>
              </p>
              <p className="mt-1">Location: Dhaka, Bangladesh</p>
              <p className="text-slate-450 mt-0.5">IP Address: 103.145.74.218</p>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-bold">Active now</span>
        </div>

        <div className="border-t pt-4 flex justify-between">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider self-center">Need security review?</p>
          <Button className="bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 py-2 rounded-xl text-xs font-bold border">
            Logout All Other Devices
          </Button>
        </div>
      </div>
    </div>
  );
}
