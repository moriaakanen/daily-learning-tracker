'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Check,
  AlertCircle,
  Copy,
  Download,
  Upload,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  FileCode2,
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
        message: 'Kredensial dikosongkan. Aplikasi berjalan dalam mode LocalStorage (Offline).',
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
-- Daily Learning Journal - Supabase Database Schema
-- Run this SQL in your Supabase Project -> SQL Editor
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
    downloadAnchor.setAttribute('download', `daily-learning-backup-${new Date().toISOString().split('T')[0]}.json`);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Pengaturan Database & Backup
              </h2>
              <p className="text-xs text-slate-400">
                Integrasi Supabase Cloud & Sinkronisasi Data
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Supabase Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  Kredensial Supabase (PostgreSQL)
                </h3>
                <p className="text-xs text-slate-400">
                  Dapatkan URL & Anon Key dari Dashboard Supabase Anda (Project Settings &rarr; API)
                </p>
              </div>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <span>Buka Supabase</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://xyzabcdef.supabase.co"
                  className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Supabase Anon Key (Public)
                </label>
                <input
                  type="password"
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono"
                />
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                    testResult.success
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                  }`}
                >
                  {testResult.success ? (
                    <Check className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 transition-colors"
                >
                  <FileCode2 className="w-3.5 h-3.5" />
                  <span>{copiedSql ? 'SQL Schema Tersalin!' : 'Salin SQL Schema Table'}</span>
                </button>

                <button
                  type="button"
                  disabled={testing}
                  onClick={handleTestAndSave}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                  <span>{testing ? 'Menguji...' : 'Simpan & Uji Koneksi'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Backup & Export */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-100">
              Backup & Export Data
            </h3>
            <p className="text-xs text-slate-400">
              Unduh arsip catatan belajarmu dalam format JSON untuk backup mandiri.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleExportJSON}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-medium border border-slate-700 transition-colors"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Export Backup ({logs.length} Catatan)</span>
              </button>

              <label className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-medium border border-slate-700 transition-colors cursor-pointer">
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>Import Data JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Section 3: Reset */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-slate-300">
                Data Sample
              </h4>
              <p className="text-[11px] text-slate-500">
                Kembalikan catatan bawaan jika ingin memulai dari awal
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (confirm('Kembalikan sample catatan awal? Catatan saat ini akan ditimpa sample.')) {
                  onResetSampleData();
                  onClose();
                }
              }}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
            >
              Reset ke Sample Awal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
