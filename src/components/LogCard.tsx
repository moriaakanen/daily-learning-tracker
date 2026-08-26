'use client';

import React from 'react';
import {
  Star,
  Edit2,
  Trash2,
  GitCommit,
  Clock,
  Tag,
  Code2,
} from 'lucide-react';
import { LearningLog } from '@/types';

interface LogCardProps {
  log: LearningLog;
  onSelect: (log: LearningLog) => void;
  onEdit: (log: LearningLog) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
  onTagClick: (tag: string) => void;
}

// GitHub-like label colors
const LABEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Frontend: { bg: 'rgba(56, 189, 248, 0.15)', text: '#38bdf8', border: 'rgba(56, 189, 248, 0.3)' },
  Backend: { bg: 'rgba(74, 222, 128, 0.15)', text: '#4ade80', border: 'rgba(74, 222, 128, 0.3)' },
  Database: { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' },
  'DevOps & Cloud': { bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.3)' },
  'AI & Machine Learning': { bg: 'rgba(236, 72, 153, 0.15)', text: '#f472b6', border: 'rgba(236, 72, 153, 0.3)' },
  'Mobile Dev': { bg: 'rgba(6, 182, 212, 0.15)', text: '#22d3ee', border: 'rgba(6, 182, 212, 0.3)' },
  'System Design': { bg: 'rgba(249, 115, 22, 0.15)', text: '#fb923c', border: 'rgba(249, 115, 22, 0.3)' },
  'General / Concept': { bg: 'rgba(99, 102, 241, 0.15)', text: '#818cf8', border: 'rgba(99, 102, 241, 0.3)' },
};

export function LogCard({
  log,
  onSelect,
  onEdit,
  onDelete,
  onToggleFavorite,
  onTagClick,
}: LogCardProps) {
  const formattedDate = new Date(log.study_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const labelStyle = LABEL_COLORS[log.category] || {
    bg: 'var(--gh-badge-bg)',
    text: 'var(--gh-text-primary)',
    border: 'var(--gh-badge-border)',
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-md border border-[var(--gh-border)] bg-[var(--gh-surface)] hover:bg-[var(--gh-surface-hover)] p-4 transition-all duration-150">
      <div>
        {/* Top: Category Label + Actions */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full border"
              style={{
                backgroundColor: labelStyle.bg,
                color: labelStyle.text,
                borderColor: labelStyle.border,
              }}
            >
              {log.category}
            </span>

            {log.duration_minutes && (
              <span className="text-[11px] text-[var(--gh-text-secondary)] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[var(--gh-text-tertiary)]" />
                {log.duration_minutes}m
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(log.id, !!log.is_favorite);
              }}
              className="p-1 rounded text-[var(--gh-text-secondary)] hover:text-amber-500 transition-colors"
              title={log.is_favorite ? 'Starred' : 'Star this log'}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  log.is_favorite ? 'fill-amber-400 text-amber-400' : ''
                }`}
              />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(log);
              }}
              className="p-1 rounded text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] transition-colors"
              title="Edit"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete "${log.title}"?`)) {
                  onDelete(log.id);
                }
              }}
              className="p-1 rounded text-[var(--gh-text-secondary)] hover:text-rose-500 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title (GitHub issue/commit title style) */}
        <h3
          onClick={() => onSelect(log)}
          className="text-sm font-semibold text-[var(--gh-text-primary)] group-hover:text-[var(--gh-accent)] transition-colors cursor-pointer leading-snug line-clamp-2"
        >
          {log.title}
        </h3>

        {/* Key Takeaways */}
        {log.takeaways && log.takeaways.length > 0 && (
          <div className="mt-2.5 space-y-1">
            {log.takeaways.slice(0, 2).map((takeaway, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-xs text-[var(--gh-text-secondary)]">
                <span className="text-[var(--gh-text-tertiary)] font-bold select-none">•</span>
                <span className="line-clamp-1">{takeaway}</span>
              </div>
            ))}
          </div>
        )}

        {/* Code Snippet Box */}
        {log.code_snippet && (
          <div className="mt-2.5 rounded bg-[var(--gh-code-bg)] border border-[var(--gh-border)] px-2.5 py-1.5 text-[11px] font-mono text-[var(--gh-text-primary)] flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <Code2 className="w-3 h-3 text-[var(--gh-text-tertiary)] shrink-0" />
              <span className="truncate">{log.code_snippet.split('\n')[0]}</span>
            </div>
            <span className="text-[10px] text-[var(--gh-text-tertiary)] uppercase">
              {log.code_language || 'code'}
            </span>
          </div>
        )}
      </div>

      {/* Footer: Date & Tags */}
      <div className="mt-3 pt-2.5 border-t border-[var(--gh-border-subtle)] flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 flex-wrap">
          {log.tags && log.tags.length > 0 ? (
            log.tags.slice(0, 3).map((tag) => (
              <button
                key={tag}
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick(tag);
                }}
                className="text-[11px] text-[var(--gh-text-secondary)] hover:text-[var(--gh-accent)] bg-[var(--gh-badge-bg)] border border-[var(--gh-badge-border)] px-1.5 py-0.2 rounded transition-colors"
              >
                #{tag}
              </button>
            ))
          ) : (
            <span className="text-[11px] text-[var(--gh-text-tertiary)]">no tags</span>
          )}
        </div>

        <span className="text-[11px] text-[var(--gh-text-tertiary)]">
          {formattedDate}
        </span>
      </div>
    </div>
  );
}
