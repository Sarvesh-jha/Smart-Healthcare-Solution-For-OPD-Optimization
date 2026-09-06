import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { PatientDashboard } from "./pages/PatientDashboard";
import { AiSymptomChecker } from "./pages/AiSymptomChecker";
import { DoctorDirectory } from "./pages/DoctorDirectory";
import { AppointmentBooking } from "./pages/AppointmentBooking";
import { LiveQueueTracker } from "./pages/LiveQueueTracker";
import { PrescriptionInsight } from "./pages/PrescriptionInsight";
import { PreventiveHealthDashboard } from "./pages/PreventiveHealthDashboard";
import { PatientReports } from "./pages/PatientReports";
import { PatientHealthCheckups } from "./pages/PatientHealthCheckups";
import { PatientTestsServices } from "./pages/PatientTestsServices";
import { PatientSettings } from "./pages/PatientSettings";
import { DoctorDashboard } from "./pages/DoctorDashboard";
import { DoctorAppointments } from "./pages/DoctorAppointments";
import { DoctorQueue } from "./pages/DoctorQueue";
import { DoctorWritePrescription } from "./pages/DoctorWritePrescription";
import { DoctorPatientHistory } from "./pages/DoctorPatientHistory";
import { DoctorSettings } from "./pages/DoctorSettings";
import { VideoConsultationRoom } from "./pages/VideoConsultationRoom";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminManageDoctors } from "./pages/AdminManageDoctors";
import { AdminManagePatients } from "./pages/AdminManagePatients";
import { AdminAppointments } from "./pages/AdminAppointments";
import { AdminQueueMonitoring } from "./pages/AdminQueueMonitoring";
import { AdminPayments } from "./pages/AdminPayments";
import { AdminAnalytics } from "./pages/AdminAnalytics";
import { AdminSettings } from "./pages/AdminSettings";
import { AddDoctorPage } from "./pages/AddDoctorPage";
import { AddPatientPage } from "./pages/AddPatientPage";
import { ErrorBoundary } from "./components/layout/ErrorBoundary";
import { RootLayout } from "./layouts/RootLayout";
import { ProtectedPatientLayout } from "./layouts/ProtectedPatientLayout";
import { ProtectedDoctorLayout } from "./layouts/ProtectedDoctorLayout";
import { ProtectedAdminLayout } from "./layouts/ProtectedAdminLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    ErrorBoundary: ErrorBoundary,
    children: [
      {
        index: true,
        Component: LandingPage,
      },
      {
        path: "dashboard",
        Component: ProtectedPatientLayout,
        children: [
          { index: true, Component: PatientDashboard },
          { path: "book-appointment", Component: AppointmentBooking },
          { path: "doctor-directory", Component: DoctorDirectory },
          { path: "ai-doctor", Component: AiSymptomChecker },
          { path: "care-guide", Component: AiSymptomChecker },
          { path: "ai-symptom-checker", Component: AiSymptomChecker },
          { path: "prescriptions", Component: PrescriptionInsight },
          { path: "reports", Component: PatientReports },
          { path: "health-checkups", Component: PatientHealthCheckups },
          { path: "tests-services", Component: PatientTestsServices },
          { path: "settings", Component: PatientSettings },
          { path: "live-queue", Component: LiveQueueTracker },
          { path: "preventive-health", Component: PreventiveHealthDashboard },
          { path: "consultation/:appointmentId", Component: VideoConsultationRoom },
        ],
      },
      {
        path: "doctor",
        Component: ProtectedDoctorLayout,
        children: [
          { index: true, Component: DoctorDashboard },
          { path: "appointments", Component: DoctorAppointments },
          { path: "queue", Component: DoctorQueue },
          { path: "write-prescription", Component: DoctorWritePrescription },
          { path: "patient-history", Component: DoctorPatientHistory },
          { path: "settings", Component: DoctorSettings },
          { path: "consultation/:appointmentId", Component: VideoConsultationRoom },
        ],
      },
      {
        path: "admin",
        Component: ProtectedAdminLayout,
        children: [
          { index: true, Component: AdminDashboard },
          { path: "doctors", Component: AdminManageDoctors },
          { path: "doctors/add", Component: AddDoctorPage },
          { path: "patients", Component: AdminManagePatients },
          { path: "patients/add", Component: AddPatientPage },
          { path: "appointments", Component: AdminAppointments },
          { path: "queue-monitoring", Component: AdminQueueMonitoring },
          { path: "payments", Component: AdminPayments },
          { path: "analytics", Component: AdminAnalytics },
          { path: "settings", Component: AdminSettings },
        ],
      },
      {
        path: "*",
        Component: ErrorBoundary,
      },
    ],
  },
]);
