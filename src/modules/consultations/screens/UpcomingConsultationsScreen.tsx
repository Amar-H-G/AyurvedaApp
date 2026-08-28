/**
 * UpcomingConsultationsScreen — shows confirmed/queued bookings with cancel option.
 */
import React, { useState, useCallback, memo } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useConsultationStore } from '../../../store/consultations/consultationStore';
import { useBooking } from '../hooks/useBooking';
import { Booking } from '../../../types';
import { useTheme } from '../../../hooks/useTheme';
import { Typography } from '../../../components/design-system/Typography';
import { Card } from '../../../components/design-system/Card';
import { Button } from '../../../components/design-system/Button';
import { Chip } from '../../../components/design-system/Chip';
import { EmptyState } from '../../../components/design-system/StateViews';
import { CancellationModal } from '../../../components/modals/CancellationModal';
import { format, parseISO } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  confirmed: '#4CAF50',
  queued: '#FF9800',
  pending: '#2196F3',
  cancelled: '#9E9E9E',
};

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmed',
  queued: 'Queued (Offline)',
  pending: 'Pending',
  cancelled: 'Cancelled',
};

interface BookingCardProps {
  booking: Booking;
  onCancel: (booking: Booking) => void;
}

const BookingCard = memo(({ booking, onCancel }: BookingCardProps) => {
  const theme = useTheme();
  const isCancellable = booking.status !== 'cancelled';

  return (
    <Card style={styles.card} variant="elevated">
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Typography variant="h4" color={theme.colors.textPrimary}>{booking.doctorName}</Typography>
          <Typography variant="bodySmall" color={theme.colors.textSecondary}>
            {format(parseISO(booking.date), 'EEEE, MMMM d, yyyy')}
          </Typography>
          <Typography variant="bodySmall" color={theme.colors.textSecondary}>
            {booking.startTime} – {booking.endTime}
          </Typography>
          <Typography variant="label" color={theme.colors.primary} style={styles.fee}>
            ₹{booking.consultationFee}
          </Typography>
        </View>
        <Chip
          label={STATUS_LABELS[booking.status] ?? booking.status}
          statusColor={STATUS_COLORS[booking.status]}
          variant="status"
        />
      </View>
      {booking.status === 'queued' && (
        <View style={[styles.queuedBanner, { backgroundColor: theme.colors.warningBackground }]}>
          <Typography variant="caption" color={theme.colors.warning}>
            ⚡ This booking was created offline and will sync automatically when you reconnect.
          </Typography>
        </View>
      )}
      {isCancellable && (
        <Button
          label="Cancel Booking"
          variant="outline"
          size="sm"
          onPress={() => onCancel(booking)}
          style={styles.cancelBtn}
          accessibilityLabel={`Cancel booking with ${booking.doctorName}`}
        />
      )}
    </Card>
  );
});

function UpcomingConsultationsBase(): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const getUpcomingBookings = useConsultationStore(state => state.getUpcomingBookings);
  const { cancel, isBooking } = useBooking();

  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);

  const upcoming = getUpcomingBookings();

  const handleCancelPress = useCallback((booking: Booking) => {
    setCancelTarget(booking);
  }, []);

  const handleConfirmCancel = useCallback(async () => {
    if (!cancelTarget) return;
    const success = await cancel(cancelTarget.id);
    if (success) {
      setCancelTarget(null);
    }
  }, [cancelTarget, cancel]);

  const handleCloseModal = useCallback(() => {
    setCancelTarget(null);
  }, []);

  const renderItem = useCallback(({ item }: { item: Booking }) => (
    <BookingCard booking={item} onCancel={handleCancelPress} />
  ), [handleCancelPress]);

  const keyExtractor = useCallback((item: Booking) => item.id, []);

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={upcoming}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          <EmptyState
            emoji="📅"
            title="No Upcoming Consultations"
            subtitle="Book a consultation with one of our Ayurvedic doctors"
          />
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 16, paddingTop: 8, flexGrow: 1 }}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={5}
      />

      {/* Custom Cancellation Confirmation Modal */}
      <CancellationModal
        visible={!!cancelTarget}
        booking={cancelTarget}
        onConfirmCancel={handleConfirmCancel}
        onClose={handleCloseModal}
        isProcessing={isBooking}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  card: { margin: 16, marginBottom: 8 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  fee: { marginTop: 4 },
  queuedBanner: { padding: 8, borderRadius: 6, marginTop: 8 },
  cancelBtn: { marginTop: 12, alignSelf: 'flex-start' },
});

export const UpcomingConsultationsScreen = memo(UpcomingConsultationsBase);
