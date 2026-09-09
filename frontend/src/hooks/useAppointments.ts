import { useState, useEffect } from 'react';
import { appointmentService } from '../services/AppointmentService';

export interface UseAppointmentsOptions {
  date?: string;
  view?: "today" | "tomorrow" | "upcoming" | "all";
}

/**
 * Hook for managing upcoming appointments with real-time sync
 */
export function useAppointments(
  role: "patient" | "doctor" = "patient",
  options: UseAppointmentsOptions = {}
) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const optionsDate = options.date;
  const optionsView = options.view;

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data =
        role === "doctor"
          ? await appointmentService.getDoctorAppointments({
              date: optionsDate,
              view: optionsView,
            })
          : await appointmentService.getUpcoming();
      setAppointments(data as any[]);
    } catch (err) {
      setError("Failed to fetch appointments");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();

    const handleLocalSync = () => {
      fetchAppointments();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "medirxcare:last_appointment_booking") {
        fetchAppointments();
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchAppointments();
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
            fetchAppointments();
          }
        };
      } catch (_e) {}
    }

    const interval = setInterval(fetchAppointments, 15000);

    return () => {
      window.removeEventListener("medirxcare:appointment-booked", handleLocalSync);
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (channel) {
        channel.close();
      }
      clearInterval(interval);
    };
  }, [role, optionsDate, optionsView]);

  return { appointments, loading, error, refresh: fetchAppointments };
}
