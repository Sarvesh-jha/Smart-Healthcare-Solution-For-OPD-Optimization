import { api } from "./ApiService";

export const queueService = {
  async getQueueStatus(params?: string | { doctorId?: string; date?: string }) {
    const searchParams = new URLSearchParams();
    if (typeof params === "string" && params) {
      searchParams.append("doctorId", params);
    } else if (params && typeof params === "object") {
      if (params.doctorId) searchParams.append("doctorId", params.doctorId);
      if (params.date) searchParams.append("date", params.date);
    }
    const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return api.get(`/queue/status${query}`);
  },

  async nextPatient() {
    return api.post("/queue/next", {});
  }
};
