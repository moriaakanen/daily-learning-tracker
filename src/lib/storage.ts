import { LearningLog, Category, StatsSummary, FilterState } from '@/types';
import {
  fetchRemoteLogs,
  insertRemoteLog,
  updateRemoteLog,
  deleteRemoteLog,
  getSupabaseClient,
} from './supabase';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Frontend', color: '#38bdf8', icon: 'Layout' },
  { id: 'cat-2', name: 'Backend', color: '#4ade80', icon: 'Server' },
  { id: 'cat-3', name: 'Database', color: '#f59e0b', icon: 'Database' },
  { id: 'cat-4', name: 'DevOps & Cloud', color: '#a855f7', icon: 'Cloud' },
  { id: 'cat-5', name: 'AI & Machine Learning', color: '#ec4899', icon: 'Brain' },
  { id: 'cat-6', name: 'Mobile Dev', color: '#06b6d4', icon: 'Smartphone' },
  { id: 'cat-7', name: 'System Design', color: '#f97316', icon: 'Cpu' },
  { id: 'cat-8', name: 'General / Concept', color: '#6366f1', icon: 'BookOpen' },
];

export const INITIAL_LOGS: LearningLog[] = [
  {
    id: 'sample-1',
    title: 'Optimasi Query PostgreSQL & Pembuatan GIN Index',
    category: 'Database',
    tags: ['PostgreSQL', 'Indexing', 'SQL', 'Performance'],
    takeaways: [
      'B-Tree cocok untuk operator perbandingan skalar (=, <, >, BETWEEN)',
      'GIN Index sangat efisien untuk kolom tipe Array, JSONB, dan Full-Text Search',
      'Gunakan EXPLAIN (ANALYZE, BUFFERS) untuk menganalisis waktu eksekusi aktual',
    ],
    content: `## Apa yang Dipelajari Hari Ini?
Hari ini saya mendalami cara kerja indexing pada **PostgreSQL**, terutama perbedaan antara indeks default *B-Tree* dan *GIN (Generalized Inverted Index)*.

### Mengapa GIN Index Penting?
Ketika kita memiliki kolom berstruktur data multi-nilai seperti \`tags TEXT[]\` atau dokumen \`jsonb\`, pencarian menggunakan operator containment (\`@>\`) akan sangat lambat jika memakai sequential scan. Dengan GIN index, PostgreSQL membuat inverted index pemetaan tiap elemen ke row pointer.

### Contoh Implementasi:
\`\`\`sql
CREATE INDEX idx_logs_tags ON learning_logs USING GIN (tags);
SELECT * FROM learning_logs WHERE tags @> ARRAY['PostgreSQL'];
\`\`\`
`,
    code_snippet: `CREATE INDEX idx_logs_tags ON learning_logs USING GIN (tags);\nEXPLAIN ANALYZE SELECT * FROM learning_logs WHERE tags @> ARRAY['PostgreSQL'];`,
    code_language: 'sql',
    study_date: new Date().toISOString().split('T')[0],
    duration_minutes: 50,
    is_favorite: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    title: 'React 19 Server Actions & Optimistic Updates',
    category: 'Frontend',
    tags: ['React', 'Next.js', 'Server Actions', 'UI/UX'],
    takeaways: [
      'useActionState mempermudah penanganan loading, error, dan data balikan dari server action',
      'useOptimistic memberikan instant feedback ke user sebelum response server selesai',
      'Mengurangi kebutuhan boilerplate global state untuk mutasi sederhana',
    ],
    content: `Mempelajari paradigma mutasi data modern di **Next.js App Router** menggunakan *Server Actions*. Fitur hook seperti \`useOptimistic\` membuat aplikasi terasa sangat responsif dan instan.`,
    study_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    duration_minutes: 40,
    is_favorite: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'sample-3',
    title: 'Arsitektur Event-Driven dengan Redis Streams',
    category: 'Backend',
    tags: ['Redis', 'Event-Driven', 'Microservices', 'Architecture'],
    takeaways: [
      'Redis Streams menyediakan data structure append-only log mirip Apache Kafka namun lebih ringan',
      'Consumer Groups memungkinkan pendistribusian pesan ke multiple worker secara otomatis',
      'XACK digunakan untuk konfirmasi pemrosesan pesan agar tidak hilang jika terjadi crash',
    ],
    content: `Eksplorasi penggunaan **Redis Streams** untuk messaging queue antar microservices. Sangat cocok untuk asynchronous job processing dengan throughput tinggi dan latency rendah.`,
    study_date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    duration_minutes: 60,
    is_favorite: false,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

const LOCAL_STORAGE_KEY = 'daily_learning_logs_data';
const CATEGORIES_KEY = 'daily_learning_categories';

export function getLocalLogs(): LearningLog[] {
  if (typeof window === 'undefined') return INITIAL_LOGS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_LOGS));
      return INITIAL_LOGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading localStorage logs', e);
    return INITIAL_LOGS;
  }
}

