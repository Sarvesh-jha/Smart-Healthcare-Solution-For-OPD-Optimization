import express from "express";
import { authRequired, optionalAuth } from "../middleware/auth.js";
import { getIO } from "../config/socket.js";
import { Emergency } from "../models/Emergency.js";
import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";

const router = express.Router();

const emergencyHospitals = [
  {
    id: "blr-main",
    name: "MEDIrxCARE Emergency Hub Bengaluru",
    hotline: "+91 80 4567 1000",
    address: "Indiranagar Emergency Lane, Bengaluru",
    etaMinutes: 8,
    latitude: 12.9716,
    longitude: 77.5946,
    keywords: ["bengaluru", "bangalore", "indiranagar", "koramangala", "whitefield", "karnataka"],
  },
  {
    id: "mum-main",
    name: "MEDIrxCARE Emergency Hub Mumbai",
    hotline: "+91 22 4567 2000",
    address: "Bandra Emergency Response Unit, Mumbai",
    etaMinutes: 10,
    latitude: 19.076,
    longitude: 72.8777,
    keywords: ["mumbai", "bandra", "andheri", "thane", "maharashtra"],
  },
  {
    id: "chn-main",
    name: "MEDIrxCARE Emergency Hub Chennai",
    hotline: "+91 44 4567 3000",
    address: "Adyar Trauma Response Center, Chennai",
    etaMinutes: 11,
    latitude: 13.0827,
    longitude: 80.2707,
    keywords: ["chennai", "adyar", "velachery", "anna nagar", "tamil nadu"],
  },
  {
    id: "del-main",
    name: "MEDIrxCARE Emergency Hub Delhi",
    hotline: "+91 11 4567 4000",
    address: "South Delhi Ambulance Dispatch Center, Delhi",
    etaMinutes: 9,
    latitude: 28.6139,
    longitude: 77.209,
    keywords: ["delhi", "gurgaon", "noida", "dwarka", "ncr"],
  },
];

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function getDistanceInKm(first, second) {
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(second.latitude - first.latitude);
  const deltaLng = toRadians(second.longitude - first.longitude);
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(toRadians(first.latitude)) *
      Math.cos(toRadians(second.latitude)) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findNearestHospital({ latitude, longitude, address = "" }) {
  const location =
    typeof latitude === "number" && typeof longitude === "number" ? { latitude, longitude } : null;

  if (location) {
    return [...emergencyHospitals].sort((left, right) => getDistanceInKm(location, left) - getDistanceInKm(location, right))[0];
  }

  const normalizedAddress = String(address || "").toLowerCase();
  const matchedHospital = emergencyHospitals.find((hospital) =>
    hospital.keywords.some((keyword) => normalizedAddress.includes(keyword)),
  );

  return matchedHospital || emergencyHospitals[0];
}

export async function handleTriggerEmergency(req, res) {
  try {
    const user = req.user;
    const body = req.body || {};

    const patientId = body.patientId || user?._id;
    const patientName = body.patientName || user?.name || "Emergency Patient";
    const contactNumber = body.contactNumber || body.contact || user?.phone || "+91 98765 00000";

    let locationDetails = body.location;
    let latitude = null;
    let longitude = null;
    let address = "";

    if (locationDetails && typeof locationDetails === "object") {
      if (Number.isFinite(locationDetails.latitude) && Number.isFinite(locationDetails.longitude)) {
        latitude = Number(locationDetails.latitude);
        longitude = Number(locationDetails.longitude);
        address = locationDetails.address || `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      } else {
        address = locationDetails.address || JSON.stringify(locationDetails);
      }
    } else if (typeof locationDetails === "string" && locationDetails.trim()) {
      address = locationDetails.trim();
    } else {
      address = user?.patientProfile?.address || "Registered Home Address";
      locationDetails = address;
    }

    if (!latitude && Number.isFinite(body.latitude)) {
      latitude = Number(body.latitude);
    }
    if (!longitude && Number.isFinite(body.longitude)) {
      longitude = Number(body.longitude);
    }

    const hospital = findNearestHospital({
      latitude,
      longitude,
      address,
    });

    const emergencyRecord = await Emergency.create({
      patientId: patientId || null,
      patientName,
      contact: contactNumber,
      contactNumber,
      location: address || locationDetails,
      status: "PENDING_RESPONSE",
      hospital: {
        name: hospital.name,
        hotline: hospital.hotline,
        address: hospital.address,
        eta: `${hospital.etaMinutes}-${hospital.etaMinutes + 4} mins`,
      },
      createdAt: new Date(),
    });

    // Real-time broadcast to Admin channel and global
    const io = getIO();
    if (io) {
      io.to("admin_channel").emit("emergency:incoming_alert", emergencyRecord);
      io.emit("emergency:incoming_alert", emergencyRecord);
    }

    // Persist notification for hospital staff
    try {
      const staffRecipients = await User.find({ role: { $in: ["admin", "doctor"] }, status: "active" }).select("_id");
      const locSnippet = address ? ` at ${address}` : "";
      const notifications = staffRecipients.map((staff) => ({
        recipient: staff._id,
        type: "emergency",
        message: `🚨 CRITICAL SOS ALERT: Emergency triggered by ${patientName} (${contactNumber})${locSnippet}. Dispatch center: ${hospital.name}.`,
      }));

      if (patientId) {
        notifications.push({
          recipient: patientId,
          type: "emergency",
          message: `Emergency SOS confirmed. Dispatched to ${hospital.name}. Ambulance ETA: ${hospital.etaMinutes}-${hospital.etaMinutes + 4} mins. Hotline: ${hospital.hotline}`,
        });
      }

      await Notification.insertMany(notifications);
    } catch (notifErr) {
      console.warn("Failed to generate notifications for emergency:", notifErr);
    }

    return res.status(201).json({
      success: true,
      alertId: emergencyRecord._id.toString(),
      emergency: emergencyRecord,
      hospital: emergencyRecord.hospital,
      eta: emergencyRecord.hospital.eta,
      message: `Emergency alert sent to ${hospital.name}. Ambulance dispatched.`,
    });
  } catch (error) {
    console.error("Failed to trigger emergency:", error);
    return res.status(500).json({ message: "Failed to alert the emergency response team." });
  }
}

// POST /api/emergency/trigger
router.post("/trigger", optionalAuth, handleTriggerEmergency);

// POST /api/emergency/alert (backward compatibility)
router.post("/alert", optionalAuth, handleTriggerEmergency);

// GET /api/emergency/incidents (all active and historical incidents)
router.get("/incidents", authRequired, async (_req, res) => {
  try {
    const incidents = await Emergency.find().sort({ createdAt: -1 }).limit(50);
    return res.json({
      success: true,
      incidents,
    });
  } catch (error) {
    console.error("Failed to fetch emergency incidents:", error);
    return res.status(500).json({ message: "Failed to fetch incidents." });
  }
});

// GET /api/emergency (alias)
router.get("/", authRequired, async (_req, res) => {
  try {
    const incidents = await Emergency.find().sort({ createdAt: -1 }).limit(50);
    return res.json({
      success: true,
      incidents,
    });
  } catch (error) {
    console.error("Failed to fetch emergency incidents:", error);
    return res.status(500).json({ message: "Failed to fetch incidents." });
  }
});

// PATCH /api/emergency/:id/acknowledge
router.patch("/:id/acknowledge", authRequired, async (req, res) => {
  try {
    const incident = await Emergency.findByIdAndUpdate(
      req.params.id,
      {
        status: "Acknowledged",
        acknowledgedAt: new Date(),
        ...(req.body.notes ? { responderNotes: req.body.notes } : {}),
      },
      { new: true }
    );

    if (!incident) {
      return res.status(404).json({ message: "Emergency incident not found." });
    }

    const io = getIO();
    if (io) {
      io.to("admin_channel").emit("emergency:updated", incident);
      io.emit("emergency:updated", incident);
    }

    return res.json({
      success: true,
      emergency: incident,
    });
  } catch (error) {
    console.error("Failed to acknowledge emergency:", error);
    return res.status(500).json({ message: "Failed to acknowledge emergency." });
  }
});

// PATCH /api/emergency/:id/dispatch
router.patch("/:id/dispatch", authRequired, async (req, res) => {
  try {
    const incident = await Emergency.findByIdAndUpdate(
      req.params.id,
      {
        status: "Dispatched",
        dispatchedAt: new Date(),
        acknowledgedAt: new Date(),
        ...(req.body.notes ? { responderNotes: req.body.notes } : {}),
      },
      { new: true }
    );

    if (!incident) {
      return res.status(404).json({ message: "Emergency incident not found." });
    }

    const io = getIO();
    if (io) {
      io.to("admin_channel").emit("emergency:updated", incident);
      io.emit("emergency:updated", incident);
    }

    return res.json({
      success: true,
      emergency: incident,
    });
  } catch (error) {
    console.error("Failed to dispatch emergency:", error);
    return res.status(500).json({ message: "Failed to dispatch emergency." });
  }
});

// PATCH /api/emergency/:id/resolve
router.patch("/:id/resolve", authRequired, async (req, res) => {
  try {
    const incident = await Emergency.findByIdAndUpdate(
      req.params.id,
      {
        status: "Resolved",
        resolvedAt: new Date(),
        ...(req.body.notes ? { responderNotes: req.body.notes } : {}),
      },
      { new: true }
    );

    if (!incident) {
      return res.status(404).json({ message: "Emergency incident not found." });
    }

    const io = getIO();
    if (io) {
      io.to("admin_channel").emit("emergency:updated", incident);
      io.emit("emergency:updated", incident);
    }

    return res.json({
      success: true,
      emergency: incident,
    });
  } catch (error) {
    console.error("Failed to resolve emergency:", error);
    return res.status(500).json({ message: "Failed to resolve emergency." });
  }
});

export default router;
