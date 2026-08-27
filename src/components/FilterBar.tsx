'use client';

import React, { useState } from 'react';
import { Star, ArrowUpDown, Users, User as UserIcon, Plus, X, Check } from 'lucide-react';
import { FilterState, DateFilter, User } from '@/types';
import { getTopicTheme } from '@/lib/topicTheme';

interface FilterBarProps {
  filter: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  categories: string[];
  defaultCategories?: string[];
  teamUsers: User[];
  currentUser: User | null;
  onOpenLogin: () => void;
  totalResultsCount: number;
  onAddCategory?: (newCategory: string) => void;
  onDeleteCategory?: (categoryName: string) => void;
}

export function FilterBar({
  filter,
  onFilterChange,
  categories,
  defaultCategories = [],
  currentUser,
  onOpenLogin,
  totalResultsCount,
  onAddCategory,
  onDeleteCategory,
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
      {/* Topik Labels bar with Emojis + Tambah Topik + Hapus Topik Tambahan */}
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
          const isDefault = defaultCategories.some(
            (d) => d.toLowerCase() === cat.toLowerCase()
          );

          return (
            <div key={cat} className="relative flex items-center shrink-0">
              <button
                onClick={() => onFilterChange({ selectedCategory: cat })}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap border transition-all flex items-center gap-1.5 cursor-pointer ${
                  !isDefault && onDeleteCategory ? 'pr-6' : ''
                } ${
                  isSelected ? 'shadow-xs font-bold' : 'hover:opacity-90'
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

              {/* Delete button only for custom added categories */}
              {!isDefault && onDeleteCategory && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Hapus kategori topik tambahan "${cat}"?`)) {
                      onDeleteCategory(cat);
                    }
                  }}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-black/20 text-current opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                  title={`Hapus kategori "${cat}" (Kategori Tambahan)`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
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
            placeholder="Misal: Psikologi, Sejarah, Desain UI..."
            className="flex-1 bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md px-2.5 py-1 text-xs text-[var(--gh-text-primary)] placeholder-[var(--gh-text-tertiary)] focus:outline-none focus:border-[var(--gh-accent)] font-medium"
          />
          <button
            type="submit"
            className="px-3 py-1 rounded-md bg-[var(--gh-accent)] text-white text-xs font-bold hover:bg-[var(--gh-accent-hover)] transition-colors cursor-pointer"
          >
            Simpan
          </button>
          <button
            type="button"
            onClick={() => setShowAddTopic(false)}
            className="p-1 rounded-md text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] hover:bg-[var(--gh-bg)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Filter Options Bar: Users + Date Filter + Favorit + Sort */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[var(--gh-border-subtle)]">
        {/* Left: User Scope & Date Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* User Scope (Semua vs Catatan Saya) */}
          <div className="flex items-center rounded-lg border border-[var(--gh-border)] bg-[var(--gh-surface)] p-0.5 text-xs shadow-2xs">
            <button
              onClick={() => onFilterChange({ userScope: 'all' })}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                filter.userScope === 'all'
                  ? 'bg-[var(--gh-accent)] text-white font-bold shadow-2xs'
                  : 'text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Semua</span>
            </button>
            <button
              onClick={handleMineClick}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                filter.userScope === 'mine'
                  ? 'bg-[var(--gh-accent)] text-white font-bold shadow-2xs'
                  : 'text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)]'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Catatan Saya</span>
            </button>
          </div>

          {/* Date Filter Pills */}
          <div className="flex items-center rounded-lg border border-[var(--gh-border)] bg-[var(--gh-surface)] p-0.5 text-xs shadow-2xs overflow-x-auto">
            {dateOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onFilterChange({ dateFilter: opt.value })}
                className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap cursor-pointer ${
                  filter.dateFilter === opt.value
                    ? 'bg-[var(--gh-accent)] text-white font-bold shadow-2xs'
                    : 'text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)]'
                }`}
              >
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Favorit Star + Urutan Sort */}
        <div className="flex items-center gap-2">
          {/* Filter Favorit Only */}
          <button
            onClick={() => onFilterChange({ onlyFavorites: !filter.onlyFavorites })}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
              filter.onlyFavorites
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-500 font-bold'
                : 'bg-[var(--gh-surface)] border-[var(--gh-border)] text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)]'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${filter.onlyFavorites ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>Favorit</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 bg-[var(--gh-surface)] border border-[var(--gh-border)] rounded-lg px-2 py-1 text-xs text-[var(--gh-text-secondary)] shadow-2xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-[var(--gh-text-tertiary)]" />
            <select
              value={filter.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as FilterState['sortBy'] })}
              className="bg-transparent border-none text-[var(--gh-text-primary)] text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="date-desc" className="bg-[var(--gh-surface)]">Terbaru</option>
              <option value="date-asc" className="bg-[var(--gh-surface)]">Terlama</option>
              <option value="duration-desc" className="bg-[var(--gh-surface)]">Durasi Terlama</option>
              <option value="duration-asc" className="bg-[var(--gh-surface)]">Durasi Singkat</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
