import React from "react";
import { RouteObject } from "react-router";
import { AdminDashboard } from "../pages/AdminDashboard";
import { AdminManageDoctors } from "../pages/AdminManageDoctors";
import { AddDoctorPage } from "../pages/AddDoctorPage";
import { AdminManagePatients } from "../pages/AdminManagePatients";
import { AddPatientPage } from "../pages/AddPatientPage";
import { AdminAppointments } from "../pages/AdminAppointments";
import { AdminQueueMonitoring } from "../pages/AdminQueueMonitoring";
import { AdminPayments } from "../pages/AdminPayments";
import { AdminAnalytics } from "../pages/AdminAnalytics";
import { AdminSettings } from "../pages/AdminSettings";

/**
 * Child routes registered under the /admin parent route
 */
export const adminRoutes: RouteObject[] = [
  { index: true, element: <AdminDashboard /> },
  { path: "doctors", element: <AdminManageDoctors /> },
  { path: "doctors/add", element: <AddDoctorPage /> },
  { path: "patients", element: <AdminManagePatients /> },
  { path: "patients/add", element: <AddPatientPage /> },
  { path: "appointments", element: <AdminAppointments /> },
  { path: "queue-monitoring", element: <AdminQueueMonitoring /> },
  { path: "payments", element: <AdminPayments /> },
  { path: "analytics", element: <AdminAnalytics /> },
  { path: "settings", element: <AdminSettings /> },
];
