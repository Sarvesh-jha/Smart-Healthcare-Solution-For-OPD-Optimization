import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: "Diagnostic Pathology",
    },
    type: {
      type: String,
      default: "Diagnostic Pathology",
    },
    status: {
      type: String,
      enum: ["normal", "abnormal", "critical", "processing", "pending"],
      default: "normal",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    fileSize: {
      type: String,
      default: "2.4 MB",
    },
    fileUrl: {
      type: String,
    },
    vitals: {
      bloodPressure: { type: String, default: null },
      bloodSugar: { type: String, default: null },
      cholesterol: { type: String, default: null },
      heartRate: { type: String, default: null },
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

export const Report = mongoose.models.Report || mongoose.model("Report", reportSchema);