export function saveLocalLogs(logs: LearningLog[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Error saving logs to localStorage', e);
  }
}

export function getLocalCategories(): Category[] {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES;
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    if (!raw) {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading categories from localStorage', e);
    return DEFAULT_CATEGORIES;
  }
}

export function saveLocalCategories(categories: Category[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  } catch (e) {
    console.error('Error saving categories to localStorage', e);
  }
}

// Unified Service Layer (Supabase + Local fallback)
export async function getAllLogs(): Promise<LearningLog[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const remote = await fetchRemoteLogs();
      if (remote && remote.length > 0) {
        saveLocalLogs(remote);
        return remote;
      }
    } catch (err) {
      console.warn('Failed fetching from Supabase, falling back to local storage', err);
    }
  }
  return getLocalLogs();
}

export async function createLog(newLog: Omit<LearningLog, 'id' | 'created_at' | 'updated_at'>): Promise<LearningLog> {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();
  
  if (supabase) {
    try {
      const created = await insertRemoteLog(newLog);
      if (created) {
        const local = getLocalLogs();
        saveLocalLogs([created, ...local.filter((l) => l.id !== created.id)]);
        return created;
      }
    } catch (err) {
      console.warn('Failed inserting to Supabase, saving locally', err);
    }
  }

  const fallbackLog: LearningLog = {
    ...newLog,
    id: 'local-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
    created_at: now,
    updated_at: now,
  };

  const local = getLocalLogs();
  const updated = [fallbackLog, ...local];
  saveLocalLogs(updated);
  return fallbackLog;
}

export async function updateLog(id: string, updates: Partial<LearningLog>): Promise<LearningLog> {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  if (supabase && !id.startsWith('local-') && !id.startsWith('sample-')) {
    try {
      const remoteUpdated = await updateRemoteLog(id, updates);
      if (remoteUpdated) {
        const local = getLocalLogs();
        const nextLogs = local.map((l) => (l.id === id ? remoteUpdated : l));
        saveLocalLogs(nextLogs);
        return remoteUpdated;
      }
    } catch (err) {
      console.warn('Failed updating on Supabase, applying locally', err);
    }
  }

  const local = getLocalLogs();
  let updatedItem: LearningLog | undefined;
  const nextLogs = local.map((l) => {
    if (l.id === id) {
      updatedItem = { ...l, ...updates, updated_at: now };
      return updatedItem;
    }
    return l;
  });

  saveLocalLogs(nextLogs);
  return updatedItem || { ...local[0], ...updates };
}

export async function deleteLog(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  if (supabase && !id.startsWith('local-') && !id.startsWith('sample-')) {
    try {
      await deleteRemoteLog(id);
    } catch (err) {
      console.warn('Failed deleting from Supabase, removing locally', err);
    }
  }

  const local = getLocalLogs();
  const filtered = local.filter((l) => l.id !== id);
  saveLocalLogs(filtered);
  return true;
}

