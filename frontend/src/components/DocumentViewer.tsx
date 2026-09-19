import React, { useState } from 'react';
import { FileText, ChevronLeft, ChevronRight, ExternalLink, Key, Layers, Info } from 'lucide-react';
import { DocumentItem, AnswerKeyData } from '../types';

interface DocumentViewerProps {
  document: DocumentItem;
  answerKey: AnswerKeyData | null;
  activePage: number;
  onPageChange: (page: number) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  answerKey,
  activePage,
  onPageChange
}) => {
  const [showKeyModal, setShowKeyModal] = useState(false);

  const isPdf = document.fileType === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png'].includes(document.fileType);

  const fileUrl = `/uploads/${document.storedFilename}`;

  return (
    <div className="glass-card rounded-2xl border border-slate-800 flex flex-col h-full overflow-hidden">
      {/* Top Controls Bar */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2 truncate">
          <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-xs font-semibold text-white truncate" title={document.title}>
            {document.title}
          </span>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            {document.fileType}
          </span>
        </div>

        {/* Page Switcher */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onPageChange(Math.max(1, activePage - 1))}
            disabled={activePage <= 1}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 transition-all"
            title="Previous Page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-mono text-slate-300 px-1">
            {activePage} / {document.pageCount || 1}
          </span>
          <button
            onClick={() => onPageChange(Math.min(document.pageCount || 1, activePage + 1))}
            disabled={activePage >= (document.pageCount || 1)}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 transition-all"
            title="Next Page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Document Preview Pane */}
      <div className="flex-1 bg-slate-950/60 relative flex flex-col items-center justify-center p-4 min-h-[460px] overflow-auto">
        {isImage ? (
          <div className="max-w-full max-h-full flex items-center justify-center">
            <img
              src={fileUrl}
              alt={document.title}
              className="max-h-[500px] object-contain rounded-lg shadow-xl border border-slate-800"
            />
          </div>
        ) : isPdf ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 shadow-lg shadow-cyan-500/10">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200">
                {document.filename}
              </h4>
              <p className="text-xs text-slate-400 font-mono mt-1">
                {document.pageCount} Pages • {(document.fileSize / 1024).toFixed(1)} KB
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 max-w-sm text-left text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center gap-2 text-cyan-300 font-medium">
                <Info className="w-4 h-4 shrink-0" />
                <span>Document Inspector Mode</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Questions extracted on the right panel are linked to individual source pages (Page {activePage} active).
              </p>
            </div>

            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-cyan-300 border border-slate-700 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Document File in New Tab</span>
            </a>
          </div>
        ) : (
          <div className="text-center text-xs text-slate-500">
            Preview unavailable for this format
          </div>
        )}
      </div>

      {/* Answer Key Details Bar */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 truncate">
          <Key className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-slate-400 truncate">
            {answerKey && answerKey.parsedPairs && Object.keys(answerKey.parsedPairs).length > 0
              ? `Answer Key: ${Object.keys(answerKey.parsedPairs).length} answers mapped (${answerKey.sourceType})`
              : 'Answer Key: No key detected'}
          </span>
        </div>

        {answerKey && answerKey.rawContent && (
          <button
            onClick={() => setShowKeyModal(!showKeyModal)}
            className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 underline shrink-0"
          >
            {showKeyModal ? 'Hide Key' : 'View Key'}
          </button>
        )}
      </div>

      {/* Answer Key Raw Drawer */}
      {showKeyModal && answerKey && (
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-xs font-mono text-slate-300 max-h-36 overflow-y-auto">
          <p className="text-slate-500 mb-1 font-sans text-[11px]">Detected Answer Key Content:</p>
          <pre className="whitespace-pre-wrap text-[11px]">{answerKey.rawContent}</pre>
        </div>
      )}
    </div>
  );
};
