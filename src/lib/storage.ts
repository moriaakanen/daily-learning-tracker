import { LearningLog, Category, StatsSummary, FilterState } from '@/types';
import {
  fetchRemoteLogs,
  insertRemoteLog,
  updateRemoteLog,
  deleteRemoteLog,
  getSupabaseClient,
} from './supabase';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Teknologi & Coding', color: '#38bdf8', icon: 'Code' },
  { id: 'cat-2', name: 'Bisnis & Finansial', color: '#34d399', icon: 'TrendingUp' },
  { id: 'cat-3', name: 'Buku & Literasi', color: '#fbbf24', icon: 'BookOpen' },
  { id: 'cat-4', name: 'Bahasa & Komunikasi', color: '#a78bfa', icon: 'MessageSquare' },
  { id: 'cat-5', name: 'Sains & Psikologi', color: '#f472b6', icon: 'Brain' },
  { id: 'cat-6', name: 'Produktivitas & Habits', color: '#fb923c', icon: 'Zap' },
  { id: 'cat-7', name: 'Desain & Kreativitas', color: '#22d3ee', icon: 'Palette' },
  { id: 'cat-8', name: 'Kesehatan & Olahraga', color: '#4ade80', icon: 'Activity' },
  { id: 'cat-9', name: 'Wawasan Umum & Filosofi', color: '#818cf8', icon: 'Compass' },
];

export const INITIAL_LOGS: LearningLog[] = [
  {
    id: 'sample-1',
    title: 'Prinsip Pareto 80/20 dalam Efisiensi Kerja & Belajar',
    category: 'Produktivitas & Habits',
    tags: ['Produktivitas', 'TimeManagement', 'Mindset', 'SelfGrowth'],
    takeaways: [
      '80% hasil signifikan biasanya datang dari 20% usaha/fokus yang tepat sasaran',
      'Identifikasi tugas bernilai tinggi (High-Impact Tasks) di awal hari sebelum terdistraksi',
      'Berani mengeliminasi atau mendelegasikan 80% hal yang hanya menghasilkan dampak kecil',
    ],
    content: `## Ringkasan Konsep
Hari ini saya mempelajari kembali penerapan **Prinsip Pareto (Aturan 80/20)** karya ekonom Vilfredo Pareto. 

Dalam konteks belajar dan rutinitas harian, seringkali kita menghabiskan 80% energi untuk hal-hal sepele (tugas administratif, merapikan catatan berlebihan) yang hanya menyumbang 20% pemahaman.

### Langkah Praktis Penerapan:
1. **Audit Aktivitas Harian**: Tuliskan semua yang dikerjakan hari ini.
2. **Sorot 20% Inti**: Manakah 1-2 materi atau tindakan yang memberi pemahaman atau hasil terbesar?
3. **Deep Work**: Alokasikan waktu 60-90 menit tanpa distraksi untuk fokus penuh pada 20% tersebut.
`,
    study_date: new Date().toISOString().split('T')[0],
    duration_minutes: 45,
    is_favorite: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    title: 'Atomic Habits: Konsep 1% Lebih Baik Setiap Hari',
    category: 'Buku & Literasi',
    tags: ['Buku', 'Kebiasaan', 'JamesClear', 'Filosofi'],
    takeaways: [
      'Peningkatan 1% setiap hari menghasilkan 37 kali lipat kemajuan dalam kurun waktu 1 tahun (Compound Effect)',
      'Fokus pada sistem dan identitas diri, bukan hanya target angka',
      'Jadikan kebiasaan baru terlihat jelas (Make it obvious) dan mudah dilakukan (Make it easy)',
    ],
    content: `Catatan dari membaca bab awal **Atomic Habits**: Perubahan kecil yang konsisten jauh lebih berharga daripada ledakan motivasi sesaat yang cepat padam.`,
    study_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    duration_minutes: 30,
    is_favorite: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'sample-3',
    title: 'Dasar Investasi Indeks Saham (Index Fund / ETF) untuk Pemula',
    category: 'Bisnis & Finansial',
    tags: ['Finansial', 'Investasi', 'Ekonomi', 'LiterasiKeuangan'],
    takeaways: [
      'Index Fund menawarkan diversifikasi instan ke ratusan perusahaan dengan biaya (expense ratio) yang sangat rendah',
      'Dollar-Cost Averaging (DCA) melindungi dari risiko salah memperkirakan waktu pasar (timing the market)',
      'Kunci utama adalah jangka panjang (long-term compounding) dan disiplin alokasi aset',
    ],
    content: `Mempelajari instrumen investasi pasif berbasis indeks. Sangat cocok untuk mengamankan nilai uang dari inflasi tanpa perlu menganalisis laporan keuangan saham individu setiap hari.`,
    study_date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    duration_minutes: 40,
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
      const monthKey = log.study_date.substring(0, 7);
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
      if (filter.onlyFavorites && !log.is_favorite) return false;

      if (filter.selectedCategory && filter.selectedCategory !== 'All' && log.category !== filter.selectedCategory) {
        return false;
      }

      if (filter.selectedTag) {
        if (!log.tags || !log.tags.includes(filter.selectedTag)) return false;
      }

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
