/**
 * HealthRecordsScreen — grouped timeline with filters, search, tags, attachment preview.
 */
import React, { useCallback, useMemo, memo } from 'react';
import {
  View, SectionList, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHealthRecords } from '../hooks/useHealthRecords';
import { HealthRecord, HealthRecordGroup, RecordType } from '../../../types';
import { useTheme } from '../../../hooks/useTheme';
import { Typography } from '../../../components/design-system/Typography';
import { Card } from '../../../components/design-system/Card';
import { Chip } from '../../../components/design-system/Chip';
import { SearchBar } from '../../../components/design-system/SearchBar';
import { LoadingState, ErrorState, EmptyState } from '../../../components/design-system/StateViews';
import { RECORD_TYPE_LABELS, RECORD_TYPES } from '../../../constants';
import { Image } from 'react-native';

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

interface RecordCardProps { record: HealthRecord }

const RecordCard = memo(({ record }: RecordCardProps) => {
  const theme = useTheme();
  const typeColor = TYPE_COLORS[record.type] ?? theme.colors.primary;

  const handleAttachment = useCallback((url: string, type: 'image' | 'pdf') => {
    if (type === 'pdf') {
      Linking.openURL(url).catch(() =>
        Alert.alert('Could not open PDF', 'No PDF viewer available.')
      );
    } else {
      Alert.alert('Image Preview', url.slice(0, 80) + '...');
    }
  }, []);

  return (
    <Card style={styles.recordCard} variant="elevated">
      <View style={styles.recordHeader}>
        <View style={[styles.typeBadge, { backgroundColor: typeColor + '20' }]}>
          <Typography variant="body">{TYPE_ICONS[record.type]}</Typography>
        </View>
        <View style={{ flex: 1 }}>
          <Typography variant="h4" color={theme.colors.textPrimary} numberOfLines={1}>
            {record.title}
          </Typography>
          <Typography variant="caption" color={typeColor}>
            {RECORD_TYPE_LABELS[record.type]}
          </Typography>
          {record.doctorName && (
            <Typography variant="caption" color={theme.colors.textSecondary}>
              👨‍⚕️ {record.doctorName}
            </Typography>
          )}
        </View>
        <Typography variant="caption" color={theme.colors.textTertiary}>{record.date}</Typography>
      </View>

      <Typography variant="bodySmall" color={theme.colors.textSecondary} numberOfLines={2} style={styles.desc}>
        {record.description}
      </Typography>

      {/* Tags */}
      {record.tags.length > 0 && (
        <View style={styles.tags}>
          {record.tags.map(tag => (
            <Chip key={tag} label={tag} variant="tag" style={styles.tag} />
          ))}
        </View>
      )}

      {/* Attachments */}
      {record.attachments.length > 0 && (
        <View style={styles.attachments}>
          {record.attachments.map(att => (
            <TouchableOpacity
              key={att.id}
              style={[styles.attachment, { borderColor: theme.colors.border }]}
              onPress={() => handleAttachment(att.url, att.type)}
              accessibilityLabel={`Open attachment ${att.fileName}`}
              accessibilityRole="button"
            >
              {att.type === 'image' && att.thumbnailUrl ? (
                <Image source={{ uri: att.thumbnailUrl }} style={styles.thumbImage} />
              ) : (
                <View style={[styles.pdfThumb, { backgroundColor: theme.colors.errorBackground }]}>
                  <Typography variant="caption" color={theme.colors.error}>📄 PDF</Typography>
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
  );
});

function HealthRecordsScreenBase(): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const {
    groups, isLoading, error,
    searchQuery, filters, setSearchQuery, setFilters, refresh,
  } = useHealthRecords();

  // Prepare SectionList sections
  const sections = useMemo(
    () => groups.map(g => ({ title: g.monthYear, data: g.records })),
    [groups]
  );

  const handleTypeFilter = useCallback((type: RecordType) => {
    setFilters({
      ...filters,
      type: filters.type === type ? undefined : type,
    });
  }, [filters, setFilters]);

  const renderItem = useCallback(({ item }: { item: HealthRecord }) => (
    <RecordCard record={item} />
  ), []);

  const renderSectionHeader = useCallback(({ section: { title } }: { section: { title: string } }) => (
    <View style={[styles.sectionHeader, { backgroundColor: theme.colors.background }]}>
      <Typography variant="overline" color={theme.colors.textTertiary}>{title}</Typography>
    </View>
  ), [theme]);

  const keyExtractor = useCallback((item: HealthRecord) => item.id, []);

  const ListHeader = useMemo(() => (
    <View>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search records, tags, doctors..."
        style={styles.search}
        testID="health-search-bar"
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeFilters}>
        {RECORD_TYPES.map(type => (
          <Chip
            key={type}
            label={RECORD_TYPE_LABELS[type]}
            selected={filters.type === type}
            onPress={() => handleTypeFilter(type as RecordType)}
            statusColor={TYPE_COLORS[type as RecordType]}
            style={styles.typeChip}
          />
        ))}
      </ScrollView>
    </View>
  ), [searchQuery, filters.type, setSearchQuery, handleTypeFilter]);

  if (isLoading) return <LoadingState message="Loading health records..." />;
  if (error && groups.length === 0) return <ErrorState message={error} onRetry={refresh} />;

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <SectionList
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <EmptyState
            emoji="🏥"
            title="No Health Records"
            subtitle="Your medical history will appear here"
          />
        }
        stickySectionHeadersEnabled
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={8}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16, flexGrow: 1 }}
        onRefresh={refresh}
        refreshing={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  search: { margin: 16, marginBottom: 8 },
  typeFilters: { paddingHorizontal: 16, marginBottom: 8 },
  typeChip: { marginRight: 8 },
  sectionHeader: { paddingHorizontal: 16, paddingVertical: 6 },
  recordCard: { margin: 16, marginTop: 0, marginBottom: 8 },
  recordHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  typeBadge: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  desc: { marginTop: 8, marginLeft: 50 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 8 },
  tag: { marginRight: 4 },
  attachments: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  attachment: { borderWidth: 1, borderRadius: 8, overflow: 'hidden', width: 80 },
  thumbImage: { width: 80, height: 60 },
  pdfThumb: { width: 80, height: 60, alignItems: 'center', justifyContent: 'center' },
  attName: { padding: 4 },
});

export const HealthRecordsScreen = memo(HealthRecordsScreenBase);
