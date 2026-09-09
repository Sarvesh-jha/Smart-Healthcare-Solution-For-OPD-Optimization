import express from "express";
import bcrypt from "bcryptjs";
import { authRequired } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { Appointment } from "../models/Appointment.js";
import { sanitizeUser } from "../utils/helpers.js";
import { handleGetReports } from "./reports.routes.js";

const router = express.Router();

router.get("/profile", authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const [firstName = "", ...rest] = (user.name || "").split(" ");
    const lastName = rest.join(" ");

    return res.json({
      success: true,
      user: {
        ...sanitizeUser(user),
        firstName: firstName || user.name,
        lastName: lastName || "",
        address: user.patientProfile?.address || "",
        age: user.patientProfile?.age || null,
        gender: user.patientProfile?.gender || "",
        bloodGroup: user.patientProfile?.bloodGroup || "",
        patientProfile: user.patientProfile || {},
        doctorProfile: user.doctorProfile || {},
        adminProfile: user.adminProfile || {},
      },
    });
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    return res.status(500).json({ message: "Failed to fetch profile." });
  }
});

router.put("/profile", authRequired, async (req, res) => {
  try {
    const { firstName, lastName, name, email, phone, address, age, gender, bloodGroup } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (name) {
      user.name = name.trim();
    } else if (firstName) {
      user.name = `${firstName.trim()} ${lastName ? lastName.trim() : ""}`.trim();
    }

    if (phone !== undefined) {
      user.phone = phone.trim();
    }

    if (user.role === "patient") {
      if (!user.patientProfile) {
        user.patientProfile = {};
      }
      if (address !== undefined) user.patientProfile.address = address.trim();
      if (age !== undefined && age !== null) user.patientProfile.age = Number(age);
      if (gender !== undefined) user.patientProfile.gender = gender;
      if (bloodGroup !== undefined) user.patientProfile.bloodGroup = bloodGroup;
    }

    await user.save();

    const [updatedFirst = "", ...restUpdated] = (user.name || "").split(" ");
    const updatedLast = restUpdated.join(" ");

    return res.json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        ...sanitizeUser(user),
        firstName: updatedFirst || user.name,
        lastName: updatedLast || "",
        address: user.patientProfile?.address || "",
        age: user.patientProfile?.age || null,
        gender: user.patientProfile?.gender || "",
        bloodGroup: user.patientProfile?.bloodGroup || "",
        patientProfile: user.patientProfile || {},
      },
    });
  } catch (error) {
    console.error("Failed to update user profile:", error);
    return res.status(500).json({ message: "Failed to update profile." });
  }
});

router.put("/password", authRequired, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long." });
    }

    const user = await User.findById(req.user._id).select("+passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return res.status(400).json({ message: "Incorrect current password." });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    console.error("Failed to update password:", error);
    return res.status(500).json({ message: "Failed to update password." });
  }
});

// GET /api/user/payment-methods
router.get("/payment-methods", authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found." });

    return res.json({
      success: true,
      paymentMethods: user.paymentMethods || [],
    });
  } catch (error) {
    console.error("Failed to fetch payment methods:", error);
    return res.status(500).json({ message: "Failed to fetch payment methods." });
  }
});

// GET /api/user/reports
router.get("/reports", authRequired, handleGetReports);

// GET /api/user/prescriptions
router.get("/prescriptions", authRequired, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patient: req.user._id,
      status: { $in: ["confirmed", "completed", "ongoing"] },
    })
      .populate("doctor")
      .sort({ dateTime: -1 });

    const prescriptions = appointments
      .filter((appt) => appt.notes && appt.notes.trim())
      .map((appt) => ({
        id: appt._id.toString(),
        doctor: appt.doctor?.name || "Consultant Physician",
        specialty: appt.doctor?.doctorProfile?.specialization || "General Medicine",
        date: appt.dateTime.toISOString().split("T")[0],
        reason: appt.reason,
        notes: appt.notes,
        status: appt.status,
      }));

    return res.json({
      success: true,
      prescriptions,
    });
  } catch (error) {
    console.error("Failed to fetch user prescriptions:", error);
    return res.status(500).json({ message: "Failed to fetch prescriptions." });
  }
});

