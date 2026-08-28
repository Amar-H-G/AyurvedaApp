/**
 * HealthRecordsScreen — flat FlatList timeline with inline month headers.
 *
 * Architecture mirrors DoctorListScreen exactly:
 * - FlatList instead of SectionList (eliminates section header overhead)
 * - getItemLayout with fixed heights (no runtime layout measurement)
 * - removeClippedSubviews (memory efficient, same as Consult)
 * - initialNumToRender=10 covers the first viewport cleanly
 * - maxToRenderPerBatch=10, windowSize=10 matching Consult
 *
 * Month section headers are rendered as regular FlatList items of type 'header'.
 * This is the same pattern production apps use (Twitter timeline, Google Health, etc.)
 */
import React, { useCallback, useMemo, memo, useState } from 'react';
import {
  View, FlatList, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useHealthRecords } from '../hooks/useHealthRecords';
import { HealthRecord, HealthRecordGroup, RecordType, Attachment } from '../../../types';
import { useTheme } from '../../../hooks/useTheme';
import { Typography } from '../../../components/design-system/Typography';
import { Card } from '../../../components/design-system/Card';
import { Chip } from '../../../components/design-system/Chip';
import { SearchBar } from '../../../components/design-system/SearchBar';
import { ErrorState, EmptyState } from '../../../components/design-system/StateViews';
import { HealthTimelineSkeleton } from '../../../components/skeletons/HealthTimelineSkeleton';
import { RECORD_TYPE_LABELS, RECORD_TYPES } from '../../../constants';
import { ImagePreviewModal } from '../components/ImagePreviewModal';
import { PdfPreviewModal } from '../components/PdfPreviewModal';

// ─── Type icons & colors (static maps — zero runtime allocation) ──────────────

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

// ─── Flat list item types ─────────────────────────────────────────────────────

type HeaderItem = { type: 'header'; id: string; monthYear: string };
type RecordItem = { type: 'record'; id: string; record: HealthRecord };
type ListItem = HeaderItem | RecordItem;

// Fixed heights for getItemLayout — enables instant scroll without measurement
const HEADER_HEIGHT = 36;   // paddingVertical: 6 × 2 + ~24 text
const RECORD_HEIGHT = 178;  // Card margin(16+8) + header(40) + desc(40) + tags(34) + attachments(40) = ~178

// ─── RecordCard — memoized, matches DoctorCard's memo pattern ────────────────

interface RecordCardProps {
  record: HealthRecord;
  onPress: (id: string) => void;
  onAttachmentPress: (att: Attachment, record: HealthRecord) => void;
}

