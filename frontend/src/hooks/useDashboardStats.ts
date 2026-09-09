import { useState, useEffect } from 'react';
import { dashboardService } from '../services/DashboardService';

/**
 * Hook for managing dashboard statistics based on role
 */
export function useDashboardStats(
  role: "patient" | "doctor" | "admin",
  options?: { date?: string }
) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const optionsDate = options?.date;

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      let data;
      if (role === "patient") {
        data = await dashboardService.getPatientDashboardData();
      } else if (role === "doctor") {
        data = await dashboardService.getDoctorDashboardData(optionsDate);
      } else {
        data = await dashboardService.getAdminStats();
      }
      setStats(data);
    } catch (err) {
      setError("Failed to fetch dashboard statistics");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    const handleLocalSync = () => {
      fetchStats();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "medirxcare:last_appointment_booking") {
        fetchStats();
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchStats();
      }
    };

    window.addEventListener("medirxcare:appointment-booked", handleLocalSync);
    window.addEventListener("storage", handleStorage);
    document.addEventListener("visibilitychange", handleVisibility);

    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      try {
        channel = new BroadcastChannel("medirxcare_sync");
        channel.onmessage = (event) => {
          if (event.data?.type === "APPOINTMENT_BOOKED") {
            fetchStats();
          }
        };
      } catch (_e) {}
    }

    const interval = setInterval(fetchStats, 20000);

    return () => {
      window.removeEventListener("medirxcare:appointment-booked", handleLocalSync);
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (channel) {
        channel.close();
      }
      clearInterval(interval);
    };
  }, [role, optionsDate]);

  return { stats, loading, error, refresh: fetchStats };
}
