'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  BookOpen,
  Sparkles,
  Layers,
  Tag,
  Search,
  Filter,
  Flame,
  CheckCircle2,
  Calendar,
  AlertCircle,
  HelpCircle,
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

  // Compute Categories from logs and defaults
  const categoriesList = useMemo(() => {
    const defaultNames = DEFAULT_CATEGORIES.map((c) => c.name);
    const customNames = logs.map((l) => l.category).filter(Boolean);
    return Array.from(new Set([...defaultNames, ...customNames]));
  }, [logs]);

  // Compute all available tags
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

  // Compute filtered logs
  const filteredLogs = useMemo(() => {
    return filterLogs(logs, filter);
  }, [logs, filter]);

  // Compute stats
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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
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

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Streak & Stats Header if toggled */}
        {showStats && <StatsOverview stats={stats} />}

        {/* Filter Bar */}
        <FilterBar
          filter={filter}
          onFilterChange={handleFilterUpdates}
          categories={categoriesList}
          allTags={allTags}
          totalResultsCount={filteredLogs.length}
        />

        {/* Tag Cloud Shortcut (when tags available) */}
        {allTags.length > 0 && (
          <div className="mb-6 flex items-center gap-1.5 flex-wrap text-xs text-slate-400">
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3 h-3" /> Topik Populer:
            </span>
            {allTags.slice(0, 10).map((tag) => {
              const isSelected = filter.selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`px-2.5 py-0.5 rounded-full text-xs transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        )}

        {/* Content List Area */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            <p className="text-sm text-slate-400">Memuat catatan belajarmu...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 px-4 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-7 h-7" />
            </div>
            <div className="max-w-md space-y-1">
              <h3 className="text-base font-bold text-slate-100">
                Tidak ada catatan yang sesuai
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {filter.searchQuery || filter.selectedCategory !== 'All' || filter.selectedTag
                  ? 'Coba sesuaikan filter atau kata kunci pencarianmu untuk menemukan catatan lain.'
                  : 'Belum ada catatan belajar yang disimpan. Mulai catat hal berharga yang kamu pelajari hari ini!'}
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
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>
                {filter.searchQuery || filter.selectedCategory !== 'All' || filter.selectedTag
                  ? 'Reset Filter'
                  : 'Buat Catatan Pertama'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>Daily LearnLog &copy; {new Date().getFullYear()} — Built with Next.js & Supabase</p>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-indigo-300 transition-colors"
            >
              Konfigurasi Database
            </button>
            <span>&bull;</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-indigo-300 transition-colors"
            >
              GitHub Ready
            </a>
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
