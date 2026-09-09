import React from "react";
import { Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Header } from "../components/layout/Header";
import { AdminSidebar, adminNavigation } from "../components/layout/AdminSidebar";

export { adminNavigation };

export interface AdminDashboardLayoutProps {
  children?: React.ReactNode;
}

/**
 * Main layout for Admin Dashboard
 */
export function AdminDashboardLayout({ children }: AdminDashboardLayoutProps = {}) {
  const { logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950">
      <AdminSidebar onLogout={handleLogout} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userRole="admin" />

        <main className="flex-1 overflow-y-auto p-8">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
