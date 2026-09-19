import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, Edit3, Flag, Check, Save, X, Layers, Image as ImageIcon } from 'lucide-react';
import { ExtractedQuestion } from '../types';

interface QuestionCardProps {
  question: ExtractedQuestion;
  onUpdate: (id: string, updates: Partial<ExtractedQuestion>) => Promise<void>;
  onSelectPage?: (page: number) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onUpdate, onSelectPage }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(question.questionText);
  const [editedAnswer, setEditedAnswer] = useState(question.detectedAnswer || '');
  const [isSaving, setIsSaving] = useState(false);

  const confidencePct = Math.round(question.confidence * 100);

  // Confidence color grading
  const getConfidenceBadge = () => {
    if (confidencePct >= 85) {
      return {
        bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        label: `${confidencePct}% Confidence (High)`
      };
    } else if (confidencePct >= 65) {
      return {
        bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        label: `${confidencePct}% Confidence (Moderate)`
      };
    } else {
      return {
        bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        label: `${confidencePct}% Confidence (Low / Review Needed)`
      };
    }
  };

  const badge = getConfidenceBadge();

  const handleSaveEdit = async () => {
    try {
      setIsSaving(true);
      await onUpdate(question.id, {
        questionText: editedText,
        detectedAnswer: editedAnswer || null,
        isVerified: true,
        needsReview: false
      });
      setIsEditing(false);
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleVerified = async () => {
    await onUpdate(question.id, {
      isVerified: !question.isVerified,
      needsReview: question.isVerified // if un-verifying, flag for review
    });
  };

  const handleFlagForReview = async () => {
    await onUpdate(question.id, {
      needsReview: true,
      isVerified: false,
      reviewReasons: [...question.reviewReasons, 'Manually flagged by reviewer for audit']
    });
  };

  return (
    <div
      className={`glass-card rounded-2xl p-5 border transition-all ${
        question.isVerified
          ? 'border-emerald-500/40 bg-emerald-950/10'
          : question.needsReview
          ? 'border-amber-500/40 bg-amber-950/10'
          : 'border-slate-800'
      }`}
    >
      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-8 h-8 rounded-lg bg-slate-800 text-cyan-400 font-bold font-mono text-sm flex items-center justify-center border border-slate-700">
            {question.questionNumber}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
            {question.questionType.replace('_', ' ')}
          </span>
          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${badge.bg}`}>
            {badge.label}
          </span>

          {question.hasImagesOrTables && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              Diagram / Image
            </span>
          )}

          {question.sourcePages.length > 1 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1 font-mono">
              <Layers className="w-3 h-3" />
              Spans Pages {question.sourcePages.join(', ')}
            </span>
          )}
        </div>

        {/* Source Page badge with click jump */}
        <div className="flex items-center gap-2">
          {question.sourcePages.map((pg) => (
            <button
              key={pg}
              onClick={() => onSelectPage && onSelectPage(pg)}
              className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 border border-slate-700 transition-colors"
              title={`View Page ${pg} in document viewer`}
            >
              Page {pg}
            </button>
          ))}
        </div>
      </div>

      {/* Review Warning Alerts */}
      {question.needsReview && question.reviewReasons.length > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="font-semibold block text-amber-200">Review Required:</strong>
            {question.reviewReasons.map((r, i) => (
              <p key={i} className="text-amber-300/90">• {r}</p>
            ))}
          </div>
        </div>
      )}

      {/* Question Body */}
      {isEditing ? (
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Question Text</label>
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              rows={3}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Correct Answer (e.g. A, B, C, D)</label>
            <input
              type="text"
              value={editedAnswer}
              onChange={(e) => setEditedAnswer(e.target.value.toUpperCase())}
              className="w-24 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-100 leading-relaxed font-medium mb-4">
          {question.questionText}
        </p>
      )}

      {/* Options List for MCQs */}
      {question.options && question.options.length > 0 && (
        <div className="space-y-2 mb-4">
          {question.options.map((opt) => {
            const isDetectedAnswer = question.detectedAnswer === opt.key;
            return (
              <div
                key={opt.key}
                className={`p-2.5 rounded-xl border flex items-start gap-3 transition-colors ${
                  isDetectedAnswer
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                    : 'bg-slate-900/40 border-slate-800 text-slate-300'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-md font-mono text-xs flex items-center justify-center shrink-0 ${
                    isDetectedAnswer
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 font-medium'
                  }`}
                >
                  {opt.key}
                </span>
                <span className="text-xs leading-normal pt-0.5">{opt.text}</span>
                {isDetectedAnswer && (
                  <span className="ml-auto text-[11px] font-mono font-semibold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/20 shrink-0">
                    Correct Answer
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Answer Key Source Information */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Answer Association:</span>
          {question.answerMatched ? (
            <span className="font-mono text-slate-300 flex items-center gap-1.5">
              <strong className="text-emerald-400 font-bold">{question.detectedAnswer}</strong>
              <span className="text-slate-500">via</span>
              <span className="text-cyan-400">
                {question.answerSource === 'in_document'
                  ? 'Embedded Key'
                  : question.answerSource === 'separate_answer_key'
                  ? 'Paired Key Document'
                  : 'Manual Review'}
              </span>
            </span>
          ) : (
            <span className="text-amber-400/80 font-mono">Unmatched / Pending Review</span>
          )}
        </div>

        {/* Human-in-the-Loop Actions */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
                title="Edit question text or answer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <button
                onClick={handleFlagForReview}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-medium border border-amber-500/20 transition-all"
                title="Flag for manual inspection"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Flag</span>
              </button>

              <button
                onClick={handleToggleVerified}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  question.isVerified
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 hover:bg-emerald-600/20 text-slate-300 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/30'
                }`}
              >
                {question.isVerified ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
