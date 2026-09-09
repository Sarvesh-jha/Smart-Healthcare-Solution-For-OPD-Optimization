import assert from "node:assert/strict";
import { before, test } from "node:test";
import { jsonRequest, resolveApiBaseUrl } from "./test-server.js";

let baseUrl;
let patientToken;

before(async () => {
  baseUrl = await resolveApiBaseUrl();

  const login = await jsonRequest(baseUrl, "/auth/login", {
    method: "POST",
    body: {
      email: "rohan.verma@example.com",
      password: "Password123!",
    },
  });

  assert.equal(login.status, 200);
  patientToken = login.json.token;
  assert.ok(patientToken);
});

test("POST /ai/triage with acute cardiac query returns Cardiologist, High urgency, and structured carePlan", async () => {
  const res = await jsonRequest(baseUrl, "/ai/triage", {
    method: "POST",
    token: patientToken,
    body: {
      query: "Crushing chest pain radiating to left arm with shortness of breath and sweating",
    },
  });

  assert.equal(res.status, 200, "Should return HTTP 200");
  assert.ok(res.json.reply, "Must include conversational reply");
  assert.ok(res.json.carePlan, "Must include structured carePlan");
  assert.equal(res.json.carePlan.specialist, "Cardiologist");
  assert.equal(res.json.carePlan.urgency, "High");
  assert.ok(Array.isArray(res.json.carePlan.recommendedActions));
  assert.ok(res.json.carePlan.recommendedActions.length > 0);
  assert.ok(Array.isArray(res.json.carePlan.suggestedTests));
  assert.ok(res.json.carePlan.suggestedTests.length > 0);
  assert.ok(res.json.carePlan.urgentWarning);
});

test("POST /ai/triage with respiratory query returns Pulmonologist and diagnostic tests", async () => {
  const res = await jsonRequest(baseUrl, "/ai/triage", {
    method: "POST",
    token: patientToken,
    body: {
      message: "Persistent dry cough for 4 days with wheezing and low fever",
    },
  });

  assert.equal(res.status, 200);
  assert.ok(res.json.reply);
  assert.equal(res.json.carePlan.specialist, "Pulmonologist");
  assert.ok(res.json.carePlan.suggestedTests.some((t) => /chest|x-ray|spiro|cbc|pulse/i.test(t)));
});

test("POST /ai/care-guide alias works identically", async () => {
  const res = await jsonRequest(baseUrl, "/ai/care-guide", {
    method: "POST",
    token: patientToken,
    body: {
      query: "Burning epigastric chest sensation after spicy meals and acid reflux",
    },
  });

  assert.equal(res.status, 200);
  assert.equal(res.json.carePlan.specialist, "Gastroenterologist");
  assert.ok(res.json.carePlan.recommendedActions.length > 0);
});

test("POST /ai/doctor legacy endpoint compatibility", async () => {
  const res = await jsonRequest(baseUrl, "/ai/doctor", {
    method: "POST",
    token: patientToken,
    body: {
      issue: "Severe throbbing headache on right side with nausea and light sensitivity",
    },
  });

  assert.equal(res.status, 200);
  assert.equal(res.json.carePlan.specialist, "Neurologist");
  assert.ok(res.json.summary);
  assert.ok(res.json.response);
});

test("POST /ai/triage rejects empty query with 400 error", async () => {
  const res = await jsonRequest(baseUrl, "/ai/triage", {
    method: "POST",
    token: patientToken,
    body: {
      query: "   ",
    },
  });

  assert.equal(res.status, 400);
});
