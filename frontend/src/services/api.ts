const API_BASE = '/api/v1';

export const api = {
  // Stats & Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  async getStats() {
    const res = await fetch(`${API_BASE}/stats`);
    return res.json();
  },

  // Documents
  async getDocuments() {
    const res = await fetch(`${API_BASE}/documents`);
    return res.json();
  },

  async getDocument(id: string) {
    const res = await fetch(`${API_BASE}/documents/${id}`);
    return res.json();
  },

  async getDocumentStatus(id: string) {
    const res = await fetch(`${API_BASE}/documents/${id}/status`);
    return res.json();
  },

  async uploadDocument(formData: FormData) {
    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Upload failed');
    }
    return data;
  },

  async associateDocuments(documentId: string, relatedDocumentId: string) {
    const res = await fetch(`${API_BASE}/documents/${documentId}/associate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ relatedDocumentId })
    });
    return res.json();
  },

  async deleteDocument(id: string) {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Questions
  async getQuestions(documentId: string, filters: { needsReview?: boolean; minConfidence?: number; type?: string } = {}) {
    const params = new URLSearchParams();
    if (filters.needsReview !== undefined) params.append('needsReview', String(filters.needsReview));
    if (filters.minConfidence !== undefined) params.append('minConfidence', String(filters.minConfidence));
    if (filters.type) params.append('type', filters.type);

    const res = await fetch(`${API_BASE}/documents/${documentId}/questions?${params.toString()}`);
    return res.json();
  },

  async updateQuestion(id: string, updates: any) {
    const res = await fetch(`${API_BASE}/questions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  // Answer Key & Review Items
  async getAnswerKey(documentId: string) {
    const res = await fetch(`${API_BASE}/documents/${documentId}/answer-key`);
    return res.json();
  },

  async getReviewItems(documentId: string) {
    const res = await fetch(`${API_BASE}/documents/${documentId}/review-items`);
    return res.json();
  },

  // Export
  async getExportData(documentId: string) {
    const res = await fetch(`${API_BASE}/documents/${documentId}/export`);
    return res.json();
  },

  // Demo Scenarios
  async getScenarios() {
    const res = await fetch(`${API_BASE}/demo/scenarios`);
    return res.json();
  },

  async seedScenario(scenarioKey: string) {
    const res = await fetch(`${API_BASE}/demo/seed/${scenarioKey}`, {
      method: 'POST'
    });
    return res.json();
  }
};
