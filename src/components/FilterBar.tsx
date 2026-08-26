'use client';

import React from 'react';
import { Star, X, Tag, ArrowUpDown, Users, User as UserIcon } from 'lucide-react';
import { FilterState, DateFilter, UserScopeFilter, User } from '@/types';

interface FilterBarProps {
  filter: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  categories: string[];
  allTags: string[];
  teamUsers: User[];
  currentUser: User | null;
  onOpenLogin: () => void;
  totalResultsCount: number;
}

export function FilterBar({
  filter,
  onFilterChange,
  categories,
  allTags,
  teamUsers,
  currentUser,
  onOpenLogin,
  totalResultsCount,
}: FilterBarProps) {
  const dateOptions: { label: string; value: DateFilter }[] = [
    { label: 'Semua Waktu', value: 'all' },
    { label: 'Hari Ini', value: 'today' },
    { label: '7 Hari Terakhir', value: 'this-week' },
    { label: 'Bulan Ini', value: 'this-month' },
  ];

  const handleMineClick = () => {
    if (!currentUser) {
      onOpenLogin();
      return;
    }
    onFilterChange({ userScope: 'mine' });
  };

  return (
    <div className="mb-4 space-y-2.5">
      {/* Category Labels bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => onFilterChange({ selectedCategory: 'All' })}
          className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
            filter.selectedCategory === 'All'
              ? 'bg-[var(--gh-badge-bg)] text-[var(--gh-text-primary)] border-[var(--gh-border)] font-semibold'
              : 'bg-transparent text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] border-transparent hover:border-[var(--gh-border)]'
          }`}
        >
          Semua Kategori ({totalResultsCount})
        </button>

        {categories.map((cat) => {
          const isSelected = filter.selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onFilterChange({ selectedCategory: cat })}
              className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${
                isSelected
                  ? 'bg-[var(--gh-badge-bg)] text-[var(--gh-text-primary)] border-[var(--gh-border)] font-semibold'
                  : 'bg-transparent text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] border-transparent hover:border-[var(--gh-border)]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Control row: Team Scope + Date + Favorites + Tags + Sort */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[var(--gh-border-subtle)] text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {/* User Scope Filter (Feed Tim vs Catatan Saya) */}
          <div className="flex items-center bg-[var(--gh-surface)] rounded-md p-0.5 border border-[var(--gh-border)]">
            <button
              onClick={() => onFilterChange({ userScope: 'all' })}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-xs transition-colors ${
                filter.userScope === 'all'
                  ? 'bg-[var(--gh-bg)] text-[var(--gh-text-primary)] font-semibold shadow-xs'
                  : 'text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)]'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>Feed Tim</span>
            </button>

            <button
              onClick={handleMineClick}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-xs transition-colors ${
                filter.userScope === 'mine'
                  ? 'bg-[var(--gh-bg)] text-[var(--gh-text-primary)] font-semibold shadow-xs'
                  : 'text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)]'
              }`}
            >
              <UserIcon className="w-3 h-3" />
              <span>Catatan Saya</span>
            </button>
          </div>

          {/* Date Segmented Control */}
          <div className="flex items-center bg-[var(--gh-surface)] rounded-md p-0.5 border border-[var(--gh-border)]">
            {dateOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onFilterChange({ dateFilter: opt.value })}
                className={`px-2.5 py-0.5 rounded text-xs transition-colors ${
                  filter.dateFilter === opt.value
                    ? 'bg-[var(--gh-bg)] text-[var(--gh-text-primary)] font-medium shadow-xs'
                    : 'text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Favorites Star Filter */}
          <button
            onClick={() => onFilterChange({ onlyFavorites: !filter.onlyFavorites })}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs transition-colors ${
              filter.onlyFavorites
                ? 'bg-[var(--gh-surface-hover)] border-[var(--gh-border)] text-amber-500 font-medium'
                : 'bg-[var(--gh-surface)] border-[var(--gh-border)] text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)]'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${filter.onlyFavorites ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>Favorit</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Active Tag filter badge */}
          {filter.selectedTag && (
            <div className="flex items-center gap-1 bg-[var(--gh-surface)] border border-[var(--gh-border)] text-[var(--gh-text-primary)] px-2 py-0.5 rounded text-xs">
              <Tag className="w-3 h-3 text-[var(--gh-text-secondary)]" />
              <span>#{filter.selectedTag}</span>
              <button
                onClick={() => onFilterChange({ selectedTag: null })}
                className="text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)]"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1 bg-[var(--gh-surface)] border border-[var(--gh-border)] rounded-md px-2 py-1 text-[var(--gh-text-secondary)] text-xs">
            <ArrowUpDown className="w-3 h-3" />
            <select
              value={filter.sortBy}
              onChange={(e) =>
                onFilterChange({
                  sortBy: e.target.value as FilterState['sortBy'],
                })
              }
              className="bg-transparent border-none text-[var(--gh-text-primary)] focus:outline-none cursor-pointer text-xs"
            >
              <option value="date-desc" className="bg-[var(--gh-surface)]">Terbaru (Tanggal)</option>
              <option value="date-asc" className="bg-[var(--gh-surface)]">Terlama (Tanggal)</option>
              <option value="duration-desc" className="bg-[var(--gh-surface)]">Durasi Belajar</option>
              <option value="title-asc" className="bg-[var(--gh-surface)]">Judul (A-Z)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
