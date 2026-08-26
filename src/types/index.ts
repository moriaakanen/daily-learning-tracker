export interface User {
  id: string;
  username: string;
  name: string;
  role?: string;
  avatar: string;
  password?: string;
}

export interface FeedbackItem {
  id: string;
  log_id: string;
  author_id: string;
  author_name: string;
  author_avatar: string;
  content: string;
  created_at: string;
}

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
  image_urls?: string[];
  card_color?: string; // Hex color code or 'auto'
  is_favorite?: boolean;
  author_id?: string;
  author_name?: string;
  author_avatar?: string;
  feedback?: FeedbackItem[];
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

export type UserScopeFilter = 'all' | 'mine' | string;

export interface FilterState {
  searchQuery: string;
  selectedCategory: string;
  selectedTag: string | null;
  dateFilter: DateFilter;
  userScope: UserScopeFilter;
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
