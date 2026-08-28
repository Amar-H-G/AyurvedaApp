/**
 * DoctorDetailScreen — full profile, slot picker, booking flow.
 */
import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
import {
  View, ScrollView, Image, StyleSheet, FlatList, TouchableOpacity, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Doctor, TimeSlot } from '../../../types';
import { consultationApi } from '../../../services/api/consultationApi';
import { useTheme } from '../../../hooks/useTheme';
import { Typography } from '../../../components/design-system/Typography';
import { Button } from '../../../components/design-system/Button';
import { Card } from '../../../components/design-system/Card';
import { Chip } from '../../../components/design-system/Chip';
import { LoadingState, ErrorState } from '../../../components/design-system/StateViews';
import { useBooking } from '../hooks/useBooking';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';

interface Props {
  route: { params: { doctorId: string } };
  navigation: { goBack: () => void; navigate: (s: string, p?: object) => void };
}

function formatDay(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'EEE, MMM d');
}

function DoctorDetailScreenBase({ route, navigation }: Props): React.JSX.Element {
  const { doctorId } = route.params;
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isLoadingDoctor, setIsLoadingDoctor] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const { book, isBooking, bookingError, clearError } = useBooking();

  // Fetch doctor and slots
  useEffect(() => {
    let isMounted = true;

    const fetchDoctor = async () => {
      const result = await consultationApi.getDoctorById(doctorId);
      if (!isMounted) return;
      if (result.success) setDoctor(result.data);
      else setFetchError(result.error.message);
      setIsLoadingDoctor(false);
    };

    const fetchSlots = async () => {
      const result = await consultationApi.getSlots(doctorId);
      if (!isMounted) return;
      if (result.success) {
        setSlots(result.data);
        // Pre-select first available date
        const firstAvailableSlot = result.data.find(s => !s.isBooked && !s.isExpired);
        if (firstAvailableSlot) setSelectedDate(firstAvailableSlot.date);
      }
      setIsLoadingSlots(false);
    };

    fetchDoctor();
    fetchSlots();

    return () => { isMounted = false; };
  }, [doctorId]);

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const groups: Record<string, TimeSlot[]> = {};
    slots.forEach(slot => {
      if (!groups[slot.date]) groups[slot.date] = [];
      groups[slot.date].push(slot);
    });
    return groups;
  }, [slots]);

  const availableDates = useMemo(() => Object.keys(slotsByDate).sort(), [slotsByDate]);

  const slotsForSelectedDate = useMemo(
    () => (selectedDate ? slotsByDate[selectedDate] ?? [] : []),
    [selectedDate, slotsByDate]
  );

  const handleBook = useCallback(async () => {
    if (!selectedSlot || !doctor) return;

    clearError();
    const success = await book(
      { id: doctor.id, name: doctor.name, consultationFee: doctor.consultationFee },
      selectedSlot
    );

    if (success) {
      Alert.alert(
        'Booking Confirmed!',
        `Your consultation with ${doctor.name} is booked for ${format(parseISO(selectedSlot.date), 'MMMM d, yyyy')} at ${selectedSlot.startTime}.`,
        [
          { text: 'View Upcoming', onPress: () => navigation.navigate('UpcomingConsultations') },
          { text: 'OK', style: 'cancel' },
        ]
      );
      setSelectedSlot(null);
    }
  }, [selectedSlot, doctor, book, clearError, navigation]);

  if (isLoadingDoctor) return <LoadingState message="Loading doctor profile..." />;
  if (fetchError || !doctor) return <ErrorState message={fetchError ?? 'Doctor not found'} onRetry={() => navigation.goBack()} />;

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <Image source={{ uri: doctor.imageUrl }} style={styles.avatar} />
          <Typography variant="h2" color={theme.colors.textPrimary} align="center">
            {doctor.name}
          </Typography>
          <Typography variant="body" color={theme.colors.primary} align="center">
            {doctor.specialty}
          </Typography>
          <Typography variant="bodySmall" color={theme.colors.textSecondary} align="center">
            {doctor.qualification} · {doctor.experience} years experience
          </Typography>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Typography variant="h3" color={theme.colors.warning}>★ {doctor.rating}</Typography>
              <Typography variant="caption" color={theme.colors.textTertiary}>{doctor.reviewCount} reviews</Typography>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.statItem}>
              <Typography variant="h3" color={theme.colors.textPrimary}>₹{doctor.consultationFee}</Typography>
              <Typography variant="caption" color={theme.colors.textTertiary}>per session</Typography>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.statItem}>
              <Typography variant="h3" color={theme.colors.textPrimary}>📍</Typography>
              <Typography variant="caption" color={theme.colors.textTertiary}>{doctor.location}</Typography>
            </View>
          </View>
        </View>

        {/* Bio */}
        <Card style={styles.section}>
          <Typography variant="h4" color={theme.colors.textPrimary} style={styles.sectionTitle}>About</Typography>
          <Typography variant="body" color={theme.colors.textSecondary}>{doctor.bio}</Typography>
        </Card>

        {/* Languages */}
        <Card style={styles.section}>
          <Typography variant="h4" color={theme.colors.textPrimary} style={styles.sectionTitle}>Languages</Typography>
          <View style={styles.chipRow}>
            {doctor.languages.map(lang => (
              <Chip key={lang} label={lang} variant="tag" />
            ))}
          </View>
        </Card>

        {/* Slot Picker */}
        <Card style={styles.section}>
          <Typography variant="h4" color={theme.colors.textPrimary} style={styles.sectionTitle}>
            Available Slots
          </Typography>
          {isLoadingSlots ? (
            <LoadingState message="Loading slots..." />
          ) : (
            <>
              {/* Date selector */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
                {availableDates.map(date => (
                  <TouchableOpacity
                    key={date}
                    onPress={() => { setSelectedDate(date); setSelectedSlot(null); }}
                    style={[
                      styles.dateChip,
                      {
                        backgroundColor: selectedDate === date ? theme.colors.primary : theme.colors.surfaceVariant,
                        borderColor: selectedDate === date ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                    accessibilityLabel={`Select date ${formatDay(date)}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: selectedDate === date }}
                  >
                    <Typography
                      variant="label"
                      color={selectedDate === date ? theme.colors.textOnPrimary : theme.colors.textSecondary}
                    >
                      {formatDay(date)}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Time slots grid */}
              <View style={styles.slotsGrid}>
                {slotsForSelectedDate.map(slot => {
                  const isSelected = selectedSlot?.id === slot.id;
                  const isDisabled = slot.isBooked || slot.isExpired;

                  return (
                    <TouchableOpacity
                      key={slot.id}
                      onPress={() => !isDisabled && setSelectedSlot(slot)}
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
                            : theme.colors.primary,
                          opacity: isDisabled ? 0.5 : 1,
                        },
                      ]}
                      disabled={isDisabled}
                      accessibilityLabel={`${slot.startTime} slot${isDisabled ? ', unavailable' : ''}`}
                      accessibilityState={{ disabled: isDisabled, selected: isSelected }}
                    >
                      <Typography
                        variant="caption"
                        color={isSelected ? theme.colors.textOnPrimary : isDisabled ? theme.colors.textDisabled : theme.colors.textPrimary}
                      >
                        {slot.startTime}
                      </Typography>
                      {slot.isBooked && (
                        <Typography variant="caption" color={theme.colors.textDisabled}>{'\n'}Booked</Typography>
                      )}
                      {slot.isExpired && (
                        <Typography variant="caption" color={theme.colors.textDisabled}>{'\n'}Expired</Typography>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}
        </Card>

        {/* Error */}
        {bookingError && (
          <Card style={[styles.section, { backgroundColor: theme.colors.errorBackground }]}>
            <Typography variant="bodySmall" color={theme.colors.error}>{bookingError}</Typography>
          </Card>
        )}
      </ScrollView>

      {/* Book button — sticky at bottom */}
      <View style={[styles.bottomBar, { backgroundColor: theme.colors.surface, paddingBottom: insets.bottom + 8 }]}>
        <Button
          label={isBooking ? 'Booking...' : selectedSlot ? `Book ${selectedSlot.startTime}` : 'Select a Time Slot'}
          onPress={handleBook}
          disabled={!selectedSlot || isBooking}
          isLoading={isBooking}
          fullWidth
          testID="book-consultation-btn"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { alignItems: 'center', padding: 24, gap: 6 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 8 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  statItem: { alignItems: 'center', flex: 1 },
  divider: { width: 1, height: 32, marginHorizontal: 8 },
  section: { margin: 16, marginTop: 0, marginBottom: 8 },
  sectionTitle: { marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dateScroll: { marginBottom: 12 },
  dateChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    minWidth: 70,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
});

export const DoctorDetailScreen = memo(DoctorDetailScreenBase);
