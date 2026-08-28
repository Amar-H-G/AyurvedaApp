import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '../design-system/Card';
import { Skeleton } from './Skeleton';
import { SkeletonCircle } from './SkeletonCircle';
import { SkeletonText } from './SkeletonText';

export const RecordCardSkeleton = memo(() => {
  return (
    <Card style={styles.recordCard} variant="elevated">
      <View style={styles.recordHeader}>
        <SkeletonCircle size={40} style={styles.badge} />
        <View style={{ flex: 1, gap: 4 }}>
          <Skeleton width="65%" height={18} />
          <Skeleton width="35%" height={12} />
          <Skeleton width="45%" height={12} />
        </View>
        <Skeleton width={50} height={12} />
      </View>

      <View style={styles.desc}>
        <SkeletonText lines={2} height={12} gap={6} lastLineWidth="80%" />
      </View>

      <View style={styles.tags}>
        <Skeleton width={60} height={22} borderRadius={11} />
        <Skeleton width={80} height={22} borderRadius={11} />
        <Skeleton width={55} height={22} borderRadius={11} />
      </View>

      <View style={styles.attachments}>
        <Skeleton width={80} height={60} borderRadius={8} />
        <Skeleton width={80} height={60} borderRadius={8} />
      </View>
    </Card>
  );
});

export const HealthTimelineSkeleton = memo(({ groupCount = 2 }: { groupCount?: number }) => {
  return (
    <View style={styles.container} accessibilityLabel="Loading health records timeline...">
      {Array.from({ length: groupCount }).map((_, groupIndex) => (
        <View key={groupIndex} style={styles.group}>
          <Skeleton width="30%" height={14} style={styles.sectionHeader} />
          <RecordCardSkeleton />
          <RecordCardSkeleton />
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  group: {
    marginBottom: 8,
  },
  sectionHeader: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  recordCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  badge: {
    marginRight: 4,
  },
  desc: {
    marginTop: 10,
    marginLeft: 50,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    marginLeft: 50,
  },
  attachments: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    marginLeft: 50,
  },
});
