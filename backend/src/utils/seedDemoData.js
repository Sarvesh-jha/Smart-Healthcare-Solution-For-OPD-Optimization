import bcrypt from "bcryptjs";
import { Appointment } from "../models/Appointment.js";
import { Emergency } from "../models/Emergency.js";
import { Notification } from "../models/Notification.js";
import { QueueEntry } from "../models/QueueEntry.js";
import { Report } from "../models/Report.js";
import { User } from "../models/User.js";
import { createAppointmentDateTime, getInitials } from "./helpers.js";

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function migrateLegacyDemoUser(legacyEmail, nextState) {
  const legacyUser = await User.findOne({ email: legacyEmail });

  if (!legacyUser) {
    return null;
  }

  const emailConflict =
    nextState.email && nextState.email !== legacyEmail
      ? await User.findOne({ email: nextState.email, _id: { $ne: legacyUser._id } })
      : null;

  const update = {
    name: nextState.name,
    phone: nextState.phone,
    avatar: getInitials(nextState.name),
    ...(emailConflict ? {} : { email: nextState.email }),
    ...(nextState.adminProfile ? { adminProfile: nextState.adminProfile } : {}),
    ...(nextState.doctorProfile ? { doctorProfile: nextState.doctorProfile } : {}),
    ...(nextState.patientProfile ? { patientProfile: nextState.patientProfile } : {}),
  };

  await User.updateOne({ _id: legacyUser._id }, { $set: update });
  return User.findById(legacyUser._id);
}

async function migrateLegacyDemoUsers() {
  await migrateLegacyDemoUser("admin@medisense.ai", {
    name: "Aditi Sharma",
    email: "admin@medirxcare.in",
    phone: "+91 98765 40000",
    adminProfile: {
      title: "Operations Lead",
      organizationName: "MEDIrxCARE Hospitals",
    },
  });

  await migrateLegacyDemoUser("sarah.miller@medisense.ai", {
    name: "Dr. Aarav Mehta",
    email: "aarav.mehta@medirxcare.in",
    phone: "+91 98765 41001",
    doctorProfile: {
      specialization: "Cardiology",
      experienceYears: 14,
      location: "Heart Care Block, Level 3",
      availability: "Mon-Sat, 9:30 AM - 5:30 PM",
      onlineFee: 499,
      offlineFee: 799,
      rating: 4.9,
      reviews: 245,
      patientsCount: 847,
      nextAvailable: "Today, 4:30 PM",
      bio: "Cardiologist focused on preventive care, diagnostics, and long-term heart health.",
      licenseNumber: "MCI-DL-7829",
    },
  });

  await migrateLegacyDemoUser("michael.chen@medisense.ai", {
    name: "Dr. Kavya Iyer",
    email: "kavya.iyer@medirxcare.in",
    phone: "+91 98765 41002",
    doctorProfile: {
      specialization: "General Physician",
      experienceYears: 11,
      location: "Primary Care Wing, Level 2",
      availability: "Mon-Sat, 10:00 AM - 6:00 PM",
      onlineFee: 399,
      offlineFee: 649,
      rating: 4.8,
      reviews: 320,
      patientsCount: 623,
      nextAvailable: "Tomorrow, 10:30 AM",
      bio: "General physician supporting everyday acute care, chronic follow-up, and preventive medicine.",
      licenseNumber: "MCI-TN-2381",
    },
  });

  await migrateLegacyDemoUser("john.doe@example.com", {
    name: "Rohan Verma",
    email: "rohan.verma@example.com",
    phone: "+91 98765 42001",
    patientProfile: {
      age: 42,
      gender: "Male",
      bloodGroup: "O+",
      address: "Indiranagar, Bengaluru, Karnataka",
      totalVisits: 12,
      lastVisit: addDays(-20),
    },
  });

  await migrateLegacyDemoUser("emma.wilson@example.com", {
    name: "Ananya Patel",
    email: "ananya.patel@example.com",
    phone: "+91 98765 42002",
    patientProfile: {
      age: 31,
      gender: "Female",
      bloodGroup: "A+",
      address: "Bandra West, Mumbai, Maharashtra",
      totalVisits: 8,
      lastVisit: addDays(-18),
    },
  });
}

