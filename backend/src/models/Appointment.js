import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["online", "offline"],
      default: "online",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "scheduled", "ongoing", "completed", "cancelled"],
      default: "confirmed",
    },
    fee: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["upi", "card", "wallet", "netbanking"],
      default: "upi",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "paid",
    },
    dateTime: {
      type: Date,
      required: true,
    },
    notes: String,
  },
  {
    timestamps: true,
  },
);

export const Appointment = mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);
