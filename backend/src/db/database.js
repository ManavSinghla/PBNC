import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

// Ensure data directory exists
if (!fs.existsSync(config.DB_STORAGE_DIR)) {
  fs.mkdirSync(config.DB_STORAGE_DIR, { recursive: true });
}

const DB_FILE = path.join(config.DB_STORAGE_DIR, 'pbnc_store.json');

class Database {
  constructor() {
    this.data = {
      users: [],
      documents: [],
      questions: [],
      answer_keys: [],
      review_items: []
    };
    this.init();
  }

  init() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(content);
        // ensure all tables exist
        this.data.users = this.data.users || [];
        this.data.documents = this.data.documents || [];
        this.data.questions = this.data.questions || [];
        this.data.answer_keys = this.data.answer_keys || [];
        this.data.review_items = this.data.review_items || [];
      } catch (err) {
        console.error('Error loading DB file, initializing fresh:', err.message);
        this.save();
      }
    } else {
      this.save();
    }
  }

  save() {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Error saving DB:', err);
    }
  }

  // --- Users ---
  findUserByEmail(email) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  createUser(user) {
    this.data.users.push(user);
    this.save();
    return user;
  }

  // --- Documents ---
  getDocuments(userId = null) {
    let docs = this.data.documents;
    if (userId && !userId.includes('anonymous')) {
      docs = docs.filter(d => d.userId === userId);
    }
    return docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getDocumentById(id) {
    return this.data.documents.find(d => d.id === id);
  }

  createDocument(doc) {
    this.data.documents.push(doc);
    this.save();
    return doc;
  }

  updateDocument(id, updates) {
    const idx = this.data.documents.findIndex(d => d.id === id);
    if (idx !== -1) {
      this.data.documents[idx] = {
        ...this.data.documents[idx],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.save();
      return this.data.documents[idx];
    }
    return null;
  }

  deleteDocument(id) {
    this.data.documents = this.data.documents.filter(d => d.id !== id);
    this.data.questions = this.data.questions.filter(q => q.documentId !== id);
    this.data.answer_keys = this.data.answer_keys.filter(a => a.documentId !== id);
    this.data.review_items = this.data.review_items.filter(r => r.documentId !== id);
    this.save();
    return true;
  }

  // --- Questions ---
  getQuestions(documentId, filters = {}) {
    let qList = this.data.questions.filter(q => q.documentId === documentId);
    
    if (filters.needsReview !== undefined) {
      const boolVal = filters.needsReview === 'true' || filters.needsReview === true;
      qList = qList.filter(q => q.needsReview === boolVal);
    }
    if (filters.minConfidence !== undefined) {
      const minConf = parseFloat(filters.minConfidence);
      if (!isNaN(minConf)) {
        qList = qList.filter(q => q.confidence >= minConf);
      }
    }
    if (filters.type) {
      qList = qList.filter(q => q.questionType === filters.type);
    }
    return qList.sort((a, b) => {
      // Natural sort by question number
      return (parseInt(a.questionNumber) || 0) - (parseInt(b.questionNumber) || 0);
    });
  }

  getQuestionById(id) {
    return this.data.questions.find(q => q.id === id);
  }

  createQuestion(question) {
    this.data.questions.push(question);
    this.save();
    return question;
  }

  createQuestionsBatch(questions) {
    this.data.questions.push(...questions);
    this.save();
    return questions;
  }

  updateQuestion(id, updates) {
    const idx = this.data.questions.findIndex(q => q.id === id);
    if (idx !== -1) {
      this.data.questions[idx] = {
        ...this.data.questions[idx],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.save();
      return this.data.questions[idx];
    }
    return null;
  }

  // --- Answer Keys ---
  getAnswerKeyByDocumentId(documentId) {
    return this.data.answer_keys.find(a => a.documentId === documentId);
  }

  createOrUpdateAnswerKey(answerKey) {
    const idx = this.data.answer_keys.findIndex(a => a.documentId === answerKey.documentId);
    if (idx !== -1) {
      this.data.answer_keys[idx] = { ...this.data.answer_keys[idx], ...answerKey, updatedAt: new Date().toISOString() };
    } else {
      this.data.answer_keys.push(answerKey);
    }
    this.save();
    return answerKey;
  }

  // --- Review Items ---
  getReviewItems(documentId) {
    return this.data.review_items.filter(r => r.documentId === documentId);
  }

  createReviewItem(item) {
    this.data.review_items.push(item);
    this.save();
    return item;
  }

  createReviewItemsBatch(items) {
    this.data.review_items.push(...items);
    this.save();
    return items;
  }
}

export const db = new Database();
