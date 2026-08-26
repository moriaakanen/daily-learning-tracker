'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Plus,
  Trash2,
  Star,
  ArrowLeft,
  Calendar,
  Clock,
  Tag,
  BookOpen,
  Code2,
  Eye,
  Edit3,
  Check,
  X,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
} from 'lucide-react';
import { LearningLog, User } from '@/types';

interface FullPageEditorProps {
  currentUser: User;
  initialLog?: LearningLog | null;
  categories: string[];
  onSave: (log: Omit<LearningLog, 'id' | 'created_at' | 'updated_at'>, existingId?: string) => void;
  onCancel: () => void;
}

export function FullPageEditor({
  currentUser,
  initialLog,
  categories,
  onSave,
  onCancel,
}: FullPageEditorProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Teknologi & Coding');
  const [studyDate, setStudyDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState(30);
  const [takeaways, setTakeaways] = useState<string[]>(['', '']);
  const [content, setContent] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'preview' | 'split'>('split');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialLog) {
      setTitle(initialLog.title || '');
      setCategory(initialLog.category || 'Teknologi & Coding');
      setStudyDate(initialLog.study_date || new Date().toISOString().split('T')[0]);
      setDuration(initialLog.duration_minutes || 30);
      setTakeaways(initialLog.takeaways?.length ? initialLog.takeaways : ['', '']);
      setContent(initialLog.content || '');
      setCodeSnippet(initialLog.code_snippet || '');
      setCodeLanguage(initialLog.code_language || 'javascript');
      setTags(initialLog.tags || []);
      setIsFavorite(!!initialLog.is_favorite);
      setImageUrls(initialLog.image_urls || []);
    } else {
      setTitle('');
      setCategory('Teknologi & Coding');
      setStudyDate(new Date().toISOString().split('T')[0]);
      setDuration(30);
      setTakeaways(['', '']);
      setContent('');
      setCodeSnippet('');
      setCodeLanguage('javascript');
      setTags([]);
      setIsFavorite(false);
      setImageUrls([]);
    }
  }, [initialLog]);

  const handleAddTakeaway = () => {
    setTakeaways([...takeaways, '']);
  };

  const handleUpdateTakeaway = (index: number, val: string) => {
    const updated = [...takeaways];
    updated[index] = val;
    setTakeaways(updated);
  };

  const handleRemoveTakeaway = (index: number) => {
    if (takeaways.length <= 1) {
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

  // Image Upload Handler (Base64 file converter)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        alert('File harus berupa gambar (PNG, JPG, GIF, WebP).');
        return;
      }

      // Max 3MB warning
      if (file.size > 3 * 1024 * 1024) {
        alert('Ukuran gambar maksimal 3MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setImageUrls((prev) => [...prev, base64]);
          // Also append to markdown content for seamless inline rendering
          setContent((prev) => prev + `\n\n![${file.name.replace(/\.[^/.]+$/, '')}](${base64})\n`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddImageUrl = () => {
    const trimmed = customImageUrl.trim();
    if (!trimmed) return;
    setImageUrls((prev) => [...prev, trimmed]);
    setContent((prev) => prev + `\n\n![Gambar](${trimmed})\n`);
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
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
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

      {/* Main Spacious Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title & Favorite */}
        <div className="rounded-md border border-[var(--gh-border)] bg-[var(--gh-surface)] p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--gh-text-primary)]">
              Judul Materi / Topik <span className="text-rose-500">*</span>
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

          {/* Meta Grid: Category, Date, Duration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--gh-text-primary)]">Kategori Bidang</label>
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

        {/* Key Takeaways */}
        <div className="rounded-md border border-[var(--gh-border)] bg-[var(--gh-surface)] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-[var(--gh-text-primary)]">
                Key Takeaways / Poin Inti Pembelajaran
              </h3>
              <p className="text-[11px] text-[var(--gh-text-secondary)]">
                Tulis 1-3 kesimpulan utama yang paling berkesan dan ingin selalu kamu ingat
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddTakeaway}
              className="text-[var(--gh-accent)] hover:underline flex items-center gap-1 text-xs font-medium"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Poin
            </button>
          </div>

          <div className="space-y-2">
            {takeaways.map((point, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-xs text-[var(--gh-text-tertiary)] w-5 text-center font-mono">
                  {index + 1}.
                </span>
                <input
                  type="text"
                  value={point}
                  onChange={(e) => handleUpdateTakeaway(index, e.target.value)}
                  placeholder={`Poin penting ke-${index + 1}...`}
                  className="flex-1 bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md px-3 py-1.5 text-xs text-[var(--gh-text-primary)] placeholder-[var(--gh-text-tertiary)] focus:outline-none focus:border-[var(--gh-accent)]"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveTakeaway(index)}
                  className="p-1.5 text-[var(--gh-text-secondary)] hover:text-rose-500 transition-colors"
                  title="Hapus poin"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Spacious Markdown Editor with Image Upload Toolbar */}
        <div className="rounded-md border border-[var(--gh-border)] bg-[var(--gh-surface)] p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--gh-border)] pb-2">
            <div className="flex items-center gap-2">
              <div>
                <h3 className="text-xs font-semibold text-[var(--gh-text-primary)]">
                  Catatan Lengkap & Penjelasan Konsep (Markdown)
                </h3>
              </div>
            </div>

            {/* Toolbar Buttons: Upload Image & View Switcher */}
            <div className="flex items-center gap-2">
              {/* Add Image Buttons */}
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
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[var(--gh-border)] bg-[var(--gh-bg)] hover:bg-[var(--gh-surface-hover)] text-xs text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] transition-colors"
                title="Upload gambar dari komputer"
              >
                <Upload className="w-3.5 h-3.5 text-[var(--gh-accent)]" />
                <span>Upload Gambar</span>
              </button>

              <button
                type="button"
                onClick={() => setShowImageInput(!showImageInput)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[var(--gh-border)] bg-[var(--gh-bg)] hover:bg-[var(--gh-surface-hover)] text-xs text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] transition-colors"
                title="Sisipkan URL Gambar Web"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>URL Gambar</span>
              </button>

              {/* View switcher */}
              <div className="flex items-center bg-[var(--gh-bg)] rounded-md p-0.5 border border-[var(--gh-border)] text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('write')}
                  className={`px-2.5 py-0.5 rounded transition-colors ${
                    activeTab === 'write'
                      ? 'bg-[var(--gh-surface-hover)] text-[var(--gh-text-primary)] font-semibold'
                      : 'text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)]'
                  }`}
                >
                  <Edit3 className="w-3 h-3 inline mr-1" /> Tulis
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('split')}
                  className={`hidden md:inline px-2.5 py-0.5 rounded transition-colors ${
                    activeTab === 'split'
                      ? 'bg-[var(--gh-surface-hover)] text-[var(--gh-text-primary)] font-semibold'
                      : 'text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)]'
                  }`}
                >
                  Split
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-2.5 py-0.5 rounded transition-colors ${
                    activeTab === 'preview'
                      ? 'bg-[var(--gh-surface-hover)] text-[var(--gh-text-primary)] font-semibold'
                      : 'text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)]'
                  }`}
                >
                  <Eye className="w-3 h-3 inline mr-1" /> Preview
                </button>
              </div>
            </div>
          </div>

          {/* Quick URL Image Input Dropdown */}
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

          {/* Attached Images Thumbnail Gallery */}
          {imageUrls.length > 0 && (
            <div className="space-y-1.5 p-2 bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md">
              <div className="text-[11px] font-semibold text-[var(--gh-text-secondary)] flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Gambar Terlampir ({imageUrls.length}):</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {imageUrls.map((imgUrl, i) => (
                  <div key={i} className="relative group shrink-0 w-20 h-16 rounded border border-[var(--gh-border)] overflow-hidden bg-[var(--gh-surface)]">
                    <img src={imgUrl} alt={`Attached ${i}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute top-1 right-1 p-0.5 rounded bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Hapus gambar"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Editor Body */}
          {activeTab === 'split' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-h-[300px]">
              <textarea
                rows={14}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tuliskan catatan, uraian, refleksi pemikiran, atau ringkasan materi di sini..."
                className="w-full bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md p-3 text-xs text-[var(--gh-text-primary)] placeholder-[var(--gh-text-tertiary)] focus:outline-none focus:border-[var(--gh-accent)] font-mono leading-relaxed resize-y"
              />
              <div className="bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md p-3.5 overflow-y-auto max-h-[450px] text-xs prose">
                {content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                ) : (
                  <p className="text-[var(--gh-text-tertiary)] italic">Preview tulisan akan muncul secara realtime di sini...</p>
                )}
              </div>
            </div>
          ) : activeTab === 'write' ? (
            <textarea
              rows={14}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tuliskan catatan, uraian, refleksi pemikiran, atau ringkasan materi di sini..."
              className="w-full bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md p-3 text-xs text-[var(--gh-text-primary)] placeholder-[var(--gh-text-tertiary)] focus:outline-none focus:border-[var(--gh-accent)] font-mono leading-relaxed resize-y"
            />
          ) : (
            <div className="bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md p-4 min-h-[250px] overflow-y-auto text-xs prose">
              {content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              ) : (
                <p className="text-[var(--gh-text-tertiary)] italic">Belum ada konten untuk ditampilkan.</p>
              )}
            </div>
          )}
        </div>

        {/* Optional Snippet / Quote Box */}
        <div className="rounded-md border border-[var(--gh-border)] bg-[var(--gh-surface)] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-[var(--gh-text-primary)] flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-[var(--gh-accent)]" />
                <span>Code Snippet / Rumus / Kutipan (Opsional)</span>
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

        {/* Tags / Labels */}
        <div className="rounded-md border border-[var(--gh-border)] bg-[var(--gh-surface)] p-4 space-y-2">
          <label className="text-xs font-semibold text-[var(--gh-text-primary)] flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-[var(--gh-text-secondary)]" />
            <span>Tags & Topik Spesifik (Tekan Enter atau Koma untuk menambah)</span>
          </label>
          <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md min-h-[42px]">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 text-xs bg-[var(--gh-badge-bg)] border border-[var(--gh-badge-border)] text-[var(--gh-text-secondary)] px-2.5 py-0.5 rounded-full"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-[var(--gh-text-primary)] ml-0.5"
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
              placeholder={tags.length === 0 ? "Ketik tag topik lalu tekan Enter (misal: psikologi, buku, finansial, javascript)..." : ""}
              className="flex-1 bg-transparent border-none text-xs text-[var(--gh-text-primary)] placeholder-[var(--gh-text-tertiary)] focus:outline-none min-w-[200px]"
            />
          </div>
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
