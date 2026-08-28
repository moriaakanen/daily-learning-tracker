'use client';

import React, { useState } from 'react';
import {
  Star,
  Edit2,
  Trash2,
  Palette,
  Check,
  X,
  Clock,
  MessageCircle,
  Calendar,
  Sparkles,
  ArrowRight,
  Eye,
  ImageIcon,
} from 'lucide-react';
import { LearningLog, User, ViewMode } from '@/types';
import { getCardStyle, CARD_COLOR_PRESETS } from '@/lib/topicTheme';

interface LogCardProps {
  log: LearningLog;
  currentUser: User | null;
  viewMode?: ViewMode;
  onSelect: (log: LearningLog) => void;
  onEdit: (log: LearningLog) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
  onUpdateCardColor?: (id: string, color: string) => void;
}

export function LogCard({
  log,
  currentUser,
  viewMode = 'vertical',
  onSelect,
  onEdit,
  onDelete,
  onToggleFavorite,
  onUpdateCardColor,
}: LogCardProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formattedDate = new Date(log.study_date).toLocaleDateString('id-ID', {
    weekday: viewMode === 'vertical' ? 'short' : undefined,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isAuthor = currentUser && (!log.author_id || log.author_id === currentUser.id);
  const theme = getCardStyle(log.category, log.card_color);

  const commentCount = log.feedback ? log.feedback.length : 0;
  const imageCount = log.image_urls ? log.image_urls.length : 0;

  // Clean snippet content preview (strips all markdown, brackets, asterisks, bullet dashes, & HTML tags)
  const cleanContent = (log.content || '')
    .replace(/<[^>]*>/g, ' ') // Strip HTML tags
    .replace(/!\[.*?\]\(.*?\)/g, '') // Strip markdown images
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Convert markdown links to plain text
    .replace(/^#+\s+/gm, '') // Strip headings
    .replace(/^\s*[-*+]\s+/gm, '') // Strip unordered list bullets
    .replace(/^\s*\d+\.\s+/gm, '') // Strip ordered list numbers
    .replace(/^\s*>\s+/gm, '') // Strip blockquotes
    .replace(/[*_~`]{1,3}/g, '') // Strip bold, italic, strikethrough, backticks (**text** -> text)
    .replace(/\s+/g, ' ')
    .trim();

  const isLongContent = cleanContent.length > 130;

  // Motivational badge generator based on duration
  const getMotivationalBadge = (minutes: number = 30) => {
    if (minutes >= 45) {
      return {
        label: '🔥 Deep Work',
        bg: 'bg-rose-500/10 dark:bg-rose-500/20',
        text: 'text-rose-600 dark:text-rose-400',
        border: 'border-rose-500/30',
      };
    }
    if (minutes >= 30) {
      return {
        label: '⚡ High Focus',
        bg: 'bg-amber-500/10 dark:bg-amber-500/20',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-500/30',
      };
    }
    if (minutes >= 20) {
      return {
        label: '🌱 Habit Builder',
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-500/30',
      };
    }
    return {
      label: '💡 Quick Insight',
      bg: 'bg-sky-500/10 dark:bg-sky-500/20',
      text: 'text-sky-600 dark:text-sky-400',
      border: 'border-sky-500/30',
    };
  };

  const motivation = getMotivationalBadge(log.duration_minutes || 30);

  const handleSelectColor = (colorId: string) => {
    if (onUpdateCardColor) {
      onUpdateCardColor(log.id, colorId);
    }
    setShowColorPicker(false);
  };

  // =========================================================================
  // 1. TAMPILAN VERTIKAL (Option 1: Sleek Linear & Notion Glass)
  // =========================================================================
  if (viewMode === 'vertical') {
    return (
      <>
        <div
          onClick={() => onSelect(log)}
          className="group relative flex flex-col justify-between rounded-2xl border border-[var(--gh-border)] hover:border-emerald-500/50 p-5 sm:p-6 transition-all duration-200 shadow-2xs hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-0.5 overflow-hidden bg-[var(--gh-surface)] cursor-pointer"
          style={{
            backgroundColor: theme.cardBg !== 'transparent' ? theme.cardBg : 'var(--gh-surface)',
          }}
        >
          {/* Subtle Ambient Glow on top right */}
          <div
            className="absolute -right-12 -top-12 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none transition-opacity group-hover:opacity-25"
            style={{ background: theme.color || '#10b981' }}
          />

          <div>
            {/* Header: Topic Badge + Duration + Motivational Chip + Action Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3.5">
              <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                {/* Topic Pill */}
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 shadow-2xs transition-transform group-hover:scale-102"
                  style={{
                    backgroundColor: theme.badgeBg,
                    color: theme.badgeText,
                    borderColor: theme.badgeBorder,
                  }}
                >
                  <span className="text-sm">{theme.emoji}</span>
                  <span>{log.category}</span>
                </span>

                {/* Duration Badge */}
                {log.duration_minutes && (
                  <span className="text-xs text-[var(--gh-text-secondary)] font-semibold flex items-center gap-1 bg-[var(--gh-bg)] px-2.5 py-1 rounded-full border border-[var(--gh-border)] shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{log.duration_minutes} Menit</span>
                  </span>
                )}

                {/* Motivational Milestone Chip */}
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${motivation.bg} ${motivation.text} ${motivation.border} flex items-center gap-1 shadow-2xs`}
                >
                  <span>{motivation.label}</span>
                </span>

                {/* Image Indicator if any */}
                {imageCount > 0 && (
                  <span
                    className="text-[11px] font-bold text-indigo-500 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>{imageCount} Gambar</span>
                  </span>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                {/* Card Color Customizer */}
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
                      <Palette className="w-4 h-4" />
                    </button>

                    {/* Color Swatches Popover */}
                    {showColorPicker && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-8 z-30 p-3 rounded-2xl border border-[var(--gh-border)] bg-[var(--gh-surface)] shadow-2xl w-60 space-y-2.5 animate-in fade-in zoom-in-95 duration-150"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-[var(--gh-text-primary)]">
                          <span className="flex items-center gap-1">
                            <span>🎨</span> Tema Warna Kartu
                          </span>
                          <button
                            onClick={() => setShowColorPicker(false)}
                            className="text-[var(--gh-text-tertiary)] hover:text-[var(--gh-text-primary)] p-0.5 rounded-full"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-4 gap-2 p-1">
                          {CARD_COLOR_PRESETS.map((preset) => {
                            const isSelected =
                              (preset.id === 'auto' && (!log.card_color || log.card_color === 'auto')) ||
                              log.card_color === preset.id;

                            return (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => handleSelectColor(preset.id)}
                                className={`h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
                                  isSelected
                                    ? 'ring-2 ring-offset-2 ring-indigo-500 scale-105 shadow-md'
                                    : 'hover:scale-105 opacity-90 hover:opacity-100'
                                }`}
                                style={{
                                  background: preset.gradient,
                                }}
                                title={preset.name}
                              >
                                {isSelected && (
                                  <Check className="w-4 h-4 text-white stroke-[3] drop-shadow-xs" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Favorite Star */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(log.id, !!log.is_favorite);
                  }}
                  className="p-1.5 rounded-lg text-[var(--gh-text-secondary)] hover:text-amber-500 hover:bg-[var(--gh-surface-hover)] transition-colors cursor-pointer"
                  title={log.is_favorite ? 'Favorit' : 'Tandai Favorit'}
                >
                  <Star
                    className={`w-4 h-4 ${
                      log.is_favorite ? 'fill-amber-400 text-amber-400' : ''
                    }`}
                  />
                </button>

                {/* Edit & Delete for author */}
                {isAuthor && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(log);
                      }}
                      className="p-1.5 rounded-lg text-[var(--gh-text-secondary)] hover:text-indigo-500 hover:bg-[var(--gh-surface-hover)] transition-colors cursor-pointer"
                      title="Edit Catatan"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(true);
                      }}
                      className="p-1.5 rounded-lg text-[var(--gh-text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Hapus Catatan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Body Section: Content + Optional Media Thumbnail on the right */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Judul Catatan */}
                <h3 className="text-base sm:text-lg font-extrabold text-[var(--gh-text-primary)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug tracking-tight">
                  {log.title}
                </h3>

                {/* Cuplikan Konten Bersih */}
                <div className="mt-2 text-xs sm:text-sm text-[var(--gh-text-secondary)] leading-relaxed font-normal">
                  {cleanContent ? (
                    <p className="line-clamp-2 sm:line-clamp-3">
                      {cleanContent}
                    </p>
                  ) : (
                    <p className="text-[var(--gh-text-tertiary)] italic">
                      Tidak ada catatan tambahan.
                    </p>
                  )}
                </div>

                {/* Tags Strip if exists */}
                {log.tags && log.tags.length > 0 && (
                  <div className="mt-3 flex items-center gap-1.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
                    {log.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[var(--gh-bg)] border border-[var(--gh-border)] text-[var(--gh-text-secondary)]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Side Thumbnail (If images attached) */}
              {log.image_urls && log.image_urls.length > 0 && (
                <div className="relative w-20 h-20 sm:w-28 sm:h-24 rounded-2xl overflow-hidden border border-[var(--gh-border)] shrink-0 bg-black/5 shadow-xs group-hover:shadow-md transition-all self-start mt-1 sm:mt-0">
                  <img
                    src={log.image_urls[0]}
                    alt={log.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {log.image_urls.length > 1 && (
                    <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[10px] font-extrabold text-white">
                      +{log.image_urls.length - 1}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer: Author Info + Date + Comment count + Action link */}
          <div className="mt-4 pt-3.5 border-t border-[var(--gh-border-subtle)] flex flex-wrap items-center justify-between text-xs gap-3">
            <div className="flex items-center gap-3">
              {/* Author avatar & name */}
              <div className="flex items-center gap-2">
                <img
                  src={log.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={log.author_name || 'Author'}
                  className="w-5 h-5 rounded-full object-cover ring-2 ring-emerald-400/40"
                />
                <span className="font-bold text-[var(--gh-text-primary)]">
                  {log.author_name || 'Sahabat Pembelajar'}
                </span>
              </div>

              <span className="text-[var(--gh-text-tertiary)]">•</span>

              {/* Tanggal Belajar */}
              <span className="text-[var(--gh-text-secondary)] font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[var(--gh-text-tertiary)]" />
                <span>{formattedDate}</span>
              </span>
            </div>

            <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
              {/* Discussion Comment Bubble */}
              <button
                onClick={() => onSelect(log)}
                className="flex items-center gap-1.5 text-[var(--gh-text-secondary)] hover:text-emerald-600 dark:hover:text-emerald-400 bg-[var(--gh-bg)] hover:bg-[var(--gh-surface-hover)] px-2.5 py-1 rounded-full border border-[var(--gh-border)] font-bold transition-colors cursor-pointer shadow-2xs"
                title={`${commentCount} Feedback / Diskusi`}
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>{commentCount} Diskusi</span>
              </button>

              {/* Read Full Button */}
              <button
                onClick={() => onSelect(log)}
                className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-extrabold transition-all group-hover:translate-x-0.5 cursor-pointer"
              >
                <span>Buka Catatan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Konfirmasi Hapus Catatan */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-[var(--gh-surface)] border border-[var(--gh-border)] rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-lg shrink-0">
                  🗑️
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[var(--gh-text-primary)]">
                    Hapus Catatan Ini?
                  </h3>
                  <p className="text-xs text-[var(--gh-text-secondary)] leading-relaxed">
                    Catatan <strong className="text-[var(--gh-text-primary)]">&quot;{log.title}&quot;</strong> akan dihapus permanen.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--gh-border)]">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3.5 py-1.5 rounded-full border border-[var(--gh-border)] bg-[var(--gh-bg)] hover:bg-[var(--gh-surface-hover)] text-xs font-bold text-[var(--gh-text-secondary)] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDelete(log.id);
                    setShowDeleteConfirm(false);
                  }}
                  className="px-4 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // =========================================================================
  // 2. TAMPILAN GRID (Vibrant Cheerful Bento Card)
  // =========================================================================
  return (
    <>
      <div
        className="group relative flex flex-col justify-between rounded-2xl border border-[var(--gh-border)] p-4 sm:p-5 transition-all duration-300 shadow-xs hover:shadow-xl hover:-translate-y-1 overflow-hidden min-h-[210px]"
        style={{
          borderTopWidth: '4px',
          borderTopColor: theme.borderLeft,
          backgroundColor: theme.cardBg !== 'transparent' ? theme.cardBg : 'var(--gh-surface)',
        }}
      >
        {/* Subtle Ambient Background Gradient Glow */}
        <div
          className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full blur-xl opacity-10 pointer-events-none transition-opacity group-hover:opacity-25"
          style={{ background: theme.color }}
        />

        <div>
          {/* Header Row: Topic Badge + Duration + Actions */}
          <div className="flex items-center justify-between gap-1.5 mb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Topic Pill */}
              <span
                className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 shadow-2xs"
                style={{
                  backgroundColor: theme.badgeBg,
                  color: theme.badgeText,
                  borderColor: theme.badgeBorder,
                }}
              >
                <span>{theme.emoji}</span>
                <span className="truncate max-w-[110px]">{log.category}</span>
              </span>

              {/* Duration Chip */}
              {log.duration_minutes && (
                <span className="text-[10px] text-[var(--gh-text-secondary)] font-bold flex items-center gap-1 bg-[var(--gh-bg)] px-2 py-0.5 rounded-full border border-[var(--gh-border-subtle)]">
                  <span>⏱️</span>
                  <span>{log.duration_minutes}m</span>
                </span>
              )}
            </div>

            {/* Action Toolbar */}
            <div className="flex items-center gap-0.5">
              {/* Color Customizer */}
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
                    title="Ubah Warna Kartu"
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
                        <span>🎨 Warna Kartu</span>
                        <button
                          onClick={() => setShowColorPicker(false)}
                          className="text-[var(--gh-text-tertiary)] hover:text-[var(--gh-text-primary)]"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5 p-1">
                        {CARD_COLOR_PRESETS.map((preset) => {
                          const isSelected =
                            (preset.id === 'auto' && (!log.card_color || log.card_color === 'auto')) ||
                            log.card_color === preset.id;

                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => handleSelectColor(preset.id)}
                              className={`h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
                                isSelected ? 'ring-2 ring-offset-1 ring-indigo-500 scale-105' : 'hover:scale-105 opacity-90'
                              }`}
                              style={{ background: preset.gradient }}
                              title={preset.name}
                            >
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Star */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(log.id, !!log.is_favorite);
                }}
                className="p-1.5 rounded-lg text-[var(--gh-text-secondary)] hover:text-amber-500 hover:bg-[var(--gh-surface-hover)] transition-colors cursor-pointer"
                title={log.is_favorite ? 'Favorit' : 'Tandai Favorit'}
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    log.is_favorite ? 'fill-amber-400 text-amber-400' : ''
                  }`}
                />
              </button>

              {/* Edit / Delete */}
              {isAuthor && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(log);
                    }}
                    className="p-1.5 rounded-lg text-[var(--gh-text-secondary)] hover:text-indigo-500 hover:bg-[var(--gh-surface-hover)] transition-colors cursor-pointer"
                    title="Edit Catatan"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(true);
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

          {/* Judul Catatan */}
          <h3
            onClick={() => onSelect(log)}
            className="text-sm font-extrabold text-[var(--gh-text-primary)] group-hover:text-indigo-500 transition-colors cursor-pointer leading-snug line-clamp-2"
          >
            {log.title}
          </h3>

          {/* Image Thumbnail Banner (if image exists) */}
          {log.image_urls && log.image_urls.length > 0 && (
            <div
              onClick={() => onSelect(log)}
              className="mt-2 h-24 rounded-xl overflow-hidden border border-[var(--gh-border)] relative cursor-pointer group/img"
            >
              <img
                src={log.image_urls[0]}
                alt={log.title}
                className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
              />
              {log.image_urls.length > 1 && (
                <div className="absolute right-1.5 bottom-1.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[10px] font-bold text-white flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  <span>+{log.image_urls.length - 1}</span>
                </div>
              )}
            </div>
          )}

          {/* Snippet Content */}
          <div
            onClick={() => onSelect(log)}
            className="mt-2 text-xs text-[var(--gh-text-secondary)] leading-relaxed cursor-pointer font-medium"
          >
            {cleanContent ? (
              <p className={log.image_urls && log.image_urls.length > 0 ? 'line-clamp-1' : 'line-clamp-2'}>
                {cleanContent}
              </p>
            ) : (
              <p className="text-[var(--gh-text-tertiary)] italic">
                Tidak ada catatan tambahan.
              </p>
            )}

            {isLongContent && !log.image_urls?.length && (
              <span className="text-[11px] text-indigo-500 hover:underline font-bold inline-block mt-0.5">
                baca selengkapnya... 📖
              </span>
            )}
          </div>
        </div>

        {/* Footer: Author + Comments + Date */}
        <div className="mt-3.5 pt-2.5 border-t border-[var(--gh-border-subtle)] flex items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5" title={`Ditulis oleh ${log.author_name || 'Tim'}`}>
              <img
                src={log.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={log.author_name || 'Author'}
                className="w-4 h-4 rounded-full object-cover border border-[var(--gh-border)]"
              />
              <span className="text-[11px] text-[var(--gh-text-secondary)] font-bold truncate max-w-[85px]">
                {log.author_name?.split(' ')[0] || 'User'}
              </span>
            </div>

            {/* Comment Bubble */}
            <div
              onClick={() => onSelect(log)}
              className="flex items-center gap-1 text-[11px] text-[var(--gh-text-secondary)] hover:text-indigo-500 cursor-pointer bg-[var(--gh-bg)] px-2 py-0.5 rounded-full border border-[var(--gh-border-subtle)] font-bold shadow-2xs"
              title={`${commentCount} Feedback`}
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

      {/* Modal Konfirmasi Hapus Catatan */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[var(--gh-surface)] border border-[var(--gh-border)] rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-lg shrink-0">
                🗑️
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[var(--gh-text-primary)]">
                  Hapus Catatan Ini?
                </h3>
                <p className="text-xs text-[var(--gh-text-secondary)] leading-relaxed">
                  Catatan <strong className="text-[var(--gh-text-primary)]">&quot;{log.title}&quot;</strong> akan dihapus permanen.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--gh-border)]">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3.5 py-1.5 rounded-full border border-[var(--gh-border)] bg-[var(--gh-bg)] hover:bg-[var(--gh-surface-hover)] text-xs font-bold text-[var(--gh-text-secondary)] transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(log.id);
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
