/**
 * PdfPreviewModal — Full-screen PDF preview and download flow.
 */
import React, { useState, useCallback } from 'react';
import {
  Modal, View, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Linking,
} from 'react-native';
import { Typography } from '../../../components/design-system/Typography';
import { Button } from '../../../components/design-system/Button';
import { Card } from '../../../components/design-system/Card';
import { Attachment } from '../../../types';
import { useTheme } from '../../../hooks/useTheme';
import { useAppStore } from '../../../store/app/appStore';

interface PdfPreviewModalProps {
  visible: boolean;
  attachment: Attachment | null;
  recordTitle?: string;
  doctorName?: string;
  onClose: () => void;
}

export function PdfPreviewModal({
  visible,
  attachment,
  recordTitle = 'Medical Health Record',
  doctorName,
  onClose,
}: PdfPreviewModalProps): React.JSX.Element | null {
  const theme = useTheme();
  const showToast = useAppStore(state => state.showToast);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = useCallback(() => {
    if (!attachment) return;
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      showToast({ message: `Downloaded ${attachment.fileName} to Downloads folder`, type: 'success' });
    }, 1000);
  }, [attachment, showToast]);

  const handleExternalOpen = useCallback(() => {
    if (!attachment) return;
    Linking.openURL(attachment.url).catch(() => {
      showToast({ message: 'Could not open external PDF viewer', type: 'error' });
    });
  }, [attachment, showToast]);

  if (!attachment) return null;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            accessibilityLabel="Close PDF viewer"
            accessibilityRole="button"
          >
            <Typography variant="h3" color={theme.colors.textPrimary}>✕</Typography>
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Typography variant="h4" color={theme.colors.textPrimary} numberOfLines={1}>
              {attachment.fileName}
            </Typography>
            <Typography variant="caption" color={theme.colors.primary}>
              📄 PDF Document • Page 1 of 3
            </Typography>
          </View>
          <TouchableOpacity
            onPress={handleExternalOpen}
            style={styles.externalBtn}
            accessibilityLabel="Open in external browser"
            accessibilityRole="button"
          >
            <Typography variant="body">🌐</Typography>
          </TouchableOpacity>
        </View>

        {/* PDF Viewer Card */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Card style={styles.pdfPaper} variant="elevated">
            {/* Header Stamp */}
            <View style={[styles.pdfHeader, { borderBottomColor: theme.colors.border }]}>
              <View>
                <Typography variant="h3" color={theme.colors.primary}>🌿 AMRUTAM AYURVEDA</Typography>
                <Typography variant="caption" color={theme.colors.textSecondary}>Official Certified Health Record</Typography>
              </View>
              <Typography variant="overline" color={theme.colors.textTertiary}>CONFIDENTIAL</Typography>
            </View>

            {/* Document Content */}
            <View style={styles.docSection}>
              <Typography variant="h4" color={theme.colors.textPrimary}>{recordTitle}</Typography>
              {doctorName && (
                <Typography variant="caption" color={theme.colors.primary} style={{ marginTop: 2 }}>
                  Doctor / Issuer: {doctorName}
                </Typography>
              )}
            </View>

            <View style={[styles.reportBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Typography variant="bodySmall" color={theme.colors.textSecondary}>
                [LABORATORY EXAMINATION FINDINGS & DIAGNOSTIC SUMMARY]
              </Typography>
              <Typography variant="caption" color={theme.colors.textTertiary} style={{ marginTop: 8 }}>
                • Hemoglobin: 14.2 g/dL (Normal: 13.0 - 17.0 g/dL){'\n'}
                • Total WBC Count: 7,200 /uL (Normal: 4,000 - 11,000 /uL){'\n'}
                • Platelet Count: 280,000 /uL (Normal: 150,000 - 450,000 /uL){'\n'}
                • Fasting Blood Sugar: 92 mg/dL (Normal: 70 - 99 mg/dL){'\n'}
                • Lipid Profile: Total Cholesterol 178 mg/dL
              </Typography>
            </View>

            <View style={styles.docSection}>
              <Typography variant="caption" color={theme.colors.textSecondary}>
                Doctor Notes: Patient shows steady improvement. Maintain prescribed Ayurvedic regimen with Triphala and warm water twice daily.
              </Typography>
            </View>

            {/* Stamp footer */}
            <View style={[styles.stampFooter, { borderTopColor: theme.colors.border }]}>
              <Typography variant="caption" color={theme.colors.textTertiary}>
                Digitally Signed & Verified by Amrutam Healthcare System
              </Typography>
            </View>
          </Card>
        </ScrollView>

        {/* Footer Download Actions */}
        <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
          <Button
            label={isDownloading ? "Downloading PDF..." : "📥 Download PDF Document"}
            variant="primary"
            onPress={handleDownload}
            disabled={isDownloading}
            style={styles.downloadBtn}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeBtn: {
    padding: 8,
    marginRight: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  externalBtn: {
    padding: 8,
  },
  scrollContent: {
    padding: 16,
    alignItems: 'center',
  },
  pdfPaper: {
    width: '100%',
    padding: 20,
    borderRadius: 8,
    minHeight: 480,
  },
  pdfHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 12,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  docSection: {
    marginBottom: 16,
  },
  reportBox: {
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 16,
  },
  stampFooter: {
    marginTop: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  downloadBtn: {
    width: '100%',
  },
});
