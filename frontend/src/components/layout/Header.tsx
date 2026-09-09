import { Search, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { Input } from "../common/Input";
import { useAuth } from "../../context/AuthContext";
import { useSearch } from "../../context/SearchContext";
import { SOSEmergencyButton } from "../dashboard/SOSEmergencyButton";
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
 * Shared Header component with role-based features and globally persistent, context-aware search
 */
export function Header({ userRole }: HeaderProps) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, clearSearch } = useSearch();
  const role = userRole || user?.role || "patient";

  const getSearchPlaceholder = (pathname: string): string => {
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      return "Search doctors, clinical tests, reports...";
    }
    if (pathname.includes("/doctor-directory")) {
      return "Search by doctor name, specialty, or department...";
    }
    if (pathname.includes("/reports")) {
      return "Search laboratory reports, radiology, or ECG...";
    }
    if (pathname.includes("/tests-services")) {
      return "Search pathology tests, scans, or blood panels...";
    }
    if (pathname.includes("/prescriptions")) {
      return "Search medications, dosage schedules, or prescribers...";
    }
    if (pathname.includes("/health-checkups")) {
      return "Search preventive health packages...";
    }
    return "Search MEDIrxCARE records...";
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && (location.pathname === "/dashboard" || location.pathname === "/dashboard/") && searchQuery.trim()) {
      navigate("/dashboard/doctor-directory");
    }
  };

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
    <header className="border-b border-slate-200/80 bg-white/95 px-6 py-3 backdrop-blur dark:border-slate-800/80 dark:bg-[#0B0F17]/80 dark:backdrop-blur-md">
      <div className="flex items-center justify-between gap-6 min-h-[36px]">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-400" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder={getSearchPlaceholder(location.pathname)}
              className="h-9 border-slate-200 bg-slate-50/70 pl-9 pr-10 text-xs text-slate-900 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 rounded-lg dark:border-slate-700/70 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-900 dark:focus:border-teal-400 dark:focus:ring-teal-500/30 transition-all"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 shadow-2xs dark:border-slate-700/70 dark:bg-slate-800 dark:text-slate-400 pointer-events-none">
                ⌘K
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {role === "patient" ? <SOSEmergencyButton /> : null}
          {renderNotifications()}
          {renderProfileMenu()}
        </div>
      </div>
    </header>
  );
}
