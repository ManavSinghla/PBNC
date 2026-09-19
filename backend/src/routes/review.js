import express from 'express';
import { db } from '../db/database.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Retrieve extraction warnings, anomalies, and review items for a document
router.get('/documents/:documentId/review-items', authenticateToken, (req, res) => {
  const { documentId } = req.params;
  const doc = db.getDocumentById(documentId);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const reviewItems = db.getReviewItems(documentId);
  const questionsRequiringReview = db.getQuestions(documentId, { needsReview: true });

  res.json({
    documentId,
    totalReviewItems: reviewItems.length,
    questionsRequiringReviewCount: questionsRequiringReview.length,
    reviewItems,
    flaggedQuestionsSummary: questionsRequiringReview.map(q => ({
      id: q.id,
      questionNumber: q.questionNumber,
      confidence: q.confidence,
      reviewReasons: q.reviewReasons
    }))
  });
});

export default router;
