'use client';

import React from 'react';
import { Star, X, ArrowUpDown } from 'lucide-react';
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
    { label: 'Semua', value: 'all' },
    { label: 'Hari Ini', value: 'today' },
    { label: '7 Hari', value: 'this-week' },
    { label: 'Bulan Ini', value: 'this-month' },
  ];

  return (
    <div className="mb-5 space-y-2.5">
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => onFilterChange({ selectedCategory: 'All' })}
          className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
            filter.selectedCategory === 'All'
              ? 'bg-zinc-100 text-zinc-950 font-semibold'
              : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
          }`}
        >
          Semua ({totalResultsCount})
        </button>

        {categories.map((cat) => {
          const isSelected = filter.selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onFilterChange({ selectedCategory: cat })}
              className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap border transition-colors ${
                isSelected
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-100 font-semibold'
                  : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Date, Favorites, Tag Filter, and Sort */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-zinc-800/60 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Date Segmented Control */}
          <div className="flex items-center bg-zinc-900 rounded-md p-0.5 border border-zinc-800">
            {dateOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onFilterChange({ dateFilter: opt.value })}
                className={`px-2.5 py-0.5 rounded text-[11px] transition-colors ${
                  filter.dateFilter === opt.value
                    ? 'bg-zinc-800 text-zinc-100 font-medium'
                    : 'text-zinc-400 hover:text-zinc-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Favorites */}
          <button
            onClick={() => onFilterChange({ onlyFavorites: !filter.onlyFavorites })}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-[11px] transition-colors ${
              filter.onlyFavorites
                ? 'bg-amber-950/40 border-amber-800/60 text-amber-300 font-medium'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-300'
            }`}
          >
            <Star className={`w-3 h-3 ${filter.onlyFavorites ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>Favorit</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Active Tag filter badge */}
          {filter.selectedTag && (
            <div className="flex items-center gap-1 bg-zinc-800 border border-zinc-700 text-zinc-200 px-2 py-0.5 rounded text-[11px]">
              <span>#{filter.selectedTag}</span>
              <button
                onClick={() => onFilterChange({ selectedTag: null })}
                className="hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Sort selector */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-md px-2 py-0.5 text-zinc-400 text-[11px]">
            <ArrowUpDown className="w-3 h-3" />
            <select
              value={filter.sortBy}
              onChange={(e) =>
                onFilterChange({
                  sortBy: e.target.value as FilterState['sortBy'],
                })
              }
              className="bg-transparent border-none text-zinc-300 focus:outline-none cursor-pointer"
            >
              <option value="date-desc" className="bg-zinc-900">Terbaru</option>
              <option value="date-asc" className="bg-zinc-900">Terlama</option>
              <option value="duration-desc" className="bg-zinc-900">Durasi</option>
              <option value="title-asc" className="bg-zinc-900">Judul (A-Z)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
