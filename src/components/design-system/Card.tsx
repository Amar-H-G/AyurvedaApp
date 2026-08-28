/**
 * Design System — Card component.
 */
import React, { memo } from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

function CardBase({ children, style, variant = 'elevated', padding = 'md' }: CardProps): React.JSX.Element {
  const theme = useTheme();

  const paddingMap = {
    none: 0,
    sm: theme.spacing.sm,
    md: theme.spacing.md,
    lg: theme.spacing.lg,
  };

  const variantStyle: ViewStyle =
    variant === 'elevated'
      ? { backgroundColor: theme.colors.surface, ...theme.shadow.sm }
      : variant === 'outlined'
      ? { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }
      : { backgroundColor: theme.colors.surfaceVariant };

  return (
    <View
      style={[
        styles.base,
        { borderRadius: theme.borderRadius.md, padding: paddingMap[padding] },
        variantStyle,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});

export const Card = memo(CardBase);
