'use client';

import React from 'react';
import {
  Calendar,
  Clock,
  Star,
  CheckCircle2,
  Code2,
  Tag,
  ArrowUpRight,
  MoreVertical,
  Edit2,
  Trash2,
  BookOpen,
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

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Frontend: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' },
  Backend: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  Database: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  'DevOps & Cloud': { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  'AI & Machine Learning': { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30' },
  'Mobile Dev': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  'System Design': { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  'General / Concept': { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
};

export function LogCard({
  log,
  onSelect,
  onEdit,
  onDelete,
  onToggleFavorite,
  onTagClick,
}: LogCardProps) {
  const colorScheme = CATEGORY_COLORS[log.category] || {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30',
  };

  const formattedDate = new Date(log.study_date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 p-5 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5">
      <div>
        {/* Top Meta: Category Badge, Date, Duration & Favorite */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${colorScheme.bg} ${colorScheme.text} ${colorScheme.border}`}
            >
              {log.category}
            </span>

            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Calendar className="w-3 h-3 text-slate-500" />
              <span>{formattedDate}</span>
            </div>

            {log.duration_minutes && (
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>{log.duration_minutes} mnt</span>
              </div>
            )}
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(log.id, !!log.is_favorite);
              }}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-amber-400 transition-colors"
              title={log.is_favorite ? 'Hapus dari favorit' : 'Tandai favorit'}
            >
              <Star
                className={`w-4 h-4 ${
                  log.is_favorite
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-500 hover:text-amber-400'
                }`}
              />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(log);
              }}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-indigo-400 transition-colors"
              title="Edit Catatan"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Yakin ingin menghapus catatan "${log.title}"?`)) {
                  onDelete(log.id);
                }
              }}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition-colors"
              title="Hapus Catatan"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3
          onClick={() => onSelect(log)}
          className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors cursor-pointer leading-snug line-clamp-2"
        >
          {log.title}
        </h3>

        {/* Key Takeaways */}
        {log.takeaways && log.takeaways.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {log.takeaways.slice(0, 2).map((takeaway, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{takeaway}</span>
              </div>
            ))}
            {log.takeaways.length > 2 && (
              <p className="text-[11px] text-slate-500 pl-5">
                +{log.takeaways.length - 2} poin penting lainnya...
              </p>
            )}
          </div>
        )}

        {/* Content Snippet / Code block preview indicator */}
        {log.code_snippet && (
          <div className="mt-3 rounded-lg bg-slate-950/90 border border-slate-800 p-2 text-xs font-mono text-indigo-300/90 flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <Code2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">{log.code_snippet.split('\n')[0]}</span>
            </div>
            <span className="text-[10px] text-slate-500 uppercase px-1 rounded bg-slate-800">
              {log.code_language || 'code'}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Footer: Tags & Read Detail Link */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {log.tags && log.tags.length > 0 ? (
            log.tags.slice(0, 3).map((tag) => (
              <button
                key={tag}
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick(tag);
                }}
                className="text-[11px] text-slate-400 hover:text-indigo-300 bg-slate-800/70 hover:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700/50 transition-colors"
              >
                #{tag}
              </button>
            ))
          ) : (
            <span className="text-[11px] text-slate-600">No tags</span>
          )}
          {log.tags && log.tags.length > 3 && (
            <span className="text-[10px] text-slate-500">+{log.tags.length - 3}</span>
          )}
        </div>

        <button
          onClick={() => onSelect(log)}
          className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 group-hover:translate-x-0.5 transition-all"
        >
          <span>Baca</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
