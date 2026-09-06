import { Link, useNavigate } from "react-router";
import { User, Calendar, Stethoscope, Lock, LogOut, ChevronRight, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "../common/DropdownMenu";
import { useAuth } from "../../context/AuthContext";
import { ThemeModeSelector } from "../theme/ThemeModeSelector";
import { APP_NAME } from "../../utils/brand";

export function DoctorProfileMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
    toast.success("Logged out successfully.");
  };

  const getInitials = () => {
    if (user?.name) {
      const parts = user.name.trim().split(" ").filter(Boolean);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return parts[0] ? parts[0][0].toUpperCase() : "D";
    }
    return "AM";
  };

  const displayName = user?.name || "Dr. Aarav Mehta";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group flex items-center gap-2.5 rounded-full border border-slate-200/90 bg-white py-1 pl-3 pr-2 transition-all hover:bg-slate-50 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-850 shadow-2xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 active:scale-[0.98]"
          aria-label="Doctor profile menu"
        >
          <div className="text-right leading-tight hidden sm:block">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
              {displayName}
            </p>
            <p className="text-[10px] font-medium text-teal-600 dark:text-teal-400">
              Doctor Portal
            </p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-xs font-bold text-white shadow-2xs ring-2 ring-white dark:ring-slate-900 shrink-0">
            {getInitials()}
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300 transition-transform duration-200" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="mt-2 w-72 rounded-2xl border-gray-200 p-0 shadow-xl dark:border-slate-800 dark:bg-slate-950">
        <div className="rounded-t-2xl bg-gradient-to-br from-cyan-600 to-teal-500 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-lg font-bold text-cyan-600 shadow-lg">
              {getInitials()}
            </div>
            <div className="text-white">
              <h3 className="text-base font-semibold leading-tight">{user?.name || "Dr. Aarav Mehta"}</h3>
              <p className="mt-0.5 text-xs text-cyan-100">Doctor Portal</p>
              <p className="mt-0.5 text-xs text-cyan-100">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="p-2">
          <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-slate-400">
            Clinical Tools
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link to="/doctor/settings" className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-slate-200">Profile & Settings</span>
                <ChevronRight className="ml-auto w-4 h-4 text-gray-400" />
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/doctor/appointments" className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-slate-200">My Schedule</span>
                <ChevronRight className="ml-auto w-4 h-4 text-gray-400" />
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/doctor/patient-history"
                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5"
              >
                <Stethoscope className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-slate-200">Patient Records</span>
                <ChevronRight className="ml-auto w-4 h-4 text-gray-400" />
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-2" />

          <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-slate-400">
            Account Settings
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5">
              <Lock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700 dark:text-slate-200">Security</span>
              <ChevronRight className="ml-auto w-4 h-4 text-gray-400" />
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <ThemeModeSelector label={`${APP_NAME} Theme`} />

          <DropdownMenuSeparator className="my-2" />

          <DropdownMenuItem
            onClick={handleLogout}
            className="mb-1 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
