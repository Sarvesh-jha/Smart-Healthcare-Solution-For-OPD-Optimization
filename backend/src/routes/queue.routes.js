import express from "express";
import { authRequired, requireRole } from "../middleware/auth.js";
import { QueueEntry } from "../models/QueueEntry.js";
import { Appointment } from "../models/Appointment.js";
import { formatDateLabel, formatTimeLabel } from "../utils/helpers.js";

const router = express.Router();

function getDayBounds(dateValue = new Date()) {
  const start = new Date(dateValue);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function isSameDay(left, right) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}

export async function buildQueueStatus(doctorId, options = {}) {
  const { queueDate = new Date(), patientId = null, appointment = null } = options;
  const { start, end } = getDayBounds(queueDate);

  const entries = await QueueEntry.find({
    doctor: doctorId,
    scheduledFor: { $gte: start, $lte: end },
  })
    .populate("patient")
    .sort({ token: 1 });

  const serving = entries.find((entry) => entry.status === "serving");
  const waiting = entries.filter((entry) => entry.status === "waiting");
  const completed = entries.filter((entry) => entry.status === "completed");
  const patientEntry = patientId
    ? entries.find((entry) => entry.patient?._id?.toString() === patientId.toString())
    : null;
  const derivedPatientToken = patientEntry?.token || (appointment ? entries.length + 1 : null);
  const queueIsToday = isSameDay(start, new Date());
  const currentServing = queueIsToday ? serving?.token || completed.at(-1)?.token || 0 : 0;
  const currentPatient = serving
    ? {
        name: serving.patient?.name || "Current Patient",
        token: serving.token,
        reason: serving.reason,
      }
    : null;
  const nextPatient = waiting[0]
    ? {
        name: waiting[0].patient?.name || "Waiting Patient",
        token: waiting[0].token,
        reason: waiting[0].reason,
      }
    : {
        name: "No one waiting",
        token: currentServing + 1,
        reason: "Queue clear",
      };
  const patientsAhead = derivedPatientToken
    ? Math.max(0, derivedPatientToken - (currentServing > 0 ? currentServing : 1))
    : waiting.length;
  const estimatedWaitMinutes = derivedPatientToken ? patientsAhead * 12 : waiting.length * 12;

  return {
    currentServing,
    currentPatient,
    nextPatient,
    totalToday: entries.length,
    completed: completed.length,
    estimatedWaitTime: `${estimatedWaitMinutes} mins`,
    waitingList: waiting.slice(0, 50).map((entry) => ({
      token: entry.token,
      name: entry.patient?.name || "Patient",
      reason: entry.reason,
    })),
    patientToken: derivedPatientToken,
    patientStatus: patientEntry?.status || (appointment ? "waiting" : null),
    patientsAhead,
    queueDate: start.toISOString(),
    queueDateLabel: formatDateLabel(start),
    appointmentDateTime: appointment?.dateTime?.toISOString?.() || null,
    appointmentTime: appointment?.dateTime ? formatTimeLabel(appointment.dateTime) : null,
    appointmentReason: appointment?.reason || patientEntry?.reason || "",
    doctorName: appointment?.doctor?.name || "",
    isToday: queueIsToday,
  };
}

router.get("/status", authRequired, async (req, res) => {
  try {
    let doctorId = req.query.doctorId;
    let patientAppointment = null;

    if (req.user.role === "doctor") {
      doctorId = req.user._id;
    }

    if (req.user.role === "patient") {
      patientAppointment = await Appointment.findOne({
        patient: req.user._id,
        type: "offline",
        status: { $in: ["pending", "confirmed", "ongoing"] },
      })
        .populate("doctor")
        .sort({ dateTime: 1 });
      doctorId = patientAppointment?.doctor?._id || patientAppointment?.doctor;
    }

    if (!doctorId) {
      const servingEntry = await QueueEntry.findOne().sort({ scheduledFor: -1 });
      doctorId = servingEntry?.doctor;
    }

    if (!doctorId) {
      return res.json({
        currentServing: 0,
        currentPatient: null,
        nextPatient: {
          name: "No queue yet",
          token: 1,
          reason: "Waiting for appointments",
        },
        totalToday: 0,
        completed: 0,
        estimatedWaitTime: "0 mins",
        waitingList: [],
        patientToken: null,
        patientStatus: null,
        patientsAhead: 0,
        queueDate: null,
        queueDateLabel: null,
        appointmentDateTime: null,
        appointmentTime: null,
        appointmentReason: "",
        doctorName: "",
        isToday: false,
      });
    }

    const targetDate = req.query.date
      ? new Date(req.query.date)
      : (patientAppointment?.dateTime || new Date());

    return res.json(
      await buildQueueStatus(doctorId, {
        patientId: req.user.role === "patient" ? req.user._id : null,
        queueDate: targetDate,
        appointment: patientAppointment,
      }),
    );
  } catch (error) {
    console.error("Failed to fetch queue status.", error);
    return res.status(500).json({ message: "Failed to fetch queue status." });
  }
});

router.post("/next", authRequired, requireRole("doctor", "admin"), async (req, res) => {
  try {
    const doctorId = req.user.role === "doctor" ? req.user._id : req.body.doctorId;

    const serving = await QueueEntry.findOne({
      doctor: doctorId,
      status: "serving",
    }).sort({ token: 1 });

    if (serving) {
      serving.status = "completed";
      serving.completedAt = new Date();
      await serving.save();
    }

    const nextWaiting = await QueueEntry.findOne({
      doctor: doctorId,
      status: "waiting",
    }).sort({ token: 1 });

    if (nextWaiting) {
      nextWaiting.status = "serving";
      await nextWaiting.save();
    }

    return res.json({
      success: true,
      queue: await buildQueueStatus(doctorId),
    });
  } catch (error) {
    console.error("Failed to advance queue.", error);
    return res.status(500).json({ message: "Failed to advance queue." });
  }
});

export default router;
