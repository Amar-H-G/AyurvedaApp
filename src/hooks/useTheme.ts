/**
 * useTheme — consumes current theme (light/dark).
 */
import { useMemo } from 'react';
import { useAppStore } from '../store/app/appStore';
import { lightTheme, darkTheme, AppTheme } from '../theme/themes';

export function useTheme(): AppTheme {
  const themeMode = useAppStore(state => state.themeMode);
  return useMemo(
    () => (themeMode === 'dark' ? darkTheme : lightTheme),
    [themeMode]
  );
}
