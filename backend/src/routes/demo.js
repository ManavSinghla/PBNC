import express from 'express';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database.js';
import { config } from '../config.js';
import { processingQueue } from '../services/queue.js';

const router = express.Router();

const SAMPLES_DIR = path.resolve(config.DB_STORAGE_DIR, '..', '..', 'samples');

// Helper to seed a demo document
function createDemoDoc(title, filename, documentRole = 'question_paper', relatedDocumentId = null) {
  const docId = uuidv4();
  const sampleFilePath = path.join(SAMPLES_DIR, filename);

  // If sample file doesn't exist, ensure a placeholder file exists
  if (!fs.existsSync(SAMPLES_DIR)) {
    fs.mkdirSync(SAMPLES_DIR, { recursive: true });
  }
  if (!fs.existsSync(sampleFilePath)) {
    fs.writeFileSync(sampleFilePath, `Mock binary content for ${filename}`, 'utf-8');
  }

  const destPath = path.join(config.UPLOAD_DIR, `${Date.now()}-${filename}`);
  fs.copyFileSync(sampleFilePath, destPath);

  const doc = {
    id: docId,
    userId: 'anonymous-evaluator',
    title,
    filename,
    storedFilename: path.basename(destPath),
    filePath: destPath,
    fileSize: fs.statSync(destPath).size,
    fileType: path.extname(filename).toLowerCase().replace('.', ''),
    mimeType: filename.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
    documentRole,
    relatedDocumentId,
    status: 'QUEUED',
    currentStage: 'QUEUED',
    progressPct: 0,
    pageCount: 1,
    extractedQuestionsCount: 0,
    needsReviewCount: 0,
    errorMessage: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.createDocument(doc);
  processingQueue.enqueue(docId);
  return doc;
}

// 1-Click Demo Launcher for the 5 Assignment Test Scenarios
router.post('/seed/:scenarioKey', (req, res) => {
  const { scenarioKey } = req.params;

  try {
    let result = {};

    switch (scenarioKey) {
      case 'standard-pdf':
        result = createDemoDoc('Standard Computer Science Exam Paper', 'sample_exam.pdf', 'combined');
        break;

      case 'scanned-image':
        result = createDemoDoc('Scanned Mathematics Test Question', 'sample_question.jpg', 'question_paper');
        break;

      case 'low-confidence-scan':
        result = createDemoDoc('Low-Resolution Noisy Diagram Scan', 'sample_scanned_noisy.png', 'question_paper');
        break;

      case 'multipage-split':
        result = createDemoDoc('Multi-Page Question Continuation Exam', 'sample_multipage_split.pdf', 'combined');
        break;

      case 'paired-docs':
        // Creates Question Paper and Answer Key documents and links them
        const qp = createDemoDoc('Question Paper Document', 'sample_question_paper.pdf', 'question_paper');
        const ak = createDemoDoc('Separate Answer Key Document', 'sample_answer_key.pdf', 'answer_key', qp.id);
        db.updateDocument(qp.id, { relatedDocumentId: ak.id });
        result = { questionPaper: qp, answerKey: ak };
        break;

      case 'invalid-corrupt':
        result = createDemoDoc('Corrupt / Malformed Test File', 'sample_corrupt.pdf', 'question_paper');
        break;

      default:
        return res.status(400).json({ error: `Unknown scenario '${scenarioKey}'` });
    }

    res.status(202).json({
      message: `Scenario '${scenarioKey}' initiated successfully.`,
      result
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List all preset demonstration scenarios
router.get('/scenarios', (req, res) => {
  res.json({
    scenarios: [
      {
        key: 'standard-pdf',
        name: 'Scenario 1 & 4: Multi-Question Digital PDF',
        description: 'Clean digital examination paper with 5 multiple-choice questions, options, and embedded answer key.',
        fileType: 'PDF'
      },
      {
        key: 'scanned-image',
        name: 'Scenario 2 & 6: Exam Question Image',
        description: 'High-res image containing structured questions and options processed via Vision OCR.',
        fileType: 'JPG'
      },
      {
        key: 'low-confidence-scan',
        name: 'Scenario 3 & 8: Low-Quality / Imperfect Scan',
        description: 'Noisy scan with blurry text, rotated diagrams, and low-confidence flags requiring human review.',
        fileType: 'PNG'
      },
      {
        key: 'multipage-split',
        name: 'Scenario 5: Multi-Page Split Question',
        description: 'Question 4 starts at the bottom of Page 1 and options continue onto Page 2.',
        fileType: 'PDF'
      },
      {
        key: 'paired-docs',
        name: 'Scenario 7: Paired Documents (Question Paper + Answer Key)',
        description: 'Demonstrates two separate documents (Question Paper and Answer Key) associated together.',
        fileType: 'Multi-Doc'
      },
      {
        key: 'invalid-corrupt',
        name: 'Scenario 10: Unsupported / Corrupt Document',
        description: 'Graceful handling of corrupt file format with structured error codes and descriptive message.',
        fileType: 'Corrupt'
      }
    ]
  });
});

export default router;