async function reconcileCurrentDemoUsers() {
  await User.updateOne(
    { email: "aarav.mehta@medirxcare.in" },
    {
      $set: {
        phone: "+91 98765 41001",
        doctorProfile: {
          specialization: "Cardiology",
          experienceYears: 14,
          location: "Heart Care Block, Level 3",
          availability: "Mon-Sat, 9:30 AM - 5:30 PM",
          onlineFee: 499,
          offlineFee: 799,
          rating: 4.9,
          reviews: 245,
          patientsCount: 847,
          nextAvailable: "Today, 4:30 PM",
          bio: "Cardiologist focused on preventive care, diagnostics, and long-term heart health.",
          licenseNumber: "MCI-DL-7829",
        },
      },
    },
  );

  await User.updateOne(
    { email: "kavya.iyer@medirxcare.in" },
    {
      $set: {
        phone: "+91 98765 41002",
        doctorProfile: {
          specialization: "General Physician",
          experienceYears: 11,
          location: "Primary Care Wing, Level 2",
          availability: "Mon-Sat, 10:00 AM - 6:00 PM",
          onlineFee: 399,
          offlineFee: 649,
          rating: 4.8,
          reviews: 320,
          patientsCount: 623,
          nextAvailable: "Tomorrow, 10:30 AM",
          bio: "General physician supporting everyday acute care, chronic follow-up, and preventive medicine.",
          licenseNumber: "MCI-TN-2381",
        },
      },
    },
  );
}

async function upsertUser(userData, defaultPassword = "Password123!") {
  const email = userData.email.toLowerCase().trim();
  let user = await User.findOne({ email });

  if (!user) {
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    user = await User.create({
      ...userData,
      email,
      passwordHash,
      avatar: userData.avatar || getInitials(userData.name),
      status: userData.status || "active",
    });
    return user;
  }

  const updates = {};
  if (userData.doctorProfile) {
    updates.doctorProfile = { ...user.doctorProfile?.toObject(), ...userData.doctorProfile };
  }
  if (userData.adminProfile) {
    updates.adminProfile = { ...user.adminProfile?.toObject(), ...userData.adminProfile };
  }
  if (userData.patientProfile) {
    updates.patientProfile = { ...user.patientProfile?.toObject(), ...userData.patientProfile };
  }
  if (userData.name) updates.name = userData.name;
  if (userData.phone && !user.phone) updates.phone = userData.phone;
  if (userData.role) updates.role = userData.role;
  if (!user.avatar) updates.avatar = userData.avatar || getInitials(userData.name);
  if (userData.status) updates.status = userData.status;

  if (Object.keys(updates).length > 0) {
    await User.updateOne({ _id: user._id }, { $set: updates });
    user = await User.findById(user._id);
  }

  return user;
}

