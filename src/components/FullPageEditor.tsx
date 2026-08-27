'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Star,
  ArrowLeft,
  Calendar,
  Clock,
  BookOpen,
  Code2,
  Check,
  X,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  LogIn,
  Lock,
  Plus,
  Palette,
} from 'lucide-react';
import { LearningLog, User } from '@/types';
import { compressImage } from '@/lib/imageUtils';
import { getTopicTheme, getCardStyle, CARD_COLOR_PRESETS } from '@/lib/topicTheme';

interface FullPageEditorProps {
  currentUser: User | null;
  initialLog?: LearningLog | null;
  categories: string[];
  onOpenLogin: () => void;
  onSave: (log: Omit<LearningLog, 'id' | 'created_at' | 'updated_at'>, existingId?: string) => void;
  onCancel: () => void;
  onAddCategory?: (newCategory: string) => void;
}

export function FullPageEditor({
  currentUser,
  initialLog,
  categories,
  onOpenLogin,
  onSave,
  onCancel,
  onAddCategory,
}: FullPageEditorProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Teknologi & Coding');
  const [cardColor, setCardColor] = useState('auto');
  const [studyDate, setStudyDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState(30);
  const [content, setContent] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  // New Custom Topic modal inside editor
  const [showCustomTopicInput, setShowCustomTopicInput] = useState(false);
  const [customTopicName, setCustomTopicName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialLog) {
      setTitle(initialLog.title || '');
      setCategory(initialLog.category || 'Teknologi & Coding');
      setCardColor(initialLog.card_color || 'auto');
      setStudyDate(initialLog.study_date || new Date().toISOString().split('T')[0]);
      setDuration(initialLog.duration_minutes || 30);
      setContent(initialLog.content || '');
      setCodeSnippet(initialLog.code_snippet || '');
      setCodeLanguage(initialLog.code_language || 'javascript');
      setIsFavorite(!!initialLog.is_favorite);
      setImageUrls(initialLog.image_urls || []);
    } else {
      setTitle('');
      setCategory('Teknologi & Coding');
      setCardColor('auto');
      setStudyDate(new Date().toISOString().split('T')[0]);
      setDuration(30);
      setContent('');
      setCodeSnippet('');
      setCodeLanguage('javascript');
      setIsFavorite(false);
      setImageUrls([]);
    }
  }, [initialLog]);

  // If user is not logged in, enforce login screen
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 rounded-2xl border border-[var(--gh-border)] bg-[var(--gh-surface)] text-center space-y-4 animate-in fade-in duration-200 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-xl">
          🔒
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-[var(--gh-text-primary)]">
            Login Diperlukan
          </h2>
          <p className="text-xs text-[var(--gh-text-secondary)] font-medium leading-relaxed">
            Sebelum dapat menulis atau memperbarui catatan pembelajaran harian, Anda harus masuk ke akun pengguna terlebih dahulu.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <button
            type="button"
            onClick={onOpenLogin}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Masuk ke Akun Anda</span>
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full px-4 py-2 rounded-full border border-[var(--gh-border)] bg-[var(--gh-bg)] hover:bg-[var(--gh-surface-hover)] text-xs font-bold text-[var(--gh-text-secondary)] transition-colors cursor-pointer"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  // Optimized Image Upload Handler (Automatic Compression)
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          alert('File harus berupa gambar (PNG, JPG, GIF, WebP).');
          continue;
        }

        const compressedBase64 = await compressImage(file, 1200, 1200, 0.78);
        setImageUrls((prev) => [...prev, compressedBase64]);
      }
    } catch (err) {
      console.error('Error compressing image', err);
      alert('Gagal memproses gambar.');
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddImageUrl = () => {
    const trimmed = customImageUrl.trim();
    if (!trimmed) return;
    setImageUrls((prev) => [...prev, trimmed]);
    setCustomImageUrl('');
    setShowImageInput(false);
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleCreateCustomTopic = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customTopicName.trim();
    if (!trimmed) return;
    if (onAddCategory) {
      onAddCategory(trimmed);
    }
    setCategory(trimmed);
    setCustomTopicName('');
    setShowCustomTopicInput(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Mohon masukkan judul catatan belajar.');
      return;
    }

    onSave(
      {
        title: title.trim(),
        category,
        card_color: cardColor,
        study_date: studyDate,
        duration_minutes: Number(duration) || 30,
        takeaways: [],
        tags: [],
        content: content.trim(),
        code_snippet: codeSnippet.trim() || undefined,
        code_language: codeLanguage,
        image_urls: imageUrls,
        is_favorite: isFavorite,
        author_id: initialLog?.author_id || currentUser.id,
        author_name: initialLog?.author_name || currentUser.name,
        author_avatar: initialLog?.author_avatar || currentUser.avatar,
      },
      initialLog?.id
    );
  };

  const currentTheme = getCardStyle(category, cardColor);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Top action header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--gh-border)]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--gh-border)] bg-[var(--gh-surface)] hover:bg-[var(--gh-surface-hover)] text-xs text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] transition-colors cursor-pointer font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </button>
          <div>
            <h1 className="text-base font-extrabold text-[var(--gh-text-primary)] flex items-center gap-2">
              <span className="text-base">{currentTheme.emoji}</span>
              <span>{initialLog ? 'Edit Catatan Belajar' : 'Tulis Catatan Pembelajaran Baru'}</span>
            </h1>
            <div className="flex items-center gap-2 text-xs text-[var(--gh-text-secondary)]">
              <span>Penulis:</span>
              <img
                src={initialLog?.author_avatar || currentUser.avatar}
                alt={currentUser.name}
                className="w-4 h-4 rounded-full object-cover border border-[var(--gh-border)]"
              />
              <span className="font-bold text-[var(--gh-text-primary)]">
                {initialLog?.author_name || currentUser.name}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-full border border-[var(--gh-border)] bg-[var(--gh-surface)] hover:bg-[var(--gh-surface-hover)] text-xs font-bold text-[var(--gh-text-secondary)] transition-colors cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{initialLog ? 'Simpan Perubahan' : 'Terbitkan Catatan ✨'}</span>
          </button>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title & Topik & Card Color */}
        <div
          className="rounded-2xl border border-[var(--gh-border)] p-4 sm:p-5 space-y-4 shadow-xs transition-all"
          style={{
            borderLeftWidth: '5px',
            borderLeftColor: currentTheme.borderLeft,
            backgroundColor: currentTheme.cardBg !== 'transparent' ? currentTheme.cardBg : 'var(--gh-surface)',
          }}
        >
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--gh-text-primary)] flex items-center gap-1">
              <span>✍️ Judul Materi / Catatan</span> <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Prinsip Pareto 80/20, Struktur DNA & Genetik, atau Memahami Index PostgreSQL"
                className="flex-1 bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-xl px-3.5 py-2 text-sm text-[var(--gh-text-primary)] placeholder-[var(--gh-text-tertiary)] focus:outline-none focus:border-indigo-500 font-bold"
              />
              <button
                type="button"
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2.5 rounded-xl border border-[var(--gh-border)] transition-colors cursor-pointer ${
                  isFavorite
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-500 font-bold'
                    : 'bg-[var(--gh-bg)] text-[var(--gh-text-secondary)]'
                }`}
                title={isFavorite ? 'Starred' : 'Tandai Favorit'}
              >
                <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Meta Grid: Topik with Emoji + Date + Duration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--gh-text-primary)] flex items-center gap-1">
                  <span>🏷️ Topik</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowCustomTopicInput(true)}
                  className="text-[11px] text-indigo-500 hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tambah Topik</span>
                </button>
              </div>

              {showCustomTopicInput ? (
                <div className="flex items-center gap-1.5 pt-0.5 animate-in fade-in duration-150">
                  <input
                    type="text"
                    required
                    autoFocus
                    value={customTopicName}
                    onChange={(e) => setCustomTopicName(e.target.value)}
                    placeholder="Nama topik baru..."
                    className="flex-1 bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--gh-text-primary)] focus:outline-none focus:border-indigo-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleCreateCustomTopic}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustomTopicInput(false)}
                    className="p-1 text-[var(--gh-text-secondary)] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <select
                  value={category}
                  onChange={(e) => {
                    if (e.target.value === '__add_new__') {
                      setShowCustomTopicInput(true);
                    } else {
                      setCategory(e.target.value);
                    }
                  }}
                  className="w-full bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-xl px-3 py-2 text-xs text-[var(--gh-text-primary)] font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {categories.map((cat) => {
                    const t = getTopicTheme(cat);
                    return (
                      <option key={cat} value={cat} className="bg-[var(--gh-bg)]">
                        {t.emoji} {cat}
                      </option>
                    );
                  })}
                  <option value="__add_new__" className="font-bold text-indigo-500">
                    ✨ + Tambah Topik Baru...
                  </option>
                </select>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--gh-text-primary)] flex items-center gap-1">
                <span>📅 Tanggal Belajar</span>
              </label>
              <input
                type="date"
                value={studyDate}
                onChange={(e) => setStudyDate(e.target.value)}
                className="w-full bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-xl px-3 py-2 text-xs text-[var(--gh-text-primary)] font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--gh-text-primary)] flex items-center gap-1">
                <span>⏱️ Durasi Belajar (Menit)</span>
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-xl px-3 py-2 text-xs text-[var(--gh-text-primary)] font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Section: Custom Card Color Swatch Picker (Circular Shapes with Checkmark) */}
          <div className="pt-2.5 border-t border-[var(--gh-border-subtle)] space-y-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <label className="text-xs font-bold text-[var(--gh-text-primary)] flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-500" />
                <span>Pilih Warna Kartu:</span>
              </label>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                {CARD_COLOR_PRESETS.find((p) => p.id === cardColor)?.name || 'Otomatis Sesuai Topik'}
              </span>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto py-3 px-3 scrollbar-none">
              {CARD_COLOR_PRESETS.map((preset) => {
                const isSelected = cardColor === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setCardColor(preset.id)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-2xs ${
                      isSelected
                        ? 'ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-900 scale-105 shadow-sm'
                        : 'hover:scale-105 hover:shadow-xs opacity-90 hover:opacity-100'
                    }`}
                    style={{
                      background:
                        preset.id === 'auto'
                          ? 'linear-gradient(135deg, #38bdf8, #818cf8, #f472b6, #fbbf24)'
                          : preset.color,
                    }}
                    title={preset.name}
                  >
                    {isSelected && (
                      <Check className="w-4 h-4 text-white stroke-[3] drop-shadow-xs animate-in zoom-in-75 duration-150" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card Catatan Lengkap with Upload Buttons at the Bottom Right */}
        <div className="rounded-2xl border border-[var(--gh-border)] bg-[var(--gh-surface)] p-4 sm:p-5 space-y-3 shadow-xs">
          {/* Card Header */}
          <div className="border-b border-[var(--gh-border)] pb-2 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[var(--gh-text-primary)] flex items-center gap-1.5">
                <span>📝 Catatan Lengkap</span>
              </h3>
              <p className="text-[11px] text-[var(--gh-text-secondary)] font-medium">
                Tuliskan semua hal yang Anda pelajari hari ini (teks bersih dan terstruktur)
              </p>
            </div>
          </div>

          {/* Clean Writing Textarea */}
          <textarea
            rows={14}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tuliskan materi pembelajaran, catatan penting, atau hal menarik yang Anda pelajari hari ini..."
            className="w-full bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-xl p-3.5 text-xs text-[var(--gh-text-primary)] placeholder-[var(--gh-text-tertiary)] focus:outline-none focus:border-indigo-500 font-sans leading-relaxed resize-y min-h-[260px]"
          />

          {/* Toolbar on Bottom Right of Card */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="text-[11px] text-[var(--gh-text-tertiary)] flex items-center gap-1 font-medium">
              <span>{isCompressing ? '⏳ Mengompresi gambar...' : `🖼️ ${imageUrls.length} gambar dilampirkan`}</span>
            </div>

            {/* Upload & URL Buttons on Bottom Right */}
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                multiple
                onChange={handleImageFileUpload}
                className="hidden"
              />
              <button
                type="button"
                disabled={isCompressing}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[var(--gh-border)] bg-[var(--gh-bg)] hover:bg-[var(--gh-surface-hover)] text-xs text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] transition-colors font-bold cursor-pointer shadow-2xs"
                title="Upload gambar dari komputer"
              >
                <span>📤</span>
                <span>Upload Gambar</span>
              </button>

              <button
                type="button"
                onClick={() => setShowImageInput(!showImageInput)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[var(--gh-border)] bg-[var(--gh-bg)] hover:bg-[var(--gh-surface-hover)] text-xs text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] transition-colors font-bold cursor-pointer shadow-2xs"
                title="Sisipkan URL Gambar Web"
              >
                <span>🔗</span>
                <span>URL Gambar</span>
              </button>
            </div>
          </div>

          {/* Quick URL Image Input Popup */}
          {showImageInput && (
            <div className="p-3 bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-xl flex items-center gap-2 animate-in fade-in duration-150 shadow-sm">
              <span>🌐</span>
              <input
                type="url"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                placeholder="Tempel link URL gambar (https://example.com/image.png)..."
                className="flex-1 bg-transparent text-xs text-[var(--gh-text-primary)] focus:outline-none placeholder-[var(--gh-text-tertiary)] font-medium"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-3.5 py-1 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
              >
                Sisipkan
              </button>
              <button
                type="button"
                onClick={() => setShowImageInput(false)}
                className="p-1 text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Attached Images Thumbnail Preview */}
          {imageUrls.length > 0 && (
            <div className="space-y-1.5 p-3.5 bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-xl mt-2">
              <div className="text-[11px] font-bold text-[var(--gh-text-secondary)] flex items-center gap-1">
                <span>🖼️ Lampiran Gambar ({imageUrls.length}):</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {imageUrls.map((imgUrl, i) => (
                  <div key={i} className="relative group rounded-xl border border-[var(--gh-border)] overflow-hidden bg-[var(--gh-surface)] h-28 shadow-2xs">
                    <img src={imgUrl} alt={`Lampiran ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 hover:bg-black/90 text-white transition-opacity cursor-pointer"
                      title="Hapus gambar"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Optional Snippet / Quote Box */}
        <div className="rounded-2xl border border-[var(--gh-border)] bg-[var(--gh-surface)] p-4 sm:p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[var(--gh-text-primary)] flex items-center gap-1.5">
                <span>💻 Snippet Kode / Rumus / Kutipan (Opsional)</span>
              </h3>
              <p className="text-[11px] text-[var(--gh-text-secondary)] font-medium">
                Bila materi memiliki kode pemrograman, rumus matematika, atau kutipan kalimat kunci
              </p>
            </div>

            <select
              value={codeLanguage}
              onChange={(e) => setCodeLanguage(e.target.value)}
              className="bg-[var(--gh-bg)] border border-[var(--gh-border)] text-[var(--gh-text-secondary)] text-[11px] font-bold rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
            >
              <option value="text">📄 Teks / Kutipan</option>
              <option value="javascript">⚡ JavaScript / TypeScript</option>
              <option value="python">🐍 Python</option>
              <option value="sql">🗄️ SQL / PostgreSQL</option>
              <option value="html">🌐 HTML / CSS</option>
              <option value="bash">💻 Bash / Terminal</option>
              <option value="json">📦 JSON</option>
              <option value="go">🔵 Go</option>
            </select>
          </div>

          <textarea
            rows={3}
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            placeholder="// Tuliskan snippet kode, kutipan penting, atau rumus di sini..."
            className="w-full bg-[var(--gh-code-bg)] border border-[var(--gh-border)] rounded-xl p-3 text-xs font-mono text-[var(--gh-text-primary)] placeholder-[var(--gh-text-tertiary)] focus:outline-none focus:border-indigo-500 resize-y"
          />
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-full border border-[var(--gh-border)] bg-[var(--gh-surface)] hover:bg-[var(--gh-surface-hover)] text-xs font-bold text-[var(--gh-text-secondary)] transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{initialLog ? 'Simpan Perubahan' : 'Terbitkan Catatan Belajar ✨'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
