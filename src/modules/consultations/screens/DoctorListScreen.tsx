/**
 * DoctorListScreen — main consultation listing with search, filters, virtualized FlatList.
 */
import React, { useCallback, useMemo, useState, memo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDoctors } from '../hooks/useDoctors';
import { DoctorCard } from '../components/DoctorCard';
import { Doctor, ConsultationFilters, DoctorSpecialty } from '../../../types';
import { useTheme } from '../../../hooks/useTheme';
import { SearchBar } from '../../../components/design-system/SearchBar';
import { Typography } from '../../../components/design-system/Typography';
import { Chip } from '../../../components/design-system/Chip';
import { ErrorState, EmptyState } from '../../../components/design-system/StateViews';
import { DoctorListSkeleton } from '../../../components/skeletons/DoctorCardSkeleton';
import { SPECIALTIES } from '../../../constants';
import { useAppStore } from '../../../store/app/appStore';

interface Props {
  navigation: { navigate: (screen: string, params?: object) => void };
}

const ITEM_HEIGHT = 148; // Approximate height for getItemLayout optimisation

const keyExtractor = (item: Doctor) => item.id;

const getItemLayout = (_: ArrayLike<Doctor> | null | undefined, index: number) => ({
  length: ITEM_HEIGHT,
  offset: ITEM_HEIGHT * index,
  index,
});

function DoctorListScreenBase({ navigation }: Props): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const isOnline = useAppStore(state => state.isOnline);
  const isSyncing = useAppStore(state => state.isSyncing);

  const {
    doctors, isLoading, isLoadingMore, error,
    searchQuery, filters, setSearchQuery, setFilters, loadMore, refresh,
  } = useDoctors();

  const [showFilters, setShowFilters] = useState(false);

  const handleDoctorPress = useCallback((doctor: Doctor) => {
    navigation.navigate('DoctorDetail', { doctorId: doctor.id });
  }, [navigation]);

  const handleSpecialtyFilter = useCallback((specialty: DoctorSpecialty) => {
    setFilters(
      filters.specialty === specialty
        ? { ...filters, specialty: undefined }
        : { ...filters, specialty }
    );
  }, [filters, setFilters]);

  const handleAvailableToday = useCallback(() => {
    setFilters({ ...filters, availableToday: !filters.availableToday });
  }, [filters, setFilters]);

  const renderItem = useCallback(({ item }: { item: Doctor }) => (
    <DoctorCard doctor={item} onPress={handleDoctorPress} />
  ), [handleDoctorPress]);

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return <DoctorListSkeleton count={2} />;
  }, [isLoadingMore]);

  const ListHeader = useMemo(() => (
    <View>
      {!isOnline && (
        <View style={[styles.offlineBanner, { backgroundColor: theme.colors.warningBackground }]}>
          <Typography variant="caption" color={theme.colors.warning} align="center">
            ⚡ Offline — showing cached results
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
      <View style={styles.searchRow}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search doctors, specialty..."
          style={styles.searchBar}
          testID="doctor-search-bar"
        />
        <TouchableOpacity
          style={[styles.filterBtn, { backgroundColor: theme.colors.surfaceVariant }]}
          onPress={() => setShowFilters(v => !v)}
          accessibilityLabel="Toggle filters"
          accessibilityRole="button"
        >
          <Typography variant="body">⚙️</Typography>
        </TouchableOpacity>
      </View>
      {showFilters && (
        <View style={styles.filterPanel}>
          <Typography variant="label" color={theme.colors.textSecondary} style={styles.filterLabel}>
            Specialty
          </Typography>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {SPECIALTIES.map(spec => (
              <Chip
                key={spec}
                label={spec}
                selected={filters.specialty === spec}
                onPress={() => handleSpecialtyFilter(spec as DoctorSpecialty)}
                style={styles.filterChip}
              />
            ))}
          </ScrollView>
          <View style={styles.filterRow}>
            <Chip
              label="Available Today"
              selected={!!filters.availableToday}
              onPress={handleAvailableToday}
            />
          </View>
        </View>
      )}
      <Typography variant="caption" color={theme.colors.textTertiary} style={styles.resultCount}>
        {doctors.length > 0 ? `Showing ${doctors.length} doctors` : ''}
      </Typography>
    </View>
  ), [
    isOnline, isSyncing, searchQuery, showFilters, filters,
    doctors.length, theme, setSearchQuery, handleSpecialtyFilter, handleAvailableToday,
  ]);

  if (isLoading && doctors.length === 0) {
    return (
      <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
        {ListHeader}
        <DoctorListSkeleton count={4} />
      </View>
    );
  }

  if (error && doctors.length === 0) {
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
        data={doctors}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <EmptyState
            emoji="👨‍⚕️"
            title="No Doctors Found"
            subtitle="Try adjusting your search or filters"
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  offlineBanner: { padding: 8, marginBottom: 4 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    gap: 8,
  },
  searchBar: { flex: 1 },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPanel: { paddingHorizontal: 16, paddingBottom: 8 },
  filterLabel: { marginBottom: 6 },
  chipScroll: { marginBottom: 8 },
  filterChip: { marginRight: 8 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  resultCount: { paddingHorizontal: 16, paddingBottom: 4 },
});

export const DoctorListScreen = memo(DoctorListScreenBase);
