'use client';

import React, { useState, useMemo } from 'react';
import {
  Flame,
  Clock,
  BookOpen,
  GitCommit,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  BarChart2,
  Tag,
  Award,
  Zap,
  CheckCircle2,
  CalendarDays,
  Target,
} from 'lucide-react';
import { StatsSummary, LearningLog } from '@/types';

interface StatsOverviewProps {
  stats: StatsSummary;
  logs: LearningLog[];
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAYS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const CATEGORY_COLORS: Record<string, string> = {
  'Teknologi & Coding': '#38bdf8',
  'Bisnis & Finansial': '#34d399',
  'Buku & Literasi': '#fbbf24',
  'Bahasa & Komunikasi': '#a78bfa',
  'Sains & Psikologi': '#f472b6',
  'Produktivitas & Habits': '#fb923c',
  'Desain & Kreativitas': '#22d3ee',
  'Kesehatan & Olahraga': '#4ade80',
  'Wawasan Umum & Filosofi': '#818cf8',
};

export function StatsOverview({ stats, logs }: StatsOverviewProps) {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());
  const [selectedDateDetail, setSelectedDateDetail] = useState<string | null>(today.toISOString().split('T')[0]);

  // Date logs map for O(1) lookup
  const dateLogsMap = useMemo(() => {
    const map = new Map<string, LearningLog[]>();
    logs.forEach((log) => {
      if (log.study_date) {
        const existing = map.get(log.study_date) || [];
        existing.push(log);
        map.set(log.study_date, existing);
      }
    });
    return map;
  }, [logs]);

  // Month navigation
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  // Generate days for the mini calendar
  const calendarDays = useMemo(() => {
    const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    const days: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      logsCount: number;
      durationMins: number;
    }[] = [];

    // Preceding empty/trailing days
    for (let i = 0; i < firstDay; i++) {
      days.push({
        dateStr: '',
        dayNumber: 0,
        isCurrentMonth: false,
        logsCount: 0,
        durationMins: 0,
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(selectedMonth + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateStr = `${selectedYear}-${monthStr}-${dayStr}`;

      const dayLogs = dateLogsMap.get(dateStr) || [];
      const durationMins = dayLogs.reduce((sum, l) => sum + (Number(l.duration_minutes) || 0), 0);

      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        logsCount: dayLogs.length,
        durationMins,
      });
    }

    return days;
  }, [selectedYear, selectedMonth, dateLogsMap]);

  // Selected Month Summary
  const monthStats = useMemo(() => {
    let totalLogsInMonth = 0;
    let totalMinutesInMonth = 0;
    let activeDaysCount = 0;

    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(selectedMonth + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateStr = `${selectedYear}-${monthStr}-${dayStr}`;
      const dayLogs = dateLogsMap.get(dateStr);
      if (dayLogs && dayLogs.length > 0) {
        activeDaysCount++;
        totalLogsInMonth += dayLogs.length;
        totalMinutesInMonth += dayLogs.reduce((sum, l) => sum + (Number(l.duration_minutes) || 0), 0);
      }
    }

    const consistencyRate = Math.round((activeDaysCount / daysInMonth) * 100);

    return {
      totalLogsInMonth,
      totalHoursInMonth: Math.round((totalMinutesInMonth / 60) * 10) / 10,
      activeDaysCount,
      consistencyRate,
    };
  }, [selectedYear, selectedMonth, dateLogsMap]);

  // Top Most Frequent Categories
  const topCategories = useMemo(() => {
    const counts: Record<string, { count: number; minutes: number }> = {};
    logs.forEach((log) => {
      const cat = log.category || 'General';
      if (!counts[cat]) counts[cat] = { count: 0, minutes: 0 };
      counts[cat].count += 1;
      counts[cat].minutes += Number(log.duration_minutes) || 30;
    });

    const totalLogs = logs.length || 1;

    return Object.entries(counts)
      .map(([name, data]) => ({
        name,
        count: data.count,
        hours: Math.round((data.minutes / 60) * 10) / 10,
        percentage: Math.round((data.count / totalLogs) * 100),
        color: CATEGORY_COLORS[name] || '#38bdf8',
      }))
      .sort((a, b) => b.count - a.count);
  }, [logs]);

