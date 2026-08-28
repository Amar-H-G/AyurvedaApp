/**
 * Design System — Tokens
 * Single source of truth for all design values.
 */

export const Palette = {
  // Primary — Ayurvedic Saffron/Turmeric
  primary50: '#FFF8E1',
  primary100: '#FFECB3',
  primary200: '#FFE082',
  primary300: '#FFD54F',
  primary400: '#FFCA28',
  primary500: '#E6A817',  // Main brand
  primary600: '#C8860A',
  primary700: '#A66900',
  primary800: '#7E5000',
  primary900: '#5A3700',

  // Secondary — Herbal Green
  secondary50: '#E8F5E9',
  secondary100: '#C8E6C9',
  secondary200: '#A5D6A7',
  secondary300: '#81C784',
  secondary400: '#66BB6A',
  secondary500: '#43A047',
  secondary600: '#388E3C',
  secondary700: '#2E7D32',
  secondary800: '#1B5E20',
  secondary900: '#0D3B0F',

  // Neutral
  neutral50: '#FAFAFA',
  neutral100: '#F5F5F5',
  neutral200: '#EEEEEE',
  neutral300: '#E0E0E0',
  neutral400: '#BDBDBD',
  neutral500: '#9E9E9E',
  neutral600: '#757575',
  neutral700: '#616161',
  neutral800: '#424242',
  neutral900: '#212121',

  // Semantic
  errorLight: '#FFEBEE',
  error: '#EF5350',
  errorDark: '#B71C1C',

  successLight: '#E8F5E9',
  success: '#4CAF50',
  successDark: '#1B5E20',

  warningLight: '#FFF3E0',
  warning: '#FF9800',
  warningDark: '#E65100',

  infoLight: '#E3F2FD',
  info: '#2196F3',
  infoDark: '#0D47A1',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 999,
} as const;

export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  display: 34,
  hero: 40,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const LineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;

export const IconSize = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

export const Shadow = {
  sm: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  md: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  lg: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
} as const;
