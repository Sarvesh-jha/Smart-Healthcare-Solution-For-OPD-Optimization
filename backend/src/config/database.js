import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase(uriOverride) {
  mongoose.set("strictQuery", true);
  const targetUri = uriOverride || env.mongoUri;
  if (!targetUri) {
    throw new Error("No MongoDB connection URI provided. Set MONGODB_URI or MONGO_URI in your environment.");
  }
  await mongoose.connect(targetUri, {
    serverSelectionTimeoutMS: 5000,
  });
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
