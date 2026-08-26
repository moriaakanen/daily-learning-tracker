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
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create indexes for high performance search and filtering
CREATE INDEX IF NOT EXISTS idx_learning_logs_study_date ON public.learning_logs (study_date DESC);
CREATE INDEX IF NOT EXISTS idx_learning_logs_category ON public.learning_logs (category);
CREATE INDEX IF NOT EXISTS idx_learning_logs_tags ON public.learning_logs USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_learning_logs_created_at ON public.learning_logs (created_at DESC);

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_learning_logs_fts ON public.learning_logs 
USING GIN (to_tsvector('english', title || ' ' || content || ' ' || array_to_string(takeaways, ' ')));

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.learning_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Allow public read & write for simplicity (or scoped to authenticated users)
CREATE POLICY "Allow public read access on learning_logs" 
ON public.learning_logs FOR SELECT USING (true);

CREATE POLICY "Allow public insert on learning_logs" 
ON public.learning_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on learning_logs" 
ON public.learning_logs FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on learning_logs" 
ON public.learning_logs FOR DELETE USING (true);

CREATE POLICY "Allow public all on categories" 
ON public.categories FOR ALL USING (true);

-- 5. Insert Default Categories
INSERT INTO public.categories (name, color, icon) VALUES
    ('Frontend', '#38bdf8', 'Layout'),
    ('Backend', '#4ade80', 'Server'),
    ('Database', '#f59e0b', 'Database'),
    ('DevOps & Cloud', '#a855f7', 'Cloud'),
    ('AI & Machine Learning', '#ec4899', 'Brain'),
    ('Mobile Dev', '#06b6d4', 'Smartphone'),
    ('System Design', '#f97316', 'Cpu'),
    ('General / Concept', '#6366f1', 'BookOpen')
ON CONFLICT (name) DO NOTHING;

-- 6. Sample Initial Data (Optional)
INSERT INTO public.learning_logs (title, category, tags, takeaways, content, code_snippet, code_language, study_date, duration_minutes, is_favorite)
VALUES 
(
    'Understanding PostgreSQL Indexes & GIN Indexing',
    'Database',
    ARRAY['PostgreSQL', 'Indexing', 'Performance', 'SQL'],
    ARRAY['B-Tree is best for scalar comparison (=, <, >)', 'GIN is ideal for composite types like Arrays & Full-Text Search', 'Always check query cost with EXPLAIN ANALYZE'],
    'Hari ini mempelajari cara optimasi query PostgreSQL menggunakan indeks. Indeks GIN (Generalized Inverted Index) sangat efektif untuk kolom berupa Array tag atau pencarian teks (FTS).',
    'EXPLAIN ANALYZE SELECT * FROM learning_logs WHERE tags @> ARRAY[''PostgreSQL''];',
    'sql',
    CURRENT_DATE,
    45,
    true
)
ON CONFLICT DO NOTHING;
