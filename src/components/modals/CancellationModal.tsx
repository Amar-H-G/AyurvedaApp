/**
 * CancellationModal — custom React Native popup for consultation cancellation confirmation.
 * Replaces native Alert.alert with a premium, theme-aware, accessible warning modal.
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
import { Booking } from '../../types';

interface Props {
  visible: boolean;
  booking: Booking | null;
  onConfirmCancel: () => void;
  onClose: () => void;
  isProcessing?: boolean;
}

function formatDateForDisplay(dateStr: string): string {
  try {
    const parsed = parseISO(dateStr);
    return format(parsed, 'EEEE, MMMM d, yyyy');
  } catch (e) {
    return dateStr;
  }
}

function CancellationModalBase({
  visible,
  booking,
  onConfirmCancel,
  onClose,
  isProcessing = false,
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

  const doctorName = booking?.doctorName ?? 'Consultation';
  const dateFormatted = booking ? formatDateForDisplay(booking.date) : '';
  const timeFormatted = booking ? `${booking.startTime} – ${booking.endTime}` : '';
  const fee = booking?.consultationFee ?? 0;

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

        {/* Animated Modal Container */}
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
          {/* Header Warning Icon Badge */}
          <View style={styles.iconContainer}>
            <View style={[styles.outerGlowRing, { backgroundColor: theme.colors.error + '18' }]}>
              <View style={[styles.innerWarningCircle, { backgroundColor: theme.colors.error }]}>
                <Typography variant="h3" color="#FFFFFF" style={styles.warningIconText}>
                  ✕
                </Typography>
              </View>
            </View>
          </View>

          {/* Title & Subtitle */}
          <Typography variant="h2" align="center" color={theme.colors.textPrimary} style={styles.title}>
            Cancel Booking?
          </Typography>

          <Typography
            variant="bodySmall"
            align="center"
            color={theme.colors.textSecondary}
            style={styles.subtitle}
          >
            Are you sure you want to cancel this consultation? This action will release your slot.
          </Typography>

          {/* Booking Summary Box */}
          {booking && (
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
            </View>
          )}

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <Button
              label={isProcessing ? 'Cancelling...' : 'YES, CANCEL BOOKING'}
              onPress={onConfirmCancel}
              variant="primary"
              isLoading={isProcessing}
              disabled={isProcessing}
              style={{ backgroundColor: theme.colors.error }}
              fullWidth
              testID="modal-confirm-cancel-btn"
            />

            <TouchableOpacity
              onPress={onClose}
              disabled={isProcessing}
              style={styles.secondaryBtn}
              accessibilityLabel="Keep booking"
              accessibilityRole="button"
              testID="modal-keep-booking-btn"
            >
              <Typography variant="label" color={theme.colors.textSecondary} align="center">
                Keep Booking
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
    shadowColor: 'transparent',
    elevation: 0,
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
  innerWarningCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningIconText: {
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

export const CancellationModal = memo(CancellationModalBase);
