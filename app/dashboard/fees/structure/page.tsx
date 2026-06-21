'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { DollarSign, ArrowLeft, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FeeStructurePage() {
  const token = useAuthStore((state) => state.token);
  const router = useRouter();

  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchSections();
    }
  }, [token]);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sections', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSections(data.sections || []);
      }
    } catch (error) {
      console.error('Failed to fetch sections:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group sections by Class Name
  const classMap: { [key: string]: any } = {};
  sections.forEach((sec: any) => {
    const className = sec.class;
    if (!classMap[className]) {
      classMap[className] = {
        name: className,
        monthlyFee: sec.monthlyFee || 0,
        sections: [],
      };
    }
    classMap[className].sections.push(sec.name);
  });

  const classStructures = Object.values(classMap).sort((a: any, b: any) => {
    const numA = parseInt(a.name.replace(/\D/g, ''), 10);
    const numB = parseInt(b.name.replace(/\D/g, ''), 10);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <DollarSign className="text-indigo-600" size={28} />
            <span>Fee Structures List</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Review monthly tuition rates configured per Class level</p>
        </div>

        <div>
          <Button
            onClick={() => router.push('/dashboard/fees/configs')}
            className="bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-355 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border"
          >
            <Layers size={14} />
            <span>Manage Billing Configs</span>
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-slate-450 font-medium">Loading structures registry...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-850">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Class Name</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Configured Sections</th>
                  <th className="px-6 py-4 text-right font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Monthly Tuition Fee</th>
                  <th className="px-6 py-4 text-right font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Yearly Cumulative Est.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {classStructures.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">No tuition classes or section fee structures configured yet. Please configure them in Classes Setup.</td>
                  </tr>
                ) : (
                  classStructures.map((clsStructure: any, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-all duration-150">
                      <td className="px-6 py-4 font-bold text-slate-850 dark:text-slate-200">
                        Class {clsStructure.name}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-350">
                        <div className="flex flex-wrap gap-1">
                          {clsStructure.sections.map((sec: string, sIdx: number) => (
                            <span key={sIdx} className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg">
                              Section {sec}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-indigo-650 dark:text-indigo-400 font-extrabold text-sm">
                        ৳{clsStructure.monthlyFee.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-805 dark:text-slate-200 font-bold">
                        ৳{(clsStructure.monthlyFee * 12).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
