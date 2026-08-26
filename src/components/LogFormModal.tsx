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
      alert('Please enter a title for your learning note.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-md border border-[var(--gh-border)] bg-[var(--gh-bg)] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--gh-border)] bg-[var(--gh-surface)]">
          <div>
            <h2 className="text-sm font-semibold text-[var(--gh-text-primary)]">
              {initialLog ? 'Edit Learning Log' : 'New Learning Entry'}
            </h2>
            <p className="text-[11px] text-[var(--gh-text-secondary)]">
              Document your daily learnings and takeaways
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[var(--gh-surface-hover)] text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-xs">
          {/* Title */}
          <div className="space-y-1">
            <label className="font-semibold text-[var(--gh-text-primary)]">
              Title <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Understanding PostgreSQL GIN Indexing"
                className="flex-1 bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md px-3 py-1.5 text-xs text-[var(--gh-text-primary)] placeholder-[var(--gh-text-tertiary)] focus:outline-none focus:border-[var(--gh-accent)] focus:ring-1 focus:ring-[var(--gh-accent)]"
              />
              <button
                type="button"
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-1.5 rounded border border-[var(--gh-border)] transition-colors ${
                  isFavorite
                    ? 'bg-[var(--gh-surface-hover)] text-amber-500'
                    : 'bg-[var(--gh-bg)] text-[var(--gh-text-secondary)]'
                }`}
                title="Star"
              >
                <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Meta Grid: Category, Date, Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="space-y-1">
              <label className="font-semibold text-[var(--gh-text-primary)]">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md px-2.5 py-1.5 text-xs text-[var(--gh-text-primary)] focus:outline-none focus:border-[var(--gh-accent)] cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[var(--gh-bg)]">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[var(--gh-text-primary)]">Date</label>
              <input
                type="date"
                value={studyDate}
                onChange={(e) => setStudyDate(e.target.value)}
                className="w-full bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md px-2.5 py-1.5 text-xs text-[var(--gh-text-primary)] focus:outline-none focus:border-[var(--gh-accent)]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[var(--gh-text-primary)]">Duration (Minutes)</label>
              <input
                type="number"
                min="5"
                step="5"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md px-2.5 py-1.5 text-xs text-[var(--gh-text-primary)] focus:outline-none focus:border-[var(--gh-accent)]"
              />
            </div>
          </div>

          {/* Key Takeaways */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-[var(--gh-text-primary)]">
                Key Takeaways / Summary (Bullets)
              </label>
              <button
                type="button"
                onClick={handleAddTakeaway}
                className="text-[var(--gh-accent)] hover:underline flex items-center gap-1 text-[11px]"
              >
                <Plus className="w-3 h-3" /> Add bullet
              </button>
            </div>

            <div className="space-y-1.5">
              {takeaways.map((point, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-[var(--gh-text-tertiary)] w-4 text-center font-mono text-xs">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => handleUpdateTakeaway(index, e.target.value)}
                    placeholder={`Takeaway #${index + 1}...`}
                    className="flex-1 bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md px-2.5 py-1 text-xs text-[var(--gh-text-primary)] placeholder-[var(--gh-text-tertiary)] focus:outline-none focus:border-[var(--gh-accent)]"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveTakeaway(index)}
                    className="p-1 text-[var(--gh-text-secondary)] hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Markdown Content (GitHub style Write/Preview tabs) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between border-b border-[var(--gh-border)] pb-1">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('write')}
                  className={`px-3 py-1 text-xs font-semibold rounded-t-md transition-colors ${
                    activeTab === 'write'
                      ? 'bg-[var(--gh-bg)] text-[var(--gh-text-primary)] border-t border-l border-r border-[var(--gh-border)] -mb-[5px] pb-1.5'
                      : 'text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)]'
                  }`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1 text-xs font-semibold rounded-t-md transition-colors ${
                    activeTab === 'preview'
                      ? 'bg-[var(--gh-bg)] text-[var(--gh-text-primary)] border-t border-l border-r border-[var(--gh-border)] -mb-[5px] pb-1.5'
                      : 'text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)]'
                  }`}
                >
                  Preview
                </button>
              </div>

              <span className="text-[10px] text-[var(--gh-text-tertiary)]">
                Markdown supported
              </span>
            </div>

            {activeTab === 'write' ? (
              <textarea
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write detailed notes, documentation, or study summary..."
                className="w-full bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md p-2.5 text-xs text-[var(--gh-text-primary)] placeholder-[var(--gh-text-tertiary)] focus:outline-none focus:border-[var(--gh-accent)] font-mono leading-relaxed"
              />
            ) : (
              <div className="min-h-[120px] max-h-[220px] overflow-y-auto bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md p-3 text-xs prose">
                {content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                ) : (
                  <p className="text-[var(--gh-text-tertiary)] italic">Nothing to preview.</p>
                )}
              </div>
            )}
          </div>

          {/* Code Snippet */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-[var(--gh-text-primary)]">
                Code Snippet (Optional)
              </label>

              <select
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                className="bg-[var(--gh-bg)] border border-[var(--gh-border)] text-[var(--gh-text-secondary)] text-[11px] rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
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
              placeholder="// Add code snippet or query..."
              className="w-full bg-[var(--gh-code-bg)] border border-[var(--gh-border)] rounded-md p-2 text-xs font-mono text-[var(--gh-text-primary)] placeholder-[var(--gh-text-tertiary)] focus:outline-none focus:border-[var(--gh-accent)]"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label className="font-semibold text-[var(--gh-text-primary)]">
              Tags / Labels
            </label>
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[var(--gh-bg)] border border-[var(--gh-border)] rounded-md min-h-[38px]">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-[11px] bg-[var(--gh-badge-bg)] border border-[var(--gh-badge-border)] text-[var(--gh-text-secondary)] px-2 py-0.5 rounded-full"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-[var(--gh-text-primary)]"
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
                placeholder={tags.length === 0 ? "Type tag & press Enter..." : ""}
                className="flex-1 bg-transparent border-none text-xs text-[var(--gh-text-primary)] placeholder-[var(--gh-text-tertiary)] focus:outline-none min-w-[120px]"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-[var(--gh-border)] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 rounded-md text-xs font-medium border border-[var(--gh-border)] bg-[var(--gh-surface)] hover:bg-[var(--gh-surface-hover)] text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1 rounded-md bg-[#1f883d] hover:bg-[#1a7f37] text-white text-xs font-semibold shadow-sm transition-all"
            >
              {initialLog ? 'Save Changes' : 'Submit Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
