import express from 'express';
import { db } from '../db/database.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// 1. Retrieve Extracted Questions for a Document
router.get('/documents/:documentId/questions', authenticateToken, (req, res) => {
  const { documentId } = req.params;
  const { needsReview, minConfidence, type } = req.query;

  const doc = db.getDocumentById(documentId);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const questions = db.getQuestions(documentId, { needsReview, minConfidence, type });

  res.json({
    documentId,
    totalQuestions: questions.length,
    filters: {
      needsReview: needsReview || null,
      minConfidence: minConfidence || null,
      type: type || null
    },
    questions
  });
});

// 2. Retrieve Individual Question Details
router.get('/questions/:id', authenticateToken, (req, res) => {
  const question = db.getQuestionById(req.params.id);
  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }
  res.json({ question });
});

// 3. Human-In-The-Loop Verification & Edit
router.put('/questions/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const question = db.getQuestionById(id);
  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }

  const {
    questionText,
    questionNumber,
    options,
    detectedAnswer,
    isVerified,
    needsReview,
    reviewReasons
  } = req.body;

  const updates = {};
  if (questionText !== undefined) updates.questionText = questionText;
  if (questionNumber !== undefined) updates.questionNumber = questionNumber;
  if (options !== undefined) updates.options = options;
  if (detectedAnswer !== undefined) {
    updates.detectedAnswer = detectedAnswer;
    updates.answerMatched = Boolean(detectedAnswer);
    updates.answerConfidence = 1.0; // Manual human verified answer
    updates.answerSource = 'manual_review';
  }
  if (isVerified !== undefined) {
    updates.isVerified = isVerified;
    if (isVerified) {
      updates.needsReview = false;
      updates.confidence = 1.0;
    }
  }
  if (needsReview !== undefined) updates.needsReview = needsReview;
  if (reviewReasons !== undefined) updates.reviewReasons = reviewReasons;

  const updatedQuestion = db.updateQuestion(id, updates);

  // Recalculate document's needsReviewCount
  const allDocQuestions = db.getQuestions(question.documentId);
  const newReviewCount = allDocQuestions.filter(q => q.needsReview).length;
  db.updateDocument(question.documentId, { needsReviewCount: newReviewCount });

  res.json({
    message: 'Question updated and verified successfully',
    question: updatedQuestion
  });
});

export default router;
