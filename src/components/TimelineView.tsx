'use client';

import React from 'react';
import { Clock } from 'lucide-react';
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
    <div className="relative pl-5 border-l border-zinc-800 space-y-6 my-2">
      {dates.map((dateStr) => {
        const dayLogs = groupedByDate[dateStr];
        const formatted = new Date(dateStr).toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

        return (
          <div key={dateStr} className="relative space-y-2.5">
            {/* Minimal Timeline Dot */}
            <div className="absolute -left-[25px] top-1.5 w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-500" />

            {/* Date Header */}
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-semibold text-zinc-300">
                {formatted}
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">
                ({dayLogs.length} catatan)
              </span>
            </div>

            {/* Cards for this date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {dayLogs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => onSelect(log)}
                  className="rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 p-3.5 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5 text-[11px]">
                    <span className="font-medium text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded">
                      {log.category}
                    </span>
                    {log.duration_minutes && (
                      <span className="text-zinc-500">
                        {log.duration_minutes}m
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-semibold text-zinc-100 group-hover:text-white transition-colors line-clamp-1">
                    {log.title}
                  </h4>

                  {log.takeaways && log.takeaways.length > 0 && (
                    <p className="text-[11px] text-zinc-400 mt-1.5 line-clamp-1">
                      • {log.takeaways[0]}
                    </p>
                  )}

                  <div className="mt-2 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1">
                      {log.tags?.slice(0, 2).map((t) => (
                        <span key={t} className="text-[10px] text-zinc-500 bg-zinc-800/60 px-1 py-0.5 rounded">
                          #{t}
                        </span>
                      ))}
                    </div>
                    <span className="text-zinc-400 group-hover:text-zinc-200">
                      Buka &rarr;
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
