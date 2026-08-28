'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Brain,
  Flame,
  Users,
  PenSquare,
  ArrowRight,
  CheckCircle2,
  Lock,
  LogIn,
  Zap,
  Star,
  Layers,
  Compass,
  Smile,
  ShieldCheck,
} from 'lucide-react';
import { User } from '@/types';
import { ThemeToggle } from './ThemeToggle';

interface GuestLandingPageProps {
  teamUsers: User[];
  onSelectUserLogin: (user: User) => void;
  onOpenCustomLogin: () => void;
  onExploreAsGuest: () => void;
  totalLogsCount: number;
}

export function GuestLandingPage({
  teamUsers,
  onSelectUserLogin,
  onOpenCustomLogin,
  onExploreAsGuest,
  totalLogsCount,
}: GuestLandingPageProps) {
  const [selectedQuickUser, setSelectedQuickUser] = useState<User | null>(null);

  const handleQuickLogin = (user: User) => {
    onSelectUserLogin(user);
  };

  return (
    <div className="min-h-screen bg-[var(--gh-bg)] text-[var(--gh-text-primary)] flex flex-col justify-between selection:bg-emerald-500/20 selection:text-emerald-500">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[var(--gh-surface)]/80 border-b border-[var(--gh-border)] px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-500 to-indigo-500 p-0.5 shadow-md shadow-emerald-500/20 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-[var(--gh-surface)] rounded-[14px] flex items-center justify-center text-xl">
              🌱
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-[var(--gh-text-primary)]">
                Daily<span className="text-emerald-500">Learn</span>
              </span>
              <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                <span>v2.0</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Navigation & CTAs */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onExploreAsGuest}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] hover:bg-[var(--gh-surface-hover)] rounded-full transition-colors cursor-pointer"
          >
            <span>Eksplor Mode Baca</span>
          </button>

          <ThemeToggle />

          <button
            type="button"
            onClick={onOpenCustomLogin}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs shadow-md shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Masuk Akun</span>
          </button>
        </div>
      </header>

      {/* 2. HERO SECTION (Inspired by Medium's bold impact, elevated with vibrant colors) */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-[var(--gh-border)] bg-gradient-to-b from-indigo-500/5 via-emerald-500/5 to-transparent">
        {/* Glow ambient background circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 sm:w-[600px] h-96 sm:h-[600px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          {/* Friendly pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--gh-surface)] border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Jurnal Belajar, Kuis Ingatan, & Kolaborasi Tim</span>
            <span className="text-amber-400">✨</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-[var(--gh-text-primary)] tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Tempat Belajar, Menemukan Ide, &amp; Tumbuh{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600">
              1% Lebih Baik Setiap Hari.
            </span> 🌱
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-[var(--gh-text-secondary)] font-medium max-w-2xl mx-auto leading-relaxed">
            Dokumentasikan catatan materi belajarmu, uji pemahaman dengan <strong>Kuis Active Recall otomatis</strong>, dan bangun kebiasaan belajar konsisten bersama rekan tim.
          </p>

          {/* Dual Main CTA Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={onOpenCustomLogin}
              className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer group"
            >
              <span>Mulai Belajar Sekarang</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={onExploreAsGuest}
              className="flex items-center gap-2 px-6 py-3.5 rounded-full border-2 border-[var(--gh-border)] bg-[var(--gh-surface)] hover:bg-[var(--gh-surface-hover)] text-[var(--gh-text-primary)] font-bold text-sm shadow-xs transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>Jelajahi Sebagai Tamu ({totalLogsCount} Catatan)</span>
            </button>
          </div>

          {/* Social Proof Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-[var(--gh-text-secondary)] font-bold">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>100% Gratis &amp; Offline Ready</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-indigo-500" />
              <span>Ekstraksi Kuis Cerdas Otomatis</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Pelacak Streak Harian</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. QUICK SIGN-IN (Medium-Style One-Click Profile Cards) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            <span>Pilih Akun Anggota Tim</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--gh-text-primary)]">
            Masuk Cepat dalam 1 Klik ✨
          </h2>
          <p className="text-xs sm:text-sm text-[var(--gh-text-secondary)] font-medium max-w-lg mx-auto">
            Pilih salah satu profil tim di bawah untuk langsung membuka workspace dan mulai mencatat:
          </p>
        </div>

        {/* User Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 pt-2">
          {teamUsers.map((u) => (
            <div
              key={u.id}
              onClick={() => handleQuickLogin(u)}
              className="p-4 rounded-2xl border-2 border-[var(--gh-border)] bg-[var(--gh-surface)] hover:border-emerald-500 hover:bg-emerald-500/5 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-200 cursor-pointer flex flex-col items-center text-center space-y-3 group"
            >
              <div className="relative">
                <img
                  src={u.avatar}
                  alt={u.name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-emerald-400/50 group-hover:scale-105 transition-transform"
                />
                <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[var(--gh-surface)]" />
              </div>

              <div className="space-y-0.5 w-full">
                <div className="text-xs font-extrabold text-[var(--gh-text-primary)] truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {u.name}
                </div>
                <div className="text-[10px] text-[var(--gh-text-tertiary)] truncate">
                  {u.role || `@${u.username}`}
                </div>
              </div>

              <button
                type="button"
                className="w-full py-1.5 px-2 rounded-xl bg-[var(--gh-bg)] group-hover:bg-emerald-500 group-hover:text-white border border-[var(--gh-border)] group-hover:border-emerald-500 text-[11px] font-bold text-[var(--gh-text-secondary)] transition-all flex items-center justify-center gap-1"
              >
                <span>Masuk</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          ))}
        </div>

        {/* Custom Login Alternate */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onOpenCustomLogin}
            className="text-xs font-bold text-indigo-500 hover:text-indigo-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Punya username kustom lain? Masuk dengan form password ➔</span>
          </button>
        </div>
      </section>

      {/* 4. VIBRANT BENTO FEATURES SECTION */}
      <section className="border-t border-[var(--gh-border)] bg-[var(--gh-surface)] py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Fitur Unggulan</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--gh-text-primary)]">
              Dirancang untuk Produktivitas &amp; Keceriaan Belajar
            </h2>
            <p className="text-xs sm:text-sm text-[var(--gh-text-secondary)] font-medium max-w-xl mx-auto">
              Segala yang Anda butuhkan untuk mencatat, mengingat, dan merayakan kemajuan belajar setiap hari.
            </p>
          </div>

          {/* 4 Bento Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Bento Card 1: Active Recall Quiz */}
            <div className="p-6 sm:p-7 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent space-y-4 shadow-xs hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center text-2xl shadow-inner">
                🎯
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-extrabold text-[var(--gh-text-primary)] flex items-center gap-2">
                  <span>Kuis Review &amp; Flashcard Otomatis</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    Smart Recall
                  </span>
                </h3>
                <p className="text-xs sm:text-sm text-[var(--gh-text-secondary)] leading-relaxed font-medium">
                  Sistem NLP kami mengekstrak definisi, kegunaan, dan poin kunci dari catatanmu untuk membuat kuis pilihan ganda dan flashcard 3D instan!
                </p>
              </div>
            </div>

            {/* Bento Card 2: Visual Rich Editor */}
            <div className="p-6 sm:p-7 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent space-y-4 shadow-xs hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-2xl shadow-inner">
                📝
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-extrabold text-[var(--gh-text-primary)]">
                  Editor Visual &amp; Format Cantik
                </h3>
                <p className="text-xs sm:text-sm text-[var(--gh-text-secondary)] leading-relaxed font-medium">
                  Tulis dengan format Markdown, sematkan potongan kode sintaksis, upload gambar otomatis terkompresi, dan pilih tema warna kartu sesukamu.
                </p>
              </div>
            </div>

            {/* Bento Card 3: Streak Tracker & Habit Builder */}
            <div className="p-6 sm:p-7 rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-transparent space-y-4 shadow-xs hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-500 flex items-center justify-center text-2xl shadow-inner">
                🔥
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-extrabold text-[var(--gh-text-primary)]">
                  Pelacak Streak &amp; Kalender Aktivitas
                </h3>
                <p className="text-xs sm:text-sm text-[var(--gh-text-secondary)] leading-relaxed font-medium">
                  Pantau konsistensi belajarmu hari demi hari melalui kalender interaktif dan metrik waktu belajar yang membangkitkan semangat.
                </p>
              </div>
            </div>

            {/* Bento Card 4: Team Feed & Cloud Supabase */}
            <div className="p-6 sm:p-7 rounded-3xl border border-sky-500/30 bg-gradient-to-br from-sky-500/10 via-blue-500/5 to-transparent space-y-4 shadow-xs hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-500 flex items-center justify-center text-2xl shadow-inner">
                👥
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-extrabold text-[var(--gh-text-primary)]">
                  Feed Kolaborasi &amp; Cloud Sync
                </h3>
                <p className="text-xs sm:text-sm text-[var(--gh-text-secondary)] leading-relaxed font-medium">
                  Baca catatan hasil belajar rekan tim, bertukar ide di kolom diskusi, dan sinkronkan data secara aman dengan database Supabase Cloud.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INSPIRATIONAL BOTTOM BANNER */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center space-y-5">
        <div className="p-6 sm:p-10 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-indigo-500/15 space-y-4 shadow-sm">
          <div className="text-3xl animate-bounce">🌱</div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[var(--gh-text-primary)]">
            &ldquo;Konsistensi 15 menit setiap hari melampaui 5 jam belajar sekali sebulan.&rdquo;
          </h3>
          <p className="text-xs sm:text-sm text-[var(--gh-text-secondary)] max-w-md mx-auto">
            Mulailah mencatat hal baru yang kamu pelajari hari ini dan saksikan perkembanganmu berkembang pesat!
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={onOpenCustomLogin}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
            >
              Masuk &amp; Mulai Jurnal Belajarmu ✨
            </button>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="border-t border-[var(--gh-border)] bg-[var(--gh-surface)] py-6 px-4 sm:px-8 text-center text-xs text-[var(--gh-text-tertiary)] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span>🌱 <strong>DailyLearn</strong> — Daily Learning Tracker &amp; Active Recall</span>
        </div>
        <div className="flex items-center gap-3 font-semibold">
          <button
            type="button"
            onClick={onExploreAsGuest}
            className="hover:text-[var(--gh-text-primary)] transition-colors cursor-pointer"
          >
            Mode Baca
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={onOpenCustomLogin}
            className="hover:text-[var(--gh-text-primary)] transition-colors cursor-pointer"
          >
            Login Tim
          </button>
        </div>
      </footer>
    </div>
  );
}
