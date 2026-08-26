'use client';

import React, { useState } from 'react';
import { Star, ArrowUpDown, Users, User as UserIcon, Plus, X, Check } from 'lucide-react';
import { FilterState, DateFilter, User } from '@/types';
import { getTopicTheme } from '@/lib/topicTheme';

interface FilterBarProps {
  filter: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  categories: string[];
  teamUsers: User[];
  currentUser: User | null;
  onOpenLogin: () => void;
  totalResultsCount: number;
  onAddCategory?: (newCategory: string) => void;
}

export function FilterBar({
  filter,
  onFilterChange,
  categories,
  currentUser,
  onOpenLogin,
  totalResultsCount,
  onAddCategory,
}: FilterBarProps) {
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');

  const dateOptions: { label: string; value: DateFilter; emoji: string }[] = [
    { label: 'Semua Waktu', value: 'all', emoji: '🗓️' },
    { label: 'Hari Ini', value: 'today', emoji: '⚡' },
    { label: '7 Hari Terakhir', value: 'this-week', emoji: '📅' },
    { label: 'Bulan Ini', value: 'this-month', emoji: '📆' },
  ];

  const handleMineClick = () => {
    if (!currentUser) {
      onOpenLogin();
      return;
    }
    onFilterChange({ userScope: 'mine' });
  };

  const handleSaveNewTopic = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTopicName.trim();
    if (!trimmed) return;
    if (onAddCategory) {
      onAddCategory(trimmed);
    }
    onFilterChange({ selectedCategory: trimmed });
    setNewTopicName('');
    setShowAddTopic(false);
  };

  return (
    <div className="mb-4 space-y-2.5 w-full">
      {/* Topik Labels bar with Emojis + Tambah Topik */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none w-full">
        <button
          onClick={() => onFilterChange({ selectedCategory: 'All' })}
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer ${
            filter.selectedCategory === 'All'
              ? 'bg-[var(--gh-accent)] text-white border-[var(--gh-accent)] shadow-xs'
              : 'bg-[var(--gh-surface)] text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] border-[var(--gh-border)]'
          }`}
        >
          <span>🌟</span>
          <span>Semua Topik ({totalResultsCount})</span>
        </button>

        {categories.map((cat) => {
          const isSelected = filter.selectedCategory === cat;
          const theme = getTopicTheme(cat);

          return (
            <button
              key={cat}
              onClick={() => onFilterChange({ selectedCategory: cat })}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap border transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'shadow-xs font-bold'
                  : 'hover:opacity-90'
              }`}
              style={{
                backgroundColor: isSelected ? theme.color : theme.badgeBg,
                color: isSelected ? '#ffffff' : theme.badgeText,
                borderColor: isSelected ? theme.color : theme.badgeBorder,
              }}
            >
              <span>{theme.emoji}</span>
              <span>{cat}</span>
            </button>
          );
        })}

        {/* Tombol Tambah Topik Baru */}
        {onAddCategory && (
          <button
            onClick={() => setShowAddTopic(true)}
            className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap border border-dashed border-[var(--gh-border)] bg-[var(--gh-surface)] text-[var(--gh-accent)] hover:bg-[var(--gh-badge-bg)] transition-colors shrink-0 cursor-pointer"
            title="Tambah Topik Kustom Baru"
          >
            <span>✨</span>
            <span>+ Tambah Topik</span>
          </button>
        )}
      </div>

      {/* Modal / Dialog Tambah Topik Kustom */}
      {showAddTopic && (
        <form
          onSubmit={handleSaveNewTopic}
          className="flex items-center gap-2 p-2.5 rounded-lg border border-[var(--gh-accent)] bg-[var(--gh-surface)] shadow-md animate-in fade-in duration-150 max-w-md"
        >
          <span className="text-xs font-bold text-[var(--gh-text-primary)] shrink-0 flex items-center gap-1">
            <span>🏷️</span> Topik Baru:
          </span>
          <input
            type="text"
            required
            autoFocus
            value={newTopicName}
            onChange={(e) => setNewTopicName(e.target.value)}
            placeholder="Contoh: AI & Machine Learning, Sejarah, Investasi..."
            className="flex-1 bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded px-2.5 py-1 text-xs text-[var(--gh-text-primary)] focus:outline-none focus:border-[var(--gh-accent)]"
          />
          <button
            type="submit"
            className="flex items-center gap-1 px-3 py-1 rounded bg-[#1f883d] hover:bg-[#1a7f37] text-white text-xs font-bold shrink-0 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Simpan</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setNewTopicName('');
              setShowAddTopic(false);
            }}
            className="p-1 text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Control row: Team Scope + Date + Favorites + Sort */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[var(--gh-border-subtle)] text-xs w-full">
        <div className="flex items-center gap-2 flex-wrap">
          {/* User Scope Filter (Feed Tim vs Catatan Saya) */}
          <div className="flex items-center bg-[var(--gh-surface)] rounded-md p-0.5 border border-[var(--gh-border)]">
            <button
              onClick={() => onFilterChange({ userScope: 'all' })}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                filter.userScope === 'all'
                  ? 'bg-[var(--gh-bg)] text-[var(--gh-text-primary)] font-bold shadow-xs'
                  : 'text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)]'
              }`}
            >
              <span>👥</span>
              <span>Feed Tim</span>
            </button>

            <button
              onClick={handleMineClick}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                filter.userScope === 'mine'
                  ? 'bg-[var(--gh-bg)] text-[var(--gh-text-primary)] font-bold shadow-xs'
                  : 'text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)]'
              }`}
            >
              <span>👤</span>
              <span>Catatan Saya</span>
            </button>
          </div>

          {/* Date Segmented Control */}
          <div className="flex items-center bg-[var(--gh-surface)] rounded-md p-0.5 border border-[var(--gh-border)]">
            {dateOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onFilterChange({ dateFilter: opt.value })}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                  filter.dateFilter === opt.value
                    ? 'bg-[var(--gh-bg)] text-[var(--gh-text-primary)] font-bold shadow-xs'
                    : 'text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)]'
                }`}
              >
                <span>{opt.emoji}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>

          {/* Favorites Star Filter */}
          <button
            onClick={() => onFilterChange({ onlyFavorites: !filter.onlyFavorites })}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md border text-xs transition-colors cursor-pointer ${
              filter.onlyFavorites
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-500 font-bold'
                : 'bg-[var(--gh-surface)] border-[var(--gh-border)] text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)]'
            }`}
          >
            <span>⭐</span>
            <span>Favorit</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1 bg-[var(--gh-surface)] border border-[var(--gh-border)] rounded-md px-2.5 py-1 text-[var(--gh-text-secondary)] text-xs">
            <ArrowUpDown className="w-3 h-3 text-[var(--gh-accent)]" />
            <select
              value={filter.sortBy}
              onChange={(e) =>
                onFilterChange({
                  sortBy: e.target.value as FilterState['sortBy'],
                })
              }
              className="bg-transparent border-none text-[var(--gh-text-primary)] font-medium focus:outline-none cursor-pointer text-xs"
            >
              <option value="date-desc" className="bg-[var(--gh-surface)]">🕒 Terbaru (Tanggal)</option>
              <option value="date-asc" className="bg-[var(--gh-surface)]">📅 Terlama (Tanggal)</option>
              <option value="duration-desc" className="bg-[var(--gh-surface)]">⏱️ Durasi Belajar</option>
              <option value="title-asc" className="bg-[var(--gh-surface)]">🔤 Judul (A-Z)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
