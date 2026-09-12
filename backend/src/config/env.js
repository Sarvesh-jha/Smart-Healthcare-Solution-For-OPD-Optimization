import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || (nodeEnv === "production" ? "" : "mongodb://127.0.0.1:27017/medisense");
const jwtSecret = process.env.JWT_SECRET || (nodeEnv === "production" ? "" : "dev-jwt-secret-key-medirxcare");

if (nodeEnv === "production") {
  if (!mongoUri) {
    throw new Error("CRITICAL: MONGO_URI (or MONGODB_URI) environment variable must be set in production.");
  }
  if (!jwtSecret) {
    throw new Error("CRITICAL: JWT_SECRET environment variable must be set in production.");
  }
}

export const env = {
  nodeEnv,
  port: Number(process.env.PORT || 5001),
  mongoUri,
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientOrigin:
    process.env.CORS_ORIGIN ||
    process.env.CLIENT_ORIGIN ||
    "https://medirxcare.vercel.app,http://localhost:5173,http://localhost:4173,http://localhost:4174,http://127.0.0.1:5173,http://127.0.0.1:4173,http://127.0.0.1:4174",
  openAiApiKey: process.env.OPENAI_API_KEY || "",
  openAiModel: process.env.OPENAI_MODEL || "gpt-5-mini",
  geminiApiKey: process.env.GEMINI_API_KEY || process.env.AI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
};
