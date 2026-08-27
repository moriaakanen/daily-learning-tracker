/**
 * Centralized Topic Themes, Emojis, and Cheerful Card Color Palettes.
 */

export interface TopicStyle {
  name: string;
  emoji: string;
  color: string;
  gradient: string;
  glow: string;
  borderLeft: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  cardBg: string;
  cardHoverBg: string;
}

export interface CardColorPreset {
  id: string;
  name: string;
  emoji: string;
  color: string;
  gradient: string;
}

export const CARD_COLOR_PRESETS: CardColorPreset[] = [
  { id: 'auto', name: 'Otomatis Sesuai Topik', emoji: '🌈', color: 'auto', gradient: 'linear-gradient(135deg, #0ea5e9, #8b5cf6, #ec4899, #f59e0b)' },
  { id: '#0ea5e9', name: 'Sky Cyan', emoji: '🌊', color: '#0ea5e9', gradient: 'linear-gradient(135deg, #0ea5e9, #38bdf8)' },
  { id: '#10b981', name: 'Emerald Forest', emoji: '🌱', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #34d399)' },
  { id: '#8b5cf6', name: 'Electric Violet', emoji: '💜', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' },
  { id: '#f43f5e', name: 'Cherry Blossom', emoji: '🌸', color: '#f43f5e', gradient: 'linear-gradient(135deg, #f43f5e, #fb7185)' },
  { id: '#f59e0b', name: 'Golden Sun', emoji: '☀️', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)' },
  { id: '#f97316', name: 'Sunset Tangerine', emoji: '🍊', color: '#f97316', gradient: 'linear-gradient(135deg, #f97316, #fb923c)' },
  { id: '#06b6d4', name: 'Cyber Teal', emoji: '💎', color: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4, #22d3ee)' },
  { id: '#6366f1', name: 'Cosmic Indigo', emoji: '🌌', color: '#6366f1', gradient: 'linear-gradient(135deg, #6366f1, #818cf8)' },
  { id: '#ec4899', name: 'Berry Magenta', emoji: '💖', color: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899, #f472b6)' },
  { id: '#14b8a6', name: 'Mint Ocean', emoji: '🍃', color: '#14b8a6', gradient: 'linear-gradient(135deg, #14b8a6, #2dd4bf)' },
  { id: '#64748b', name: 'Modern Slate', emoji: '☁️', color: '#64748b', gradient: 'linear-gradient(135deg, #64748b, #94a3b8)' },
];

const PRESET_TOPICS: Record<string, { emoji: string; color: string; gradient: string }> = {
  'Teknologi & Coding': { emoji: '💻', color: '#0ea5e9', gradient: 'linear-gradient(135deg, #0ea5e9, #6366f1)' },
  'Bisnis & Finansial': { emoji: '📈', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
  'Buku & Literasi': { emoji: '📚', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  'Bahasa & Komunikasi': { emoji: '🗣️', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
  'Sains & Psikologi': { emoji: '🧠', color: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899, #db2777)' },
  'Produktivitas & Habits': { emoji: '⚡', color: '#f97316', gradient: 'linear-gradient(135deg, #f97316, #ea580c)' },
  'Desain & Kreativitas': { emoji: '🎨', color: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)' },
  'Kesehatan & Olahraga': { emoji: '🏃', color: '#22c55e', gradient: 'linear-gradient(135deg, #22c55e, #16a34a)' },
  'Wawasan Umum & Filosofi': { emoji: '🧭', color: '#6366f1', gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)' },
  'Database': { emoji: '🗄️', color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
  'AI & Machine Learning': { emoji: '🤖', color: '#a855f7', gradient: 'linear-gradient(135deg, #a855f7, #9333ea)' },
  'Karier & Self Growth': { emoji: '🚀', color: '#e11d48', gradient: 'linear-gradient(135deg, #e11d48, #be123c)' },
};

const DYNAMIC_PALETTE = [
  { emoji: '💡', color: '#0ea5e9', gradient: 'linear-gradient(135deg, #0ea5e9, #38bdf8)' },
  { emoji: '🔬', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #34d399)' },
  { emoji: '🎯', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)' },
  { emoji: '🛠️', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' },
  { emoji: '🌟', color: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899, #f472b6)' },
  { emoji: '🧩', color: '#f97316', gradient: 'linear-gradient(135deg, #f97316, #fb923c)' },
  { emoji: '✍️', color: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4, #22d3ee)' },
  { emoji: '🌱', color: '#22c55e', gradient: 'linear-gradient(135deg, #22c55e, #4ade80)' },
];

export function getTopicTheme(topicName: string): TopicStyle {
  if (!topicName) {
    return {
      name: 'Umum',
      emoji: '💡',
      color: '#0ea5e9',
      gradient: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
      glow: 'rgba(14, 165, 233, 0.25)',
      borderLeft: '#0ea5e9',
      badgeBg: 'rgba(14, 165, 233, 0.12)',
      badgeText: '#0ea5e9',
      badgeBorder: 'rgba(14, 165, 233, 0.25)',
      cardBg: 'transparent',
      cardHoverBg: 'rgba(14, 165, 233, 0.04)',
    };
  }

  // Exact or partial match
  let found = PRESET_TOPICS[topicName];

  if (!found) {
    let hash = 0;
    for (let i = 0; i < topicName.length; i++) {
      hash = topicName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % DYNAMIC_PALETTE.length;
    found = DYNAMIC_PALETTE[idx];
  }

  return {
    name: topicName,
    emoji: found.emoji,
    color: found.color,
    gradient: found.gradient,
    glow: `${found.color}40`,
    borderLeft: found.color,
    badgeBg: `${found.color}15`,
    badgeText: found.color,
    badgeBorder: `${found.color}35`,
    cardBg: `${found.color}06`,
    cardHoverBg: `${found.color}10`,
  };
}

/**
 * Resolves the computed styling for a card, supporting custom color override.
 */
export function getCardStyle(category: string, customColor?: string): TopicStyle {
  const baseTheme = getTopicTheme(category);

  if (!customColor || customColor === 'auto') {
    return baseTheme;
  }

  const activeColor = customColor.startsWith('#') ? customColor : baseTheme.color;

  return {
    ...baseTheme,
    color: activeColor,
    gradient: `linear-gradient(135deg, ${activeColor}, ${activeColor}dd)`,
    glow: `${activeColor}40`,
    borderLeft: activeColor,
    badgeBg: `${activeColor}15`,
    badgeText: activeColor,
    badgeBorder: `${activeColor}35`,
    cardBg: `${activeColor}08`,
    cardHoverBg: `${activeColor}14`,
  };
}
