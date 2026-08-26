'use client';

import React from 'react';
import {
  Flame,
  Clock,
  BookCheck,
  Trophy,
  Calendar,
  Sparkles,
  TrendingUp,
  Tag,
} from 'lucide-react';
import { StatsSummary } from '@/types';

interface StatsOverviewProps {
  stats: StatsSummary;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const topTags = Object.entries(stats.tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topCategories = Object.entries(stats.categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="mb-8 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Streak */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900/90 to-slate-900/40 border border-amber-500/20 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Current Streak
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {stats.currentStreak}
            </span>
            <span className="text-xs font-medium text-slate-400">Hari Beruntun</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <Trophy className="w-3 h-3 text-amber-400/80" />
            <span>Rekor Terbaik: {stats.bestStreak} hari</span>
          </div>
        </div>

        {/* Total Hours */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/10 via-slate-900/90 to-slate-900/40 border border-cyan-500/20 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Total Waktu
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {stats.totalHours}
            </span>
            <span className="text-xs font-medium text-slate-400">Jam Belajar</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-cyan-400/80" />
            <span>Rata-rata 45 mnt / sesi</span>
          </div>
        </div>

        {/* Total Notes */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 via-slate-900/90 to-slate-900/40 border border-indigo-500/20 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Total Catatan
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <BookCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {stats.totalLogs}
            </span>
            <span className="text-xs font-medium text-slate-400">Topik Terarsip</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400/80" />
            <span>Kumpulan ilmu personal</span>
          </div>
        </div>

        {/* Top Focus */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-slate-900/90 to-slate-900/40 border border-purple-500/20 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
              Fokus Utama
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 truncate">
            <span className="text-xl font-bold text-white tracking-tight truncate block">
              {topCategories[0]?.[0] || 'Umum'}
            </span>
            <span className="text-xs font-medium text-slate-400">
              {topCategories[0]?.[1] || 0} materi tercatat
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 truncate">
            Top tags: {topTags.slice(0, 2).map((t) => `#${t[0]}`).join(' ') || 'Belum ada'}
          </div>
        </div>
      </div>

      {/* 7-Days Activity Timeline Bar */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800/80 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Aktivitas Belajar 7 Hari Terakhir
            </span>
          </div>
          <span className="text-xs text-slate-500">Konsistensi harian</span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {stats.weeklyActivity.map((day) => {
            const dayName = new Date(day.date).toLocaleDateString('id-ID', {
              weekday: 'short',
            });
            const isToday = day.date === new Date().toISOString().split('T')[0];
            const hasActivity = day.count > 0;

            return (
              <div
                key={day.date}
                className={`flex flex-col items-center p-2 rounded-xl border transition-all ${
                  isToday
                    ? 'border-indigo-500/50 bg-indigo-500/10'
                    : hasActivity
                    ? 'border-slate-700/60 bg-slate-800/50'
                    : 'border-slate-800/40 bg-slate-900/30'
                }`}
              >
                <span className={`text-[10px] font-medium ${isToday ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}>
                  {dayName}
                </span>
                <div
                  className={`w-8 h-8 rounded-lg mt-1.5 flex items-center justify-center text-xs font-bold transition-all ${
                    hasActivity
                      ? 'bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-500/20'
                      : 'bg-slate-800 text-slate-600'
                  }`}
                  title={`${day.date}: ${day.count} catatan (${day.hours} jam)`}
                >
                  {day.count}
                </div>
                <span className="text-[9px] text-slate-500 mt-1">
                  {day.hours > 0 ? `${day.hours}h` : '-'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
