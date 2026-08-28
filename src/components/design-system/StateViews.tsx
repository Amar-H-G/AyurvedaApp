/**
 * Design System — EmptyState, ErrorState, LoadingState.
 */
import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from './Typography';
import { Button } from './Button';
import {
  DoctorListSkeleton,
  DoctorDetailsSkeleton,
  SlotSkeleton,
  UpcomingConsultationSkeleton,
  ProductGridSkeleton,
  CartSkeleton,
  HealthTimelineSkeleton,
  Skeleton,
} from '../skeletons';

// ─── Loading ────────────────────────────────────────────────────────────────

export type LoadingVariant =
  | 'doctor-list'
  | 'doctor-detail'
  | 'product-grid'
  | 'health-timeline'
  | 'cart'
  | 'slots'
  | 'upcoming'
  | 'generic';

interface LoadingProps {
  message?: string;
  variant?: LoadingVariant;
}

export const LoadingState = memo(({ message, variant }: LoadingProps) => {
  const theme = useTheme();

  // Infer variant from message if not explicitly provided
  let activeVariant = variant;
  if (!activeVariant && message) {
    const lower = message.toLowerCase();
    if (lower.includes('doctor profile')) activeVariant = 'doctor-detail';
    else if (lower.includes('doctor')) activeVariant = 'doctor-list';
    else if (lower.includes('product')) activeVariant = 'product-grid';
    else if (lower.includes('health') || lower.includes('record')) activeVariant = 'health-timeline';
    else if (lower.includes('cart')) activeVariant = 'cart';
    else if (lower.includes('slot')) activeVariant = 'slots';
    else if (lower.includes('consultation')) activeVariant = 'upcoming';
  }

  if (activeVariant === 'doctor-list') return <DoctorListSkeleton count={4} />;
  if (activeVariant === 'doctor-detail') return <DoctorDetailsSkeleton />;
  if (activeVariant === 'product-grid') return <ProductGridSkeleton count={6} />;
  if (activeVariant === 'health-timeline') return <HealthTimelineSkeleton groupCount={2} />;
  if (activeVariant === 'cart') return <CartSkeleton itemCount={2} />;
  if (activeVariant === 'slots') return <SlotSkeleton />;
  if (activeVariant === 'upcoming') return <UpcomingConsultationSkeleton count={3} />;

  // Default clean generic skeleton container
  return (
    <View style={styles.genericSkeletonContainer} accessibilityLiveRegion="polite">
      <Skeleton width="90%" height={80} style={{ marginBottom: 12 }} />
      <Skeleton width="90%" height={80} style={{ marginBottom: 12 }} />
      <Skeleton width="90%" height={80} />
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

// ─── Skeleton Helper Export ──────────────────────────────────────────────────

export const SkeletonLine = memo(({ width, height = 16, style }: { width?: number | string; height?: number; style?: object }) => {
  return <Skeleton width={width ?? '100%'} height={height} style={style} />;
});

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    minHeight: 200,
  },
  genericSkeletonContainer: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
