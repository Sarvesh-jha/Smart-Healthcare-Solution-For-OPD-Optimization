import { Search } from "lucide-react";
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
  const role = userRole || user?.role || "patient";

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
    <header className="border-b border-gray-200 bg-white/95 px-8 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="flex items-center justify-between gap-6">
        <div className="flex-1 max-w-md">
          <div className="relative transition-transform duration-200 hover:-translate-y-0.5">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
            <Input
              type="search"
              placeholder="Search doctors, tests, reports..."
              className="h-10 border-gray-200 bg-gray-50 pl-10 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:focus:bg-slate-950"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {role === "patient" ? <EmergencyAlertButton /> : null}
          {renderNotifications()}
          {renderProfileMenu()}
        </div>
      </div>
    </header>
  );
}
