import { ReactNode } from "react";

interface GreetingSectionProps {
  name: string;
  message: string;
  extraContent?: ReactNode;
}

export function GreetingSection({ name, message, extraContent }: GreetingSectionProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-xs dark:bg-[#131926] dark:border-slate-800/80">
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-teal-500/5 blur-3xl dark:bg-teal-500/10" />
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
            Good day, {name}
          </h1>
          <p className="mt-1 text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-2xl font-normal leading-relaxed">
            {message}
          </p>
        </div>
        {extraContent}
      </div>
    </div>
  );
}
