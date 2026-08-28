import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LearningLog, FeedbackItem } from '@/types';

const SUPABASE_URL_KEY = 'daily_learning_supabase_url';
const SUPABASE_ANON_KEY = 'daily_learning_supabase_anon_key';

let cachedClient: SupabaseClient | null = null;

export function getSupabaseCredentials(): { url: string; anonKey: string } {
  if (typeof window === 'undefined') {
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    };
  }

  const localUrl = localStorage.getItem(SUPABASE_URL_KEY);
  const localAnon = localStorage.getItem(SUPABASE_ANON_KEY);

  return {
    url: localUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: localAnon || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  };
}

export function saveSupabaseCredentials(url: string, anonKey: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SUPABASE_URL_KEY, url.trim());
  localStorage.setItem(SUPABASE_ANON_KEY, anonKey.trim());
  cachedClient = null; // Invalidate cache
}

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const { url, anonKey } = getSupabaseCredentials();
  if (!url || !anonKey) return null;

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
      },
    });
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export function resetSupabaseClient(url: string, anonKey: string): SupabaseClient | null {
  saveSupabaseCredentials(url, anonKey);
  return getSupabaseClient();
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!url || !anonKey) {
      return { success: false, message: 'URL dan Anon Key tidak boleh kosong.' };
    }

    const testClient = createClient(url, anonKey);
    const { error } = await testClient.from('learning_logs').select('id').limit(1);

    if (error) {
      if (error.code === '42P01') {
        return {
          success: true,
          message: 'Terkoneksi ke Supabase! Catatan: Jalankan SQL Schema di SQL Editor Supabase untuk membuat tabel.',
        };
      }
      return { success: false, message: `Error Supabase: ${error.message}` };
    }

    return { success: true, message: 'Koneksi ke Supabase berhasil dan tabel siap digunakan!' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Koneksi gagal: ${msg}` };
  }
}

/**
 * Strips UI-only properties (like nested feedback arrays) before sending to Supabase learning_logs table
 */
function cleanLogForSupabase(logData: Partial<LearningLog>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};

  if (logData.title !== undefined) cleaned.title = logData.title;
  if (logData.category !== undefined) cleaned.category = logData.category;
  if (logData.tags !== undefined) cleaned.tags = logData.tags || [];
  if (logData.takeaways !== undefined) cleaned.takeaways = logData.takeaways || [];
  if (logData.content !== undefined) cleaned.content = logData.content;
  if (logData.code_snippet !== undefined) cleaned.code_snippet = logData.code_snippet;
  if (logData.code_language !== undefined) cleaned.code_language = logData.code_language;
  if (logData.study_date !== undefined) cleaned.study_date = logData.study_date;
  if (logData.duration_minutes !== undefined) cleaned.duration_minutes = logData.duration_minutes;
  if (logData.resource_urls !== undefined) cleaned.resource_urls = logData.resource_urls || [];
  if (logData.is_favorite !== undefined) cleaned.is_favorite = logData.is_favorite;
  if (logData.card_color !== undefined) cleaned.card_color = logData.card_color;
  if (logData.image_urls !== undefined) cleaned.image_urls = logData.image_urls;
  if (logData.author_id !== undefined) cleaned.author_id = logData.author_id;
  if (logData.author_name !== undefined) cleaned.author_name = logData.author_name;
  if (logData.author_avatar !== undefined) cleaned.author_avatar = logData.author_avatar;

  return cleaned;
}

// Data API Layer
export async function fetchRemoteLogs(): Promise<LearningLog[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data: logsData, error: logsError } = await supabase
      .from('learning_logs')
      .select('*')
      .order('study_date', { ascending: false });

    if (logsError) {
      console.error('Error fetching logs from Supabase:', logsError);
      return null;
    }

    // Try fetching feedbacks
    const { data: feedbacksData } = await supabase
      .from('learning_feedback')
      .select('*')
      .order('created_at', { ascending: true });

    const feedbackMap = new Map<string, FeedbackItem[]>();
    if (feedbacksData) {
      feedbacksData.forEach((fb: FeedbackItem) => {
        const list = feedbackMap.get(fb.log_id) || [];
        list.push(fb);
        feedbackMap.set(fb.log_id, list);
      });
    }

    const merged = logsData.map((log: LearningLog) => ({
      ...log,
      feedback: feedbackMap.get(log.id) || log.feedback || [],
    }));

    return merged as LearningLog[];
  } catch (err) {
    console.error('Error in fetchRemoteLogs:', err);
    return null;
  }
}

export async function insertRemoteLog(log: Omit<LearningLog, 'id' | 'created_at' | 'updated_at'>): Promise<LearningLog | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const payload = cleanLogForSupabase(log);

  try {
    const { data, error } = await supabase
      .from('learning_logs')
      .insert([payload])
      .select()
      .single();

    if (error) {
      // Fallback: If custom columns like card_color don't exist yet, retry with standard core columns
      console.warn('Initial insert with full payload failed, retrying with core columns:', error);
      const corePayload = {
        title: log.title,
        category: log.category,
        tags: log.tags || [],
        takeaways: log.takeaways || [],
        content: log.content,
        code_snippet: log.code_snippet,
        code_language: log.code_language,
        study_date: log.study_date,
        duration_minutes: log.duration_minutes,
        is_favorite: log.is_favorite,
      };
      const { data: retryData, error: retryError } = await supabase
        .from('learning_logs')
        .insert([corePayload])
        .select()
        .single();

      if (retryError) {
        console.error('Retry insert also failed:', retryError);
        throw retryError;
      }
      return retryData as LearningLog;
    }

    return data as LearningLog;
  } catch (err) {
    console.error('Error inserting log into Supabase:', err);
    throw err;
  }
}

export async function updateRemoteLog(id: string, updates: Partial<LearningLog>): Promise<LearningLog | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const payload = {
    ...cleanLogForSupabase(updates),
    updated_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('learning_logs')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.warn('Initial update failed, retrying with core fields:', error);
      // Fallback: retry with only core fields (title, category, content, study_date, duration_minutes, is_favorite, etc)
      const corePayload: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (updates.title !== undefined) corePayload.title = updates.title;
      if (updates.category !== undefined) corePayload.category = updates.category;
      if (updates.tags !== undefined) corePayload.tags = updates.tags;
      if (updates.takeaways !== undefined) corePayload.takeaways = updates.takeaways;
      if (updates.content !== undefined) corePayload.content = updates.content;
      if (updates.study_date !== undefined) corePayload.study_date = updates.study_date;
      if (updates.duration_minutes !== undefined) corePayload.duration_minutes = updates.duration_minutes;
      if (updates.is_favorite !== undefined) corePayload.is_favorite = updates.is_favorite;

      const { data: retryData, error: retryError } = await supabase
        .from('learning_logs')
        .update(corePayload)
        .eq('id', id)
        .select()
        .single();

      if (retryError) {
        console.error('Retry update also failed:', retryError);
        throw retryError;
      }
      return retryData as LearningLog;
    }

    return data as LearningLog;
  } catch (err) {
    console.error('Error updating log in Supabase:', err);
    throw err;
  }
}

export async function deleteRemoteLog(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from('learning_logs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting log in Supabase:', error);
    throw error;
  }

  return true;
}

export async function insertRemoteFeedback(feedback: Omit<FeedbackItem, 'id' | 'created_at'>): Promise<FeedbackItem | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('learning_feedback')
      .insert([feedback])
      .select()
      .single();

    if (error) {
      console.warn('Error inserting feedback to Supabase, will save locally:', error);
      return null;
    }
    return data as FeedbackItem;
  } catch (err) {
    console.warn('Feedback table might not exist yet:', err);
    return null;
  }
}
