import { ReactNode } from "react";
import { Sparkles } from "lucide-react";

interface GreetingSectionProps {
  name: string;
  message: string;
  extraContent?: ReactNode;
}

export function GreetingSection({ name, message, extraContent }: GreetingSectionProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-xs dark:bg-slate-900 dark:border-slate-800">
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-teal-500/5 blur-3xl dark:bg-teal-500/10" />
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-800 text-xs font-medium mb-3 dark:bg-teal-950/50 dark:border-teal-800 dark:text-teal-300">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Patient Care Portal</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Good day, {name}
          </h1>
          <p className="mt-1 text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-2xl font-normal leading-relaxed">
            {message}
          </p>
        </div>
        {extraContent}
      </div>
    </div>
  );
}
