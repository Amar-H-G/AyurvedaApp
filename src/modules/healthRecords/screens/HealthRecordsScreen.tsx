/**
 * HealthRecordsScreen — health records search & directory screen.
 * Optimized pagination rendering with zero scroll jumps on page append.
 */
import React, { useCallback, useMemo, useState, memo } from 'react';
import {
  View, FlatList, StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HealthRecord, RecordType, Attachment } from '../../../types';
import { useHealthRecords } from '../hooks/useHealthRecords';
import { RecordCard } from '../components/RecordCard';
import { useTheme } from '../../../hooks/useTheme';
import { SearchBar } from '../../../components/design-system/SearchBar';
import { Typography } from '../../../components/design-system/Typography';
import { Chip } from '../../../components/design-system/Chip';
import { ErrorState, EmptyState } from '../../../components/design-system/StateViews';
import { HealthTimelineSkeleton } from '../../../components/skeletons/HealthTimelineSkeleton';
import { RECORD_TYPE_LABELS, RECORD_TYPES } from '../../../constants';
import { ImagePreviewModal } from '../components/ImagePreviewModal';
import { PdfPreviewModal } from '../components/PdfPreviewModal';
import { useAppStore } from '../../../store/app/appStore';

interface Props {
  navigation: { navigate: (screen: string, params?: object) => void };
}

const keyExtractor = (item: HealthRecord) => item.id;

function HealthRecordsScreenBase({ navigation }: Props): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const isOnline = useAppStore(state => state.isOnline);
  const isSyncing = useAppStore(state => state.isSyncing);

  const {
    records, isLoading, isLoadingMore, error,
    searchQuery, filters, setSearchQuery, setFilters, loadMore, refresh,
  } = useHealthRecords();

  // Modals state
  const [selectedImage, setSelectedImage] = useState<Attachment | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<Attachment | null>(null);
  const [pdfRecordCtx, setPdfRecordCtx] = useState<HealthRecord | null>(null);

  const handleRecordPress = useCallback((record: HealthRecord) => {
    navigation.navigate('RecordDetail', { recordId: record.id });
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

  const renderItem = useCallback(({ item }: { item: HealthRecord }) => (
    <RecordCard
      record={item}
      onPress={handleRecordPress}
      onAttachmentPress={handleAttachmentPress}
    />
  ), [handleRecordPress, handleAttachmentPress]);

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }, [isLoadingMore, theme.colors.primary]);

  const ListHeader = useMemo(() => (
    <View>
      {!isOnline && (
        <View style={[styles.offlineBanner, { backgroundColor: theme.colors.warningBackground }]}>
          <Typography variant="caption" color={theme.colors.warning} align="center">
            ⚡ Offline — showing cached records
          </Typography>
        </View>
      )}
      {isSyncing && (
        <View style={[styles.offlineBanner, { backgroundColor: theme.colors.infoBackground }]}>
          <Typography variant="caption" color={theme.colors.info} align="center">
            🔄 Syncing offline operations...
          </Typography>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchRow}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search records, tags, doctors..."
          style={styles.searchBar}
          testID="health-search-bar"
        />
      </View>

      {/* Type Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {RECORD_TYPES.map(type => (
          <Chip
            key={type}
            label={RECORD_TYPE_LABELS[type]}
            selected={filters.type === type}
            onPress={() => handleTypeFilter(type as RecordType)}
            style={styles.filterChip}
          />
        ))}
      </ScrollView>

      {/* Result Count */}
      <Typography variant="caption" color={theme.colors.textTertiary} style={styles.resultCount}>
        {records.length > 0 ? `Showing ${records.length} records` : ''}
      </Typography>
    </View>
  ), [
    isOnline, isSyncing, searchQuery, filters.type, records.length, theme,
    setSearchQuery, handleTypeFilter,
  ]);

  if (isLoading && records.length === 0) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        {ListHeader}
        <HealthTimelineSkeleton groupCount={3} />
      </View>
    );
  }

  if (error && records.length === 0) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        {ListHeader}
        <ErrorState message={error} onRetry={refresh} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={records}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <EmptyState
            emoji="🏥"
            title="No Health Records Found"
            subtitle="Try adjusting your search or category filters"
            actionLabel="Clear Filters"
            onAction={() => { setSearchQuery(''); setFilters({}); }}
          />
        }
        ListFooterComponent={renderFooter}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        refreshing={isLoading}
        onRefresh={refresh}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={8}
        updateCellsBatchingPeriod={50}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
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

const styles = StyleSheet.create({
  screen: { flex: 1 },
  offlineBanner: { padding: 8, marginBottom: 4 },
  searchRow: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  searchBar: { flex: 1 },
  chipScroll: { paddingHorizontal: 16, marginBottom: 8 },
  filterChip: { marginRight: 8 },
  resultCount: { paddingHorizontal: 16, paddingBottom: 4 },
  footerLoader: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
});

export const HealthRecordsScreen = memo(HealthRecordsScreenBase);
