import assert from "node:assert/strict";
import { before, test } from "node:test";
import { jsonRequest, resolveApiBaseUrl } from "./test-server.js";

let baseUrl;
let patientToken;
let adminToken;

before(async () => {
  baseUrl = await resolveApiBaseUrl();

  const patientLogin = await jsonRequest(baseUrl, "/auth/login", {
    method: "POST",
    body: {
      email: "rohan.verma@example.com",
      password: "Password123!",
    },
  });
  assert.equal(patientLogin.status, 200);
  patientToken = patientLogin.json.token;

  const adminLogin = await jsonRequest(baseUrl, "/auth/login", {
    method: "POST",
    body: {
      email: "admin@medirxcare.in",
      password: "Password123!",
    },
  });
  assert.equal(adminLogin.status, 200);
  adminToken = adminLogin.json.token;

  // Ensure test patient starts with clean reports state
  await jsonRequest(baseUrl, "/reports/test-cleanup", {
    method: "DELETE",
    token: patientToken,
  });
});

test("GET /user/reports returns user diagnostic reports array without error", async () => {
  const res = await jsonRequest(baseUrl, "/user/reports", {
    token: patientToken,
  });

  assert.equal(res.status, 200);
  assert.equal(res.json.success, true);
  assert.ok(Array.isArray(res.json.reports));
  // Patient Rohan has regular consultations but 0 lab reports; ensure regular appointments are not leaked
  assert.equal(res.json.reports.length, 0);
  assert.ok("vitals" in res.json);
});

test("GET /reports and GET /patient/lab-reports query dedicated reports and return empty state when 0 tests taken", async () => {
  const resReports = await jsonRequest(baseUrl, "/reports", {
    token: patientToken,
  });
  assert.equal(resReports.status, 200);
  assert.equal(resReports.json.success, true);
  assert.ok(Array.isArray(resReports.json.reports));
  assert.equal(resReports.json.reports.length, 0);
  assert.ok("vitals" in resReports.json);

  const resPatientLabReports = await jsonRequest(baseUrl, "/patient/lab-reports", {
    token: patientToken,
  });
  assert.equal(resPatientLabReports.status, 200);
  assert.equal(resPatientLabReports.json.success, true);
  assert.equal(resPatientLabReports.json.reports.length, 0);
});

test("POST /reports creates verified diagnostic report with vitals and reflects in GET /reports", async () => {
  const postRes = await jsonRequest(baseUrl, "/reports", {
    method: "POST",
    token: patientToken,
    body: {
      name: "Comprehensive Lipid Panel",
      type: "Diagnostic Pathology",
      vitals: {
        bloodPressure: "118/78",
        bloodSugar: "92 mg/dL",
        cholesterol: "185 mg/dL",
        heartRate: "70 bpm",
      },
    },
  });

  assert.equal(postRes.status, 201);
  assert.equal(postRes.json.success, true);
  assert.equal(postRes.json.report.name, "Comprehensive Lipid Panel");

  const getRes = await jsonRequest(baseUrl, "/reports", {
    token: patientToken,
  });
  assert.equal(getRes.status, 200);
  assert.equal(getRes.json.reports.length, 1);
  assert.equal(getRes.json.reports[0].name, "Comprehensive Lipid Panel");
  assert.equal(getRes.json.vitals.bloodPressure, "118/78");
  assert.equal(getRes.json.vitals.bloodSugar, "92 mg/dL");
});

test("GET /user/prescriptions returns patient prescriptions list", async () => {
  const res = await jsonRequest(baseUrl, "/user/prescriptions", {
    token: patientToken,
  });

  assert.equal(res.status, 200);
  assert.equal(res.json.success, true);
  assert.ok(Array.isArray(res.json.prescriptions));
});

test("GET /dashboard/admin/payments returns aggregated financial stats and transactions", async () => {
  const res = await jsonRequest(baseUrl, "/dashboard/admin/payments", {
    token: adminToken,
  });

  assert.equal(res.status, 200);
  assert.equal(res.json.success, true);
  assert.ok(res.json.stats);
  assert.ok(typeof res.json.stats.totalRevenue === "number");
  assert.ok(Array.isArray(res.json.transactions));
});

test("GET /dashboard/admin/analytics returns live hospital metrics", async () => {
  const res = await jsonRequest(baseUrl, "/dashboard/admin/analytics", {
    token: adminToken,
  });

  assert.equal(res.status, 200);
  assert.equal(res.json.success, true);
  assert.ok(res.json.quickStats);
  assert.ok(Array.isArray(res.json.appointmentData));
  assert.ok(Array.isArray(res.json.departmentData));
});

test("Emergency SOS trigger, acknowledge, dispatch, and resolve lifecycle", async () => {
  // 1. Patient triggers emergency
  const triggerRes = await jsonRequest(baseUrl, "/emergency/trigger", {
    method: "POST",
    token: patientToken,
    body: {
      patientName: "Rohan Verma",
      contactNumber: "+91 98765 42001",
      location: "Indiranagar, Bengaluru",
    },
  });

  assert.equal(triggerRes.status, 201);
  assert.equal(triggerRes.json.success, true);
  assert.ok(triggerRes.json.emergency);
  assert.equal(triggerRes.json.emergency.status, "PENDING_RESPONSE");
  const emergencyId = triggerRes.json.emergency._id;

  // 2. Admin views incidents list
  const incidentsRes = await jsonRequest(baseUrl, "/emergency/incidents", {
    token: adminToken,
  });
  assert.equal(incidentsRes.status, 200);
  assert.equal(incidentsRes.json.success, true);
  assert.ok(Array.isArray(incidentsRes.json.incidents));
  const found = incidentsRes.json.incidents.find((i) => i._id === emergencyId);
  assert.ok(found);

  // 3. Admin acknowledges and dispatches ambulance
  const dispatchRes = await jsonRequest(baseUrl, `/emergency/${emergencyId}/dispatch`, {
    method: "PATCH",
    token: adminToken,
    body: { notes: "Ambulance Unit 5 dispatched" },
  });
  assert.equal(dispatchRes.status, 200);
  assert.equal(dispatchRes.json.emergency.status, "Dispatched");

  // 4. Admin resolves incident
  const resolveRes = await jsonRequest(baseUrl, `/emergency/${emergencyId}/resolve`, {
    method: "PATCH",
    token: adminToken,
  });
  assert.equal(resolveRes.status, 200);
  assert.equal(resolveRes.json.emergency.status, "Resolved");
});
