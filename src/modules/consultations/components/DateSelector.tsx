/**
 * DateSelector — horizontal scrollable date picker for available slots.
 * Formats dates into Day Name, Date Number, and Month.
 */
import React, { memo, useCallback } from 'react';
import { ScrollView, TouchableOpacity, View, StyleSheet } from 'react-native';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import { useTheme } from '../../../hooks/useTheme';
import { Typography } from '../../../components/design-system/Typography';

interface Props {
  availableDates: string[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

interface DateInfo {
  dateStr: string;
  dayName: string;
  dayNumber: string;
  monthName: string;
}

function parseDateInfo(dateStr: string): DateInfo {
  try {
    const parsed = parseISO(dateStr);
    let dayName = format(parsed, 'EEE');
    if (isToday(parsed)) dayName = 'Today';
    else if (isTomorrow(parsed)) dayName = 'Tom';

    const dayNumber = format(parsed, 'dd');
    const monthName = format(parsed, 'MMM').toUpperCase();
    return { dateStr, dayName, dayNumber, monthName };
  } catch (e) {
    return { dateStr, dayName: dateStr, dayNumber: '', monthName: '' };
  }
}

function DateSelectorBase({ availableDates, selectedDate, onSelectDate }: Props): React.JSX.Element {
  const theme = useTheme();

  const renderDateItem = useCallback((dateStr: string) => {
    const isSelected = selectedDate === dateStr;
    const info = parseDateInfo(dateStr);

    return (
      <TouchableOpacity
        key={dateStr}
        onPress={() => onSelectDate(dateStr)}
        activeOpacity={0.7}
        style={[
          styles.card,
          {
            backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceVariant,
            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
          },
          isSelected && styles.selectedCardShadow,
        ]}
        accessibilityLabel={`Select date ${info.dayName} ${info.dayNumber} ${info.monthName}`}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
      >
        <Typography
          variant="caption"
          color={isSelected ? theme.colors.textOnPrimary + 'CC' : theme.colors.textTertiary}
          style={styles.dayName}
          numberOfLines={1}
        >
          {info.dayName}
        </Typography>

        <Typography
          variant="h3"
          color={isSelected ? theme.colors.textOnPrimary : theme.colors.textPrimary}
          style={styles.dayNumber}
        >
          {info.dayNumber}
        </Typography>

        <Typography
          variant="caption"
          color={isSelected ? theme.colors.textOnPrimary + 'E6' : theme.colors.textSecondary}
          style={styles.monthName}
          numberOfLines={1}
        >
          {info.monthName}
        </Typography>

        {isSelected && <View style={[styles.activeDot, { backgroundColor: '#D4AF37' }]} />}
      </TouchableOpacity>
    );
  }, [selectedDate, onSelectDate, theme]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      {availableDates.map(renderDateItem)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 6,
    paddingHorizontal: 2,
    gap: 10,
  },
  card: {
    width: 72,
    height: 84,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginRight: 2,
  },
  selectedCardShadow: {
    elevation: 4,
    shadowColor: '#124734',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  dayName: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
  },
  monthName: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 3,
  },
});

export const DateSelector = memo(DateSelectorBase);
