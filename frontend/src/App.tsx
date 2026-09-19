import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DemoScenarioSelector } from './components/DemoScenarioSelector';
import { UploadStudio } from './components/UploadStudio';
import { ProcessingTracker } from './components/ProcessingTracker';
import { QuestionCard } from './components/QuestionCard';
import { DocumentViewer } from './components/DocumentViewer';
import { ExportModal } from './components/ExportModal';
import { api } from './services/api';
import { DocumentItem, ExtractedQuestion, SystemStats, AnswerKeyData } from './types';
import { FileQuestion, Filter, Download, Trash2, RefreshCw, Layers } from 'lucide-react';

export const App: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ExtractedQuestion[]>([]);
  const [answerKey, setAnswerKey] = useState<AnswerKeyData | null>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'all' | 'needs_review' | 'low_conf' | 'verified'>('all');
  const [activePage, setActivePage] = useState<number>(1);
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [exportData, setExportData] = useState<any>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(false);

  // Load documents and stats
  const refreshData = async () => {
    try {
      const [docsRes, statsRes] = await Promise.all([
        api.getDocuments(),
        api.getStats()
      ]);
      setDocuments(docsRes.documents || []);
      setStats(statsRes);
      setBackendOnline(true);

      // Auto select the first or most recent document if none selected
      if (!selectedDocId && docsRes.documents && docsRes.documents.length > 0) {
        setSelectedDocId(docsRes.documents[0].id);
      }
    } catch (err) {
      setBackendOnline(false);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 3000);
    return () => clearInterval(interval);
  }, []);

  // When selected document changes, fetch questions and answer keys
  useEffect(() => {
    if (!selectedDocId) {
      setQuestions([]);
      setAnswerKey(null);
      return;
    }

    const fetchDocDetails = async () => {
      try {
        setIsLoadingQuestions(true);
        const [qRes, aRes] = await Promise.all([
          api.getQuestions(selectedDocId),
          api.getAnswerKey(selectedDocId)
        ]);
        setQuestions(qRes.questions || []);
        setAnswerKey(aRes.answerKeyFound ? aRes.answerKey : null);
        setActivePage(1);
      } catch (err) {
        console.error('Failed to load doc details:', err);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    fetchDocDetails();
  }, [selectedDocId]);

  const selectedDoc = documents.find(d => d.id === selectedDocId) || null;

  // Question update handler (Human-in-the-loop)
  const handleUpdateQuestion = async (id: string, updates: Partial<ExtractedQuestion>) => {
    try {
      const res = await api.updateQuestion(id, updates);
      if (res.question) {
        setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...res.question } : q));
        refreshData();
      }
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  // Delete document handler
  const handleDeleteDoc = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document and extracted questions?')) return;
    try {
      await api.deleteDocument(id);
      const updatedDocs = documents.filter(d => d.id !== id);
      setDocuments(updatedDocs);
      if (selectedDocId === id) {
        setSelectedDocId(updatedDocs.length > 0 ? updatedDocs[0].id : null);
      }
      refreshData();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  // Open Export Modal
  const handleOpenExport = async () => {
    if (!selectedDocId) return;
    try {
      const data = await api.getExportData(selectedDocId);
      setExportData(data);
      setExportModalOpen(true);
    } catch (err: any) {
      alert(`Export error: ${err.message}`);
    }
  };

  // Filter questions based on active tab
  const filteredQuestions = questions.filter(q => {
    if (activeTab === 'needs_review') return q.needsReview;
    if (activeTab === 'low_conf') return q.confidence < 0.75;
    if (activeTab === 'verified') return q.isVerified;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Top Header */}
      <Header
        stats={stats}
        backendOnline={backendOnline}
        onRefresh={refreshData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 1. Assignment Demonstration Scenarios Launcher */}
        <DemoScenarioSelector onScenarioTriggered={refreshData} />

        {/* 2. Document Upload & Ingestion Studio */}
        <div className="mb-8">
          <UploadStudio
            documents={documents}
            onUploadSuccess={(newDoc) => {
              setDocuments(prev => [newDoc, ...prev]);
              setSelectedDocId(newDoc.id);
            }}
          />
        </div>

        {/* 3. Live Asynchronous Pipeline Progress Tracker */}
        {selectedDoc && (
          <ProcessingTracker
            document={selectedDoc}
            onSelectDocument={(doc) => setSelectedDocId(doc.id)}
          />
        )}

        {/* 4. Document Selector Pills Bar */}
        {documents.length > 0 && (
          <div className="mb-6 flex items-center justify-between gap-4 overflow-x-auto pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 shrink-0">Documents:</span>
              <div className="flex items-center gap-2 overflow-x-auto">
                {documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all shrink-0 ${
                      selectedDocId === doc.id
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span className="truncate max-w-[140px]">{doc.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      {doc.extractedQuestionsCount} Qs
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {selectedDoc && (
              <button
                onClick={() => handleDeleteDoc(selectedDoc.id)}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 shrink-0 p-1.5 hover:bg-rose-500/10 rounded-lg transition-colors"
                title="Delete this document"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}
          </div>
        )}

        {/* 5. Dual-Pane Intelligence & Verification Reviewer */}
        {selectedDoc && selectedDoc.status === 'COMPLETED' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Pane: Document Page Preview (5 cols) */}
            <div className="lg:col-span-5 sticky top-24">
              <DocumentViewer
                document={selectedDoc}
                answerKey={answerKey}
                activePage={activePage}
                onPageChange={(pg) => setActivePage(pg)}
              />
            </div>

            {/* Right Pane: Extracted Questions & Review Studio (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Question Bank Header & Filters */}
              <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === 'all'
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({questions.length})
                  </button>

                  <button
                    onClick={() => setActiveTab('needs_review')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                      activeTab === 'needs_review'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-amber-300'
                    }`}
                  >
                    <span>Needs Review</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20">
                      {questions.filter(q => q.needsReview).length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('low_conf')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === 'low_conf'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-rose-300'
                    }`}
                  >
                    Low Confidence (&lt;75%)
                  </button>

                  <button
                    onClick={() => setActiveTab('verified')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === 'verified'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-emerald-300'
                    }`}
                  >
                    Verified ({questions.filter(q => q.isVerified).length})
                  </button>
                </div>

                {/* Export Button */}
                <button
                  onClick={handleOpenExport}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-600/20 text-cyan-400 border border-slate-700 hover:border-cyan-500/40 text-xs font-semibold transition-all shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>
              </div>

              {/* Questions List */}
              {isLoadingQuestions ? (
                <div className="glass-card rounded-2xl p-12 text-center text-slate-400 flex flex-col items-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                  <span className="text-xs">Loading extracted questions...</span>
                </div>
              ) : filteredQuestions.length > 0 ? (
                <div className="space-y-4">
                  {filteredQuestions.map((q) => (
                    <QuestionCard
                      key={q.id}
                      question={q}
                      onUpdate={handleUpdateQuestion}
                      onSelectPage={(pg) => setActivePage(pg)}
                    />
                  ))}
                </div>
              ) : (
                <div className="glass-card rounded-2xl p-12 text-center text-slate-500 flex flex-col items-center gap-2">
                  <FileQuestion className="w-8 h-8 text-slate-600" />
                  <span className="text-sm font-semibold text-slate-400">No questions found in this filter</span>
                  <span className="text-xs text-slate-500">Switch tabs to view all extracted questions.</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Empty or Loading State */
          selectedDoc && selectedDoc.status === 'PROCESSING' ? (
            <div className="glass-card rounded-2xl p-16 text-center border border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                Extracting Questions & Associating Answer Keys...
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                The asynchronous worker is reading document pages, extracting formulas & options, and evaluating confidence scores.
              </p>
            </div>
          ) : documents.length === 0 ? (
            <div className="glass-card rounded-2xl p-16 text-center border border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <FileQuestion className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                No Documents Ingested Yet
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
                Click any of the <strong>1-Click Assignment Demonstration Scenarios</strong> above or drag-and-drop an exam document to start extraction.
              </p>
            </div>
          ) : null
        )}
      </main>

      {/* JSON Export Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        documentTitle={selectedDoc?.title || 'Document'}
        exportData={exportData}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 mt-12 text-center text-xs text-slate-500">
        <p>Pragati Bharati Engineering Assignment • Document Intelligence & Question Extraction Service</p>
      </footer>
    </div>
  );
};
export default App;
