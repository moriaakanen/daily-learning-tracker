/**
 * Centralized Topic Themes, Emojis, and Harmonious Color Palettes.
 */

export interface TopicStyle {
  name: string;
  emoji: string;
  color: string;
  borderLeft: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  cardHoverBg: string;
}

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
    badgeBg: `${found.color}1f`, // ~12% opacity
    badgeText: found.color,
    badgeBorder: `${found.color}40`, // ~25% opacity
    cardHoverBg: `${found.color}08`, // ~3% subtle hover glow
  };
}
