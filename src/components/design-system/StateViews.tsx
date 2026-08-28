/**
 * Design System — EmptyState, ErrorState, LoadingState.
 */
import React, { memo } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from './Typography';
import { Button } from './Button';

// ─── Loading ────────────────────────────────────────────────────────────────

interface LoadingProps {
  message?: string;
}
export const LoadingState = memo(({ message = 'Loading...' }: LoadingProps) => {
  const theme = useTheme();
  return (
    <View style={styles.center} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Typography variant="bodySmall" color={theme.colors.textSecondary} style={styles.message}>
        {message}
      </Typography>
    </View>
  );
});

// ─── Empty ───────────────────────────────────────────────────────────────────

interface EmptyProps {
  emoji?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}
export const EmptyState = memo(({ emoji = '🌿', title, subtitle, actionLabel, onAction }: EmptyProps) => {
  const theme = useTheme();
  return (
    <View style={styles.center} accessibilityLiveRegion="polite">
      <Typography variant="hero" style={styles.emoji}>{emoji}</Typography>
      <Typography variant="h3" align="center" color={theme.colors.textPrimary}>{title}</Typography>
      {subtitle && (
        <Typography variant="body" align="center" color={theme.colors.textSecondary} style={styles.message}>
          {subtitle}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} variant="outline" style={styles.action} />
      )}
    </View>
  );
});

// ─── Error ───────────────────────────────────────────────────────────────────

interface ErrorProps {
  message: string;
  onRetry?: () => void;
}
export const ErrorState = memo(({ message, onRetry }: ErrorProps) => {
  const theme = useTheme();
  return (
    <View style={styles.center} accessibilityLiveRegion="assertive" accessibilityRole="alert">
      <Typography variant="hero" style={styles.emoji}>⚠️</Typography>
      <Typography variant="h3" align="center" color={theme.colors.textPrimary}>Something went wrong</Typography>
      <Typography variant="body" align="center" color={theme.colors.textSecondary} style={styles.message}>
        {message}
      </Typography>
      {onRetry && (
        <Button label="Retry" onPress={onRetry} variant="primary" style={styles.action} />
      )}
    </View>
  );
});

// ─── Skeleton ────────────────────────────────────────────────────────────────

export const SkeletonLine = memo(({ width, height = 16, style }: { width?: number | string; height?: number; style?: object }) => {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          width: width ?? '100%',
          height,
          borderRadius: 4,
          backgroundColor: theme.colors.shimmerBase,
        },
        style,
      ]}
      accessibilityElementsHidden
    />
  );
});

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    minHeight: 200,
  },
  emoji: {
    marginBottom: 16,
    fontSize: 48,
  },
  message: {
    marginTop: 8,
    marginBottom: 4,
  },
  action: {
    marginTop: 16,
    minWidth: 160,
  },
});
