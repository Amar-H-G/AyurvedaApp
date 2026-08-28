/**
 * TimeSlotGrid — responsive grid of time slot chips.
 * Formats time values to 12-hour AM/PM format (e.g. 09:00 AM).
 */
import React, { memo, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { TimeSlot } from '../../../types';
import { useTheme } from '../../../hooks/useTheme';
import { Typography } from '../../../components/design-system/Typography';

interface Props {
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
}

function formatTimeForDisplay(timeStr: string): string {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return timeStr;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const padHours = hours < 10 ? `0${hours}` : `${hours}`;
  return `${padHours}:${minutes} ${ampm}`;
}

function TimeSlotGridBase({ slots, selectedSlot, onSelectSlot }: Props): React.JSX.Element {
  const theme = useTheme();

  const renderSlot = useCallback((slot: TimeSlot) => {
    const isSelected = selectedSlot?.id === slot.id;
    const isBooked = slot.isBooked;
    const isExpired = slot.isExpired;
    const isDisabled = isBooked || isExpired;

    const formattedTime = formatTimeForDisplay(slot.startTime);

    return (
      <TouchableOpacity
        key={slot.id}
        onPress={() => !isDisabled && onSelectSlot(slot)}
        disabled={isDisabled}
        activeOpacity={0.7}
        style={[
          styles.slotChip,
          {
            backgroundColor: isSelected
              ? theme.colors.primary
              : isDisabled
              ? theme.colors.surfaceVariant
              : theme.colors.surface,
            borderColor: isSelected
              ? theme.colors.primary
              : isDisabled
              ? theme.colors.border
              : theme.colors.primary + '80',
            opacity: isDisabled ? 0.55 : 1,
          },
          isSelected && styles.selectedSlotShadow,
        ]}
        accessibilityLabel={`${formattedTime} slot${isBooked ? ', booked' : isExpired ? ', expired' : ''}`}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, selected: isSelected }}
      >
        <View style={styles.contentRow}>
          {isSelected && (
            <Typography variant="caption" color={theme.colors.textOnPrimary} style={styles.checkIcon}>
              ✓
            </Typography>
          )}
          {isBooked && (
            <Typography variant="caption" color={theme.colors.textDisabled} style={styles.badgeIcon}>
              🔒
            </Typography>
          )}
          {isExpired && !isBooked && (
            <Typography variant="caption" color={theme.colors.textDisabled} style={styles.badgeIcon}>
              ⏰
            </Typography>
          )}
          <Typography
            variant="label"
            color={
              isSelected
                ? theme.colors.textOnPrimary
                : isDisabled
                ? theme.colors.textDisabled
                : theme.colors.textPrimary
            }
            style={styles.timeText}
          >
            {formattedTime}
          </Typography>
        </View>

        {isBooked && (
          <Typography variant="caption" color={theme.colors.textDisabled} style={styles.statusLabel}>
            Booked
          </Typography>
        )}
        {isExpired && !isBooked && (
          <Typography variant="caption" color={theme.colors.textDisabled} style={styles.statusLabel}>
            Past
          </Typography>
        )}
      </TouchableOpacity>
    );
  }, [selectedSlot, onSelectSlot, theme]);

  if (slots.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Typography variant="bodySmall" color={theme.colors.textSecondary} align="center">
          No available slots for this date.
        </Typography>
      </View>
    );
  }

  return (
    <View style={styles.gridContainer}>
      {slots.map(renderSlot)}
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 4,
  },
  slotChip: {
    width: '31%',
    minWidth: 96,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  selectedSlotShadow: {
    elevation: 3,
    shadowColor: '#124734',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  checkIcon: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  badgeIcon: {
    fontSize: 11,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
});

export const TimeSlotGrid = memo(TimeSlotGridBase);
