'use client';

import React, { useState } from 'react';
import {
  Star,
  Edit2,
  Trash2,
  Palette,
  Check,
  X,
} from 'lucide-react';
import { LearningLog, User } from '@/types';
import { getCardStyle, CARD_COLOR_PRESETS } from '@/lib/topicTheme';

interface LogCardProps {
  log: LearningLog;
  currentUser: User | null;
  onSelect: (log: LearningLog) => void;
  onEdit: (log: LearningLog) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
  onUpdateCardColor?: (id: string, color: string) => void;
}

export function LogCard({
  log,
  currentUser,
  onSelect,
  onEdit,
  onDelete,
  onToggleFavorite,
  onUpdateCardColor,
}: LogCardProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const formattedDate = new Date(log.study_date).toLocaleDateString('id-ID', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isAuthor = currentUser && (!log.author_id || log.author_id === currentUser.id);
  const theme = getCardStyle(log.category, log.card_color);

  const commentCount = log.feedback ? log.feedback.length : 0;
  const imageCount = log.image_urls ? log.image_urls.length : 0;

  // Clean snippet content preview
  const cleanContent = (log.content || '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/^#+\s+/gm, '')
    .trim();

  const isLongContent = cleanContent.length > 120;

  const handleSelectColor = (colorId: string) => {
    if (onUpdateCardColor) {
      onUpdateCardColor(log.id, colorId);
    }
    setShowColorPicker(false);
  };

  return (
    <div
      className="group relative flex flex-col justify-between rounded-2xl border border-[var(--gh-border)] p-4 sm:p-5 transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 min-h-[175px]"
      style={{
        borderLeftWidth: '5px',
        borderLeftColor: theme.borderLeft,
        backgroundColor: theme.cardBg !== 'transparent' ? theme.cardBg : 'var(--gh-surface)',
      }}
    >
      <div>
        {/* Top: Topic Badge with Emoji + Duration + Image indicator + Actions */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
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
              <span className="text-[11px] text-[var(--gh-text-secondary)] font-semibold flex items-center gap-1 bg-[var(--gh-bg)] px-2.5 py-0.5 rounded-full border border-[var(--gh-border-subtle)]">
                <span>⏱️</span>
                <span>{log.duration_minutes}m</span>
              </span>
            )}

            {/* Image Indicator with Emoji */}
            {imageCount > 0 && (
              <span
                onClick={() => onSelect(log)}
                className="text-[11px] font-bold text-indigo-500 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 cursor-pointer hover:underline"
                title={`${imageCount} gambar terlampir`}
              >
                <span>🖼️</span>
                <span>{imageCount} gambar terlampir</span>
              </span>
            )}
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1">
            {/* Quick Card Color Customizer */}
            {isAuthor && onUpdateCardColor && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowColorPicker(!showColorPicker);
                  }}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    showColorPicker
                      ? 'bg-indigo-500/15 text-indigo-500 font-bold'
                      : 'text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] hover:bg-[var(--gh-surface-hover)]'
                  }`}
                  title="Kostumisasi Warna Kartu Ini"
                >
                  <Palette className="w-3.5 h-3.5" />
                </button>

                {/* Color Swatches Popover */}
                {showColorPicker && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-7 z-30 p-2.5 rounded-xl border border-[var(--gh-border)] bg-[var(--gh-surface)] shadow-xl w-52 space-y-2 animate-in fade-in duration-150"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-[var(--gh-text-primary)]">
                      <span>🎨 Pilih Warna Kartu:</span>
                      <button
                        onClick={() => setShowColorPicker(false)}
                        className="text-[var(--gh-text-tertiary)] hover:text-[var(--gh-text-primary)]"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="grid grid-cols-5 gap-2 p-1">
                      {CARD_COLOR_PRESETS.map((preset) => {
                        const isSelected =
                          (preset.id === 'auto' && (!log.card_color || log.card_color === 'auto')) ||
                          log.card_color === preset.id;

                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleSelectColor(preset.id)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-2xs ${
                              isSelected ? 'ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-900 scale-110 shadow-sm' : 'hover:scale-105 opacity-90 hover:opacity-100'
                            }`}
                            style={{
                              background: preset.id === 'auto' ? 'linear-gradient(135deg, #38bdf8, #818cf8, #f472b6, #fbbf24)' : preset.color,
                            }}
                            title={preset.name}
                          >
                            {isSelected ? (
                              <Check className="w-4 h-4 text-white stroke-[3] drop-shadow-xs animate-in zoom-in-75 duration-150" />
                            ) : preset.id === 'auto' ? (
                              <span className="text-[10px] drop-shadow-xs">🌈</span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(log.id, !!log.is_favorite);
              }}
              className="p-1.5 rounded-lg text-[var(--gh-text-secondary)] hover:text-amber-500 hover:bg-[var(--gh-surface-hover)] transition-colors cursor-pointer"
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
                  className="p-1.5 rounded-lg text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] hover:bg-[var(--gh-surface-hover)] transition-colors cursor-pointer"
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
                  className="p-1.5 rounded-lg text-[var(--gh-text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
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
          className="text-sm font-extrabold text-[var(--gh-text-primary)] group-hover:text-indigo-500 transition-colors cursor-pointer leading-snug line-clamp-1"
        >
          {log.title}
        </h3>

        {/* 2. Catatan Lengkap Text dengan "baca selengkapnya..." */}
        <div
          onClick={() => onSelect(log)}
          className="mt-1.5 text-xs text-[var(--gh-text-secondary)] leading-relaxed cursor-pointer font-medium"
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
            <span className="text-[11px] text-indigo-500 hover:underline font-bold inline-block mt-0.5">
              baca selengkapnya... 📖
            </span>
          )}
        </div>
      </div>

      {/* 3. Footer: Author + Comments + Date */}
      <div className="mt-3.5 pt-2.5 border-t border-[var(--gh-border-subtle)] flex items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-2">
          {/* Author avatar & name */}
          <div className="flex items-center gap-1.5" title={`Ditulis oleh ${log.author_name || 'Tim'}`}>
            <img
              src={log.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={log.author_name || 'Author'}
              className="w-4 h-4 rounded-full object-cover border border-[var(--gh-border)]"
            />
            <span className="text-[11px] text-[var(--gh-text-secondary)] font-bold truncate max-w-[100px]">
              {log.author_name?.split(' ')[0] || 'User'}
            </span>
          </div>

          {/* Comment / Feedback Bubble */}
          <div
            onClick={() => onSelect(log)}
            className="flex items-center gap-1 text-[11px] text-[var(--gh-text-secondary)] hover:text-indigo-500 cursor-pointer bg-[var(--gh-bg)] px-2.5 py-0.5 rounded-full border border-[var(--gh-border-subtle)] font-bold shadow-2xs"
            title={`${commentCount} feedback`}
          >
            <span>💬</span>
            <span>{commentCount}</span>
          </div>
        </div>

        <span className="text-[10px] text-[var(--gh-text-tertiary)] font-bold flex items-center gap-1">
          <span>📅</span>
          <span>{formattedDate}</span>
        </span>
      </div>
    </div>
  );
}
