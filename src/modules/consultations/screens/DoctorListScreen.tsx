/**
 * DoctorListScreen — doctor search & directory screen.
 * Displays persistent Upcoming Consultations Banner & Quick Access link.
 */
import React, { useCallback, useMemo, useState, memo } from 'react';
import {
  View, FlatList, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Doctor, DoctorSpecialty } from '../../../types';
import { useDoctors } from '../hooks/useDoctors';
import { DoctorCard } from '../components/DoctorCard';
import { useTheme } from '../../../hooks/useTheme';
import { SearchBar } from '../../../components/design-system/SearchBar';
import { Typography } from '../../../components/design-system/Typography';
import { Chip } from '../../../components/design-system/Chip';
import { ErrorState, EmptyState } from '../../../components/design-system/StateViews';
import { DoctorListSkeleton } from '../../../components/skeletons/DoctorCardSkeleton';
import { SPECIALTIES } from '../../../constants';
import { useConsultationStore } from '../../../store/consultations/consultationStore';
import { useAppStore } from '../../../store/app/appStore';
import { format, parseISO } from 'date-fns';

interface Props {
  navigation: { navigate: (screen: string, params?: object) => void };
}

const keyExtractor = (item: Doctor) => item.id;
const getItemLayout = (_: any, index: number) => ({
  length: 120,
  offset: 120 * index,
  index,
});

function formatDateShort(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy');
  } catch (e) {
    return dateStr;
  }
}

function DoctorListScreenBase({ navigation }: Props): React.JSX.Element {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [showFilters, setShowFilters] = useState(false);

  const isOnline = useAppStore(state => state.isOnline);
  const isSyncing = useAppStore(state => state.isSyncing);

  const {
    doctors, isLoading, isLoadingMore, error,
    searchQuery, filters, setSearchQuery, setFilters, loadMore, refresh,
  } = useDoctors();

  const upcomingBookings = useConsultationStore(state => state.getUpcomingBookings());
  const nextBooking = upcomingBookings[0] ?? null;

  const handleDoctorPress = useCallback((doctor: Doctor) => {
    navigation.navigate('DoctorDetail', { doctorId: doctor.id });
  }, [navigation]);

  const handleSpecialtyFilter = useCallback((spec: DoctorSpecialty) => {
    setFilters({
      ...filters,
      specialty: filters.specialty === spec ? undefined : spec,
    });
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

      {/* Prominent Upcoming Consultations Quick Access Banner */}
      {nextBooking && (
        <TouchableOpacity
          style={[styles.upcomingBanner, { backgroundColor: theme.colors.primary + '12', borderColor: theme.colors.primary + '35' }]}
          onPress={() => navigation.navigate('UpcomingConsultations')}
          activeOpacity={0.8}
          accessibilityLabel={`Upcoming consultation with ${nextBooking.doctorName}`}
          accessibilityRole="button"
          testID="doctor-list-upcoming-banner"
        >
          <View style={styles.upcomingBannerHeader}>
            <View style={styles.upcomingTitleGroup}>
              <Typography variant="label" color={theme.colors.primary} style={styles.upcomingBadgeText}>
                📅 UPCOMING CONSULTATION
              </Typography>
              {upcomingBookings.length > 1 && (
                <View style={[styles.countBadge, { backgroundColor: theme.colors.primary }]}>
                  <Typography variant="caption" color="#FFF" style={styles.countBadgeText}>
                    +{upcomingBookings.length - 1}
                  </Typography>
                </View>
              )}
            </View>
            <Typography variant="label" color={theme.colors.primary}>
              View All ({upcomingBookings.length}) →
            </Typography>
          </View>

          <View style={styles.upcomingCardDetails}>
            <Typography variant="h4" color={theme.colors.textPrimary} numberOfLines={1}>
              {nextBooking.doctorName}
            </Typography>
            <Typography variant="bodySmall" color={theme.colors.textSecondary}>
              {formatDateShort(nextBooking.date)} • {nextBooking.startTime} – {nextBooking.endTime}
            </Typography>
          </View>
        </TouchableOpacity>
      )}

      {/* Search & Action Bar */}
      <View style={styles.searchRow}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search doctors, specialty..."
          style={styles.searchBar}
          testID="doctor-search-bar"
        />

        {/* Dedicated Bookings Button */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.colors.surfaceVariant }]}
          onPress={() => navigation.navigate('UpcomingConsultations')}
          accessibilityLabel={`My Bookings, ${upcomingBookings.length} upcoming`}
          accessibilityRole="button"
        >
          <Typography variant="body">📅</Typography>
          {upcomingBookings.length > 0 && (
            <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
              <Typography variant="caption" color="#FFF" style={styles.badgeText}>
                {upcomingBookings.length}
              </Typography>
            </View>
          )}
        </TouchableOpacity>

        {/* Filter Toggle Button */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.colors.surfaceVariant }]}
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
    isOnline, isSyncing, searchQuery, showFilters, filters, nextBooking,
    upcomingBookings.length, doctors.length, theme, setSearchQuery,
    handleSpecialtyFilter, handleAvailableToday, navigation,
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
  upcomingBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  upcomingBannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  upcomingTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  upcomingBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  countBadge: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  countBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  upcomingCardDetails: {
    gap: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    gap: 8,
  },
  searchBar: { flex: 1 },
  actionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { fontSize: 9, fontWeight: '800' },
  filterPanel: { paddingHorizontal: 16, paddingBottom: 8 },
  filterLabel: { marginBottom: 6 },
  chipScroll: { marginBottom: 8 },
  filterChip: { marginRight: 8 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  resultCount: { paddingHorizontal: 16, paddingBottom: 4 },
});

export const DoctorListScreen = memo(DoctorListScreenBase);
