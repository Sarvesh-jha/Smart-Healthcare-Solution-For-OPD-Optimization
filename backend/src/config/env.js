import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";

if (nodeEnv === "production" && !process.env.JWT_SECRET) {
  throw new Error("CRITICAL: JWT_SECRET environment variable must be set in production.");
}

export const env = {
  nodeEnv,
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/medisense",
  jwtSecret: process.env.JWT_SECRET || (nodeEnv === "production" ? "" : "dev-jwt-secret-key-medirxcare"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientOrigin:
    process.env.CLIENT_ORIGIN ||
    "http://localhost:4173,http://127.0.0.1:4173,http://localhost:5173,http://127.0.0.1:5173",
  openAiApiKey: process.env.OPENAI_API_KEY || "",
  openAiModel: process.env.OPENAI_MODEL || "gpt-5-mini",
};
