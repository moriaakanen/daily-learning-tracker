'use client';

import React from 'react';
import { StatsSummary } from '@/types';

interface StatsOverviewProps {
  stats: StatsSummary;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const topCategories = Object.entries(stats.categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="mb-6 space-y-3">
      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {/* Streak */}
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="text-[11px] font-medium text-zinc-400">
            Streak Harian
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-zinc-100 tracking-tight">
              {stats.currentStreak}
            </span>
            <span className="text-xs text-zinc-500">hari berturut-turut</span>
          </div>
          <div className="text-[10px] text-zinc-500 mt-1">
            Rekor: {stats.bestStreak} hari
          </div>
        </div>

        {/* Total Time */}
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="text-[11px] font-medium text-zinc-400">
            Waktu Belajar
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-zinc-100 tracking-tight">
              {stats.totalHours}
            </span>
            <span className="text-xs text-zinc-500">total jam</span>
          </div>
          <div className="text-[10px] text-zinc-500 mt-1">
            ~45 mnt / sesi
          </div>
        </div>

        {/* Total Entries */}
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="text-[11px] font-medium text-zinc-400">
            Materi Tercatat
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-zinc-100 tracking-tight">
              {stats.totalLogs}
            </span>
            <span className="text-xs text-zinc-500">entri</span>
          </div>
          <div className="text-[10px] text-zinc-500 mt-1">
            {Object.keys(stats.tagCounts).length} topik berbeda
          </div>
        </div>

        {/* Top Topic */}
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="text-[11px] font-medium text-zinc-400">
            Fokus Terbesar
          </div>
          <div className="mt-1 truncate">
            <span className="text-base font-semibold text-zinc-100 truncate block">
              {topCategories[0]?.[0] || 'Umum'}
            </span>
            <span className="text-xs text-zinc-500">
              {topCategories[0]?.[1] || 0} catatan
            </span>
          </div>
          <div className="text-[10px] text-zinc-500 mt-1 truncate">
            {topCategories.slice(1).map((c) => c[0]).join(', ') || 'Konsisten'}
          </div>
        </div>
      </div>

      {/* 7-Days Minimal Heatmap Bar */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3 flex items-center justify-between gap-4">
        <span className="text-xs text-zinc-400 font-medium whitespace-nowrap hidden sm:inline">
          Aktivitas 7 Hari:
        </span>

        <div className="grid grid-cols-7 gap-2 flex-1 max-w-md">
          {stats.weeklyActivity.map((day) => {
            const dayName = new Date(day.date).toLocaleDateString('id-ID', {
              weekday: 'short',
            });
            const isToday = day.date === new Date().toISOString().split('T')[0];
            const hasActivity = day.count > 0;

            return (
              <div
                key={day.date}
                className="flex flex-col items-center gap-1 text-center"
              >
                <div
                  className={`w-full h-7 rounded-md border flex items-center justify-center text-[11px] font-medium transition-colors ${
                    isToday
                      ? 'border-zinc-500 bg-zinc-200 text-zinc-950 font-bold'
                      : hasActivity
                      ? 'border-zinc-700 bg-zinc-800 text-zinc-200'
                      : 'border-zinc-800/60 bg-zinc-900/40 text-zinc-600'
                  }`}
                  title={`${day.date}: ${day.count} catatan`}
                >
                  {day.count > 0 ? day.count : '·'}
                </div>
                <span className={`text-[10px] ${isToday ? 'text-zinc-200 font-semibold' : 'text-zinc-500'}`}>
                  {dayName}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
