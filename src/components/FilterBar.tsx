'use client';

import React from 'react';
import { Star, X, Tag, ArrowUpDown, Filter } from 'lucide-react';
import { FilterState, DateFilter } from '@/types';

interface FilterBarProps {
  filter: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  categories: string[];
  allTags: string[];
  totalResultsCount: number;
}

export function FilterBar({
  filter,
  onFilterChange,
  categories,
  allTags,
  totalResultsCount,
}: FilterBarProps) {
  const dateOptions: { label: string; value: DateFilter }[] = [
    { label: 'All Time', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'this-week' },
    { label: 'This Month', value: 'this-month' },
  ];

  return (
    <div className="mb-4 space-y-2.5">
      {/* Category Labels bar (GitHub issue labels style) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => onFilterChange({ selectedCategory: 'All' })}
          className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
            filter.selectedCategory === 'All'
              ? 'bg-[var(--gh-badge-bg)] text-[var(--gh-text-primary)] border-[var(--gh-border)] font-semibold'
              : 'bg-transparent text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] border-transparent hover:border-[var(--gh-border)]'
          }`}
        >
          All Categories ({totalResultsCount})
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

      {/* Control row: Subnav + Favorites + Tags + Sort */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[var(--gh-border-subtle)] text-xs">
        <div className="flex items-center gap-2 flex-wrap">
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
            <span>Starred</span>
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
              <option value="date-desc" className="bg-[var(--gh-surface)]">Sort: Newest date</option>
              <option value="date-asc" className="bg-[var(--gh-surface)]">Sort: Oldest date</option>
              <option value="duration-desc" className="bg-[var(--gh-surface)]">Sort: Longest duration</option>
              <option value="title-asc" className="bg-[var(--gh-surface)]">Sort: Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
