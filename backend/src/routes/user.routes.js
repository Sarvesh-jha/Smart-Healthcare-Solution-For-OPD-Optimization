import express from "express";
import bcrypt from "bcryptjs";
import { authRequired } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { sanitizeUser } from "../utils/helpers.js";

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

export default router;
