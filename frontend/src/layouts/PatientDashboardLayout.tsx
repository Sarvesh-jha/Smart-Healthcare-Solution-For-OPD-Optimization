import { Outlet, useLocation } from "react-router";
import { 
  LayoutDashboard, 
  Calendar, 
  Heart,
  TestTube,
  FileText,
  ClipboardList
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { DoctorSearchLogo } from "../components/icons/DoctorSearchLogo";
import { CareAssistantLogo } from "../components/icons/CareAssistantLogo";

const patientNavigation = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Book Appointment", path: "/dashboard/book-appointment", icon: Calendar },
  { name: "Find Doctors", path: "/dashboard/doctor-directory", icon: DoctorSearchLogo },
  { name: "Care Guide", path: "/dashboard/ai-doctor", icon: CareAssistantLogo },
  { name: "Prescriptions", path: "/dashboard/prescriptions", icon: FileText },
  { name: "Reports", path: "/dashboard/reports", icon: ClipboardList },
  { name: "Health Checkups", path: "/dashboard/health-checkups", icon: Heart },
  { name: "Tests & Services", path: "/dashboard/tests-services", icon: TestTube },
];

/**
 * Main layout for Patient Dashboard
 */
export function PatientDashboardLayout() {
  const { logout } = useAuth();
  const location = useLocation();
  const isConsultationRoute = location.pathname.includes("/consultation/");
  const isCareGuideRoute =
    location.pathname.includes("/ai-doctor") ||
    location.pathname.includes("/care-guide") ||
    location.pathname.includes("/ai-symptom-checker");

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  if (isConsultationRoute) {
    return (
      <div className="h-screen overflow-hidden bg-slate-950">
        <main className="h-full overflow-hidden">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950">
      <Sidebar 
        navigation={patientNavigation} 
        onLogout={handleLogout} 
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userRole="patient" />

        <main
          className={
            isCareGuideRoute
              ? "flex-1 overflow-hidden p-4 lg:p-6 flex flex-col min-h-0"
              : "flex-1 overflow-y-auto px-6 py-6 lg:px-8"
          }
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
