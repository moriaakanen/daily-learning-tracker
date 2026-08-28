'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, MessageCircle, X, RefreshCw, PenSquare } from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface MemoraMascotProps {
  currentStreak: number;
  totalLogsCount: number;
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenNewEntry: () => void;
}

const STUDY_TIPS = [
  'Active recall adalah cara paling efektif memperkuat memori jangka panjang! 🧠',
  'Konsistensi 15 menit setiap hari lebih bernilai daripada 5 jam sebulan sekali. 🌱',
  'Tulis apa yang kamu pahami dengan kata-katamu sendiri (Teknik Feynman). 💡',
  'Sudah review kuis hari ini? Coba uji ingatanmu sekarang! 🎯',
  'Setiap catatan kecil yang kamu tulis adalah investasi masa depanmu! ✨',
  'Tidur yang cukup membantu otak mengkonsolidasikan materi yang baru dipelajari. 💤',
  'Jaga streak belajarmu tetap menyala hari ini! 🔥',
  'Belajar itu seperti ikan berenang melawan arus; berhenti berarti mundur. 🐟',
];

export function MemoraMascot({
  currentStreak,
  totalLogsCount,
  onNavigateTab,
  onOpenNewEntry,
}: MemoraMascotProps) {
  const [tipIndex, setTipIndex] = useState(0);
  const [isWiggling, setIsWiggling] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Auto rotate tips every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % STUDY_TIPS.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const handleMascotClick = () => {
    setIsWiggling(true);
    setTipIndex((prev) => (prev + 1) % STUDY_TIPS.length);
    setTimeout(() => setIsWiggling(false), 800);
  };

  if (isMinimized) {
    return (
      <aside aria-label="Maskot Memora" className="fixed right-4 bottom-5 z-40 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={() => setIsMinimized(false)}
          className="group flex items-center gap-2.5 p-2 pr-3.5 rounded-full border border-emerald-500/30 bg-[var(--gh-surface)]/95 backdrop-blur-md shadow-xl hover:shadow-emerald-500/20 hover:scale-105 transition-all cursor-pointer select-none"
          title="Buka Teman Belajar Memora 🐟🌱"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-400 via-teal-500 to-indigo-500 p-0.5 shadow-md flex items-center justify-center shrink-0 animate-bounce">
            <div className="w-full h-full bg-[var(--gh-surface)] rounded-full flex items-center justify-center overflow-hidden p-0.5">
              <img
                src="./logo.png"
                alt="Memora"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <div className="text-left">
            <div className="text-xs font-extrabold text-[var(--gh-text-primary)] flex items-center gap-1">
              <span>Memora</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
              Teman Belajarmu ✨
            </div>
          </div>
        </button>
      </aside>
    );
  }

  return (
    <aside aria-label="Teman Belajar Memora" className="fixed right-4 bottom-5 z-40 max-w-[280px] w-full hidden sm:block animate-in fade-in slide-in-from-bottom-4 duration-300 select-none">
      <div className="relative rounded-3xl border border-emerald-500/30 bg-[var(--gh-surface)]/90 backdrop-blur-xl p-4 shadow-2xl shadow-emerald-500/10 transition-all hover:border-emerald-500/50 space-y-3">
        {/* Top bar controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              <span>Teman Belajar Memora</span>
            </span>
          </div>

          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded-full text-[var(--gh-text-tertiary)] hover:text-[var(--gh-text-primary)] hover:bg-[var(--gh-bg)] transition-colors cursor-pointer"
            title="Kecilkan widget"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Central Mascot Animated Showcase */}
        <div className="relative py-2 flex flex-col items-center justify-center overflow-hidden">
          {/* Animated Ambient Glow Under the Fish */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-32 h-20 bg-emerald-400/20 dark:bg-emerald-500/15 rounded-full blur-xl animate-pulse" />
          </div>

          {/* Floating Water Bubble Particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <span className="absolute left-6 top-8 w-2 h-2 rounded-full bg-teal-400/60 animate-ping duration-1000" />
            <span className="absolute right-8 top-4 w-1.5 h-1.5 rounded-full bg-emerald-400/50 animate-pulse duration-700" />
            <span className="absolute right-12 bottom-6 w-2.5 h-2.5 rounded-full bg-indigo-400/40 animate-ping duration-1200" />
          </div>

          {/* Clickable Animated Remora Fish & Sprout Mascot */}
          <div
            onClick={handleMascotClick}
            className={`relative z-10 cursor-pointer group transition-transform ${
              isWiggling ? 'animate-bounce scale-110' : 'hover:scale-105'
            }`}
            title="Klik Memora untuk tips belajar baru! 🐟✨"
          >
            {/* Swimming & Floating Wrapper with smooth CSS animation */}
            <div className="w-36 h-28 relative flex items-center justify-center animate-remora-swim">
              <img
                src="./logo.png"
                alt="Memora Fish Mascot"
                className="w-full h-full object-contain filter drop-shadow-md group-hover:brightness-105 transition-all"
              />

              {/* Little interaction heart/sparkle on click */}
              {isWiggling && (
                <div className="absolute -top-2 right-4 text-sm animate-ping">
                  💚
                </div>
              )}
            </div>
          </div>

          <div className="text-[10px] text-[var(--gh-text-tertiary)] font-semibold mt-1">
            Klik ikan untuk tips baru 👆
          </div>
        </div>

        {/* Dynamic Speech Bubble */}
        <div className="relative p-3 rounded-2xl bg-[var(--gh-bg)] border border-[var(--gh-border)] shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              <span>Pesan Hari Ini:</span>
            </span>
            <button
              onClick={handleMascotClick}
              className="hover:rotate-180 transition-transform duration-300 text-[var(--gh-text-tertiary)] hover:text-[var(--gh-text-primary)]"
              title="Ganti tips"
            >
              <RefreshCw className="w-2.5 h-2.5" />
            </button>
          </div>
          <p className="text-[11px] text-[var(--gh-text-primary)] font-medium leading-relaxed italic animate-in fade-in duration-300">
            &ldquo;{STUDY_TIPS[tipIndex]}&rdquo;
          </p>
        </div>

        {/* Action Buttons: Quick Quiz & Quick Note */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => onNavigateTab('quiz')}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-[10px] shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Brain className="w-3 h-3" />
            <span>Kuis Review</span>
          </button>
          <button
            onClick={onOpenNewEntry}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-[10px] shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <PenSquare className="w-3 h-3" />
            <span>Catat Jurnal</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
