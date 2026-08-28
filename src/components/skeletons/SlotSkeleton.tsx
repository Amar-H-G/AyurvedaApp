import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from './Skeleton';

export const SlotSkeleton = memo(() => {
  return (
    <View style={styles.container} accessibilityLabel="Loading available slots...">
      {/* Date selector pills */}
      <Skeleton width="40%" height={16} style={styles.sectionTitle} />
      <View style={styles.datesRow}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} width={64} height={58} borderRadius={12} style={styles.dateCard} />
        ))}
      </View>

      {/* Time slots grid */}
      <Skeleton width="50%" height={16} style={styles.sectionTitle} />
      <View style={styles.slotsGrid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} width="47%" height={42} borderRadius={8} style={styles.slotBtn} />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  sectionTitle: {
    marginBottom: 12,
    marginTop: 8,
  },
  datesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  dateCard: {
    marginRight: 4,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  slotBtn: {
    marginBottom: 4,
  },
});
