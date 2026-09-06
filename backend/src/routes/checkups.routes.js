import express from "express";
import { authRequired } from "../middleware/auth.js";
import { Appointment } from "../models/Appointment.js";
import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";
import { createAppointmentDateTime, serializeAppointment } from "../utils/helpers.js";

const router = express.Router();

const checkupPackages = [
  {
    id: "pkg-basic",
    name: "Basic Health Checkup",
    description: "Essential health screening for general wellness",
    price: 899,
    duration: "2-3 hours",
    tests: 15,
    popular: false,
    includes: [
      "Complete Blood Count (CBC)",
      "Lipid Profile",
      "Blood Sugar (Fasting)",
      "Liver Function Test (LFT)",
      "Kidney Function Test (KFT)",
    ],
  },
  {
    id: "pkg-comprehensive",
    name: "Comprehensive Health Checkup",
    description: "Complete health assessment with advanced diagnostics",
    price: 1999,
    duration: "4-5 hours",
    tests: 35,
    popular: true,
    includes: [
      "All Basic Tests",
      "Thyroid Profile (TSH, T3, T4)",
      "Vitamin D & B12",
      "ECG & Cardiac Rhythm",
      "Chest X-Ray Digital",
      "Senior Physician Review",
    ],
  },
  {
    id: "pkg-cardiac",
    name: "Cardiac Health Package",
    description: "Specialized heart health & lipid screening",
    price: 1499,
    duration: "3-4 hours",
    tests: 20,
    popular: false,
    includes: [
      "ECG & Echo Assessment",
      "Lipid Profile Advanced",
      "Cardiac Enzymes",
      "Blood Pressure Monitoring",
      "Cardiologist Consultation",
    ],
  },
  {
    id: "pkg-diabetes",
    name: "Diabetes Screening Panel",
    description: "Complete diabetes risk & metabolic assessment",
    price: 1199,
    duration: "2-3 hours",
    tests: 12,
    popular: false,
    includes: [
      "HbA1c Glycated Hemoglobin",
      "Fasting Blood Sugar",
      "Post Prandial Sugar",
      "Kidney Microalbumin",
      "Lipid Profile",
    ],
  },
];

// GET /api/checkups - list packages
router.get("/", (_req, res) => {
  return res.json({
    success: true,
    packages: checkupPackages,
  });
});

// GET /api/checkups/bookings - patient's booked checkups
router.get("/bookings", authRequired, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patient: req.user._id,
      reason: { $regex: /^Health Checkup:/i },
      status: { $ne: "cancelled" },
    })
      .populate("doctor")
      .sort({ dateTime: 1 });

    const bookings = appointments.map((appt) => ({
      id: appt._id.toString(),
      appointmentId: appt._id.toString(),
      name: appt.reason.replace(/^Health Checkup:\s*/i, ""),
      packageName: appt.reason.replace(/^Health Checkup:\s*/i, ""),
      date: appt.dateTime.toISOString().split("T")[0],
      time: new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(appt.dateTime),
      location: appt.doctor?.doctorProfile?.location || "MEDIrxCARE Diagnostics Wing",
      status: appt.status,
      fee: appt.fee,
      paymentStatus: appt.paymentStatus,
    }));

    return res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Failed to fetch checkup bookings:", error);
    return res.status(500).json({ message: "Failed to fetch checkup bookings." });
  }
});

// POST /api/checkups/book - book a checkup package
router.post("/book", authRequired, async (req, res) => {
  try {
    const { packageId, packageName, selectedDate, selectedSlot, paymentMethod = "upi", notes } = req.body;

    if (!packageName || !selectedDate || !selectedSlot) {
      return res.status(400).json({ message: "Package, date, and slot are required." });
    }

    const matchedPkg = checkupPackages.find(p => p.id === packageId || p.name.toLowerCase() === packageName.toLowerCase());
    const finalName = matchedPkg ? matchedPkg.name : packageName;
    const finalPrice = matchedPkg ? matchedPkg.price : 999;

    // Assign to active doctor or first doctor in system
    let doctor = await User.findOne({ role: "doctor", status: "active" });
    if (!doctor) {
      doctor = await User.findOne({ role: "doctor" });
    }

    if (!doctor) {
      return res.status(503).json({ message: "No clinical staff available to supervise checkup." });
    }

    const appointmentDateTime = createAppointmentDateTime(selectedDate, selectedSlot);

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctor._id,
      reason: `Health Checkup: ${finalName}`,
      type: "offline",
      status: "confirmed",
      fee: finalPrice,
      paymentMethod,
      paymentStatus: "paid",
      dateTime: appointmentDateTime,
      notes: notes || `Checkup: ${finalName}. Arrival time: ${selectedSlot}.`,
    });

    await Notification.create({
      recipient: req.user._id,
      type: "appointment",
      message: `Health Checkup "${finalName}" confirmed for ${selectedDate} at ${selectedSlot}.`,
    });

    return res.status(201).json({
      success: true,
      message: `Successfully booked ${finalName}!`,
      booking: {
        id: appointment._id.toString(),
        appointmentId: appointment._id.toString(),
        name: finalName,
        date: selectedDate,
        time: selectedSlot,
        location: "MEDIrxCARE Diagnostics Wing",
        status: "confirmed",
        fee: finalPrice,
      },
    });
  } catch (error) {
    console.error("Failed to book checkup:", error);
    return res.status(500).json({ message: "Failed to book health checkup." });
  }
});

export default router;
