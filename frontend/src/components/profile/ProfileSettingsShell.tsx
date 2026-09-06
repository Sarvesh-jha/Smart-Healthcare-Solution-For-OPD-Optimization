import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router";
import type { LucideIcon } from "lucide-react";
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

/**
 * Modern Two-Column Settings Architecture
 * Left Column: Vertical secondary navigation list (w-64 shrink-0)
 * Right Column: Dedicated settings card for the active section (flex-1 max-w-3xl)
 */
export function ProfileSettingsShell({
  title,
  description,
  sections,
  defaultSectionId,
}: ProfileSettingsShellProps) {
  const location = useLocation();
  const hashId = location.hash.replace("#", "");
  const matchedHashSection = sections.find((s) => s.id === hashId)?.id;
  const initialSection = matchedHashSection || (sections.find((section) => section.id === defaultSectionId)?.id ?? sections[0]?.id ?? "");
  const [activeSectionId, setActiveSectionId] = useState(initialSection);

  useEffect(() => {
    if (hashId && sections.some((s) => s.id === hashId)) {
      setActiveSectionId(hashId);
    }
  }, [hashId, sections]);

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

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* Left Column: Secondary Navigation (w-64 shrink-0) */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-2 shadow-xs dark:border-slate-800 dark:bg-slate-950">
            <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible scrollbar-none">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = section.id === activeSection.id;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSectionId(section.id)}
                    className={cn(
                      "flex items-center gap-3 w-full rounded-lg px-3.5 py-2.5 text-xs sm:text-sm font-medium transition-all text-left whitespace-nowrap",
                      isActive
                        ? "bg-teal-50 text-teal-700 font-medium dark:bg-teal-950/50 dark:text-teal-300"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive
                          ? "text-teal-600 dark:text-teal-400"
                          : "text-slate-400 dark:text-slate-500"
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{section.label}</p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Right Column: Dedicated Settings Card (flex-1 max-w-3xl) */}
        <main className="flex-1 max-w-3xl w-full min-w-0">
          {activeSection.content}
        </main>
      </div>
    </div>
  );
}
