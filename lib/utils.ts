import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatClassName(className?: string): string {
  if (!className) return "";
  const trimmed = className.trim();
  if (/^class\b/i.test(trimmed)) {
    // Capitalize "Class" for consistent casing
    return trimmed.replace(/^class\b/i, "Class");
  }
  return `Class ${trimmed}`;
}

export function stripClassPrefix(className?: string): string {
  if (!className) return "";
  const trimmed = className.trim();
  return trimmed.replace(/^class\b\s*/i, "");
}