  // Most Productive Day of the Week calculation
  const mostProductiveDay = useMemo(() => {
    const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // 0 Sun - 6 Sat
    const dayHours = [0, 0, 0, 0, 0, 0, 0];

    logs.forEach((log) => {
      if (log.study_date) {
        const d = new Date(log.study_date + 'T00:00:00');
        const dayIdx = d.getDay();
        dayCounts[dayIdx] += 1;
        dayHours[dayIdx] += (Number(log.duration_minutes) || 30) / 60;
      }
    });

    let maxIndex = 1; // default Monday
    let maxLogs = 0;
    dayCounts.forEach((c, idx) => {
      if (c > maxLogs) {
        maxLogs = c;
        maxIndex = idx;
      }
    });

    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return {
      dayName: dayNames[maxIndex],
      count: dayCounts[maxIndex],
      hours: Math.round(dayHours[maxIndex] * 10) / 10,
    };
  }, [logs]);

  // Total Takeaways & Daily Average calculation
  const totalTakeaways = useMemo(() => {
    return logs.reduce((sum, l) => sum + (l.takeaways?.length || 0), 0);
  }, [logs]);

  const dailyAverageMinutes = useMemo(() => {
    const uniqueDays = new Set(logs.map((l) => l.study_date).filter(Boolean)).size;
    if (uniqueDays === 0) return 0;
    const totalMins = logs.reduce((sum, l) => sum + (Number(l.duration_minutes) || 30), 0);
    return Math.round(totalMins / uniqueDays);
  }, [logs]);

  // Selected date logs detail list
  const selectedDateLogs = useMemo(() => {
    if (!selectedDateDetail) return [];
    return dateLogsMap.get(selectedDateDetail) || [];
  }, [selectedDateDetail, dateLogsMap]);

