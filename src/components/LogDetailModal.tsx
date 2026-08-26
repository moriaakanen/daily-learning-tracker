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
  Clock,
  Calendar,
  MessageSquare,
  Send,
  Image as ImageIcon,
  LogIn,
} from 'lucide-react';
import { LearningLog, User } from '@/types';

interface LogDetailModalProps {
  log: LearningLog | null;
  currentUser: User | null;
  onClose: () => void;
  onOpenLogin: () => void;
  onEdit: (log: LearningLog) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
  onTagClick?: (tag: string) => void;
  onAddFeedback: (logId: string, content: string) => Promise<void>;
}

export function LogDetailModal({
  log,
  currentUser,
  onClose,
  onOpenLogin,
  onEdit,
  onDelete,
  onToggleFavorite,
  onAddFeedback,
}: LogDetailModalProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  if (!log) return null;

  const isAuthor = currentUser && (!log.author_id || log.author_id === currentUser.id);

  const handleCopyCode = () => {
    if (log.code_snippet) {
      navigator.clipboard.writeText(log.code_snippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleShare = () => {
    const text = `💡 ${log.title}\n\nTopik: ${log.category}\nOleh: ${log.author_name || 'Tim'}\n\n${log.content}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenLogin();
      return;
    }
    if (!feedbackInput.trim()) return;

    setSubmittingFeedback(true);
    try {
      await onAddFeedback(log.id, feedbackInput.trim());
      setFeedbackInput('');
    } catch (err) {
      console.error('Failed adding feedback', err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const formattedDate = new Date(log.study_date).toLocaleDateString('id-ID', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const feedbackList = log.feedback || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-md border border-[var(--gh-border)] bg-[var(--gh-bg)] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--gh-border)] bg-[var(--gh-surface)]">
          <div className="flex items-center gap-3 text-xs text-[var(--gh-text-secondary)]">
            <div className="flex items-center gap-1.5">
              <img
                src={log.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={log.author_name || 'Author'}
                className="w-5 h-5 rounded-full object-cover border border-[var(--gh-border)]"
              />
              <span className="font-semibold text-[var(--gh-text-primary)]">
                {log.author_name || 'Moria Akanen'}
              </span>
            </div>

            <span>•</span>
            <span className="font-medium text-[var(--gh-text-primary)] border border-[var(--gh-border)] bg-[var(--gh-badge-bg)] px-2 py-0.2 rounded-full text-[11px]">
              {log.category}
            </span>

            <span>•</span>
            <span className="hidden sm:flex items-center gap-1 text-[11px]">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </span>

            {log.duration_minutes && (
              <>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:flex items-center gap-1 text-[11px]">
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

            {isAuthor && (
              <>
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
                    if (confirm(`Hapus catatan "${log.title}"?`)) {
                      onDelete(log.id);
                      onClose();
                    }
                  }}
                  className="p-1 rounded hover:bg-[var(--gh-surface-hover)] text-[var(--gh-text-secondary)] hover:text-rose-500 transition-colors"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}

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

          {/* Catatan Lengkap (Markdown Content - Always First) */}
          <div className="prose max-w-none text-xs leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {log.content || '_Tidak ada deskripsi catatan._'}
            </ReactMarkdown>
          </div>

          {/* Lampiran Gambar Berada di Bawah Catatan Lengkap (Like X / Facebook) */}
          {log.image_urls && log.image_urls.length > 0 && (
            <div className="pt-2 space-y-2">
              <div className="text-xs font-semibold text-[var(--gh-text-secondary)] flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[var(--gh-accent)]" />
                <span>Lampiran Gambar ({log.image_urls.length})</span>
              </div>
              <div className={`grid gap-2.5 ${
                log.image_urls.length === 1
                  ? 'grid-cols-1'
                  : log.image_urls.length === 2
                  ? 'grid-cols-2'
                  : 'grid-cols-2 sm:grid-cols-3'
              }`}>
                {log.image_urls.map((img, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-[var(--gh-border)] overflow-hidden bg-[var(--gh-surface)] shadow-xs"
                  >
                    <img
                      src={img}
                      alt={`Lampiran ${idx + 1}`}
                      className="w-full max-h-96 object-contain bg-black/5 hover:scale-[1.01] transition-transform duration-200"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Code Snippet Box (If present) */}
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

          {/* Feedback & Comments Section */}
          <div className="pt-6 border-t border-[var(--gh-border)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--gh-text-primary)] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[var(--gh-accent)]" />
                <span>Feedback & Diskusi Tim ({feedbackList.length})</span>
              </h3>
              <span className="text-[11px] text-[var(--gh-text-secondary)]">
                Tinggalkan tanggapan atau masukan
              </span>
            </div>

            {/* Comment List */}
            <div className="space-y-3">
              {feedbackList.length === 0 ? (
                <div className="p-3 text-center rounded-md border border-[var(--gh-border)] bg-[var(--gh-surface)] text-xs text-[var(--gh-text-secondary)]">
                  Belum ada feedback. Jadilah yang pertama memberikan masukan atau tanggapan!
                </div>
              ) : (
                feedbackList.map((item) => (
                  <div key={item.id} className="rounded-md border border-[var(--gh-border)] bg-[var(--gh-surface)] overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--gh-surface-subtle)] border-b border-[var(--gh-border-subtle)] text-xs">
                      <div className="flex items-center gap-2">
                        <img
                          src={item.author_avatar}
                          alt={item.author_name}
                          className="w-4 h-4 rounded-full object-cover border border-[var(--gh-border)]"
                        />
                        <span className="font-semibold text-[var(--gh-text-primary)]">{item.author_name}</span>
                        {item.author_id === log.author_id && (
                          <span className="text-[10px] bg-[var(--gh-badge-bg)] border border-[var(--gh-badge-border)] text-[var(--gh-text-secondary)] px-1.5 py-0.2 rounded-full">
                            Penulis
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[var(--gh-text-tertiary)]">
                        {new Date(item.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="p-3 text-xs text-[var(--gh-text-primary)] leading-relaxed whitespace-pre-wrap">
                      {item.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            {currentUser ? (
              <form onSubmit={handleSendFeedback} className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs text-[var(--gh-text-secondary)]">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-4 h-4 rounded-full object-cover border border-[var(--gh-border)]"
                  />
                  <span>Komentar sebagai <strong>{currentUser.name}</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <textarea
                    rows={2}
                    required
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    placeholder="Tulis feedback, ide tambahan, atau apresiasi..."
                    className="flex-1 bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md p-2.5 text-xs text-[var(--gh-text-primary)] placeholder-[var(--gh-text-tertiary)] focus:outline-none focus:border-[var(--gh-accent)] resize-y"
                  />
                  <button
                    type="submit"
                    disabled={submittingFeedback || !feedbackInput.trim()}
                    className="flex items-center gap-1 px-3.5 py-2 rounded-md bg-[#1f883d] hover:bg-[#1a7f37] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-3 rounded-md border border-[var(--gh-border)] bg-[var(--gh-surface)] flex items-center justify-between gap-3 text-xs">
                <span className="text-[var(--gh-text-secondary)]">
                  Silakan masuk terlebih dahulu untuk meninggalkan komentar atau feedback.
                </span>
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1f883d] hover:bg-[#1a7f37] text-white font-semibold transition-all shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Masuk Akun</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
