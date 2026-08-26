'use client';

import React from 'react';
import {
  BookOpen,
  Plus,
  BarChart2,
  Settings2,
  Search,
  LayoutGrid,
  ListFilter,
  CheckCircle,
  Database,
  X,
} from 'lucide-react';
import { ViewMode } from '@/types';

interface HeaderProps {
  onOpenNewLog: () => void;
  onOpenSettings: () => void;
  showStats: boolean;
  onToggleStats: () => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isSupabaseConnected: boolean;
  totalLogsCount: number;
}

export function Header({
  onOpenNewLog,
  onOpenSettings,
  showStats,
  onToggleStats,
  viewMode,
  onChangeViewMode,
  searchQuery,
  onSearchChange,
  isSupabaseConnected,
  totalLogsCount,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Logo & Product Name */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200">
              <BookOpen className="w-4 h-4 text-zinc-100" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-sm text-zinc-100 tracking-tight">
                LearnLog
              </span>
              <span className="text-[11px] text-zinc-500 hidden sm:inline font-mono">
                / daily journal
              </span>
            </div>
          </div>

          {/* Search Input */}
          <div className="flex-1 max-w-sm hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari catatan, topik, atau tag..."
                className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg pl-8 pr-7 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Database indicator */}
            <button
              onClick={onOpenSettings}
              className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                isSupabaseConnected
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400 hover:bg-emerald-950/60'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-300'
              }`}
              title={isSupabaseConnected ? 'Database Supabase Aktif' : 'Mode Offline / LocalStorage'}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${isSupabaseConnected ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
              <span>{isSupabaseConnected ? 'Supabase' : 'Local'}</span>
            </button>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
              <button
                onClick={() => onChangeViewMode('grid')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-zinc-800 text-zinc-100 font-medium'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Grid"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onChangeViewMode('timeline')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  viewMode === 'timeline'
                    ? 'bg-zinc-800 text-zinc-100 font-medium'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Timeline"
              >
                <ListFilter className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Toggle Stats */}
            <button
              onClick={onToggleStats}
              className={`p-1.5 rounded-lg border transition-colors ${
                showStats
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
              title="Statistik Belajar"
            >
              <BarChart2 className="w-4 h-4" />
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors"
              title="Pengaturan"
            >
              <Settings2 className="w-4 h-4" />
            </button>

            {/* New Entry Button */}
            <button
              onClick={onOpenNewLog}
              className="flex items-center gap-1.5 bg-zinc-100 hover:bg-white text-zinc-950 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tulis Catatan</span>
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="pb-2.5 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari catatan atau tag..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-4 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
