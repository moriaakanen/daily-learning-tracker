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
  RefreshCw,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Sidebar, ActiveTab } from '@/components/Sidebar';
import { StatsOverview } from '@/components/StatsOverview';
import { FilterBar } from '@/components/FilterBar';
import { LogCard } from '@/components/LogCard';
import { TimelineView } from '@/components/TimelineView';
import { LogDetailModal } from '@/components/LogDetailModal';
import { FullPageEditor } from '@/components/FullPageEditor';
import { QuizView } from '@/components/QuizView';
import { GuestLandingPage } from '@/components/GuestLandingPage';
import { UserLoginModal } from '@/components/UserLoginModal';
import { SettingsModal } from '@/components/SettingsModal';
import { MemoraMascot } from '@/components/MemoraMascot';
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
import { getTimeBasedGreeting, getRandomMemoraQuote, MemoraQuote } from '@/lib/greetings';
import { getSupabaseClient } from '@/lib/supabase';
import { LearningLog, FilterState, ViewMode, User } from '@/types';

export default function Home() {
  const [logs, setLogs] = useState<LearningLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
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
  const [isGuestExploring, setIsGuestExploring] = useState(false);
  const [teamUsers, setTeamUsers] = useState<User[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Navigation tab (persisted in localStorage and URL query across page refresh & browser history)
  const [activeTab, setActiveTabState] = useState<ActiveTab>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlTab = urlParams.get('tab') as ActiveTab;
      if (urlTab && ['overview', 'logs', 'editor', 'quiz'].includes(urlTab)) {
        return urlTab;
      }
      const savedTab = localStorage.getItem('daily_learning_active_tab') as ActiveTab;
      if (savedTab && ['overview', 'logs', 'editor', 'quiz'].includes(savedTab)) {
        return savedTab;
      }
    }
    return 'overview';
  });

  // Synchronize navigation with Browser History State API (pushState)
  const syncBrowserHistory = (tab: ActiveTab, scope?: string, guest?: boolean, logId?: string | null) => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    params.set('tab', tab);
    if (scope) params.set('scope', scope);
    if (guest !== undefined) {
      if (guest) params.set('guest', '1');
      else params.delete('guest');
    }
    if (logId) params.set('log', logId);
    else params.delete('log');

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    const stateObj = { tab, scope: scope || filter.userScope, guest: guest ?? isGuestExploring, logId };
    
    // Only push state if URL or state has changed
    if (window.location.search !== `?${params.toString()}`) {
      window.history.pushState(stateObj, '', newUrl);
    }
  };

  const setActiveTab = (tab: ActiveTab) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      localStorage.setItem('daily_learning_active_tab', tab);
      syncBrowserHistory(tab, filter.userScope, isGuestExploring, selectedLog?.id);
    }
  };

  // Listen to browser Back (←) and Forward (→) buttons via popstate
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const urlTab = urlParams.get('tab') as ActiveTab;
      const urlScope = urlParams.get('scope') as 'all' | 'mine';
      const urlGuest = urlParams.get('guest');
      const urlLogId = urlParams.get('log');

      if (urlTab && ['overview', 'logs', 'editor', 'quiz'].includes(urlTab)) {
        setActiveTabState(urlTab);
      }
      if (urlScope && ['all', 'mine'].includes(urlScope)) {
        setFilter((prev) => ({ ...prev, userScope: urlScope }));
      }
      if (urlGuest === '1') {
        setIsGuestExploring(true);
      } else if (urlGuest === '0' || (!urlGuest && !currentUser)) {
        setIsGuestExploring(false);
      }
      if (urlLogId) {
        const found = logs.find((l) => l.id === urlLogId);
        if (found) setSelectedLog(found);
      } else {
        setSelectedLog(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentUser, logs]);

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
    setIsGuestExploring(false);
    setIsUserModalOpen(false);
    setTeamUsers(getTeamUsers());
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUserState(null);
    setIsGuestExploring(false);
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

  // Dynamic Time-based Greeting & Random Motivational Quote State
  const [currentQuote, setCurrentQuote] = useState<MemoraQuote>(() => getRandomMemoraQuote());
  const [greetingInfo, setGreetingInfo] = useState<{ greeting: string; iconEmoji: string }>(() =>
    getTimeBasedGreeting(currentUser?.name || '', 0)
  );

  useEffect(() => {
    setGreetingInfo(getTimeBasedGreeting(currentUser?.name || '', stats.currentStreak));
  }, [currentUser, stats.currentStreak]);

  const handleRefreshQuote = () => {
    setCurrentQuote((prev) => getRandomMemoraQuote(prev.text));
  };

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
    setFilter((prev) => {
      const next = { ...prev, ...updates };
      if (updates.userScope) {
        syncBrowserHistory(activeTab, updates.userScope);
      }
      return next;
    });
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

  // If user is guest (not logged in) and not explicitly exploring yet, show the cheerful Medium-style GuestLandingPage
  if (!currentUser && !isGuestExploring) {
    return (
      <>
        <GuestLandingPage
          teamUsers={teamUsers}
          onSelectUserLogin={handleLoginSuccess}
          onOpenCustomLogin={() => setIsUserModalOpen(true)}
          onExploreAsGuest={() => {
            setIsGuestExploring(true);
            syncBrowserHistory('overview', 'all', true);
          }}
          totalLogsCount={logs.length}
        />

        {isUserModalOpen && (
          <UserLoginModal
            isOpen={isUserModalOpen}
            onClose={() => setIsUserModalOpen(false)}
            currentUser={currentUser}
            onLoginSuccess={handleLoginSuccess}
            onLogout={handleLogout}
          />
        )}

        {isSettingsOpen && (
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            logs={logs}
            onImportLogs={handleImportLogs}
            onResetSampleData={handleResetSampleData}
            onSupabaseStatusChange={loadData}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen flex bg-[var(--gh-bg)] text-[var(--gh-text-primary)] transition-colors">
      {/* Cheerful Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        filter={filter}
        onFilterChange={handleFilterUpdates}
        currentUser={currentUser}
        logsCount={logs.length}
        myLogsCount={currentUser ? logs.filter((l) => l.author_id === currentUser.id).length : 0}
        currentStreak={stats.currentStreak}
        onOpenNewEntry={handleOpenNewEntry}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenLogin={() => setIsUserModalOpen(true)}
        onLogout={handleLogout}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area (offset by sidebar width on desktop) */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        {/* Top Header */}
        <Header
          currentUser={currentUser}
          onOpenNewLog={handleOpenNewEntry}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenUserModal={() => setIsUserModalOpen(true)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
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
        ) : activeTab === 'quiz' ? (
          <QuizView
            logs={logs}
            categories={categoriesList}
            onSelectLog={setSelectedLog}
            onBackToHome={() => setActiveTab('overview')}
            onOpenNewLog={handleOpenNewEntry}
          />
        ) : (
          <>
            {/* Cheerful Time-Based Greeting & Random Motivational Quote Banner */}
            <div className="mb-6 p-4 sm:p-5 rounded-2xl border border-[var(--gh-border)] bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-indigo-500/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base sm:text-lg font-extrabold text-[var(--gh-text-primary)]">
                    {greetingInfo.greeting}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400">
                    🔥 {stats.currentStreak} Hari Streak
                  </span>
                </div>
                <div className="flex items-start gap-2 max-w-xl group">
                  <p className="text-xs text-[var(--gh-text-secondary)] font-medium leading-relaxed italic animate-in fade-in duration-300">
                    &ldquo;{currentQuote.text}&rdquo;{' '}
                    {currentQuote.author && (
                      <span className="not-italic text-[10px] font-bold text-emerald-600 dark:text-emerald-400 opacity-90">
                        — {currentQuote.author}
                      </span>
                    )}
                  </p>
                  <button
                    onClick={handleRefreshQuote}
                    className="p-1 rounded-full text-[var(--gh-text-tertiary)] hover:text-emerald-500 hover:bg-[var(--gh-surface)] transition-all cursor-pointer shrink-0"
                    title="Ganti quote motivasi baru"
                  >
                    <RefreshCw className="w-3 h-3 hover:rotate-180 transition-transform duration-300" />
                  </button>
                </div>
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

            {/* Guest Banner if exploring without login */}
            {!currentUser && (
              <div className="mb-6 p-4 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-base shrink-0">
                    👀
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-[var(--gh-text-primary)]">
                      Menjelajah dalam Mode Baca Publik
                    </div>
                    <div className="text-[11px] text-[var(--gh-text-secondary)] mt-0.5 font-medium">
                      Masuk ke akun tim untuk mulai mencatat materi baru, upload gambar, dan berdiskusi.
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsGuestExploring(false)}
                    className="px-3 py-1.5 rounded-full border border-[var(--gh-border)] bg-[var(--gh-surface)] hover:bg-[var(--gh-surface-hover)] text-[var(--gh-text-secondary)] font-bold text-xs transition-colors cursor-pointer"
                  >
                    Halaman Depan
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsUserModalOpen(true)}
                    className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-xs text-xs cursor-pointer"
                  >
                    <LogIn className="w-3 h-3" />
                    <span>Masuk Akun</span>
                  </button>
                </div>
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
            <span>&copy; {new Date().getFullYear()} Memora • Jurnal Belajar &amp; Active Recall</span>
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
      </div>

      {/* Floating Animated Memora Mascot Companion (Right Side) */}
      <MemoraMascot />

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
