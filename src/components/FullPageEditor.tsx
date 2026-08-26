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
  Bold,
  Italic,
  List,
  ListOrdered,
  CheckSquare,
  Heading1,
  Heading2,
  Quote,
  Smile,
  FileText,
  Sparkles,
  Layers,
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
  onAddCategory?: (newCategory: string) => void;
}

const NOTION_EMOJIS = ['💡', '🧠', '💻', '📚', '⚡', '🚀', '🎯', '📖', '📝', '🎨', '🔬', '🌟', '🛠️', '📈', '🧩'];

const JOURNAL_TEMPLATES = [
  {
    name: '📔 Daily Learning Reflection',
    icon: '📔',
    desc: 'Format refleksi harian komprehensif',
    content: `## 🎯 Fokus Utama Hari Ini
- Topik yang dipelajari: 
- Durasi & sumber belajar: 

## 💡 Poin-Poin Penting
1. 
2. 
3. 

## 🧗‍♂️ Tantangan & Cara Mengatasinya
> 

## 🚀 Rencana Tindak Lanjut / Implementasi
- [ ] 
- [ ] 
`,
  },
  {
    name: '💻 Tech & Code Breakdown',
    icon: '💻',
    desc: 'Dokumentasi konsep pemrograman & bug solving',
    content: `## 📌 Konsep / Fitur
Penjelasan ringkas tentang apa yang dipelajari:

## ⚙️ Cara Kerja & Implementasi
- Langkah 1:
- Langkah 2:

> 💡 **Best Practice:** 

## 🐛 Kendala yang Ditemui & Solusi
- **Issue:** 
- **Fix:** 
`,
  },
  {
    name: '📖 Book & Literature Summary',
    icon: '📖',
    desc: 'Catatan bedah buku & intisari literatur',
    content: `## 📚 Informasi Buku / Artikel
- **Judul & Penulis:** 
- **Tema Utama:** 

## 🧠 3 Gagasan Kunci
1. 
2. 
3. 

> *"Kutipan paling berkesan dari bacaan hari ini..."*

## 🎯 Relevansi & Penerapan Nyata
- 
`,
  },
  {
    name: '⚡ Quick Brain Dump',
    icon: '⚡',
    desc: 'Catatan kilat ide dan poin penting',
    content: `> 💡 **Quick Note:** 

- 
- 
- 
`,
  },
];