  return (
    <div className="rounded-md border border-[var(--gh-border)] bg-[var(--gh-surface)] overflow-hidden space-y-0 text-xs">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-[var(--gh-border)] bg-[var(--gh-surface-subtle)] text-[var(--gh-text-primary)] font-medium">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-[var(--gh-accent)]" />
          <span className="font-semibold text-xs">Learning Activity & Insights Hub</span>
        </div>

        {/* Global Key Stats Pills */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-[11px] text-[var(--gh-text-secondary)]">
          <div className="flex items-center gap-1.5" title="Streak Belajar Beruntun">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Streak:</span>
            <span className="font-bold text-[var(--gh-text-primary)]">{stats.currentStreak} Hari</span>
            <span className="text-[10px] text-[var(--gh-text-tertiary)]">(Rekor: {stats.bestStreak})</span>
          </div>

          <span>•</span>

          <div className="flex items-center gap-1.5" title="Total Akumulasi Jam Belajar">
            <Clock className="w-3.5 h-3.5 text-[var(--gh-accent)]" />
            <span>Total Waktu:</span>
            <span className="font-bold text-[var(--gh-text-primary)]">{stats.totalHours} Jam</span>
          </div>

          <span>•</span>

          <div className="flex items-center gap-1.5" title="Rata-rata Waktu Belajar per Sesi Hari">
            <Zap className="w-3.5 h-3.5 text-emerald-500" />
            <span>Rerata Harian:</span>
            <span className="font-bold text-[var(--gh-text-primary)]">{dailyAverageMinutes} Menit</span>
          </div>

          <span>•</span>

          <div className="flex items-center gap-1.5" title="Total Catatan Pembelajaran">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>{logs.length} Catatan</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left (Interactive Mini Calendar) + Right (Top Topics & Insights) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-[var(--gh-border)]">
        {/* Left Column: Interactive Month Calendar (5 cols) */}
        <div className="lg:col-span-5 p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-semibold text-xs text-[var(--gh-text-primary)]">
              <CalendarDays className="w-4 h-4 text-[var(--gh-accent)]" />
              <span>Kalender Aktivitas Bulanan</span>
            </div>

            {/* Month & Year Selectors */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded hover:bg-[var(--gh-surface-hover)] text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] transition-colors"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-1">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="bg-[var(--gh-bg)] border border-[var(--gh-border)] text-[var(--gh-text-primary)] rounded px-1.5 py-0.5 text-[11px] font-semibold focus:outline-none cursor-pointer"
                >
                  {MONTH_NAMES.map((name, idx) => (
                    <option key={name} value={idx} className="bg-[var(--gh-surface)]">
                      {name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-[var(--gh-bg)] border border-[var(--gh-border)] text-[var(--gh-text-primary)] rounded px-1.5 py-0.5 text-[11px] font-semibold focus:outline-none cursor-pointer font-mono"
                >
                  {[2023, 2024, 2025, 2026, 2027, 2028].map((yr) => (
                    <option key={yr} value={yr} className="bg-[var(--gh-surface)]">
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded hover:bg-[var(--gh-surface-hover)] text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] transition-colors"
                title="Bulan Berikutnya"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mini Calendar Grid */}
          <div className="p-3 bg-[var(--gh-bg)] rounded-md border border-[var(--gh-border)] space-y-2">
            {/* Days of week header */}
            <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-[var(--gh-text-tertiary)] pb-1 border-b border-[var(--gh-border-subtle)]">
              {DAYS_SHORT.map((d, i) => (
                <span key={d} className={i === 0 ? 'text-rose-400' : ''}>
                  {d}
                </span>
              ))}
            </div>

            {/* Calendar Numbers Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {calendarDays.map((cell, idx) => {
                if (!cell.isCurrentMonth) {
                  return <div key={`empty-${idx}`} className="h-7" />;
                }

                const isToday = cell.dateStr === today.toISOString().split('T')[0];
                const isSelected = cell.dateStr === selectedDateDetail;
                const hasLogs = cell.logsCount > 0;

                // Color code intensity
                let cellBg = 'transparent';
                let textColor = 'var(--gh-text-secondary)';
                if (hasLogs) {
                  if (cell.logsCount === 1) cellBg = 'var(--gh-graph-1)';
                  else if (cell.logsCount === 2) cellBg = 'var(--gh-graph-2)';
                  else if (cell.logsCount === 3) cellBg = 'var(--gh-graph-3)';
                  else cellBg = 'var(--gh-graph-4)';
                  textColor = '#ffffff';
                }

                return (
                  <button
                    key={cell.dateStr}
                    type="button"
                    onClick={() => setSelectedDateDetail(cell.dateStr)}
                    className={`relative h-7 w-full rounded flex flex-col items-center justify-center text-[11px] font-medium transition-all ${
                      isSelected
                        ? 'ring-2 ring-[var(--gh-accent)] ring-offset-1 ring-offset-[var(--gh-bg)] font-bold'
                        : ''
                    } ${isToday && !hasLogs ? 'border border-[var(--gh-accent)] text-[var(--gh-accent)] font-bold' : ''}`}
                    style={{
                      backgroundColor: hasLogs ? cellBg : undefined,
                      color: hasLogs ? textColor : undefined,
                    }}
                    title={`${cell.dateStr}: ${cell.logsCount} catatan (${cell.durationMins} menit)`}
                  >
                    <span>{cell.dayNumber}</span>
                    {hasLogs && (
                      <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-white opacity-80" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Month Quick Summary & Selected Date Logs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-[var(--gh-text-secondary)]">
              <span>Konsistensi Bulan Ini:</span>
              <span className="font-semibold text-[var(--gh-text-primary)]">
                {monthStats.activeDaysCount} Hari Aktif ({monthStats.consistencyRate}%) • {monthStats.totalHoursInMonth} Jam
              </span>
            </div>

            {/* Selected Date Preview Box */}
            {selectedDateDetail && (
              <div className="p-2.5 bg-[var(--gh-bg)] rounded-md border border-[var(--gh-border)] text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--gh-text-primary)]">
                  <span>Aktivitas pada {selectedDateDetail}:</span>
                  <span className="text-[10px] text-[var(--gh-accent)]">
                    {selectedDateLogs.length} Catatan
                  </span>
                </div>

                {selectedDateLogs.length === 0 ? (
                  <p className="text-[11px] text-[var(--gh-text-tertiary)] italic">
                    Tidak ada catatan pembelajaran pada tanggal ini.
                  </p>
                ) : (
                  <div className="space-y-1 max-h-[90px] overflow-y-auto pr-1">
                    {selectedDateLogs.map((l) => (
                      <div key={l.id} className="flex items-center justify-between text-[11px] py-0.5">
                        <span className="truncate max-w-[200px] text-[var(--gh-text-primary)] font-medium">
                          • {l.title}
                        </span>
                        <span className="text-[10px] text-[var(--gh-text-secondary)] shrink-0 ml-1">
                          {l.duration_minutes}m ({l.category})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Top Topics, Category Distribution & Productivity Insights (7 cols) */}
        <div className="lg:col-span-7 p-4 sm:p-5 space-y-5">
          {/* Section: Top Categories / Topics Distribution */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-xs text-[var(--gh-text-primary)]">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>Topik yang Paling Sering Dipelajari</span>
              </div>
              <span className="text-[11px] text-[var(--gh-text-secondary)]">
                Distribusi Porsi Belajar
              </span>
            </div>

            {topCategories.length === 0 ? (
              <p className="text-[11px] text-[var(--gh-text-tertiary)] italic">
                Belum ada data pembelajaran.
              </p>
            ) : (
              <div className="space-y-2">
                {topCategories.slice(0, 4).map((cat) => (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-semibold text-[var(--gh-text-primary)] truncate max-w-[180px]">
                          {cat.name}
                        </span>
                        <span className="text-[10px] text-[var(--gh-text-tertiary)]">
                          ({cat.count} entri • {cat.hours} jam)
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-[var(--gh-text-primary)]">
                        {cat.percentage}%
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1.5 w-full bg-[var(--gh-bg)] rounded-full overflow-hidden border border-[var(--gh-border-subtle)]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${cat.percentage}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Deep Productivity Insights Grid */}
          <div className="pt-3 border-t border-[var(--gh-border)] space-y-2.5">
            <div className="flex items-center gap-1.5 font-semibold text-xs text-[var(--gh-text-primary)]">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Insight & Pola Belajar Anda</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Insight 1: Hari Paling Produktif */}
              <div className="p-3 bg-[var(--gh-bg)] rounded-md border border-[var(--gh-border)] space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--gh-text-tertiary)]">
                  Hari Paling Produktif
                </span>
                <div className="text-sm font-bold text-[var(--gh-accent)]">
                  {mostProductiveDay.dayName}
                </div>
                <p className="text-[10px] text-[var(--gh-text-secondary)]">
                  {mostProductiveDay.count} catatan ({mostProductiveDay.hours} jam total)
                </p>
              </div>

              {/* Insight 2: Fokus Kategori Utama */}
              <div className="p-3 bg-[var(--gh-bg)] rounded-md border border-[var(--gh-border)] space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--gh-text-tertiary)]">
                  Dominasi Bidang
                </span>
                <div className="text-sm font-bold text-emerald-500 truncate">
                  {topCategories[0]?.name.split(' ')[0] || 'Umum'}
                </div>
                <p className="text-[10px] text-[var(--gh-text-secondary)]">
                  {topCategories[0]?.percentage || 0}% dari seluruh sesi belajar
                </p>
              </div>

              {/* Insight 3: Total Entri Catatan */}
              <div className="p-3 bg-[var(--gh-bg)] rounded-md border border-[var(--gh-border)] space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--gh-text-tertiary)]">
                  Total Entri Catatan
                </span>
                <div className="text-sm font-bold text-indigo-400">
                  {logs.length} Catatan
                </div>
                <p className="text-[10px] text-[var(--gh-text-secondary)]">
                  Terdokumentasi dalam sistem
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
