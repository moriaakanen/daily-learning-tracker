'use client';

import React from 'react';
import { GitCommit, Clock, Tag } from 'lucide-react';
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
  const groupedByDate: Record<string, LearningLog[]> = {};
  logs.forEach((log) => {
    const d = log.study_date || 'No Date';
    if (!groupedByDate[d]) groupedByDate[d] = [];
    groupedByDate[d].push(log);
  });

  const dates = Object.keys(groupedByDate).sort().reverse();

  return (
    <div className="relative pl-6 border-l-2 border-[var(--gh-border)] space-y-6 my-4">
      {dates.map((dateStr) => {
        const dayLogs = groupedByDate[dateStr];
        const formatted = new Date(dateStr).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });

        return (
          <div key={dateStr} className="relative space-y-3">
            {/* Git Commit Timeline Dot */}
            <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-[var(--gh-bg)] border-2 border-[var(--gh-accent)] flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-[var(--gh-accent)]" />
            </div>

            {/* Date Header */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[var(--gh-text-primary)]">
                Commits on {formatted}
              </span>
              <span className="text-[11px] text-[var(--gh-text-tertiary)] font-mono">
                ({dayLogs.length} entries)
              </span>
            </div>

            {/* Commit Rows list */}
            <div className="rounded-md border border-[var(--gh-border)] bg-[var(--gh-surface)] divide-y divide-[var(--gh-border-subtle)] overflow-hidden">
              {dayLogs.map((log) => {
                const fakeHash = (log.id.replace(/[^a-f0-9]/gi, '') + 'abcdef012345').substring(0, 7);

                return (
                  <div
                    key={log.id}
                    onClick={() => onSelect(log)}
                    className="p-3 hover:bg-[var(--gh-surface-hover)] transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-[var(--gh-text-primary)] hover:text-[var(--gh-accent)] transition-colors">
                          {log.title}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full border border-[var(--gh-border)] bg-[var(--gh-badge-bg)] text-[var(--gh-text-secondary)]">
                          {log.category}
                        </span>
                      </div>

                      {log.takeaways && log.takeaways.length > 0 && (
                        <p className="text-xs text-[var(--gh-text-secondary)] line-clamp-1">
                          • {log.takeaways[0]}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-xs">
                      {log.duration_minutes && (
                        <span className="text-[11px] text-[var(--gh-text-tertiary)] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {log.duration_minutes}m
                        </span>
                      )}
                      <span className="font-mono text-[11px] bg-[var(--gh-code-bg)] border border-[var(--gh-border)] px-1.5 py-0.5 rounded text-[var(--gh-text-secondary)]">
                        {fakeHash}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
