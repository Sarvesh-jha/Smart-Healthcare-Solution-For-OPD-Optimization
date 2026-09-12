import { io, Socket } from "socket.io-client";

function resolveSocketUrl() {
  const configuredUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL)?.trim();
  if (configuredUrl) {
    return configuredUrl.replace(/\/api\/?$/, "");
  }

  if (typeof window !== "undefined") {
    const { hostname } = window.location;
    const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
    if (isLocal) {
      return "http://localhost:5001";
    }
    return window.location.origin;
  }

  return "http://localhost:5001";
}

export interface EmergencyPayload {
  _id?: string;
  id?: string;
  patientId?: string;
  patientName: string;
  contact?: string;
  contactNumber?: string;
  location?: string | { latitude?: number; longitude?: number; address?: string };
  status?: "PENDING_RESPONSE" | "Acknowledged" | "Dispatched" | "Resolved";
  hospital?: {
    name: string;
    hotline: string;
    address: string;
    eta?: string;
  };
  responderNotes?: string;
  timestamp?: string;
  createdAt?: string;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnecting = false;

  public getSocket(): Socket {
    if (!this.socket) {
      const url = resolveSocketUrl();
      this.socket = io(url, {
        transports: ["websocket", "polling"],
        withCredentials: true,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
      });

      this.socket.on("connect", () => {
        // Socket connected
      });

      this.socket.on("connect_error", (_err) => {
        // Fallback polling will automatically handle connection
      });
    }

    return this.socket;
  }

  public joinAdminRoom() {
    const socket = this.getSocket();
    if (socket.connected) {
      socket.emit("join_admin");
    } else {
      socket.once("connect", () => {
        socket.emit("join_admin");
      });
    }
  }

  public emitSosTriggered(payload: EmergencyPayload) {
    const socket = this.getSocket();
    if (socket.connected) {
      socket.emit("emergency:sos_triggered", payload);
    } else {
      socket.connect();
      socket.emit("emergency:sos_triggered", payload);
    }
  }

  public onIncomingEmergencyAlert(callback: (alert: EmergencyPayload) => void) {
    const socket = this.getSocket();
    socket.on("emergency:incoming_alert", callback);
    return () => {
      socket.off("emergency:incoming_alert", callback);
    };
  }

  public onEmergencyUpdated(callback: (alert: EmergencyPayload) => void) {
    const socket = this.getSocket();
    socket.on("emergency:updated", callback);
    return () => {
      socket.off("emergency:updated", callback);
    };
  }
}

export const socketService = new SocketService();
