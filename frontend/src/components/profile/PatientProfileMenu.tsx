import { Link, useNavigate } from "react-router";
import {
  User,
  Calendar,
  FileText,
  Lock,
  LogOut,
  ChevronRight,
  Activity,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "../common/DropdownMenu";
import { useAuth } from "../../context/AuthContext";
import { ThemeModeSelector } from "../theme/ThemeModeSelector";

export function PatientProfileMenu() {
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
      return parts[0] ? parts[0][0].toUpperCase() : "P";
    }
    return "P";
  };

  const displayName = user?.name || "Patient";
  const displayEmail = user?.email || "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group flex items-center gap-2.5 rounded-full border border-slate-200/90 bg-white py-1 pl-3 pr-2 transition-all hover:bg-slate-50 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-850 shadow-2xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 active:scale-[0.98]"
          aria-label="User profile menu"
        >
          <div className="text-right leading-tight hidden sm:block">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
              {displayName}
            </p>
            <p className="text-[10px] font-medium text-teal-600 dark:text-teal-400">
              Patient Portal
            </p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-xs font-bold text-white shadow-2xs ring-2 ring-white dark:ring-slate-900 shrink-0">
            {getInitials()}
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300 transition-transform duration-200" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-80 rounded-2xl border border-slate-200/90 bg-white p-0 shadow-xl dark:border-slate-800 dark:bg-slate-950 overflow-hidden z-50"
      >
        {/* Header Block */}
        <div className="border-b border-slate-100 bg-gradient-to-b from-teal-50/60 to-transparent p-4 dark:border-slate-800 dark:from-teal-950/30">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-sm font-bold text-white shadow-2xs ring-2 ring-white dark:ring-slate-900 shrink-0">
              {getInitials()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {displayName}
                </h4>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                  Patient Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {displayEmail}
              </p>
            </div>
          </div>
        </div>

        <div className="p-2 space-y-1">
          {/* Navigation Links */}
          <div className="px-3 pt-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Navigation
          </div>
          <DropdownMenuGroup className="space-y-0.5">
            <DropdownMenuItem asChild>
              <Link
                to="/dashboard/settings"
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 transition-colors"
              >
                <User className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span className="flex-1">Profile & Settings</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                to="/dashboard/reports"
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 transition-colors"
              >
                <Activity className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span className="flex-1">Health History</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                to="/dashboard/book-appointment"
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 transition-colors"
              >
                <Calendar className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span className="flex-1">My Appointments</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                to="/dashboard/reports"
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 transition-colors"
              >
                <FileText className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span className="flex-1">Medical Reports</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          {/* Account & Appearance */}
          <DropdownMenuSeparator className="my-1.5 border-slate-100 dark:border-slate-800" />

          <div className="px-3 pt-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Account & Appearance
          </div>

          <DropdownMenuGroup className="space-y-0.5">
            <DropdownMenuItem asChild>
              <Link
                to="/dashboard/settings#security"
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 transition-colors"
              >
                <Lock className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" />
                <span className="flex-1">Security</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <div className="pt-1">
            <ThemeModeSelector label="Appearance" />
          </div>

          {/* Danger Zone: Logout */}
          <DropdownMenuSeparator className="my-1.5 border-slate-100 dark:border-slate-800" />

          <DropdownMenuItem
            onClick={handleLogout}
            className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 focus:bg-rose-50 focus:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Logout</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
