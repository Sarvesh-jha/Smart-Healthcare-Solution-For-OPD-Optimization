import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect, type ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      const legacy = localStorage.getItem("medirxcare-theme");
      if (!stored && legacy) {
        localStorage.setItem("theme", legacy);
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      storageKey="theme"
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

