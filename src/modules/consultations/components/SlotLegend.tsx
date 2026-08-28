/**
 * SlotLegend — subtle visual legend for time slot availability states.
 */
import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Typography } from '../../../components/design-system/Typography';

function SlotLegendBase(): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.legendItem}>
        <View style={[styles.dot, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary, borderWidth: 1.5 }]} />
        <Typography variant="caption" color={theme.colors.textSecondary}>Available</Typography>
      </View>

      <View style={styles.legendItem}>
        <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
        <Typography variant="caption" color={theme.colors.textSecondary}>Selected</Typography>
      </View>

      <View style={styles.legendItem}>
        <View style={[styles.dot, { backgroundColor: theme.colors.textDisabled + '50' }]} />
        <Typography variant="caption" color={theme.colors.textTertiary}>Booked / Past</Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 16,
    paddingVertical: 8,
    marginBottom: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export const SlotLegend = memo(SlotLegendBase);
