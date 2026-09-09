import express from "express";
import { authRequired } from "../middleware/auth.js";
import { Report } from "../models/Report.js";
import { User } from "../models/User.js";

const router = express.Router();

export async function fetchPatientReportsAndVitals(userId) {
  const userReports = await Report.find({
    patient: userId,
  })
    .populate("doctor", "name specialization")
    .sort({ date: -1, createdAt: -1 });

  const reports = userReports.map((r) => ({
    id: r._id.toString(),
    appointmentId: r._id.toString(),
    name: r.name,
    date: r.date ? r.date.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    doctor: r.doctor?.name || "Consultant Pathologist",
    type: r.type || "Diagnostic Pathology",
    status: r.status || "normal",
    fileSize: r.fileSize || "2.4 MB",
    fileUrl: r.fileUrl || null,
  }));

  const userDoc = await User.findById(userId);
  const profileVitals = userDoc?.patientProfile?.vitals;

  const reportWithVitals = userReports.find(
    (r) => r.vitals && (r.vitals.bloodPressure || r.vitals.bloodSugar || r.vitals.cholesterol || r.vitals.heartRate)
  );

  const vitals = {
    bloodPressure: profileVitals?.bloodPressure || reportWithVitals?.vitals?.bloodPressure || null,
    bloodSugar: profileVitals?.bloodSugar || reportWithVitals?.vitals?.bloodSugar || null,
    cholesterol: profileVitals?.cholesterol || reportWithVitals?.vitals?.cholesterol || null,
    heartRate: profileVitals?.heartRate || reportWithVitals?.vitals?.heartRate || null,
  };

  return { reports, vitals };
}

export async function handleGetReports(req, res) {
  try {
    const { reports, vitals } = await fetchPatientReportsAndVitals(req.user._id);

    return res.json({
      success: true,
      reports,
      vitals,
    });
  } catch (error) {
    console.error("Failed to fetch reports:", error);
    return res.status(500).json({ message: "Failed to fetch reports." });
  }
}

// GET /api/reports
router.get("/", authRequired, handleGetReports);

// GET /api/reports/lab-reports
router.get("/lab-reports", authRequired, handleGetReports);

// POST /api/reports
router.post("/", authRequired, async (req, res) => {
  try {
    const { name, type, category, status, fileSize, vitals, notes, doctorId } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Report name is required." });
    }

    const report = await Report.create({
      patient: req.user._id,
      doctor: doctorId || null,
      name,
      type: type || "Diagnostic Pathology",
      category: category || "Diagnostic Pathology",
      status: status || "normal",
      fileSize: fileSize || "1.8 MB",
      vitals: vitals || {},
      notes,
    });

    if (vitals && Object.values(vitals).some(Boolean)) {
      await User.findByIdAndUpdate(req.user._id, {
        "patientProfile.vitals": {
          ...vitals,
          recordedAt: new Date(),
        },
      });
    }

    return res.status(201).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Failed to create report:", error);
    return res.status(500).json({ message: "Failed to create report." });
  }
});

// POST /api/reports/vitals - update verified patient vitals
router.post("/vitals", authRequired, async (req, res) => {
  try {
    const { bloodPressure, bloodSugar, cholesterol, heartRate } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        "patientProfile.vitals": {
          bloodPressure: bloodPressure || null,
          bloodSugar: bloodSugar || null,
          cholesterol: cholesterol || null,
          heartRate: heartRate || null,
          recordedAt: new Date(),
        },
      },
      { new: true }
    );

    return res.json({
      success: true,
      vitals: user.patientProfile?.vitals,
    });
  } catch (error) {
    console.error("Failed to update vitals:", error);
    return res.status(500).json({ message: "Failed to update vitals." });
  }
});

// DELETE /api/reports/test-cleanup (test helper or full patient reset)
router.delete("/test-cleanup", authRequired, async (req, res) => {
  try {
    await Report.deleteMany({ patient: req.user._id });
    await User.findByIdAndUpdate(req.user._id, {
      $unset: { "patientProfile.vitals": "" },
    });
    return res.json({ success: true, message: "Patient reports cleaned up successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to cleanup reports." });
  }
});

// DELETE /api/reports/:id
router.delete("/:id", authRequired, async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({
      _id: req.params.id,
      patient: req.user._id,
    });
    if (!report) {
      return res.status(404).json({ message: "Report not found." });
    }
    return res.json({ success: true, message: "Report deleted." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete report." });
  }
});

export default router;
