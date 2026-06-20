import {
  Users,
  UserCheck,
  Briefcase,
  DollarSign,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'emerald' | 'red';
  trend?: { value: number; isPositive: boolean };
}

const iconMap: { [key: string]: any } = {
  users: Users,
  'user-check': UserCheck,
  briefcase: Briefcase,
  'dollar-sign': DollarSign,
  'check-circle': CheckCircle,
  'trending-up': TrendingUp,
};

const colorMap: { [key: string]: { icon: string; bg: string } } = {
  blue: {
    icon: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-100/50 dark:border-indigo-900/30',
    bg: 'from-indigo-500/5 to-transparent'
  },
  green: {
    icon: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-100/50 dark:border-emerald-900/30',
    bg: 'from-emerald-500/5 to-transparent'
  },
  purple: {
    icon: 'text-violet-600 dark:text-violet-400 bg-violet-50/80 dark:bg-violet-950/30 border border-violet-100/50 dark:border-violet-900/30',
    bg: 'from-violet-500/5 to-transparent'
  },
  orange: {
    icon: 'text-amber-600 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-100/50 dark:border-amber-900/30',
    bg: 'from-amber-500/5 to-transparent'
  },
  emerald: {
    icon: 'text-teal-600 dark:text-teal-400 bg-teal-50/80 dark:bg-teal-950/30 border border-teal-100/50 dark:border-teal-900/30',
    bg: 'from-teal-500/5 to-transparent'
  },
  red: {
    icon: 'text-rose-600 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-950/30 border border-rose-100/50 dark:border-rose-900/30',
    bg: 'from-rose-500/5 to-transparent'
  },
};

export function DashboardCard({
  title,
  value,
  icon,
  color = 'blue',
  trend,
}: DashboardCardProps) {
  const Icon = iconMap[icon] || Users;
  const colorStyle = colorMap[color] || colorMap.blue;

  return (
    <div className={`relative bg-gradient-to-br ${colorStyle.bg} bg-card rounded-2xl border border-border/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] overflow-hidden group`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/10 to-transparent pointer-events-none rounded-bl-full" />
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[10px] sm:text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{value}</p>
          {trend && (
            <p className={`text-xs font-medium flex items-center gap-1 ${trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              <span className="text-[10px]">{trend.isPositive ? '▲' : '▼'}</span>
              <span>{trend.value}% vs last month</span>
            </p>
          )}
        </div>
        <div className={`${colorStyle.icon} p-3 rounded-xl transition-all duration-300 group-hover:scale-110 shadow-sm`}>
          <Icon className="size-6 sm:size-7" />
        </div>
      </div>
    </div>
  );
}
