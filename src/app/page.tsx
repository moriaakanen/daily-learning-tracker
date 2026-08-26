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
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // User Auth State
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [teamUsers, setTeamUsers] = useState<User[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

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
    return filterLogs(logs, filter, currentUser?.id);
  }, [logs, filter, currentUser]);

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
            onClick={() => {
              setFilter((prev) => ({ ...prev, userScope: 'all' }));
              setActiveTab('logs');
            }}
            className={`flex items-center gap-1.5 py-3 border-b-2 transition-colors ${
              activeTab === 'logs' && filter.userScope === 'all'
                ? 'border-[#fd8c73] text-[var(--gh-text-primary)]'
                : 'border-transparent text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)]'
            }`}
          >
            <Users className="w-4 h-4 text-[var(--gh-text-secondary)]" />
            <span>Feed Seluruh Tim</span>
            <span className="ml-1 bg-[var(--gh-badge-bg)] text-[var(--gh-text-secondary)] border border-[var(--gh-badge-border)] text-[10px] px-1.5 py-0.2 rounded-full">
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
            className={`flex items-center gap-1.5 py-3 border-b-2 transition-colors ${
              activeTab === 'logs' && filter.userScope === 'mine'
                ? 'border-[#fd8c73] text-[var(--gh-text-primary)]'
                : 'border-transparent text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)]'
            }`}
          >
            <UserIcon className="w-4 h-4 text-[var(--gh-text-secondary)]" />
            <span>Catatan Saya</span>
            {currentUser && (
              <span className="ml-1 bg-[var(--gh-badge-bg)] text-[var(--gh-text-secondary)] border border-[var(--gh-badge-border)] text-[10px] px-1.5 py-0.2 rounded-full">
                {logs.filter((l) => l.author_id === currentUser.id).length}
              </span>
            )}
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
            currentUser={currentUser}
            initialLog={editingLog}
            categories={categoriesList}
            onOpenLogin={() => setIsUserModalOpen(true)}
            onSave={handleCreateOrUpdateLog}
            onCancel={() => setActiveTab('overview')}
          />
        ) : (
          <>
            {/* Guest Banner if not logged in */}
            {!currentUser && (
              <div className="mb-6 p-4 rounded-lg border border-[var(--gh-border)] bg-[var(--gh-surface)] flex flex-wrap items-center justify-between gap-4 text-xs shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[var(--gh-badge-bg)] border border-[var(--gh-border)] flex items-center justify-center text-[var(--gh-accent)] shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-[var(--gh-text-primary)]">
                      Portal Pembelajaran Tim (Mode Tamu)
                    </div>
                    <div className="text-[11px] text-[var(--gh-text-secondary)] mt-0.5">
                      Silakan masuk dengan akun username dan password Anda untuk menulis catatan baru, upload gambar, dan memberi feedback.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#1f883d] hover:bg-[#1a7f37] text-white font-bold transition-all shadow-sm shrink-0 text-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Masuk ke Akun Anda</span>
                </button>
              </div>
            )}

            {/* Filter and search row */}
            <FilterBar
              filter={filter}
              onFilterChange={handleFilterUpdates}
              categories={categoriesList}
              teamUsers={teamUsers}
              currentUser={currentUser}
              onOpenLogin={() => setIsUserModalOpen(true)}
              totalResultsCount={filteredLogs.length}
            />

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
                    {filter.searchQuery || filter.selectedCategory !== 'All' || filter.selectedTag || filter.userScope !== 'all'
                      ? 'Coba bersihkan kata kunci atau sesuaikan filter untuk melihat catatan lain.'
                      : 'Mulai tulis hal bermanfaat yang kamu pelajari hari ini.'}
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
                  className="flex items-center gap-1.5 bg-[#1f883d] hover:bg-[#1a7f37] text-white text-xs font-semibold px-3.5 py-1.5 rounded-md shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    {filter.searchQuery || filter.selectedCategory !== 'All' || filter.selectedTag || filter.userScope !== 'all'
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
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredLogs.map((log) => (
                  <LogCard
                    key={log.id}
                    log={log}
                    currentUser={currentUser}
                    onSelect={setSelectedLog}
                    onEdit={handleEditEntry}
                    onDelete={handleDeleteLog}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
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
