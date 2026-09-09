import express from "express";
import { authRequired, requireRole } from "../middleware/auth.js";
import { Appointment } from "../models/Appointment.js";
import { Notification } from "../models/Notification.js";
import { QueueEntry } from "../models/QueueEntry.js";
import { User } from "../models/User.js";
import { formatRelativeTime } from "../utils/helpers.js";

const router = express.Router();

router.get("/patient", authRequired, requireRole("patient"), async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(5);
    const appointments = await Appointment.find({ patient: req.user._id }).sort({ createdAt: -1 }).limit(5).populate("doctor");

    return res.json({
      notifications: notifications.map((item) => ({
        id: item._id.toString(),
        message: item.message,
        time: formatRelativeTime(item.createdAt),
      })),
      recentActivity: appointments.map((appointment) => ({
        id: appointment._id.toString(),
        title: appointment.status === "completed" ? "Appointment Completed" : "Appointment Scheduled",
        description: `${appointment.doctor?.name || "Doctor"} • ${appointment.reason}`,
        time: formatRelativeTime(appointment.createdAt),
        type: appointment.status,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch patient dashboard.", error);
    return res.status(500).json({ message: "Failed to fetch patient dashboard." });
  }
});

router.get("/doctor", authRequired, requireRole("doctor"), async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const targetDate = req.query.date ? new Date(req.query.date) : now;
    const targetStart = new Date(targetDate);
    targetStart.setHours(0, 0, 0, 0);
    const targetEnd = new Date(targetDate);
    targetEnd.setHours(23, 59, 59, 999);

    const [todaysAppointments, targetDateAppointments, upcomingAppointments, completedConsultations, waitingPatients] = await Promise.all([
      Appointment.countDocuments({
        doctor: req.user._id,
        dateTime: { $gte: todayStart, $lte: todayEnd },
        status: { $ne: "cancelled" },
      }),
      Appointment.countDocuments({
        doctor: req.user._id,
        dateTime: { $gte: targetStart, $lte: targetEnd },
        status: { $ne: "cancelled" },
      }),
      Appointment.countDocuments({
        doctor: req.user._id,
        dateTime: { $gte: todayStart },
        status: { $ne: "cancelled" },
      }),
      Appointment.countDocuments({
        doctor: req.user._id,
        status: "completed",
      }),
      QueueEntry.countDocuments({
        doctor: req.user._id,
        status: "waiting",
      }),
    ]);

    return res.json({
      todaysAppointments,
      selectedDateAppointments: targetDateAppointments,
      upcomingAppointments,
      totalUpcoming: upcomingAppointments,
      completedConsultations,
      waitingPatients,
      avgConsultationTime: 18,
    });
  } catch (error) {
    console.error("Failed to fetch doctor dashboard.", error);
    return res.status(500).json({ message: "Failed to fetch doctor dashboard." });
  }
});

router.get("/admin", authRequired, requireRole("admin"), async (req, res) => {
  try {
    const [totalPatients, activeDoctors, pendingAppointments] = await Promise.all([
      User.countDocuments({ role: "patient" }),
      User.countDocuments({ role: "doctor", status: "active" }),
      Appointment.countDocuments({ status: { $in: ["pending", "confirmed"] } }),
    ]);

    return res.json({
      totalPatients,
      activeDoctors,
      pendingAppointments,
      systemHealth: "Healthy",
    });
  } catch (error) {
    console.error("Failed to fetch admin dashboard.", error);
    return res.status(500).json({ message: "Failed to fetch admin dashboard." });
  }
});

router.get("/admin/payments", authRequired, requireRole("admin"), async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate("patient doctor")
      .sort({ createdAt: -1 });

    let totalRevenue = 0;
    let completedCount = 0;
    let pendingCount = 0;
    let failedCount = 0;

    const methodMap = {
      upi: "Instant UPI",
      card: "Credit / Debit Card",
      wallet: "Digital Wallet",
      netbanking: "Net Banking",
    };

    const transactions = appointments.map((appt) => {
      const amount = appt.fee || 0;
      const isPaid = appt.paymentStatus === "paid" || appt.status === "completed";
      const isPending = appt.paymentStatus === "pending" || appt.status === "pending";

      if (isPaid) {
        totalRevenue += amount;
        completedCount++;
      } else if (isPending) {
        pendingCount++;
      } else {
        failedCount++;
      }

      return {
        id: `TXN${appt._id.toString().slice(-6).toUpperCase()}`,
        appointmentId: appt._id.toString(),
        patient: appt.patient?.name || "Patient",
        doctor: appt.doctor?.name || "Doctor",
        amount,
        status: isPaid ? "completed" : isPending ? "pending" : "failed",
        date: appt.dateTime ? appt.dateTime.toISOString().replace("T", " ").slice(0, 16) : new Date().toISOString().replace("T", " ").slice(0, 16),
        method: methodMap[appt.paymentMethod] || "Instant UPI",
      };
    });

    return res.json({
      success: true,
      stats: {
        totalRevenue,
        completedCount,
        pendingCount,
        failedCount,
      },
      transactions,
    });
  } catch (error) {
    console.error("Failed to fetch admin payments:", error);
    return res.status(500).json({ message: "Failed to fetch admin payments." });
  }
});

router.get("/admin/analytics", authRequired, requireRole("admin"), async (req, res) => {
  try {
    const [totalPatients, activeDoctors, allAppointments] = await Promise.all([
      User.countDocuments({ role: "patient" }),
      User.countDocuments({ role: "doctor", status: "active" }),
      Appointment.find({}).populate("doctor"),
    ]);

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayCounts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    const departmentCounts = {};
    let totalRevenue = 0;

    allAppointments.forEach((appt) => {
      const day = dayNames[new Date(appt.dateTime).getDay()];
      if (dayCounts[day] !== undefined) dayCounts[day]++;

      const dept = appt.doctor?.doctorProfile?.specialization || "General Medicine";
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;

      if (appt.paymentStatus === "paid" || appt.status === "completed") {
        totalRevenue += appt.fee || 0;
      }
    });

    const appointmentData = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((name) => ({
      name,
      count: dayCounts[name] || 0,
    }));

    const departmentData = Object.entries(departmentCounts).map(([name, patients]) => ({
      name,
      patients,
    }));

    return res.json({
      success: true,
      quickStats: {
        totalPatients,
        activeDoctors,
        totalAppointments: allAppointments.length,
        totalRevenue,
      },
      appointmentData,
      departmentData,
    });
  } catch (error) {
    console.error("Failed to fetch admin analytics:", error);
    return res.status(500).json({ message: "Failed to fetch admin analytics." });
  }
});

export default router;
