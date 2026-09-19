import React from 'react';
import { FileText, Cpu, Database, CheckCircle2, ShieldCheck } from 'lucide-react';
import { SystemStats } from '../types';

interface HeaderProps {
  stats: SystemStats | null;
  backendOnline: boolean;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({ stats, backendOnline, onRefresh }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">Pragati Bharati</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
                Round 2 Assignment
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Document Intelligence & Question Extraction Service
            </p>
          </div>
        </div>

        {/* Live Metrics & Status */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-5 text-xs text-slate-400 mr-2">
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Docs: <strong className="text-slate-200">{stats?.totalDocuments ?? 0}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>Questions: <strong className="text-slate-200">{stats?.totalQuestionsExtracted ?? 0}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>High Conf: <strong className="text-emerald-400">{stats?.highConfidenceQuestions ?? 0}</strong></span>
            </div>
            {stats && stats.questionsRequiringReview > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                <span>Needs Review: <strong>{stats.questionsRequiringReview}</strong></span>
              </div>
            )}
          </div>

          {/* Backend Status Badge */}
          <button 
            onClick={onRefresh}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200"
            title="Click to refresh system state"
          >
            <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            {backendOnline ? 'API Connected' : 'Offline'}
          </button>

          {/* Security & Docs link */}
          <a
            href="/api/v1/health"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Health & API</span>
          </a>
        </div>
      </div>
    </header>
  );
};
