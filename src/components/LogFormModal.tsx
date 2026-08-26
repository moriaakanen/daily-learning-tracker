'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  X,
  Plus,
  Trash2,
  Star,
} from 'lucide-react';
import { LearningLog } from '@/types';

interface LogFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (log: Omit<LearningLog, 'id' | 'created_at' | 'updated_at'>, existingId?: string) => void;
  initialLog?: LearningLog | null;
  categories: string[];
}

export function LogFormModal({
  isOpen,
  onClose,
  onSave,
  initialLog,
  categories,
}: LogFormModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Frontend');
  const [studyDate, setStudyDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState(30);
  const [takeaways, setTakeaways] = useState<string[]>(['']);
  const [content, setContent] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

  useEffect(() => {
    if (initialLog) {
      setTitle(initialLog.title || '');
      setCategory(initialLog.category || 'Frontend');
      setStudyDate(initialLog.study_date || new Date().toISOString().split('T')[0]);
      setDuration(initialLog.duration_minutes || 30);
      setTakeaways(initialLog.takeaways?.length ? initialLog.takeaways : ['']);
      setContent(initialLog.content || '');
      setCodeSnippet(initialLog.code_snippet || '');
      setCodeLanguage(initialLog.code_language || 'javascript');
      setTags(initialLog.tags || []);
      setIsFavorite(!!initialLog.is_favorite);
    } else {
      setTitle('');
      setCategory('Frontend');
      setStudyDate(new Date().toISOString().split('T')[0]);
      setDuration(30);
      setTakeaways(['']);
      setContent('');
      setCodeSnippet('');
      setCodeLanguage('javascript');
      setTags([]);
      setIsFavorite(false);
    }
  }, [initialLog, isOpen]);

  if (!isOpen) return null;

  const handleAddTakeaway = () => {
    setTakeaways([...takeaways, '']);
  };

  const handleUpdateTakeaway = (index: number, val: string) => {
    const updated = [...takeaways];
    updated[index] = val;
    setTakeaways(updated);
  };

  const handleRemoveTakeaway = (index: number) => {
    if (takeaways.length === 1) {
      setTakeaways(['']);
      return;
    }
    setTakeaways(takeaways.filter((_, i) => i !== index));
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^#/, '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Mohon isi judul materi belajar.');
      return;
    }

    const cleanTakeaways = takeaways.map((t) => t.trim()).filter(Boolean);

    onSave(
      {
        title: title.trim(),
        category,
        study_date: studyDate,
        duration_minutes: Number(duration) || 30,
        takeaways: cleanTakeaways,
        content: content.trim(),
        code_snippet: codeSnippet.trim() || undefined,
        code_language: codeLanguage,
        tags,
        is_favorite: isFavorite,
      },
      initialLog?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-zinc-950/50">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              {initialLog ? 'Edit Catatan' : 'Catatan Baru'}
            </h2>
            <p className="text-[11px] text-zinc-400">
              Dokumentasikan apa yang kamu pelajari hari ini
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300">
              Judul Materi <span className="text-rose-400">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Memahami Arsitektur Event-Driven dengan Redis"
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
              />
              <button
                type="button"
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2 rounded-lg border transition-colors ${
                  isFavorite
                    ? 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                }`}
                title="Favorit"
              >
                <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Meta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-zinc-600 cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-zinc-900">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Tanggal</label>
              <input
                type="date"
                value={studyDate}
                onChange={(e) => setStudyDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-zinc-600"
              />
            </div>

            {/* Duration */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Durasi (Menit)</label>
              <input
                type="number"
                min="5"
                step="5"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-zinc-600"
              />
            </div>
          </div>

          {/* Key Takeaways */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-300">
                Poin Kunci / Kesimpulan Inti
              </label>
              <button
                type="button"
                onClick={handleAddTakeaway}
                className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Tambah Poin
              </button>
            </div>

            <div className="space-y-1.5">
              {takeaways.map((point, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 w-4 text-center font-mono">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => handleUpdateTakeaway(index, e.target.value)}
                    placeholder={`Poin penting ke-${index + 1}...`}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveTakeaway(index)}
                    className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Markdown Content Editor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-300">
                Catatan Lengkap (Markdown)
              </label>

              {/* Tabs */}
              <div className="flex items-center bg-zinc-950 rounded-md p-0.5 border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('write')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    activeTab === 'write'
                      ? 'bg-zinc-800 text-zinc-100'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Tulis
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    activeTab === 'preview'
                      ? 'bg-zinc-800 text-zinc-100'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Preview
                </button>
              </div>
            </div>

            {activeTab === 'write' ? (
              <textarea
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tuliskan penjelasan, rangkuman konsep, atau referensi materi..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 font-mono leading-relaxed"
              />
            ) : (
              <div className="min-h-[120px] max-h-[220px] overflow-y-auto bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs prose">
                {content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                ) : (
                  <p className="text-zinc-500 italic">Belum ada konten untuk dipratinjau.</p>
                )}
              </div>
            )}
          </div>

          {/* Code Snippet */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-300">
                Code Snippet (Opsional)
              </label>

              <select
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-zinc-400 text-[11px] rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
              >
                <option value="javascript">JavaScript / TypeScript</option>
                <option value="python">Python</option>
                <option value="sql">SQL / PostgreSQL</option>
                <option value="html">HTML / CSS</option>
                <option value="bash">Bash / Shell</option>
                <option value="json">JSON</option>
                <option value="go">Go</option>
              </select>
            </div>

            <textarea
              rows={3}
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              placeholder="// Masukkan kode atau command di sini..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300">
              Tags (Tekan Enter atau Koma)
            </label>
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-zinc-950 border border-zinc-800 rounded-lg min-h-[38px]">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-[11px] bg-zinc-800 text-zinc-200 px-2 py-0.5 rounded"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={tags.length === 0 ? "Ketik tag lalu tekan Enter (misal: react, postgresql)..." : ""}
                className="flex-1 bg-transparent border-none text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none min-w-[120px]"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold transition-all active:scale-[0.98]"
            >
              {initialLog ? 'Simpan Perubahan' : 'Simpan Catatan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
