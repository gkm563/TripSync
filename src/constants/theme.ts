export const COLORS = {
  light: {
    primary: '#6366F1', // Indigo
    primaryGradient: ['#6366F1', '#3B82F6'] as const,
    secondary: '#14B8A6', // Teal
    success: '#10B981', // Green
    warning: '#F59E0B', // Orange
    review: '#F59E0B', // Amber / Warning
    error: '#EF4444', // Red
    background: '#F8FAFC', // Slate 50
    card: '#FFFFFF',
    text: '#0F172A', // Slate 900
    textSecondary: '#64748B', // Slate 500
    textMuted: '#94A3B8', // Slate 400
    border: '#E2E8F0', // Slate 200
    glass: 'rgba(255, 255, 255, 0.7)',
    shadow: 'rgba(99, 102, 241, 0.08)',
  },
  dark: {
    primary: '#818CF8', // Lighter Indigo
    primaryGradient: ['#818CF8', '#60A5FA'] as const,
    secondary: '#2DD4BF', // Teal
    success: '#34D399', // Green
    warning: '#FBBF24', // Amber
    review: '#FBBF24',
    error: '#F87171', // Red
    background: '#0F172A', // Slate 900
    card: '#1E293B', // Slate 800
    text: '#F8FAFC', // Slate 50
    textSecondary: '#94A3B8', // Slate 400
    textMuted: '#64748B', // Slate 500
    border: '#334155', // Slate 700
    glass: 'rgba(30, 41, 59, 0.7)',
    shadow: 'rgba(0, 0, 0, 0.25)',
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  round: 9999,
};

export const SHADOWS = {
  light: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#6366F1',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#6366F1',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  dark: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

export const TYPOGRAPHY = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
};
