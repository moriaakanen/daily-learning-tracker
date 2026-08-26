import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LearningLog, Category, FeedbackItem } from '@/types';

let cachedClient: SupabaseClient | null = null;

export function getSupabaseCredentials(): { url: string; anonKey: string } {
  if (typeof window !== 'undefined') {
    const savedUrl = localStorage.getItem('supabase_url');
    const savedKey = localStorage.getItem('supabase_anon_key');
    if (savedUrl && savedKey) {
      return { url: savedUrl, anonKey: savedKey };
    }
  }
  
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return { url: envUrl, anonKey: envKey };
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();
  
  if (!url || !anonKey || url.includes('your-project-id')) {
    return null;
  }

  if (!cachedClient) {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return cachedClient;
}

export function resetSupabaseClient(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    if (url && anonKey) {
      localStorage.setItem('supabase_url', url);
      localStorage.setItem('supabase_anon_key', anonKey);
      cachedClient = createClient(url, anonKey);
    } else {
      localStorage.removeItem('supabase_url');
      localStorage.removeItem('supabase_anon_key');
      cachedClient = null;
    }
  }
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const testClient = createClient(url, anonKey);
    const { error } = await testClient.from('learning_logs').select('count', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation "public.learning_logs" does not exist')) {
        return {
          success: true,
          message: 'Terkoneksi ke Supabase! Catatan: Jalankan SQL Schema di SQL Editor Supabase untuk membuat tabel.'
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

  const { data, error } = await supabase
    .from('learning_logs')
    .insert([log])
    .select()
    .single();

  if (error) {
    console.error('Error inserting log into Supabase:', error);
    throw error;
  }

  return data as LearningLog;
}

export async function updateRemoteLog(id: string, updates: Partial<LearningLog>): Promise<LearningLog | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('learning_logs')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating log in Supabase:', error);
    throw error;
  }

  return data as LearningLog;
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
