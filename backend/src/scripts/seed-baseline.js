import bcrypt from "bcryptjs";
import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { User } from "../models/User.js";
import { getInitials } from "../utils/helpers.js";

async function run() {
  try {
    console.log("Starting MEDIrxCARE baseline production bootstrap...");
    await connectDatabase();

    // 1. Ensure System Administrator exists
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL || "admin@medirxcare.in";
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || "Admin@123";

    let admin = await User.findOne({ email: adminEmail.toLowerCase() });
    if (!admin) {
      console.log(`Creating baseline administrator: ${adminEmail}`);
      admin = await User.create({
        name: "Hospital Administrator",
        email: adminEmail.toLowerCase(),
        phone: "+91 98765 00000",
        passwordHash: await bcrypt.hash(adminPassword, 10),
        role: "admin",
        avatar: "HA",
        status: "active",
        adminProfile: {
          title: "System Operations Director",
          organizationName: "MEDIrxCARE Healthcare Network",
        },
      });
      console.log(`Administrator created successfully. Initial credentials: ${adminEmail}`);
    } else {
      console.log(`Administrator account ${adminEmail} already exists.`);
    }

    // 2. Baseline Clinical Specialists (Ensures OPD catalogue is ready for patient booking)
    const baselineDoctors = [
      {
        name: "Dr. Aarav Mehta",
        email: "aarav.mehta@medirxcare.in",
        phone: "+91 98765 41001",
        role: "doctor",
        avatar: "AM",
        status: "active",
        doctorProfile: {
          specialization: "Cardiology",
          experienceYears: 14,
          location: "Cardiology Block, Floor 3",
          availability: "Mon-Sat, 9:30 AM - 5:30 PM",
          onlineFee: 499,
          offlineFee: 799,
          rating: 4.9,
          reviews: 245,
          patientsCount: 0,
          nextAvailable: "Today, 4:30 PM",
          bio: "Senior Cardiologist specialized in preventive cardiology, heart failure, and lifestyle risk management.",
          licenseNumber: "MCI-DL-7829",
        },
      },
      {
        name: "Dr. Kavya Iyer",
        email: "kavya.iyer@medirxcare.in",
        phone: "+91 98765 41002",
        role: "doctor",
        avatar: "KI",
        status: "active",
        doctorProfile: {
          specialization: "General Physician",
          experienceYears: 11,
          location: "Primary Care Wing, Floor 2",
          availability: "Mon-Sat, 10:00 AM - 6:00 PM",
          onlineFee: 399,
          offlineFee: 599,
          rating: 4.8,
          reviews: 198,
          patientsCount: 0,
          nextAvailable: "Today, 3:00 PM",
          bio: "Consultant Physician focused on adult medicine, acute infections, and chronic disease management.",
          licenseNumber: "MCI-MH-4421",
        },
      },
      {
        name: "Dr. Rahul Bansal",
        email: "rahul.bansal@medirxcare.in",
        phone: "+91 98765 41003",
        role: "doctor",
        avatar: "RB",
        status: "active",
        doctorProfile: {
          specialization: "Neurology",
          experienceYears: 16,
          location: "Neuroscience Institute, Floor 4",
          availability: "Mon-Fri, 10:30 AM - 5:00 PM",
          onlineFee: 599,
          offlineFee: 899,
          rating: 4.9,
          reviews: 312,
          patientsCount: 0,
          nextAvailable: "Tomorrow, 11:00 AM",
          bio: "Senior Neurologist specializing in headache disorders, neurovascular disease, and epilepsy.",
          licenseNumber: "MCI-KA-9902",
        },
      },
      {
        name: "Dr. Meera Kapoor",
        email: "meera.kapoor@medirxcare.in",
        phone: "+91 98765 41004",
        role: "doctor",
        avatar: "MK",
        status: "active",
        doctorProfile: {
          specialization: "Dermatology",
          experienceYears: 9,
          location: "Dermatology & Skin Clinic, Floor 1",
          availability: "Tue-Sun, 11:00 AM - 7:00 PM",
          onlineFee: 449,
          offlineFee: 699,
          rating: 4.7,
          reviews: 167,
          patientsCount: 0,
          nextAvailable: "Today, 5:30 PM",
          bio: "Clinical Dermatologist focusing on autoimmune skin disorders, allergies, and laser therapeutics.",
          licenseNumber: "MCI-TN-3310",
        },
      },
      {
        name: "Dr. Nisha Menon",
        email: "nisha.menon@medirxcare.in",
        phone: "+91 98765 41005",
        role: "doctor",
        avatar: "NM",
        status: "active",
        doctorProfile: {
          specialization: "Pediatrics",
          experienceYears: 13,
          location: "Child Wellness Center, Floor 2",
          availability: "Mon-Sat, 9:00 AM - 4:00 PM",
          onlineFee: 399,
          offlineFee: 599,
          rating: 4.9,
          reviews: 284,
          patientsCount: 0,
          nextAvailable: "Tomorrow, 10:00 AM",
          bio: "Senior Pediatrician specializing in neonatology, pediatric development, and vaccination schedules.",
          licenseNumber: "MCI-KL-6518",
        },
      },
    ];

    for (const docData of baselineDoctors) {
      const existing = await User.findOne({ email: docData.email.toLowerCase() });
      if (!existing) {
        const tempPass = "Doctor@123";
        await User.create({
          ...docData,
          passwordHash: await bcrypt.hash(tempPass, 10),
        });
        console.log(`Seeded baseline doctor: ${docData.name} (${docData.doctorProfile.specialization})`);
      }
    }

    console.log("Baseline production seeding finished successfully.");
    console.log("Patient transactional tables remain completely clean (0 patient records, 0 appointments, 0 tokens).");
  } catch (error) {
    console.error("Baseline seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
  }
}

run();
