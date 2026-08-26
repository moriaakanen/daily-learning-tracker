import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LearningLog, Category } from '@/types';

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
          message: 'Terkoneksi ke Supabase! Catatan: Tabel learning_logs belum dibuat, silakan jalankan SQL Schema di SQL Editor Supabase.'
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

  const { data, error } = await supabase
    .from('learning_logs')
    .select('*')
    .order('study_date', { ascending: false });

  if (error) {
    console.error('Error fetching logs from Supabase:', error);
    return null;
  }

  return data as LearningLog[];
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

export async function fetchRemoteCategories(): Promise<Category[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching categories from Supabase:', error);
    return null;
  }

  return data as Category[];
}
