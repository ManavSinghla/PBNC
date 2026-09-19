import express from 'express';
import { db } from '../db/database.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Retrieve Answer-Key Information for a Document
router.get('/documents/:documentId/answer-key', authenticateToken, (req, res) => {
  const { documentId } = req.params;
  const doc = db.getDocumentById(documentId);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  let answerKey = db.getAnswerKeyByDocumentId(documentId);

  // If document is paired with another document, check related answer key
  if (!answerKey && doc.relatedDocumentId) {
    answerKey = db.getAnswerKeyByDocumentId(doc.relatedDocumentId);
  }

  if (!answerKey) {
    return res.json({
      documentId,
      answerKeyFound: false,
      message: 'No separate or embedded answer key detected. Questions flagged for manual review.',
      parsedPairs: {}
    });
  }

  res.json({
    documentId,
    answerKeyFound: true,
    answerKey
  });
});

export default router;
