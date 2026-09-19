import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database.js';
import { config } from '../config.js';
import { processingQueue } from '../services/queue.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Ensure upload directory exists
if (!fs.existsSync(config.UPLOAD_DIR)) {
  fs.mkdirSync(config.UPLOAD_DIR, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${uuidv4()}${ext}`;
    cb(null, uniqueName);
  }
});

// File filter validation
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Explicitly check for invalid extension test
  if (!config.ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error(`Unsupported file type '${ext}'. Only PDF, JPG, and PNG files are supported.`), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: config.MAX_FILE_SIZE_BYTES },
  fileFilter
});

// 1. Upload Document
router.post('/upload', authenticateToken, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: `File size exceeds the 50MB limit.`
        });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No document file uploaded.' });
    }

    const { documentRole = 'question_paper', relatedDocumentId = null, title = '' } = req.body;
    const documentId = uuidv4();

    const newDoc = {
      id: documentId,
      userId: req.user ? req.user.id : 'anonymous-evaluator',
      filename: req.file.originalname,
      storedFilename: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      fileType: path.extname(req.file.originalname).toLowerCase().replace('.', ''),
      mimeType: req.file.mimetype,
      documentRole: documentRole || 'question_paper',
      relatedDocumentId: relatedDocumentId || null,
      title: title || req.file.originalname,
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

    db.createDocument(newDoc);

    // Enqueue document for asynchronous processing
    processingQueue.enqueue(documentId);

    // Return 202 Accepted for asynchronous background processing
    res.status(202).json({
      message: 'Document uploaded successfully and queued for asynchronous processing.',
      document: newDoc,
      statusUrl: `/api/v1/documents/${documentId}/status`
    });
  });
});

// 2. List Documents
router.get('/', authenticateToken, (req, res) => {
  const docs = db.getDocuments(req.user ? req.user.id : null);
  res.json({ documents: docs });
});

// 3. Get Document Metadata
router.get('/:id', authenticateToken, (req, res) => {
  const doc = db.getDocumentById(req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }
  res.json({ document: doc });
});

// 4. Check Asynchronous Processing Status
router.get('/:id/status', (req, res) => {
  const doc = db.getDocumentById(req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  res.json({
    id: doc.id,
    filename: doc.filename,
    status: doc.status,
    currentStage: doc.currentStage,
    progressPct: doc.progressPct,
    pageCount: doc.pageCount,
    extractedQuestionsCount: doc.extractedQuestionsCount,
    needsReviewCount: doc.needsReviewCount,
    errorMessage: doc.errorMessage,
    updatedAt: doc.updatedAt
  });
});

// 5. Associate Related Documents (e.g. Pair Question Paper + Answer Key)
router.post('/:id/associate', authenticateToken, (req, res) => {
  const { relatedDocumentId } = req.body;
  if (!relatedDocumentId) {
    return res.status(400).json({ error: 'relatedDocumentId is required' });
  }

  const doc = db.getDocumentById(req.params.id);
  const relatedDoc = db.getDocumentById(relatedDocumentId);

  if (!doc) return res.status(404).json({ error: 'Primary document not found' });
  if (!relatedDoc) return res.status(404).json({ error: 'Related document not found' });

  // Update association
  db.updateDocument(doc.id, { relatedDocumentId: relatedDoc.id });
  db.updateDocument(relatedDoc.id, { relatedDocumentId: doc.id });

  // Re-enqueue primary document to trigger answer-key cross-matching
  processingQueue.enqueue(doc.id);

  res.json({
    message: 'Documents associated successfully. Re-processing queued to match answers.',
    documentId: doc.id,
    relatedDocumentId: relatedDoc.id
  });
});

// 6. Delete Document
router.delete('/:id', authenticateToken, (req, res) => {
  const doc = db.getDocumentById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Document not found' });

  // Delete physical file
  if (fs.existsSync(doc.filePath)) {
    try {
      fs.unlinkSync(doc.filePath);
    } catch (e) {
      console.warn('Could not delete physical file:', e.message);
    }
  }

  db.deleteDocument(doc.id);
  res.json({ message: 'Document and extracted data deleted successfully' });
});

export default router;
