import bcrypt from "bcryptjs";
import express from "express";
import { z } from "zod";
import { authRequired, requireRole } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { getInitials, serializePatient } from "../utils/helpers.js";
import { handleGetReports } from "./reports.routes.js";

const router = express.Router();

router.get("/lab-reports", authRequired, handleGetReports);

const createPatientSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  age: z.union([z.string(), z.number()]),
  gender: z.string().min(1),
  bloodGroup: z.string().min(1),
  address: z.string().min(2),
});

router.get("/", authRequired, requireRole("admin"), async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();
    const filters = {
      role: "patient",
      ...(search
        ? {
            $or: [
              { name: new RegExp(search, "i") },
              { email: new RegExp(search, "i") },
              { phone: new RegExp(search, "i") },
            ],
          }
        : {}),
    };

    const patients = await User.find(filters).sort({ createdAt: -1 });
    return res.json(patients.map(serializePatient));
  } catch (error) {
    console.error("Failed to fetch patients.", error);
    return res.status(500).json({ message: "Failed to fetch patients." });
  }
});

router.post("/", authRequired, requireRole("admin"), async (req, res) => {
  try {
    const parsed = createPatientSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid patient data.", issues: parsed.error.flatten() });
    }

    const { name, email, phone, age, gender, bloodGroup, address } = parsed.data;
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(409).json({ message: "A patient with that email already exists." });
    }

    const temporaryPassword = "Patient@123";
    const patient = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      passwordHash: await bcrypt.hash(temporaryPassword, 10),
      role: "patient",
      avatar: getInitials(name),
      patientProfile: {
        age: Number(age) || 0,
        gender,
        bloodGroup,
        address,
        totalVisits: 0,
      },
    });

    return res.status(201).json({
      patient: serializePatient(patient),
      temporaryPassword,
    });
  } catch (error) {
    console.error("Failed to create patient.", error);
    return res.status(500).json({ message: "Failed to create patient." });
  }
});

export default router;
