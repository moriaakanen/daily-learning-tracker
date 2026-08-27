'use client';

import React, { useState, useMemo } from 'react';
import {
  Flame,
  Clock,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Award,
  Zap,
  CalendarDays,
  Sparkles,
  Smile,
} from 'lucide-react';
import { StatsSummary, LearningLog } from '@/types';
import { getTopicTheme } from '@/lib/topicTheme';

interface StatsOverviewProps {
  stats: StatsSummary;
  logs: LearningLog[];
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export function StatsOverview({ stats, logs }: StatsOverviewProps) {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth()); // 0 - 11
  const [selectedDateDetail, setSelectedDateDetail] = useState<string | null>(null);
  const todayStr = new Date().toISOString().split('T')[0];

  // Map of logs by date
  const dateLogsMap = useMemo(() => {
    const map = new Map<string, LearningLog[]>();
    logs.forEach((log) => {
      if (log.study_date) {
        const existing = map.get(log.study_date) || [];
        map.set(log.study_date, [...existing, log]);
      }
    });
    return map;
  }, [logs]);

  // Days in selected month
  const calendarDays = useMemo(() => {
    const firstDay = new Date(selectedYear, selectedMonth, 1).getDay(); // 0 = Sunday
    const totalDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    const days: {
      dayNumber: number;
      dateString: string;
      logsCount: number;
      totalMinutes: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }[] = [];

    // Empty padding slots for days of previous month
    for (let i = 0; i < firstDay; i++) {
      days.push({
        dayNumber: 0,
        dateString: '',
        logsCount: 0,
        totalMinutes: 0,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    for (let d = 1; d <= totalDays; d++) {
      const monthStr = String(selectedMonth + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateStr = `${selectedYear}-${monthStr}-${dayStr}`;

      const dayLogs = dateLogsMap.get(dateStr) || [];
      const mins = dayLogs.reduce((acc, curr) => acc + (Number(curr.duration_minutes) || 0), 0);

      days.push({
        dayNumber: d,
        dateString: dateStr,
        logsCount: dayLogs.length,
        totalMinutes: mins,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
      });
    }

    return days;
  }, [selectedYear, selectedMonth, dateLogsMap]);

  // Monthly stats for the selected month
  const monthStats = useMemo(() => {
    let activeDays = 0;
    let totalMins = 0;
    let totalLogs = 0;

    calendarDays.forEach((day) => {
      if (day.isCurrentMonth && day.logsCount > 0) {
        activeDays++;
        totalMins += day.totalMinutes;
        totalLogs += day.logsCount;
      }
    });

    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const consistencyRate = Math.round((activeDays / daysInMonth) * 100);

    return {
      activeDays,
      totalHours: Math.round((totalMins / 60) * 10) / 10,
      totalLogs,
      consistencyRate,
    };
  }, [calendarDays, selectedYear, selectedMonth]);

  // Top Most Frequent Categories & Distribution
  const topCategories = useMemo(() => {
    const counts: Record<string, { count: number; minutes: number; color: string }> = {};
    logs.forEach((log) => {
      const cat = log.category || 'Umum';
      if (!counts[cat]) {
        const theme = getTopicTheme(cat);
        counts[cat] = { count: 0, minutes: 0, color: theme.color };
      }
      counts[cat].count += 1;
      counts[cat].minutes += Number(log.duration_minutes) || 0;
    });

    const total = logs.length || 1;
    return Object.entries(counts)
      .map(([name, data]) => ({
        name,
        count: data.count,
        hours: Math.round((data.minutes / 60) * 10) / 10,
        percentage: Math.round((data.count / total) * 100),
        color: data.color,
      }))
      .sort((a, b) => b.count - a.count);
  }, [logs]);

  // Deep Insights: Most Productive Day of Week
  const mostProductiveDay = useMemo(() => {
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    const dayMins = [0, 0, 0, 0, 0, 0, 0];

    logs.forEach((log) => {
      if (log.study_date) {
        const dayIdx = new Date(log.study_date).getDay();
        dayCounts[dayIdx] += 1;
        dayMins[dayIdx] += Number(log.duration_minutes) || 0;
      }
    });

    let maxIdx = 0;
    let maxCount = 0;
    dayCounts.forEach((c, idx) => {
      if (c > maxCount) {
        maxCount = c;
        maxIdx = idx;
      }
    });

    const dayFullNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return {
      dayName: maxCount > 0 ? dayFullNames[maxIdx] : 'Belum Ada',
      count: maxCount,
      hours: Math.round((dayMins[maxIdx] / 60) * 10) / 10,
    };
  }, [logs]);

  // Learner Plant Stage Mascot Level
  const learnerStage = useMemo(() => {
    const count = logs.length;
    if (count >= 20) return { title: 'Pohon Wawasan Rindang', icon: '🌳', desc: 'Luar biasa! Pengetahuanmu telah berakar kokoh.' };
    if (count >= 10) return { title: 'Tunas Ilmu Subur', icon: '🌿', desc: 'Hebat! Konsistensimu terus bertumbuh subur.' };
    if (count >= 3) return { title: 'Bibit Belajar Aktif', icon: '🌱', desc: 'Awal yang menyenangkan! Terus lanjutkan ya.' };
    return { title: 'Benih Pembelajar Ceria', icon: '✨', desc: 'Selamat datang! Mari tanam kebiasaan belajar baru.' };
  }, [logs]);

  // Daily Average Study Time
  const dailyAverageMinutes = useMemo(() => {
    const uniqueDates = new Set(logs.map((l) => l.study_date).filter(Boolean)).size;
    if (!uniqueDates) return 0;
    const totalMins = logs.reduce((acc, curr) => acc + (Number(curr.duration_minutes) || 0), 0);
    return Math.round(totalMins / uniqueDates);
  }, [logs]);

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const activeDateLogs = useMemo(() => {
    if (!selectedDateDetail) return [];
    return dateLogsMap.get(selectedDateDetail) || [];
  }, [selectedDateDetail, dateLogsMap]);

  return (
    <div className="rounded-2xl border border-[var(--gh-border)] bg-[var(--gh-surface)] overflow-hidden space-y-0 text-xs shadow-sm">
      {/* Header Bar with Cheerful Learner Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-[var(--gh-border)] bg-gradient-to-r from-indigo-500/5 via-emerald-500/5 to-amber-500/5 text-[var(--gh-text-primary)] font-medium">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-base shadow-2xs">
            {learnerStage.icon}
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <span>{learnerStage.title}</span>
              <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-0.2 rounded-full font-bold">
                Level Aktif
              </span>
            </div>
            <p className="text-[11px] text-[var(--gh-text-secondary)] font-medium">
              {learnerStage.desc}
            </p>
          </div>
        </div>

        {/* Global Key Stats Pills with Cheerful Colors */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold" title="Streak Belajar Beruntun">
            <span>🔥</span>
            <span>{stats.currentStreak} Hari Streak</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold" title="Total Akumulasi Jam Belajar">
            <span>⏱️</span>
            <span>{stats.totalHours} Jam Total</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold" title="Rata-rata Waktu Belajar per Sesi Hari">
            <span>⚡</span>
            <span>{dailyAverageMinutes} Menit/Sesi</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 font-bold" title="Total Catatan Pembelajaran">
            <span>📚</span>
            <span>{logs.length} Catatan</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left (Interactive Mini Calendar) + Right (Top Topics & Insights) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-[var(--gh-border)]">
        {/* Left Column: Interactive Month Calendar (5 cols) */}
        <div className="lg:col-span-5 p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-bold text-xs text-[var(--gh-text-primary)]">
              <span>📅</span>
              <span>Kalender Pembelajaran Bulanan</span>
            </div>

            {/* Month & Year Selectors */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-lg hover:bg-[var(--gh-surface-hover)] text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] transition-colors cursor-pointer"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="bg-[var(--gh-bg)] border border-[var(--gh-border)] text-[var(--gh-text-primary)] text-[11px] font-bold rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                >
                  {MONTH_NAMES.map((name, idx) => (
                    <option key={name} value={idx}>
                      {name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-[var(--gh-bg)] border border-[var(--gh-border)] text-[var(--gh-text-primary)] text-[11px] font-bold rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                >
                  {[2023, 2024, 2025, 2026, 2027, 2028].map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-lg hover:bg-[var(--gh-surface-hover)] text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] transition-colors cursor-pointer"
                title="Bulan Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Heatmap Grid */}
          <div className="space-y-1">
            {/* Day Header Row */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[var(--gh-text-tertiary)] pb-1">
              {DAY_NAMES.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* Calendar Days Matrix */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((day, idx) => {
                if (!day.isCurrentMonth) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="h-8 rounded-lg bg-[var(--gh-bg)]/40 opacity-20 border border-transparent"
                    />
                  );
                }

                // Heatmap Color based on learning minutes
                let bgStyle = 'bg-[var(--gh-bg)] border-[var(--gh-border-subtle)] text-[var(--gh-text-secondary)]';
                let dot = '';

                if (day.logsCount > 0) {
                  if (day.totalMinutes >= 90) {
                    bgStyle = 'bg-emerald-500 text-white font-bold border-emerald-600 shadow-xs';
                    dot = '🌟';
                  } else if (day.totalMinutes >= 45) {
                    bgStyle = 'bg-emerald-400 text-slate-900 font-bold border-emerald-500';
                    dot = '🌿';
                  } else {
                    bgStyle = 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold border-emerald-500/40';
                    dot = '🌱';
                  }
                }

                const isFuture = day.dateString > todayStr;
                const isSelected = selectedDateDetail === day.dateString;

                return (
                  <button
                    key={day.dateString}
                    type="button"
                    disabled={isFuture}
                    onClick={() => {
                      if (!isFuture) {
                        setSelectedDateDetail(
                          selectedDateDetail === day.dateString ? null : day.dateString
                        );
                      }
                    }}
                    className={`relative h-8 rounded-lg border text-xs flex flex-col items-center justify-center transition-all ${bgStyle} ${
                      isFuture
                        ? 'opacity-30 cursor-not-allowed border-dashed'
                        : 'cursor-pointer hover:scale-105'
                    } ${
                      isSelected ? 'ring-2 ring-indigo-500 scale-105 z-10' : ''
                    } ${day.isToday ? 'ring-1 ring-amber-400' : ''}`}
                    title={
                      isFuture
                        ? `${day.dateString}: Tanggal masa depan`
                        : day.logsCount > 0
                        ? `${day.dateString}: ${day.logsCount} catatan, ${day.totalMinutes} menit belajar`
                        : `${day.dateString}: Klik untuk melihat detail`
                    }
                  >
                    <span className="text-[11px] font-semibold">{day.dayNumber}</span>
                    {dot && <span className="absolute -bottom-1 text-[8px] leading-none">{dot}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Month Summary Bar */}
          <div className="p-3 bg-[var(--gh-bg)] rounded-xl border border-[var(--gh-border)] flex items-center justify-between text-[11px]">
            <div>
              <span className="text-[var(--gh-text-secondary)]">Konsistensi {MONTH_NAMES[selectedMonth]}: </span>
              <span className="font-bold text-emerald-500">{monthStats.activeDays} Hari Aktif ({monthStats.consistencyRate}%)</span>
            </div>
            <div className="font-bold text-indigo-500">
              ⏱️ {monthStats.totalHours} Jam
            </div>
          </div>

          {/* Selected Date Detail Drawer */}
          {selectedDateDetail && (
            <div className="p-3.5 bg-[var(--gh-bg)] rounded-xl border border-indigo-500/30 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[var(--gh-text-primary)] flex items-center gap-1.5">
                  <span>📅</span>
                  <span>Catatan pada {selectedDateDetail}:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedDateDetail(null)}
                  className="text-[10px] text-rose-500 hover:underline font-bold cursor-pointer"
                >
                  Tutup
                </button>
              </div>

              <div className="space-y-1.5">
                {activeDateLogs.length > 0 ? (
                  activeDateLogs.map((l) => (
                    <div
                      key={l.id}
                      className="p-2 rounded-lg bg-[var(--gh-surface)] border border-[var(--gh-border)] flex items-center justify-between text-xs"
                    >
                      <div className="truncate font-semibold text-[var(--gh-text-primary)]">
                        {l.title}
                      </div>
                      <div className="text-[10px] font-bold text-emerald-500 shrink-0 ml-2">
                        ⏱️ {l.duration_minutes}m
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-3 px-3 rounded-lg bg-[var(--gh-surface)] border border-[var(--gh-border)] text-center text-xs text-[var(--gh-text-secondary)] font-medium flex items-center justify-center gap-2">
                    <span>🌱</span>
                    <span>Tidak ada catatan/jurnal</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Top Topics Distribution & Deep Insights (7 cols) */}
        <div className="lg:col-span-7 p-4 sm:p-5 space-y-4">
          {/* Section: Top Categories Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-xs text-[var(--gh-text-primary)]">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>Topik yang Paling Sering Dipelajari</span>
              </div>
              <span className="text-[11px] text-[var(--gh-text-secondary)] font-medium">
                Distribusi Porsi Belajar
              </span>
            </div>

            {topCategories.length === 0 ? (
              <p className="text-[11px] text-[var(--gh-text-tertiary)] italic">
                Belum ada data pembelajaran.
              </p>
            ) : (
              <div className="space-y-2.5">
                {topCategories.slice(0, 4).map((cat) => {
                  const tTheme = getTopicTheme(cat.name);
                  return (
                    <div key={cat.name} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs">{tTheme.emoji}</span>
                          <span className="font-bold text-[var(--gh-text-primary)] truncate max-w-[180px]">
                            {cat.name}
                          </span>
                          <span className="text-[10px] text-[var(--gh-text-tertiary)] font-medium">
                            ({cat.count} entri • {cat.hours} jam)
                          </span>
                        </div>
                        <span className="font-mono text-xs font-bold text-[var(--gh-text-primary)]">
                          {cat.percentage}%
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="h-2 w-full bg-[var(--gh-bg)] rounded-full overflow-hidden border border-[var(--gh-border-subtle)]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${cat.percentage}%`,
                            backgroundColor: tTheme.color || cat.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: Deep Productivity Insights Grid */}
          <div className="pt-3 border-t border-[var(--gh-border)] space-y-2.5">
            <div className="flex items-center gap-1.5 font-bold text-xs text-[var(--gh-text-primary)]">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Insight & Pola Belajar Ceria</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Insight 1: Hari Paling Produktif */}
              <div className="p-3 bg-[var(--gh-bg)] rounded-xl border border-[var(--gh-border)] space-y-1 shadow-2xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--gh-text-tertiary)] flex items-center gap-1">
                  <span>🏆</span> Hari Favorit
                </span>
                <div className="text-sm font-bold text-indigo-500">
                  {mostProductiveDay.dayName}
                </div>
                <p className="text-[10px] text-[var(--gh-text-secondary)] font-medium">
                  {mostProductiveDay.count} catatan ({mostProductiveDay.hours} jam total)
                </p>
              </div>

              {/* Insight 2: Fokus Kategori Utama */}
              <div className="p-3 bg-[var(--gh-bg)] rounded-xl border border-[var(--gh-border)] space-y-1 shadow-2xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--gh-text-tertiary)] flex items-center gap-1">
                  <span>🎯</span> Dominasi Bidang
                </span>
                <div className="text-sm font-bold text-emerald-500 truncate">
                  {topCategories[0]?.name.split(' ')[0] || 'Umum'}
                </div>
                <p className="text-[10px] text-[var(--gh-text-secondary)] font-medium">
                  {topCategories[0]?.percentage || 0}% dari seluruh waktu belajar
                </p>
              </div>

              {/* Insight 3: Total Entri Catatan */}
              <div className="p-3 bg-[var(--gh-bg)] rounded-xl border border-[var(--gh-border)] space-y-1 shadow-2xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--gh-text-tertiary)] flex items-center gap-1">
                  <span>✨</span> Total Catatan
                </span>
                <div className="text-sm font-bold text-amber-500">
                  {logs.length} Jurnal
                </div>
                <p className="text-[10px] text-[var(--gh-text-secondary)] font-medium">
                  Terdokumentasi rapi
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
