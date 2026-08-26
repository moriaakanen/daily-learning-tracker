'use client';

import React from 'react';
import {
  BookMarked,
  Plus,
  Settings,
  Search,
  LayoutGrid,
  GitCommit,
  X,
  LogIn,
  LogOut,
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
    <header className="border-b border-[var(--gh-border)] bg-[var(--gh-surface)]">
      {/* Top Navbar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-3">
          {/* Left: GitHub Repo Header Breadcrumb */}
          <div className="flex items-center gap-2">
            <div className="text-[var(--gh-text-secondary)]">
              <BookMarked className="w-4 h-4 text-[var(--gh-text-secondary)]" />
            </div>
            <div className="flex items-center gap-1.5 text-sm font-normal text-[var(--gh-text-primary)]">
              <a
                href="https://github.com/moriaakanen"
                target="_blank"
                rel="noreferrer"
                className="text-[var(--gh-accent)] hover:underline"
              >
                moriaakanen
              </a>
              <span className="text-[var(--gh-text-secondary)]">/</span>
              <a
                href="https://github.com/moriaakanen/daily-learning-tracker"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-[var(--gh-accent)] hover:underline"
              >
                daily-learning-tracker
              </a>
              <span className="ml-1 text-[11px] font-medium text-[var(--gh-text-secondary)] border border-[var(--gh-border)] px-1.5 py-0.2 rounded-full">
                Public
              </span>
            </div>
          </div>

          {/* Right Tools: Search, Theme Toggle, User Profile, Settings, New Entry */}
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative hidden md:block w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--gh-text-tertiary)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Type / to search..."
                className="w-full bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md pl-7 pr-6 py-1 text-xs text-[var(--gh-text-primary)] placeholder-[var(--gh-text-tertiary)] focus:outline-none focus:border-[var(--gh-accent)] focus:ring-1 focus:ring-[var(--gh-accent)] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--gh-text-tertiary)] hover:text-[var(--gh-text-primary)]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Supabase Status Pill */}
            <button
              onClick={onOpenSettings}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-[var(--gh-border)] bg-[var(--gh-bg)] hover:bg-[var(--gh-surface-hover)] text-[var(--gh-text-secondary)] transition-colors"
              title={isSupabaseConnected ? 'Database PostgreSQL Supabase Terhubung' : 'Penyimpanan Lokal'}
            >
              <div className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
              <span>{isSupabaseConnected ? 'Supabase' : 'Local'}</span>
            </button>

            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* View Mode Grid/Timeline */}
            <div className="hidden sm:flex items-center border border-[var(--gh-border)] rounded-md bg-[var(--gh-bg)] p-0.5">
              <button
                onClick={() => onChangeViewMode('grid')}
                className={`p-1 rounded text-xs transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[var(--gh-surface-hover)] text-[var(--gh-text-primary)] font-medium shadow-xs'
                    : 'text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)]'
                }`}
                title="Tampilan Grid"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onChangeViewMode('timeline')}
                className={`p-1 rounded text-xs transition-colors ${
                  viewMode === 'timeline'
                    ? 'bg-[var(--gh-surface-hover)] text-[var(--gh-text-primary)] font-medium shadow-xs'
                    : 'text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)]'
                }`}
                title="Tampilan Timeline Commit"
              >
                <GitCommit className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-md border border-[var(--gh-border)] bg-[var(--gh-surface)] hover:bg-[var(--gh-surface-hover)] text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] transition-colors"
              title="Pengaturan Database & Backup"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* User Profile / Login Button */}
            {currentUser ? (
              <button
                onClick={onOpenUserModal}
                className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-md border border-[var(--gh-border)] bg-[var(--gh-bg)] hover:bg-[var(--gh-surface-hover)] text-xs text-[var(--gh-text-primary)] transition-colors"
                title={`Masuk sebagai ${currentUser.name} (@${currentUser.username}). Klik untuk ganti akun/keluar.`}
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-5 h-5 rounded-full object-cover border border-[var(--gh-border)]"
                />
                <span className="hidden sm:inline font-semibold text-xs truncate max-w-[85px]">
                  {currentUser.name.split(' ')[0]}
                </span>
              </button>
            ) : (
              <button
                onClick={onOpenUserModal}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[var(--gh-border)] bg-[var(--gh-bg)] hover:bg-[var(--gh-surface-hover)] text-xs font-semibold text-[var(--gh-accent)] hover:underline transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk (Sign in)</span>
              </button>
            )}

            {/* Primary Action: New Entry (GitHub Green Button) */}
            <button
              onClick={onOpenNewLog}
              className="flex items-center gap-1.5 bg-[#1f883d] hover:bg-[#1a7f37] text-white px-3 py-1 rounded-md text-xs font-semibold shadow-sm transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Entry</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
