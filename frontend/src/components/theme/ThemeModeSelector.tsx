import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "../common/DropdownMenu";

const themeOptions = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function ThemeModeSelector({ label = "Appearance" }: { label?: string }) {
  const { resolvedTheme, setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = mounted ? theme || "light" : "light";
  const previewTheme = mounted ? resolvedTheme || "light" : "light";

  return (
    <>
      <DropdownMenuLabel className="px-3 pt-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {label}
      </DropdownMenuLabel>
      <DropdownMenuRadioGroup value={activeTheme} onValueChange={(value) => setTheme(value)} className="space-y-0.5">
        {themeOptions.map((option) => {
          const Icon = option.icon;
          const isActive = activeTheme === option.value;

          return (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              className="rounded-xl px-8 py-1.5 text-xs font-medium focus:bg-teal-50 focus:text-teal-700 dark:focus:bg-teal-950/40 dark:focus:text-teal-300 cursor-pointer"
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? "text-teal-600 dark:text-teal-400" : "text-slate-400 dark:text-slate-500"}`} />
              <span className="text-xs text-slate-700 dark:text-slate-200">{option.label}</span>
              {option.value === "system" && (
                <span className="ml-auto text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {previewTheme}
                </span>
              )}
            </DropdownMenuRadioItem>
          );
        })}
      </DropdownMenuRadioGroup>
    </>
  );
}
