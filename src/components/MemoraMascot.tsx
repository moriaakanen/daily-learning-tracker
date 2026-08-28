'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Brain, PenSquare, RefreshCw, X, MessageCircle } from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface MemoraMascotProps {
  currentStreak: number;
  totalLogsCount: number;
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenNewEntry: () => void;
}

const STUDY_TIPS = [
  { text: 'Active recall adalah cara terbaik memperkuat ingatan jangka panjang! 🧠', tag: '💡 Tips Belajar' },
  { text: 'Konsistensi 15 menit setiap hari lebih bernilai daripada 5 jam sebulan sekali. 🌱', tag: '🔥 Kebiasaan' },
  { text: 'Tulis apa yang kamu pahami dengan kata-katamu sendiri (Teknik Feynman). ✨', tag: '📝 Pemahaman' },
  { text: 'Sudah review materi hari ini? Coba uji ingatanmu di Kuis Review! 🎯', tag: '🎯 Tantangan' },
  { text: 'Tidur yang cukup membantu otak mengkonsolidasikan memori baru. 💤', tag: '🧠 Brain Science' },
  { text: 'Setiap catatan kecil adalah bibit ilmu yang terus bertunas. 🌿', tag: '🌱 Mindset' },
  { text: 'Belajar itu seperti berenang; bergerak maju membuat kita makin kuat! 🐟', tag: '🌊 Semangat' },
];

