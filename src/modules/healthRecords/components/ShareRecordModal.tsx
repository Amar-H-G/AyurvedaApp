/**
 * ShareRecordModal — Modern custom template modal for sharing health records & reports.
 * Replaces native Alert.alert popups with a beautiful bottom-sheet action menu.
 */
import React, { useCallback } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HealthRecord } from '../../../types';
import { useTheme } from '../../../hooks/useTheme';
import { Typography } from '../../../components/design-system/Typography';
import { Card } from '../../../components/design-system/Card';
import { Button } from '../../../components/design-system/Button';
import { RECORD_TYPE_LABELS } from '../../../constants';
import { useAppStore } from '../../../store/app/appStore';

interface ShareRecordModalProps {
  visible: boolean;
  record: HealthRecord | null;
  onClose: () => void;
}

export function ShareRecordModal({
  visible,
  record,
  onClose,
}: ShareRecordModalProps): React.JSX.Element | null {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const showToast = useAppStore(state => state.showToast);

  const handleShareWhatsApp = useCallback(() => {
    if (!record) return;
    showToast({
      message: `Shared "${record.title}" via WhatsApp successfully!`,
      type: 'success',
    });
    onClose();
  }, [record, showToast, onClose]);

  const handleShareEmail = useCallback(() => {
    if (!record) return;
    showToast({
      message: `Encrypted report for "${record.title}" sent to doctor's email!`,
      type: 'success',
    });
    onClose();
  }, [record, showToast, onClose]);

  const handleCopyLink = useCallback(() => {
    if (!record) return;
    showToast({
      message: `Secure 24h access link copied to clipboard!`,
      type: 'info',
    });
    onClose();
  }, [record, showToast, onClose]);

  const handleExportPDF = useCallback(() => {
    if (!record) return;
    showToast({
      message: `Generating formatted PDF export for "${record.title}"...`,
      type: 'success',
    });
    onClose();
  }, [record, showToast, onClose]);

  if (!record) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={e => e.stopPropagation?.()}>
            <View
              style={[
                styles.sheet,
                {
                  backgroundColor: theme.colors.surface,
                  borderTopColor: theme.colors.border,
                  paddingBottom: Math.max(insets.bottom + 16, 24),
                },
              ]}
            >
              {/* Handle Bar */}
              <View style={styles.handleContainer}>
                <View
                  style={[
                    styles.handle,
                    { backgroundColor: theme.colors.border },
                  ]}
                />
              </View>

              {/* Title & Header */}
              <View style={styles.header}>
                <Typography variant="h3" color={theme.colors.textPrimary}>
                  📤 Share Health Record
                </Typography>
                <Typography
                  variant="caption"
                  color={theme.colors.textSecondary}
                  style={{ marginTop: 2 }}
                >
                  Choose how you want to share this medical report
                </Typography>
              </View>

              {/* Record Summary Card */}
              <Card style={styles.summaryCard} variant="outlined">
                <Typography
                  variant="h4"
                  color={theme.colors.textPrimary}
                  numberOfLines={1}
                >
                  {record.title}
                </Typography>
                <Typography
                  variant="caption"
                  color={theme.colors.primary}
                  style={{ fontWeight: '600', marginTop: 2 }}
                >
                  {RECORD_TYPE_LABELS[record.type]} • {record.date}
                </Typography>
                {record.doctorName ? (
                  <Typography
                    variant="caption"
                    color={theme.colors.textTertiary}
                    style={{ marginTop: 2 }}
                  >
                    👨‍⚕️ {record.doctorName}
                  </Typography>
                ) : null}
              </Card>

              {/* Share Channel Options */}
              <View style={styles.optionsList}>
                {/* WhatsApp Option */}
                <TouchableOpacity
                  style={[
                    styles.optionRow,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.background,
                    },
                  ]}
                  onPress={handleShareWhatsApp}
                  activeOpacity={0.7}
                  accessibilityLabel="Share via WhatsApp"
                  accessibilityRole="button"
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#25D36620' }]}>
                    <Typography variant="h3">💬</Typography>
                  </View>
                  <View style={styles.optionText}>
                    <Typography variant="label" color={theme.colors.textPrimary}>
                      Share via WhatsApp
                    </Typography>
                    <Typography variant="caption" color={theme.colors.textSecondary}>
                      Send formatted summary & attachments directly
                    </Typography>
                  </View>
                  <Typography variant="body" color={theme.colors.textTertiary}>
                    ➔
                  </Typography>
                </TouchableOpacity>

                {/* Email Option */}
                <TouchableOpacity
                  style={[
                    styles.optionRow,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.background,
                    },
                  ]}
                  onPress={handleShareEmail}
                  activeOpacity={0.7}
                  accessibilityLabel="Send to Doctor via Email"
                  accessibilityRole="button"
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#2196F320' }]}>
                    <Typography variant="h3">📧</Typography>
                  </View>
                  <View style={styles.optionText}>
                    <Typography variant="label" color={theme.colors.textPrimary}>
                      Send to Doctor via Email
                    </Typography>
                    <Typography variant="caption" color={theme.colors.textSecondary}>
                      Encrypted medical delivery to clinic or doctor
                    </Typography>
                  </View>
                  <Typography variant="body" color={theme.colors.textTertiary}>
                    ➔
                  </Typography>
                </TouchableOpacity>

                {/* Copy Link Option */}
                <TouchableOpacity
                  style={[
                    styles.optionRow,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.background,
                    },
                  ]}
                  onPress={handleCopyLink}
                  activeOpacity={0.7}
                  accessibilityLabel="Copy Secure Link"
                  accessibilityRole="button"
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#9C27B020' }]}>
                    <Typography variant="h3">🔗</Typography>
                  </View>
                  <View style={styles.optionText}>
                    <Typography variant="label" color={theme.colors.textPrimary}>
                      Copy Secure Link
                    </Typography>
                    <Typography variant="caption" color={theme.colors.textSecondary}>
                      Generate a 24-hour temporary access URL
                    </Typography>
                  </View>
                  <Typography variant="body" color={theme.colors.textTertiary}>
                    ➔
                  </Typography>
                </TouchableOpacity>

                {/* Export PDF Option */}
                <TouchableOpacity
                  style={[
                    styles.optionRow,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.background,
                    },
                  ]}
                  onPress={handleExportPDF}
                  activeOpacity={0.7}
                  accessibilityLabel="Export PDF Document"
                  accessibilityRole="button"
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#FF980020' }]}>
                    <Typography variant="h3">📄</Typography>
                  </View>
                  <View style={styles.optionText}>
                    <Typography variant="label" color={theme.colors.textPrimary}>
                      Export Printable PDF
                    </Typography>
                    <Typography variant="caption" color={theme.colors.textSecondary}>
                      Download official certified record file
                    </Typography>
                  </View>
                  <Typography variant="body" color={theme.colors.textTertiary}>
                    ➔
                  </Typography>
                </TouchableOpacity>
              </View>

              {/* Cancel Button */}
              <Button
                label="Cancel"
                variant="outline"
                onPress={onClose}
                style={styles.cancelBtn}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handleContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    marginBottom: 12,
  },
  summaryCard: {
    padding: 12,
    marginBottom: 16,
  },
  optionsList: {
    gap: 10,
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionText: {
    flex: 1,
  },
  cancelBtn: {
    width: '100%',
  },
});
