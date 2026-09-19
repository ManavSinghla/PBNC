import express from 'express';
import { db } from '../db/database.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Export structured question data matching assignment specification (Section 7)
router.get('/documents/:documentId/export', authenticateToken, (req, res) => {
  const { documentId } = req.params;
  const doc = db.getDocumentById(documentId);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const rawQuestions = db.getQuestions(documentId);
  const answerKey = db.getAnswerKeyByDocumentId(documentId);

  // Exact system-independent schema as required in Problem Statement Section 7
  const standardizedQuestions = rawQuestions.map(q => ({
    id: q.id,
    question_number: q.questionNumber,
    question: q.questionText,
    question_type: q.questionType,
    options: q.options,
    answer: q.detectedAnswer,
    answer_confidence: q.answerConfidence,
    answer_matched: q.answerMatched,
    answer_source: q.answerSource,
    source_pages: q.sourcePages,
    confidence: q.confidence,
    needs_review: q.needsReview,
    review_reasons: q.reviewReasons,
    is_verified: q.isVerified
  }));

  const exportPayload = {
    metadata: {
      service: 'Pragati Bharati Document Intelligence & Question Extraction Service',
      version: '1.0.0',
      document_id: doc.id,
      filename: doc.filename,
      file_type: doc.fileType,
      page_count: doc.pageCount,
      processing_status: doc.status,
      exported_at: new Date().toISOString()
    },
    summary: {
      total_questions: standardizedQuestions.length,
      high_confidence_count: standardizedQuestions.filter(q => q.confidence >= 0.85).length,
      needs_review_count: standardizedQuestions.filter(q => q.needs_review).length,
      answers_matched_count: standardizedQuestions.filter(q => q.answer_matched).length
    },
    answer_key: answerKey ? {
      source_type: answerKey.sourceType,
      pairs: answerKey.parsedPairs,
      confidence: answerKey.confidence
    } : null,
    questions: standardizedQuestions
  };

  const download = req.query.download === 'true';
  if (download) {
    res.setHeader('Content-Disposition', `attachment; filename="${doc.filename.replace(/\.[^/.]+$/, "")}_extracted_questions.json"`);
    res.setHeader('Content-Type', 'application/json');
  }

  res.json(exportPayload);
});

export default router;