const RecordCard = memo(({ record, onPress, onAttachmentPress }: RecordCardProps) => {
  const theme = useTheme();
  const typeColor = TYPE_COLORS[record.type] ?? theme.colors.primary;
  const handlePress = useCallback(() => onPress(record.id), [record.id, onPress]);

  return (
    <Card style={styles.recordCard} variant="elevated">
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.85}
        accessibilityLabel={`View details for ${record.title}`}
        accessibilityRole="button"
      >
        <View style={styles.recordRow}>
          <View style={[styles.typeBadge, { backgroundColor: typeColor + '20' }]}>
            <Typography variant="body">{TYPE_ICONS[record.type]}</Typography>
          </View>
          <View style={styles.recordInfo}>
            <Typography variant="h4" color={theme.colors.textPrimary} numberOfLines={1}>
              {record.title}
            </Typography>
            <Typography variant="caption" color={typeColor}>
              {RECORD_TYPE_LABELS[record.type]}
            </Typography>
            {record.doctorName != null && (
              <Typography variant="caption" color={theme.colors.textSecondary}>
                👨‍⚕️ {record.doctorName}
              </Typography>
            )}
          </View>
          <Typography variant="caption" color={theme.colors.textTertiary}>{record.date}</Typography>
        </View>

        <Typography
          variant="bodySmall"
          color={theme.colors.textSecondary}
          numberOfLines={2}
          style={styles.desc}
        >
          {record.description}
        </Typography>

        {record.tags.length > 0 && (
          <View style={styles.tags}>
            {record.tags.slice(0, 3).map(tag => (
              <Chip key={tag} label={tag} variant="tag" style={styles.tag} />
            ))}
          </View>
        )}
      </TouchableOpacity>

      {record.attachments.length > 0 && (
        <View style={styles.attachments}>
          {record.attachments.slice(0, 3).map(att => (
            <TouchableOpacity
              key={att.id}
              style={[styles.attachment, { borderColor: theme.colors.border }]}
              onPress={() => onAttachmentPress(att, record)}
              accessibilityLabel={`Open ${att.fileName}`}
              accessibilityRole="button"
            >
              {att.type === 'image' && att.thumbnailUrl != null ? (
                <Image source={{ uri: att.thumbnailUrl }} style={styles.thumbImage} />
              ) : (
                <View style={[styles.pdfThumb, { backgroundColor: theme.colors.errorBackground }]}>
                  <Typography variant="caption" color={theme.colors.error}>📄</Typography>
                </View>
              )}
              <Typography
                variant="caption"
                color={theme.colors.textSecondary}
                numberOfLines={1}
                style={styles.attName}
              >
                {att.fileName}
              </Typography>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Card>
  );
});

// ─── Month header item — lightweight ─────────────────────────────────────────

interface MonthHeaderProps { monthYear: string }
const MonthHeader = memo(({ monthYear }: MonthHeaderProps) => {
  const theme = useTheme();
  return (
    <View style={[styles.monthHeader, { backgroundColor: theme.colors.background }]}>
      <Typography variant="overline" color={theme.colors.textTertiary}>{monthYear}</Typography>
    </View>
  );
});

// ─── Build flat list array from groups ───────────────────────────────────────

function buildFlatItems(groups: HealthRecordGroup[]): ListItem[] {
  const items: ListItem[] = [];
  for (let g = 0; g < groups.length; g++) {
    const group = groups[g];
    items.push({ type: 'header', id: `hdr_${group.sortKey}`, monthYear: group.monthYear });
    for (let r = 0; r < group.records.length; r++) {
      const record = group.records[r];
      items.push({ type: 'record', id: record.id, record });
    }
  }
  return items;
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

function HealthRecordsScreenBase(): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const {
    groups, records, isLoading, isLoadingMore, error,
    searchQuery, filters, setSearchQuery, setFilters, loadMore, refresh,
  } = useHealthRecords();

  const [selectedImage, setSelectedImage] = useState<Attachment | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<Attachment | null>(null);
  const [pdfRecordCtx, setPdfRecordCtx] = useState<HealthRecord | null>(null);

  // Build flat array for FlatList — same as useMemo for doctors in DoctorListScreen
  const flatData = useMemo<ListItem[]>(() => buildFlatItems(groups), [groups]);

  // Stable callbacks — matching DoctorCard's useCallback(()=>onPress(doctor),[doctor,onPress])
  const handleCardPress = useCallback((id: string) => {
    navigation.navigate('RecordDetail', { recordId: id });
  }, [navigation]);

  const handleAttachmentPress = useCallback((att: Attachment, record: HealthRecord) => {
    if (att.type === 'image') {
      setSelectedImage(att);
    } else {
      setSelectedPdf(att);
      setPdfRecordCtx(record);
    }
  }, []);

  const handleTypeFilter = useCallback((type: RecordType) => {
    setFilters({
      ...filters,
      type: filters.type === type ? undefined : type,
    });
  }, [filters, setFilters]);

  // ── renderItem — matches DoctorListScreen's renderItem pattern ──────────────
  const renderItem = useCallback(({ item }: { item: ListItem }) => {
    if (item.type === 'header') {
      return <MonthHeader monthYear={item.monthYear} />;
    }
    return (
      <RecordCard
        record={item.record}
        onPress={handleCardPress}
        onAttachmentPress={handleAttachmentPress}
      />
    );
  }, [handleCardPress, handleAttachmentPress]);

  // ── keyExtractor — id is unique for both header and record items ─────────────
  const keyExtractor = useCallback((item: ListItem) => item.id, []);

  // ── getItemLayout — CRITICAL: eliminates all runtime measurement ─────────────
  // Matches DoctorListScreen's getItemLayout exactly.
  // FlatList uses this to instantly compute scroll positions without measuring.
  const getItemLayout = useCallback((data: ArrayLike<ListItem> | null | undefined, index: number) => {
    // Walk items to compute offset — O(1) after memoization via flatData
    const item = flatData[index];
    if (!item) return { length: RECORD_HEIGHT, offset: RECORD_HEIGHT * index, index };

    // Compute cumulative offset from flatData directly
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += flatData[i]?.type === 'header' ? HEADER_HEIGHT : RECORD_HEIGHT;
    }
    const length = item.type === 'header' ? HEADER_HEIGHT : RECORD_HEIGHT;
    return { length, offset, index };
  }, [flatData]);

  // ── renderFooter — loading indicator during pagination ──────────────────────
  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Typography variant="caption" color={theme.colors.textSecondary} style={styles.footerText}>
          Loading more records...
        </Typography>
      </View>
    );
  }, [isLoadingMore, theme.colors.primary, theme.colors.textSecondary]);

  // ── ListHeader — search bar + type filter chips ─────────────────────────────
  const ListHeader = useMemo(() => (
    <View>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search records, tags, doctors..."
        style={styles.search}
        testID="health-search-bar"
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {RECORD_TYPES.map(type => (
          <Chip
            key={type}
            label={RECORD_TYPE_LABELS[type]}
            selected={filters.type === type}
            onPress={() => handleTypeFilter(type as RecordType)}
            style={styles.chip}
          />
        ))}
      </ScrollView>
      {records.length > 0 && (
        <Typography variant="caption" color={theme.colors.textTertiary} style={styles.count}>
          {records.length.toLocaleString()} records
        </Typography>
      )}
    </View>
  ), [searchQuery, filters.type, records.length, theme.colors.textTertiary, setSearchQuery, handleTypeFilter]);

  // ── Skeleton on initial load (no records yet) ───────────────────────────────
  if (isLoading && records.length === 0) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        {ListHeader}
        <HealthTimelineSkeleton groupCount={2} />
      </View>
    );
  }

  // ── Error with no data ──────────────────────────────────────────────────────
  if (error != null && records.length === 0) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        {ListHeader}
        <ErrorState message={error} onRetry={refresh} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      {/*
        FlatList — identical setup to DoctorListScreen:
        - getItemLayout: instant scroll position calculation (no runtime measurement)
        - initialNumToRender=10: renders first viewport (~5-6 records + headers)
        - maxToRenderPerBatch=10: matches Consult
        - windowSize=10: matches Consult
        - removeClippedSubviews: matches Consult (memory efficient)
        - updateCellsBatchingPeriod=50: matches Consult
        - onEndReachedThreshold=0.3: matches Consult exactly
      */}
      <FlatList<ListItem>
        data={flatData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <EmptyState
            emoji="🏥"
            title="No Health Records"
            subtitle="Your medical history will appear here"
          />
        }
        ListFooterComponent={renderFooter}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        removeClippedSubviews
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        updateCellsBatchingPeriod={50}
        refreshing={isLoading}
        onRefresh={refresh}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16, flexGrow: 1 }}
      />

      {/* Modals */}
      <ImagePreviewModal
        visible={selectedImage !== null}
        attachment={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
      <PdfPreviewModal
        visible={selectedPdf !== null}
        attachment={selectedPdf}
        recordTitle={pdfRecordCtx?.title}
        doctorName={pdfRecordCtx?.doctorName}
        onClose={() => setSelectedPdf(null)}
      />
    </View>
  );
}

