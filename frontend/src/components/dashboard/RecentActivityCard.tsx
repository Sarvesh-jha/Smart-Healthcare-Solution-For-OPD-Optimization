import { LucideIcon } from "lucide-react";
import { Card } from "../common/Card";

interface RecentActivityCardProps {
  title: string;
  description: string;
  time: string;
  icon: LucideIcon;
  color?: string;
  bgColor?: string;
}

/**
 * Reusable Recent Activity Card component
 */
export function RecentActivityCard({ 
  title, 
  description, 
  time, 
  icon: Icon, 
  color = "text-cyan-600", 
  bgColor = "bg-cyan-50" 
}: RecentActivityCardProps) {
  return (
    <Card className="p-4 border border-slate-200/80 shadow-xs hover:shadow-sm transition-all duration-200 bg-white dark:bg-slate-800/60 dark:border-slate-700/60">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 ${bgColor} rounded-xl flex items-center justify-center shrink-0 dark:bg-slate-800 dark:border dark:border-slate-700`}>
          <Icon className={`w-5 h-5 ${color} dark:brightness-125`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-0.5">{title}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1 leading-relaxed">{description}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{time}</p>
        </div>
      </div>
    </Card>
  );
}
