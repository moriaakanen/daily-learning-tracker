'use client';

import React, { useState, useEffect } from 'react';

const BUBBLE_CONFIGS = [
  { size: 12, left: '66%', delay: '0s', duration: '4.6s' },
  { size: 20, left: '72%', delay: '1.1s', duration: '5.2s' },
  { size: 10, left: '62%', delay: '2.3s', duration: '3.9s' },
  { size: 24, left: '76%', delay: '3.2s', duration: '5.5s' },
  { size: 14, left: '68%', delay: '0.7s', duration: '4.2s' },
  { size: 18, left: '74%', delay: '2.0s', duration: '4.9s' },
  { size: 11, left: '64%', delay: '3.8s', duration: '4.1s' },
];

export function MemoraMascot() {
  const [isSpinning, setIsSpinning] = useState(false);

  // Click interaction on the Memora fish (playful 360 spin)
  const handleFishClick = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 700);
  };

  return (
    <aside
      aria-label="Maskot Memora Bebas Berenang"
      className="fixed right-4 sm:right-8 md:right-10 bottom-6 sm:bottom-8 z-30 pointer-events-none select-none"
    >
      {/* 1. ASCENDING TRANSLUCENT WATER BUBBLES STREAM (Floating to the Top) */}
      <div className="absolute inset-x-0 bottom-24 h-[460px] pointer-events-none overflow-visible">
        {BUBBLE_CONFIGS.map((b, idx) => (
          <div
            key={idx}
            style={{
              width: `${b.size}px`,
              height: `${b.size}px`,
              left: b.left,
              bottom: '10px',
              animation: `bubbleAscendLong ${b.duration} cubic-bezier(0.4, 0, 0.2, 1) infinite`,
              animationDelay: b.delay,
            }}
            className="absolute rounded-full border border-teal-300/60 dark:border-teal-300/40 bg-gradient-to-tr from-teal-400/20 via-emerald-300/25 to-white/40 shadow-xs backdrop-blur-2xs"
          >
            {/* Specular light highlight on top-left of each bubble */}
            <div className="w-[30%] h-[30%] rounded-full bg-white/80 absolute top-[18%] left-[20%]" />
          </div>
        ))}
      </div>

      {/* 2. FREE-FLOATING LARGE MEMORA FISH MASCOT */}
      <div className="relative pointer-events-auto">
        {/* Soft Bioluminescent Aquatic Glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-32 bg-emerald-400/25 dark:bg-emerald-400/20 rounded-full blur-2xl animate-pulse" />
        </div>

        {/* Clickable Large Fish Mascot with free-swimming animation */}
        <div
          onClick={handleFishClick}
          className={`cursor-pointer group select-none transition-transform duration-300 ${
            isSpinning ? 'animate-spin-joyful' : 'animate-remora-free-swim hover:scale-105 active:scale-95'
          }`}
          title="Memora 🐟🌱 (Klik untuk aksi ceria!)"
        >
          <div className="w-44 h-36 sm:w-56 sm:h-44 md:w-64 md:h-52 relative flex items-center justify-center">
            <img
              src="./logo.png"
              alt="Memora Mascot"
              className="w-full h-full object-contain filter drop-shadow-xl group-hover:brightness-110 transition-all"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