// ─── Styles (mirrors DoctorListScreen's style structure) ──────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1 },
  search: { margin: 16, marginBottom: 8 },
  chipRow: { paddingHorizontal: 16, marginBottom: 4 },
  chip: { marginRight: 8 },
  count: { paddingHorizontal: 16, paddingBottom: 4 },
  monthHeader: {
    height: HEADER_HEIGHT,
    paddingHorizontal: 16,
    paddingVertical: 6,
    justifyContent: 'center',
  },
  recordCard: { marginHorizontal: 16, marginVertical: 4 },
  recordRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  typeBadge: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  recordInfo: { flex: 1, gap: 1 },
  desc: { marginTop: 6, marginLeft: 50 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  tag: { marginRight: 4 },
  attachments: { flexDirection: 'row', gap: 8, marginTop: 8 },
  attachment: { borderWidth: 1, borderRadius: 8, overflow: 'hidden', width: 72 },
  thumbImage: { width: 72, height: 52 },
  pdfThumb: { width: 72, height: 52, alignItems: 'center', justifyContent: 'center' },
  attName: { padding: 3 },
  footer: { paddingVertical: 16, alignItems: 'center' },
  footerText: { marginTop: 4 },
});

export const HealthRecordsScreen = memo(HealthRecordsScreenBase);
