/**
 * Design System — Button component.
 */
import React, { memo } from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from './Typography';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
  testID?: string;
}

function ButtonBase({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  style,
  accessibilityLabel,
  testID,
}: ButtonProps): React.JSX.Element {
  const theme = useTheme();

  const isDisabled = disabled || isLoading;

  const sizeStyles: Record<ButtonSize, ViewStyle> = {
    sm: { paddingVertical: theme.spacing.xs, paddingHorizontal: theme.spacing.md, minHeight: 36 },
    md: { paddingVertical: theme.spacing.sm + 2, paddingHorizontal: theme.spacing.lg, minHeight: 48 },
    lg: { paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.xl, minHeight: 56 },
  };

  const labelSizes: Record<ButtonSize, 'caption' | 'label' | 'h4'> = {
    sm: 'caption',
    md: 'label',
    lg: 'h4',
  };

  const variantStyles: Record<ButtonVariant, { container: ViewStyle; textColor: string }> = {
    primary: {
      container: {
        backgroundColor: isDisabled ? theme.colors.textDisabled : theme.colors.primary,
        borderRadius: theme.borderRadius.md,
      },
      textColor: theme.colors.textOnPrimary,
    },
    secondary: {
      container: {
        backgroundColor: isDisabled ? theme.colors.surfaceVariant : theme.colors.secondary,
        borderRadius: theme.borderRadius.md,
      },
      textColor: theme.colors.textOnPrimary,
    },
    outline: {
      container: {
        backgroundColor: 'transparent',
        borderRadius: theme.borderRadius.md,
        borderWidth: 1.5,
        borderColor: isDisabled ? theme.colors.textDisabled : theme.colors.primary,
      },
      textColor: isDisabled ? theme.colors.textDisabled : theme.colors.primary,
    },
    ghost: {
      container: {
        backgroundColor: 'transparent',
        borderRadius: theme.borderRadius.md,
      },
      textColor: isDisabled ? theme.colors.textDisabled : theme.colors.primary,
    },
    danger: {
      container: {
        backgroundColor: isDisabled ? theme.colors.textDisabled : theme.colors.error,
        borderRadius: theme.borderRadius.md,
      },
      textColor: '#FFFFFF',
    },
  };

  const { container, textColor } = variantStyles[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      testID={testID}
      style={[
        styles.base,
        sizeStyles[size],
        container,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <Typography variant={labelSizes[size]} color={textColor} align="center">
          {label}
        </Typography>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
});

export const Button = memo(ButtonBase);
