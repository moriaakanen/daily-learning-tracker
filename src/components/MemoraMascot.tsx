'use client';

import React, { useState, useEffect } from 'react';

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
      {/* Free-Floating Large Memora Fish Mascot */}
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
          title="Memora 🐟🌱"
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
