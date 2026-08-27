'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  BookOpen,
  Tag,
  PenSquare,
  Users,
  User as UserIcon,
  LogIn,
  Lock,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { StatsOverview } from '@/components/StatsOverview';
import { FilterBar } from '@/components/FilterBar';
import { LogCard } from '@/components/LogCard';
import { TimelineView } from '@/components/TimelineView';
import { LogDetailModal } from '@/components/LogDetailModal';
import { FullPageEditor } from '@/components/FullPageEditor';
import { UserLoginModal } from '@/components/UserLoginModal';
import { SettingsModal } from '@/components/SettingsModal';
import {
  getAllLogs,
  createLog,
  updateLog,
  deleteLog,
  addFeedback,
  calculateStats,
  filterLogs,
  DEFAULT_CATEGORIES,
  INITIAL_LOGS,
  saveLocalLogs,
} from '@/lib/storage';
import {
  getCurrentUser,
  setCurrentUser,
  logoutUser,
  getTeamUsers,
} from '@/lib/auth';
import { getSupabaseClient } from '@/lib/supabase';
import { LearningLog, FilterState, ViewMode, User } from '@/types';

type ActiveTab = 'overview' | 'logs' | 'editor';

export default function Home() {
  const [logs, setLogs] = useState<LearningLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  // View mode (persisted in localStorage)
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('daily_learning_view_mode') as ViewMode;
      if (savedMode && ['vertical', 'grid', 'timeline', 'compact'].includes(savedMode)) {
        return savedMode;
      }
    }
    return 'vertical';
  });

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('daily_learning_view_mode', mode);
    }
  };

  // User Auth State
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [teamUsers, setTeamUsers] = useState<User[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Navigation tab (persisted in localStorage across page refresh)
  const [activeTab, setActiveTabState] = useState<ActiveTab>(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('daily_learning_active_tab') as ActiveTab;
      if (savedTab && ['overview', 'logs', 'editor'].includes(savedTab)) {
        return savedTab;
      }
    }
    return 'overview';
  });

  const setActiveTab = (tab: ActiveTab) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      localStorage.setItem('daily_learning_active_tab', tab);
    }
  };

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
    userScope: 'all',
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
    setCurrentUserState(getCurrentUser());
    setTeamUsers(getTeamUsers());
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUserState(user);
    setCurrentUser(user);
    setTeamUsers(getTeamUsers());
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUserState(null);
    if (filter.userScope === 'mine') {
      setFilter((prev) => ({ ...prev, userScope: 'all' }));
    }
    if (activeTab === 'editor') {
      setActiveTab('overview');
    }
  };

  // Custom Topics State (Persisted in localStorage)
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('daily_learning_custom_categories');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  const handleAddCustomCategory = (newCat: string) => {
    const clean = newCat.trim();
    if (!clean) return;
    setCustomCategories((prev) => {
      if (prev.includes(clean)) return prev;
      const updated = [...prev, clean];
      if (typeof window !== 'undefined') {
        localStorage.setItem('daily_learning_custom_categories', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleDeleteCustomCategory = (catToDelete: string) => {
    const isDefault = DEFAULT_CATEGORIES.some(
      (c) => c.name.toLowerCase() === catToDelete.toLowerCase()
    );
    if (isDefault) return; // Kategori topik default tidak bisa dihapus

    setCustomCategories((prev) => {
      const updated = prev.filter((c) => c.toLowerCase() !== catToDelete.toLowerCase());
      if (typeof window !== 'undefined') {
        localStorage.setItem('daily_learning_custom_categories', JSON.stringify(updated));
      }
      return updated;
    });

    if (filter.selectedCategory.toLowerCase() === catToDelete.toLowerCase()) {
      setFilter((prev) => ({ ...prev, selectedCategory: 'All' }));
    }
  };

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    logs.forEach((log) => {
      const cat = log.category?.trim();
      if (cat) {
        counts[cat] = (counts[cat] || 0) + 1;
      }
    });
    return counts;
  }, [logs]);

  const categoriesList = useMemo(() => {
    const defaultNames = DEFAULT_CATEGORIES.map((c) => c.name);
    const logCategories = logs.map((l) => l.category?.trim()).filter(Boolean) as string[];
    const allNames = Array.from(new Set([...defaultNames, ...logCategories, ...customCategories]));

    // Sort dynamically by most learned topic (descending count), then alphabetically
    return allNames.sort((a, b) => {
      const countA = categoryCounts[a] || 0;
      const countB = categoryCounts[b] || 0;
      if (countB !== countA) {
        return countB - countA; // Topics with highest logs appear first on the left
      }
      return a.localeCompare(b);
    });
  }, [customCategories, logs, categoryCounts]);

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

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const filteredLogs = useMemo(() => {
    return filterLogs(logs, filter, currentUser?.id);
  }, [logs, filter, currentUser]);

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE) || 1;

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLogs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLogs, currentPage]);

  const stats = useMemo(() => {
    return calculateStats(logs);
  }, [logs]);

  const handleOpenNewEntry = () => {
    if (!currentUser) {
      setIsUserModalOpen(true);
      return;
    }
    setEditingLog(null);
    setActiveTab('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditEntry = (log: LearningLog) => {
    if (!currentUser) {
      setIsUserModalOpen(true);
      return;
    }
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

  const handleUpdateCardColor = async (id: string, color: string) => {
    const updated = await updateLog(id, { card_color: color });
    setLogs((prev) => prev.map((l) => (l.id === id ? { ...l, card_color: color } : l)));
    if (selectedLog?.id === id) setSelectedLog((prev) => (prev ? { ...prev, card_color: color } : null));
  };

  const handleAddFeedback = async (logId: string, content: string) => {
    if (!currentUser) {
      setIsUserModalOpen(true);
      return;
    }
    const newFb = await addFeedback(logId, currentUser, content);
    setLogs((prev) =>
      prev.map((log) => {
        if (log.id === logId) {
          const existing = log.feedback || [];
          return { ...log, feedback: [...existing, newFb] };
        }
        return log;
      })
    );
    if (selectedLog && selectedLog.id === logId) {
      setSelectedLog((prev) => (prev ? { ...prev, feedback: [...(prev.feedback || []), newFb] } : null));
    }
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
    setCurrentPage(1);
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
        currentUser={currentUser}
        onOpenNewLog={handleOpenNewEntry}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenUserModal={() => setIsUserModalOpen(true)}
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

      {/* Cheerful Navigation Bar */}
      <div className="border-b border-[var(--gh-border)] bg-[var(--gh-surface)] px-4 sm:px-6 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 text-xs font-bold py-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] hover:bg-[var(--gh-bg)]'
              }`}
            >
              <span>📊</span>
              <span>Overview & Kalender</span>
            </button>

            <button
              onClick={() => {
                setFilter((prev) => ({ ...prev, userScope: 'all' }));
                setActiveTab('logs');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                activeTab === 'logs' && filter.userScope === 'all'
                  ? 'bg-indigo-500 text-white shadow-xs'
                  : 'text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] hover:bg-[var(--gh-bg)]'
              }`}
            >
              <span>👥</span>
              <span>Feed Tim</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'logs' && filter.userScope === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-[var(--gh-badge-bg)] text-[var(--gh-text-secondary)] border border-[var(--gh-badge-border)]'
              }`}>
                {logs.length}
              </span>
            </button>

            <button
              onClick={() => {
                if (!currentUser) {
                  setIsUserModalOpen(true);
                  return;
                }
                setFilter((prev) => ({ ...prev, userScope: 'mine' }));
                setActiveTab('logs');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                activeTab === 'logs' && filter.userScope === 'mine'
                  ? 'bg-purple-500 text-white shadow-xs'
                  : 'text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] hover:bg-[var(--gh-bg)]'
              }`}
            >
              <span>👤</span>
              <span>Catatan Saya</span>
              {currentUser && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'logs' && filter.userScope === 'mine'
                    ? 'bg-white/20 text-white'
                    : 'bg-[var(--gh-badge-bg)] text-[var(--gh-text-secondary)] border border-[var(--gh-badge-border)]'
                }`}>
                  {logs.filter((l) => l.author_id === currentUser.id).length}
                </span>
              )}
            </button>

            <button
              onClick={handleOpenNewEntry}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                activeTab === 'editor'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] hover:bg-[var(--gh-bg)]'
              }`}
            >
              <span>✍️</span>
              <span>{editingLog ? 'Edit Catatan' : 'Tulis Baru'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Full Page Editor Tab */}
        {activeTab === 'editor' ? (
          <FullPageEditor
            currentUser={currentUser}
            initialLog={editingLog}
            categories={categoriesList}
            onOpenLogin={() => setIsUserModalOpen(true)}
            onSave={handleCreateOrUpdateLog}
            onCancel={() => setActiveTab('overview')}
            onAddCategory={handleAddCustomCategory}
          />
        ) : (
          <>
            {/* Cheerful Greeting & Motivation Banner */}
            <div className="mb-6 p-4 sm:p-5 rounded-2xl border border-[var(--gh-border)] bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-indigo-500/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base sm:text-lg font-extrabold text-[var(--gh-text-primary)]">
                    ✨ Semangat {new Date().getHours() < 12 ? 'Pagi' : new Date().getHours() < 18 ? 'Siang' : 'Malam'}, {currentUser ? currentUser.name.split(' ')[0] : 'Sahabat Pembelajar'}!
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                    🔥 {stats.currentStreak} Hari Streak
                  </span>
                </div>
                <p className="text-xs text-[var(--gh-text-secondary)] font-medium leading-relaxed max-w-xl">
                  &ldquo;Setiap hal kecil yang kamu pelajari hari ini membuatmu 1% lebih bijak dari kemarin. Terus eksplorasi ya! 🌱&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleOpenNewEntry}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <PenSquare className="w-3.5 h-3.5" />
                  <span>Catat Hasil Belajar</span>
                </button>
              </div>
            </div>

            {/* Guest Banner if not logged in */}
            {!currentUser && (
              <div className="mb-6 p-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 flex flex-wrap items-center justify-between gap-4 text-xs shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-lg shrink-0">
                    🔑
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[var(--gh-text-primary)]">
                      Portal Pembelajaran Tim (Mode Baca)
                    </div>
                    <div className="text-[11px] text-[var(--gh-text-secondary)] mt-0.5 font-medium">
                      Masuk dengan username dan password Anda untuk mulai mencatat materi harian, upload foto, dan diskusi seru!
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-sm shrink-0 text-xs cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Masuk Sekarang</span>
                </button>
              </div>
            )}

            {/* Filter and search row */}
            <FilterBar
              filter={filter}
              onFilterChange={handleFilterUpdates}
              categories={categoriesList}
              defaultCategories={DEFAULT_CATEGORIES.map((c) => c.name)}
              categoryCounts={categoryCounts}
              teamUsers={teamUsers}
              currentUser={currentUser}
              onOpenLogin={() => setIsUserModalOpen(true)}
              totalResultsCount={logs.length}
              onAddCategory={handleAddCustomCategory}
              onDeleteCategory={handleDeleteCustomCategory}
            />

            {/* Logs View */}
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-5 h-5 rounded-full border-2 border-[var(--gh-accent)] border-t-transparent animate-spin" />
                <p className="text-xs text-[var(--gh-text-secondary)]">Memuat catatan...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="py-16 px-4 rounded-2xl border border-[var(--gh-border)] bg-[var(--gh-surface)] text-center flex flex-col items-center justify-center space-y-3 shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl animate-bounce">
                  🌱
                </div>
                <div className="max-w-xs space-y-1">
                  <h3 className="text-sm font-bold text-[var(--gh-text-primary)]">
                    Belum ada catatan yang cocok
                  </h3>
                  <p className="text-xs text-[var(--gh-text-secondary)] font-medium">
                    {filter.searchQuery || filter.selectedCategory !== 'All' || filter.selectedTag || filter.userScope !== 'all'
                      ? 'Coba bersihkan kata kunci atau sesuaikan filter untuk melihat catatan lain.'
                      : 'Mari mulai tanam benih kebaikan dan catat hal bermanfaat yang kamu pelajari hari ini! ✨'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (filter.searchQuery || filter.selectedCategory !== 'All' || filter.selectedTag || filter.userScope !== 'all') {
                      setFilter({
                        searchQuery: '',
                        selectedCategory: 'All',
                        selectedTag: null,
                        dateFilter: 'all',
                        userScope: 'all',
                        onlyFavorites: false,
                        sortBy: 'date-desc',
                      });
                    } else {
                      handleOpenNewEntry();
                    }
                  }}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    {filter.searchQuery || filter.selectedCategory !== 'All' || filter.selectedTag || filter.userScope !== 'all'
                      ? 'Reset Filter'
                      : 'Tulis Catatan Pertama ✨'}
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
              />
            ) : (
              <div className="space-y-4 w-full">
                {/* Responsive Grid View vs Vertical List Feed */}
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full'
                      : 'grid grid-cols-1 gap-3.5 w-full'
                  }
                >
                  {paginatedLogs.map((log) => (
                    <LogCard
                      key={log.id}
                      log={log}
                      currentUser={currentUser}
                      viewMode={viewMode}
                      onSelect={setSelectedLog}
                      onEdit={handleEditEntry}
                      onDelete={handleDeleteLog}
                      onToggleFavorite={handleToggleFavorite}
                      onUpdateCardColor={handleUpdateCardColor}
                    />
                  ))}
                </div>

                {/* Pagination Controls (1 Page = 10 Catatan) - Fully Proportional & Cheerful */}
                {totalPages > 1 && (
                  <div className="w-full flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-[var(--gh-border)] text-xs">
                    <div className="text-[var(--gh-text-secondary)] font-medium">
                      Menampilkan <span className="font-bold text-[var(--gh-text-primary)]">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> - <span className="font-bold text-[var(--gh-text-primary)]">{Math.min(currentPage * ITEMS_PER_PAGE, filteredLogs.length)}</span> dari <span className="font-bold text-[var(--gh-text-primary)]">{filteredLogs.length}</span> catatan
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() => {
                          setCurrentPage((p) => Math.max(1, p - 1));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-3.5 py-1.5 rounded-full border border-[var(--gh-border)] bg-[var(--gh-surface)] hover:bg-[var(--gh-surface-hover)] disabled:opacity-30 disabled:cursor-not-allowed text-[var(--gh-text-primary)] font-bold transition-all shadow-2xs cursor-pointer"
                      >
                        ← Sebelumnya
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => {
                            setCurrentPage(page);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-8 h-8 rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                            currentPage === page
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xs scale-105'
                              : 'border border-[var(--gh-border)] bg-[var(--gh-surface)] hover:bg-[var(--gh-surface-hover)] text-[var(--gh-text-primary)]'
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        type="button"
                        disabled={currentPage === totalPages}
                        onClick={() => {
                          setCurrentPage((p) => Math.min(totalPages, p + 1));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-3.5 py-1.5 rounded-full border border-[var(--gh-border)] bg-[var(--gh-surface)] hover:bg-[var(--gh-surface-hover)] disabled:opacity-30 disabled:cursor-not-allowed text-[var(--gh-text-primary)] font-bold transition-all shadow-2xs cursor-pointer"
                      >
                        Selanjutnya →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Learning Activity & Contribution Graph at the bottom */}
            {activeTab === 'overview' && (
              <div className="mt-8 pt-6 border-t border-[var(--gh-border)]">
                <StatsOverview stats={stats} logs={logs} />
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
            {currentUser ? (
              <button
                onClick={() => setIsUserModalOpen(true)}
                className="hover:underline"
              >
                Akun: {currentUser.name}
              </button>
            ) : (
              <button
                onClick={() => setIsUserModalOpen(true)}
                className="hover:underline font-semibold"
              >
                Masuk / Login
              </button>
            )}
            <span>•</span>
            <a
              href="https://github.com/moriaakanen/daily-learning-tracker"
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              GitHub Repository
            </a>
            <span>•</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:underline"
            >
              Database Settings
            </button>
          </div>
        </div>
      </footer>

      {/* Reading & Feedback Modal */}
      <LogDetailModal
        log={selectedLog}
        currentUser={currentUser}
        onClose={() => setSelectedLog(null)}
        onOpenLogin={() => setIsUserModalOpen(true)}
        onEdit={handleEditEntry}
        onDelete={handleDeleteLog}
        onToggleFavorite={handleToggleFavorite}
        onAddFeedback={handleAddFeedback}
      />

      {/* Real Username & Password Login Modal */}
      <UserLoginModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
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
