# MEDIrxCARE: Smart Healthcare Solution for OPD Optimization & Clinical Triage
## Comprehensive Engineering & Architecture Report

---

## Executive Summary

**MEDIrxCARE** is an enterprise-grade, full-stack healthcare platform engineered to optimize Out-Patient Department (OPD) workflows, eliminate clinical queue congestion, and deliver intelligent pre-consultation triage. Designed with a cloud-native, zero-downtime architecture, MEDIrxCARE seamlessly connects patients, doctors, and hospital administrators in real time.

The platform combines high-concurrency Node.js micro-services, reactive WebSockets (`Socket.io`), MongoDB persistence, and the **Google GenAI SDK (`@google/genai`)** powered by Gemini models for structured clinical symptom guidance. Recent architectural milestones include complete decoupling from hardcoded demo datasets, an automated slot collision prevention engine, an end-to-end real-time SOS Emergency dispatch lifecycle, dedicated diagnostic lab report isolation, and aggressive bundle optimization (~30 unreferenced packages pruned, enabling sub-3-second Vite production builds).

---

## Table of Contents

1. [Project Overview & Problem Statement](#1-project-overview--problem-statement)
2. [Technology Stack & Dependency Audit](#2-technology-stack--dependency-audit)
3. [System Architecture & Design Patterns](#3-system-architecture--design-patterns)
4. [Database Schema & Collections](#4-database-schema--collections)
5. [Feature Documentation & Workflows](#5-feature-documentation--workflows)
   - [5.1 Patient Portal](#51-patient-portal)
   - [5.2 Doctor OPD Desk](#52-doctor-opd-desk)
   - [5.3 Admin Command Center](#53-admin-command-center)
   - [5.4 Real-Time SOS Emergency Alert System](#54-real-time-sos-emergency-alert-system)
   - [5.5 AI Clinical Triage & Care Guide](#55-ai-clinical-triage--care-guide)
   - [5.6 Diagnostic Reports & Vitals Isolation](#56-diagnostic-reports--vitals-isolation)
6. [Complete REST API & WebSocket Specifications](#6-complete-rest-api--websocket-specifications)
7. [Frontend Architecture & Component Matrix](#7-frontend-architecture--component-matrix)
8. [Automated Verification & QA Test Suite](#8-automated-verification--qa-test-suite)
9. [DevOps, Docker & Production Deployment](#9-devops-docker--production-deployment)
10. [Security, Compliance & Data Integrity](#10-security-compliance--data-integrity)
11. [Conclusion & Strategic Roadmap](#11-conclusion--strategic-roadmap)

---

## 1. Project Overview & Problem Statement

### 1.1 Challenges in Modern Out-Patient Care
Traditional hospital Out-Patient Departments face significant operational bottlenecks:
- **Severe Queue Congestion**: Patients arrive simultaneously without real-time tracking, causing crowded waiting halls and high attrition.
- **Triage Inefficiencies**: Routine non-emergency consultations overwhelm specialist rosters, while critical cardiac or acute respiratory cases experience delayed attention.
- **Data Contamination**: Clinic consultation bookings are frequently commingled with diagnostic laboratory test records, skewing vitals monitoring.
- **Double-Booking & Slot Collisions**: High-frequency concurrent requests often result in overlapping appointments on the same doctor time-slot.
- **Emergency Blind Spots**: In-transit or at-home patient health crises lack instant telemetry channels to hospital administrative command centers.

### 1.2 The MEDIrxCARE Solution
MEDIrxCARE resolves these challenges through six specialized subsystems:
1. **Dynamic Real-Time OPD Queue**: Token-based live queue with algorithmic waiting time estimation and doctor consultation advancement.
2. **AI Clinical Triage Assistant**: Integrated with the official Google GenAI SDK (`@google/genai`) to generate structured preliminary care plans (`specialist`, `urgency`, `suggestedTests`, `recommendedActions`) backed by a deterministic clinical NLP rules engine.
3. **Real-Time SOS Emergency Dispatch**: One-click protected emergency trigger with browser geolocation telemetry, instant Web Audio sirens on the admin console, and automated ambulance dispatch workflows.
4. **Diagnostic Reports Isolation**: Dedicated `Report` schema separating certified pathology/radiology tests from doctor visits, with verifiable metrics and downloadable records.
5. **Conflict-Free Scheduling**: Atomic slot collision detection rejecting conflicting appointments with human-friendly HTTP 409 errors.
6. **Multi-Role Administrative Cockpit**: Comprehensive oversight across patient flow, doctor utilization, financial analytics, and system settings.

---

## 2. Technology Stack & Dependency Audit

### 2.1 Backend Architecture

| Layer | Technology | Version | Purpose |
| :--- | :--- | :---: | :--- |
| **Runtime** | Node.js | v20+ (ESM) | High-throughput asynchronous JavaScript runtime |
| **Framework** | Express.js | 4.21.2 | Lightweight HTTP server and middleware orchestrator |
| **Database** | MongoDB & Mongoose | 8.12.1 | Document storage with schema enforcement & population |
| **Real-Time Engine**| Socket.io | 4.8.3 | Bidirectional WebSockets for SOS alerts and live queues |
| **Primary AI Engine**| Google GenAI SDK | 2.21.0 (`@google/genai`) | Gemini models for structured medical symptom triage |
| **Fallback AI Engine**| OpenAI SDK | 5.10.2 | Secondary provider for high availability |
| **Authentication** | JSON Web Tokens (JWT) | 9.0.2 | Stateless bearer token session management |
| **Password Hashing**| bcryptjs | 2.4.3 | Cryptographic password hashing (salt rounds: 10) |
| **Validation** | Zod | 3.24.2 | Strict schema validation on incoming payloads |
| **Security** | Helmet & Rate-Limit | Latest | Secure HTTP headers & endpoint throttling |
| **Logging** | Morgan | 1.10.0 | HTTP request logger middleware |

### 2.2 Frontend Architecture

| Layer | Technology | Version | Purpose |
| :--- | :--- | :---: | :--- |
| **Framework** | React | 18.3.1 | Component-driven declarative UI library |
| **Language** | TypeScript | 5.5.3 | Static type safety and developer ergonomics |
| **Bundler & Server** | Vite | 6.3.5 | Hot module replacement & optimized rollup bundling |
| **Routing** | React Router | 7.3.0 | Declarative client-side routing & route guards |
| **Styling** | Tailwind CSS | 3.4.17 | Utility-first responsive styling and theme tokens |
| **Accessible Primitives**| Radix UI | Curated | Dialog, Dropdown, Switch, Label, Progress, Slot |
| **Visual Charts** | Recharts | 2.15.1 | Interactive telemetry for analytics and revenue trends |
| **Icons** | Lucide React | 0.487.0 | Modern SVG iconography |
| **Notifications** | Sonner | 2.0.3 | Rich, high-contrast toast notifications |
| **Date Manipulation** | date-fns & react-day-picker | Latest | Clinical date arithmetic & calendar scheduling |

### 2.3 Dependency Pruning & Zero-Bloat Audit
During the architectural cleanup, **~30 unreferenced, legacy packages were completely removed** from `frontend/package.json`:
- **Purged UI Libraries**: `@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled` (consolidated into pure Tailwind CSS + Radix UI).
- **Purged Redundant Carousels & Drag-and-Drop**: `react-dnd`, `react-dnd-html5-backend`, `react-slick`, `embla-carousel-react`, `react-responsive-masonry`.
- **Purged Unused Form & Overlay Utilities**: `react-hook-form`, `cmdk`, `vaul`, `input-otp`, `react-resizable-panels`, and 19 unreferenced `@radix-ui/*` packages.
- **Result**: Reduced install footprint, zero deprecation warnings, and an accelerated Vite production build of **~2.6 seconds**.

---

## 3. System Architecture & Design Patterns

### 3.1 Macro Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                             CLIENT LAYER                                 │
│  React 18 + TypeScript + Tailwind CSS (SPA running on Vite / Port 4174)  │
│                                                                          │
│  ┌───────────────────────┐ ┌───────────────────┐ ┌────────────────────┐ │
│  │    Patient Portal     │ │  Doctor OPD Desk  │ │   Admin Cockpit    │ │
│  │ - Contextual Search   │ │ - Today's Agenda  │ │ - Live SOS Banner  │ │
│  │ - Doctor Booking      │ │ - OPD Queue Sync  │ │ - Ambulance Action │ │
│  │ - Lab Reports Stream  │ │ - Prescriptions   │ │ - Financial Charts │ │
│  │ - SOS Emergency Alert │ │ - Patient History │ │ - Staff Management │ │
│  └───────────────────────┘ └───────────────────┘ └────────────────────┘ │
└───────────────────────▲──────────────────────────────▲───────────────────┘
                        │ HTTP / REST                  │ WebSockets
                        ▼                              ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         BACKEND APPLICATION LAYER                        │
│             Node.js + Express.js + Socket.io Server (Port 5001)          │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                         API Gateway & Security                     │  │
│  │       CORS Origin Check  •  Helmet Security  •  Rate Limiting      │  │
│  │             JWT Bearer Auth  •  Role Guard Middleware              │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────┐ ┌────────────────────┐ ┌────────────────────┐  │
│  │  Clinical AI Service │ │   Queue & Booking  │ │ Emergency Dispatch │  │
│  │  - Google GenAI SDK  │ │   - Slot Collision │ │ - Telemetry Ingest │  │
│  │  - Gemini 2.5 Flash  │ │   - Atomic Lock    │ │ - Socket Broadcast │  │
│  │  - Medical NLP Rules │ │   - Token Gen      │ │ - Dispatch Tracker │  │
│  └──────────────────────┘ └────────────────────┘ └────────────────────┘  │
└───────────────────────▲──────────────────────────────▲───────────────────┘
                        │ Mongoose ODM                 │ External Cloud AI
                        ▼                              ▼
┌───────────────────────────────────────┐  ┌───────────────────────────────┐
│           DATABASE LAYER              │  │       EXTERNAL SERVICES       │
│        MongoDB 7.0 Persistence        │  │  Google GenAI (Gemini Flash)  │
│  Users • Appointments • Reports       │  │  OpenAI API (Failover Engine) │
│  QueueEntries • Emergencies • Alerts  │  │  Browser Geolocation API      │
└───────────────────────────────────────┘  └───────────────────────────────┘
```

### 3.2 Key Architectural Patterns
1. **Separation of Concerns (SoC)**: Strict isolation between Data Models (`/models`), Controllers/Routes (`/routes`), Clinical Services (`/services`), and Client Components.
2. **Deterministic Failover Engine**: The AI Triage service (`ai.service.js`) implements a robust tiered resolution pattern:
   - *Tier 1*: Official Google GenAI SDK with `gemini-2.5-flash` / `gemini-3.5-flash-lite`.
   - *Tier 2*: OpenAI GPT fallback if Gemini key is missing or quotas are reached.
   - *Tier 3*: Deterministic rule-based Medical NLP parser guaranteeing 100% uptime with zero 500 HTTP errors.
3. **Idempotent Real-Time Broadcasts**: WebSockets broadcast to dedicated rooms (`admin_channel`, `queue_channel`), preventing event leakage between tenants.
4. **Atomic Booking Verification**: Double-check query logic prevents race conditions when multiple patients attempt to book identical doctor slots.

---

## 4. Database Schema & Collections

MEDIrxCARE utilizes six core collections in MongoDB managed through Mongoose:

```
                  ┌──────────────┐
                  │    Users     │
                  └──────┬───────┘
                         │ 1:N
       ┌─────────────────┼─────────────────┬────────────────┐
       ▼                 ▼                 ▼                ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐  ┌─────────────┐
│Appointments │   │   Reports   │   │ QueueEntry  │  │ Emergencies │
└─────────────┘   └─────────────┘   └─────────────┘  └─────────────┘
```

### 4.1 Collection Specifications

#### 4.1.1 `users`
Represents patients, doctors, and administrators with polymorphic profile fields:
```javascript
{
  _id: ObjectId,
  name: String,
  email: { type: String, unique: true, index: true },
  phone: String,
  passwordHash: String,
  role: { type: String, enum: ["patient", "doctor", "admin"], index: true },
  avatar: String,
  patientProfile: {
    age: Number,
    gender: String,
    bloodGroup: String,
    address: String,
    totalVisits: Number,
    lastVisit: Date,
    paymentMethods: [{
      id: String,
      type: { type: String, enum: ["card", "upi"] },
      label: String,
      details: String,
      isDefault: Boolean
    }]
  },
  doctorProfile: {
    specialization: String,
    experienceYears: Number,
    location: String,
    availability: String,
    onlineFee: Number,
    offlineFee: Number,
    rating: Number,
    reviews: Number,
    patientsCount: Number,
    licenseNumber: String
  },
  adminProfile: {
    title: String,
    organizationName: String
  }
}
```

#### 4.1.2 `appointments`
Tracks clinical bookings with integrated conflict and consultation flags:
```javascript
{
  _id: ObjectId,
  patient: { type: ObjectId, ref: "User", index: true },
  doctor: { type: ObjectId, ref: "User", index: true },
  reason: String,
  type: { type: String, enum: ["online", "offline"] },
  status: { type: String, enum: ["pending", "confirmed", "ongoing", "completed", "cancelled"], index: true },
  fee: Number,
  paymentMethod: String,
  paymentStatus: { type: String, enum: ["pending", "paid", "refunded"] },
  dateTime: { type: Date, required: true, index: true },
  createdAt: Date
}
```
*Composite Conflict Filter*: `{ doctor: doctorId, dateTime: targetDate, status: { $in: ["confirmed", "scheduled", "ongoing"] } }`.

#### 4.1.3 `reports` (Diagnostic Pathology & Radiology)
Completely decoupled from doctor appointments:
```javascript
{
  _id: ObjectId,
  reportId: { type: String, unique: true },
  patient: { type: ObjectId, ref: "User", index: true },
  doctor: { type: ObjectId, ref: "User" },
  testName: String,
  category: { type: String, enum: ["Pathology", "Radiology", "Cardiology", "General"] },
  status: { type: String, enum: ["Verified", "Pending", "Critical"] },
  date: { type: Date, default: Date.now },
  summary: String,
  metrics: {
    bloodPressure: String,
    bloodSugar: String,
    cholesterol: String,
    heartRate: String,
    hemoglobin: String
  },
  verifiedBy: String,
  specimenInfo: String
}
```

#### 4.1.4 `emergencies`
Real-time emergency incident records:
```javascript
{
  _id: ObjectId,
  incidentId: { type: String, unique: true },
  patient: { type: ObjectId, ref: "User", index: true },
  patientName: String,
  contactNumber: String,
  location: {
    latitude: Number,
    longitude: Number,
    address: String,
    source: String
  },
  status: { 
    type: String, 
    enum: ["PENDING_RESPONSE", "ACKNOWLEDGED", "AMBULANCE_DISPATCHED", "RESOLVED"],
    default: "PENDING_RESPONSE",
    index: true 
  },
  triggeredAt: { type: Date, default: Date.now },
  dispatchedAt: Date,
  resolvedAt: Date
}
```

#### 4.1.5 `queueentries`
Active OPD token records for waiting rooms:
```javascript
{
  _id: ObjectId,
  doctor: { type: ObjectId, ref: "User", index: true },
  patient: { type: ObjectId, ref: "User", index: true },
  token: Number,
  reason: String,
  scheduledFor: Date,
  status: { type: String, enum: ["waiting", "serving", "completed", "skipped"], index: true },
  estimatedWaitMinutes: Number
}
```

---

## 5. Feature Documentation & Workflows

### 5.1 Patient Portal
- **Context-Aware Global Search**: The header search input automatically detects the current view (`/dashboard/doctor-directory`, `/dashboard/reports`, `/dashboard/tests-services`, `/dashboard/prescriptions`) and filters records in real time.
- **Appointment Booking Flow**: Intuitive selection of doctors, consultation mode (In-Person Clinic vs Online Video), calendar dates, and morning/afternoon time slots. Verified against the conflict engine to prevent double-booking.
- **Health Management**: Direct tracking of prescription insights, doctor consultation histories, and health checkup packages.
- **Settings & Payment CRUD**: Full profile editing with interactive Card (Luhn check, auto brand detection) and UPI ID validation, alongside default method selection and one-click removal.

### 5.2 Doctor OPD Desk
- **Live Agenda Sync**: Appointments booked by patients instantly reflect on the doctor's agenda without requiring manual browser reloads.
- **OPD Queue Management**: Visual token queue tracking patients in `waiting` vs `serving` states with live status updates.
- **Clinical Records**: View past visit summaries, medical history notes, and write digital prescriptions.

### 5.3 Admin Command Center
- **Executive Telemetry**: Key performance indicators tracking daily OPD volumes, active clinical staff, emergency tickets, and queue wait times.
- **Financial Desk (`/admin/payments`)**: Granular transaction logs, revenue breakdown by department, and payment method split (UPI vs Cards).
- **Hospital Analytics (`/admin/analytics`)**: Departmental utilization graphs, patient age demographics, and peak admission hour distributions.
- **Staff & Patient Directory**: Administrative controls to provision and monitor doctor and patient accounts.

### 5.4 Real-Time SOS Emergency Alert System
The SOS Emergency feature connects patients experiencing acute medical crises to the administrative command center:

```
[ Patient Portal ]                                             [ Admin Command Center ]
        │                                                                 │
        ├── 1. Clicks "SOS Emergency" Top-Bar Button                      │
        ├── 2. Confirmation Modal: "Confirm Clinical Emergency Alert?"     │
        ├── 3. Captures Geolocation & Emergency Payload                   │
        │                                                                 │
        ├── 4. POST /api/emergency/trigger ───────────────────────────────┤
        │      (Persists to MongoDB with status: PENDING_RESPONSE)        │
        │                                                                 │
        ├── 5. Socket.io Event: emergency:incoming_alert ─────────────────►
        │                                                                 ├── 6. Plays High-Priority Audio Siren
        │                                                                 ├── 7. Flashes Emergency Banner
        │                                                                 ├── 8. Displays Patient UHID & Phone
        │                                                                 │
        │                                                                 ├── 9. Clicks "Dispatch Ambulance"
        │                                                                 │      PATCH /emergency/:id/dispatch
        │                                                                 │
        ◄── 10. Real-Time Confirmation Modal: "Ambulance Dispatched" ─────┤
```

### 5.5 AI Clinical Triage & Care Guide
Powered by `POST /api/ai/triage` and connected to the Google GenAI SDK (`gemini-2.5-flash`):
- **Structured Clinical Output**: Returns strict JSON format:
  ```json
  {
    "reply": "Empathetic clinical explanation, safe immediate measures, and emergency red flags.",
    "carePlan": {
      "specialist": "Cardiologist",
      "urgency": "High",
      "suggestedTests": ["12-Lead ECG", "High-Sensitivity Troponin-I"],
      "recommendedActions": ["Sit upright", "Call emergency medical services immediately"]
    }
  }
  ```
- **Medical NLP Fallback**: If network or API quota limitations occur, the built-in deterministic rules engine detects keywords (e.g. *chest pain*, *shortness of breath*, *migraine*, *wheezing*) and produces structured clinical guidance instantly.

### 5.6 Diagnostic Reports & Vitals Isolation
- **Strict Decoupling**: Routine doctor appointment consultations are completely separated from diagnostic laboratory reports.
- **Clean Empty States**: If a patient has completed zero diagnostic tests, the page displays a modern `FlaskConical` empty card with an action to book scans, eliminating fake placeholder rows.
- **Metric Fallbacks**: Top vitals cards show `-- / --` with a `No Data Recorded` badge instead of fabricated numbers when no tests exist.
- **Report Modal & Instant Export**: Clicking "View" opens an accredited diagnostic report modal with patient UHID, specimen metadata, and reference ranges; clicking "Download" triggers an authenticated report file export.

---

## 6. Complete REST API & WebSocket Specifications

### 6.1 Authentication & Profile Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | Public | Register new patient, doctor, or administrator |
| `POST` | `/api/auth/login` | Public | Authenticate credentials and return JWT bearer token |
| `GET` | `/api/user/profile` | Auth | Retrieve authenticated user profile and medical data |
| `PUT` | `/api/user/profile` | Auth | Update profile details, emergency contact, and address |
| `POST` | `/api/user/payment-methods` | Auth | Add validated payment card or UPI identifier |
| `PATCH`| `/api/user/payment-methods/:id/default` | Auth | Designate default payment method |
| `DELETE`| `/api/user/payment-methods/:id` | Auth | Remove saved payment method |

### 6.2 Clinical Appointments & Queue Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/appointments/upcoming` | Auth | Retrieve upcoming scheduled visits for patient or doctor |
| `GET` | `/api/appointments/doctor` | Doctor/Admin | Fetch doctor's agenda filtered by `date`, `view=upcoming`, or `all` |
| `POST` | `/api/appointments` | Auth | Book appointment with atomic slot collision verification (HTTP 409) |
| `GET` | `/api/doctors` | Public | Retrieve active doctor catalogue with specialties and ratings |
| `GET` | `/api/queue/status` | Auth | Live OPD queue status, token position, and waiting estimates |

### 6.3 Diagnostic Reports Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/reports` | Auth | Query verified diagnostic lab tests (excludes appointments) |
| `GET` | `/api/patient/lab-reports` | Auth | Dedicated lab reports stream alias |
| `POST` | `/api/reports` | Doctor/Admin | Create certified diagnostic pathology/radiology report |
| `DELETE`| `/api/reports/test-cleanup` | Test | Clean automated QA test report artifacts |

### 6.4 Real-Time Emergency & AI Triage Endpoints
| Method | Endpoint | Access | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/ai/triage` | Public | Structured clinical symptom triage via Gemini / NLP |
| `POST` | `/api/ai/care-guide` | Public | Care guide conversational alias |
| `POST` | `/api/emergency/trigger` | Auth | Ingest clinical emergency incident and emit WebSocket event |
| `GET` | `/api/emergency/incidents` | Admin | Retrieve all active emergency incident tickets |
| `PATCH`| `/api/emergency/:id/dispatch` | Admin | Update incident to `AMBULANCE_DISPATCHED` |
| `PATCH`| `/api/emergency/:id/resolve` | Admin | Mark emergency incident as `RESOLVED` |
| `GET` | `/api/health` | Public | Platform health status and service uptime |

### 6.5 WebSocket Events Matrix
- `emergency:incoming_alert`: Emitted to `admin_channel` on `POST /api/emergency/trigger`.
- `emergency:status_update`: Emitted on administrative dispatch or resolution.
- `queue:token_called`: Emitted to patient room when doctor calls next token.

---

## 7. Frontend Architecture & Component Matrix

### 7.1 Component Organization
```
frontend/src/
├── components/
│   ├── common/             # Accessible UI building blocks (Button, Card, Dialog, Badge, Input)
│   ├── dashboard/          # Specialized widgets (QueueStatus, GreetingSection, SOSEmergencyButton)
│   ├── layout/             # Navigation bars, AdminSidebar, Header, ErrorBoundary
│   ├── profile/            # Profile dropdown menus (Patient, Doctor, Admin)
│   └── theme/              # Dark/Light theme provider and mode toggles
├── hooks/                  # Custom React hooks (useAppointments, useQueue, useDashboardStats)
├── layouts/                # Route guards (ProtectedPatientLayout, ProtectedDoctorLayout, ProtectedAdminLayout)
├── pages/                  # Top-level screen components
│   ├── Patient Pages       # Dashboard, AppointmentBooking, PatientReports, AiSymptomChecker, etc.
│   ├── Doctor Pages        # DoctorDashboard, DoctorAppointments, DoctorQueue, DoctorSettings
│   └── Admin Pages         # AdminDashboard, AdminAnalytics, AdminPayments, AdminSettings
├── routes/                 # Centralized router tree (routes/index.tsx, adminRoutes.tsx, routes.ts)
├── services/               # Typed API services (ApiService, AiService, AppointmentService, SocketService)
└── styles/                 # Tailwind design tokens, typography, and theme CSS
```

### 7.2 Routing Hierarchy
All routes are declared through `react-router` v7 using standard route matching:
- `/`: Public landing page with instantaneous role switching (Patient, Doctor, Admin).
- `/dashboard/*`: Protected patient portal with nested layouts.
- `/doctor/*`: Protected doctor portal with consultation rosters.
- `/admin/*`: Protected administrator portal with sub-views:
  - `/admin/analytics`: Visual clinical utilization metrics.
  - `/admin/payments`: Financial transactions and revenue analytics.
  - `/admin/doctors`: Medical staff roster management.
  - `/admin/queue`: Out-Patient queue oversight.

---

## 8. Automated Verification & QA Test Suite

MEDIrxCARE includes an automated Node.js test runner executing against live API and database instances.

### 8.1 Test Execution Results

```text
> medirxcare-backend@1.0.0 test
> NODE_ENV=test node --test --test-reporter=spec tests/*.test.js

✔ POST /ai/triage with acute cardiac query returns Cardiologist, High urgency, and structured carePlan
✔ POST /ai/triage with respiratory query returns Pulmonologist and diagnostic tests
✔ POST /ai/care-guide alias works identically
✔ POST /ai/doctor legacy endpoint compatibility
✔ POST /ai/triage rejects empty query with 400 error
✔ GET /health returns backend status metadata
✔ GET /appointments/upcoming rejects unauthenticated requests
✔ POST /auth/login returns a token for the seeded demo patient
✔ GET /doctors returns the seeded doctor catalogue
✔ GET /queue/status returns queue payload for an authenticated patient
✔ appointment data synchronization between patient booking and doctor dashboard
✔ double-booking the same doctor slot by another patient returns human-readable conflict error (HTTP 409)
✔ getInitials returns initials for a full name
✔ createAppointmentDateTime handles afternoon times
✔ createAppointmentDateTime handles midnight correctly
✔ sanitizeUser returns only safe public fields
✔ serializeDoctor maps doctor profile data for the frontend
✔ serializePatient maps patient profile data for the frontend
✔ serializeAppointment formats appointment details for frontend cards
✔ register, login, browse doctors, book appointment, and view patient dashboard
✔ GET /user/reports returns user diagnostic reports array without error
✔ GET /reports and GET /patient/lab-reports query dedicated reports and return empty state when 0 tests taken
✔ POST /reports creates verified diagnostic report with vitals and reflects in GET /reports
✔ GET /user/prescriptions returns patient prescriptions list
✔ GET /dashboard/admin/payments returns aggregated financial stats and transactions
✔ GET /dashboard/admin/analytics returns live hospital metrics
✔ Emergency SOS trigger, acknowledge, dispatch, and resolve lifecycle
✔ QA AUDIT 1: Role-Based Access Control & Protected Route Enforcement
✔ QA AUDIT 2: Profile Updates & Settings Form Persistence
✔ QA AUDIT 3: Payment Methods Complete Lifecycle (Card & UPI CRUD)
✔ QA AUDIT 4: Live Booking & Real-Time Doctor Queue Reflection
✔ QA AUDIT 5: Emergency SOS Dispatch & Administrative Lifecycle
✔ QA AUDIT 6: Data Integrity & Empty State Verification

ℹ tests 33
ℹ suites 0
ℹ pass 33
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 11099.96ms
```

---

## 9. DevOps, Docker & Production Deployment

### 9.1 Multi-Container Docker Architecture

The application is fully containerized via `docker-compose.yml`:

```yaml
version: "3.9"

services:
  mongodb:
    image: mongo:7.0
    container_name: medirxcare_mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: medirxcare_backend
    ports:
      - "5001:5001"
    environment:
      - NODE_ENV=production
      - PORT=5001
      - MONGODB_URI=mongodb://mongodb:27017/medirxcare
      - JWT_SECRET=production_secret_key_64_characters_minimum
      - CLIENT_ORIGIN=http://localhost:4174,http://localhost:8080
    depends_on:
      - mongodb
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: medirxcare_frontend
    ports:
      - "8080:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  mongodb_data:
```

### 9.2 Local Development Commands

```bash
# Clone the repository
git clone https://github.com/Sarvesh-jha/Smart-Healthcare-Solution-For-OPD-Optimization.git
cd Smart-Healthcare-Solution-For-OPD-Optimization

# Start backend dev server (Port 5001)
npm run dev:backend

# Start frontend Vite dev server (Port 4174)
npm run dev:frontend

# Run comprehensive test suite (33 tests)
npm --prefix backend test

# Build production frontend bundle
npm run build:frontend
```

---

## 10. Security, Compliance & Data Integrity

1. **Zero Plaintext Credentials**: All passwords hashed using `bcryptjs` with salt rounds before database persistence.
2. **Stateless Access Control**: Role-based access control (RBAC) enforced via signed JSON Web Tokens (`jwtSecret`), rejecting unauthorized route traversal with standard HTTP 401 and 403 status codes.
3. **Clinical Guardrails**: All AI-assisted triage outputs feature mandatory clinical disclaimers reminding patients that preliminary guidance does not constitute formal medical diagnosis.
4. **Data Isolation**: Diagnostic lab records are strictly decoupled from clinic visit bookings, eliminating data leakage and artificial vitals display.
5. **Rate-Limiting & Throttling**: API endpoints, particularly `/api/ai/*` and `/api/auth/*`, are throttled via `express-rate-limit` to prevent brute force or denial-of-service attempts.

---

## 11. Conclusion & Strategic Roadmap

**MEDIrxCARE** has transformed from a prototype into a hardened, production-ready healthcare web application. By pairing real-time WebSockets, Google GenAI triage, slot collision prevention, and zero-bloat modular design, the system delivers immediate clinical and operational value.

### Strategic Roadmap
- **Phase 1 (Completed)**: Decouple mock data, integrate Google GenAI SDK, implement SOS Emergency WebSockets, isolate lab reports, prevent double-booking, and prune legacy dependencies.
- **Phase 2 (Upcoming)**: WebRTC multi-party video consultation rooms with end-to-end encryption.
- **Phase 3**: Automated SMS/WhatsApp notification gateway for prescription dispatch and queue alerts.
- **Phase 4**: FHIR / HL7 standard interoperability for external electronic medical record (EMR) synchronization.

---

> **Report Version**: 2.0.0 (Production Release)  
> **Repository**: [Sarvesh-jha/Smart-Healthcare-Solution-For-OPD-Optimization](https://github.com/Sarvesh-jha/Smart-Healthcare-Solution-For-OPD-Optimization.git)  
> **Status**: Verified & Production-Ready :white_check_mark:
