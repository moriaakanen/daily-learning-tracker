export interface LearningLog {
  id: string;
  title: string;
  category: string;
  tags: string[];
  takeaways: string[];
  content: string;
  code_snippet?: string;
  code_language?: string;
  study_date: string; // YYYY-MM-DD
  duration_minutes: number;
  resource_urls?: string[];
  is_favorite?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export type ViewMode = 'grid' | 'timeline' | 'compact';

export type DateFilter = 'all' | 'today' | 'this-week' | 'this-month' | 'custom';

export interface FilterState {
  searchQuery: string;
  selectedCategory: string;
  selectedTag: string | null;
  dateFilter: DateFilter;
  startDate?: string;
  endDate?: string;
  onlyFavorites: boolean;
  sortBy: 'date-desc' | 'date-asc' | 'duration-desc' | 'title-asc';
}

export interface StatsSummary {
  totalLogs: number;
  totalHours: number;
  currentStreak: number;
  bestStreak: number;
  categoryCounts: Record<string, number>;
  tagCounts: Record<string, number>;
  monthlyHours: Record<string, number>;
  weeklyActivity: { date: string; count: number; hours: number }[];
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}
