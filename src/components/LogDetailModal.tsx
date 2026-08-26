'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  X,
  Calendar,
  Clock,
  Star,
  CheckCircle2,
  Code2,
  Copy,
  Check,
  Edit2,
  Trash2,
  Tag,
  Share2,
  ExternalLink,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl shadow-indigo-950/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              {log.category}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{formattedDate}</span>
            </div>
            {log.duration_minutes && (
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{log.duration_minutes} menit</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(log.id, !!log.is_favorite)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
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
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition-colors"
              title="Salin Ringkasan Belajar"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                onClose();
                onEdit(log);
              }}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition-colors"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (confirm(`Yakin ingin menghapus catatan "${log.title}"?`)) {
                  onDelete(log.id);
                  onClose();
                }
              }}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
              title="Hapus"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Title */}
          <h1 className="text-2xl font-bold text-slate-100 leading-tight">
            {log.title}
          </h1>

          {/* Key Takeaways Card */}
          {log.takeaways && log.takeaways.length > 0 && (
            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Key Takeaways / Poin Inti
              </h4>
              <ul className="space-y-1.5 pl-1">
                {log.takeaways.map((point, index) => (
                  <li key={index} className="text-sm text-slate-200 flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Markdown Content */}
          <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {log.content || '*Tidak ada deskripsi tambahan.*'}
            </ReactMarkdown>
          </div>

          {/* Code Snippet Box */}
          {log.code_snippet && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  <span>Code Snippet ({log.code_language || 'code'})</span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-300 bg-slate-800/80 px-2.5 py-1 rounded-md transition-colors"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Kode</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="rounded-xl bg-slate-950 border border-slate-800 p-4 overflow-x-auto text-xs font-mono text-indigo-200/90 leading-normal">
                <code>{log.code_snippet}</code>
              </pre>
            </div>
          )}

          {/* Tags */}
          {log.tags && log.tags.length > 0 && (
            <div className="pt-4 border-t border-slate-800 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Tag className="w-3 h-3" /> Tags:
              </span>
              {log.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    onTagClick(tag);
                    onClose();
                  }}
                  className="text-xs bg-slate-800 hover:bg-indigo-900/60 hover:text-indigo-300 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700/60 transition-colors"
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
