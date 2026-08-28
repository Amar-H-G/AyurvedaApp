import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '../design-system/Card';
import { Skeleton } from './Skeleton';

export const UpcomingConsultationCardSkeleton = memo(() => {
  return (
    <Card style={styles.card} variant="elevated">
      <View style={styles.cardHeader}>
        <View style={{ flex: 1, gap: 6 }}>
          <Skeleton width="65%" height={18} />
          <Skeleton width="45%" height={14} />
          <Skeleton width="35%" height={14} />
          <Skeleton width="25%" height={16} style={{ marginTop: 4 }} />
        </View>
        <Skeleton width={80} height={26} borderRadius={13} />
      </View>
      <Skeleton width={110} height={32} borderRadius={6} style={styles.cancelBtn} />
    </Card>
  );
});

export const UpcomingConsultationSkeleton = memo(({ count = 3 }: { count?: number }) => {
  return (
    <View style={styles.container} accessibilityLabel="Loading upcoming consultations...">
      {Array.from({ length: count }).map((_, i) => (
        <UpcomingConsultationCardSkeleton key={i} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    marginTop: 14,
  },
});
