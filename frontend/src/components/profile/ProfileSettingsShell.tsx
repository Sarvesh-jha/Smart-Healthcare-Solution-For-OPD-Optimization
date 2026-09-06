import { useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card } from "../common/Card";
import { cn } from "../common/utils";

export interface ProfileSettingsSection {
  id: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  content: ReactNode;
}

interface ProfileSettingsShellProps {
  title?: string;
  description?: string;
  sections: ProfileSettingsSection[];
  defaultSectionId?: string;
}

export function ProfileSettingsShell({
  title,
  description,
  sections,
  defaultSectionId,
}: ProfileSettingsShellProps) {
  const initialSection = sections.find((section) => section.id === defaultSectionId)?.id ?? sections[0]?.id ?? "";
  const [activeSectionId, setActiveSectionId] = useState(initialSection);
  const activeSection = sections.find((section) => section.id === activeSectionId) ?? sections[0];

  if (!activeSection) {
    return null;
  }

  return (
    <div className="space-y-6">
      {title ? (
        <div className="border-b border-slate-200/80 pb-4 dark:border-slate-800">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">{title}</h1>
          {description ? (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
          ) : null}
        </div>
      ) : null}

      {/* Clean Tab Navigation Bar */}
      <Card className="rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-xs dark:border-slate-800 dark:bg-slate-950">
        <nav className="flex items-center gap-1.5 overflow-x-auto">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = section.id === activeSection.id;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSectionId(section.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all whitespace-nowrap",
                  isActive
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100",
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-slate-500 dark:text-slate-400")} />
                <span>{section.label}</span>
              </button>
            );
          })}
        </nav>
      </Card>

      <div className="min-w-0">
        {activeSection.content}
      </div>
    </div>
  );
}
