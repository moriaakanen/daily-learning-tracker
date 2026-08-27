'use client';

import React from 'react';
import {
  Sparkles,
  Plus,
  Settings,
  Search,
  LayoutGrid,
  Rows3,
  X,
  LogIn,
} from 'lucide-react';
import { ViewMode, User } from '@/types';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  currentUser: User | null;
  onOpenNewLog: () => void;
  onOpenSettings: () => void;
  onOpenUserModal: () => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isSupabaseConnected: boolean;
  totalLogsCount: number;
}

export function Header({
  currentUser,
  onOpenNewLog,
  onOpenSettings,
  onOpenUserModal,
  viewMode,
  onChangeViewMode,
  searchQuery,
  onSearchChange,
  isSupabaseConnected,
  totalLogsCount,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--gh-border)] bg-[var(--gh-surface)]/90 backdrop-blur-md transition-all">
      {/* Top Navbar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Cheerful Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-500 to-indigo-500 p-0.5 shadow-sm shadow-emerald-500/20 flex items-center justify-center animate-float-slow shrink-0">
              <div className="w-full h-full bg-[var(--gh-surface)] rounded-[14px] flex items-center justify-center text-xl">
                🌱
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-[var(--gh-text-primary)]">
                  Daily<span className="text-emerald-500">Learn</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="w-3 h-3 text-amber-400 animate-pulse-glow" />
                  <span>v2.0 Cheerful</span>
                </span>
              </div>
              <p className="text-[11px] text-[var(--gh-text-secondary)] font-medium hidden sm:block">
                Ruang belajar & journaling harian yang menyenangkan ✨
              </p>
            </div>
          </div>

          {/* Right Tools: Search, Theme Toggle, User Profile, Settings, New Entry */}
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative hidden md:block w-44 lg:w-52">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--gh-text-tertiary)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari materi seru..."
                className="w-full bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-full pl-8 pr-7 py-1.5 text-xs text-[var(--gh-text-primary)] placeholder-[var(--gh-text-tertiary)] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--gh-text-tertiary)] hover:text-[var(--gh-text-primary)] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Supabase Status Pill */}
            <button
              onClick={onOpenSettings}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-[var(--gh-border)] bg-[var(--gh-bg)] hover:bg-[var(--gh-surface-hover)] text-[var(--gh-text-secondary)] transition-all cursor-pointer shadow-2xs"
              title={isSupabaseConnected ? 'Database PostgreSQL Supabase Terhubung' : 'Penyimpanan Lokal'}
            >
              <div className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
              <span>{isSupabaseConnected ? '⚡ Supabase' : '💾 Local'}</span>
            </button>

            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* View Mode Grid / Vertikal Switcher */}
            <div className="hidden sm:flex items-center border border-[var(--gh-border)] rounded-full bg-[var(--gh-bg)] p-0.5 shadow-2xs">
              <button
                onClick={() => onChangeViewMode('grid')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-indigo-500 text-white shadow-xs'
                    : 'text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)]'
                }`}
                title="Tampilan Grid (Kotak)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden md:inline">Grid</span>
              </button>

              <button
                onClick={() => onChangeViewMode('vertical')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'vertical'
                    ? 'bg-indigo-500 text-white shadow-xs'
                    : 'text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)]'
                }`}
                title="Tampilan Vertikal (List)"
              >
                <Rows3 className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden md:inline">Vertikal</span>
              </button>
            </div>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-full border border-[var(--gh-border)] bg-[var(--gh-bg)] hover:bg-[var(--gh-surface-hover)] text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] transition-all cursor-pointer shadow-2xs"
              title="Pengaturan Database & Backup"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* User Profile / Login Button */}
            {currentUser ? (
              <button
                onClick={onOpenUserModal}
                className="flex items-center gap-2 p-1 sm:pr-3 rounded-full border border-[var(--gh-border)] bg-[var(--gh-bg)] hover:bg-[var(--gh-surface-hover)] text-xs text-[var(--gh-text-primary)] transition-all cursor-pointer shadow-2xs"
                title={`Masuk sebagai ${currentUser.name} (@${currentUser.username})`}
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover border-2 border-emerald-400"
                />
                <span className="hidden sm:inline font-bold text-xs truncate max-w-[80px]">
                  {currentUser.name.split(' ')[0]}
                </span>
              </button>
            ) : (
              <button
                onClick={onOpenUserModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-xs font-bold text-indigo-500 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk</span>
              </button>
            )}

            {/* Primary Action: New Entry (Cheerful Green/Indigo Button) */}
            <button
              onClick={onOpenNewLog}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md shadow-emerald-500/25 active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tulis Catatan ✨</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
