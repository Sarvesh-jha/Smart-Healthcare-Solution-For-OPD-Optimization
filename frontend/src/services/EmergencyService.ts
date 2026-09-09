import { api } from "./ApiService";
import { EmergencyPayload } from "./SocketService";

export const emergencyService = {
  async triggerEmergency(payload: {
    patientId?: string;
    patientName?: string;
    contactNumber?: string;
    contact?: string;
    location?: string | { latitude?: number; longitude?: number; address?: string };
    timestamp?: string;
  }) {
    return api.post<{
      success: boolean;
      alertId: string;
      emergency: EmergencyPayload;
      message: string;
      eta: string;
      hospital: {
        name: string;
        hotline: string;
        address: string;
      };
    }>("/emergency/trigger", payload);
  },

  async sendAlert(location?: { latitude?: number; longitude?: number }) {
    return api.post<{
      success: boolean;
      alertId: string;
      message: string;
      eta: string;
      hospital: {
        name: string;
        hotline: string;
        address: string;
      };
    }>("/emergency/trigger", location || {});
  },

  async getIncidents() {
    return api.get<{
      success: boolean;
      incidents: EmergencyPayload[];
    }>("/emergency/incidents");
  },

  async acknowledge(id: string, notes?: string) {
    return api.patch<{
      success: boolean;
      emergency: EmergencyPayload;
    }>(`/emergency/${id}/acknowledge`, { notes });
  },

  async dispatch(id: string, notes?: string) {
    return api.patch<{
      success: boolean;
      emergency: EmergencyPayload;
    }>(`/emergency/${id}/dispatch`, { notes });
  },

  async resolve(id: string, notes?: string) {
    return api.patch<{
      success: boolean;
      emergency: EmergencyPayload;
    }>(`/emergency/${id}/resolve`, { notes });
  },
};
