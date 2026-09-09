import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings,
  Activity,
  CreditCard,
  ShieldCheck
} from "lucide-react";
import { Sidebar } from "./Sidebar";

export const adminNavigation = [
  { name: "Overview", path: "/admin", icon: LayoutDashboard },
  { name: "Manage Doctors", path: "/admin/doctors", icon: ShieldCheck },
  { name: "Manage Patients", path: "/admin/patients", icon: Users },
  { name: "All Appointments", path: "/admin/appointments", icon: Calendar },
  { name: "Queue Monitoring", path: "/admin/queue-monitoring", icon: Activity },
  { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
  { name: "Payments", path: "/admin/payments", icon: CreditCard },
  { name: "Profile", path: "/admin/settings", icon: Settings },
];

export interface AdminSidebarProps {
  onLogout: () => void;
}

/**
 * Dedicated Admin Sidebar component providing navigation for all Admin desk modules
 */
export function AdminSidebar({ onLogout }: AdminSidebarProps) {
  return (
    <Sidebar 
      navigation={adminNavigation} 
      onLogout={onLogout} 
    />
  );
}
