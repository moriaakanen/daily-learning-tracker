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
  Sparkles,
} from 'lucide-react';
import { LearningLog } from '@/types';

interface TimelineViewProps {
  logs: LearningLog[];
  onSelect: (log: LearningLog) => void;
  onEdit: (log: LearningLog) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, current: boolean) => void;
  onTagClick: (tag: string) => void;
}

export function TimelineView({
  logs,
  onSelect,
  onEdit,
  onDelete,
  onToggleFavorite,
  onTagClick,
}: TimelineViewProps) {
  // Group logs by Date
  const groupedByDate: Record<string, LearningLog[]> = {};
  logs.forEach((log) => {
    const d = log.study_date || 'No Date';
    if (!groupedByDate[d]) groupedByDate[d] = [];
    groupedByDate[d].push(log);
  });

  const dates = Object.keys(groupedByDate).sort().reverse();

  return (
    <div className="relative pl-6 sm:pl-8 border-l border-slate-800 space-y-8 my-4">
      {dates.map((dateStr) => {
        const dayLogs = groupedByDate[dateStr];
        const formatted = new Date(dateStr).toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

        return (
          <div key={dateStr} className="relative space-y-3">
            {/* Timeline Dot */}
            <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-indigo-500 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            </div>

            {/* Date Header */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                {formatted}
              </span>
              <span className="text-xs text-slate-500">
                ({dayLogs.length} materi)
              </span>
            </div>

            {/* Cards for this date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dayLogs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => onSelect(log)}
                  className="rounded-2xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 transition-all cursor-pointer group shadow-md"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {log.category}
                    </span>
                    {log.duration_minutes && (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {log.duration_minutes} mnt
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {log.title}
                  </h4>

                  {log.takeaways && log.takeaways.length > 0 && (
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 flex items-start gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{log.takeaways[0]}</span>
                    </p>
                  )}

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      {log.tags?.slice(0, 2).map((t) => (
                        <span key={t} className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                          #{t}
                        </span>
                      ))}
                    </div>
                    <span className="text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 text-[11px] font-semibold">
                      Detail <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
