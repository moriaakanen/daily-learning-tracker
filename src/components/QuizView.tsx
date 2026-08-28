'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Trophy,
  Brain,
  Layers,
  HelpCircle,
  ChevronRight,
  Check,
  Flame,
  Star,
  Zap,
} from 'lucide-react';
import { LearningLog, QuizQuestion, FlashcardItem, QuizMode, QuizAnswerRecord } from '@/types';
import { generateQuizQuestions, generateFlashcardDeck } from '@/lib/quizEngine';
import { getTopicTheme } from '@/lib/topicTheme';

interface QuizViewProps {
  logs: LearningLog[];
  categories: string[];
  onSelectLog: (log: LearningLog) => void;
  onBackToHome: () => void;
  onOpenNewLog?: () => void;
}

type QuizViewState = 'lobby' | 'playing_quiz' | 'playing_flashcard' | 'results';

export function QuizView({
  logs,
  categories,
  onSelectLog,
  onBackToHome,
  onOpenNewLog,
}: QuizViewProps) {
  // Lobby Configuration State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [quizMode, setQuizMode] = useState<QuizMode>('multiple_choice');
  const [questionCount, setQuestionCount] = useState<number>(5);

  // Active Session State
  const [viewState, setViewState] = useState<QuizViewState>('lobby');

  // Multiple Choice Quiz State
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [answersHistory, setAnswersHistory] = useState<QuizAnswerRecord[]>([]);

  // Flashcard State
  const [flashcardDeck, setFlashcardDeck] = useState<FlashcardItem[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);
  const [flashcardRatings, setFlashcardRatings] = useState<Record<string, 'hard' | 'medium' | 'easy'>>({});

  // Compute logs available in selected category
  const availableLogsCount = useMemo(() => {
    if (selectedCategory === 'All') return logs.length;
    return logs.filter((l) => l.category?.toLowerCase() === selectedCategory.toLowerCase()).length;
  }, [logs, selectedCategory]);

  // Start Session
  const handleStartSession = () => {
    if (quizMode === 'multiple_choice') {
      const questions = generateQuizQuestions(logs, selectedCategory, questionCount);
      if (questions.length === 0) {
        alert('Belum ada materi atau catatan yang cukup untuk membuat kuis pada topik ini. Tulis catatan baru terlebih dahulu!');
        return;
      }
      setQuizQuestions(questions);
      setCurrentQuestionIndex(0);
      setSelectedOptionId(null);
      setIsAnswerSubmitted(false);
      setAnswersHistory([]);
      setViewState('playing_quiz');
    } else {
      const deck = generateFlashcardDeck(logs, selectedCategory);
      if (deck.length === 0) {
        alert('Belum ada materi atau catatan yang cukup untuk membuat flashcard pada topik ini. Tulis catatan baru terlebih dahulu!');
        return;
      }
      setFlashcardDeck(deck);
      setCurrentCardIndex(0);
      setIsCardFlipped(false);
      setFlashcardRatings({});
      setViewState('playing_flashcard');
    }
  };

  // Multiple Choice Answer Selection
  const handleSelectOption = (optionId: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOptionId(optionId);
    setIsAnswerSubmitted(true);

    const currentQ = quizQuestions[currentQuestionIndex];
    const selectedOpt = currentQ.options.find((o) => o.id === optionId);
    const isCorrect = !!selectedOpt?.isCorrect;

    setAnswersHistory((prev) => [
      ...prev,
      {
        questionId: currentQ.id,
        selectedOptionId: optionId,
        isCorrect,
        sourceLogId: currentQ.sourceLogId,
        sourceLogTitle: currentQ.sourceLogTitle,
        question: currentQ.question,
        correctAnswerText: currentQ.correctAnswerText,
        explanation: currentQ.explanation,
      },
    ]);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < quizQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswerSubmitted(false);
    } else {
      setViewState('results');
    }
  };

  // Flashcard Actions
  const handleRateFlashcard = (rating: 'hard' | 'medium' | 'easy') => {
    const currentCard = flashcardDeck[currentCardIndex];
    setFlashcardRatings((prev) => ({ ...prev, [currentCard.id]: rating }));

    if (currentCardIndex + 1 < flashcardDeck.length) {
      setCurrentCardIndex((prev) => prev + 1);
      setIsCardFlipped(false);
    } else {
      setViewState('results');
    }
  };

  // Score Calculation
  const totalScore = useMemo(() => {
    if (quizMode === 'multiple_choice') {
      const correctCount = answersHistory.filter((a) => a.isCorrect).length;
      const total = quizQuestions.length || 1;
      return {
        correct: correctCount,
        total,
        percentage: Math.round((correctCount / total) * 100),
      };
    } else {
      const easyCount = Object.values(flashcardRatings).filter((r) => r === 'easy').length;
      const total = flashcardDeck.length || 1;
      return {
        correct: easyCount,
        total,
        percentage: Math.round((easyCount / total) * 100),
      };
    }
  }, [quizMode, answersHistory, quizQuestions, flashcardRatings, flashcardDeck]);

  // =========================================================================
  // 1. LOBBY VIEW (Konfigurasi Topik & Mode Kuis)
  // =========================================================================
  if (viewState === 'lobby') {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
        {/* Banner Hero Kuis */}
        <div className="p-6 sm:p-8 rounded-3xl border border-[var(--gh-border)] bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-emerald-500/10 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold shadow-2xs">
              <Brain className="w-3.5 h-3.5" />
              <span>Active Recall & Spaced Repetition</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--gh-text-primary)] tracking-tight">
              Uji & Perkuat <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500">Ingatan Belajarmu!</span> 🎯
            </h1>

            <p className="text-xs sm:text-sm text-[var(--gh-text-secondary)] font-medium leading-relaxed max-w-2xl">
              Sistem pintar Memora secara otomatis mengekstrak gagasan kunci, istilah, dan definisi dari catatan yang pernah kamu tulis menjadi kuis interaktif yang seru!
            </p>
          </div>
        </div>

        {/* Configuration Box */}
        <div className="p-6 rounded-3xl border border-[var(--gh-border)] bg-[var(--gh-surface)] shadow-xs space-y-6">
          {/* Step 1: Pilih Topik Belajar */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold text-[var(--gh-text-primary)] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">1</span>
              <span>Pilih Topik Pembelajaran:</span>
            </label>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === 'All'
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-500/25'
                    : 'bg-[var(--gh-bg)] text-[var(--gh-text-secondary)] border-[var(--gh-border)] hover:text-[var(--gh-text-primary)]'
                }`}
              >
                <span>🌟 Semua Topik</span>
                <span className="text-[10px] opacity-90">({logs.length})</span>
              </button>

              {categories.map((cat) => {
                const count = logs.filter((l) => l.category?.toLowerCase() === cat.toLowerCase()).length;
                if (count === 0) return null;
                const theme = getTopicTheme(cat);
                const isSelected = selectedCategory === cat;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
                      isSelected ? 'shadow-sm font-extrabold ring-2 ring-offset-1' : 'opacity-90 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: isSelected ? theme.color : theme.badgeBg,
                      color: isSelected ? '#ffffff' : theme.badgeText,
                      borderColor: isSelected ? theme.color : theme.badgeBorder,
                    }}
                  >
                    <span>{theme.emoji}</span>
                    <span>{cat}</span>
                    <span className="text-[10px] opacity-90">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Pilih Mode Kuis */}
          <div className="space-y-3">
            <label className="text-xs font-extrabold text-[var(--gh-text-primary)] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px]">2</span>
              <span>Pilih Mode Latihan:</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Pilihan Ganda */}
              <div
                onClick={() => setQuizMode('multiple_choice')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                  quizMode === 'multiple_choice'
                    ? 'border-indigo-500 bg-indigo-500/10 shadow-md shadow-indigo-500/15'
                    : 'border-[var(--gh-border)] bg-[var(--gh-bg)] hover:bg-[var(--gh-surface-hover)]'
                }`}
              >
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-500 border border-indigo-500/30 flex items-center justify-center text-lg shrink-0">
                  📝
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-[var(--gh-text-primary)]">
                      Pilihan Ganda
                    </span>
                    {quizMode === 'multiple_choice' && (
                      <span className="px-2 py-0.2 rounded-full bg-indigo-500 text-white text-[9px] font-bold">
                        Aktif
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--gh-text-secondary)] leading-relaxed">
                    Uji pemahaman dengan 4 pilihan opsi cerdas. Dilengkapi skor akurasi dan pembahasan di akhir sesi.
                  </p>
                </div>
              </div>

              {/* Option 2: Flashcards */}
              <div
                onClick={() => setQuizMode('flashcard')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                  quizMode === 'flashcard'
                    ? 'border-purple-500 bg-purple-500/10 shadow-md shadow-purple-500/15'
                    : 'border-[var(--gh-border)] bg-[var(--gh-bg)] hover:bg-[var(--gh-surface-hover)]'
                }`}
              >
                <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-500 border border-purple-500/30 flex items-center justify-center text-lg shrink-0">
                  🃏
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-[var(--gh-text-primary)]">
                      Flashcard Ingatan
                    </span>
                    {quizMode === 'flashcard' && (
                      <span className="px-2 py-0.2 rounded-full bg-purple-500 text-white text-[9px] font-bold">
                        Aktif
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--gh-text-secondary)] leading-relaxed">
                    Tebak konsep di pikiran lalu balik kartu 3D untuk menguji hafalan. Cocok untuk review santai dan mendalam.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Jumlah Soal (Hanya untuk Pilihan Ganda) */}
          {quizMode === 'multiple_choice' && (
            <div className="space-y-3">
              <label className="text-xs font-extrabold text-[var(--gh-text-primary)] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px]">3</span>
                <span>Jumlah Soal Kuis:</span>
              </label>

              <div className="flex items-center gap-2">
                {[3, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuestionCount(num)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      questionCount === num
                        ? 'bg-purple-500 text-white border-purple-500 shadow-sm'
                        : 'bg-[var(--gh-bg)] text-[var(--gh-text-secondary)] border-[var(--gh-border)] hover:text-[var(--gh-text-primary)]'
                    }`}
                  >
                    {num} Soal
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[var(--gh-border)] flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBackToHome}
              className="px-4 py-2.5 rounded-full border border-[var(--gh-border)] bg-[var(--gh-bg)] hover:bg-[var(--gh-surface-hover)] text-xs font-bold text-[var(--gh-text-secondary)] transition-colors cursor-pointer"
            >
              ← Kembali ke Beranda
            </button>

            <button
              type="button"
              disabled={availableLogsCount === 0}
              onClick={handleStartSession}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white text-xs font-extrabold shadow-lg shadow-emerald-500/25 active:scale-98 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Mulai {quizMode === 'multiple_choice' ? 'Kuis Pilihan Ganda' : 'Review Flashcard'}</span>
              <Sparkles className="w-4 h-4 text-amber-300" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. PLAYING MULTIPLE CHOICE QUIZ VIEW
  // =========================================================================
  if (viewState === 'playing_quiz') {
    const currentQ = quizQuestions[currentQuestionIndex];
    const theme = getTopicTheme(currentQ.category);
    const progressPercent = Math.round(((currentQuestionIndex + 1) / quizQuestions.length) * 100);

    return (
      <div className="max-w-3xl mx-auto space-y-5 animate-in fade-in duration-150">
        {/* Progress Header */}
        <div className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-[var(--gh-border)] bg-[var(--gh-surface)] shadow-xs">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setViewState('lobby')}
              className="p-1.5 rounded-lg border border-[var(--gh-border)] bg-[var(--gh-bg)] text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] cursor-pointer text-xs"
              title="Keluar dari Kuis"
            >
              ← Batal
            </button>
            <span
              className="text-xs font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 shadow-2xs"
              style={{
                backgroundColor: theme.badgeBg,
                color: theme.badgeText,
                borderColor: theme.badgeBorder,
              }}
            >
              <span>{theme.emoji}</span>
              <span>{currentQ.category}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-[var(--gh-text-primary)]">
              Soal {currentQuestionIndex + 1} / {quizQuestions.length}
            </span>
            <div className="w-24 sm:w-32 h-2 rounded-full bg-[var(--gh-bg)] overflow-hidden border border-[var(--gh-border)]">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="p-6 sm:p-8 rounded-3xl border border-[var(--gh-border)] bg-[var(--gh-surface)] shadow-sm space-y-6">
          {/* Source reference hint */}
          <div className="text-[11px] font-semibold text-[var(--gh-text-tertiary)] flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            <span>Berdasarkan catatan: <strong className="text-[var(--gh-text-secondary)]">&quot;{currentQ.sourceLogTitle}&quot;</strong></span>
          </div>

          {/* Question Text */}
          <h2 className="text-base sm:text-lg font-extrabold text-[var(--gh-text-primary)] leading-relaxed whitespace-pre-line">
            {currentQ.question}
          </h2>

          {/* 4 Options Grid */}
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const letters = ['A', 'B', 'C', 'D'];
              const isSelected = selectedOptionId === opt.id;
              const showCorrectness = isAnswerSubmitted;

              let optionStyle = 'border-[var(--gh-border)] bg-[var(--gh-bg)] hover:bg-[var(--gh-surface-hover)] text-[var(--gh-text-primary)]';

              if (showCorrectness) {
                if (opt.isCorrect) {
                  optionStyle = 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-extrabold ring-2 ring-emerald-500/40 shadow-sm';
                } else if (isSelected && !opt.isCorrect) {
                  optionStyle = 'border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300 font-bold';
                } else {
                  optionStyle = 'border-[var(--gh-border)] bg-[var(--gh-bg)] opacity-50';
                }
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isAnswerSubmitted}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`w-full p-4 rounded-2xl border-2 text-left text-xs sm:text-sm font-medium transition-all flex items-start gap-3.5 cursor-pointer disabled:cursor-default ${optionStyle}`}
                >
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 transition-colors ${
                      showCorrectness && opt.isCorrect
                        ? 'bg-emerald-500 text-white'
                        : showCorrectness && isSelected && !opt.isCorrect
                        ? 'bg-rose-500 text-white'
                        : 'bg-[var(--gh-surface)] border border-[var(--gh-border)] text-[var(--gh-text-secondary)]'
                    }`}
                  >
                    {showCorrectness && opt.isCorrect ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : showCorrectness && isSelected && !opt.isCorrect ? (
                      <XCircle className="w-4 h-4" />
                    ) : (
                      letters[idx]
                    )}
                  </span>
                  <span className="flex-1 pt-0.5 leading-relaxed">{opt.text}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation Banner when answered */}
          {isAnswerSubmitted && (
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 space-y-1.5 animate-in fade-in duration-150">
              <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pembahasan Catatan:</span>
              </div>
              <p className="text-xs text-[var(--gh-text-secondary)] leading-relaxed whitespace-pre-line">
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Next Question Button */}
          {isAnswerSubmitted && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleNextQuestion}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 active:scale-98 transition-all cursor-pointer"
              >
                <span>{currentQuestionIndex + 1 < quizQuestions.length ? 'Lanjut Soal Berikutnya' : 'Lihat Hasil Akhir'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. PLAYING FLASHCARD VIEW (Interactive 3D Active Recall Flip Card)
  // =========================================================================
  if (viewState === 'playing_flashcard') {
    const currentCard = flashcardDeck[currentCardIndex];
    const theme = getTopicTheme(currentCard.category);
    const progressPercent = Math.round(((currentCardIndex + 1) / flashcardDeck.length) * 100);

    return (
      <div className="max-w-2xl mx-auto space-y-5 animate-in fade-in duration-150">
        {/* Header Progress */}
        <div className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-[var(--gh-border)] bg-[var(--gh-surface)] shadow-xs">
          <button
            type="button"
            onClick={() => setViewState('lobby')}
            className="p-1.5 rounded-lg border border-[var(--gh-border)] bg-[var(--gh-bg)] text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] cursor-pointer text-xs"
          >
            ← Batal
          </button>

          <span
            className="text-xs font-bold px-3 py-0.5 rounded-full border flex items-center gap-1"
            style={{
              backgroundColor: theme.badgeBg,
              color: theme.badgeText,
              borderColor: theme.badgeBorder,
            }}
          >
            <span>{theme.emoji}</span>
            <span>{currentCard.category}</span>
          </span>

          <span className="text-xs font-extrabold text-[var(--gh-text-primary)]">
            Kartu {currentCardIndex + 1} / {flashcardDeck.length}
          </span>
        </div>

        {/* 3D Flip Card Container */}
        <div
          onClick={() => setIsCardFlipped(!isCardFlipped)}
          className="relative min-h-[320px] sm:min-h-[360px] rounded-3xl border-2 border-[var(--gh-border)] bg-[var(--gh-surface)] p-6 sm:p-8 flex flex-col justify-between cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 select-none group"
          style={{
            borderTopWidth: '6px',
            borderTopColor: theme.color,
          }}
        >
          {/* Card Tag Top */}
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[var(--gh-text-tertiary)] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              <span>{currentCard.sourceLogTitle}</span>
            </span>

            <span className="text-[11px] text-indigo-500 font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-1">
              <span>🔄</span>
              <span>{isCardFlipped ? 'Sisi Jawaban' : 'Sisi Pertanyaan'}</span>
            </span>
          </div>

          {/* Card Body Content */}
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
            {!isCardFlipped ? (
              // Front: Trigger Prompt
              <div className="space-y-3">
                <div className="text-3xl animate-bounce">🤔</div>
                <h2 className="text-lg sm:text-xl font-extrabold text-[var(--gh-text-primary)] leading-relaxed max-w-lg">
                  {currentCard.frontPrompt}
                </h2>
                <p className="text-xs text-[var(--gh-text-tertiary)] font-medium">
                  (Coba jawab dalam pikiranmu, lalu klik kartu ini untuk melihat jawaban)
                </p>
              </div>
            ) : (
              // Back: Rich Answer & Takeaways
              <div className="space-y-4 text-left w-full animate-in zoom-in-95 duration-200">
                <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Kunci Penjelasan:</span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--gh-text-primary)] leading-relaxed font-medium bg-[var(--gh-bg)] p-4 rounded-2xl border border-[var(--gh-border)]">
                  {currentCard.backAnswer}
                </p>

                {currentCard.takeaways && currentCard.takeaways.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-[var(--gh-text-secondary)]">
                      📌 Gagasan Kunci:
                    </div>
                    <ul className="list-disc list-inside text-xs text-[var(--gh-text-secondary)] space-y-1">
                      {currentCard.takeaways.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Flip prompt footer */}
          <div className="text-center text-xs font-bold text-indigo-500 group-hover:underline flex items-center justify-center gap-1.5">
            <span>{isCardFlipped ? 'Klik kartu untuk membalik kembali' : 'Klik kartu untuk melihat kunci jawaban ➔'}</span>
          </div>
        </div>

        {/* Self-Rating Assessment Buttons (Visible when flipped) */}
        {isCardFlipped && (
          <div className="p-4 rounded-2xl border border-[var(--gh-border)] bg-[var(--gh-surface)] shadow-xs space-y-2.5 animate-in fade-in duration-150">
            <div className="text-xs font-extrabold text-[var(--gh-text-primary)] text-center">
              Seberapa baik kamu mengingat materi ini?
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => handleRateFlashcard('hard')}
                className="py-2.5 px-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-extrabold text-xs transition-all cursor-pointer flex flex-col items-center gap-1"
              >
                <span>🔴 Belum Ingat</span>
                <span className="text-[10px] opacity-80 font-normal">Perlu diulang</span>
              </button>

              <button
                type="button"
                onClick={() => handleRateFlashcard('medium')}
                className="py-2.5 px-2 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold text-xs transition-all cursor-pointer flex flex-col items-center gap-1"
              >
                <span>🟡 Ragu-Ragu</span>
                <span className="text-[10px] opacity-80 font-normal">Hampir ingat</span>
              </button>

              <button
                type="button"
                onClick={() => handleRateFlashcard('easy')}
                className="py-2.5 px-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs transition-all cursor-pointer flex flex-col items-center gap-1 shadow-xs"
              >
                <span>🟢 Sudah Paham!</span>
                <span className="text-[10px] opacity-80 font-normal">Ingat jelas</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 4. RESULTS & ACTIVE RECALL REVIEW VIEW
  // =========================================================================
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Hero Score Card */}
      <div className="p-6 sm:p-8 rounded-3xl border border-[var(--gh-border)] bg-gradient-to-br from-emerald-500/15 via-teal-500/5 to-indigo-500/15 text-center space-y-4 shadow-sm relative overflow-hidden">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-emerald-400 to-indigo-500 text-white flex items-center justify-center text-2xl sm:text-3xl font-extrabold mx-auto shadow-lg shadow-emerald-500/30">
          <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300" />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--gh-text-primary)]">
            {totalScore.percentage >= 80
              ? 'Luar Biasa! Ingatanmu Tajam! 🎉'
              : totalScore.percentage >= 60
              ? 'Bagus Sekali, Terus Bertumbuh! 🌱'
              : 'Semangat! Terus Latih Ingatanmu! 💪'}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--gh-text-secondary)] font-medium">
            Tingkat penguasaan materi: <strong className="text-[var(--gh-text-primary)]">{totalScore.percentage}%</strong> ({totalScore.correct} dari {totalScore.total} konsep dikuasai).
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleStartSession}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--gh-accent)] text-white text-xs font-bold shadow-md shadow-[var(--gh-accent)]/20 hover:opacity-90 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Ulangi Sesi Kuis</span>
          </button>

          <button
            type="button"
            onClick={() => setViewState('lobby')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[var(--gh-border)] bg-[var(--gh-surface)] hover:bg-[var(--gh-surface-hover)] text-xs font-bold text-[var(--gh-text-primary)] transition-all cursor-pointer"
          >
            <span>Ganti Topik / Mode</span>
          </button>

          <button
            type="button"
            onClick={onBackToHome}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[var(--gh-border)] bg-[var(--gh-bg)] hover:bg-[var(--gh-surface-hover)] text-xs font-bold text-[var(--gh-text-secondary)] transition-all cursor-pointer"
          >
            <span>Kembali ke Beranda</span>
          </button>
        </div>
      </div>

      {/* Review Breakdown: List of Tested Concepts with Link to Read Note */}
      {quizMode === 'multiple_choice' && answersHistory.length > 0 && (
        <div className="p-6 rounded-3xl border border-[var(--gh-border)] bg-[var(--gh-surface)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[var(--gh-text-primary)] flex items-center gap-2">
              <span>📋 Evaluasi Pemahaman Materi:</span>
            </h3>
            <span className="text-xs text-[var(--gh-text-secondary)] font-medium">
              Klik catatan untuk baca ulang
            </span>
          </div>

          <div className="space-y-3">
            {answersHistory.map((item, i) => {
              const matchedLog = logs.find((l) => l.id === item.sourceLogId);

              return (
                <div
                  key={i}
                  className={`p-4 rounded-2xl border transition-all space-y-2 ${
                    item.isCorrect
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-rose-500/30 bg-rose-500/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">
                        {item.isCorrect ? '✅' : '❌'}
                      </span>
                      <span className="text-xs font-extrabold text-[var(--gh-text-primary)]">
                        Soal {i + 1}
                      </span>
                    </div>

                    {matchedLog && (
                      <button
                        type="button"
                        onClick={() => onSelectLog(matchedLog)}
                        className="flex items-center gap-1 text-[11px] font-bold text-indigo-500 hover:text-indigo-600 hover:underline cursor-pointer"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>Baca Catatan Ini</span>
                      </button>
                    )}
                  </div>

                  <p className="text-xs font-semibold text-[var(--gh-text-secondary)] leading-relaxed">
                    {item.question}
                  </p>

                  <div className="text-xs text-[var(--gh-text-primary)] font-medium bg-[var(--gh-surface)] p-2.5 rounded-xl border border-[var(--gh-border)]">
                    <strong className="text-emerald-600 dark:text-emerald-400">Kunci Jawaban: </strong>
                    {item.correctAnswerText}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
