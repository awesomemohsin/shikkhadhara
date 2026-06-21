'use client';

import React from 'react';
import { Search, Filter, Printer, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilterOption {
  label: string;
  value: string;
}

interface PremiumTableProps {
  headers: string[];
  children: React.ReactNode;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  filterValue?: string;
  onFilterChange?: (val: string) => void;
  filterOptions?: FilterOption[];
  filterPlaceholder?: string;
  onPrint?: () => void;
  onExport?: () => void;
  totalRecords?: number;
  currentPage?: number;
  totalPages?: number;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  stickyHeader?: boolean;
}

export function PremiumTable({
  headers,
  children,
  searchPlaceholder = 'Search records...',
  searchValue,
  onSearchChange,
  filterValue,
  onFilterChange,
  filterOptions,
  filterPlaceholder = 'Filter by...',
  onPrint,
  onExport,
  totalRecords,
  currentPage = 1,
  totalPages = 1,
  onPrevPage,
  onNextPage,
  stickyHeader = true,
}: PremiumTableProps) {
  const showControls = onSearchChange || filterOptions || onPrint || onExport;

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      {showControls && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-805 p-4 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between print:hidden">
          <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
            {onSearchChange && (
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-3 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-semibold"
                />
              </div>
            )}

            {filterOptions && onFilterChange && (
              <div className="flex items-center gap-2 shrink-0">
                <Filter className="text-slate-400" size={14} />
                <select
                  value={filterValue}
                  onChange={(e) => onFilterChange(e.target.value)}
                  className="px-3 py-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-955 text-slate-850 dark:text-slate-205 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-semibold"
                >
                  <option value="">{filterPlaceholder}</option>
                  {filterOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            {onPrint && (
              <Button
                type="button"
                onClick={onPrint}
                variant="outline"
                className="flex items-center space-x-1.5 text-slate-700 bg-white border border-slate-200/60 hover:bg-slate-50 font-bold text-[11px] h-8 px-3 rounded-xl"
              >
                <Printer size={13} />
                <span>Print</span>
              </Button>
            )}
            {onExport && (
              <Button
                type="button"
                onClick={onExport}
                variant="outline"
                className="flex items-center space-x-1.5 text-slate-700 bg-white border border-slate-200/60 hover:bg-slate-50 font-bold text-[11px] h-8 px-3 rounded-xl"
              >
                <Download size={13} />
                <span>Export</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-805 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className={`${stickyHeader ? 'sticky top-0 z-10' : ''} bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-850`}>
              <tr>
                {headers.map((h, i) => (
                  <th
                    key={i}
                    className="px-6 py-3.5 text-left text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {children}
            </tbody>
          </table>
        </div>

        {/* Footer & Pagination */}
        {totalRecords !== undefined && totalRecords > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-900/30 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 print:hidden">
            <div>
              Showing <span className="font-extrabold text-slate-700 dark:text-slate-200">{totalRecords}</span> entries
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <Button
                  onClick={onPrevPage}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="p-1 h-7 w-7 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-650 disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                </Button>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-305">
                  {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={onNextPage}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  className="p-1 h-7 w-7 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-650 disabled:opacity-40"
                >
                  <ChevronRight size={14} />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
