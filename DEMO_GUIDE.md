# Demonstration Guide: 10 Assignment Scenarios

This document provides step-by-step instructions and evidence for each of the **10 required demonstration scenarios** specified in Section 12 of the Pragati Bharati Engineering Assignment.

Evaluators can verify these scenarios either using the **Interactive Web Dashboard** or the **API (Postman / cURL)**.

---

## Quick Start
1. **Start Backend**:
   ```bash
   cd backend
   npm start
   # Service starts on http://localhost:5000
   ```
2. **Start Frontend ("The Website")**:
   ```bash
   cd frontend
   npm run dev
   # Dashboard opens at http://localhost:5173
   ```
3. Open `http://localhost:5173` in your browser. The top bar contains the **1-Click Assignment Demonstration Scenarios** launcher.

---

## Scenario 1: Uploading a PDF
- **Objective**: Upload a digital PDF document and verify ingestion.
- **Web UI**: Click the **"Digital Exam PDF"** button in the top Demo Showcase, or drag-and-drop `samples/sample_exam.pdf` into the Upload Studio.
- **API Request**:
  ```bash
  curl -X POST http://localhost:5000/api/v1/demo/seed/standard-pdf
  ```
- **Expected Result**: Document is accepted with HTTP 202, enqueued with status `QUEUED`, and progresses through the asynchronous pipeline to `COMPLETED`.

---

## Scenario 2: Uploading an Image
- **Objective**: Upload an image format (JPG or PNG) and verify image handling.
- **Web UI**: Click **"Exam Image OCR"** or drop `samples/sample_question.jpg`.
- **API Request**:
  ```bash
  curl -X POST http://localhost:5000/api/v1/demo/seed/scanned-image
  ```
- **Expected Result**: Backend processes image without failing, detects questions, and extracts options.

---

## Scenario 3: Processing a Scanned / Low-Quality Document
- **Objective**: Ingest a noisy, low-contrast, or scanned document and identify imperfect extraction.
- **Web UI**: Click **"Noisy Scan & Review Flags"** or drop `samples/sample_scanned_noisy.png`.
- **API Request**:
  ```bash
  curl -X POST http://localhost:5000/api/v1/demo/seed/low-confidence-scan
  ```
- **Expected Result**: Successfully extracts content while tagging question with `needs_review: true` and warning reasons (e.g. `Low contrast scan with image noise`).

---

## Scenario 4: Extracting Multiple Questions
- **Objective**: Extract multiple questions from a single document.
- **Web UI**: In the right panel of `sample_exam.pdf`, observe Question 1 through Question 5 extracted sequentially.
- **API Request**:
  ```bash
  curl http://localhost:5000/api/v1/documents/{document_id}/questions
  ```
- **Expected Result**: Returns array of 5 distinct questions with individual question numbers, prompt texts, and option sets.

---

## Scenario 5: Handling a Question Spanning Multiple Pages
- **Objective**: Stitch a question that begins on Page 1 and whose options continue onto Page 2.
- **Web UI**: Click **"Cross-Page Split Question"** or drop `samples/sample_multipage_split.pdf`. Inspect Question 4.
- **API Request**:
  ```bash
  curl -X POST http://localhost:5000/api/v1/demo/seed/multipage-split
  ```
- **Expected Result**:
  - `source_pages: [1, 2]`
  - Options A and B (from page 1) and Options C and D (from page 2) are merged into one continuous question.
  - Card displays the purple badge `Spans Pages 1, 2`.

---

## Scenario 6: Extracting Question Options & Types
- **Objective**: Extract varied option formats and question types.
- **Web UI**: Review extracted cards showing:
  - `MULTIPLE_CHOICE`: 4 discrete options with key badges (A, B, C, D).
  - `TRUE_FALSE`: Binary True/False options.
  - `SHORT_ANSWER`: Descriptive prompt without options.
- **Expected Result**: Options are structured as `[{"key": "A", "text": "..."}]` rather than raw concatenated strings.

---

## Scenario 7: Detecting and Associating an Answer Key
- **Objective**: Detect embedded answer keys OR associate a separate answer key document.
- **Option A (Embedded)**: Present at end of `sample_exam.pdf`. Questions 1-4 automatically show `Matched from Embedded Key` with detected answer highlighted in green.
- **Option B (Separate Document)**:
  - Click **"Question Paper + Answer Key"** in the demo bar.
  - Automatically ingests `sample_question_paper.pdf` and `sample_answer_key.pdf`, links them, and matches answers across documents.
- **API Request**:
  ```bash
  curl http://localhost:5000/api/v1/documents/{document_id}/answer-key
  ```

---

## Scenario 8: Showing an Uncertain / Low-Confidence Extraction
- **Objective**: Identify questions requiring human review rather than silently guessing.
- **Web UI**: Switch to the **"Needs Review"** or **"Low Confidence (<75%)"** tab.
  - Observe Question 4 (Confidence 65%) with yellow warning alert: `Diagram text has moderate OCR noise`, `Answer confidence below 70%`.
- **API Request**:
  ```bash
  curl http://localhost:5000/api/v1/documents/{document_id}/review-items
  ```
- **Expected Result**: Structured array of warnings, anomaly codes (`LOW_CONFIDENCE_SCAN`, `SPLIT_ACROSS_PAGES`), and suggested reviewer actions.

---

## Scenario 9: Retrieving the Final Structured Question Data
- **Objective**: Output clean, system-independent JSON matching Section 7 schema.
- **Web UI**: Click the **"Export JSON"** button in the top right of the questions panel. A live syntax-highlighted modal appears with 1-click **"Copy JSON"** and **"Download File"**.
- **API Request**:
  ```bash
  curl http://localhost:5000/api/v1/documents/{document_id}/export
  ```
- **Expected Result**:
  ```json
  {
    "metadata": { ... },
    "summary": { "total_questions": 5, "high_confidence_count": 3, "needs_review_count": 2 },
    "questions": [
      {
        "question_number": "1",
        "question": "What is the primary function...",
        "options": [ ... ],
        "answer": "B",
        "source_pages": [1],
        "confidence": 0.96
      }
    ]
  }
  ```

---

## Scenario 10: Handling Invalid or Unsupported Documents
- **Objective**: Validate malicious/corrupt uploads and return friendly, descriptive error messages.
- **Web UI**: Click **"Corrupt / Invalid Document"** in the top showcase or upload an unsupported `.exe` / `.txt` file.
- **API Request**:
  ```bash
  curl -X POST http://localhost:5000/api/v1/demo/seed/invalid-corrupt
  ```
- **Expected Result**: System transitions status to `FAILED` with descriptive error: `Document validation failed: Malformed file structure or unreadable binary header`. Returns HTTP 400 when an unsupported extension is uploaded.
