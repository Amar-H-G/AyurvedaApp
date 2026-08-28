import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '../design-system/Card';
import { Skeleton } from './Skeleton';
import { SkeletonCircle } from './SkeletonCircle';
import { SkeletonText } from './SkeletonText';

export const DoctorCardSkeleton = memo(() => {
  return (
    <Card style={styles.card} variant="elevated">
      <View style={styles.row}>
        <SkeletonCircle size={64} style={styles.avatar} />
        <View style={styles.info}>
          <Skeleton width="65%" height={18} style={styles.name} />
          <Skeleton width="45%" height={14} style={styles.specialty} />
          <Skeleton width="35%" height={12} style={styles.rating} />
          <Skeleton width="55%" height={14} style={styles.fee} />
        </View>
      </View>
      <View style={styles.footer}>
        <Skeleton width={110} height={34} borderRadius={8} />
      </View>
    </Card>
  );
});

export const DoctorListSkeleton = memo(({ count = 4 }: { count?: number }) => {
  return (
    <View style={styles.list} accessibilityLabel="Loading doctor list...">
      {Array.from({ length: count }).map((_, index) => (
        <DoctorCardSkeleton key={index} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
  },
  list: {
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 16,
  },
  info: {
    flex: 1,
    gap: 6,
  },
  name: {
    marginBottom: 2,
  },
  specialty: {
    marginBottom: 2,
  },
  rating: {
    marginBottom: 2,
  },
  fee: {
    marginTop: 2,
  },
  footer: {
    marginTop: 14,
    alignItems: 'flex-end',
  },
});
