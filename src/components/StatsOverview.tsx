'use client';

import React, { useMemo } from 'react';
import { Flame, Clock, BookOpen, GitCommit, Check } from 'lucide-react';
import { StatsSummary, LearningLog } from '@/types';

interface StatsOverviewProps {
  stats: StatsSummary;
  logs: LearningLog[];
}

export function StatsOverview({ stats, logs }: StatsOverviewProps) {
  // Generate real GitHub 16-weeks contribution squares
  const contributionGrid = useMemo(() => {
    const weeks: { date: string; count: number; hours: number; level: number }[][] = [];
    const dateMap = new Map<string, { count: number; hours: number }>();

    logs.forEach((log) => {
      if (log.study_date) {
        const existing = dateMap.get(log.study_date) || { count: 0, hours: 0 };
        dateMap.set(log.study_date, {
          count: existing.count + 1,
          hours: existing.hours + (Number(log.duration_minutes) || 30) / 60,
        });
      }
    });

    const totalWeeks = 16;
    const now = new Date();
    const currentDay = now.getDay(); // 0 is Sunday

    // Align to the end of the current week (Saturday)
    const endDate = new Date(now);
    endDate.setDate(now.getDate() + (6 - currentDay));

    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - totalWeeks * 7 + 1);

    const iter = new Date(startDate);

    for (let w = 0; w < totalWeeks; w++) {
      const currentWeek: { date: string; count: number; hours: number; level: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = iter.toISOString().split('T')[0];
        const record = dateMap.get(dateStr) || { count: 0, hours: 0 };

        let level = 0;
        if (record.count === 1) level = 1;
        else if (record.count === 2) level = 2;
        else if (record.count === 3) level = 3;
        else if (record.count >= 4) level = 4;

        currentWeek.push({
          date: dateStr,
          count: record.count,
          hours: Math.round(record.hours * 10) / 10,
          level,
        });

        iter.setDate(iter.getDate() + 1);
      }
      weeks.push(currentWeek);
    }

    return weeks;
  }, [logs]);

  return (
    <div className="mb-6 rounded-md border border-[var(--gh-border)] bg-[var(--gh-surface)] overflow-hidden">
      {/* Top Header of Contribution Container */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-[var(--gh-border)] bg-[var(--gh-surface-subtle)] text-xs text-[var(--gh-text-primary)] font-medium">
        <div className="flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-[var(--gh-accent)]" />
          <span>Learning Activity & Contribution Graph</span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-[var(--gh-text-secondary)] font-normal">
          <div className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-semibold text-[var(--gh-text-primary)]">{stats.currentStreak} days</span> streak
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[var(--gh-text-secondary)]" />
            <span className="font-semibold text-[var(--gh-text-primary)]">{stats.totalHours} hrs</span> total
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-[var(--gh-text-secondary)]" />
            <span className="font-semibold text-[var(--gh-text-primary)]">{stats.totalLogs} entries</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid area */}
      <div className="p-4 overflow-x-auto">
        <div className="min-w-[500px]">
          <div className="flex gap-1">
            {/* Days Column */}
            <div className="flex flex-col gap-1 pr-2 text-[9px] text-[var(--gh-text-tertiary)] select-none justify-between h-[84px]">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            {/* Weeks columns */}
            <div className="flex gap-1 flex-1">
              {contributionGrid.map((week, wIndex) => (
                <div key={wIndex} className="flex flex-col gap-1">
                  {week.map((day) => {
                    const isToday = day.date === new Date().toISOString().split('T')[0];
                    let bgColor = 'var(--gh-graph-0)';
                    if (day.level === 1) bgColor = 'var(--gh-graph-1)';
                    if (day.level === 2) bgColor = 'var(--gh-graph-2)';
                    if (day.level === 3) bgColor = 'var(--gh-graph-3)';
                    if (day.level === 4) bgColor = 'var(--gh-graph-4)';

                    return (
                      <div
                        key={day.date}
                        className={`w-2.5 h-2.5 rounded-[2px] transition-transform hover:scale-125 cursor-pointer ${
                          isToday ? 'ring-1 ring-[var(--gh-accent)] ring-offset-1 ring-offset-[var(--gh-bg)]' : ''
                        }`}
                        style={{ backgroundColor: bgColor }}
                        title={`${day.date}: ${day.count} catatan (${day.hours} jam belajar)`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-[11px] text-[var(--gh-text-secondary)] mt-3 pt-2 border-t border-[var(--gh-border-subtle)]">
            <span className="text-[10px]">Learn continuously & commit your thoughts</span>
            <div className="flex items-center gap-1 text-[10px]">
              <span>Less</span>
              <div className="w-2.5 h-2.5 rounded-[2px] bg-[var(--gh-graph-0)]" />
              <div className="w-2.5 h-2.5 rounded-[2px] bg-[var(--gh-graph-1)]" />
              <div className="w-2.5 h-2.5 rounded-[2px] bg-[var(--gh-graph-2)]" />
              <div className="w-2.5 h-2.5 rounded-[2px] bg-[var(--gh-graph-3)]" />
              <div className="w-2.5 h-2.5 rounded-[2px] bg-[var(--gh-graph-4)]" />
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
