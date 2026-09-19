import React, { useState, useRef } from 'react';
import { Upload, FileUp, Link2, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { DocumentItem, DocumentRole } from '../types';

interface UploadStudioProps {
  documents: DocumentItem[];
  onUploadSuccess: (newDoc: DocumentItem) => void;
}

export const UploadStudio: React.FC<UploadStudioProps> = ({ documents, onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState<DocumentRole>('question_paper');
  const [relatedDocId, setRelatedDocId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ""));
      }
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      setFile(dropped);
      if (!title) {
        setTitle(dropped.name.replace(/\.[^/.]+$/, ""));
      }
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF or image document.');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentRole', role);
      formData.append('title', title || file.name);
      if (relatedDocId) {
        formData.append('relatedDocumentId', relatedDocId);
      }

      const response = await api.uploadDocument(formData);
      onUploadSuccess(response.document);

      // Reset form
      setFile(null);
      setTitle('');
      setRelatedDocId('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Filter existing question papers for the association selector
  const availableQuestionPapers = documents.filter(d => d.documentRole === 'question_paper' || d.documentRole === 'combined');

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-cyan-400" />
            Document Ingestion & Pairing Studio
          </h2>
          <p className="text-xs text-slate-400">
            Upload single/multi-page PDFs or examination images (JPG, PNG) with optional answer key pairing.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Dropzone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragOver
              ? 'border-cyan-400 bg-cyan-500/10'
              : file
              ? 'border-emerald-500/50 bg-emerald-500/5'
              : 'border-slate-700 hover:border-slate-600 bg-slate-900/40 hover:bg-slate-900/60'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
          />

          {file ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-200">{file.name}</p>
              <p className="text-xs text-slate-400 font-mono">
                {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || 'Document'}
              </p>
              <span className="text-xs text-cyan-400 underline mt-1">Click to replace file</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center">
                <FileUp className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-slate-300">
                Drag and drop your file here, or <span className="text-cyan-400 font-semibold">browse</span>
              </p>
              <p className="text-xs text-slate-500">
                Supports PDF, JPG, PNG up to 50MB (scanned or digital)
              </p>
            </div>
          )}
        </div>

        {/* Metadata Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Document Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as DocumentRole)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="question_paper">Question Paper</option>
              <option value="answer_key">Separate Answer Key</option>
              <option value="combined">Combined (Questions + Embedded Key)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Document Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midterm Physics Exam 2026"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Association Selector for Answer Keys */}
        {role === 'answer_key' && (
          <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/20">
            <label className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5 mb-1.5">
              <Link2 className="w-3.5 h-3.5" />
              Associate with Existing Question Paper:
            </label>
            <select
              value={relatedDocId}
              onChange={(e) => setRelatedDocId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="">-- None (Pair Later) --</option>
              {availableQuestionPapers.map((qp) => (
                <option key={qp.id} value={qp.id}>
                  {qp.title} ({qp.filename})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-cyan-400/80 mt-1">
              Extracts answers from this key and automatically assigns them to questions in the selected paper.
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!file || isUploading}
          className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Uploading & Queuing Processing...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Upload Document & Start Extraction</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
