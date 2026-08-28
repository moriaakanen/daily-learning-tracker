'use client';

import React from 'react';
import {
  Home,
  Users,
  User as UserIcon,
  PenSquare,
  Sparkles,
  Flame,
  Settings,
  LogIn,
  LogOut,
  X,
  Brain,
  HelpCircle,
} from 'lucide-react';
import { User, FilterState } from '@/types';

export type ActiveTab = 'overview' | 'logs' | 'editor' | 'quiz';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  filter: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  currentUser: User | null;
  logsCount: number;
  myLogsCount: number;
  currentStreak: number;
  onOpenNewEntry: () => void;
  onOpenSettings: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  filter,
  onFilterChange,
  currentUser,
  logsCount,
  myLogsCount,
  currentStreak,
  onOpenNewEntry,
  onOpenSettings,
  onOpenLogin,
  onLogout,
  isOpenMobile,
  onCloseMobile,
}: SidebarProps) {
  const isBerandaActive = activeTab === 'overview' || (activeTab === 'logs' && filter.userScope === 'all');
  const isCatatanSayaActive = activeTab === 'logs' && filter.userScope === 'mine';
  const isKuisActive = activeTab === 'quiz';
  const isCatatHasilBelajarActive = activeTab === 'editor';

  const handleSelectBeranda = () => {
    onFilterChange({ userScope: 'all' });
    setActiveTab('overview');
    onCloseMobile();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCatatanSaya = () => {
    if (!currentUser) {
      onOpenLogin();
      return;
    }
    onFilterChange({ userScope: 'mine' });
    setActiveTab('logs');
    onCloseMobile();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectKuis = () => {
    setActiveTab('quiz');
    onCloseMobile();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCatatHasilBelajar = () => {
    onOpenNewEntry();
    onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full justify-between p-4 sm:p-5 select-none">
      {/* Top: Brand Header */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleSelectBeranda}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-500 to-indigo-500 p-0.5 shadow-md shadow-emerald-500/20 flex items-center justify-center shrink-0 overflow-hidden">
              <div className="w-full h-full bg-[var(--gh-surface)] rounded-[14px] flex items-center justify-center overflow-hidden p-0.5">
                <img
                  src="./logo.png"
                  alt="Memora Logo"
                  className="w-full h-full object-contain rounded-[12px]"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-[var(--gh-text-primary)]">
                  Memo<span className="text-emerald-500">ra</span>
                </span>
              </div>
              <p className="text-[11px] text-[var(--gh-text-secondary)] font-bold tracking-wide">
                Memori &amp; Jurnal
              </p>
            </div>
          </div>

          {/* Close Mobile Button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-xl border border-[var(--gh-border)] text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] hover:bg-[var(--gh-surface-hover)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Button: Catat Hasil Belajar */}
        <button
          onClick={handleSelectCatatHasilBelajar}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 active:scale-98 transition-all cursor-pointer group"
        >
          <div className="p-1 rounded-lg bg-white/20 group-hover:rotate-12 transition-transform">
            <PenSquare className="w-3.5 h-3.5 text-white" />
          </div>
          <span>Catat Hasil Belajar</span>
          <span className="text-emerald-200">✨</span>
        </button>

        {/* Navigation Section */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-extrabold text-[var(--gh-text-tertiary)] uppercase tracking-wider px-3 mb-2">
            Menu Utama
          </div>

          {/* 1. Beranda (Catatan Teman & Catatan Saya) */}
          <button
            onClick={handleSelectBeranda}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              isBerandaActive
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs'
                : 'text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] hover:bg-[var(--gh-surface-hover)] border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-colors ${
                  isBerandaActive
                    ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                    : 'bg-[var(--gh-bg)] text-[var(--gh-text-secondary)] border border-[var(--gh-border)]'
                }`}
              >
                <Home className="w-4 h-4" />
              </div>
              <span className="text-xs">Beranda</span>
            </div>
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                isBerandaActive
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-[var(--gh-bg)] text-[var(--gh-text-secondary)] border-[var(--gh-border)]'
              }`}
            >
              {logsCount}
            </span>
          </button>

          {/* 2. Catatan Saya */}
          <button
            onClick={handleSelectCatatanSaya}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              isCatatanSayaActive
                ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 shadow-xs'
                : 'text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] hover:bg-[var(--gh-surface-hover)] border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-colors ${
                  isCatatanSayaActive
                    ? 'bg-purple-500 text-white shadow-sm shadow-purple-500/30'
                    : 'bg-[var(--gh-bg)] text-[var(--gh-text-secondary)] border border-[var(--gh-border)]'
                }`}
              >
                <UserIcon className="w-4 h-4" />
              </div>
              <span className="text-xs">Catatan Saya</span>
            </div>
            {currentUser && (
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                  isCatatanSayaActive
                    ? 'bg-purple-500 text-white border-purple-500'
                    : 'bg-[var(--gh-bg)] text-[var(--gh-text-secondary)] border-[var(--gh-border)]'
                }`}
              >
                {myLogsCount}
              </span>
            )}
          </button>

          {/* 3. Kuis Review & Flashcard */}
          <button
            onClick={handleSelectKuis}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              isKuisActive
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs'
                : 'text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] hover:bg-[var(--gh-surface-hover)] border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-colors ${
                  isKuisActive
                    ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-500/30'
                    : 'bg-[var(--gh-bg)] text-[var(--gh-text-secondary)] border border-[var(--gh-border)]'
                }`}
              >
                <Brain className="w-4 h-4" />
              </div>
              <span className="text-xs">Kuis Review</span>
            </div>
            <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Recall</span>
            </span>
          </button>
        </div>
      </div>

      {/* Middle/Bottom: Motivational Streak Widget */}
      <div className="space-y-4 pt-4">
        <div className="p-3.5 rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-bounce" />
              <span>Semangat Belajar</span>
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              {currentStreak} Hari
            </span>
          </div>
          <p className="text-[11px] text-[var(--gh-text-secondary)] leading-relaxed font-medium">
            &ldquo;Konsistensi 15 menit setiap hari melampaui 5 jam belajar sekali sebulan. 🌱&rdquo;
          </p>
        </div>

        {/* User Card & Settings */}
        <div className="pt-3 border-t border-[var(--gh-border)] space-y-2">
          {currentUser ? (
            <div className="flex items-center justify-between p-2 rounded-2xl bg-[var(--gh-bg)] border border-[var(--gh-border)] shadow-2xs">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-400/50 shrink-0"
                />
                <div className="overflow-hidden">
                  <div className="text-xs font-extrabold text-[var(--gh-text-primary)] truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-[var(--gh-text-tertiary)] truncate">
                    @{currentUser.username}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={onOpenSettings}
                  className="p-1.5 rounded-xl text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] hover:bg-[var(--gh-surface-hover)] transition-colors cursor-pointer"
                  title="Pengaturan"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-xl text-[var(--gh-text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Keluar Akun"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 font-bold text-xs transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk Akun Tim</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 fixed inset-y-0 left-0 z-40 bg-[var(--gh-surface)] border-r border-[var(--gh-border)] shadow-xs overflow-y-auto scrollbar-none">
        {content}
      </aside>

      {/* Mobile Drawer (Collapsible with backdrop) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop blur */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          />

          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[85vw] h-full bg-[var(--gh-surface)] border-r border-[var(--gh-border)] shadow-2xl z-10 animate-in slide-in-from-left duration-200 overflow-y-auto">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
