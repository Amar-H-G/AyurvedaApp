import React, { memo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card } from '../design-system/Card';
import { Skeleton } from './Skeleton';
import { SkeletonCircle } from './SkeletonCircle';
import { SkeletonText } from './SkeletonText';
import { SlotSkeleton } from './SlotSkeleton';

export const DoctorDetailsSkeleton = memo(() => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Profile Card */}
      <Card style={styles.headerCard} variant="elevated">
        <View style={styles.headerRow}>
          <SkeletonCircle size={80} style={styles.avatar} />
          <View style={styles.headerInfo}>
            <Skeleton width="75%" height={22} style={styles.name} />
            <Skeleton width="50%" height={16} style={styles.specialty} />
            <View style={styles.badgeRow}>
              <Skeleton width={70} height={24} borderRadius={12} />
              <Skeleton width={80} height={24} borderRadius={12} />
            </View>
            <Skeleton width="40%" height={18} style={styles.fee} />
          </View>
        </View>
      </Card>

      {/* Bio Section */}
      <Card style={styles.card} variant="outlined">
        <Skeleton width="30%" height={18} style={styles.sectionHeading} />
        <SkeletonText lines={3} height={14} gap={8} lastLineWidth="70%" />
      </Card>

      {/* Languages & Qualifications */}
      <Card style={styles.card} variant="outlined">
        <Skeleton width="40%" height={18} style={styles.sectionHeading} />
        <View style={styles.badgeRow}>
          <Skeleton width={90} height={28} borderRadius={14} />
          <Skeleton width={110} height={28} borderRadius={14} />
          <Skeleton width={80} height={28} borderRadius={14} />
        </View>
      </Card>

      {/* Slot Selection */}
      <Card style={styles.card} variant="outlined">
        <SlotSkeleton />
      </Card>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerCard: {
    padding: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
    gap: 6,
  },
  name: {
    marginBottom: 2,
  },
  specialty: {
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  fee: {
    marginTop: 4,
  },
  card: {
    padding: 16,
    marginBottom: 16,
  },
  sectionHeading: {
    marginBottom: 12,
  },
});
