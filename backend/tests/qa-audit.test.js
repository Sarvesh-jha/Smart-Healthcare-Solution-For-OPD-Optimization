import assert from "node:assert/strict";
import { before, test } from "node:test";
import { jsonRequest, resolveApiBaseUrl } from "./test-server.js";

let baseUrl;
let patientToken;
let doctorToken;
let adminToken;
let testDoctorId;

before(async () => {
  baseUrl = await resolveApiBaseUrl();

  // 1. Patient Login
  const patientRes = await jsonRequest(baseUrl, "/auth/login", {
    method: "POST",
    body: {
      email: "rohan.verma@example.com",
      password: "Password123!",
    },
  });
  assert.equal(patientRes.status, 200);
  assert.equal(patientRes.json.user.role, "patient");
  patientToken = patientRes.json.token;

  // 2. Doctor Login
  const doctorRes = await jsonRequest(baseUrl, "/auth/login", {
    method: "POST",
    body: {
      email: "aarav.mehta@medirxcare.in",
      password: "Password123!",
    },
  });
  assert.equal(doctorRes.status, 200);
  assert.equal(doctorRes.json.user.role, "doctor");
  doctorToken = doctorRes.json.token;
  testDoctorId = doctorRes.json.user.id;

  // 3. Admin Login
  const adminRes = await jsonRequest(baseUrl, "/auth/login", {
    method: "POST",
    body: {
      email: "admin@medirxcare.in",
      password: "Password123!",
    },
  });
  assert.equal(adminRes.status, 200);
  assert.equal(adminRes.json.user.role, "admin");
  adminToken = adminRes.json.token;
});

test("QA AUDIT 1: Role-Based Access Control & Protected Route Enforcement", async () => {
  // Reject unauthenticated calls
  const unauthRes = await jsonRequest(baseUrl, "/user/profile");
  assert.equal(unauthRes.status, 401);

  // Reject invalid password
  const badAuth = await jsonRequest(baseUrl, "/auth/login", {
    method: "POST",
    body: { email: "rohan.verma@example.com", password: "WrongPassword" },
  });
  assert.equal(badAuth.status, 401);

  // Authenticated patient access
  const profileRes = await jsonRequest(baseUrl, "/user/profile", { token: patientToken });
  assert.equal(profileRes.status, 200);
  assert.equal(profileRes.json.success, true);
  assert.equal(profileRes.json.user.email, "rohan.verma@example.com");

  // Authenticated admin analytics access
  const adminAnalytics = await jsonRequest(baseUrl, "/dashboard/admin/analytics", { token: adminToken });
  assert.equal(adminAnalytics.status, 200);
  assert.equal(adminAnalytics.json.success, true);
});

test("QA AUDIT 2: Profile Updates & Settings Form Persistence", async () => {
  // Update Patient Profile
  const updateRes = await jsonRequest(baseUrl, "/user/profile", {
    method: "PUT",
    token: patientToken,
    body: {
      firstName: "Rohan",
      lastName: "Verma",
      phone: "+91 98765 43210",
      address: "Flat 402, Green Glen Layout, Bellandur, Bengaluru",
      age: 32,
      gender: "male",
      bloodGroup: "O+",
    },
  });
  assert.equal(updateRes.status, 200);
  assert.equal(updateRes.json.success, true);
  assert.equal(updateRes.json.user.phone, "+91 98765 43210");
  assert.equal(updateRes.json.user.address, "Flat 402, Green Glen Layout, Bellandur, Bengaluru");
  assert.equal(updateRes.json.user.bloodGroup, "O+");
});

