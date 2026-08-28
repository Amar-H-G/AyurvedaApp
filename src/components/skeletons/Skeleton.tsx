/**
 * Skeleton.tsx — Base skeleton component with smooth opacity pulse animation.
 * Theme-aware (light/dark mode) and accessible.
 */
import React, { useEffect, useRef, memo } from 'react';
import { Animated, StyleProp, ViewStyle, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  variant?: 'rectangular' | 'circular' | 'rounded';
}

export const Skeleton = memo(({
  width,
  height = 16,
  borderRadius = 6,
  style,
  variant = 'rounded',
}: SkeletonProps) => {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  let calculatedRadius = borderRadius;
  if (variant === 'circular') {
    calculatedRadius = typeof height === 'number' ? height / 2 : 20;
  } else if (variant === 'rectangular') {
    calculatedRadius = 0;
  }

  // Base background color using theme tokens
  const backgroundColor = theme.mode === 'dark' ? '#2A3C34' : '#E0E7E3';

  return (
    <Animated.View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.base,
        {
          width: width as any,
          height: height as any,
          borderRadius: calculatedRadius,
          backgroundColor,
          opacity,
        },
        style,
      ]}
    />
  );
});

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