export function MemoraMascot({
  currentStreak,
  totalLogsCount,
  onNavigateTab,
  onOpenNewEntry,
}: MemoraMascotProps) {
  const [tipIndex, setTipIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showThoughtBubble, setShowThoughtBubble] = useState(true);
  const [burstItems, setBurstItems] = useState<{ id: number; emoji: string; x: number; y: number }[]>([]);
  const [transparentSrc, setTransparentSrc] = useState<string>('./logo.png');

  // Convert white background in logo image to 100% transparent on client-side canvas
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const img = new Image();
    img.src = './logo.png';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Turn near-white background transparent
          if (r > 240 && g > 240 && b > 240) {
            data[i + 3] = 0;
          }
        }
        ctx.putImageData(imgData, 0, 0);
        setTransparentSrc(canvas.toDataURL('image/png'));
      } catch {
        // Fallback to original
        setTransparentSrc('./logo.png');
      }
    };
  }, []);

  // Auto-rotate study tips every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % STUDY_TIPS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Click interaction on the Memora fish
  const handleFishClick = () => {
    setIsSpinning(true);
    setTipIndex((prev) => (prev + 1) % STUDY_TIPS.length);
    setShowThoughtBubble(true);

    // Spawn cheerful celebration burst particles
    const emojis = ['✨', '💚', '🫧', '🌱', '🌟', '🧠'];
    const newBursts = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + i,
      emoji: emojis[i % emojis.length],
      x: (Math.random() - 0.5) * 60,
      y: -20 - Math.random() * 40,
    }));
    setBurstItems(newBursts);

    setTimeout(() => setIsSpinning(false), 700);
    setTimeout(() => setBurstItems([]), 1200);
  };

  const currentTip = STUDY_TIPS[tipIndex];

  return (
    <aside
      aria-label="Maskot Memora Bebas Berenang"
      className="fixed right-3 sm:right-6 bottom-4 sm:bottom-6 z-40 flex flex-col items-end pointer-events-none select-none"
    >
      {/* 1. FLOATING THOUGHT / SPEECH BUBBLE (Above the fish) */}
      {showThoughtBubble && (
        <div className="relative pointer-events-auto mb-2 max-w-[260px] sm:max-w-[290px] animate-thought-float transition-all duration-300">
          <div className="relative rounded-3xl border border-emerald-400/40 bg-[var(--gh-surface)]/95 backdrop-blur-md p-4 shadow-xl shadow-emerald-500/10 text-xs space-y-2 group hover:border-emerald-500/60">
            {/* Header with tag & close */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                <span>{currentTip.tag}</span>
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleFishClick}
                  className="p-1 rounded-full text-[var(--gh-text-tertiary)] hover:text-emerald-500 transition-colors cursor-pointer"
                  title="Ganti tips belajar"
                >
                  <RefreshCw className="w-3 h-3 hover:rotate-180 transition-transform duration-300" />
                </button>
                <button
                  onClick={() => setShowThoughtBubble(false)}
                  className="p-1 rounded-full text-[var(--gh-text-tertiary)] hover:text-rose-500 transition-colors cursor-pointer"
                  title="Tutup balon pesan"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Dynamic Tip / Motivation Quote */}
            <p className="text-[11px] text-[var(--gh-text-primary)] font-semibold leading-relaxed italic animate-in fade-in duration-300">
              &ldquo;{currentTip.text}&rdquo;
            </p>

            {/* Interactive Quick Navigation Action Buttons */}
            <div className="flex items-center gap-2 pt-1 border-t border-[var(--gh-border-subtle)]">
              <button
                onClick={() => onNavigateTab('quiz')}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-[10px] shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Brain className="w-3 h-3" />
                <span>Kuis Review</span>
              </button>
              <button
                onClick={onOpenNewEntry}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-[10px] shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <PenSquare className="w-3 h-3" />
                <span>Catat Baru</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. ASCENDING FLOATING WATER BUBBLES STREAM (Connecting Thought Bubble to Fish) */}
      <div className="relative w-28 h-12 flex flex-col items-center justify-between pointer-events-none pr-8">
        {/* Large Bubble (near thought balloon) */}
        <div className="w-3.5 h-3.5 rounded-full border border-teal-400/60 bg-teal-400/25 backdrop-blur-xs shadow-xs animate-bubble-drift-1 self-end mr-6" />
        
        {/* Medium Bubble */}
        <div className="w-2.5 h-2.5 rounded-full border border-emerald-400/70 bg-emerald-400/30 backdrop-blur-xs shadow-xs animate-bubble-drift-2 self-end mr-10" />

        {/* Small Bubble (near fish mouth) */}
        <div className="w-1.5 h-1.5 rounded-full border border-teal-300/80 bg-teal-300/40 animate-ping duration-1000 self-end mr-12" />
      </div>

      {/* 3. FREE-FLOATING MEMORA FISH WITH SPROUT MASCOT (No Border, No Card Container) */}
      <div className="relative pointer-events-auto pr-2">
        {/* Burst particles on click */}
        {burstItems.map((item) => (
          <span
            key={item.id}
            className="absolute text-sm pointer-events-none animate-in fade-in zoom-in-50 duration-500"
            style={{
              transform: `translate(${item.x}px, ${item.y}px)`,
            }}
          >
            {item.emoji}
          </span>
        ))}

        {/* Soft Bioluminescent Glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-28 h-16 bg-emerald-400/25 dark:bg-emerald-400/20 rounded-full blur-xl animate-pulse" />
        </div>

        {/* Clickable Fish Mascot */}
        <div
          onClick={handleFishClick}
          className={`cursor-pointer group select-none transition-transform duration-300 ${
            isSpinning ? 'animate-spin-joyful' : 'animate-remora-free-swim hover:scale-110 active:scale-95'
          }`}
          title="Halo! Aku Memora 🐟🌱 Klik aku untuk tips & motivasi belajar!"
        >
          <div className="w-28 h-24 sm:w-32 sm:h-28 relative flex items-center justify-center">
            <img
              src={transparentSrc}
              alt="Memora Fish Mascot"
              className="w-full h-full object-contain filter drop-shadow-lg group-hover:brightness-110 transition-all"
            />
          </div>
        </div>

        {/* Floating reopen speech button if user closed the balloon */}
        {!showThoughtBubble && (
          <button
            onClick={() => setShowThoughtBubble(true)}
            className="absolute -top-3 right-2 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[10px] shadow-lg shadow-emerald-500/30 animate-bounce cursor-pointer pointer-events-auto"
            title="Buka pesan Memora"
          >
            <MessageCircle className="w-3 h-3" />
            <span>Pesan 💬</span>
          </button>
        )}
      </div>
    </aside>
  );
}
