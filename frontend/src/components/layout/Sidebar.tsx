import { Link, useLocation } from "react-router";
import { 
  LogOut,
} from "lucide-react";
import { Button } from "../common/Button";
import { PulseLogo } from "./PulseLogo";
import { APP_NAME, APP_TAGLINE } from "../../utils/brand";

interface NavItem {
  name: string;
  path: string;
  icon: any;
}

interface SidebarProps {
  navigation: NavItem[];
  onLogout: () => void;
}

/**
 * Shared Sidebar component
 */
export function Sidebar({ navigation, onLogout }: SidebarProps) {
  const location = useLocation();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200/80 bg-white lg:flex lg:flex-col dark:border-slate-800/80 dark:bg-[#0E1420]">
      <div className="border-b border-slate-200/80 p-5 dark:border-slate-800/80">
        <Link to="/" className="group flex items-center gap-3 transition-opacity hover:opacity-90">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-200/80 shadow-xs dark:bg-slate-900/90 dark:border-slate-800">
            <PulseLogo className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-50">{APP_NAME}</h1>
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400 dark:text-slate-400">{APP_TAGLINE}</p>
          </div>
        </Link>
      </div>

      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive 
                  ? "bg-teal-50/90 text-teal-900 font-medium dark:bg-teal-950/50 dark:text-teal-200 border-l-2 border-teal-600 dark:border-teal-400" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-teal-600 dark:text-teal-400" : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200/80 p-3 dark:border-slate-800/80">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-sm h-10 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4 text-slate-400 dark:text-slate-400" />
          <span>Sign Out</span>
        </Button>
      </div>
    </aside>
  );
}
