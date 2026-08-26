'use client';

import React from 'react';
import {
  Star,
  Edit2,
  Trash2,
  Clock,
  MessageSquare,
  Image as ImageIcon,
} from 'lucide-react';
import { LearningLog, User } from '@/types';

interface LogCardProps {
  log: LearningLog;
  currentUser: User | null;
  onSelect: (log: LearningLog) => void;
  onEdit: (log: LearningLog) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
  onTagClick: (tag: string) => void;
}

const LABEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Teknologi & Coding': { bg: 'rgba(56, 189, 248, 0.15)', text: '#38bdf8', border: 'rgba(56, 189, 248, 0.3)' },
  'Bisnis & Finansial': { bg: 'rgba(52, 211, 153, 0.15)', text: '#34d399', border: 'rgba(52, 211, 153, 0.3)' },
  'Buku & Literasi': { bg: 'rgba(251, 191, 36, 0.15)', text: '#fbbf24', border: 'rgba(251, 191, 36, 0.3)' },
  'Bahasa & Komunikasi': { bg: 'rgba(167, 139, 250, 0.15)', text: '#a78bfa', border: 'rgba(167, 139, 250, 0.3)' },
  'Sains & Psikologi': { bg: 'rgba(244, 114, 182, 0.15)', text: '#f472b6', border: 'rgba(244, 114, 182, 0.3)' },
  'Produktivitas & Habits': { bg: 'rgba(251, 146, 60, 0.15)', text: '#fb923c', border: 'rgba(251, 146, 60, 0.3)' },
  'Desain & Kreativitas': { bg: 'rgba(34, 211, 238, 0.15)', text: '#22d3ee', border: 'rgba(34, 211, 238, 0.3)' },
  'Kesehatan & Olahraga': { bg: 'rgba(74, 222, 128, 0.15)', text: '#4ade80', border: 'rgba(74, 222, 128, 0.3)' },
  'Wawasan Umum & Filosofi': { bg: 'rgba(129, 140, 248, 0.15)', text: '#818cf8', border: 'rgba(129, 140, 248, 0.3)' },
};

export function LogCard({
  log,
  currentUser,
  onSelect,
  onEdit,
  onDelete,
  onToggleFavorite,
  onTagClick,
}: LogCardProps) {
  const formattedDate = new Date(log.study_date).toLocaleDateString('id-ID', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isAuthor = currentUser && (!log.author_id || log.author_id === currentUser.id);

  const labelStyle = LABEL_COLORS[log.category] || {
    bg: 'var(--gh-badge-bg)',
    text: 'var(--gh-text-primary)',
    border: 'var(--gh-badge-border)',
  };

  const commentCount = log.feedback ? log.feedback.length : 0;
  const hasImages = log.image_urls && log.image_urls.length > 0;

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

            {hasImages && (
              <span className="text-[11px] text-[var(--gh-text-secondary)] flex items-center gap-0.5" title="Memiliki lampiran gambar">
                <ImageIcon className="w-3 h-3 text-[var(--gh-accent)]" />
                <span>{log.image_urls?.length}</span>
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

            {isAuthor && (
              <>
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
                    if (confirm(`Hapus catatan "${log.title}"?`)) {
                      onDelete(log.id);
                    }
                  }}
                  className="p-1 rounded text-[var(--gh-text-secondary)] hover:text-rose-500 transition-colors"
                  title="Hapus"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Title */}
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

        {/* First Image Thumbnail if attached */}
        {hasImages && log.image_urls?.[0] && (
          <div
            onClick={() => onSelect(log)}
            className="mt-2.5 h-24 rounded border border-[var(--gh-border)] overflow-hidden bg-[var(--gh-bg)] cursor-pointer"
          >
            <img
              src={log.image_urls[0]}
              alt={log.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>
        )}
      </div>

      {/* Footer: Author info + Comments + Tags */}
      <div className="mt-3.5 pt-2.5 border-t border-[var(--gh-border-subtle)] flex items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-2">
          {/* Author avatar & name */}
          <div className="flex items-center gap-1.5" title={`Ditulis oleh ${log.author_name || 'Tim'}`}>
            <img
              src={log.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={log.author_name || 'Author'}
              className="w-4 h-4 rounded-full object-cover border border-[var(--gh-border)]"
            />
            <span className="text-[11px] text-[var(--gh-text-secondary)] truncate max-w-[80px]">
              {log.author_name?.split(' ')[0] || 'User'}
            </span>
          </div>

          {/* Comment / Feedback Bubble */}
          <div
            onClick={() => onSelect(log)}
            className="flex items-center gap-1 text-[11px] text-[var(--gh-text-secondary)] hover:text-[var(--gh-accent)] cursor-pointer"
            title={`${commentCount} feedback`}
          >
            <MessageSquare className="w-3 h-3 text-[var(--gh-text-tertiary)]" />
            <span>{commentCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-wrap justify-end">
          {log.tags && log.tags.length > 0 ? (
            log.tags.slice(0, 2).map((tag) => (
              <button
                key={tag}
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick(tag);
                }}
                className="text-[10px] text-[var(--gh-text-secondary)] hover:text-[var(--gh-accent)] bg-[var(--gh-badge-bg)] border border-[var(--gh-badge-border)] px-1.5 py-0.2 rounded-full transition-colors"
              >
                #{tag}
              </button>
            ))
          ) : (
            <span className="text-[10px] text-[var(--gh-text-tertiary)]">{formattedDate}</span>
          )}
        </div>
      </div>
    </div>
  );
}
