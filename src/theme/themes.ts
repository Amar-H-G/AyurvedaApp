/**
 * Theme definitions — light and dark.
 * Components consume these via useTheme() hook, not raw tokens.
 */
import { Palette, Spacing, FontSize, FontWeight, BorderRadius, Shadow, IconSize } from './tokens';

export interface AppTheme {
  mode: 'light' | 'dark';
  colors: {
    // Backgrounds
    background: string;
    surface: string;
    surfaceVariant: string;
    overlay: string;
    // Brand
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    secondaryLight: string;
    // Text
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    textOnPrimary: string;
    textDisabled: string;
    // Borders
    border: string;
    borderLight: string;
    // Semantic
    error: string;
    errorBackground: string;
    success: string;
    successBackground: string;
    warning: string;
    warningBackground: string;
    info: string;
    infoBackground: string;
    // Skeleton / Shimmer
    shimmerBase: string;
    shimmerHighlight: string;
    transparent: string;
  };
  spacing: typeof Spacing;
  fontSize: typeof FontSize;
  fontWeight: typeof FontWeight;
  borderRadius: typeof BorderRadius;
  shadow: typeof Shadow;
  iconSize: typeof IconSize;
}

const baseTheme = {
  spacing: Spacing,
  fontSize: FontSize,
  fontWeight: FontWeight,
  borderRadius: BorderRadius,
  shadow: Shadow,
  iconSize: IconSize,
};

export const lightTheme: AppTheme = {
  ...baseTheme,
  mode: 'light',
  colors: {
    background: Palette.neutral50,
    surface: Palette.white,
    surfaceVariant: Palette.neutral100,
    overlay: 'rgba(0,0,0,0.5)',
    primary: Palette.primary500,
    primaryLight: Palette.primary100,
    primaryDark: Palette.primary700,
    secondary: Palette.secondary500,
    secondaryLight: Palette.secondary100,
    textPrimary: Palette.neutral900,
    textSecondary: Palette.neutral700,
    textTertiary: Palette.neutral500,
    textOnPrimary: Palette.white,
    textDisabled: Palette.neutral400,
    border: Palette.neutral200,
    borderLight: Palette.neutral100,
    error: Palette.error,
    errorBackground: Palette.errorLight,
    success: Palette.success,
    successBackground: Palette.successLight,
    warning: Palette.warning,
    warningBackground: Palette.warningLight,
    info: Palette.info,
    infoBackground: Palette.infoLight,
    shimmerBase: Palette.neutral200,
    shimmerHighlight: Palette.neutral100,
    transparent: 'transparent',
  },
};

export const darkTheme: AppTheme = {
  ...baseTheme,
  mode: 'dark',
  colors: {
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#2A2A2A',
    overlay: 'rgba(0,0,0,0.7)',
    primary: Palette.primary400,
    primaryLight: '#3A2E00',
    primaryDark: Palette.primary500,
    secondary: Palette.secondary400,
    secondaryLight: '#1B4020',
    textPrimary: '#F5F5F5',
    textSecondary: '#BDBDBD',
    textTertiary: '#9E9E9E',
    textOnPrimary: Palette.black,
    textDisabled: '#616161',
    border: '#333333',
    borderLight: '#2A2A2A',
    error: '#EF9A9A',
    errorBackground: '#3B1A1A',
    success: '#A5D6A7',
    successBackground: '#1A3B1A',
    warning: '#FFCC80',
    warningBackground: '#3B2A1A',
    info: '#90CAF9',
    infoBackground: '#1A2A3B',
    shimmerBase: '#2A2A2A',
    shimmerHighlight: '#333333',
    transparent: 'transparent',
  },
};
