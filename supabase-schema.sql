-- ================================================================
-- Daily Learning Journal - Supabase Database Schema
-- Run this SQL in your Supabase Project -> SQL Editor
-- ================================================================

-- 1. Create table for Categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT '#6366f1',
    icon TEXT NOT NULL DEFAULT 'BookOpen',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create table for Learning Logs
CREATE TABLE IF NOT EXISTS public.learning_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    tags TEXT[] DEFAULT '{}',
    takeaways TEXT[] DEFAULT '{}',
    content TEXT NOT NULL DEFAULT '',
    code_snippet TEXT,
    code_language TEXT DEFAULT 'javascript',
    study_date DATE NOT NULL DEFAULT CURRENT_DATE,
    duration_minutes INTEGER DEFAULT 30,
    resource_urls TEXT[] DEFAULT '{}',
    image_urls TEXT[] DEFAULT '{}',
    is_favorite BOOLEAN DEFAULT false,
    author_id TEXT DEFAULT 'user-1',
    author_name TEXT DEFAULT 'Moria Akanen',
    author_avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create table for Feedback / Comments
CREATE TABLE IF NOT EXISTS public.learning_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_id UUID REFERENCES public.learning_logs(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_avatar TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Alter columns in case table already exists
ALTER TABLE public.learning_logs ADD COLUMN IF NOT EXISTS author_id TEXT DEFAULT 'user-1';
ALTER TABLE public.learning_logs ADD COLUMN IF NOT EXISTS author_name TEXT DEFAULT 'Moria Akanen';
ALTER TABLE public.learning_logs ADD COLUMN IF NOT EXISTS author_avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
ALTER TABLE public.learning_logs ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_learning_logs_study_date ON public.learning_logs (study_date DESC);
CREATE INDEX IF NOT EXISTS idx_learning_logs_category ON public.learning_logs (category);
CREATE INDEX IF NOT EXISTS idx_learning_logs_author_id ON public.learning_logs (author_id);
CREATE INDEX IF NOT EXISTS idx_learning_logs_tags ON public.learning_logs USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_feedback_log_id ON public.learning_feedback (log_id);

-- Full text search index on title & content
CREATE INDEX IF NOT EXISTS idx_learning_logs_fts ON public.learning_logs 
USING GIN (to_tsvector('english'::regconfig, coalesce(title, '') || ' ' || coalesce(content, '')));

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.learning_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_feedback ENABLE ROW LEVEL SECURITY;

-- Allow public read & write policies
CREATE POLICY "Allow public read access on learning_logs" ON public.learning_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert on learning_logs" ON public.learning_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on learning_logs" ON public.learning_logs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on learning_logs" ON public.learning_logs FOR DELETE USING (true);
CREATE POLICY "Allow public all on categories" ON public.categories FOR ALL USING (true);
CREATE POLICY "Allow public all on learning_feedback" ON public.learning_feedback FOR ALL USING (true);

-- 7. Insert Default Universal Categories
INSERT INTO public.categories (name, color, icon) VALUES
    ('Teknologi & Coding', '#38bdf8', 'Code'),
    ('Bisnis & Finansial', '#34d399', 'TrendingUp'),
    ('Buku & Literasi', '#fbbf24', 'BookOpen'),
    ('Bahasa & Komunikasi', '#a78bfa', 'MessageSquare'),
    ('Sains & Psikologi', '#f472b6', 'Brain'),
    ('Produktivitas & Habits', '#fb923c', 'Zap'),
    ('Desain & Kreativitas', '#22d3ee', 'Palette'),
    ('Kesehatan & Olahraga', '#4ade80', 'Activity'),
    ('Wawasan Umum & Filosofi', '#818cf8', 'Compass')
ON CONFLICT (name) DO NOTHING;
