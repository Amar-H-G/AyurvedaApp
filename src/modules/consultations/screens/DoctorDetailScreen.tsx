/**
 * DoctorDetailScreen — full profile, slot picker, custom booking modal flow.
 */
import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
import {
  View, ScrollView, Image, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Doctor, TimeSlot } from '../../../types';
import { consultationApi } from '../../../services/api/consultationApi';
import { useTheme } from '../../../hooks/useTheme';
import { Typography } from '../../../components/design-system/Typography';
import { Button } from '../../../components/design-system/Button';
import { Card } from '../../../components/design-system/Card';
import { Chip } from '../../../components/design-system/Chip';
import { ErrorState } from '../../../components/design-system/StateViews';
import { DoctorDetailsSkeleton } from '../../../components/skeletons/DoctorDetailsSkeleton';
import { SlotSkeleton } from '../../../components/skeletons/SlotSkeleton';
import { AvailableSlotsSection } from '../components/AvailableSlotsSection';
import { BookingConfirmationModal, BookingDetailsPayload } from '../../../components/modals/BookingConfirmationModal';
import { useBooking } from '../hooks/useBooking';

interface Props {
  route: { params: { doctorId: string } };
  navigation: { goBack: () => void; navigate: (s: string, p?: object) => void };
}

function formatTimeForButton(timeStr: string): string {
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

  // Custom Modal state
  const [confirmedBooking, setConfirmedBooking] = useState<BookingDetailsPayload | null>(null);

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

  const handleSelectDate = useCallback((date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  }, []);

  const handleBook = useCallback(async () => {
    if (!selectedSlot || !doctor) return;

    clearError();
    const success = await book(
      { id: doctor.id, name: doctor.name, consultationFee: doctor.consultationFee },
      selectedSlot
    );

    if (success) {
      setConfirmedBooking({
        doctorName: doctor.name,
        date: selectedSlot.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        consultationFee: doctor.consultationFee,
      });
      setSelectedSlot(null);
    }
  }, [selectedSlot, doctor, book, clearError]);

  const handleConfirmViewUpcoming = useCallback(() => {
    setConfirmedBooking(null);
    navigation.navigate('UpcomingConsultations');
  }, [navigation]);

  const handleCloseModal = useCallback(() => {
    setConfirmedBooking(null);
  }, []);

  if (isLoadingDoctor) return <DoctorDetailsSkeleton />;
  if (fetchError || !doctor) return <ErrorState message={fetchError ?? 'Doctor not found'} onRetry={() => navigation.goBack()} />;

  const buttonLabel = isBooking
    ? 'Booking...'
    : selectedSlot
    ? `Book Consultation (${formatTimeForButton(selectedSlot.startTime)})`
    : 'Select a Time Slot';

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        {/* Profile Header Card */}
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

        {/* Bio Card */}
        <Card style={styles.section}>
          <Typography variant="h4" color={theme.colors.textPrimary} style={styles.sectionTitle}>About</Typography>
          <Typography variant="body" color={theme.colors.textSecondary}>{doctor.bio}</Typography>
        </Card>

        {/* Languages Card */}
        <Card style={styles.section}>
          <Typography variant="h4" color={theme.colors.textPrimary} style={styles.sectionTitle}>Languages</Typography>
          <View style={styles.chipRow}>
            {doctor.languages.map(lang => (
              <Chip key={lang} label={lang} variant="tag" />
            ))}
          </View>
        </Card>

        {/* Available Slots Section */}
        {isLoadingSlots ? (
          <Card style={styles.section}>
            <Typography variant="h4" color={theme.colors.textPrimary} style={styles.sectionTitle}>Available Slots</Typography>
            <SlotSkeleton />
          </Card>
        ) : (
          <AvailableSlotsSection
            availableDates={availableDates}
            selectedDate={selectedDate}
            slotsForSelectedDate={slotsForSelectedDate}
            selectedSlot={selectedSlot}
            onSelectDate={handleSelectDate}
            onSelectSlot={setSelectedSlot}
          />
        )}

        {/* Booking Error Banner */}
        {bookingError && (
          <Card style={StyleSheet.flatten([styles.section, { backgroundColor: theme.colors.errorBackground }])}>
            <Typography variant="bodySmall" color={theme.colors.error}>{bookingError}</Typography>
          </Card>
        )}
      </ScrollView>

      {/* Sticky Bottom Booking Bar */}
      <View style={[styles.bottomBar, { backgroundColor: theme.colors.surface, paddingBottom: insets.bottom + 8 }]}>
        <Button
          label={buttonLabel}
          onPress={handleBook}
          disabled={!selectedSlot || isBooking}
          isLoading={isBooking}
          fullWidth
          testID="book-consultation-btn"
        />
      </View>

      {/* Custom Booking Confirmation Modal */}
      <BookingConfirmationModal
        visible={!!confirmedBooking}
        bookingDetails={confirmedBooking}
        onConfirmViewUpcoming={handleConfirmViewUpcoming}
        onClose={handleCloseModal}
      />
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
  section: { marginHorizontal: 16, marginBottom: 16, padding: 16 },
  sectionTitle: { marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
  },
});

export const DoctorDetailScreen = memo(DoctorDetailScreenBase);
