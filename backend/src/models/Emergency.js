import mongoose from "mongoose";

const emergencySchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    contact: {
      type: String,
      default: "",
    },
    contactNumber: {
      type: String,
      default: "",
    },
    location: {
      type: mongoose.Schema.Types.Mixed,
      default: "Coordinates unavailable",
    },
    status: {
      type: String,
      enum: ["PENDING_RESPONSE", "Acknowledged", "Dispatched", "Resolved"],
      default: "PENDING_RESPONSE",
    },
    hospital: {
      name: String,
      hotline: String,
      address: String,
      eta: String,
    },
    responderNotes: {
      type: String,
      default: "",
    },
    acknowledgedAt: Date,
    dispatchedAt: Date,
    resolvedAt: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Emergency =
  mongoose.models.Emergency || mongoose.model("Emergency", emergencySchema);
