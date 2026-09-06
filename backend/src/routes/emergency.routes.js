import express from "express";
import { authRequired, requireRole } from "../middleware/auth.js";
import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";

const router = express.Router();

const emergencyHospitals = [
  {
    id: "blr-main",
    name: "MEDIrxCARE Emergency Hub Bengaluru",
    hotline: "+91 80 4567 1000",
    address: "Indiranagar Emergency Lane, Bengaluru",
    etaMinutes: 9,
    latitude: 12.9716,
    longitude: 77.5946,
    keywords: ["bengaluru", "bangalore", "indiranagar", "koramangala", "whitefield"],
  },
  {
    id: "mum-main",
    name: "MEDIrxCARE Emergency Hub Mumbai",
    hotline: "+91 22 4567 2000",
    address: "Bandra Emergency Response Unit, Mumbai",
    etaMinutes: 11,
    latitude: 19.076,
    longitude: 72.8777,
    keywords: ["mumbai", "bandra", "andheri", "thane"],
  },
  {
    id: "chn-main",
    name: "MEDIrxCARE Emergency Hub Chennai",
    hotline: "+91 44 4567 3000",
    address: "Adyar Trauma Response Center, Chennai",
    etaMinutes: 12,
    latitude: 13.0827,
    longitude: 80.2707,
    keywords: ["chennai", "adyar", "velachery", "anna nagar"],
  },
  {
    id: "del-main",
    name: "MEDIrxCARE Emergency Hub Delhi",
    hotline: "+91 11 4567 4000",
    address: "South Delhi Ambulance Dispatch Center, Delhi",
    etaMinutes: 10,
    latitude: 28.6139,
    longitude: 77.209,
    keywords: ["delhi", "gurgaon", "noida", "dwarka"],
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

  const normalizedAddress = address.toLowerCase();
  const matchedHospital = emergencyHospitals.find((hospital) =>
    hospital.keywords.some((keyword) => normalizedAddress.includes(keyword)),
  );

  return matchedHospital || emergencyHospitals[0];
}

router.post("/alert", authRequired, requireRole("patient"), async (req, res) => {
  try {
    const latitude = Number.isFinite(req.body?.latitude) ? Number(req.body.latitude) : null;
    const longitude = Number.isFinite(req.body?.longitude) ? Number(req.body.longitude) : null;
    const hospital = findNearestHospital({
      latitude,
      longitude,
      address: req.user.patientProfile?.address || "",
    });
    const alertId = `EMG-${Date.now().toString().slice(-6)}`;
    const staffRecipients = await User.find({ role: { $in: ["admin", "doctor"] }, status: "active" }).select("_id");

    const locSnippet = latitude && longitude ? ` (Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)})` : "";
    const notifications = [
      {
        recipient: req.user._id,
        type: "emergency",
        message: `Emergency alert ${alertId} sent to ${hospital.name}. Ambulance response ETA: ${hospital.etaMinutes}-${hospital.etaMinutes + 4} mins.`,
      },
      ...staffRecipients.map((staff) => ({
        recipient: staff._id,
        type: "emergency",
        message: `🚨 Emergency SOS [${alertId}] raised by ${req.user.name}${locSnippet}. Dispatch center: ${hospital.name}.`,
      })),
    ];

    await Notification.insertMany(notifications);

    return res.status(201).json({
      success: true,
      alertId,
      hospital: {
        name: hospital.name,
        hotline: hospital.hotline,
        address: hospital.address,
      },
      eta: `${hospital.etaMinutes}-${hospital.etaMinutes + 4} mins`,
      message: `Emergency alert sent to ${hospital.name}.`,
    });
  } catch (error) {
    console.error("Failed to create emergency alert.", error);
    return res.status(500).json({ message: "Failed to alert the emergency response team." });
  }
});

export default router;
