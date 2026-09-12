import cors from "cors";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import { rateLimit } from "express-rate-limit";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import aiRoutes from "./routes/ai.routes.js";
import appointmentsRoutes from "./routes/appointments.routes.js";
import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import doctorsRoutes from "./routes/doctors.routes.js";
import emergencyRoutes from "./routes/emergency.routes.js";
import patientsRoutes from "./routes/patients.routes.js";
import queueRoutes from "./routes/queue.routes.js";
import videoRoutes from "./routes/video.routes.js";
import userRoutes from "./routes/user.routes.js";
import checkupsRoutes from "./routes/checkups.routes.js";
import testsRoutes from "./routes/tests.routes.js";
import reportsRoutes from "./routes/reports.routes.js";

export function createApp() {
  const app = express();
  const configuredOrigins = (env.clientOrigin || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const defaultOrigins = [
    "https://medirxcare.vercel.app",
    "http://localhost:5173",
    "http://localhost:4173",
    "http://localhost:4174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:4173",
    "http://127.0.0.1:4174",
  ];

  const allowedOrigins = Array.from(new Set([...defaultOrigins, ...configuredOrigins]));

  app.use(helmet());

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) {
          return callback(null, true);
        }

        const isLocalDevelopmentOrigin =
          env.nodeEnv !== "production" &&
          /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

        if (allowedOrigins.includes(origin) || isLocalDevelopmentOrigin) {
          return callback(null, true);
        }

        return callback(new Error(`Origin not allowed: ${origin}`));
      },
      credentials: true,
    }),
  );
  app.use(express.json());

  if (env.nodeEnv !== "test") {
    const apiLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 500,
      standardHeaders: true,
      legacyHeaders: false,
      message: { message: "Too many requests from this IP, please try again later." },
    });
    app.use("/api/", apiLimiter);
  }

  if (env.nodeEnv !== "test") {
    app.use(morgan("dev"));
  }

  app.get("/", (_req, res) => {
    res.json({
      name: "MEDIrxCARE Backend",
      status: "ok",
      health: "/api/health",
    });
  });

  app.get("/.well-known/appspecific/com.chrome.devtools.json", (_req, res) => {
    res.status(204).end();
  });

  const getHealthPayload = () => {
    const dbStatusMap = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };
    const dbStatus = dbStatusMap[mongoose.connection.readyState] || "disconnected";

    return {
      status: "ok",
      service: "medirxcare-backend",
      uptime: Math.floor(process.uptime()),
      environment: env.nodeEnv,
      database: dbStatus,
      timestamp: new Date().toISOString(),
    };
  };

  app.get("/health", (_req, res) => {
    res.json(getHealthPayload());
  });

  app.get("/api/health", (_req, res) => {
    res.json(getHealthPayload());
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/doctors", doctorsRoutes);
  app.use("/api/patients", patientsRoutes);
  app.use("/api/appointments", appointmentsRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/queue", queueRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/emergency", emergencyRoutes);
  app.use("/api/video", videoRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/checkups", checkupsRoutes);
  app.use("/api/tests", testsRoutes);
  app.use("/api/reports", reportsRoutes);
  app.use("/api/patient/lab-reports", reportsRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
