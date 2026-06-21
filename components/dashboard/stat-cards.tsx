'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface StatCardItem {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string; // e.g. 'text-indigo-650 bg-indigo-50 dark:bg-indigo-950/30'
  description?: string;
}

interface StatCardsProps {
  cards: StatCardItem[];
  gridCols?: string; // e.g. 'grid-cols-2 md:grid-cols-4'
}

export function StatCards({ cards, gridCols = 'grid-cols-2 lg:grid-cols-4' }: StatCardsProps) {
  return (
    <div className={`grid gap-4 ${gridCols} mb-6`}>
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-805 rounded-2xl p-4 flex items-center justify-between shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="min-w-0 space-y-1">
              <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider truncate">
                {card.title}
              </p>
              <p className="text-lg sm:text-xl font-black text-slate-800 dark:text-white tracking-tight">
                {card.value}
              </p>
              {card.description && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate font-semibold">
                  {card.description}
                </p>
              )}
            </div>
            <div className={`${card.color} p-2.5 rounded-xl shrink-0 ml-2`}>
              <Icon size={18} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
