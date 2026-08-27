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
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Highlighter,
  Type,
  Minus,
  Keyboard,
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

const FONT_COLORS = [
  { name: 'Default', value: 'inherit' },
  { name: 'Merah', value: '#ef4444' },
  { name: 'Biru', value: '#3b82f6' },
  { name: 'Hijau', value: '#10b981' },
  { name: 'Kuning Emas', value: '#f59e0b' },
  { name: 'Ungu', value: '#8b5cf6' },
  { name: 'Oranye', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
];

const HIGHLIGHT_COLORS = [
  { name: 'Hapus Stabilo', value: 'transparent' },
  { name: 'Kuning Stabilo', value: '#fef08a' },
  { name: 'Hijau Stabilo', value: '#bbf7d0' },
  { name: 'Biru Stabilo', value: '#bae6fd' },
  { name: 'Pink Stabilo', value: '#fbcfe8' },
  { name: 'Ungu Stabilo', value: '#e9d5ff' },
];

const SHORTCUTS_LIST = [
  { key: 'Ctrl + B', label: 'Tebal (Bold)' },
  { key: 'Ctrl + I', label: 'Miring (Italic)' },
  { key: 'Ctrl + U', label: 'Garis Bawah (Underline)' },
  { key: 'Ctrl + Shift + X', label: 'Coret (Strikethrough)' },
  { key: 'Ctrl + 1', label: 'Judul Besar (Heading 1)' },
  { key: 'Ctrl + 2', label: 'Sub-Judul (Heading 2)' },
  { key: 'Ctrl + 3', label: 'Poin Penting (Heading 3)' },
  { key: 'Ctrl + 0', label: 'Teks Normal (Paragraf)' },
  { key: 'Ctrl + Shift + 7', label: 'Daftar Penomoran (1. 2. 3.)' },
  { key: 'Ctrl + Shift + 8', label: 'Daftar Poin (Bullet •)' },
  { key: 'Ctrl + Shift + 9', label: 'Kutipan (Blockquote)' },
  { key: 'Ctrl + Shift + H', label: 'Stabilo Cepat (Kuning)' },
  { key: 'Tab / Shift + Tab', label: 'Indent / Outdent Teks' },
  { key: 'Ctrl + S', label: 'Simpan / Terbitkan Catatan' },
  { key: 'Ctrl + Z / Ctrl + Y', label: 'Undo / Redo' },
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
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Teknologi & Coding');
  const [cardColor, setCardColor] = useState('auto');
  const [studyDate, setStudyDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState(30);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  // Formatting popovers
  const [showColorPopover, setShowColorPopover] = useState(false);
  const [showHighlightPopover, setShowHighlightPopover] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Custom Topic modal inside editor
  const [showCustomTopicInput, setShowCustomTopicInput] = useState(false);
  const [customTopicName, setCustomTopicName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Initialize or reset content in visual contentEditable canvas
  useEffect(() => {
    if (initialLog) {
      setTitle(initialLog.title || '');
      setCategory(initialLog.category || 'Teknologi & Coding');
      setCardColor(initialLog.card_color || 'auto');
      setStudyDate(initialLog.study_date || new Date().toISOString().split('T')[0]);
      setDuration(initialLog.duration_minutes || 30);
      setCodeSnippet(initialLog.code_snippet || '');
      setCodeLanguage(initialLog.code_language || 'javascript');
      setIsFavorite(!!initialLog.is_favorite);
      setImageUrls(initialLog.image_urls || []);

      if (editorRef.current) {
        editorRef.current.innerHTML = initialLog.content || '';
      }
    } else {
      setTitle('');
      setCategory('Teknologi & Coding');
      setCardColor('auto');
      setStudyDate(new Date().toISOString().split('T')[0]);
      setDuration(30);
      setCodeSnippet('');
      setCodeLanguage('javascript');
      setIsFavorite(false);
      setImageUrls([]);

      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
    }
  }, [initialLog]);

  // Execute rich text formatting directly on selection
  const execCmd = (command: string, value: string | undefined = undefined) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
  };

  // Font color formatting
  const handleFontColor = (colorHex: string) => {
    execCmd('foreColor', colorHex);
    setShowColorPopover(false);
  };

  // Highlighter formatting
  const handleHighlight = (bgHex: string) => {
    execCmd('hiliteColor', bgHex);
    setShowHighlightPopover(false);
  };

  // Font family formatting
  const handleFontFamily = (fontFamily: string) => {
    if (!fontFamily || fontFamily === 'default') {
      execCmd('fontName', 'Plus Jakarta Sans');
    } else {
      execCmd('fontName', fontFamily);
    }
  };

  // Toggle Blockquote ON / OFF (Cancelable)
  const toggleBlockquote = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      execCmd('formatBlock', '<blockquote>');
      return;
    }

    let node: Node | null = selection.anchorNode;
    let isInsideBlockquote = false;
    let blockquoteNode: HTMLElement | null = null;

    while (node && node !== editorRef.current) {
      if (node.nodeName === 'BLOCKQUOTE') {
        isInsideBlockquote = true;
        blockquoteNode = node as HTMLElement;
        break;
      }
      node = node.parentNode;
    }

    if (isInsideBlockquote) {
      // Revert from blockquote back to standard paragraph <p>
      document.execCommand('formatBlock', false, '<p>');

      // Ensure clean unwrapping if blockquote container remains
      if (blockquoteNode && blockquoteNode.parentNode && blockquoteNode.nodeName === 'BLOCKQUOTE') {
        const parent = blockquoteNode.parentNode;
        while (blockquoteNode.firstChild) {
          parent.insertBefore(blockquoteNode.firstChild, blockquoteNode);
        }
        parent.removeChild(blockquoteNode);
      }
    } else {
      document.execCommand('formatBlock', false, '<blockquote>');
    }
  };

  // Toggle Heading ON / OFF (Cancelable)
  const toggleHeading = (tag: 'h1' | 'h2' | 'h3') => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    const selection = window.getSelection();
    let isCurrentHeading = false;
    if (selection && selection.rangeCount > 0) {
      let node: Node | null = selection.anchorNode;
      while (node && node !== editorRef.current) {
        if (node.nodeName.toLowerCase() === tag) {
          isCurrentHeading = true;
          break;
        }
        node = node.parentNode;
      }
    }

    if (isCurrentHeading) {
      document.execCommand('formatBlock', false, '<p>');
    } else {
      document.execCommand('formatBlock', false, `<${tag}>`);
    }
  };

  // Font size / headings formatting
  const handleFontSize = (sizeOption: string) => {
    switch (sizeOption) {
      case 'h1':
        toggleHeading('h1');
        break;
      case 'h2':
        toggleHeading('h2');
        break;
      case 'h3':
        toggleHeading('h3');
        break;
      case 'large':
        execCmd('fontSize', '5');
        break;
      case 'small':
        execCmd('fontSize', '2');
        break;
      case 'normal':
      default:
        execCmd('formatBlock', '<p>');
        break;
    }
  };

  // Comprehensive Keyboard Shortcuts Handler (Word Processor standard)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const isCtrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

    if (isCtrlOrCmd) {
      const key = e.key.toLowerCase();

      // Bold: Ctrl + B
      if (key === 'b' && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        execCmd('bold');
        return;
      }

      // Italic: Ctrl + I
      if (key === 'i' && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        execCmd('italic');
        return;
      }

      // Underline: Ctrl + U
      if (key === 'u' && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        execCmd('underline');
        return;
      }

      // Strikethrough: Ctrl + Shift + X or Ctrl + Shift + S
      if ((key === 'x' || key === 's') && e.shiftKey) {
        e.preventDefault();
        execCmd('strikeThrough');
        return;
      }

      // Highlight / Stabilo: Ctrl + Shift + H
      if (key === 'h' && e.shiftKey) {
        e.preventDefault();
        handleHighlight('#fef08a');
        return;
      }

      // Numbered list: Ctrl + Shift + 7 or Ctrl + Shift + O
      if ((e.key === '7' || key === 'o' || e.code === 'Digit7') && e.shiftKey) {
        e.preventDefault();
        execCmd('insertOrderedList');
        return;
      }

      // Bullet list: Ctrl + Shift + 8 or Ctrl + Shift + U
      if ((e.key === '8' || key === 'u' || e.code === 'Digit8') && e.shiftKey) {
        e.preventDefault();
        execCmd('insertUnorderedList');
        return;
      }

      // Quote (Toggle on/off): Ctrl + Shift + 9 or Ctrl + Shift + Q
      if ((e.key === '9' || key === 'q' || e.code === 'Digit9') && e.shiftKey) {
        e.preventDefault();
        toggleBlockquote();
        return;
      }

      // Headings (Toggle on/off): Ctrl + 1, Ctrl + 2, Ctrl + 3, Ctrl + 0
      if ((e.key === '1' || e.code === 'Digit1') && !e.shiftKey) {
        e.preventDefault();
        toggleHeading('h1');
        return;
      }
      if ((e.key === '2' || e.code === 'Digit2') && !e.shiftKey) {
        e.preventDefault();
        toggleHeading('h2');
        return;
      }
      if ((e.key === '3' || e.code === 'Digit3') && !e.shiftKey) {
        e.preventDefault();
        toggleHeading('h3');
        return;
      }
      if ((e.key === '0' || e.code === 'Digit0') && !e.shiftKey) {
        e.preventDefault();
        execCmd('formatBlock', '<p>');
        return;
      }

      // Save note shortcut: Ctrl + S
      if (key === 's' && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        handleSubmit(e as unknown as React.FormEvent);
        return;
      }
    }

    // Tab key: Indent / Outdent
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        execCmd('outdent');
      } else {
        execCmd('indent');
      }
    }
  };

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

    const currentHtmlContent = editorRef.current ? editorRef.current.innerHTML : '';

    onSave(
      {
        title: title.trim(),
        category,
        card_color: cardColor,
        study_date: studyDate,
        duration_minutes: Number(duration) || 30,
        takeaways: [],
        tags: [],
        content: currentHtmlContent,
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
            title="Simpan Catatan (Ctrl + S)"
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

        {/* Card Catatan Lengkap with True Visual WYSIWYG Editor & Keyboard Shortcuts */}
        <div className="rounded-2xl border border-[var(--gh-border)] bg-[var(--gh-surface)] p-4 sm:p-5 space-y-3 shadow-xs">
          {/* Card Header & Shortcut Cheatsheet Button */}
          <div className="border-b border-[var(--gh-border)] pb-2.5 flex items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-[var(--gh-text-primary)] flex items-center gap-1.5">
                <span>📝 Catatan Lengkap</span>
              </h3>
              <p className="text-[11px] text-[var(--gh-text-secondary)] font-medium">
                Tulis langsung dengan gaya visual — mendukung pintasan keyboard seperti di Word / Google Docs!
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowShortcutsModal(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-[var(--gh-border)] bg-[var(--gh-bg)] hover:bg-[var(--gh-surface-hover)] text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] transition-all cursor-pointer shadow-2xs shrink-0"
              title="Lihat Daftar Pintasan Keyboard"
            >
              <Keyboard className="w-3.5 h-3.5 text-indigo-500" />
              <span>Pintasan Keyboard</span>
            </button>
          </div>

          {/* Visual Formatting Toolbar */}
          <div className="p-2 bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-xl flex flex-wrap items-center gap-1.5 shadow-2xs">
            {/* 1. Font Family Selector */}
            <div className="flex items-center gap-1 border-r border-[var(--gh-border)] pr-1.5">
              <Type className="w-3.5 h-3.5 text-[var(--gh-text-secondary)] ml-1" />
              <select
                onMouseDown={(e) => e.stopPropagation()}
                onChange={(e) => handleFontFamily(e.target.value)}
                defaultValue="default"
                className="bg-transparent border-none text-[11px] font-bold text-[var(--gh-text-primary)] focus:outline-none cursor-pointer py-1"
                title="Pilih Jenis Font"
              >
                <option value="default" className="bg-[var(--gh-surface)]">Font: Sans</option>
                <option value="serif" className="bg-[var(--gh-surface)]">Font: Serif</option>
                <option value="'JetBrains Mono', monospace" className="bg-[var(--gh-surface)]">Font: Monospace</option>
                <option value="cursive" className="bg-[var(--gh-surface)]">Font: Tulisan Tangan</option>
              </select>
            </div>

            {/* 2. Ukuran Font / Heading Selector */}
            <div className="flex items-center gap-1 border-r border-[var(--gh-border)] pr-1.5">
              <select
                onMouseDown={(e) => e.stopPropagation()}
                onChange={(e) => handleFontSize(e.target.value)}
                defaultValue="normal"
                className="bg-transparent border-none text-[11px] font-bold text-[var(--gh-text-primary)] focus:outline-none cursor-pointer py-1"
                title="Ukuran Font & Heading (Ctrl + 1/2/3/0)"
              >
                <option value="normal" className="bg-[var(--gh-surface)]">Normal (Ctrl + 0)</option>
                <option value="h1" className="bg-[var(--gh-surface)]">H1 - Judul Besar (Ctrl + 1)</option>
                <option value="h2" className="bg-[var(--gh-surface)]">H2 - Sub Judul (Ctrl + 2)</option>
                <option value="h3" className="bg-[var(--gh-surface)]">H3 - Poin Penting (Ctrl + 3)</option>
                <option value="large" className="bg-[var(--gh-surface)]">Teks Besar</option>
                <option value="small" className="bg-[var(--gh-surface)]">Teks Kecil</option>
              </select>
            </div>

            {/* 3. Basic Inline Text Styling with Shortcut Tooltips */}
            <div className="flex items-center gap-0.5 border-r border-[var(--gh-border)] pr-1.5">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  execCmd('bold');
                }}
                className="p-1.5 rounded-lg hover:bg-[var(--gh-surface)] text-[var(--gh-text-primary)] font-bold transition-colors cursor-pointer"
                title="Tebal (Ctrl + B)"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  execCmd('italic');
                }}
                className="p-1.5 rounded-lg hover:bg-[var(--gh-surface)] text-[var(--gh-text-primary)] transition-colors cursor-pointer"
                title="Miring (Ctrl + I)"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  execCmd('underline');
                }}
                className="p-1.5 rounded-lg hover:bg-[var(--gh-surface)] text-[var(--gh-text-primary)] transition-colors cursor-pointer"
                title="Garis Bawah (Ctrl + U)"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  execCmd('strikeThrough');
                }}
                className="p-1.5 rounded-lg hover:bg-[var(--gh-surface)] text-[var(--gh-text-primary)] transition-colors cursor-pointer"
                title="Coret (Ctrl + Shift + X)"
              >
                <Strikethrough className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 4. Numbering, Bullets */}
            <div className="flex items-center gap-0.5 border-r border-[var(--gh-border)] pr-1.5">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  execCmd('insertOrderedList');
                }}
                className="p-1.5 rounded-lg hover:bg-[var(--gh-surface)] text-[var(--gh-text-primary)] transition-colors cursor-pointer"
                title="Penomoran (Ctrl + Shift + 7)"
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  execCmd('insertUnorderedList');
                }}
                className="p-1.5 rounded-lg hover:bg-[var(--gh-surface)] text-[var(--gh-text-primary)] transition-colors cursor-pointer"
                title="Daftar Poin (Ctrl + Shift + 8)"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 5. Font Color Picker Popover */}
            <div className="relative flex items-center">
              <button
                type="button"
                onClick={() => {
                  setShowColorPopover(!showColorPopover);
                  setShowHighlightPopover(false);
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  showColorPopover
                    ? 'bg-indigo-500/15 text-indigo-500'
                    : 'hover:bg-[var(--gh-surface)] text-[var(--gh-text-primary)]'
                }`}
                title="Warna Font Teks"
              >
                <Palette className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-[11px]">Warna Font</span>
              </button>

              {showColorPopover && (
                <div className="absolute left-0 top-8 z-30 p-2 rounded-xl border border-[var(--gh-border)] bg-[var(--gh-surface)] shadow-xl w-48 space-y-1.5 animate-in fade-in duration-150">
                  <div className="text-[10px] font-bold text-[var(--gh-text-secondary)] px-1">
                    Pilih Warna Tulisan:
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 p-1">
                    {FONT_COLORS.map((col) => (
                      <button
                        key={col.name}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleFontColor(col.value);
                        }}
                        className="w-7 h-7 rounded-full border border-black/10 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer shadow-2xs"
                        style={{ backgroundColor: col.value === 'inherit' ? 'var(--gh-text-primary)' : col.value }}
                        title={col.name}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 6. Highlighter / Stabilo Popover */}
            <div className="relative flex items-center border-r border-[var(--gh-border)] pr-1.5">
              <button
                type="button"
                onClick={() => {
                  setShowHighlightPopover(!showHighlightPopover);
                  setShowColorPopover(false);
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  showHighlightPopover
                    ? 'bg-amber-500/15 text-amber-600'
                    : 'hover:bg-[var(--gh-surface)] text-[var(--gh-text-primary)]'
                }`}
                title="Stabilo (Ctrl + Shift + H)"
              >
                <Highlighter className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[11px]">Stabilo</span>
              </button>

              {showHighlightPopover && (
                <div className="absolute left-0 top-8 z-30 p-2 rounded-xl border border-[var(--gh-border)] bg-[var(--gh-surface)] shadow-xl w-44 space-y-1.5 animate-in fade-in duration-150">
                  <div className="text-[10px] font-bold text-[var(--gh-text-secondary)] px-1">
                    Warna Stabilo:
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 p-1">
                    {HIGHLIGHT_COLORS.map((hl) => (
                      <button
                        key={hl.name}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleHighlight(hl.value);
                        }}
                        className="h-6 rounded-md border border-black/10 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer shadow-2xs text-[10px] font-bold px-1"
                        style={{ backgroundColor: hl.value === 'transparent' ? 'var(--gh-bg)' : hl.value, color: hl.value === 'transparent' ? 'var(--gh-text-secondary)' : '#000000' }}
                        title={hl.name}
                      >
                        {hl.value === 'transparent' ? 'Reset' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 7. Extra Elements: Blockquote, Divider */}
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  toggleBlockquote();
                }}
                className="p-1.5 rounded-lg hover:bg-[var(--gh-surface)] text-[var(--gh-text-primary)] transition-colors cursor-pointer"
                title="Kutipan / Batal Kutipan (Ctrl + Shift + 9)"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  execCmd('insertHorizontalRule');
                }}
                className="p-1.5 rounded-lg hover:bg-[var(--gh-surface)] text-[var(--gh-text-primary)] transition-colors cursor-pointer"
                title="Garis Pembatas Horizontal"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Visual WYSIWYG ContentEditable Writing Canvas with Full Keyboard Shortcut Support */}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onKeyDown={handleKeyDown}
            data-placeholder="Tuliskan materi pembelajaran, catatan penting, atau gunakan toolbar & shortcut keyboard (Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+1/2/3, dll)..."
            className="w-full bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-xl p-4 text-xs text-[var(--gh-text-primary)] focus:outline-none focus:border-indigo-500 font-sans leading-relaxed min-h-[280px] max-h-[500px] overflow-y-auto prose max-w-none shadow-2xs"
          />

          {/* Toolbar on Bottom Right of Card */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="text-[11px] text-[var(--gh-text-tertiary)] flex items-center gap-2 font-medium">
              <span>{isCompressing ? '⏳ Mengompresi gambar...' : `🖼️ ${imageUrls.length} gambar dilampirkan`}</span>
              <span>•</span>
              <span className="text-[10px] text-[var(--gh-text-secondary)]">💡 Tekan <kbd className="px-1 py-0.5 bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded text-[10px] font-mono">Ctrl+S</kbd> untuk simpan</span>
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

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      {showShortcutsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowShortcutsModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-2xl border border-[var(--gh-border)] bg-[var(--gh-surface)] p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--gh-border)] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                  <Keyboard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--gh-text-primary)]">
                    Pintasan Keyboard (Keyboard Shortcuts)
                  </h3>
                  <p className="text-[11px] text-[var(--gh-text-secondary)]">
                    Gunakan shortcut pengolah kata standar saat mengetik catatan
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="p-1 rounded-lg text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] hover:bg-[var(--gh-bg)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Shortcut Grid Table */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-1">
              {SHORTCUTS_LIST.map((sc, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--gh-bg)] border border-[var(--gh-border)] text-xs"
                >
                  <span className="text-[var(--gh-text-secondary)] font-medium text-[11px] truncate pr-2">
                    {sc.label}
                  </span>
                  <kbd className="px-2 py-0.5 rounded-md bg-[var(--gh-surface)] border border-[var(--gh-border)] text-[10px] font-mono font-bold text-[var(--gh-text-primary)] shrink-0 shadow-2xs">
                    {sc.key}
                  </kbd>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[var(--gh-border)] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Mengerti, Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
