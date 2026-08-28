/**
 * BookingConfirmationModal — custom React Native popup for booking confirmation.
 * Replaces native Alert.alert with a premium, theme-aware, accessible modal.
 */
import React, { useEffect, useRef, memo } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { format, parseISO } from 'date-fns';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../design-system/Typography';
import { Button } from '../design-system/Button';

export interface BookingDetailsPayload {
  doctorName: string;
  date: string;
  startTime: string;
  endTime?: string;
  consultationFee: number;
}

interface Props {
  visible: boolean;
  bookingDetails: BookingDetailsPayload | null;
  onConfirmViewUpcoming: () => void;
  onClose: () => void;
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

function formatDateForDisplay(dateStr: string): string {
  try {
    const parsed = parseISO(dateStr);
    return format(parsed, 'EEEE, MMMM d, yyyy');
  } catch (e) {
    return dateStr;
  }
}

function BookingConfirmationModalBase({
  visible,
  bookingDetails,
  onConfirmViewUpcoming,
  onClose,
}: Props): React.JSX.Element | null {
  const theme = useTheme();
  const animOpacity = useRef(new Animated.Value(0)).current;
  const animScale = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(animOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(animScale, {
          toValue: 1,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(animOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(animScale, {
          toValue: 0.94,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, animOpacity, animScale]);

  if (!visible && (animOpacity as any)._value === 0) {
    return null;
  }

  const doctorName = bookingDetails?.doctorName ?? 'Your Doctor';
  const dateFormatted = bookingDetails ? formatDateForDisplay(bookingDetails.date) : '';
  const timeFormatted = bookingDetails ? formatTimeForDisplay(bookingDetails.startTime) : '';
  const fee = bookingDetails?.consultationFee ?? 0;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <View style={styles.overlayContainer}>
        {/* Semi-transparent backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: animOpacity,
              },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Animated Modal Body */}
        <Animated.View
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              opacity: animOpacity,
              transform: [{ scale: animScale }],
            },
          ]}
          accessibilityLiveRegion="assertive"
        >
          {/* Header Success Icon Badge */}
          <View style={styles.iconContainer}>
            <View style={[styles.outerGlowRing, { backgroundColor: theme.colors.primary + '18' }]}>
              <View style={[styles.innerCheckCircle, { backgroundColor: theme.colors.primary }]}>
                <Typography variant="h2" color="#FFFFFF" style={styles.checkMarkText}>
                  ✓
                </Typography>
              </View>
            </View>
          </View>

          {/* Heading */}
          <Typography variant="h2" align="center" color={theme.colors.textPrimary} style={styles.title}>
            Booking Confirmed!
          </Typography>

          <Typography
            variant="bodySmall"
            align="center"
            color={theme.colors.textSecondary}
            style={styles.subtitle}
          >
            Your consultation has been booked successfully.
          </Typography>

          {/* Booking Details Card */}
          <View style={[styles.detailsCard, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}>
            <View style={styles.detailRow}>
              <Typography variant="caption" color={theme.colors.textTertiary} style={styles.detailLabel}>
                Doctor
              </Typography>
              <Typography variant="label" color={theme.colors.textPrimary} style={styles.detailValue} numberOfLines={1}>
                {doctorName}
              </Typography>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.colors.border + '60' }]} />

            <View style={styles.detailRow}>
              <Typography variant="caption" color={theme.colors.textTertiary} style={styles.detailLabel}>
                Date
              </Typography>
              <Typography variant="label" color={theme.colors.textPrimary} style={styles.detailValue} numberOfLines={1}>
                {dateFormatted}
              </Typography>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.colors.border + '60' }]} />

            <View style={styles.detailRow}>
              <Typography variant="caption" color={theme.colors.textTertiary} style={styles.detailLabel}>
                Time
              </Typography>
              <Typography variant="label" color={theme.colors.primary} style={styles.detailValue}>
                ⏰ {timeFormatted}
              </Typography>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.colors.border + '60' }]} />

            <View style={styles.detailRow}>
              <Typography variant="caption" color={theme.colors.textTertiary} style={styles.detailLabel}>
                Fee Paid
              </Typography>
              <Typography variant="h4" color={theme.colors.textPrimary} style={styles.detailValue}>
                ₹{fee}
              </Typography>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <Button
              label="VIEW UPCOMING"
              onPress={onConfirmViewUpcoming}
              variant="primary"
              fullWidth
              testID="modal-view-upcoming-btn"
            />
            <TouchableOpacity
              onPress={onClose}
              style={styles.secondaryBtn}
              accessibilityLabel="Dismiss modal"
              accessibilityRole="button"
              testID="modal-dismiss-ok-btn"
            >
              <Typography variant="label" color={theme.colors.textSecondary} align="center">
                OK
              </Typography>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  modalContent: {
    width: Math.min(width - 36, 400),
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  iconContainer: {
    marginBottom: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerGlowRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCheckCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  checkMarkText: {
    fontWeight: 'bold',
    lineHeight: 28,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 20,
  },
  detailsCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    flex: 1,
  },
  detailValue: {
    flex: 2,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    width: '100%',
  },
  actionsContainer: {
    width: '100%',
    gap: 10,
  },
  secondaryBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const BookingConfirmationModal = memo(BookingConfirmationModalBase);
