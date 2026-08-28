/**
 * OrderSuccessModal — Custom animated success modal replacing native Alert.alert() on checkout.
 * Displays celebration icon, order ID, total paid, items summary, delivery estimate,
 * and navigation actions.
 */
import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Typography } from '../../../components/design-system/Typography';
import { Button } from '../../../components/design-system/Button';

interface OrderSuccessModalProps {
  visible: boolean;
  orderId: string;
  totalAmount: number;
  itemCount: number;
  onContinueShopping: () => void;
  onViewHealthRecords?: () => void;
}

export function OrderSuccessModal({
  visible,
  orderId,
  totalAmount,
  itemCount,
  onContinueShopping,
  onViewHealthRecords,
}: OrderSuccessModalProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onContinueShopping}
    >
      <TouchableWithoutFeedback onPress={onContinueShopping}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <View style={[styles.modalCard, { backgroundColor: theme.colors.surface }]}>
              {/* Success Badge */}
              <View style={[styles.iconCircle, { backgroundColor: '#D1FAE5' }]}>
                <Typography variant="h1" style={styles.emojiIcon}>🎉</Typography>
              </View>

              {/* Title & Subtitle */}
              <Typography variant="h3" color={theme.colors.textPrimary} style={styles.title}>
                Order Placed Successfully!
              </Typography>
              <Typography variant="body" color={theme.colors.textSecondary} align="center" style={styles.subtitle}>
                Thank you for choosing Amrutam Ayurveda. Your herbal formulation order has been confirmed.
              </Typography>

              {/* Order Info Card */}
              <View style={[styles.infoCard, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}>
                <View style={styles.infoRow}>
                  <Typography variant="caption" color={theme.colors.textSecondary}>Order ID</Typography>
                  <Typography variant="label" color={theme.colors.textPrimary} style={{ fontWeight: '700' }}>
                    #{orderId}
                  </Typography>
                </View>

                <View style={styles.infoRow}>
                  <Typography variant="caption" color={theme.colors.textSecondary}>Total Amount</Typography>
                  <Typography variant="h4" color={theme.colors.primary} style={{ fontWeight: '800' }}>
                    ₹{totalAmount}
                  </Typography>
                </View>

                <View style={styles.infoRow}>
                  <Typography variant="caption" color={theme.colors.textSecondary}>Items Purchased</Typography>
                  <Typography variant="label" color={theme.colors.textPrimary}>
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </Typography>
                </View>

                <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                  <Typography variant="caption" color={theme.colors.textSecondary}>Estimated Delivery</Typography>
                  <Typography variant="label" color={theme.colors.success} style={{ fontWeight: '700' }}>
                    3-5 Business Days
                  </Typography>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonCol}>
                <Button
                  label="Continue Shopping"
                  onPress={onContinueShopping}
                  fullWidth
                  variant="primary"
                  testID="order-success-continue-btn"
                />

                {onViewHealthRecords && (
                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={onViewHealthRecords}
                    accessibilityLabel="View Health Records"
                    accessibilityRole="button"
                  >
                    <Typography variant="label" color={theme.colors.primary} style={{ fontWeight: '700' }}>
                      View Health Records →
                    </Typography>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emojiIcon: {
    fontSize: 36,
  },
  title: {
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    lineHeight: 20,
  },
  infoCard: {
    width: '100%',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    marginVertical: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  buttonCol: {
    width: '100%',
    gap: 10,
    marginTop: 8,
  },
  secondaryBtn: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
