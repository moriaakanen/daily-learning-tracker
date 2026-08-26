/**
 * Centralized Topic Themes, Emojis, and Harmonious Card Color Palettes.
 */

export interface TopicStyle {
  name: string;
  emoji: string;
  color: string;
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
}

export const CARD_COLOR_PRESETS: CardColorPreset[] = [
  { id: 'auto', name: 'Otomatis Sesuai Topik', emoji: '🌈', color: 'auto' },
  { id: '#0ea5e9', name: 'Sky Blue', emoji: '🌊', color: '#0ea5e9' },
  { id: '#10b981', name: 'Emerald Mint', emoji: '🌱', color: '#10b981' },
  { id: '#8b5cf6', name: 'Lavender Purple', emoji: '💜', color: '#8b5cf6' },
  { id: '#f43f5e', name: 'Cherry Rose', emoji: '🌸', color: '#f43f5e' },
  { id: '#f59e0b', name: 'Sunny Amber', emoji: '☀️', color: '#f59e0b' },
  { id: '#f97316', name: 'Peach Coral', emoji: '🍑', color: '#f97316' },
  { id: '#06b6d4', name: 'Cyan Teal', emoji: '💎', color: '#06b6d4' },
  { id: '#6366f1', name: 'Indigo Galaxy', emoji: '🌌', color: '#6366f1' },
  { id: '#64748b', name: 'Slate Clean', emoji: '☁️', color: '#64748b' },
];

const PRESET_TOPICS: Record<string, { emoji: string; color: string }> = {
  'Teknologi & Coding': { emoji: '💻', color: '#0ea5e9' },
  'Bisnis & Finansial': { emoji: '📈', color: '#10b981' },
  'Buku & Literasi': { emoji: '📚', color: '#f59e0b' },
  'Bahasa & Komunikasi': { emoji: '🗣️', color: '#8b5cf6' },
  'Sains & Psikologi': { emoji: '🧠', color: '#ec4899' },
  'Produktivitas & Habits': { emoji: '⚡', color: '#f97316' },
  'Desain & Kreativitas': { emoji: '🎨', color: '#06b6d4' },
  'Kesehatan & Olahraga': { emoji: '🏃', color: '#22c55e' },
  'Wawasan Umum & Filosofi': { emoji: '🧭', color: '#6366f1' },
  'Database': { emoji: '🗄️', color: '#3b82f6' },
  'AI & Machine Learning': { emoji: '🤖', color: '#a855f7' },
  'Karier & Self Growth': { emoji: '🚀', color: '#e11d48' },
};

const DYNAMIC_PALETTE = [
  { emoji: '💡', color: '#0ea5e9' },
  { emoji: '🔬', color: '#10b981' },
  { emoji: '🎯', color: '#f59e0b' },
  { emoji: '🛠️', color: '#8b5cf6' },
  { emoji: '🌟', color: '#ec4899' },
  { emoji: '🧩', color: '#f97316' },
  { emoji: '✍️', color: '#06b6d4' },
  { emoji: '🌱', color: '#22c55e' },
];

export function getTopicTheme(topicName: string): TopicStyle {
  if (!topicName) {
    return {
      name: 'Umum',
      emoji: '💡',
      color: '#0ea5e9',
      borderLeft: '#0ea5e9',
      badgeBg: 'rgba(14, 165, 233, 0.12)',
      badgeText: '#0ea5e9',
      badgeBorder: 'rgba(14, 165, 233, 0.25)',
      cardBg: 'transparent',
      cardHoverBg: 'rgba(14, 165, 233, 0.03)',
    };
  }

  // Exact or partial match
  let found = PRESET_TOPICS[topicName];

  if (!found) {
    // Generate deterministic color and emoji from hash of name
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
    borderLeft: found.color,
    badgeBg: `${found.color}18`, // ~10% opacity
    badgeText: found.color,
    badgeBorder: `${found.color}35`, // ~20% opacity
    cardBg: `${found.color}06`, // ~2.5% soft background tint
    cardHoverBg: `${found.color}0e`, // ~5% hover tint
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
    borderLeft: activeColor,
    badgeBg: `${activeColor}18`,
    badgeText: activeColor,
    badgeBorder: `${activeColor}35`,
    cardBg: `${activeColor}08`, // ~3% soft tint matching chosen color
    cardHoverBg: `${activeColor}12`, // ~7% hover tint
  };
}
