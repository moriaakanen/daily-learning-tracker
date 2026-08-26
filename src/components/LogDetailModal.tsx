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
    const text = `💡 Today I Learned: ${log.title}\n\nKey Takeaways:\n${log.takeaways?.map((t) => `• ${t}`).join('\n') || ''}\n\n#${log.category} ${log.tags?.map((t) => `#${t}`).join(' ') || ''}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const formattedDate = new Date(log.study_date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-zinc-950/50">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="font-medium text-zinc-200 bg-zinc-800 px-2 py-0.5 rounded">
              {log.category}
            </span>
            <span>•</span>
            <span>{formattedDate}</span>
            {log.duration_minutes && (
              <>
                <span>•</span>
                <span>{log.duration_minutes}m</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleFavorite(log.id, !!log.is_favorite)}
              className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 transition-colors"
              title="Favorit"
            >
              <Star
                className={`w-4 h-4 ${
                  log.is_favorite ? 'fill-amber-400 text-amber-400' : ''
                }`}
              />
            </button>

            <button
              onClick={handleShare}
              className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
              title="Salin Ringkasan"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                onClose();
                onEdit(log);
              }}
              className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
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
              className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors"
              title="Hapus"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-zinc-800 mx-1" />

            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Title */}
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight leading-snug">
            {log.title}
          </h1>

          {/* Key Takeaways Box */}
          {log.takeaways && log.takeaways.length > 0 && (
            <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-4 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Poin Kunci / Kesimpulan
              </div>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                {log.takeaways.map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-zinc-500 font-bold">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Markdown Content */}
          <div className="prose max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {log.content || '_Tidak ada deskripsi tambahan._'}
            </ReactMarkdown>
          </div>

          {/* Code Snippet Box */}
          {log.code_snippet && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-mono">{log.code_language || 'code'}</span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 hover:text-zinc-200 transition-colors"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="rounded-lg bg-zinc-950 border border-zinc-800 p-3.5 overflow-x-auto text-xs font-mono text-zinc-200">
                <code>{log.code_snippet}</code>
              </pre>
            </div>
          )}

          {/* Tags */}
          {log.tags && log.tags.length > 0 && (
            <div className="pt-3 border-t border-zinc-800 flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-zinc-500">Tags:</span>
              {log.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    onTagClick(tag);
                    onClose();
                  }}
                  className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded transition-colors"
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
