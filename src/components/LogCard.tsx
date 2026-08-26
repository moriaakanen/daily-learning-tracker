'use client';

import React from 'react';
import {
  Star,
  Edit2,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import { LearningLog, User } from '@/types';
import { getTopicTheme } from '@/lib/topicTheme';

interface LogCardProps {
  log: LearningLog;
  currentUser: User | null;
  onSelect: (log: LearningLog) => void;
  onEdit: (log: LearningLog) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
}

export function LogCard({
  log,
  currentUser,
  onSelect,
  onEdit,
  onDelete,
  onToggleFavorite,
}: LogCardProps) {
  const formattedDate = new Date(log.study_date).toLocaleDateString('id-ID', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isAuthor = currentUser && (!log.author_id || log.author_id === currentUser.id);
  const theme = getTopicTheme(log.category);

  const commentCount = log.feedback ? log.feedback.length : 0;
  const imageCount = log.image_urls ? log.image_urls.length : 0;

  // Clean snippet content preview
  const cleanContent = (log.content || '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/^#+\s+/gm, '')
    .trim();

  const isLongContent = cleanContent.length > 120;

  return (
    <div
      className="group relative flex flex-col justify-between rounded-lg border border-[var(--gh-border)] bg-[var(--gh-surface)] hover:bg-[var(--gh-surface-hover)] p-4 transition-all duration-200 shadow-xs hover:shadow-md min-h-[170px]"
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: theme.borderLeft,
      }}
    >
      <div>
        {/* Top: Topic Badge with Emoji + Duration + Image indicator + Actions */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Topic Badge with Emoji */}
            <span
              className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 shadow-2xs"
              style={{
                backgroundColor: theme.badgeBg,
                color: theme.badgeText,
                borderColor: theme.badgeBorder,
              }}
            >
              <span>{theme.emoji}</span>
              <span>{log.category}</span>
            </span>

            {/* Duration Indicator with Emoji */}
            {log.duration_minutes && (
              <span className="text-[11px] text-[var(--gh-text-secondary)] font-medium flex items-center gap-1 bg-[var(--gh-bg)] px-2 py-0.5 rounded-md border border-[var(--gh-border-subtle)]">
                <span>⏱️</span>
                <span>{log.duration_minutes}m</span>
              </span>
            )}

            {/* Image Indicator with Emoji */}
            {imageCount > 0 && (
              <span
                onClick={() => onSelect(log)}
                className="text-[11px] font-semibold text-[var(--gh-accent)] bg-[var(--gh-badge-bg)] border border-[var(--gh-badge-border)] px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer hover:underline"
                title={`${imageCount} gambar terlampir`}
              >
                <span>🖼️</span>
                <span>{imageCount} gambar terlampir</span>
              </span>
            )}
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(log.id, !!log.is_favorite);
              }}
              className="p-1 rounded text-[var(--gh-text-secondary)] hover:text-amber-500 transition-colors"
              title={log.is_favorite ? 'Starred' : 'Tandai Favorit'}
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
                  title="Edit Catatan"
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
                  title="Hapus Catatan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* 1. Judul Catatan */}
        <h3
          onClick={() => onSelect(log)}
          className="text-sm font-bold text-[var(--gh-text-primary)] group-hover:text-[var(--gh-accent)] transition-colors cursor-pointer leading-snug line-clamp-1"
        >
          {log.title}
        </h3>

        {/* 2. Catatan Lengkap Text dengan "baca selengkapnya..." */}
        <div
          onClick={() => onSelect(log)}
          className="mt-1.5 text-xs text-[var(--gh-text-secondary)] leading-relaxed cursor-pointer"
        >
          {cleanContent ? (
            <p className="line-clamp-2">
              {cleanContent}
            </p>
          ) : (
            <p className="text-[var(--gh-text-tertiary)] italic">
              Tidak ada catatan tambahan.
            </p>
          )}

          {isLongContent && (
            <span className="text-[11px] text-[var(--gh-accent)] hover:underline font-semibold inline-block mt-0.5">
              baca selengkapnya... 📖
            </span>
          )}
        </div>
      </div>

      {/* 3. Footer: Author + Comments + Date */}
      <div className="mt-3 pt-2.5 border-t border-[var(--gh-border-subtle)] flex items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-2">
          {/* Author avatar & name */}
          <div className="flex items-center gap-1.5" title={`Ditulis oleh ${log.author_name || 'Tim'}`}>
            <img
              src={log.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={log.author_name || 'Author'}
              className="w-4 h-4 rounded-full object-cover border border-[var(--gh-border)]"
            />
            <span className="text-[11px] text-[var(--gh-text-secondary)] font-medium truncate max-w-[100px]">
              {log.author_name?.split(' ')[0] || 'User'}
            </span>
          </div>

          {/* Comment / Feedback Bubble */}
          <div
            onClick={() => onSelect(log)}
            className="flex items-center gap-1 text-[11px] text-[var(--gh-text-secondary)] hover:text-[var(--gh-accent)] cursor-pointer bg-[var(--gh-bg)] px-2 py-0.5 rounded-full border border-[var(--gh-border-subtle)]"
            title={`${commentCount} feedback`}
          >
            <span>💬</span>
            <span className="font-semibold">{commentCount}</span>
          </div>
        </div>

        <span className="text-[10px] text-[var(--gh-text-tertiary)] font-medium flex items-center gap-1">
          <span>📅</span>
          <span>{formattedDate}</span>
        </span>
      </div>
    </div>
  );
}
