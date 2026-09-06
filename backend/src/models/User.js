import mongoose from "mongoose";

const patientProfileSchema = new mongoose.Schema(
  {
    age: Number,
    gender: String,
    bloodGroup: String,
    address: String,
    totalVisits: {
      type: Number,
      default: 0,
    },
    lastVisit: Date,
  },
  { _id: false },
);

const doctorProfileSchema = new mongoose.Schema(
  {
    specialization: String,
    experienceYears: Number,
    location: String,
    availability: String,
    onlineFee: {
      type: Number,
      default: 499,
    },
    offlineFee: {
      type: Number,
      default: 799,
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    reviews: {
      type: Number,
      default: 100,
    },
    patientsCount: {
      type: Number,
      default: 0,
    },
    nextAvailable: {
      type: String,
      default: "Today, 4:30 PM",
    },
    bio: String,
    licenseNumber: String,
  },
  { _id: false },
);

const adminProfileSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "System Administrator",
    },
    organizationName: {
      type: String,
      default: "MEDIrxCARE Hospitals",
    },
  },
  { _id: false },
);

const paymentMethodSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["card", "upi"],
      required: true,
    },
    cardHolder: String,
    cardNumber: String,
    brand: String,
    expiry: String,
    upiId: String,
    nickname: String,
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient",
    },
    phone: String,
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    avatar: String,
    patientProfile: patientProfileSchema,
    doctorProfile: doctorProfileSchema,
    adminProfile: adminProfileSchema,
    paymentMethods: [paymentMethodSchema],
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);