export function FullPageEditor({
  currentUser,
  initialLog,
  categories,
  onOpenLogin,
  onSave,
  onCancel,
  onAddCategory,
}: FullPageEditorProps) {
  const [selectedEmoji, setSelectedEmoji] = useState('💡');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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

  // Custom Topic inline modal
  const [showCustomTopicInput, setShowCustomTopicInput] = useState(false);
  const [customTopicName, setCustomTopicName] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialLog) {
      // Check if title has emoji prefix
      const matchEmoji = initialLog.title?.match(/^(\p{Extended_Pictographic}|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]|\uD83D[\uDE80-\uDEFF])/u);
      if (matchEmoji) {
        setSelectedEmoji(matchEmoji[0]);
        setTitle(initialLog.title.replace(matchEmoji[0], '').trim());
      } else {
        setSelectedEmoji('💡');
        setTitle(initialLog.title || '');
      }

      setCategory(initialLog.category || 'Teknologi & Coding');
      setStudyDate(initialLog.study_date || new Date().toISOString().split('T')[0]);
      setDuration(initialLog.duration_minutes || 30);
      setContent(initialLog.content || '');
      setCodeSnippet(initialLog.code_snippet || '');
      setCodeLanguage(initialLog.code_language || 'javascript');
      setIsFavorite(!!initialLog.is_favorite);
      setImageUrls(initialLog.image_urls || []);
    } else {
      setSelectedEmoji('💡');
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

  // Insert markdown helper at cursor
  const insertFormatting = (prefix: string, suffix = '') => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const prevText = content;
    const selected = prevText.substring(start, end);

    const replacement = prefix + (selected || '') + suffix;
    const updated = prevText.substring(0, start) + replacement + prevText.substring(end);
    setContent(updated);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + (selected?.length || 0));
    }, 50);
  };

  const applyTemplate = (tplContent: string) => {
    if (content.trim() && !confirm('Ganti teks catatan dengan template ini?')) return;
    setContent(tplContent);
  };

  // Login Gate
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
            Sebelum dapat menulis atau memperbarui catatan jurnal pembelajaran, Anda harus masuk ke akun pengguna terlebih dahulu.
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

    const fullTitle = `${selectedEmoji} ${title.trim()}`;

    onSave(
      {
        title: fullTitle,
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
    <div className="w-full space-y-6 animate-in fade-in duration-200">
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
          <div className="flex items-center gap-2">
            <span className="text-lg">{selectedEmoji}</span>
            <div>
              <h1 className="text-base font-semibold text-[var(--gh-text-primary)]">
                {initialLog ? 'Edit Catatan Jurnal' : 'Halaman Jurnal Baru'}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-[var(--gh-text-secondary)]">
                <span>Penulis:</span>
                <img
                  src={initialLog?.author_avatar || currentUser.avatar}
                  alt={currentUser.name}
                  className="w-3.5 h-3.5 rounded-full object-cover border border-[var(--gh-border)]"
                />
                <span className="font-semibold text-[var(--gh-text-primary)]">
                  {initialLog?.author_name || currentUser.name}
                </span>
              </div>
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
            <span>{initialLog ? 'Simpan Perubahan' : 'Terbitkan Jurnal'}</span>
          </button>
        </div>
      </div>

      {/* Notion Quick Templates Selector */}
      <div className="rounded-md border border-[var(--gh-border)] bg-[var(--gh-surface)] p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[var(--gh-text-primary)] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Pilih Template Jurnal Notion (Opsional):</span>
          </span>
          <span className="text-[11px] text-[var(--gh-text-secondary)]">Klik untuk mengisi struktur otomatis</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {JOURNAL_TEMPLATES.map((tpl) => (
            <button
              key={tpl.name}
              type="button"
              onClick={() => applyTemplate(tpl.content)}
              className="p-2.5 rounded-md border border-[var(--gh-border)] bg-[var(--gh-bg)] hover:bg-[var(--gh-surface-hover)] hover:border-[var(--gh-accent)] text-left transition-all group"
            >
              <div className="flex items-center gap-1.5 font-semibold text-xs text-[var(--gh-text-primary)] group-hover:text-[var(--gh-accent)]">
                <span>{tpl.icon}</span>
                <span className="truncate">{tpl.name.replace(/^[^\s]+\s*/, '')}</span>
              </div>
              <p className="text-[10px] text-[var(--gh-text-secondary)] mt-0.5 line-clamp-1">
                {tpl.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Notion Document Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Document Title & Properties Table (Notion Properties Style) */}
        <div className="rounded-md border border-[var(--gh-border)] bg-[var(--gh-surface)] p-5 space-y-4">
          {/* Notion Emoji & Big Title */}
          <div className="flex items-center gap-3">
            {/* Emoji Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-10 h-10 rounded-md border border-[var(--gh-border)] bg-[var(--gh-bg)] hover:bg-[var(--gh-surface-hover)] flex items-center justify-center text-xl transition-all shadow-xs"
                title="Pilih Ikon Emoji"
              >
                {selectedEmoji}
              </button>

              {showEmojiPicker && (
                <div className="absolute top-12 left-0 z-30 p-2 bg-[var(--gh-surface)] border border-[var(--gh-border)] rounded-md shadow-xl grid grid-cols-5 gap-1 animate-in fade-in duration-150">
                  {NOTION_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setSelectedEmoji(emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="w-8 h-8 rounded hover:bg-[var(--gh-surface-hover)] text-lg flex items-center justify-center transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Big Page Title Input */}
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul Jurnal / Catatan Belajar..."
              className="flex-1 bg-transparent text-xl sm:text-2xl font-bold text-[var(--gh-text-primary)] placeholder-[var(--gh-text-tertiary)] focus:outline-none border-b border-transparent focus:border-[var(--gh-border)] pb-1"
            />

            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-md border border-[var(--gh-border)] transition-colors ${
                isFavorite
                  ? 'bg-[var(--gh-surface-hover)] text-amber-500'
                  : 'bg-[var(--gh-bg)] text-[var(--gh-text-secondary)]'
              }`}
              title={isFavorite ? 'Starred' : 'Tandai Favorit'}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
          </div>

          {/* Notion Properties Grid (Topik, Tanggal, Durasi) */}
          <div className="pt-2 border-t border-[var(--gh-border)] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Property: Topik */}
            <div className="flex items-center gap-2">
              <span className="text-[var(--gh-text-secondary)] font-medium w-16 shrink-0 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" /> Topik:
              </span>
              <div className="flex-1">
                {showCustomTopicInput ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      required
                      autoFocus
                      value={customTopicName}
                      onChange={(e) => setCustomTopicName(e.target.value)}
                      placeholder="Topik baru..."
                      className="flex-1 bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded px-2 py-0.5 text-xs text-[var(--gh-text-primary)] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCreateCustomTopic}
                      className="px-2 py-0.5 rounded bg-[#1f883d] text-white text-[11px] font-bold"
                    >
                      OK
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCustomTopicInput(false)}
                      className="p-0.5 text-[var(--gh-text-secondary)]"
                    >
                      <X className="w-3 h-3" />
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
                    className="w-full bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded px-2 py-1 text-xs text-[var(--gh-text-primary)] focus:outline-none cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="__add_new__" className="font-semibold text-[var(--gh-accent)]">
                      + Tambah Topik Baru...
                    </option>
                  </select>
                )}
              </div>
            </div>

            {/* Property: Tanggal */}
            <div className="flex items-center gap-2">
              <span className="text-[var(--gh-text-secondary)] font-medium w-16 shrink-0 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Tanggal:
              </span>
              <input
                type="date"
                value={studyDate}
                onChange={(e) => setStudyDate(e.target.value)}
                className="flex-1 bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded px-2 py-1 text-xs text-[var(--gh-text-primary)] focus:outline-none"
              />
            </div>

            {/* Property: Durasi */}
            <div className="flex items-center gap-2">
              <span className="text-[var(--gh-text-secondary)] font-medium w-16 shrink-0 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Durasi:
              </span>
              <div className="flex items-center gap-1 flex-1">
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-20 bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded px-2 py-1 text-xs text-[var(--gh-text-primary)] focus:outline-none"
                />
                <span className="text-[var(--gh-text-secondary)] text-[11px]">Menit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notion Journal Body Editor with Formatting Bar */}
        <div className="rounded-md border border-[var(--gh-border)] bg-[var(--gh-surface)] overflow-hidden shadow-xs">
          {/* Notion Markdown Formatting Toolbar */}
          <div className="flex items-center gap-1 px-3 py-2 bg-[var(--gh-surface-subtle)] border-b border-[var(--gh-border)] overflow-x-auto text-xs">
            <span className="text-[10px] uppercase font-bold text-[var(--gh-text-tertiary)] mr-1">Toolbar:</span>

            <button
              type="button"
              onClick={() => insertFormatting('**', '**')}
              className="p-1.5 rounded hover:bg-[var(--gh-surface-hover)] text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] transition-colors"
              title="Tebal (Bold) **teks**"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => insertFormatting('*', '*')}
              className="p-1.5 rounded hover:bg-[var(--gh-surface-hover)] text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] transition-colors"
              title="Miring (Italic) *teks*"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-4 bg-[var(--gh-border)] mx-1" />

            <button
              type="button"
              onClick={() => insertFormatting('\n# ')}
              className="p-1.5 rounded hover:bg-[var(--gh-surface-hover)] text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] transition-colors font-bold text-xs"
              title="Heading 1"
            >
              <Heading1 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => insertFormatting('\n## ')}
              className="p-1.5 rounded hover:bg-[var(--gh-surface-hover)] text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] transition-colors font-bold text-xs"
              title="Heading 2"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-4 bg-[var(--gh-border)] mx-1" />

            <button
              type="button"
              onClick={() => insertFormatting('\n- ')}
              className="p-1.5 rounded hover:bg-[var(--gh-surface-hover)] text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] transition-colors"
              title="Bullet List"
            >
              <List className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => insertFormatting('\n1. ')}
              className="p-1.5 rounded hover:bg-[var(--gh-surface-hover)] text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] transition-colors"
              title="Numbered List"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => insertFormatting('\n- [ ] ')}
              className="p-1.5 rounded hover:bg-[var(--gh-surface-hover)] text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] transition-colors"
              title="To-Do Checklist"
            >
              <CheckSquare className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => insertFormatting('\n> 💡 ')}
              className="p-1.5 rounded hover:bg-[var(--gh-surface-hover)] text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] transition-colors"
              title="Notion Callout Box"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => insertFormatting('\n```javascript\n', '\n```\n')}
              className="p-1.5 rounded hover:bg-[var(--gh-surface-hover)] text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] transition-colors"
              title="Code Block"
            >
              <Code2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Clean Distraction-Free Journal Canvas */}
          <div className="p-4 space-y-3">
            <textarea
              ref={textareaRef}
              rows={16}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tuliskan catatan jurnal pembelajaran Anda di sini... (Ketik judul, bullet list, atau gunakan toolbar di atas)"
              className="w-full bg-transparent text-sm text-[var(--gh-text-primary)] placeholder-[var(--gh-text-tertiary)] focus:outline-none font-sans leading-relaxed resize-y min-h-[300px]"
            />

            {/* Bottom Right Image Tools on Card */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--gh-border-subtle)] text-xs">
              <div className="text-[11px] text-[var(--gh-text-tertiary)]">
                {isCompressing ? 'Mengompresi gambar otomatis...' : `${imageUrls.length} gambar dilampirkan`}
              </div>

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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--gh-border)] bg-[var(--gh-bg)] hover:bg-[var(--gh-surface-hover)] text-xs text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] transition-colors font-medium cursor-pointer"
                  title="Upload gambar dari komputer"
                >
                  <Upload className="w-3.5 h-3.5 text-[var(--gh-accent)]" />
                  <span>Upload Gambar</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowImageInput(!showImageInput)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--gh-border)] bg-[var(--gh-bg)] hover:bg-[var(--gh-surface-hover)] text-xs text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] transition-colors font-medium cursor-pointer"
                  title="Sisipkan URL Gambar Web"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>URL Gambar</span>
                </button>
              </div>
            </div>

            {/* URL Input Box */}
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

            {/* Attached Images Gallery */}
            {imageUrls.length > 0 && (
              <div className="space-y-1.5 p-3 bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md">
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
                Bila materi memiliki kode pemrograman atau rumus matematika khusus
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
            placeholder="// Tuliskan snippet kode atau rumus di sini..."
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
            className="flex items-center gap-1.5 px-5 py-2 rounded-md bg-[#1f883d] hover:bg-[#1a7f37] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{initialLog ? 'Simpan Perubahan' : 'Terbitkan Jurnal'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
