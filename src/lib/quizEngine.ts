/**
 * Smart Client-Side NLP Quiz & Flashcard Engine
 * Extracts learning concepts, definitions, purpose, takeaways, and rules
 * from user notes to generate interactive quizzes and flashcards.
 */

import { LearningLog, QuizQuestion, QuizOption, FlashcardItem } from '@/types';

interface ExtractedConcept {
  term: string;
  definition: string;
  type: 'definition' | 'purpose' | 'takeaway' | 'comparison' | 'rule';
  sourceLogId: string;
  sourceLogTitle: string;
  category: string;
}

/**
 * Strips HTML tags and Markdown formatting to obtain clean plain text
 */
export function cleanText(raw: string = ''): string {
  return raw
    .replace(/<[^>]*>/g, ' ')
    .replace(/!\[.*?\]\(.*?\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/```[\s\S]*?```/g, '') // remove code blocks from sentence parser
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    .replace(/_{1,3}([^_]+)_{1,3}/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Splits plain text into meaningful sentences
 */
function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);
}

/**
 * Fisher-Yates array shuffle
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Extracts semantic concepts, definitions, and functions from a single log
 */
export function extractConceptsFromLog(log: LearningLog): ExtractedConcept[] {
  const concepts: ExtractedConcept[] = [];
  const rawContent = log.content || '';
  const cleaned = cleanText(rawContent);
  const sentences = splitIntoSentences(cleaned);

  // 1. Check Takeaways
  if (Array.isArray(log.takeaways) && log.takeaways.length > 0) {
    log.takeaways.forEach((t) => {
      const cleanT = cleanText(t);
      if (cleanT.length > 12) {
        concepts.push({
          term: log.title,
          definition: cleanT,
          type: 'takeaway',
          sourceLogId: log.id,
          sourceLogTitle: log.title,
          category: log.category,
        });
      }
    });
  }

  // 2. Pattern Matching over Sentences
  sentences.forEach((sentence) => {
    // A. Pattern: "X adalah / merupakan / yaitu / yakni Y"
    const defMatch = sentence.match(
      /([A-Za-z0-9\s\-&_+]{3,40}?)\s+(?:adalah|merupakan|ialah|yaitu|yakni|diartikan sebagai|didefinisikan sebagai|dikenal sebagai|is defined as|refers to|is essentially)\s+([^.!?]{15,})/i
    );
    if (defMatch && defMatch[1] && defMatch[2]) {
      const term = defMatch[1].trim();
      const def = defMatch[2].trim();
      if (term.length > 2 && def.length > 10) {
        concepts.push({
          term,
          definition: def,
          type: 'definition',
          sourceLogId: log.id,
          sourceLogTitle: log.title,
          category: log.category,
        });
      }
    }

    // B. Pattern: "X digunakan untuk / berfungsi untuk / bertujuan untuk / dipakai untuk Y"
    const purposeMatch = sentence.match(
      /([A-Za-z0-9\s\-&_+]{3,40}?)\s+(?:digunakan untuk|berfungsi untuk|bertujuan untuk|dipakai untuk|berguna untuk|berperan dalam|memungkinkan kita untuk|is used to|is used for|serves as|aims to|allows us to)\s+([^.!?]{12,})/i
    );
    if (purposeMatch && purposeMatch[1] && purposeMatch[2]) {
      const term = purposeMatch[1].trim();
      const action = purposeMatch[2].trim();
      if (term.length > 2 && action.length > 8) {
        concepts.push({
          term,
          definition: `Digunakan untuk ${action}`,
          type: 'purpose',
          sourceLogId: log.id,
          sourceLogTitle: log.title,
          category: log.category,
        });
      }
    }

    // C. Pattern: "Gunakan X ketika / saat Y"
    const ruleMatch = sentence.match(
      /(?:gunakan|pakai|use)\s+([A-Za-z0-9\s\-&_+]{3,40}?)\s+(?:ketika|saat|jika|when)\s+([^.!?]{12,})/i
    );
    if (ruleMatch && ruleMatch[1] && ruleMatch[2]) {
      concepts.push({
        term: ruleMatch[1].trim(),
        definition: `Dianjurkan digunakan ketika ${ruleMatch[2].trim()}`,
        type: 'rule',
        sourceLogId: log.id,
        sourceLogTitle: log.title,
        category: log.category,
      });
    }

    // D. Pattern: Acronym Expansion "ACID (Atomicity, Consistency...)"
    const acronymMatch = sentence.match(
      /([A-Z0-9]{2,8})\s*\(\s*([A-Za-z\s\-]{4,50}?)\s*\)/
    );
    if (acronymMatch && acronymMatch[1] && acronymMatch[2]) {
      concepts.push({
        term: acronymMatch[1].trim(),
        definition: `Kepanjangan dari ${acronymMatch[2].trim()}`,
        type: 'definition',
        sourceLogId: log.id,
        sourceLogTitle: log.title,
        category: log.category,
      });
    }
  });

  // 3. Fallback Concept if note is short or purely descriptive
  if (concepts.length === 0) {
    const summary = cleaned.slice(0, 180).trim();
    if (summary) {
      concepts.push({
        term: log.title,
        definition: summary,
        type: 'takeaway',
        sourceLogId: log.id,
        sourceLogTitle: log.title,
        category: log.category,
      });
    }
  }

  return concepts;
}

/**
 * Generates Multiple Choice Quiz Questions from logs
 */
export function generateQuizQuestions(
  logs: LearningLog[],
  selectedCategory: string = 'All',
  questionCount: number = 5
): QuizQuestion[] {
  const targetLogs =
    selectedCategory === 'All'
      ? logs
      : logs.filter((l) => l.category?.toLowerCase() === selectedCategory.toLowerCase());

  if (targetLogs.length === 0) return [];

  // Extract all concepts across target logs and all logs (for distractors)
  const targetConcepts: ExtractedConcept[] = [];
  targetLogs.forEach((l) => targetConcepts.push(...extractConceptsFromLog(l)));

  const poolConcepts: ExtractedConcept[] = [];
  logs.forEach((l) => poolConcepts.push(...extractConceptsFromLog(l)));

  if (targetConcepts.length === 0) return [];

  const shuffledConcepts = shuffleArray(targetConcepts);
  const questions: QuizQuestion[] = [];
  const usedTerms = new Set<string>();

  for (const concept of shuffledConcepts) {
    if (questions.length >= questionCount) break;

    const termKey = `${concept.term}-${concept.sourceLogId}`;
    if (usedTerms.has(termKey)) continue;
    usedTerms.add(termKey);

    // Pick 3 smart distractors from the pool
    // 1. Same category first
    let distractors = poolConcepts.filter(
      (c) =>
        c.sourceLogId !== concept.sourceLogId &&
        c.definition.toLowerCase() !== concept.definition.toLowerCase() &&
        c.category === concept.category
    );

    // 2. If not enough, pull from any other category
    if (distractors.length < 3) {
      const extra = poolConcepts.filter(
        (c) =>
          c.sourceLogId !== concept.sourceLogId &&
          c.definition.toLowerCase() !== concept.definition.toLowerCase() &&
          !distractors.some((d) => d.definition === c.definition)
      );
      distractors = [...distractors, ...extra];
    }

    // Default fallback generic distractors if database only has 1 note
    const genericFallbackDistractors = [
      'Penyimpanan data statis tanpa integrasi indeks atau query relasional.',
      'Metode enkripsi asimetris untuk verifikasi sertifikat SSL di sisi klien.',
      'Sistem pembagian beban kerja antar worker thread pada kernel sistem operasi.',
      'Proses pengurutan memori heap menggunakan algoritma quicksort bertingkat.',
    ];

    const chosenDistractorTexts: string[] = [];
    const shuffledDistractors = shuffleArray(distractors);

    for (const d of shuffledDistractors) {
      if (chosenDistractorTexts.length >= 3) break;
      if (!chosenDistractorTexts.includes(d.definition)) {
        chosenDistractorTexts.push(d.definition);
      }
    }

    // Fill up if still less than 3
    let genIdx = 0;
    while (chosenDistractorTexts.length < 3) {
      chosenDistractorTexts.push(
        genericFallbackDistractors[genIdx % genericFallbackDistractors.length]
      );
      genIdx++;
    }

    // Randomize Question Formulation Type (Type A: What is X? vs Type B: Which concept does this describe?)
    const isTermIdentification = Math.random() > 0.5 && concept.term !== concept.sourceLogTitle;

    let questionText = '';
    let correctAnswer = '';
    const rawOptions: { text: string; isCorrect: boolean }[] = [];

    if (isTermIdentification) {
      questionText = `"${concept.definition}"\n\nBerdasarkan catatanmu, konsep atau istilah apakah yang dimaksud?`;
      correctAnswer = concept.term;

      rawOptions.push({ text: concept.term, isCorrect: true });

      // Pull other terms as distractors
      const termPool = Array.from(
        new Set(
          poolConcepts
            .map((c) => c.term)
            .filter((t) => t.toLowerCase() !== concept.term.toLowerCase())
        )
      );
      const shuffledTerms = shuffleArray(termPool);
      const fallbackTerms = ['PostgreSQL Indexing', 'React Virtual DOM', 'JWT Stateless Auth', 'Docker Container'];

      let tIdx = 0;
      while (rawOptions.length < 4) {
        const optionTerm = shuffledTerms[tIdx] || fallbackTerms[tIdx % fallbackTerms.length];
        if (!rawOptions.some((o) => o.text === optionTerm)) {
          rawOptions.push({ text: optionTerm, isCorrect: false });
        }
        tIdx++;
      }
    } else {
      questionText =
        concept.type === 'purpose'
          ? `Berdasarkan catatanmu tentang "${concept.sourceLogTitle}", apa fungsi atau kegunaan utama dari ${concept.term}?`
          : concept.type === 'rule'
          ? `Kapan kita sebaiknya menerapkan atau menggunakan ${concept.term}?`
          : `Apa penjelasan atau konsep utama dari "${concept.term}"?`;

      correctAnswer = concept.definition;

      rawOptions.push({ text: concept.definition, isCorrect: true });
      chosenDistractorTexts.forEach((dText) => {
        rawOptions.push({ text: dText, isCorrect: false });
      });
    }

    // Shuffle options and assign IDs
    const shuffledOptions: QuizOption[] = shuffleArray(rawOptions).map((opt, i) => ({
      id: `opt-${i}`,
      text: opt.text,
      isCorrect: opt.isCorrect,
    }));

    questions.push({
      id: `q-${concept.sourceLogId}-${questions.length + 1}`,
      sourceLogId: concept.sourceLogId,
      sourceLogTitle: concept.sourceLogTitle,
      category: concept.category,
      type: concept.type === 'purpose' ? 'purpose' : isTermIdentification ? 'term_identification' : 'definition',
      question: questionText,
      options: shuffledOptions,
      correctAnswerText: correctAnswer,
      explanation: `Dikutip dari catatan "${concept.sourceLogTitle}" (${concept.category}):\n${concept.definition}`,
    });
  }

  return questions;
}

/**
 * Generates Flashcard Deck from logs
 */
export function generateFlashcardDeck(
  logs: LearningLog[],
  selectedCategory: string = 'All'
): FlashcardItem[] {
  const targetLogs =
    selectedCategory === 'All'
      ? logs
      : logs.filter((l) => l.category?.toLowerCase() === selectedCategory.toLowerCase());

  if (targetLogs.length === 0) return [];

  const flashcards: FlashcardItem[] = [];

  targetLogs.forEach((log) => {
    const concepts = extractConceptsFromLog(log);
    const cleaned = cleanText(log.content || '');

    // Card 1: Core Concept Card
    let answerText = cleaned.slice(0, 320);
    if (cleaned.length > 320) answerText += '...';

    flashcards.push({
      id: `fc-${log.id}-main`,
      sourceLogId: log.id,
      sourceLogTitle: log.title,
      category: log.category,
      frontPrompt: `Jelaskan gagasan kunci dan poin utama dari materi: "${log.title}"`,
      backAnswer: answerText || 'Tidak ada catatan tambahan.',
      takeaways: log.takeaways && log.takeaways.length > 0 ? log.takeaways : undefined,
      codeSnippet: log.code_snippet,
      codeLanguage: log.code_language,
    });

    // Card 2: Specific extracted definition or purpose if available
    concepts.forEach((c, idx) => {
      if (c.term !== log.title && c.definition.length > 20) {
        flashcards.push({
          id: `fc-${log.id}-concept-${idx}`,
          sourceLogId: log.id,
          sourceLogTitle: log.title,
          category: log.category,
          frontPrompt: `Apa definisi dan fungsi dari istilah: "${c.term}"?`,
          backAnswer: c.definition,
          takeaways: undefined,
          codeSnippet: undefined,
          codeLanguage: undefined,
        });
      }
    });
  });

  return shuffleArray(flashcards);
}
