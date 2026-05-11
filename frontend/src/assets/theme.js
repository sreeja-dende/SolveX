export const COLORS = {
  primary: '#0A2463',       // Deep navy blue (SolveX brand)
  primaryLight: '#1E4DB7',  // Lighter navy
  accent: '#E84855',        // Red accent for winners/badges
  accentGold: '#F4A228',    // Gold for leaderboard/medals
  success: '#2EC4B6',       // Teal for success states
  background: '#F5F7FF',    // Very light blue-white background
  surface: '#FFFFFF',       // Card/surface white
  surfaceDark: '#EEF1FB',   // Slightly darker surface
  textPrimary: '#0D1B2A',   // Near-black for main text
  textSecondary: '#5A6A7A', // Gray for secondary text
  textMuted: '#9AABB8',     // Muted/placeholder text
  border: '#DDE3F0',        // Subtle border
  overlay: 'rgba(10,36,99,0.85)',

  // Category colors
  catProcess: '#7B2FBE',
  catTechnical: '#0A7EA4',
  catData: '#E84855',
  catProduct: '#F4A228',
  catGrowth: '#2EC4B6',
  catOther: '#5A6A7A',

  // Difficulty
  easy: '#2EC4B6',
  medium: '#F4A228',
  hard: '#E84855',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    display: 38,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 999,
};

export const SHADOW = {
  card: {
    shadowColor: '#0A2463',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  strong: {
    shadowColor: '#0A2463',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
};
