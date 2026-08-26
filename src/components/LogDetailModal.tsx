'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  X,
  Star,
  Copy,
  Check,
  Edit2,
  Trash2,
  Share2,
  GitCommit,
  Clock,
  Calendar,
} from 'lucide-react';
import { LearningLog } from '@/types';

interface LogDetailModalProps {
  log: LearningLog | null;
  onClose: () => void;
  onEdit: (log: LearningLog) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
  onTagClick: (tag: string) => void;
}

export function LogDetailModal({
  log,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
  onTagClick,
}: LogDetailModalProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!log) return null;

  const handleCopyCode = () => {
    if (log.code_snippet) {
      navigator.clipboard.writeText(log.code_snippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleShare = () => {
    const text = `💡 TIL: ${log.title}\n\nTakeaways:\n${log.takeaways?.map((t) => `• ${t}`).join('\n') || ''}\n\n#${log.category} ${log.tags?.map((t) => `#${t}`).join(' ') || ''}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const formattedDate = new Date(log.study_date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-md border border-[var(--gh-border)] bg-[var(--gh-bg)] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar (GitHub Issue header style) */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--gh-border)] bg-[var(--gh-surface)]">
          <div className="flex items-center gap-2 text-xs text-[var(--gh-text-secondary)]">
            <span className="font-semibold text-[var(--gh-text-primary)] border border-[var(--gh-border)] bg-[var(--gh-badge-bg)] px-2 py-0.5 rounded-full">
              {log.category}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
            {log.duration_minutes && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {log.duration_minutes}m
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleFavorite(log.id, !!log.is_favorite)}
              className="p-1 rounded hover:bg-[var(--gh-surface-hover)] text-[var(--gh-text-secondary)] hover:text-amber-500 transition-colors"
              title="Star"
            >
              <Star
                className={`w-4 h-4 ${
                  log.is_favorite ? 'fill-amber-400 text-amber-400' : ''
                }`}
              />
            </button>

            <button
              onClick={handleShare}
              className="p-1 rounded hover:bg-[var(--gh-surface-hover)] text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] transition-colors"
              title="Share Summary"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                onClose();
                onEdit(log);
              }}
              className="p-1 rounded hover:bg-[var(--gh-surface-hover)] text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] transition-colors"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (confirm(`Delete "${log.title}"?`)) {
                  onDelete(log.id);
                  onClose();
                }
              }}
              className="p-1 rounded hover:bg-[var(--gh-surface-hover)] text-[var(--gh-text-secondary)] hover:text-rose-500 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-[var(--gh-border)] mx-1" />

            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-[var(--gh-surface-hover)] text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Title */}
          <h1 className="text-xl font-semibold text-[var(--gh-text-primary)] tracking-tight leading-snug">
            {log.title}
          </h1>

          {/* Key Takeaways Box */}
          {log.takeaways && log.takeaways.length > 0 && (
            <div className="rounded-md border border-[var(--gh-border)] bg-[var(--gh-surface)] p-4 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-[var(--gh-text-secondary)]">
                Key Takeaways / Highlights
              </div>
              <ul className="space-y-1.5 text-xs text-[var(--gh-text-primary)]">
                {log.takeaways.map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-[var(--gh-accent)] font-bold">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Markdown Content */}
          <div className="prose max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {log.content || '_No additional description provided._'}
            </ReactMarkdown>
          </div>

          {/* Code Snippet Box */}
          {log.code_snippet && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-[var(--gh-text-secondary)]">
                <span className="font-mono">{log.code_language || 'code'}</span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 hover:text-[var(--gh-text-primary)] transition-colors"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="rounded-md border border-[var(--gh-border)] bg-[var(--gh-code-bg)] p-3.5 overflow-x-auto text-xs font-mono text-[var(--gh-text-primary)]">
                <code>{log.code_snippet}</code>
              </pre>
            </div>
          )}

          {/* Tags */}
          {log.tags && log.tags.length > 0 && (
            <div className="pt-3 border-t border-[var(--gh-border-subtle)] flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-[var(--gh-text-secondary)]">Tags:</span>
              {log.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    onTagClick(tag);
                    onClose();
                  }}
                  className="text-xs bg-[var(--gh-badge-bg)] border border-[var(--gh-badge-border)] text-[var(--gh-text-secondary)] hover:text-[var(--gh-accent)] px-2 py-0.5 rounded-full transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
