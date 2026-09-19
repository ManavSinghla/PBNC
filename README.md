# Pragati Bharati — Document Intelligence & Question Extraction Service
> **Full Stack Developer Assignment — Round 2**

An enterprise-grade, asynchronous Document Intelligence platform that ingests examination materials (digitally generated PDFs, scanned low-resolution papers, single/multi-page images) and transforms them into structured, machine-readable question banks with automated answer-key association, confidence calibration, and human-in-the-loop review.

---

## 🌟 Highlights
- **Node.js & Express REST Backend**: High-throughput API layer with JWT authentication, Multer security validation, and asynchronous FIFO job queue.
- **Interactive React & Tailwind Dashboard ("The Website")**: Dual-pane workspace with document page viewer, live async stepper, confidence badge scoring, question editing/approval, and 1-click scenario showcase.
- **Multi-Topology Answer Key Extraction**: Embedded answer key detection + multi-document pairing (`Question Paper` + `Answer Key` document association).
- **Cross-Page Question Stitching**: Seamlessly stitches questions that span page boundaries (e.g. prompt on Page 1, options on Page 2).
- **Granular Confidence & Anomaly Scoring**: Evaluates structural completeness and scan noise; flags uncertain items for human review rather than silently guessing.
- **Standardized Machine-Readable Output**: Strict system-independent JSON schema matching Section 7 of the problem statement.
- **10 Demonstration Scenarios Pre-loaded**: Instant 1-click launchers for every scenario required in Section 12.

---

## 🚀 Quickstart (Running Locally)

### 1. Prerequisites
- **Node.js**: v18 or higher (v20+ recommended)
- **npm**: v9 or higher

### 2. Launch the Backend
```bash
cd backend
npm install
npm start
```
*Backend runs on: `http://localhost:5000`*  
*Healthcheck & Stats: `http://localhost:5000/api/v1/health`*

### 3. Launch the Frontend Website
```bash
cd frontend
npm install
npm run dev
```
*Website runs on: `http://localhost:5173`*

---

## 🐳 Running with Docker Compose (PostgreSQL + Redis)
To run the complete production stack with native PostgreSQL and Redis:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- PostgreSQL: Port `5432`
- Redis: Port `6379`

---

## 📂 Deliverables Overview (Matching Section 13)

| Deliverable | Location / Description |
|---|---|
| **1. Complete Source Code** | `backend/` (Express API) and `frontend/` (React Dashboard) |
| **2. Database Migrations / Schema** | `backend/src/db/database.js` (Persistent relational store) |
| **3. Sample Input Documents** | `samples/` (Clean PDF, Scanned Image, Multi-page split, Paired docs, Corrupt file) |
| **4. Sample Extracted Output** | `samples/output/` (Clean JSON outputs for each scenario) |
| **5. Setup Instructions** | `README.md` (this file) & `start.bat` |
| **6. Architecture Documentation** | `ARCHITECTURE.md` (Design document with Mermaid diagrams) |
| **7. Postman Collection** | `postman_collection.json` (Pre-configured for all 10 scenarios) |
| **8. Demonstration Scenarios Guide** | `DEMO_GUIDE.md` (Step-by-step evidence for Scenarios 1–10) |

---

## 🧭 10 Demonstration Scenarios (Section 12 Compliance)

| # | Scenario | How to Verify in Website | API Endpoint |
|---|---|---|---|
| **1** | Uploading a PDF | Click **"Digital Exam PDF"** or upload PDF | `POST /api/v1/demo/seed/standard-pdf` |
| **2** | Uploading an Image | Click **"Exam Image OCR"** or upload JPG/PNG | `POST /api/v1/demo/seed/scanned-image` |
| **3** | Scanned / Low-Quality Doc | Click **"Noisy Scan & Review Flags"** | `POST /api/v1/demo/seed/low-confidence-scan` |
| **4** | Extracting Multiple Questions | Inspect extracted question list (Q1–Q5) | `GET /api/v1/documents/:id/questions` |
| **5** | Question Spanning Multiple Pages | Click **"Cross-Page Split Question"** (Q4 spans Pg 1-2) | `POST /api/v1/demo/seed/multipage-split` |
| **6** | Extracting Question Options | Inspect option pills (A, B, C, D) & types | `GET /api/v1/questions/:id` |
| **7** | Answer Key Detection & Association | Embedded key detection + **"Paired Docs"** button | `GET /api/v1/documents/:id/answer-key` |
| **8** | Uncertain / Low-Confidence Extraction | Switch to **"Needs Review"** or **"Low Confidence"** tab | `GET /api/v1/documents/:id/review-items` |
| **9** | Final Structured Question Output | Click **"Export JSON"** modal & download | `GET /api/v1/documents/:id/export` |
| **10**| Invalid / Unsupported Document | Click **"Corrupt / Invalid Document"** | `POST /api/v1/demo/seed/invalid-corrupt` |

---

## 📡 Required API Surface (`/api/v1`)

```http
# Authentication
POST /api/v1/auth/register          # Register user
POST /api/v1/auth/login             # Authenticate & retrieve JWT

# Document Management
POST /api/v1/documents/upload       # Upload PDF or Image (with role & pairing)
GET  /api/v1/documents              # List ingested documents
GET  /api/v1/documents/:id          # Retrieve document metadata
GET  /api/v1/documents/:id/status   # Asynchronous processing status & stage
POST /api/v1/documents/:id/associate# Associate separate Answer Key document
DELETE /api/v1/documents/:id        # Delete document

# Questions & Human-in-the-Loop Review
GET  /api/v1/documents/:id/questions# List questions (filter by confidence, needsReview)
GET  /api/v1/questions/:id          # Retrieve individual question
PUT  /api/v1/questions/:id          # Edit, verify, or flag question (HITL)

# Answer Keys, Warnings & Export
GET  /api/v1/documents/:id/answer-key # Retrieve detected answer key
GET  /api/v1/documents/:id/review-items# Retrieve warnings & review flags
GET  /api/v1/documents/:id/export   # Export structured JSON (Section 7 format)
```

---

## 🛠️ Architecture Summary
- **Asynchronous Decoupling**: File upload responds immediately with `202 Accepted` and a polling URL; the background worker processes stages asynchronously.
- **Fail-Safe Integrity**: If an answer key or option cannot be extracted with high confidence, the system tags the question with `needs_review: true` and logs specific review reasons instead of guessing.
- **Human-in-the-Loop**: Evaluators can audit low-confidence questions, edit prompts or options, and mark them as `is_verified: true`.
