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
} from 'lucide-react';
import { LearningLog, User } from '@/types';
import { compressImage } from '@/lib/imageUtils';

interface FullPageEditorProps {
  currentUser: User | null;
  initialLog?: LearningLog | null;
  categories: string[];
  onOpenLogin: () => void;
  onSave: (log: Omit<LearningLog, 'id' | 'created_at' | 'updated_at'>, existingId?: string) => void;
  onCancel: () => void;
}

export function FullPageEditor({
  currentUser,
  initialLog,
  categories,
  onOpenLogin,
  onSave,
  onCancel,
}: FullPageEditorProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Teknologi & Coding');
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialLog) {
      setTitle(initialLog.title || '');
      setCategory(initialLog.category || 'Teknologi & Coding');
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
      <div className="max-w-md mx-auto my-12 p-6 rounded-md border border-[var(--gh-border)] bg-[var(--gh-surface)] text-center space-y-4 animate-in fade-in duration-200">
        <div className="w-12 h-12 rounded-full bg-[var(--gh-badge-bg)] border border-[var(--gh-border)] flex items-center justify-center mx-auto text-[var(--gh-accent)]">
          <Lock className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-[var(--gh-text-primary)]">
            Login Diperlukan
          </h2>
          <p className="text-xs text-[var(--gh-text-secondary)] leading-relaxed">
            Sebelum dapat menulis atau memperbarui catatan pembelajaran harian, Anda harus masuk ke akun pengguna terlebih dahulu.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <button
            type="button"
            onClick={onOpenLogin}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-[#1f883d] hover:bg-[#1a7f37] text-white text-xs font-semibold shadow-sm transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>Masuk ke Akun Anda</span>
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full px-4 py-1.5 rounded-md border border-[var(--gh-border)] bg-[var(--gh-bg)] hover:bg-[var(--gh-surface-hover)] text-xs text-[var(--gh-text-secondary)] transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  // Optimized Image Upload Handler (Automatic Compression, No Text Pollution)
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

        // Compress image to lightweight optimized format
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top action header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--gh-border)]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[var(--gh-border)] bg-[var(--gh-surface)] hover:bg-[var(--gh-surface-hover)] text-xs text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </button>
          <div>
            <h1 className="text-base font-semibold text-[var(--gh-text-primary)] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[var(--gh-accent)]" />
              <span>{initialLog ? 'Edit Catatan Belajar' : 'Tulis Catatan Pembelajaran Baru'}</span>
            </h1>
            <div className="flex items-center gap-2 text-xs text-[var(--gh-text-secondary)]">
              <span>Penulis:</span>
              <img
                src={initialLog?.author_avatar || currentUser.avatar}
                alt={currentUser.name}
                className="w-4 h-4 rounded-full object-cover border border-[var(--gh-border)]"
              />
              <span className="font-semibold text-[var(--gh-text-primary)]">
                {initialLog?.author_name || currentUser.name}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-md border border-[var(--gh-border)] bg-[var(--gh-surface)] hover:bg-[var(--gh-surface-hover)] text-xs font-medium text-[var(--gh-text-secondary)] transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[#1f883d] hover:bg-[#1a7f37] text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{initialLog ? 'Simpan Perubahan' : 'Terbitkan Catatan'}</span>
          </button>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title & Topik */}
        <div className="rounded-md border border-[var(--gh-border)] bg-[var(--gh-surface)] p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--gh-text-primary)]">
              Judul Materi / Catatan <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Prinsip Pareto 80/20, Struktur DNA & Genetik, atau Memahami Index PostgreSQL"
                className="flex-1 bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md px-3.5 py-2 text-sm text-[var(--gh-text-primary)] placeholder-[var(--gh-text-tertiary)] focus:outline-none focus:border-[var(--gh-accent)] focus:ring-1 focus:ring-[var(--gh-accent)] font-medium"
              />
              <button
                type="button"
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2.5 rounded-md border border-[var(--gh-border)] transition-colors ${
                  isFavorite
                    ? 'bg-[var(--gh-surface-hover)] text-amber-500'
                    : 'bg-[var(--gh-bg)] text-[var(--gh-text-secondary)]'
                }`}
                title={isFavorite ? 'Starred' : 'Tandai Favorit'}
              >
                <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Meta Grid: Topik, Date, Duration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--gh-text-primary)]">Topik</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md px-3 py-1.5 text-xs text-[var(--gh-text-primary)] focus:outline-none focus:border-[var(--gh-accent)] cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[var(--gh-bg)]">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--gh-text-primary)] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[var(--gh-text-secondary)]" /> Tanggal Belajar
              </label>
              <input
                type="date"
                value={studyDate}
                onChange={(e) => setStudyDate(e.target.value)}
                className="w-full bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md px-3 py-1.5 text-xs text-[var(--gh-text-primary)] focus:outline-none focus:border-[var(--gh-accent)]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--gh-text-primary)] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[var(--gh-text-secondary)]" /> Durasi Belajar (Menit)
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md px-3 py-1.5 text-xs text-[var(--gh-text-primary)] focus:outline-none focus:border-[var(--gh-accent)]"
              />
            </div>
          </div>
        </div>

        {/* Card Catatan Lengkap with Upload Buttons at the Bottom Right */}
        <div className="rounded-md border border-[var(--gh-border)] bg-[var(--gh-surface)] p-4 space-y-3">
          {/* Card Header */}
          <div className="border-b border-[var(--gh-border)] pb-2">
            <h3 className="text-xs font-semibold text-[var(--gh-text-primary)]">
              Catatan Lengkap
            </h3>
            <p className="text-[11px] text-[var(--gh-text-secondary)]">
              Tuliskan semua hal yang Anda pelajari hari ini (teks bersih dan terstruktur)
            </p>
          </div>

          {/* Clean Writing Textarea */}
          <textarea
            rows={14}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tuliskan materi pembelajaran, catatan penting, atau hal menarik yang Anda pelajari hari ini..."
            className="w-full bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md p-3.5 text-xs text-[var(--gh-text-primary)] placeholder-[var(--gh-text-tertiary)] focus:outline-none focus:border-[var(--gh-accent)] font-sans leading-relaxed resize-y min-h-[260px]"
          />

          {/* Toolbar on Bottom Right of Card */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="text-[11px] text-[var(--gh-text-tertiary)]">
              {isCompressing ? 'Mengompresi gambar otomatis...' : `${imageUrls.length} gambar dilampirkan`}
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--gh-border)] bg-[var(--gh-bg)] hover:bg-[var(--gh-surface-hover)] text-xs text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] transition-colors font-medium"
                title="Upload gambar dari komputer (otomatis dikompres)"
              >
                <Upload className="w-3.5 h-3.5 text-[var(--gh-accent)]" />
                <span>Upload Gambar</span>
              </button>

              <button
                type="button"
                onClick={() => setShowImageInput(!showImageInput)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--gh-border)] bg-[var(--gh-bg)] hover:bg-[var(--gh-surface-hover)] text-xs text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] transition-colors font-medium"
                title="Sisipkan URL Gambar Web"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>URL Gambar</span>
              </button>
            </div>
          </div>

          {/* Quick URL Image Input Popup */}
          {showImageInput && (
            <div className="p-3 bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md flex items-center gap-2 animate-in fade-in duration-150">
              <ImageIcon className="w-4 h-4 text-[var(--gh-accent)] shrink-0" />
              <input
                type="url"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                placeholder="Tempel link URL gambar (https://example.com/image.png)..."
                className="flex-1 bg-transparent text-xs text-[var(--gh-text-primary)] focus:outline-none placeholder-[var(--gh-text-tertiary)]"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-3 py-1 rounded bg-[var(--gh-accent)] hover:opacity-90 text-white text-xs font-semibold"
              >
                Sisipkan
              </button>
              <button
                type="button"
                onClick={() => setShowImageInput(false)}
                className="p-1 text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Attached Images Thumbnail Preview (Clean below writing area) */}
          {imageUrls.length > 0 && (
            <div className="space-y-1.5 p-3 bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md mt-2">
              <div className="text-[11px] font-semibold text-[var(--gh-text-secondary)] flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-[var(--gh-accent)]" />
                <span>Lampiran Gambar ({imageUrls.length}):</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {imageUrls.map((imgUrl, i) => (
                  <div key={i} className="relative group rounded-lg border border-[var(--gh-border)] overflow-hidden bg-[var(--gh-surface)] h-28">
                    <img src={imgUrl} alt={`Lampiran ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 hover:bg-black/90 text-white transition-opacity"
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
        <div className="rounded-md border border-[var(--gh-border)] bg-[var(--gh-surface)] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-[var(--gh-text-primary)] flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-[var(--gh-accent)]" />
                <span>Snippet Kode / Rumus / Kutipan (Opsional)</span>
              </h3>
              <p className="text-[11px] text-[var(--gh-text-secondary)]">
                Bila materi memiliki kode pemrograman, rumus matematika, atau kutipan kalimat kunci
              </p>
            </div>

            <select
              value={codeLanguage}
              onChange={(e) => setCodeLanguage(e.target.value)}
              className="bg-[var(--gh-bg)] border border-[var(--gh-border)] text-[var(--gh-text-secondary)] text-[11px] rounded px-2 py-1 focus:outline-none cursor-pointer"
            >
              <option value="text">Teks / Kutipan</option>
              <option value="javascript">JavaScript / TypeScript</option>
              <option value="python">Python</option>
              <option value="sql">SQL / PostgreSQL</option>
              <option value="html">HTML / CSS</option>
              <option value="bash">Bash / Terminal</option>
              <option value="json">JSON</option>
              <option value="go">Go</option>
            </select>
          </div>

          <textarea
            rows={3}
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            placeholder="// Tuliskan snippet kode, kutipan penting, atau rumus di sini..."
            className="w-full bg-[var(--gh-code-bg)] border border-[var(--gh-border)] rounded-md p-2.5 text-xs font-mono text-[var(--gh-text-primary)] placeholder-[var(--gh-text-tertiary)] focus:outline-none focus:border-[var(--gh-accent)] resize-y"
          />
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-md border border-[var(--gh-border)] bg-[var(--gh-surface)] hover:bg-[var(--gh-surface-hover)] text-xs font-medium text-[var(--gh-text-secondary)] transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2 rounded-md bg-[#1f883d] hover:bg-[#1a7f37] text-white text-xs font-bold shadow-sm transition-all"
          >
            <Check className="w-4 h-4" />
            <span>{initialLog ? 'Simpan Perubahan' : 'Terbitkan Catatan Belajar'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
