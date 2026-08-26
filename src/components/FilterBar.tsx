'use client';

import React from 'react';
import {
  Tag,
  Star,
  SlidersHorizontal,
  X,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
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
    { label: 'Semua Waktu', value: 'all' },
    { label: 'Hari Ini', value: 'today' },
    { label: '7 Hari Terakhir', value: 'this-week' },
    { label: 'Bulan Ini', value: 'this-month' },
  ];

  return (
    <div className="mb-6 space-y-3">
      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => onFilterChange({ selectedCategory: 'All' })}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            filter.selectedCategory === 'All'
              ? 'bg-white text-slate-950 shadow-md shadow-white/10'
              : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Semua ({categories.length ? totalResultsCount : 0})</span>
        </button>

        {categories.map((cat) => {
          const isSelected = filter.selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onFilterChange({ selectedCategory: cat })}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${
                isSelected
                  ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 font-semibold shadow-sm'
                  : 'bg-slate-900/80 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Secondary Row: Date Filter, Favorites, Tags & Sorting */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800/60 text-xs">
        {/* Left: Date Presets & Favorites */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date range pills */}
          <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-800">
            {dateOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onFilterChange({ dateFilter: opt.value })}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  filter.dateFilter === opt.value
                    ? 'bg-slate-800 text-indigo-400 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Favorites filter toggle */}
          <button
            onClick={() => onFilterChange({ onlyFavorites: !filter.onlyFavorites })}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all ${
              filter.onlyFavorites
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-300'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${filter.onlyFavorites ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>Favorit</span>
          </button>
        </div>

        {/* Right: Selected Tag & Sort by dropdown */}
        <div className="flex items-center gap-2">
          {/* Active Tag Indicator */}
          {filter.selectedTag && (
            <div className="flex items-center gap-1 bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 px-2.5 py-1 rounded-lg">
              <Tag className="w-3 h-3 text-indigo-400" />
              <span>#{filter.selectedTag}</span>
              <button
                onClick={() => onFilterChange({ selectedTag: null })}
                className="hover:text-white ml-1"
                title="Hapus filter tag"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-lg px-2 py-1 text-slate-300">
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
            <select
              value={filter.sortBy}
              onChange={(e) =>
                onFilterChange({
                  sortBy: e.target.value as FilterState['sortBy'],
                })
              }
              className="bg-transparent border-none text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="date-desc" className="bg-slate-900 text-slate-200">
                Terbaru (Tanggal)
              </option>
              <option value="date-asc" className="bg-slate-900 text-slate-200">
                Terlama (Tanggal)
              </option>
              <option value="duration-desc" className="bg-slate-900 text-slate-200">
                Durasi Terlama
              </option>
              <option value="title-asc" className="bg-slate-900 text-slate-200">
                Abjad (A-Z)
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
