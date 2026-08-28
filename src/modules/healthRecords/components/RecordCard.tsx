/**
 * RecordCard — displays a single health record in the list.
 * Memoized to prevent re-renders during list scrolling, matching DoctorCard.tsx architecture.
 */
import React, { memo, useCallback } from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { HealthRecord, RecordType, Attachment } from '../../../types';
import { useTheme } from '../../../hooks/useTheme';
import { Typography } from '../../../components/design-system/Typography';
import { Card } from '../../../components/design-system/Card';
import { Chip } from '../../../components/design-system/Chip';
import { RECORD_TYPE_LABELS } from '../../../constants';

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

interface RecordCardProps {
  record: HealthRecord;
  onPress: (record: HealthRecord) => void;
  onAttachmentPress?: (att: Attachment, record: HealthRecord) => void;
}

function RecordCardBase({ record, onPress, onAttachmentPress }: RecordCardProps): React.JSX.Element {
  const theme = useTheme();
  const typeColor = TYPE_COLORS[record.type] ?? theme.colors.primary;

  const handlePress = useCallback(() => onPress(record), [record, onPress]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.85}
      accessibilityLabel={`Health record: ${record.title}, ${RECORD_TYPE_LABELS[record.type]}`}
      accessibilityRole="button"
      accessibilityHint="Tap to view record details and attachments"
    >
      <Card style={styles.card} variant="elevated">
        {/* Main Row */}
        <View style={styles.row}>
          <View style={[styles.typeBadge, { backgroundColor: typeColor + '20' }]}>
            <Typography variant="h4">{TYPE_ICONS[record.type]}</Typography>
          </View>
          
          <View style={styles.info}>
            <Typography variant="h4" color={theme.colors.textPrimary} numberOfLines={1}>
              {record.title}
            </Typography>
            <Typography variant="bodySmall" color={typeColor} numberOfLines={1}>
              {RECORD_TYPE_LABELS[record.type]}
            </Typography>
            {record.doctorName ? (
              <Typography variant="caption" color={theme.colors.textSecondary} numberOfLines={1}>
                👨‍⚕️ {record.doctorName} {record.hospitalName ? `· ${record.hospitalName}` : ''}
              </Typography>
            ) : null}
          </View>

          <View style={styles.dateCol}>
            <Typography variant="caption" color={theme.colors.textTertiary}>
              📅 {record.date}
            </Typography>
          </View>
        </View>

        {/* Description Snippet */}
        {record.description ? (
          <Typography
            variant="bodySmall"
            color={theme.colors.textSecondary}
            numberOfLines={2}
            style={styles.description}
          >
            {record.description}
          </Typography>
        ) : null}

        {/* Tags Row */}
        {record.tags.length > 0 && (
          <View style={styles.tags}>
            {record.tags.slice(0, 3).map(tag => (
              <Chip key={tag} label={tag} variant="tag" style={styles.tag} />
            ))}
          </View>
        )}

        {/* Attachments Row */}
        {record.attachments.length > 0 && (
          <View style={styles.attachmentsRow}>
            {record.attachments.slice(0, 3).map(att => (
              <TouchableOpacity
                key={att.id}
                style={[styles.attBadge, { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceVariant }]}
                onPress={(e) => {
                  e.stopPropagation?.();
                  if (onAttachmentPress) onAttachmentPress(att, record);
                  else onPress(record);
                }}
                accessibilityLabel={`Attachment ${att.fileName}`}
                accessibilityRole="button"
              >
                {att.type === 'image' && att.thumbnailUrl ? (
                  <Image source={{ uri: att.thumbnailUrl }} style={styles.attThumb} />
                ) : (
                  <View style={[styles.pdfIconBadge, { backgroundColor: theme.colors.errorBackground }]}>
                    <Typography variant="caption" color={theme.colors.error} style={{ fontWeight: '700' }}>
                      📄
                    </Typography>
                  </View>
                )}
                <Typography variant="caption" color={theme.colors.textSecondary} numberOfLines={1} style={styles.attName}>
                  {att.fileName}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  typeBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  dateCol: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  description: {
    marginTop: 8,
    lineHeight: 18,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
  },
  tag: {
    marginRight: 4,
  },
  attachmentsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  attBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingRight: 8,
    overflow: 'hidden',
    maxWidth: 160,
  },
  attThumb: {
    width: 32,
    height: 32,
    marginRight: 6,
  },
  pdfIconBadge: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  attName: {
    fontSize: 11,
  },
});

export const RecordCard = memo(RecordCardBase);
