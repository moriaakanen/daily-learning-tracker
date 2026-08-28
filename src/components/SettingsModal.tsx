'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  AlertCircle,
  Download,
  Upload,
  RefreshCw,
  ExternalLink,
  Copy,
  Database,
  ShieldCheck,
} from 'lucide-react';
import {
  getSupabaseCredentials,
  resetSupabaseClient,
  testSupabaseConnection,
} from '@/lib/supabase';
import { LearningLog } from '@/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: LearningLog[];
  onImportLogs: (imported: LearningLog[]) => void;
  onResetSampleData: () => void;
  onSupabaseStatusChange: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  logs,
  onImportLogs,
  onResetSampleData,
  onSupabaseStatusChange,
}: SettingsModalProps) {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const creds = getSupabaseCredentials();
      setUrl(creds.url);
      setAnonKey(creds.anonKey);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndSave = async () => {
    if (!url || !anonKey) {
      resetSupabaseClient('', '');
      setTestResult({
        success: false,
        message: 'Kredensial dikosongkan. Menggunakan penyimpanan lokal browser (LocalStorage).',
      });
      onSupabaseStatusChange();
      return;
    }

    setTesting(true);
    setTestResult(null);

    const result = await testSupabaseConnection(url.trim(), anonKey.trim());
    setTesting(false);
    setTestResult(result);

    if (result.success) {
      resetSupabaseClient(url.trim(), anonKey.trim());
      onSupabaseStatusChange();
    }
  };

  const handleCopySql = () => {
    const sql = `-- ================================================================
-- Memora - Supabase Database Schema
-- ================================================================

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT '#6366f1',
    icon TEXT NOT NULL DEFAULT 'BookOpen',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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
    card_color TEXT DEFAULT 'auto',
    author_id TEXT,
    author_name TEXT,
    author_avatar TEXT,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learning_logs_study_date ON public.learning_logs (study_date DESC);
CREATE INDEX IF NOT EXISTS idx_learning_logs_category ON public.learning_logs (category);
CREATE INDEX IF NOT EXISTS idx_learning_logs_tags ON public.learning_logs USING GIN (tags);

ALTER TABLE public.learning_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on learning_logs" ON public.learning_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert on learning_logs" ON public.learning_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on learning_logs" ON public.learning_logs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on learning_logs" ON public.learning_logs FOR DELETE USING (true);
CREATE POLICY "Allow public all on categories" ON public.categories FOR ALL USING (true);`;

    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `memora-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            onImportLogs(parsed);
            alert(`Berhasil mengimpor ${parsed.length} catatan belajar!`);
            onClose();
          } else {
            alert('Format file JSON tidak valid.');
          }
        } catch {
          alert('Gagal membaca file JSON.');
        }
      };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-lg rounded-md border border-[var(--gh-border)] bg-[var(--gh-bg)] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--gh-border)] bg-[var(--gh-surface)]">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[var(--gh-accent)]" />
            <div>
              <h2 className="text-sm font-semibold text-[var(--gh-text-primary)]">
                Repository Settings & Database
              </h2>
              <p className="text-[11px] text-[var(--gh-text-secondary)]">
                Manage Supabase PostgreSQL sync and data backups
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--gh-surface-hover)] text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
          {/* Supabase Config */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[var(--gh-text-primary)] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Supabase Credentials
              </span>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-[var(--gh-accent)] hover:underline flex items-center gap-1 text-[11px]"
              >
                <span>Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-2">
              <div className="space-y-1">
                <label className="text-[11px] text-[var(--gh-text-secondary)]">
                  Project URL
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://xyzabcdef.supabase.co"
                  className="w-full bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md px-2.5 py-1.5 text-xs text-[var(--gh-text-primary)] placeholder-[var(--gh-text-tertiary)] focus:outline-none focus:border-[var(--gh-accent)] font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-[var(--gh-text-secondary)]">
                  Anon Public Key
                </label>
                <input
                  type="password"
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="sb_publishable_..."
                  className="w-full bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md px-2.5 py-1.5 text-xs text-[var(--gh-text-primary)] placeholder-[var(--gh-text-tertiary)] focus:outline-none focus:border-[var(--gh-accent)] font-mono"
                />
              </div>

              {testResult && (
                <div
                  className={`p-2.5 rounded-md text-xs flex items-start gap-2 border ${
                    testResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                  }`}
                >
                  {testResult.success ? (
                    <Check className="w-3.5 h-3.5 shrink-0 text-emerald-500 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500 mt-0.5" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] bg-[var(--gh-surface)] border border-[var(--gh-border)] px-2.5 py-1 rounded-md text-[11px] transition-colors flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedSql ? 'Copied' : 'Copy SQL Schema'}</span>
                </button>

                <button
                  type="button"
                  disabled={testing}
                  onClick={handleTestAndSave}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#1f883d] hover:bg-[#1a7f37] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${testing ? 'animate-spin' : ''}`} />
                  <span>{testing ? 'Testing...' : 'Save & Test'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Backup Section */}
          <div className="pt-4 border-t border-[var(--gh-border)] space-y-2">
            <span className="font-semibold text-[var(--gh-text-primary)]">
              Data Export & Backup
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportJSON}
                className="flex items-center gap-1.5 border border-[var(--gh-border)] bg-[var(--gh-surface)] hover:bg-[var(--gh-surface-hover)] text-[var(--gh-text-primary)] px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[var(--gh-accent)]" />
                <span>Export JSON ({logs.length})</span>
              </button>

              <label className="flex items-center gap-1.5 border border-[var(--gh-border)] bg-[var(--gh-surface)] hover:bg-[var(--gh-surface-hover)] text-[var(--gh-text-primary)] px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-[var(--gh-accent)]" />
                <span>Import JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Reset Section */}
          <div className="pt-3 border-t border-[var(--gh-border)] flex items-center justify-between text-[var(--gh-text-secondary)]">
            <span>Reset to default sample entries:</span>
            <button
              type="button"
              onClick={() => {
                if (confirm('Reset to initial sample notes?')) {
                  onResetSampleData();
                  onClose();
                }
              }}
              className="text-[var(--gh-text-secondary)] hover:text-rose-500 transition-colors"
            >
              Reset Sample
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
