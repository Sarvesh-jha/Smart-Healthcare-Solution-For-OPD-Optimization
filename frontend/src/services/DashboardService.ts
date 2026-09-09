import { api } from "./ApiService";

export const dashboardService = {
  async getPatientDashboardData() {
    return api.get("/dashboard/patient");
  },

  async getDoctorDashboardData(date?: string) {
    const query = date ? `?date=${encodeURIComponent(date)}` : "";
    return api.get(`/dashboard/doctor${query}`);
  },

  async getAdminStats() {
    return api.get("/dashboard/admin");
  }
};
