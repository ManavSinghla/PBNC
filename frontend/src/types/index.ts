export type DocumentStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type ProcessingStage = 'QUEUED' | 'PREPROCESSING' | 'EXTRACTION' | 'ANSWER_MATCHING' | 'COMPLETED' | 'FAILED';
export type DocumentRole = 'question_paper' | 'answer_key' | 'combined';

export interface DocumentItem {
  id: string;
  userId: string;
  title: string;
  filename: string;
  storedFilename: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  mimeType: string;
  documentRole: DocumentRole;
  relatedDocumentId?: string | null;
  status: DocumentStatus;
  currentStage: ProcessingStage;
  progressPct: number;
  pageCount: number;
  extractedQuestionsCount: number;
  needsReviewCount: number;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionOption {
  key: string;
  text: string;
}

export interface ExtractedQuestion {
  id: string;
  documentId: string;
  questionNumber: string;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'MULTI_SELECT' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'FILL_BLANK' | 'ESSAY';
  options: QuestionOption[];
  detectedAnswer: string | null;
  answerConfidence: number;
  answerMatched: boolean;
  answerSource: 'in_document' | 'separate_answer_key' | 'unmatched' | 'manual_review';
  sourcePages: number[];
  hasImagesOrTables: boolean;
  confidence: number;
  needsReview: boolean;
  reviewReasons: string[];
  isVerified: boolean;
}

export interface AnswerKeyData {
  rawContent: string;
  parsedPairs: Record<string, string>;
  sourcePage: number;
  sourceType: string;
  confidence: number;
}

export interface ReviewItem {
  id: string;
  documentId: string;
  questionId?: string;
  severity: 'INFO' | 'WARNING' | 'ERROR';
  code: string;
  message: string;
}

export interface SystemStats {
  totalDocuments: number;
  completedDocuments: number;
  processingDocuments: number;
  totalQuestionsExtracted: number;
  questionsRequiringReview: number;
  highConfidenceQuestions: number;
}
