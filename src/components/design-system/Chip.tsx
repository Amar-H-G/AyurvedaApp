/**
 * Design System — Chip/Tag component.
 */
import React, { memo } from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from './Typography';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  variant?: 'filter' | 'tag' | 'status';
  statusColor?: string;
  style?: ViewStyle;
  testID?: string;
}

function ChipBase({
  label,
  selected = false,
  onPress,
  onRemove,
  variant = 'filter',
  statusColor,
  style,
  testID,
}: ChipProps): React.JSX.Element {
  const theme = useTheme();

  const bgColor = selected
    ? theme.colors.primary
    : statusColor
    ? statusColor + '20'
    : theme.colors.surfaceVariant;

  const textColor = selected
    ? theme.colors.textOnPrimary
    : statusColor
    ? statusColor
    : theme.colors.textSecondary;

  const borderColor = selected ? theme.colors.primary : theme.colors.border;

  const content = (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          borderColor,
          borderRadius: theme.borderRadius.round,
        },
        style,
      ]}
    >
      <Typography variant="caption" color={textColor} style={styles.label}>
        {label}
      </Typography>
      {onRemove && (
        <TouchableOpacity
          onPress={onRemove}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          accessibilityLabel={`Remove ${label}`}
        >
          <Typography variant="caption" color={textColor}> ✕</Typography>
        </TouchableOpacity>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.75}
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        testID={testID}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  label: {
    fontWeight: '500',
  },
});

export const Chip = memo(ChipBase);
