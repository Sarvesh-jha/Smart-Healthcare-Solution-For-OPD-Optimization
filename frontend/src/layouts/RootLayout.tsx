import { Outlet } from "react-router";
import { AuthProvider } from "../context/AuthContext";
import { SearchProvider } from "../context/SearchContext";
import { Toaster } from "../components/common/Sonner";
import { ThemeProvider } from "../components/theme/ThemeProvider";

export function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SearchProvider>
          <Outlet />
          <Toaster />
        </SearchProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