export async function seedDemoData() {
  await migrateLegacyDemoUsers();
  await reconcileCurrentDemoUsers();

  // 1. Base Administrator
  const admin = await upsertUser({
    name: "Aditi Sharma",
    email: "admin@medirxcare.in",
    phone: "+91 98765 40000",
    role: "admin",
    avatar: "AS",
    adminProfile: {
      title: "Operations Lead",
      organizationName: "MEDIrxCARE Hospitals",
    },
  });

  // 2. Base Clinical Departments & Doctors
  const baselineDoctors = [
    {
      name: "Dr. Aarav Mehta",
      email: "aarav.mehta@medirxcare.in",
      phone: "+91 98765 41001",
      role: "doctor",
      avatar: "AM",
      doctorProfile: {
        specialization: "Cardiology",
        experienceYears: 14,
        location: "Heart Care Block, Level 3",
        availability: "Mon-Sat, 9:30 AM - 5:30 PM",
        onlineFee: 499,
        offlineFee: 799,
        rating: 4.9,
        reviews: 245,
        patientsCount: 847,
        nextAvailable: "Today, 4:30 PM",
        bio: "Cardiologist focused on preventive care, diagnostics, and long-term heart health.",
        licenseNumber: "MCI-DL-7829",
      },
    },
    {
      name: "Dr. Kavya Iyer",
      email: "kavya.iyer@medirxcare.in",
      phone: "+91 98765 41002",
      role: "doctor",
      avatar: "KI",
      doctorProfile: {
        specialization: "General Physician",
        experienceYears: 11,
        location: "Primary Care Wing, Level 2",
        availability: "Mon-Sat, 10:00 AM - 6:00 PM",
        onlineFee: 399,
        offlineFee: 649,
        rating: 4.8,
        reviews: 320,
        patientsCount: 623,
        nextAvailable: "Tomorrow, 10:30 AM",
        bio: "General physician supporting everyday acute care, chronic follow-up, and preventive medicine.",
        licenseNumber: "MCI-TN-2381",
      },
    },
    {
      name: "Dr. Rahul Bansal",
      email: "rahul.bansal@medirxcare.in",
      phone: "+91 98765 41003",
      role: "doctor",
      avatar: "RB",
      doctorProfile: {
        specialization: "Neurology",
        experienceYears: 16,
        location: "Neuroscience Institute, Floor 4",
        availability: "Mon-Fri, 10:30 AM - 5:00 PM",
        onlineFee: 599,
        offlineFee: 899,
        rating: 4.9,
        reviews: 312,
        patientsCount: 450,
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
      doctorProfile: {
        specialization: "Dermatology",
        experienceYears: 9,
        location: "Dermatology & Skin Clinic, Floor 1",
        availability: "Tue-Sun, 11:00 AM - 7:00 PM",
        onlineFee: 449,
        offlineFee: 699,
        rating: 4.7,
        reviews: 167,
        patientsCount: 380,
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
      doctorProfile: {
        specialization: "Pediatrics",
        experienceYears: 13,
        location: "Child Wellness Center, Floor 2",
        availability: "Mon-Sat, 9:00 AM - 4:00 PM",
        onlineFee: 399,
        offlineFee: 599,
        rating: 4.9,
        reviews: 284,
        patientsCount: 512,
        nextAvailable: "Tomorrow, 10:00 AM",
        bio: "Senior Pediatrician specializing in neonatology, pediatric development, and vaccination schedules.",
        licenseNumber: "MCI-KL-6518",
      },
    },
  ];

  const seededDoctors = [];
  for (const docData of baselineDoctors) {
    const doc = await upsertUser(docData);
    seededDoctors.push(doc);
  }

  // 3. Base Patients
  const rohan = await upsertUser({
    name: "Rohan Verma",
    email: "rohan.verma@example.com",
    phone: "+91 98765 42001",
    role: "patient",
    avatar: "RV",
    patientProfile: {
      age: 42,
      gender: "Male",
      bloodGroup: "O+",
      address: "Indiranagar, Bengaluru, Karnataka",
      totalVisits: 12,
      lastVisit: addDays(-20),
    },
  });

  const ananya = await upsertUser({
    name: "Ananya Patel",
    email: "ananya.patel@example.com",
    phone: "+91 98765 42002",
    role: "patient",
    avatar: "AP",
    patientProfile: {
      age: 31,
      gender: "Female",
      bloodGroup: "A+",
      address: "Bandra West, Mumbai, Maharashtra",
      totalVisits: 8,
      lastVisit: addDays(-18),
    },
  });

  const aaravDoctor = seededDoctors[0];
  const kavyaDoctor = seededDoctors[1];

  // 4. Base Appointments (Idempotent: seed if collection is empty)
  const appointmentCount = await Appointment.countDocuments();
  if (appointmentCount === 0 && rohan && ananya && aaravDoctor && kavyaDoctor) {
    await Appointment.insertMany([
      {
        patient: rohan._id,
        doctor: aaravDoctor._id,
        reason: "Heart Health Follow-up",
        type: "online",
        status: "confirmed",
        fee: aaravDoctor.doctorProfile.onlineFee,
        dateTime: createAppointmentDateTime(addDays(1), "10:30 AM"),
      },
      {
        patient: rohan._id,
        doctor: kavyaDoctor._id,
        reason: "General Wellness Check",
        type: "offline",
        status: "pending",
        fee: kavyaDoctor.doctorProfile.offlineFee,
        dateTime: createAppointmentDateTime(addDays(3), "02:00 PM"),
      },
      {
        patient: ananya._id,
        doctor: aaravDoctor._id,
        reason: "Cardiac Review",
        type: "offline",
        status: "completed",
        fee: aaravDoctor.doctorProfile.offlineFee,
        dateTime: createAppointmentDateTime(new Date(), "09:30 AM"),
      },
    ]);
  }

  // 5. Base Queue Entries (Idempotent)
  const queueCount = await QueueEntry.countDocuments();
  if (queueCount === 0 && rohan && ananya && aaravDoctor) {
    await QueueEntry.insertMany([
      {
        doctor: aaravDoctor._id,
        patient: rohan._id,
        token: 25,
        reason: "Heart Health Follow-up",
        scheduledFor: new Date(),
        status: "waiting",
      },
      {
        doctor: aaravDoctor._id,
        patient: ananya._id,
        token: 24,
        reason: "Cardiac Review",
        scheduledFor: new Date(),
        status: "serving",
      },
      {
        doctor: aaravDoctor._id,
        patient: rohan._id,
        token: 23,
        reason: "Vitals Check",
        scheduledFor: new Date(),
        status: "completed",
        completedAt: new Date(),
      },
    ]);
  }

  // 6. Base Notifications (Idempotent)
  const notificationCount = await Notification.countDocuments();
  if (notificationCount === 0 && rohan && aaravDoctor && admin) {
    await Notification.insertMany([
      {
        recipient: rohan._id,
        message: "Take your morning medicine after breakfast.",
        type: "medication",
        createdAt: addDays(-1),
        updatedAt: addDays(-1),
      },
      {
        recipient: rohan._id,
        message: "Your latest lab report is ready to review.",
        type: "report",
        createdAt: addDays(-2),
        updatedAt: addDays(-2),
      },
      {
        recipient: aaravDoctor._id,
        message: "Two follow-up consultations were added to your queue.",
        type: "schedule",
        createdAt: addDays(-1),
        updatedAt: addDays(-1),
      },
      {
        recipient: admin._id,
        message: "Today's operations summary is ready for review.",
        type: "system",
        createdAt: addDays(-1),
        updatedAt: addDays(-1),
      },
    ]);
  }

  // 7. Base Emergency Dispatch Points & History (Idempotent)
  const emergencyCount = await Emergency.countDocuments();
  if (emergencyCount === 0) {
    await Emergency.create({
      patientName: "Emergency Response Baseline",
      contact: "+91 98765 00112",
      contactNumber: "+91 98765 00112",
      location: "Indiranagar 100ft Road, Bengaluru",
      status: "Resolved",
      hospital: {
        name: "MEDIrxCARE Emergency Hub Bengaluru",
        hotline: "+91 80 4567 1000",
        address: "Indiranagar Emergency Lane, Bengaluru",
        eta: "8 mins",
      },
      responderNotes: "Base emergency dispatch station verified and operational.",
      acknowledgedAt: addDays(-1),
      dispatchedAt: addDays(-1),
      resolvedAt: addDays(-1),
    });
  }

  // 8. Base Diagnostic Test Reports (Idempotent)
  const reportCount = await Report.countDocuments();
  if (reportCount === 0 && rohan && aaravDoctor) {
    await Report.insertMany([
      {
        patient: rohan._id,
        doctor: aaravDoctor._id,
        name: "Complete Blood Count (CBC)",
        category: "Blood Tests",
        type: "Blood Tests",
        status: "normal",
        date: addDays(-5),
        fileSize: "2.1 MB",
        notes: "All hematology parameters within normal limits. Hemoglobin 14.2 g/dL.",
      },
      {
        patient: rohan._id,
        doctor: aaravDoctor._id,
        name: "12-Lead Resting Electrocardiogram (ECG)",
        category: "Cardiac",
        type: "Cardiac",
        status: "normal",
        date: addDays(-12),
        fileSize: "3.4 MB",
        notes: "Normal sinus rhythm, heart rate 72 bpm. No acute ST-T wave abnormalities.",
      },
    ]);
  }

  // 9. Reconcile user avatars
  const allUsers = await User.find();
  await Promise.all(
    allUsers.map((user) => {
      if (!user.avatar) {
        user.avatar = getInitials(user.name);
        return user.save();
      }
      return Promise.resolve();
    }),
  );
}
