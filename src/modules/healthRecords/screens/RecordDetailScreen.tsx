/**
 * RecordDetailScreen — Dynamic health record detail view with full-screen
 * image preview modal, PDF viewer modal, and share/download actions.
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { healthRecordsApi } from '../../../services/api/healthRecordsApi';
import { HealthRecord, RecordType, Attachment } from '../../../types';
import { useTheme } from '../../../hooks/useTheme';
import { Typography } from '../../../components/design-system/Typography';
import { Card } from '../../../components/design-system/Card';
import { Chip } from '../../../components/design-system/Chip';
import { Button } from '../../../components/design-system/Button';
import { RECORD_TYPE_LABELS } from '../../../constants';
import { ImagePreviewModal } from '../components/ImagePreviewModal';
import { PdfPreviewModal } from '../components/PdfPreviewModal';
import { HealthStackParams } from '../../../navigation/RootNavigator';
import { useAppStore } from '../../../store/app/appStore';

type RecordDetailRouteProp = RouteProp<HealthStackParams, 'RecordDetail'>;

const TYPE_ICONS: Record<RecordType, string> = {
  lab_report: '🧪',
  prescription: '💊',
  consultation: '👨‍⚕️',
  vaccination: '💉',
  allergy: '🌸',
};

const TYPE_COLORS: Record<RecordType, string> = {
  lab_report: '#2196F3',
  prescription: '#9C27B0',
  consultation: '#4CAF50',
  vaccination: '#FF9800',
  allergy: '#F44336',
};

export function RecordDetailScreen(): React.JSX.Element {
  const route = useRoute<RecordDetailRouteProp>();
  const navigation = useNavigation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const showToast = useAppStore(state => state.showToast);

  const recordId = route.params?.recordId;
  const [record, setRecord] = useState<HealthRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [selectedImage, setSelectedImage] = useState<Attachment | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<Attachment | null>(null);

  useEffect(() => {
    if (!recordId) return;
    setIsLoading(true);
    healthRecordsApi.getRecordById(recordId).then(res => {
      if (res.success && res.data) {
        setRecord(res.data);
      }
      setIsLoading(false);
    });
  }, [recordId]);

  const handleAttachmentClick = useCallback((att: Attachment) => {
    if (att.type === 'image') {
      setSelectedImage(att);
    } else {
      setSelectedPdf(att);
    }
  }, []);

  const handleShareRecord = useCallback(() => {
    if (!record) return;
    Alert.alert('Share Record', `Sharing details for "${record.title}"`);
  }, [record]);

  const handleDownloadFullReport = useCallback(() => {
    if (!record) return;
    showToast({ message: `Downloading complete medical report PDF for ${record.title}`, type: 'success' });
  }, [record, showToast]);

  if (isLoading) {
    return (
      <View style={[styles.loadingScreen, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Typography variant="body" color={theme.colors.textSecondary} style={{ marginTop: 12 }}>
          Loading Health Record...
        </Typography>
      </View>
    );
  }

  if (!record) {
    return (
      <View style={[styles.loadingScreen, { backgroundColor: theme.colors.background }]}>
        <Typography variant="h3" color={theme.colors.textPrimary}>
          Record Not Found
        </Typography>
        <Button
          label="Back to Records"
          variant="outline"
          onPress={() => navigation.goBack()}
          style={{ marginTop: 16 }}
        />
      </View>
    );
  }

  const typeColor = TYPE_COLORS[record.type] ?? theme.colors.primary;

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Badge & Title */}
        <Card style={styles.headerCard} variant="elevated">
          <View style={styles.headerRow}>
            <View style={[styles.typeBadge, { backgroundColor: typeColor + '20' }]}>
              <Typography variant="h2">{TYPE_ICONS[record.type]}</Typography>
            </View>
            <View style={{ flex: 1 }}>
              <Typography variant="h3" color={theme.colors.textPrimary}>
                {record.title}
              </Typography>
              <Typography variant="caption" color={typeColor} style={{ marginTop: 2, fontWeight: '700' }}>
                {RECORD_TYPE_LABELS[record.type]}
              </Typography>
            </View>
          </View>

          <View style={[styles.metaDivider, { backgroundColor: theme.colors.border }]} />

          {/* Meta Info */}
          <View style={styles.metaRow}>
            <View style={styles.metaCol}>
              <Typography variant="caption" color={theme.colors.textTertiary}>Date</Typography>
              <Typography variant="bodySmall" color={theme.colors.textPrimary} style={{ fontWeight: '600' }}>
                📅 {record.date}
              </Typography>
            </View>
            {record.doctorName && (
              <View style={styles.metaCol}>
                <Typography variant="caption" color={theme.colors.textTertiary}>Doctor</Typography>
                <Typography variant="bodySmall" color={theme.colors.textPrimary} style={{ fontWeight: '600' }}>
                  👨‍⚕️ {record.doctorName}
                </Typography>
              </View>
            )}
            {record.hospitalName && (
              <View style={styles.metaCol}>
                <Typography variant="caption" color={theme.colors.textTertiary}>Hospital / Facility</Typography>
                <Typography variant="bodySmall" color={theme.colors.textPrimary} style={{ fontWeight: '600' }}>
                  🏥 {record.hospitalName}
                </Typography>
              </View>
            )}
          </View>
        </Card>

        {/* Description Section */}
        <Card style={styles.sectionCard} variant="outlined">
          <Typography variant="h4" color={theme.colors.textPrimary} style={styles.sectionTitle}>
            📝 Record Summary & Description
          </Typography>
          <Typography variant="body" color={theme.colors.textSecondary} style={{ lineHeight: 22 }}>
            {record.description}
          </Typography>
        </Card>

        {/* Tags Section */}
        {record.tags.length > 0 && (
          <Card style={styles.sectionCard} variant="outlined">
            <Typography variant="h4" color={theme.colors.textPrimary} style={styles.sectionTitle}>
              🏷️ Medical Tags
            </Typography>
            <View style={styles.tagsContainer}>
              {record.tags.map(tag => (
                <Chip key={tag} label={tag} variant="tag" style={{ marginRight: 6 }} />
              ))}
            </View>
          </Card>
        )}

        {/* Attachments Section */}
        <Card style={styles.sectionCard} variant="outlined">
          <Typography variant="h4" color={theme.colors.textPrimary} style={styles.sectionTitle}>
            📎 Attached Files ({record.attachments.length})
          </Typography>
          {record.attachments.length === 0 ? (
            <Typography variant="caption" color={theme.colors.textTertiary}>
              No files attached to this record.
            </Typography>
          ) : (
            <View style={styles.attachmentsList}>
              {record.attachments.map(att => (
                <TouchableOpacity
                  key={att.id}
                  style={[styles.attachmentCard, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
                  onPress={() => handleAttachmentClick(att)}
                  accessibilityLabel={`View attachment ${att.fileName}`}
                  accessibilityRole="button"
                >
                  {att.type === 'image' && att.thumbnailUrl ? (
                    <Image source={{ uri: att.thumbnailUrl }} style={styles.attThumb} />
                  ) : (
                    <View style={[styles.pdfBadge, { backgroundColor: theme.colors.errorBackground }]}>
                      <Typography variant="caption" color={theme.colors.error} style={{ fontWeight: '700' }}>
                        📄 PDF
                      </Typography>
                    </View>
                  )}
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Typography variant="bodySmall" color={theme.colors.textPrimary} numberOfLines={1} style={{ fontWeight: '600' }}>
                      {att.fileName}
                    </Typography>
                    <Typography variant="caption" color={theme.colors.primary}>
                      {att.type === 'image' ? 'Tap to preview image' : 'Tap to open PDF viewer'}
                    </Typography>
                  </View>
                  <Typography variant="body" color={theme.colors.textTertiary}>➔</Typography>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Card>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={[styles.bottomBar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border, paddingBottom: insets.bottom + 12 }]}>
        <Button
          label="📥 Export PDF"
          variant="outline"
          onPress={handleDownloadFullReport}
          style={{ flex: 1, marginRight: 8 }}
        />
        <Button
          label="📤 Share"
          variant="primary"
          onPress={handleShareRecord}
          style={{ flex: 1, marginLeft: 8 }}
        />
      </View>

      {/* Modals */}
      <ImagePreviewModal
        visible={selectedImage !== null}
        attachment={selectedImage}
        onClose={() => setSelectedImage(null)}
      />

      <PdfPreviewModal
        visible={selectedPdf !== null}
        attachment={selectedPdf}
        recordTitle={record.title}
        doctorName={record.doctorName}
        onClose={() => setSelectedPdf(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  content: { padding: 16 },
  headerCard: { padding: 16, marginBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  typeBadge: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  metaDivider: { height: 1, marginVertical: 12 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  metaCol: { flex: 1, minWidth: 100 },
  sectionCard: { padding: 16, marginBottom: 12 },
  sectionTitle: { marginBottom: 10 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  attachmentsList: { gap: 10 },
  attachmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  attThumb: { width: 50, height: 50, borderRadius: 6 },
  pdfBadge: { width: 50, height: 50, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
});