test("QA AUDIT 3: Payment Methods Complete Lifecycle (Card & UPI CRUD)", async () => {
  // 1. Add Card
  const addCardRes = await jsonRequest(baseUrl, "/user/payment-methods", {
    method: "POST",
    token: patientToken,
    body: {
      type: "card",
      cardHolder: "Rohan Verma",
      cardNumber: "4111 2222 3333 4444",
      brand: "visa",
      expiry: "09/29",
      nickname: "Personal HDFC Visa",
      isDefault: true,
    },
  });
  assert.equal(addCardRes.status, 201);
  assert.equal(addCardRes.json.success, true);
  const cardId = addCardRes.json.paymentMethod._id;
  assert.ok(cardId);

  // 2. Add UPI Handle
  const addUpiRes = await jsonRequest(baseUrl, "/user/payment-methods", {
    method: "POST",
    token: patientToken,
    body: {
      type: "upi",
      upiId: "rohanverma@okhdfcbank",
      nickname: "Google Pay UPI",
      isDefault: false,
    },
  });
  assert.equal(addUpiRes.status, 201);
  const upiId = addUpiRes.json.paymentMethod._id;
  assert.ok(upiId);

  // 3. Set UPI as Default
  const setDefaultRes = await jsonRequest(baseUrl, `/user/payment-methods/${upiId}/default`, {
    method: "PATCH",
    token: patientToken,
  });
  assert.equal(setDefaultRes.status, 200);
  assert.equal(setDefaultRes.json.success, true);
  const upiMethod = setDefaultRes.json.paymentMethods.find((m) => m._id === upiId);
  assert.equal(upiMethod.isDefault, true);

  // 4. Delete Card
  const deleteRes = await jsonRequest(baseUrl, `/user/payment-methods/${cardId}`, {
    method: "DELETE",
    token: patientToken,
  });
  assert.equal(deleteRes.status, 200);
  assert.equal(deleteRes.json.success, true);
  const remaining = deleteRes.json.paymentMethods.find((m) => m._id === cardId);
  assert.equal(remaining, undefined);

  // Clean up UPI
  await jsonRequest(baseUrl, `/user/payment-methods/${upiId}`, {
    method: "DELETE",
    token: patientToken,
  });
});

test("QA AUDIT 4: Live Booking & Real-Time Doctor Queue Reflection", async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split("T")[0];

  const bookRes = await jsonRequest(baseUrl, "/appointments", {
    method: "POST",
    token: patientToken,
    body: {
      doctorId: testDoctorId,
      date: dateStr,
      timeSlot: "11:30 AM",
      mode: "In-Person",
      reason: "Automated QA Verification Consultation",
    },
  });
  assert.equal(bookRes.status, 201);
  assert.equal(bookRes.json.success, true);
  const appointmentId = bookRes.json.appointment.id;

  // Verify it reflects immediately on Doctor's agenda
  const doctorRoster = await jsonRequest(baseUrl, `/appointments/doctor?date=${dateStr}`, {
    token: doctorToken,
  });
  assert.equal(doctorRoster.status, 200);
  assert.ok(Array.isArray(doctorRoster.json));
  const found = doctorRoster.json.some((a) => a.id === appointmentId || a.reason === "Automated QA Verification Consultation");
  assert.ok(found, "Booked appointment must appear in doctor roster without reload");
});

test("QA AUDIT 5: Emergency SOS Dispatch & Administrative Lifecycle", async () => {
  const sosRes = await jsonRequest(baseUrl, "/emergency/trigger", {
    method: "POST",
    token: patientToken,
    body: {
      patientName: "Rohan Verma",
      contactNumber: "+91 98765 43210",
      location: "Bellandur, Bengaluru (Browser GPS Verified)",
      coordinates: { latitude: 12.9352, longitude: 77.6245 },
    },
  });
  assert.equal(sosRes.status, 201);
  assert.equal(sosRes.json.success, true);
  assert.equal(sosRes.json.emergency.status, "PENDING_RESPONSE");
  const emergencyId = sosRes.json.emergency._id;

  // Admin Dispatches Ambulance
  const dispatchRes = await jsonRequest(baseUrl, `/emergency/${emergencyId}/dispatch`, {
    method: "PATCH",
    token: adminToken,
    body: { responderNotes: "Unit 04 dispatched with paramedic team." },
  });
  assert.equal(dispatchRes.status, 200);
  assert.equal(dispatchRes.json.emergency.status, "Dispatched");

  // Admin Resolves Incident
  const resolveRes = await jsonRequest(baseUrl, `/emergency/${emergencyId}/resolve`, {
    method: "PATCH",
    token: adminToken,
  });
  assert.equal(resolveRes.status, 200);
  assert.equal(resolveRes.json.emergency.status, "Resolved");
});

test("QA AUDIT 6: Data Integrity & Empty State Verification", async () => {
  // Ensure doctors list returns real MongoDB documents
  const docsRes = await jsonRequest(baseUrl, "/doctors");
  assert.equal(docsRes.status, 200);
  assert.ok(Array.isArray(docsRes.json));
  assert.ok(docsRes.json.length > 0);
  // Ensure real MongoDB fields exist
  assert.ok(docsRes.json[0].id || docsRes.json[0]._id);
  assert.ok(docsRes.json[0].specialization);
});
