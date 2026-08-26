'use client';

import React from 'react';
import {
  Star,
  Edit2,
  Trash2,
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

export function LogCard({
  log,
  onSelect,
  onEdit,
  onDelete,
  onToggleFavorite,
  onTagClick,
}: LogCardProps) {
  const formattedDate = new Date(log.study_date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="group relative flex flex-col justify-between rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700/90 p-4 transition-all duration-150">
      <div>
        {/* Header Meta: Category, Date, Duration & Actions */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
            <span className="font-medium text-zinc-300 bg-zinc-800/80 px-2 py-0.5 rounded">
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

          <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(log.id, !!log.is_favorite);
              }}
              className="p-1 rounded text-zinc-500 hover:text-amber-400 transition-colors"
              title={log.is_favorite ? 'Favorit' : 'Tandai favorit'}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  log.is_favorite
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-zinc-500'
                }`}
              />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(log);
              }}
              className="p-1 rounded text-zinc-500 hover:text-zinc-200 transition-colors"
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
              className="p-1 rounded text-zinc-500 hover:text-rose-400 transition-colors"
              title="Hapus"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3
          onClick={() => onSelect(log)}
          className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors cursor-pointer leading-snug line-clamp-2"
        >
          {log.title}
        </h3>

        {/* Key Takeaways */}
        {log.takeaways && log.takeaways.length > 0 && (
          <div className="mt-2.5 space-y-1">
            {log.takeaways.slice(0, 2).map((takeaway, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-xs text-zinc-400">
                <span className="text-zinc-500 font-bold select-none">•</span>
                <span className="line-clamp-1">{takeaway}</span>
              </div>
            ))}
          </div>
        )}

        {/* Code Snippet single line preview */}
        {log.code_snippet && (
          <div className="mt-2.5 rounded-lg bg-zinc-950 border border-zinc-800 px-2.5 py-1.5 text-[11px] font-mono text-zinc-300 flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <Code2 className="w-3 h-3 text-zinc-500 shrink-0" />
              <span className="truncate">{log.code_snippet.split('\n')[0]}</span>
            </div>
            <span className="text-[10px] text-zinc-500 uppercase">
              {log.code_language || 'code'}
            </span>
          </div>
        )}
      </div>

      {/* Footer: Tags & Read more */}
      <div className="mt-3.5 pt-2.5 border-t border-zinc-800/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 flex-wrap">
          {log.tags && log.tags.length > 0 ? (
            log.tags.slice(0, 3).map((tag) => (
              <button
                key={tag}
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick(tag);
                }}
                className="text-[10px] text-zinc-400 hover:text-zinc-200 bg-zinc-800/60 hover:bg-zinc-800 px-1.5 py-0.5 rounded transition-colors"
              >
                #{tag}
              </button>
            ))
          ) : (
            <span className="text-[10px] text-zinc-600">Tanpa tag</span>
          )}
        </div>

        <button
          onClick={() => onSelect(log)}
          className="text-xs font-medium text-zinc-300 hover:text-white transition-colors"
        >
          Buka &rarr;
        </button>
      </div>
    </div>
  );
}