// Analytics and Streaks
export function calculateStats(logs: LearningLog[]): StatsSummary {
  const totalLogs = logs.length;
  let totalMinutes = 0;
  const categoryCounts: Record<string, number> = {};
  const tagCounts: Record<string, number> = {};
  const monthlyHours: Record<string, number> = {};
  const dateSet = new Set<string>();

  logs.forEach((log) => {
    const mins = Number(log.duration_minutes) || 30;
    totalMinutes += mins;

    // Categories
    const cat = log.category || 'General';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

    // Tags
    if (Array.isArray(log.tags)) {
      log.tags.forEach((tag) => {
        const t = tag.trim();
        if (t) tagCounts[t] = (tagCounts[t] || 0) + 1;
      });
    }

    // Monthly hours
    if (log.study_date) {
      dateSet.add(log.study_date);
      const monthKey = log.study_date.substring(0, 7); // YYYY-MM
      monthlyHours[monthKey] = (monthlyHours[monthKey] || 0) + mins / 60;
    }
  });

  // Calculate Streak
  const sortedDates = Array.from(dateSet).sort().reverse();
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const hasStudiedToday = dateSet.has(today);
  const hasStudiedYesterday = dateSet.has(yesterday);

  if (hasStudiedToday || hasStudiedYesterday) {
    let checkDate = new Date(hasStudiedToday ? today : yesterday);
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (dateSet.has(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Max streak calculation
  const allAscending = Array.from(dateSet).sort();
  for (let i = 0; i < allAscending.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = new Date(allAscending[i - 1]);
      const curr = new Date(allAscending[i]);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    bestStreak = Math.max(bestStreak, tempStreak);
  }
  bestStreak = Math.max(bestStreak, currentStreak);

  // 7 days weekly activity
  const weeklyActivity: { date: string; count: number; hours: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
    const dayLogs = logs.filter((l) => l.study_date === d);
    const dayMins = dayLogs.reduce((acc, curr) => acc + (Number(curr.duration_minutes) || 0), 0);
    weeklyActivity.push({
      date: d,
      count: dayLogs.length,
      hours: Math.round((dayMins / 60) * 10) / 10,
    });
  }

  return {
    totalLogs,
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    currentStreak,
    bestStreak,
    categoryCounts,
    tagCounts,
    monthlyHours,
    weeklyActivity,
  };
}

// Filter and Search Logic
export function filterLogs(logs: LearningLog[], filter: FilterState): LearningLog[] {
  return logs
    .filter((log) => {
      // Favorite filter
      if (filter.onlyFavorites && !log.is_favorite) return false;

      // Category filter
      if (filter.selectedCategory && filter.selectedCategory !== 'All' && log.category !== filter.selectedCategory) {
        return false;
      }

      // Tag filter
      if (filter.selectedTag) {
        if (!log.tags || !log.tags.includes(filter.selectedTag)) return false;
      }

      // Date filter
      if (filter.dateFilter !== 'all') {
        const today = new Date().toISOString().split('T')[0];
        const logDate = log.study_date;

        if (filter.dateFilter === 'today') {
          if (logDate !== today) return false;
        } else if (filter.dateFilter === 'this-week') {
          const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
          if (logDate < sevenDaysAgo || logDate > today) return false;
        } else if (filter.dateFilter === 'this-month') {
          const firstDayOfMonth = today.substring(0, 8) + '01';
          if (logDate < firstDayOfMonth || logDate > today) return false;
        } else if (filter.dateFilter === 'custom') {
          if (filter.startDate && logDate < filter.startDate) return false;
          if (filter.endDate && logDate > filter.endDate) return false;
        }
      }

      // Search query (full-text search on title, tags, takeaways, content)
      if (filter.searchQuery.trim()) {
        const query = filter.searchQuery.toLowerCase().trim();
        const matchTitle = log.title?.toLowerCase().includes(query);
        const matchContent = log.content?.toLowerCase().includes(query);
        const matchCategory = log.category?.toLowerCase().includes(query);
        const matchTags = log.tags?.some((t) => t.toLowerCase().includes(query));
        const matchTakeaways = log.takeaways?.some((tw) => tw.toLowerCase().includes(query));

        if (!matchTitle && !matchContent && !matchCategory && !matchTags && !matchTakeaways) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      if (filter.sortBy === 'date-desc') {
        return (b.study_date || '').localeCompare(a.study_date || '') || (b.created_at || '').localeCompare(a.created_at || '');
      } else if (filter.sortBy === 'date-asc') {
        return (a.study_date || '').localeCompare(b.study_date || '') || (a.created_at || '').localeCompare(b.created_at || '');
      } else if (filter.sortBy === 'duration-desc') {
        return (b.duration_minutes || 0) - (a.duration_minutes || 0);
      } else if (filter.sortBy === 'title-asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });
}
