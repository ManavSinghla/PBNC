import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { db } from './db/database.js';

// Route imports
import authRoutes from './routes/auth.js';
import documentRoutes from './routes/documents.js';
import questionRoutes from './routes/questions.js';
import answerKeyRoutes from './routes/answerKeys.js';
import reviewRoutes from './routes/review.js';
import exportRoutes from './routes/export.js';
import demoRoutes from './routes/demo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file hosting for uploaded files & previews
if (!fs.existsSync(config.UPLOAD_DIR)) {
  fs.mkdirSync(config.UPLOAD_DIR, { recursive: true });
}
app.use('/uploads', express.static(config.UPLOAD_DIR));

// Healthcheck endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Pragati Bharati Document Intelligence & Question Extraction Service',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    storage: 'persistent-json-store',
    queueStatus: 'active'
  });
});

// System Stats
app.get('/api/v1/stats', (req, res) => {
  const docs = db.getDocuments();
  const allQuestions = db.data.questions;
  const reviewCount = allQuestions.filter(q => q.needsReview).length;
  
  res.json({
    totalDocuments: docs.length,
    completedDocuments: docs.filter(d => d.status === 'COMPLETED').length,
    processingDocuments: docs.filter(d => d.status === 'PROCESSING' || d.status === 'QUEUED').length,
    totalQuestionsExtracted: allQuestions.length,
    questionsRequiringReview: reviewCount,
    highConfidenceQuestions: allQuestions.filter(q => q.confidence >= 0.85).length
  });
});

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1', questionRoutes);
app.use('/api/v1', answerKeyRoutes);
app.use('/api/v1', reviewRoutes);
app.use('/api/v1', exportRoutes);
app.use('/api/v1/demo', demoRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[ServerError]', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    code: err.code || 'SERVER_ERROR'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Start server
app.listen(config.PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 PBNC Document Intelligence Service running on port ${config.PORT}`);
  console.log(`📡 API Base URL: http://localhost:${config.PORT}/api/v1`);
  console.log(`🩺 Healthcheck:  http://localhost:${config.PORT}/api/v1/health`);
  console.log(`📁 Uploads Dir:  ${config.UPLOAD_DIR}`);
  console.log(`=======================================================`);
});
