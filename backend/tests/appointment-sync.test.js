import assert from "node:assert/strict";
import { before, test } from "node:test";
import { jsonRequest, resolveApiBaseUrl } from "./test-server.js";

let baseUrl;

before(async () => {
  baseUrl = await resolveApiBaseUrl();
});

test("appointment data synchronization between patient booking and doctor dashboard", async () => {
  // 1. Patient Login
  const patientLogin = await jsonRequest(baseUrl, "/auth/login", {
    method: "POST",
    body: {
      email: "rohan.verma@example.com",
      password: "Password123!",
    },
  });

  assert.equal(patientLogin.status, 200, "Patient login should succeed");
  const patientToken = patientLogin.json.token;
  const patientId = patientLogin.json.user.id;
  assert.ok(patientToken, "Token must be returned");

  // 2. Locate Dr. Aarav Mehta
  const doctorsRes = await jsonRequest(baseUrl, "/doctors");
  assert.equal(doctorsRes.status, 200);
  const drAarav = doctorsRes.json.find((doc) => doc.email === "aarav.mehta@medirxcare.in");
  assert.ok(drAarav, "Dr. Aarav Mehta must exist in catalogue");

  // 3. Book In-Person Appointment for Today at 02:00 PM
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const bookingDate = `${year}-${month}-${day}`;
  const bookingSlot = "02:00 PM";
  const uniqueReason = `Cardiac Consultation Test ${Date.now()}`;

  const bookingRes = await jsonRequest(baseUrl, "/appointments", {
    method: "POST",
    token: patientToken,
    body: {
      doctorId: drAarav.id,
      consultationType: "offline",
      mode: "In-Person",
      selectedDate: bookingDate,
      date: bookingDate,
      selectedSlot: bookingSlot,
      timeSlot: bookingSlot,
      reason: uniqueReason,
      status: "confirmed",
      paymentMethod: "upi",
    },
  });

  assert.equal(bookingRes.status, 201, "Booking should be created with HTTP 201");
  assert.equal(bookingRes.json.success, true);
  const createdAppt = bookingRes.json.appointment;
  assert.equal(createdAppt.doctorId, drAarav.id, "Doctor ID must match Dr. Aarav Mehta");
  assert.equal(createdAppt.patientId, patientId, "Patient ID must match Rohan Verma");
  assert.equal(createdAppt.mode, "In-Person", "Mode must be In-Person");
  assert.equal(createdAppt.timeSlot, "2:00 PM", "Time slot must format to 2:00 PM");
  assert.equal(createdAppt.dateISO, bookingDate, `Date ISO must match ${bookingDate}`);

  // 4. Doctor Login (Dr. Aarav Mehta)
  const doctorLogin = await jsonRequest(baseUrl, "/auth/login", {
    method: "POST",
    body: {
      email: "aarav.mehta@medirxcare.in",
      password: "Password123!",
    },
  });

  assert.equal(doctorLogin.status, 200, "Dr. Aarav Mehta login should succeed");
  const doctorToken = doctorLogin.json.token;

  // 5. Query Doctor Appointments by Date (2026-09-08)
  const doctorDateAppointments = await jsonRequest(baseUrl, `/appointments/doctor?date=${bookingDate}`, {
    token: doctorToken,
  });

  assert.equal(doctorDateAppointments.status, 200);
  assert.ok(Array.isArray(doctorDateAppointments.json));
  const matchedDateAppt = doctorDateAppointments.json.find((a) => a.reason === uniqueReason);
  assert.ok(matchedDateAppt, "Booked appointment must appear in doctor query for 2026-09-08");
  assert.equal(matchedDateAppt.patient, "Rohan Verma");
  assert.equal(matchedDateAppt.mode, "In-Person");
  assert.equal(matchedDateAppt.timeSlot, "2:00 PM");

  // 6. Query Doctor Upcoming Appointments
  const doctorUpcomingAppointments = await jsonRequest(baseUrl, "/appointments/doctor?view=upcoming", {
    token: doctorToken,
  });

  assert.equal(doctorUpcomingAppointments.status, 200);
  const matchedUpcomingAppt = doctorUpcomingAppointments.json.find((a) => a.reason === uniqueReason);
  assert.ok(matchedUpcomingAppt, "Booked appointment must appear in doctor upcoming stream");

  // 7. Query Doctor Queue for 2026-09-08
  const doctorQueueRes = await jsonRequest(baseUrl, `/queue/status?date=${bookingDate}`, {
    token: doctorToken,
  });

  assert.equal(doctorQueueRes.status, 200);
  assert.ok(doctorQueueRes.json.totalToday >= 1, "Queue must contain at least 1 patient for 2026-09-08");
  const patientInWaitingList = doctorQueueRes.json.waitingList.find((w) => w.reason === uniqueReason);
  assert.ok(patientInWaitingList, "Patient must be in the waiting list for 2026-09-08");
  assert.equal(patientInWaitingList.name, "Rohan Verma");
});

test("double-booking the same doctor slot by another patient returns human-readable conflict error", async () => {
  const patient1Email = `patient1_${Date.now()}@example.com`;
  const reg1 = await jsonRequest(baseUrl, "/auth/register", {
    method: "POST",
    body: {
      name: "Patient One",
      email: patient1Email,
      password: "Password123!",
      role: "patient",
    },
  });
  assert.equal(reg1.status, 201);
  const patient1Token = reg1.json.token;

  const patient2Email = `patient2_${Date.now()}@example.com`;
  const reg2 = await jsonRequest(baseUrl, "/auth/register", {
    method: "POST",
    body: {
      name: "Patient Two",
      email: patient2Email,
      password: "Password123!",
      role: "patient",
    },
  });
  assert.equal(reg2.status, 201);
  const patient2Token = reg2.json.token;

  const doctorsRes = await jsonRequest(baseUrl, "/doctors");
  const drAarav = doctorsRes.json.find((doc) => doc.email === "aarav.mehta@medirxcare.in");

  const randomDay = String(Math.floor(Math.random() * 25) + 1).padStart(2, "0");
  const randomMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
  const conflictDate = `2028-${randomMonth}-${randomDay}`;
  const conflictSlot = "10:30 AM";

  // Patient 1 books the slot first
  const firstBooking = await jsonRequest(baseUrl, "/appointments", {
    method: "POST",
    token: patient1Token,
    body: {
      doctorId: drAarav.id,
      consultationType: "offline",
      mode: "In-Person",
      selectedDate: conflictDate,
      selectedSlot: conflictSlot,
      reason: "Initial valid booking",
      status: "confirmed",
    },
  });
  assert.equal(firstBooking.status, 201);

  // Patient 2 attempts to book the exact same slot with the same doctor
  const conflictRes = await jsonRequest(baseUrl, "/appointments", {
    method: "POST",
    token: patient2Token,
    body: {
      doctorId: drAarav.id,
      consultationType: "offline",
      mode: "In-Person",
      selectedDate: conflictDate,
      selectedSlot: conflictSlot,
      reason: "Conflicting slot attempt",
      status: "confirmed",
    },
  });

  assert.equal(conflictRes.status, 409, "Conflicting slot booking must return 409");
  assert.equal(
    conflictRes.json.message,
    "Doctor slot unavailable for the selected time. Please choose another slot."
  );
});
