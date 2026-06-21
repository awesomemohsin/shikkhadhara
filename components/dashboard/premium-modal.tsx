'use client';

import React from 'react';
import { X, LucideIcon } from 'lucide-react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'max-w-md' | 'max-w-lg' | 'max-w-xl' | 'max-w-2xl' | 'max-w-3xl' | 'max-w-4xl';
  icon?: LucideIcon;
}

export function PremiumModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'max-w-2xl',
  icon: Icon,
}: PremiumModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`w-full ${size} bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col`}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-850 shrink-0">
            <h3 className="text-base sm:text-lg font-bold text-slate-850 dark:text-white flex items-center gap-2">
              {Icon && <Icon size={18} className="text-indigo-650 shrink-0" />}
              <span>{title}</span>
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-slate-650 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
