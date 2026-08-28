'use client';

import React from 'react';
import {
  Sparkles,
  Settings,
  Search,
  LayoutGrid,
  Rows3,
  X,
  LogIn,
  Menu,
} from 'lucide-react';
import { ViewMode, User } from '@/types';
import { ActiveTab } from './Sidebar';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  currentUser: User | null;
  onOpenNewLog?: () => void;
  onOpenSettings: () => void;
  onOpenUserModal: () => void;
  onOpenMobileSidebar?: () => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isSupabaseConnected?: boolean;
  totalLogsCount?: number;
  activeTab?: ActiveTab;
  userScope?: string;
}

export function Header({
  currentUser,
  onOpenSettings,
  onOpenUserModal,
  onOpenMobileSidebar,
  viewMode,
  onChangeViewMode,
  searchQuery,
  onSearchChange,
  activeTab = 'overview',
  userScope = 'all',
}: HeaderProps) {
  const currentMenuName = () => {
    if (activeTab === 'editor') return 'Catat Hasil Belajar';
    if (activeTab === 'quiz') return 'Kuis Review';
    if (activeTab === 'logs' && userScope === 'mine') return 'Catatan Saya';
    return 'Beranda';
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--gh-border)] bg-[var(--gh-surface)]/90 backdrop-blur-md transition-all">
      {/* Top Navbar */}
      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Mobile Menu Toggle & Brand (on mobile) */}
          <div className="flex items-center gap-2.5">
            {onOpenMobileSidebar && (
              <button
                type="button"
                onClick={onOpenMobileSidebar}
                className="md:hidden p-2 rounded-xl border border-[var(--gh-border)] bg-[var(--gh-bg)] hover:bg-[var(--gh-surface-hover)] text-[var(--gh-text-primary)] transition-colors cursor-pointer shadow-2xs"
                title="Buka Menu Sidebar"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}

            <div className="flex md:hidden items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-400 to-indigo-500 p-0.5 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
                <div className="w-full h-full bg-[var(--gh-surface)] rounded-[10px] flex items-center justify-center overflow-hidden p-0.5">
                  <img
                    src="./logo.png"
                    alt="Memora Logo"
                    className="w-full h-full object-contain rounded-[8px]"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm tracking-tight text-[var(--gh-text-primary)] leading-tight">
                  Memo<span className="text-emerald-500">ra</span>
                </span>
                <span className="text-[10px] text-[var(--gh-text-secondary)] font-bold leading-none">
                  {currentMenuName()}
                </span>
              </div>
            </div>

            {/* Desktop Current Menu Name */}
            <div className="hidden md:flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{currentMenuName()}</span>
              </span>
            </div>
          </div>

          {/* Right Tools: Search, Theme Toggle, Grid/Vertical Switcher, Settings, User Profile */}
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative w-36 sm:w-48 md:w-56">
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

            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* View Mode Grid / Vertikal Switcher */}
            <div className="flex items-center border border-[var(--gh-border)] rounded-full bg-[var(--gh-bg)] p-0.5 shadow-2xs">
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
                <span className="text-[11px] hidden sm:inline">Grid</span>
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
                <span className="text-[11px] hidden sm:inline">Vertikal</span>
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
          </div>
        </div>
      </div>
    </header>
  );
}
