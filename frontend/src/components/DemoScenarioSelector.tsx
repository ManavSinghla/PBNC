import React, { useState } from 'react';
import { Play, Sparkles, AlertTriangle, Layers, FileCheck, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

interface DemoScenarioSelectorProps {
  onScenarioTriggered: () => void;
}

export const DemoScenarioSelector: React.FC<DemoScenarioSelectorProps> = ({ onScenarioTriggered }) => {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const scenarios = [
    {
      key: 'standard-pdf',
      scenariosCovered: '1, 4, 6, 9',
      title: 'Digital Exam PDF',
      badge: 'PDF',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      description: 'Clean digital exam paper with 5 MCQs, options, and end-of-document answer key.',
      icon: FileCheck
    },
    {
      key: 'scanned-image',
      scenariosCovered: '2, 6',
      title: 'Exam Image OCR',
      badge: 'JPG',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      description: 'High-res image scan of mathematics problems parsed via Vision OCR.',
      icon: Sparkles
    },
    {
      key: 'low-confidence-scan',
      scenariosCovered: '3, 8',
      title: 'Noisy Scan & Review Flags',
      badge: 'PNG',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      description: 'Low-contrast scanned circuit problem with image noise and uncertain answer key.',
      icon: AlertTriangle
    },
    {
      key: 'multipage-split',
      scenariosCovered: '5',
      title: 'Cross-Page Split Question',
      badge: '2-Page PDF',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      description: 'Question 4 starts at bottom of Page 1; options continue onto Page 2.',
      icon: Layers
    },
    {
      key: 'paired-docs',
      scenariosCovered: '7',
      title: 'Question Paper + Answer Key',
      badge: 'Paired Docs',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      description: 'Associates two separate documents and cross-matches correct answers automatically.',
      icon: CheckCircle2
    },
    {
      key: 'invalid-corrupt',
      scenariosCovered: '10',
      title: 'Corrupt / Invalid Document',
      badge: 'Invalid',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      description: 'Demonstrates graceful validation failure handling for malformed uploads.',
      icon: ShieldAlert
    }
  ];

  const handleRunScenario = async (key: string) => {
    try {
      setLoadingKey(key);
      await api.seedScenario(key);
      onScenarioTriggered();
    } catch (err: any) {
      alert(`Scenario execution error: ${err.message}`);
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-cyan-500/10 text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              1-Click Assignment Demonstration Scenarios (1 to 10)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Instantly load and test each required evaluation scenario without manual file preparation.
          </p>
        </div>
        <span className="text-[11px] text-slate-500 font-mono bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800 self-start">
          Section 12 Compliant
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {scenarios.map((s) => {
          const IconComponent = s.icon;
          const isLoading = loadingKey === s.key;

          return (
            <div
              key={s.key}
              className="bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300 group-hover:text-cyan-400 transition-colors">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-200">{s.title}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${s.badgeColor}`}>
                    {s.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">
                  {s.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                <span className="text-[10px] text-slate-500 font-mono">
                  Scenarios: {s.scenariosCovered}
                </span>
                <button
                  onClick={() => handleRunScenario(s.key)}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Play className="w-3 h-3 fill-current" />
                  )}
                  <span>{isLoading ? 'Running...' : 'Run Demo'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