// POST /api/user/payment-methods
router.post("/payment-methods", authRequired, async (req, res) => {
  try {
    const { type, cardHolder, cardNumber, brand, expiry, upiId, nickname, isDefault } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (!user.paymentMethods) {
      user.paymentMethods = [];
    }

    let newMethod = {};
    if (type === "upi") {
      if (!upiId || !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId.trim())) {
        return res.status(400).json({ message: "Please provide a valid UPI ID (e.g. user@bank)." });
      }
      newMethod = {
        type: "upi",
        upiId: upiId.trim(),
        nickname: nickname?.trim() || "UPI Handle",
        isDefault: Boolean(isDefault || user.paymentMethods.length === 0),
      };
    } else {
      if (!cardNumber || cardNumber.replace(/\D/g, "").length < 12) {
        return res.status(400).json({ message: "Please provide a valid 16-digit card number." });
      }
      const rawCleanNumber = cardNumber.replace(/\D/g, "");
      const last4 = rawCleanNumber.slice(-4) || "4242";
      const masked = `•••• •••• •••• ${last4}`;

      newMethod = {
        type: "card",
        cardHolder: cardHolder?.trim() || user.name || "Cardholder",
        cardNumber: masked,
        brand: brand || "visa",
        expiry: expiry?.trim() || "12/29",
        nickname: nickname?.trim() || (brand ? `${brand.toUpperCase()} Card` : "Debit/Credit Card"),
        isDefault: Boolean(isDefault || user.paymentMethods.length === 0),
      };
    }

    if (newMethod.isDefault) {
      user.paymentMethods.forEach((m) => {
        m.isDefault = false;
      });
    }

    user.paymentMethods.push(newMethod);
    await user.save();

    const created = user.paymentMethods[user.paymentMethods.length - 1];
    return res.status(201).json({
      success: true,
      message: "Payment method added successfully.",
      paymentMethod: created,
      paymentMethods: user.paymentMethods,
    });
  } catch (error) {
    console.error("Failed to add payment method:", error);
    return res.status(500).json({ message: "Failed to add payment method." });
  }
});

// PATCH /api/user/payment-methods/:id/default
router.patch("/payment-methods/:id/default", authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found." });

    const targetId = req.params.id;
    const method = user.paymentMethods?.find((m) => m._id.toString() === targetId);
    if (!method) {
      return res.status(404).json({ message: "Payment method not found." });
    }

    user.paymentMethods.forEach((m) => {
      m.isDefault = m._id.toString() === targetId;
    });

    await user.save();
    return res.json({
      success: true,
      message: "Default payment method updated successfully.",
      paymentMethods: user.paymentMethods,
    });
  } catch (error) {
    console.error("Failed to set default payment method:", error);
    return res.status(500).json({ message: "Failed to update default payment method." });
  }
});

// DELETE /api/user/payment-methods/:id
router.delete("/payment-methods/:id", authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found." });

    const targetId = req.params.id;
    const methodIndex = user.paymentMethods?.findIndex((m) => m._id.toString() === targetId);
    if (methodIndex === -1 || methodIndex === undefined) {
      return res.status(404).json({ message: "Payment method not found." });
    }

    const wasDefault = user.paymentMethods[methodIndex].isDefault;
    user.paymentMethods.splice(methodIndex, 1);

    if (wasDefault && user.paymentMethods.length > 0) {
      user.paymentMethods[0].isDefault = true;
    }

    await user.save();
    return res.json({
      success: true,
      message: "Payment method removed successfully.",
      paymentMethods: user.paymentMethods,
    });
  } catch (error) {
    console.error("Failed to delete payment method:", error);
    return res.status(500).json({ message: "Failed to delete payment method." });
  }
});

export default router;
