import express from "express";
import { authRequired } from "../middleware/auth.js";
import { Appointment } from "../models/Appointment.js";
import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";
import { createAppointmentDateTime } from "../utils/helpers.js";

const router = express.Router();

const labTestCatalog = [
  {
    id: "test-cbc",
    name: "Complete Blood Count (CBC)",
    category: "Blood Tests",
    price: 399,
    duration: "6-8 hours",
    preparation: "Fasting not required",
    description: "Comprehensive blood cell analysis including RBC, WBC, hemoglobin, and platelets.",
  },
  {
    id: "test-lipid",
    name: "Lipid Profile",
    category: "Blood Tests",
    price: 549,
    duration: "12 hours",
    preparation: "12 hours fasting required",
    description: "Complete cholesterol screening including HDL, LDL, and triglycerides.",
  },
  {
    id: "test-thyroid",
    name: "Thyroid Function Test (TSH, T3, T4)",
    category: "Blood Tests",
    price: 799,
    duration: "24 hours",
    preparation: "Fasting not required",
    description: "Comprehensive thyroid hormone levels assessment for metabolic evaluation.",
  },
  {
    id: "test-hba1c",
    name: "HbA1c (Glycated Hemoglobin)",
    category: "Blood Tests",
    price: 499,
    duration: "24 hours",
    preparation: "Fasting not required",
    description: "3-month average blood glucose control test for diabetes monitoring.",
  },
  {
    id: "test-xray",
    name: "Chest X-Ray Digital",
    category: "Radiology",
    price: 899,
    duration: "Same day",
    preparation: "No preparation needed",
    description: "High-resolution digital X-ray imaging of chest, lungs, and heart shadow.",
  },
  {
    id: "test-ecg",
    name: "ECG (Electrocardiogram)",
    category: "Cardiac",
    price: 699,
    duration: "Immediate",
    preparation: "No preparation needed",
    description: "Heart electrical activity monitoring and cardiac rhythm analysis.",
  },
  {
    id: "test-ultrasound",
    name: "Ultrasound Abdomen",
    category: "Imaging",
    price: 1299,
    duration: "Same day",
    preparation: "6 hours fasting required",
    description: "High-definition ultrasound imaging of liver, gallbladder, kidneys, and spleen.",
  },
  {
    id: "test-vitd",
    name: "Vitamin D Total (25-OH)",
    category: "Blood Tests",
    price: 949,
    duration: "24-48 hours",
    preparation: "Fasting not required",
    description: "Quantitative 25-hydroxy vitamin D level assessment for bone and immune health.",
  },
];

// GET /api/tests - test catalog
router.get("/", (_req, res) => {
  return res.json({
    success: true,
    tests: labTestCatalog,
  });
});

// GET /api/tests/bookings - patient's lab bookings
router.get("/bookings", authRequired, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patient: req.user._id,
      reason: { $regex: /^Lab Diagnostic:/i },
      status: { $ne: "cancelled" },
    })
      .populate("doctor")
      .sort({ dateTime: 1 });

    const bookings = appointments.map((appt) => ({
      id: appt._id.toString(),
      appointmentId: appt._id.toString(),
      name: appt.reason.replace(/^Lab Diagnostic:\s*/i, ""),
      testName: appt.reason.replace(/^Lab Diagnostic:\s*/i, ""),
      date: appt.dateTime.toISOString().split("T")[0],
      time: new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(appt.dateTime),
      location: appt.notes?.includes("Home Sample Collection") ? "Home Sample Collection" : "Pathology Lab - Floor 2",
      status: appt.status,
      fee: appt.fee,
      paymentStatus: appt.paymentStatus,
    }));

    return res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Failed to fetch lab bookings:", error);
    return res.status(500).json({ message: "Failed to fetch lab bookings." });
  }
});

// POST /api/tests/book - book lab tests
router.post("/book", authRequired, async (req, res) => {
  try {
    const {
      testNames = [],
      tests = [],
      collectionType = "home",
      selectedDate,
      selectedSlot,
      sampleAddress = "",
      paymentMethod = "upi",
    } = req.body;

    const testList = tests.length > 0 ? tests : testNames;
    if (testList.length === 0 || !selectedDate || !selectedSlot) {
      return res.status(400).json({ message: "At least one test, date, and slot are required." });
    }

    const testSummary = Array.isArray(testList) ? testList.join(", ") : String(testList);

    // Calculate total price
    let totalPrice = 0;
    for (const item of testList) {
      const match = labTestCatalog.find((c) => c.name.toLowerCase() === item.toLowerCase() || c.id === item);
      totalPrice += match ? match.price : 499;
    }

    let doctor = await User.findOne({ role: "doctor", status: "active" });
    if (!doctor) {
      doctor = await User.findOne({ role: "doctor" });
    }

    if (!doctor) {
      return res.status(503).json({ message: "No pathology or medical staff available." });
    }

    const appointmentDateTime = createAppointmentDateTime(selectedDate, selectedSlot);
    const modeLabel = collectionType === "home" ? "Home Sample Collection" : "Clinic Visit";
    const addressDetails = collectionType === "home" ? `Address: ${sampleAddress || req.user.patientProfile?.address || "Registered Address"}` : "MEDIrxCARE Pathology Center";

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctor._id,
      reason: `Lab Diagnostic: ${testSummary}`,
      type: "offline",
      status: "confirmed",
      fee: totalPrice,
      paymentMethod,
      paymentStatus: "paid",
      dateTime: appointmentDateTime,
      notes: `${modeLabel}. ${addressDetails}. Slot: ${selectedSlot}.`,
    });

    await Notification.create({
      recipient: req.user._id,
      type: "appointment",
      message: `Diagnostic test booking confirmed (${modeLabel}) for ${selectedDate} at ${selectedSlot}.`,
    });

    return res.status(201).json({
      success: true,
      message: `Diagnostic test booking confirmed!`,
      booking: {
        id: appointment._id.toString(),
        appointmentId: appointment._id.toString(),
        name: testSummary,
        date: selectedDate,
        time: selectedSlot,
        location: modeLabel,
        status: "confirmed",
        fee: totalPrice,
      },
    });
  } catch (error) {
    console.error("Failed to book test:", error);
    return res.status(500).json({ message: "Failed to schedule diagnostic tests." });
  }
});

export default router;
