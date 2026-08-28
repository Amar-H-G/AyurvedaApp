/**
 * AvailableSlotsSection — complete container for Date Selector, Legend, and Time Slot Grid.
 */
import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { TimeSlot } from '../../../types';
import { useTheme } from '../../../hooks/useTheme';
import { Typography } from '../../../components/design-system/Typography';
import { Card } from '../../../components/design-system/Card';
import { DateSelector } from './DateSelector';
import { TimeSlotGrid } from './TimeSlotGrid';
import { SlotLegend } from './SlotLegend';

interface Props {
  availableDates: string[];
  selectedDate: string | null;
  slotsForSelectedDate: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelectDate: (date: string) => void;
  onSelectSlot: (slot: TimeSlot) => void;
}

function AvailableSlotsSectionBase({
  availableDates,
  selectedDate,
  slotsForSelectedDate,
  selectedSlot,
  onSelectDate,
  onSelectSlot,
}: Props): React.JSX.Element {
  const theme = useTheme();

  return (
    <Card style={styles.sectionCard} variant="elevated">
      <View style={styles.headerRow}>
        <Typography variant="h4" color={theme.colors.textPrimary}>
          Available Slots
        </Typography>
      </View>

      {/* Date Picker */}
      <View style={styles.dateSelectorContainer}>
        <DateSelector
          availableDates={availableDates}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
        />
      </View>

      {/* Legend */}
      <SlotLegend />

      {/* Time Slot Grid */}
      <View style={styles.gridContainer}>
        <TimeSlotGrid
          slots={slotsForSelectedDate}
          selectedSlot={selectedSlot}
          onSelectSlot={onSelectSlot}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  headerRow: {
    marginBottom: 12,
  },
  dateSelectorContainer: {
    marginBottom: 12,
  },
  gridContainer: {
    marginTop: 4,
  },
});

export const AvailableSlotsSection = memo(AvailableSlotsSectionBase);
