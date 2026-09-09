import { Server } from "socket.io";
import { env } from "./env.js";

let io = null;

export function initSocket(httpServer) {
  const allowedOrigins = env.clientOrigin.split(",").map((origin) => origin.trim());

  io = new Server(httpServer, {
    cors: {
      origin(origin, callback) {
        if (!origin) return callback(null, true);

        const isLocalDevelopmentOrigin =
          env.nodeEnv !== "production" &&
          /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

        if (allowedOrigins.includes(origin) || isLocalDevelopmentOrigin) {
          return callback(null, true);
        }

        return callback(null, true); // Permissive for local testing across tabs
      },
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // Admin room subscription
    socket.on("join_admin", () => {
      socket.join("admin_channel");
    });

    // Client SOS socket trigger listener
    socket.on("emergency:sos_triggered", (payload) => {
      io.to("admin_channel").emit("emergency:incoming_alert", payload);
      // Fallback broadcast
      io.emit("emergency:incoming_alert", payload);
    });

    socket.on("disconnect", () => {
      // Clean disconnect
    });
  });

  return io;
}

export function getIO() {
  return io;
}
