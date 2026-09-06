import { LucideIcon } from "lucide-react";
import { Card } from "../common/Card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  bgColor?: string;
  trend?: string;
  unit?: string;
}

/**
 * Reusable StatCard component for dashboard statistics
 */
export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  iconColor,
  bgColor,
  trend,
  unit
}: StatCardProps) {
  const isPositiveTrend = trend && (trend.includes("+") || trend.includes("up") || trend.includes("from"));

  return (
    <Card className="p-5 bg-white border border-slate-200/80 rounded-xl shadow-xs transition-all hover:border-slate-300 dark:bg-slate-950 dark:border-slate-800">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500 tracking-wide dark:text-slate-400">{title}</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">{value}</span>
            {unit && <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{unit}</span>}
          </div>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 border border-slate-200/60 text-slate-600 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300">
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>

      {trend && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium border ${
            isPositiveTrend
              ? "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-slate-100 text-slate-700 border-slate-200/60 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
          }`}>
            {trend}
          </span>
        </div>
      )}
    </Card>
  );
}
