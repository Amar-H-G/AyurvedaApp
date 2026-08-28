/**
 * Design System — Typography component.
 */
import React, { memo } from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

type Variant =
  | 'hero' | 'display' | 'h1' | 'h2' | 'h3' | 'h4'
  | 'body' | 'bodySmall' | 'caption' | 'label' | 'overline';

interface TypographyProps {
  variant?: Variant;
  color?: string;
  align?: 'left' | 'center' | 'right';
  numberOfLines?: number;
  style?: TextStyle;
  children: React.ReactNode;
  accessibilityLabel?: string;
  accessibilityRole?: 'text' | 'header' | 'none';
}

function TypographyBase({
  variant = 'body',
  color,
  align = 'left',
  numberOfLines,
  style,
  children,
  accessibilityLabel,
  accessibilityRole,
}: TypographyProps): React.JSX.Element {
  const theme = useTheme();

  const variantStyles: Record<Variant, TextStyle> = {
    hero: { fontSize: theme.fontSize.hero, fontWeight: theme.fontWeight.extrabold, lineHeight: theme.fontSize.hero * 1.2 },
    display: { fontSize: theme.fontSize.display, fontWeight: theme.fontWeight.bold, lineHeight: theme.fontSize.display * 1.2 },
    h1: { fontSize: theme.fontSize.xxxl, fontWeight: theme.fontWeight.bold, lineHeight: theme.fontSize.xxxl * 1.3 },
    h2: { fontSize: theme.fontSize.xxl, fontWeight: theme.fontWeight.bold, lineHeight: theme.fontSize.xxl * 1.3 },
    h3: { fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.semibold, lineHeight: theme.fontSize.xl * 1.4 },
    h4: { fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.semibold, lineHeight: theme.fontSize.lg * 1.4 },
    body: { fontSize: theme.fontSize.base, fontWeight: theme.fontWeight.regular, lineHeight: theme.fontSize.base * 1.6 },
    bodySmall: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.regular, lineHeight: theme.fontSize.md * 1.6 },
    caption: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.regular, lineHeight: theme.fontSize.sm * 1.5 },
    label: { fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.semibold, lineHeight: theme.fontSize.sm * 1.5 },
    overline: { fontSize: theme.fontSize.xs, fontWeight: theme.fontWeight.semibold, letterSpacing: 1.5, textTransform: 'uppercase' },
  };

  const defaultColor = ['h1','h2','h3','h4','display','hero'].includes(variant)
    ? theme.colors.textPrimary
    : variant === 'caption' || variant === 'overline'
    ? theme.colors.textTertiary
    : theme.colors.textSecondary;

  return (
    <Text
      style={[variantStyles[variant], { color: color ?? defaultColor, textAlign: align }, style]}
      numberOfLines={numberOfLines}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
    >
      {children}
    </Text>
  );
}

export const Typography = memo(TypographyBase);
