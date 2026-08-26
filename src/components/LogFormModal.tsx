'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  X,
  Plus,
  Trash2,
  Code2,
  Eye,
  Edit3,
  Calendar,
  Clock,
  Star,
  CheckCircle2,
  Tag,
  Sparkles,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {initialLog ? 'Edit Catatan Belajar' : 'Catat Materi Baru (TIL)'}
              </h2>
              <p className="text-xs text-slate-400">
                Dokumentasikan apa yang kamu pahami hari ini
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

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Title & Favorite */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Judul Topik / Materi Belajar <span className="text-rose-400">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Memahami Arsitektur Event-Driven dengan Kafka"
                className="flex-1 bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2.5 rounded-xl border transition-all ${
                  isFavorite
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-slate-950/90 border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
                title="Tandai Favorit"
              >
                <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Meta Grid: Category, Date, Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-slate-200">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Tanggal Belajar
              </label>
              <input
                type="date"
                value={studyDate}
                onChange={(e) => setStudyDate(e.target.value)}
                className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
              />
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Durasi (Menit)
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Key Takeaways (Poin-poin penting) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Key Takeaways / Kesimpulan Inti (1-3 Poin)
              </label>
              <button
                type="button"
                onClick={handleAddTakeaway}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Tambah Poin
              </button>
            </div>

            <div className="space-y-2">
              {takeaways.map((point, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 w-4 text-center">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => handleUpdateTakeaway(index, e.target.value)}
                    placeholder={`Poin penting ke-${index + 1}...`}
                    className="flex-1 bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveTakeaway(index)}
                    className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Markdown Content Editor / Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Deskripsi / Catatan Lengkap (Markdown didukung)
              </label>

              {/* Tabs */}
              <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('write')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    activeTab === 'write'
                      ? 'bg-slate-800 text-indigo-400 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Tulis</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    activeTab === 'preview'
                      ? 'bg-slate-800 text-indigo-400 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Preview</span>
                </button>
              </div>
            </div>

            {activeTab === 'write' ? (
              <textarea
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tuliskan catatan, penjelasan konsep, atau referensi belajar menggunakan Markdown..."
                className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono leading-relaxed resize-y"
              />
            ) : (
              <div className="min-h-[140px] max-h-[250px] overflow-y-auto bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-xs sm:text-sm text-slate-200 prose prose-invert max-w-none">
                {content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                ) : (
                  <p className="text-slate-500 italic">Belum ada konten untuk dipratinjau.</p>
                )}
              </div>
            )}
          </div>

          {/* Optional Code Snippet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                Code Snippet (Opsional)
              </label>

              <select
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
              >
                <option value="javascript">JavaScript / TypeScript</option>
                <option value="python">Python</option>
                <option value="sql">SQL / PostgreSQL</option>
                <option value="html">HTML / CSS</option>
                <option value="bash">Bash / Shell</option>
                <option value="json">JSON</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
              </select>
            </div>

            <textarea
              rows={3}
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              placeholder="// Tulis kode atau snippet penting di sini..."
              className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3 text-xs font-mono text-indigo-300/90 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-y"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" /> Tags (Tekan Enter atau Koma untuk menambah)
            </label>
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-950/90 border border-slate-800 rounded-xl min-h-[42px]">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-lg"
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
                placeholder={tags.length === 0 ? "Ketik tag lalu tekan Enter (misal: react, sql, nextjs)..." : ""}
                className="flex-1 bg-transparent border-none text-xs text-slate-100 placeholder-slate-600 focus:outline-none min-w-[150px]"
              />
            </div>
          </div>

          {/* Footer Submit Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {initialLog ? 'Simpan Perubahan' : 'Simpan Catatan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
