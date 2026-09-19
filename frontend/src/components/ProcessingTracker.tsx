import React from 'react';
import { CheckCircle2, Clock, Cpu, FileSearch, ShieldAlert, Sparkles, Layers } from 'lucide-react';
import { DocumentItem } from '../types';

interface ProcessingTrackerProps {
  document: DocumentItem | null;
  onSelectDocument: (doc: DocumentItem) => void;
}

export const ProcessingTracker: React.FC<ProcessingTrackerProps> = ({ document }) => {
  if (!document) return null;

  const stages = [
    { key: 'QUEUED', label: 'Queued', icon: Clock },
    { key: 'PREPROCESSING', label: 'Ingestion & Normalization', icon: FileSearch },
    { key: 'EXTRACTION', label: 'OCR & Question Extraction', icon: Cpu },
    { key: 'ANSWER_MATCHING', label: 'Answer Key Association', icon: Layers },
    { key: 'COMPLETED', label: 'Extraction Verified', icon: CheckCircle2 }
  ];

  const getStageStatus = (stageKey: string) => {
    if (document.status === 'FAILED') return 'failed';
    if (document.status === 'COMPLETED') return 'completed';

    const stageOrder = ['QUEUED', 'PREPROCESSING', 'EXTRACTION', 'ANSWER_MATCHING', 'COMPLETED'];
    const currentIdx = stageOrder.indexOf(document.currentStage);
    const thisIdx = stageOrder.indexOf(stageKey);

    if (thisIdx < currentIdx) return 'completed';
    if (thisIdx === currentIdx) return 'current';
    return 'pending';
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
            Asynchronous Pipeline Monitor
          </span>
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
            <span>{document.title}</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-normal">
              {document.filename}
            </span>
          </h3>
        </div>

        {/* Status Badge */}
        <div>
          {document.status === 'COMPLETED' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Completed ({document.extractedQuestionsCount} Questions)
            </span>
          )}
          {document.status === 'PROCESSING' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              Processing ({document.progressPct}%)
            </span>
          )}
          {document.status === 'QUEUED' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Clock className="w-3.5 h-3.5" />
              Queued in Worker
            </span>
          )}
          {document.status === 'FAILED' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <ShieldAlert className="w-3.5 h-3.5" />
              Failed
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 rounded-full h-2 mb-5 overflow-hidden">
        <div
          className={`h-2 transition-all duration-500 rounded-full ${
            document.status === 'FAILED'
              ? 'bg-rose-500 w-full'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600'
          }`}
          style={{ width: document.status === 'FAILED' ? '100%' : `${document.progressPct}%` }}
        />
      </div>

      {/* Stage Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {stages.map((st) => {
          const status = getStageStatus(st.key);
          const Icon = st.icon;

          return (
            <div
              key={st.key}
              className={`p-2.5 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all ${
                status === 'completed'
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                  : status === 'current'
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-sm shadow-cyan-500/10'
                  : status === 'failed'
                  ? 'bg-rose-500/5 border-rose-500/20 text-rose-400'
                  : 'bg-slate-900/40 border-slate-800 text-slate-500'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  status === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : status === 'current'
                    ? 'bg-cyan-500/20 text-cyan-300 animate-pulse'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-medium leading-tight">{st.label}</span>
            </div>
          );
        })}
      </div>

      {/* Error callout if failed */}
      {document.errorMessage && (
        <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block">Processing Exception / Validation Error:</strong>
            <span>{document.errorMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};
