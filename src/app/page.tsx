'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  BookOpen,
  GitPullRequest,
  Tag,
  PenSquare,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { StatsOverview } from '@/components/StatsOverview';
import { FilterBar } from '@/components/FilterBar';
import { LogCard } from '@/components/LogCard';
import { TimelineView } from '@/components/TimelineView';
import { LogDetailModal } from '@/components/LogDetailModal';
import { FullPageEditor } from '@/components/FullPageEditor';
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

type ActiveTab = 'overview' | 'logs' | 'editor';

export default function Home() {
  const [logs, setLogs] = useState<LearningLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Editing state
  const [editingLog, setEditingLog] = useState<LearningLog | null>(null);
  const [selectedLog, setSelectedLog] = useState<LearningLog | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Filters
  const [filter, setFilter] = useState<FilterState>({
    searchQuery: '',
    selectedCategory: 'All',
    selectedTag: null,
    dateFilter: 'all',
    onlyFavorites: false,
    sortBy: 'date-desc',
  });

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

  const categoriesList = useMemo(() => {
    const defaultNames = DEFAULT_CATEGORIES.map((c) => c.name);
    const customNames = logs.map((l) => l.category).filter(Boolean);
    return Array.from(new Set([...defaultNames, ...customNames]));
  }, [logs]);

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

  const filteredLogs = useMemo(() => {
    return filterLogs(logs, filter);
  }, [logs, filter]);

  const stats = useMemo(() => {
    return calculateStats(logs);
  }, [logs]);

  const handleOpenNewEntry = () => {
    setEditingLog(null);
    setActiveTab('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditEntry = (log: LearningLog) => {
    setEditingLog(log);
    setSelectedLog(null);
    setActiveTab('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    setActiveTab('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    setActiveTab('logs');
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
    <div className="min-h-screen flex flex-col bg-[var(--gh-bg)] text-[var(--gh-text-primary)] transition-colors">
      {/* GitHub Top Header */}
      <Header
        onOpenNewLog={handleOpenNewEntry}
        onOpenSettings={() => setIsSettingsOpen(true)}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        searchQuery={filter.searchQuery}
        onSearchChange={(q) => {
          handleFilterUpdates({ searchQuery: q });
          if (activeTab === 'editor') setActiveTab('logs');
        }}
        isSupabaseConnected={isSupabaseConnected}
        totalLogsCount={logs.length}
      />

      {/* GitHub Subnav Navigation Bar */}
      <div className="border-b border-[var(--gh-border)] bg-[var(--gh-surface)] px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center gap-3 sm:gap-6 text-xs font-semibold overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 py-3 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-[#fd8c73] text-[var(--gh-text-primary)]'
                : 'border-transparent text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)]'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[var(--gh-text-secondary)]" />
            <span>Overview & Heatmap</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-1.5 py-3 border-b-2 transition-colors ${
              activeTab === 'logs'
                ? 'border-[#fd8c73] text-[var(--gh-text-primary)]'
                : 'border-transparent text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)]'
            }`}
          >
            <GitPullRequest className="w-4 h-4 text-[var(--gh-text-secondary)]" />
            <span>Semua Catatan</span>
            <span className="ml-1 bg-[var(--gh-badge-bg)] text-[var(--gh-text-secondary)] border border-[var(--gh-badge-border)] text-[10px] px-1.5 py-0.2 rounded-full">
              {logs.length}
            </span>
          </button>

          <button
            onClick={handleOpenNewEntry}
            className={`flex items-center gap-1.5 py-3 border-b-2 transition-colors ${
              activeTab === 'editor'
                ? 'border-[#fd8c73] text-[var(--gh-text-primary)]'
                : 'border-transparent text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)]'
            }`}
          >
            <PenSquare className="w-4 h-4 text-[var(--gh-text-secondary)]" />
            <span>{editingLog ? 'Edit Catatan' : 'Tulis Catatan Baru'}</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 py-3 border-b-2 border-transparent text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] transition-colors ml-auto"
          >
            <span>Database</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Full Page Editor Tab */}
        {activeTab === 'editor' ? (
          <FullPageEditor
            initialLog={editingLog}
            categories={categoriesList}
            onSave={handleCreateOrUpdateLog}
            onCancel={() => setActiveTab('overview')}
          />
        ) : (
          <>
            {/* Overview Heatmap Graph */}
            {activeTab === 'overview' && (
              <StatsOverview stats={stats} logs={logs} />
            )}

            {/* Filter and search row */}
            <FilterBar
              filter={filter}
              onFilterChange={handleFilterUpdates}
              categories={categoriesList}
              allTags={allTags}
              totalResultsCount={filteredLogs.length}
            />

            {/* Popular Tags cloud */}
            {allTags.length > 0 && (
              <div className="mb-4 flex items-center gap-1.5 flex-wrap text-xs">
                <span className="text-[11px] text-[var(--gh-text-secondary)] font-medium mr-1 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Labels:
                </span>
                {allTags.slice(0, 10).map((tag) => {
                  const isSelected = filter.selectedTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className={`px-2.5 py-0.5 rounded-full text-xs transition-colors border ${
                        isSelected
                          ? 'bg-[var(--gh-badge-bg)] text-[var(--gh-accent)] border-[var(--gh-accent)] font-semibold'
                          : 'bg-[var(--gh-badge-bg)] text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] border-[var(--gh-badge-border)]'
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Logs View */}
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-5 h-5 rounded-full border-2 border-[var(--gh-accent)] border-t-transparent animate-spin" />
                <p className="text-xs text-[var(--gh-text-secondary)]">Memuat catatan...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="py-16 px-4 rounded-md border border-[var(--gh-border)] bg-[var(--gh-surface)] text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-[var(--gh-badge-bg)] border border-[var(--gh-border)] flex items-center justify-center text-[var(--gh-text-secondary)]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="max-w-xs space-y-1">
                  <h3 className="text-sm font-semibold text-[var(--gh-text-primary)]">
                    Tidak ada catatan yang cocok
                  </h3>
                  <p className="text-xs text-[var(--gh-text-secondary)]">
                    {filter.searchQuery || filter.selectedCategory !== 'All' || filter.selectedTag
                      ? 'Coba bersihkan kata kunci atau filter untuk melihat semua catatan.'
                      : 'Mulai tulis hal bermanfaat yang kamu pelajari hari ini.'}
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
                      handleOpenNewEntry();
                    }
                  }}
                  className="flex items-center gap-1.5 bg-[#1f883d] hover:bg-[#1a7f37] text-white text-xs font-semibold px-3.5 py-1.5 rounded-md shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    {filter.searchQuery || filter.selectedCategory !== 'All' || filter.selectedTag
                      ? 'Reset Filter'
                      : 'Tulis Catatan Baru'}
                  </span>
                </button>
              </div>
            ) : viewMode === 'timeline' ? (
              <TimelineView
                logs={filteredLogs}
                onSelect={setSelectedLog}
                onEdit={handleEditEntry}
                onDelete={handleDeleteLog}
                onToggleFavorite={handleToggleFavorite}
                onTagClick={handleTagClick}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredLogs.map((log) => (
                  <LogCard
                    key={log.id}
                    log={log}
                    onSelect={setSelectedLog}
                    onEdit={handleEditEntry}
                    onDelete={handleDeleteLog}
                    onToggleFavorite={handleToggleFavorite}
                    onTagClick={handleTagClick}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* GitHub Footer */}
      <footer className="border-t border-[var(--gh-border)] py-6 text-xs text-[var(--gh-text-secondary)] mt-auto bg-[var(--gh-surface)]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[var(--gh-text-tertiary)]" />
            <span>&copy; {new Date().getFullYear()} Daily LearnLog • GitHub Primer Style</span>
          </div>
          <div className="flex items-center gap-4 text-[var(--gh-accent)]">
            <a
              href="https://github.com/moriaakanen/daily-learning-tracker"
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              GitHub Repository
            </a>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:underline"
            >
              Database Settings
            </button>
          </div>
        </div>
      </footer>

      {/* Reading Modal */}
      <LogDetailModal
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
        onEdit={handleEditEntry}
        onDelete={handleDeleteLog}
        onToggleFavorite={handleToggleFavorite}
        onTagClick={handleTagClick}
      />

      {/* Settings Modal */}
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
