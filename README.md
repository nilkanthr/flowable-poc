# RAKBANK Business Account Onboarding — Flowable BPM POC

A full-stack demo application showcasing **Flowable BPM** capabilities vs Newgen iBPS,
built for RAKBANK's business banking account onboarding process.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  React UI (Vite + Tailwind)          :3000               │
│  Dashboard · New App · Task Inbox · Demo · Capabilities  │
└──────────────────────┬──────────────────────────────────┘
                       │ REST /api/*
┌──────────────────────▼──────────────────────────────────┐
│  Spring Boot 3.2 + Flowable 7.0      :8080               │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Flowable Process Engine (embedded)                │  │
│  │  BPMN: account-onboarding.bpmn20.xml               │  │
│  │  Async Job Executor (parallel tasks)               │  │
│  │  History Service (full audit trail)                │  │
│  └────────────────────────────────────────────────────┘  │
│  Stub Services (simulated external APIs)                 │
│  UAE Pass · Fircosoft · AECB · ThreatMetrix · EFR        │
│  H2 In-Memory Database (Flowable tables)                 │
└─────────────────────────────────────────────────────────┘
```

---

## Onboarding Process Flow (BPMN)

```
Start
  └─► UAE Pass Verification
        └─► ══ PARALLEL GATEWAY ══
              ├─► Fircosoft AML Screening  ─┐
              ├─► AECB Credit Bureau Check  ├─► Risk Assessment ─► Decision Engine
              └─► ThreatMetrix Fraud Check ─┘
                                                    │
                          ┌─────────────────────────┼──────────────┐
                     AUTO_APPROVE             MANUAL_REVIEW    AUTO_REJECT
                          │                        │                │
                     Approved Merge          Human Task         Rejection
                          │                  (RM / Compliance)   Notification
                     EFR Filing                   │                │
                          │               Approve / Reject         │
                     Create Account (T24)         │                │
                          │                  (merged back)         │
                     Welcome Email                                  │
                          └──────────────────────────────────────► End
```

---

## Quick Start

### Prerequisites
- Java 17+
- Maven 3.9+
- Node.js 20+

### 1. Start the Backend

```bash
cd backend
mvn spring-boot:run
```

Backend starts on **http://localhost:8080**

Useful URLs once running:
- Swagger UI:  http://localhost:8080/swagger-ui.html
- H2 Console:  http://localhost:8080/h2-console  (JDBC URL: `jdbc:h2:mem:flowabledb`)
- Actuator:    http://localhost:8080/actuator/health

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend starts on **http://localhost:3000**

---

## Demo Walkthrough (CTO Presentation)

### Scenario 1 — Parallel Processing (Happy Path)
1. Open **Demo Controls** → click **"Happy Path — Auto Approve"**
2. You're redirected to the **Application Detail** page
3. Watch the timeline — **Fircosoft, AECB, ThreatMetrix** all start simultaneously
4. All 3 complete in ~2.5s (parallel), not ~6.5s (sequential)
5. Decision Engine auto-approves → EFR filed → Account created with IBAN

**Key message:** Flowable's parallel gateway + async="true" delivers native concurrent processing.
No extra configuration — it's in the BPMN.

---

### Scenario 2 — Human Task Management (Manual Review)
1. Demo Controls → **"Manual Review — PEP Detected"**
2. Process pauses at the **Manual Review** user task
3. Go to **Task Inbox** — task appears with risk details
4. Click **Review** → enter comments → **Approve** or **Reject**
5. Process resumes and completes

**Key message:** Human tasks are first-class citizens in Flowable. SLA timer escalation
after 4 hours is a 3-line BPMN change — no Java code needed.

---

### Scenario 3 — Sanctions Hard Stop
1. Demo Controls → **"Sanctions Hit — Instant Reject"**
2. Fircosoft returns OFAC SDN match
3. Decision Engine fires Rule R-003 unconditionally → AUTO_REJECT

**Key message:** Hard-stop compliance rules are enforced by the engine itself —
no risk of human override, full audit trail of why.

---

### Scenario 4 — Hot Process Deployment
1. Open `backend/src/main/resources/processes/account-onboarding.bpmn20.xml`
2. Change a task name (e.g., `"EFR Regulatory Filing"` → `"EFR Filing v2"`)
3. Restart the backend (or use Flowable's REST deploy endpoint in production)
4. New applications use v2; any in-flight applications continue on v1
5. Check **Capabilities → Live Process Definition** — version counter incremented

**Key message:** Zero-downtime process changes. No DB migration scripts.
No "maintenance window". Old cases are never broken.

---

### Scenario 5 — Concurrent Load
1. Demo Controls → **"Bulk Launch — 5 Concurrent Applications"**
2. 5 processes start instantly
3. Dashboard shows all 5 RUNNING simultaneously
4. All 15 external service calls (5 × 3 parallel) run concurrently

**Key message:** Flowable's async executor is a production-grade job scheduler.
Add more instances → horizontal scaling with no BPM server changes.

---

## Key Flowable Capabilities Demonstrated

| Capability | How It's Shown |
|---|---|
| BPMN 2.0 Standard | account-onboarding.bpmn20.xml — open, portable, tool-agnostic |
| Parallel Gateways | Fircosoft + AECB + ThreatMetrix run simultaneously |
| Async Service Tasks | `flowable:async="true"` — non-blocking, persisted before execution |
| Human Tasks | Manual Review with candidateGroups, SLA timer, escalation |
| Boundary Timer Events | 4-hour SLA escalation to Senior Manager |
| Execution Listeners | Audit log on process start |
| Task Listeners | Notification on manual review task creation |
| Hot Deployment | Redeploy without losing in-flight instances |
| Process Versioning | v1/v2 coexist — old cases unaffected |
| History Service | Full audit trail via HistoryService API |
| Embedded Engine | No separate BPM server — runs inside Spring Boot |
| REST API | Every operation exposed via standard REST |

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/onboarding/start` | Start new onboarding |
| GET | `/api/onboarding` | List all applications |
| GET | `/api/onboarding/{id}` | Get application detail |
| GET | `/api/onboarding/{id}/variables` | Get all process variables |
| GET | `/api/onboarding/metrics` | Dashboard metrics |
| GET | `/api/tasks/pending` | Pending manual review tasks |
| POST | `/api/tasks/complete` | Complete a review task |
| POST | `/api/demo/scenario/{name}` | Run a demo scenario |
| GET | `/api/demo/capabilities` | Flowable vs Newgen comparison |

---

## Project Structure

```
flowable-poc/
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/rakbank/onboarding/
│       │   ├── delegate/          # Flowable JavaDelegate implementations
│       │   │   ├── UAEPassDelegate.java
│       │   │   ├── FircosoftDelegate.java
│       │   │   ├── AECBDelegate.java
│       │   │   ├── ThreatMatrixDelegate.java
│       │   │   ├── RiskAssessmentDelegate.java
│       │   │   ├── DecisionEngineDelegate.java
│       │   │   ├── EFRDelegate.java
│       │   │   ├── AccountCreationDelegate.java
│       │   │   └── NotificationDelegate.java
│       │   ├── service/stub/      # Simulated external service stubs
│       │   ├── controller/        # REST endpoints
│       │   ├── listener/          # Process & task event listeners
│       │   └── model/             # Request/Response DTOs
│       └── resources/
│           ├── application.yml
│           └── processes/
│               └── account-onboarding.bpmn20.xml  ← THE PROCESS
└── frontend/
    └── src/
        ├── pages/
        │   ├── Dashboard.jsx
        │   ├── NewApplication.jsx
        │   ├── ApplicationDetail.jsx  # Real-time process tracker
        │   ├── TaskInbox.jsx
        │   ├── DemoPanel.jsx          # CTO demo scenarios
        │   └── Capabilities.jsx       # Flowable vs Newgen table
        └── api/onboardingApi.js
```

---

## Extending for Production

1. **Replace H2 with PostgreSQL/Oracle** — change `application.yml` datasource
2. **Replace stubs with real APIs** — implement actual Fircosoft, AECB, UAE Pass clients
3. **Add Flowable Modeler** — drag-and-drop BPMN editor for business analysts
4. **Add DMN decision tables** — replace DecisionEngineStub with Flowable DMN rules
5. **Kubernetes deployment** — Flowable async executor supports clustered job execution
6. **Flowable Enterprise** — adds Process Analytics, Admin UI, and commercial support
