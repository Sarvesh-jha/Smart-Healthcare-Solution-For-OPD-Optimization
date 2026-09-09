import { api } from "./ApiService";

export const appointmentService = {
  async getUpcoming() {
    return api.get<any[]>("/appointments/upcoming");
  },

  async getTodaysDoctorAppointments(options?: { date?: string; view?: string }) {
    return this.getDoctorAppointments(options);
  },

  async getDoctorAppointments(options?: { date?: string; view?: string }) {
    const params = new URLSearchParams();
    if (options?.date) {
      params.append("date", options.date);
    }
    if (options?.view) {
      params.append("view", options.view);
    }
    const queryString = params.toString() ? `?${params.toString()}` : "";
    return api.get<any[]>(`/appointments/doctor${queryString}`);
  },

  async book(data: any) {
    const res = await api.post<{ success: boolean; appointment: any }>("/appointments", data);

    // Broadcast appointment sync across current tab and other tabs
    if (typeof window !== "undefined") {
      try {
        window.dispatchEvent(
          new CustomEvent("medirxcare:appointment-booked", {
            detail: res.appointment,
          })
        );
      } catch (_e) {}

      try {
        localStorage.setItem(
          "medirxcare:last_appointment_booking",
          JSON.stringify({
            timestamp: Date.now(),
            appointment: res.appointment,
          })
        );
      } catch (_e) {}

      try {
        if ("BroadcastChannel" in window) {
          const channel = new BroadcastChannel("medirxcare_sync");
          channel.postMessage({
            type: "APPOINTMENT_BOOKED",
            appointment: res.appointment,
          });
          channel.close();
        }
      } catch (_e) {}
    }

    return res;
  },

  async getById(appointmentId: string) {
    return api.get<{ appointment: any }>(`/appointments/${appointmentId}`);
  },

  async start(appointmentId: string) {
    return api.post<{ success: boolean; appointment: any }>(`/appointments/${appointmentId}/start`, {});
  },
};
