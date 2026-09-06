import { Search } from "lucide-react";
import { useLocation } from "react-router";
import { Input } from "../common/Input";
import { useAuth } from "../../context/AuthContext";
import { EmergencyAlertButton } from "../dashboard/EmergencyAlertButton";
import { PatientNotifications } from "../notifications/PatientNotifications";
import { DoctorNotifications } from "../notifications/DoctorNotifications";
import { AdminNotifications } from "../notifications/AdminNotifications";
import { PatientProfileMenu } from "../profile/PatientProfileMenu";
import { DoctorProfileMenu } from "../profile/DoctorProfileMenu";
import { AdminProfileMenu } from "../profile/AdminProfileMenu";

interface HeaderProps {
  userRole?: "patient" | "doctor" | "admin";
}

/**
 * Shared Header component with role-based features
 */
export function Header({ userRole }: HeaderProps) {
  const { user } = useAuth();
  const location = useLocation();
  const role = userRole || user?.role || "patient";

  const isMainDashboard = location.pathname === "/dashboard";

  const renderNotifications = () => {
    switch (role) {
      case "doctor":
        return <DoctorNotifications />;
      case "admin":
        return <AdminNotifications />;
      case "patient":
      default:
        return <PatientNotifications />;
    }
  };

  const renderProfileMenu = () => {
    switch (role) {
      case "doctor":
        return <DoctorProfileMenu />;
      case "admin":
        return <AdminProfileMenu />;
      case "patient":
      default:
        return <PatientProfileMenu />;
    }
  };

  return (
    <header className="border-b border-slate-200/80 bg-white/95 px-6 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between gap-6 min-h-[36px]">
        {isMainDashboard ? (
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <Input
                type="search"
                placeholder="Search doctors, clinical tests, reports..."
                className="h-9 border-slate-200 bg-slate-50/70 pl-9 pr-12 text-xs focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 rounded-lg dark:border-slate-800 dark:bg-slate-900"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 shadow-2xs dark:border-slate-700 dark:bg-slate-800">
                ⌘K
              </span>
            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )}
        <div className="flex items-center gap-3">
          {role === "patient" ? <EmergencyAlertButton /> : null}
          {renderNotifications()}
          {renderProfileMenu()}
        </div>
      </div>
    </header>
  );
}
