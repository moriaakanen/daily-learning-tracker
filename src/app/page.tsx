'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  BookOpen,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { StatsOverview } from '@/components/StatsOverview';
import { FilterBar } from '@/components/FilterBar';
import { LogCard } from '@/components/LogCard';
import { TimelineView } from '@/components/TimelineView';
import { LogDetailModal } from '@/components/LogDetailModal';
import { LogFormModal } from '@/components/LogFormModal';
import { SettingsModal } from '@/components/SettingsModal';
import {
  getAllLogs,
  createLog,
  updateLog,
  deleteLog,
  calculateStats,
  filterLogs,
  DEFAULT_CATEGORIES,
  INITIAL_LOGS,
  saveLocalLogs,
} from '@/lib/storage';
import { getSupabaseClient } from '@/lib/supabase';
import { LearningLog, FilterState, ViewMode } from '@/types';

export default function Home() {
  const [logs, setLogs] = useState<LearningLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<LearningLog | null>(null);
  const [selectedLog, setSelectedLog] = useState<LearningLog | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Filters state
  const [filter, setFilter] = useState<FilterState>({
    searchQuery: '',
    selectedCategory: 'All',
    selectedTag: null,
    dateFilter: 'all',
    onlyFavorites: false,
    sortBy: 'date-desc',
  });

  // Load initial data
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAllLogs();
      setLogs(data);
      const supabase = getSupabaseClient();
      setIsSupabaseConnected(!!supabase);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute Categories
  const categoriesList = useMemo(() => {
    const defaultNames = DEFAULT_CATEGORIES.map((c) => c.name);
    const customNames = logs.map((l) => l.category).filter(Boolean);
    return Array.from(new Set([...defaultNames, ...customNames]));
  }, [logs]);

  // Compute Tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    logs.forEach((log) => {
      if (Array.isArray(log.tags)) {
        log.tags.forEach((t) => {
          const clean = t.trim();
          if (clean) tagSet.add(clean);
        });
      }
    });
    return Array.from(tagSet).sort();
  }, [logs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return filterLogs(logs, filter);
  }, [logs, filter]);

  // Stats
  const stats = useMemo(() => {
    return calculateStats(logs);
  }, [logs]);

  // Handlers
  const handleCreateOrUpdateLog = async (
    logData: Omit<LearningLog, 'id' | 'created_at' | 'updated_at'>,
    existingId?: string
  ) => {
    if (existingId) {
      const updated = await updateLog(existingId, logData);
      setLogs((prev) => prev.map((l) => (l.id === existingId ? updated : l)));
    } else {
      const created = await createLog(logData);
      setLogs((prev) => [created, ...prev.filter((l) => l.id !== created.id)]);
    }
  };

  const handleDeleteLog = async (id: string) => {
    await deleteLog(id);
    setLogs((prev) => prev.filter((l) => l.id !== id));
    if (selectedLog?.id === id) setSelectedLog(null);
  };

  const handleToggleFavorite = async (id: string, current: boolean) => {
    const updated = await updateLog(id, { is_favorite: !current });
    setLogs((prev) => prev.map((l) => (l.id === id ? updated : l)));
    if (selectedLog?.id === id) setSelectedLog(updated);
  };

  const handleTagClick = (tag: string) => {
    setFilter((prev) => ({
      ...prev,
      selectedTag: prev.selectedTag === tag ? null : tag,
    }));
  };

  const handleFilterUpdates = (updates: Partial<FilterState>) => {
    setFilter((prev) => ({ ...prev, ...updates }));
  };

  const handleImportLogs = (imported: LearningLog[]) => {
    setLogs(imported);
    saveLocalLogs(imported);
  };

  const handleResetSampleData = () => {
    setLogs(INITIAL_LOGS);
    saveLocalLogs(INITIAL_LOGS);
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 selection:bg-zinc-800 selection:text-zinc-100">
      {/* Top Header */}
      <Header
        onOpenNewLog={() => {
          setEditingLog(null);
          setIsFormOpen(true);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        showStats={showStats}
        onToggleStats={() => setShowStats(!showStats)}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        searchQuery={filter.searchQuery}
        onSearchChange={(q) => handleFilterUpdates({ searchQuery: q })}
        isSupabaseConnected={isSupabaseConnected}
        totalLogsCount={logs.length}
      />

      {/* Main Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-7">
        {/* Metric Bar if toggled */}
        {showStats && <StatsOverview stats={stats} />}

        {/* Filter Bar */}
        <FilterBar
          filter={filter}
          onFilterChange={handleFilterUpdates}
          categories={categoriesList}
          allTags={allTags}
          totalResultsCount={filteredLogs.length}
        />

        {/* Minimal Tag Strip */}
        {allTags.length > 0 && (
          <div className="mb-4 flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-[11px] text-zinc-500 font-medium mr-1">
              Topik:
            </span>
            {allTags.slice(0, 8).map((tag) => {
              const isSelected = filter.selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                    isSelected
                      ? 'bg-zinc-200 text-zinc-950 font-medium'
                      : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        )}

        {/* Log Entries View */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-5 h-5 rounded-full border-2 border-zinc-500 border-t-transparent animate-spin" />
            <p className="text-xs text-zinc-500">Memuat catatan...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 px-4 rounded-xl bg-zinc-900/30 border border-zinc-800 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="max-w-xs space-y-1">
              <h3 className="text-sm font-semibold text-zinc-200">
                Tidak ada catatan
              </h3>
              <p className="text-xs text-zinc-500">
                {filter.searchQuery || filter.selectedCategory !== 'All' || filter.selectedTag
                  ? 'Tidak ada hasil untuk filter ini.'
                  : 'Belum ada catatan belajar yang dibuat.'}
              </p>
            </div>
            <button
              onClick={() => {
                if (filter.searchQuery || filter.selectedCategory !== 'All' || filter.selectedTag) {
                  setFilter({
                    searchQuery: '',
                    selectedCategory: 'All',
                    selectedTag: null,
                    dateFilter: 'all',
                    onlyFavorites: false,
                    sortBy: 'date-desc',
                  });
                } else {
                  setEditingLog(null);
                  setIsFormOpen(true);
                }
              }}
              className="flex items-center gap-1.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>
                {filter.searchQuery || filter.selectedCategory !== 'All' || filter.selectedTag
                  ? 'Reset Filter'
                  : 'Tulis Catatan Pertama'}
              </span>
            </button>
          </div>
        ) : viewMode === 'timeline' ? (
          <TimelineView
            logs={filteredLogs}
            onSelect={setSelectedLog}
            onEdit={(log) => {
              setEditingLog(log);
              setIsFormOpen(true);
            }}
            onDelete={handleDeleteLog}
            onToggleFavorite={handleToggleFavorite}
            onTagClick={handleTagClick}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredLogs.map((log) => (
              <LogCard
                key={log.id}
                log={log}
                onSelect={setSelectedLog}
                onEdit={(l) => {
                  setEditingLog(l);
                  setIsFormOpen(true);
                }}
                onDelete={handleDeleteLog}
                onToggleFavorite={handleToggleFavorite}
                onTagClick={handleTagClick}
              />
            ))}
          </div>
        )}
      </main>

      {/* Subtle Footer */}
      <footer className="border-t border-zinc-800/60 py-5 text-center text-xs text-zinc-500 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Daily LearnLog • Developer Learning Journal</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-zinc-300 transition-colors"
            >
              Pengaturan Database
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LogDetailModal
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
        onEdit={(log) => {
          setEditingLog(log);
          setIsFormOpen(true);
        }}
        onDelete={handleDeleteLog}
        onToggleFavorite={handleToggleFavorite}
        onTagClick={handleTagClick}
      />

      <LogFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingLog(null);
        }}
        onSave={handleCreateOrUpdateLog}
        initialLog={editingLog}
        categories={categoriesList}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        logs={logs}
        onImportLogs={handleImportLogs}
        onResetSampleData={handleResetSampleData}
        onSupabaseStatusChange={loadData}
      />
    </div>
  );
}
