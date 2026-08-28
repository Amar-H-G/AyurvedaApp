import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '../design-system/Card';
import { Skeleton } from './Skeleton';

export const CartItemSkeleton = memo(() => {
  return (
    <Card style={styles.itemCard} variant="elevated">
      <View style={styles.itemRow}>
        <Skeleton width={72} height={72} borderRadius={8} style={styles.thumbnail} />
        <View style={styles.itemInfo}>
          <Skeleton width="80%" height={16} />
          <Skeleton width="45%" height={12} />
          <Skeleton width="30%" height={18} style={{ marginTop: 4 }} />
        </View>
        <Skeleton width={80} height={30} borderRadius={15} />
      </View>
    </Card>
  );
});

export const CartSkeleton = memo(({ itemCount = 2 }: { itemCount?: number }) => {
  return (
    <View style={styles.container} accessibilityLabel="Loading cart...">
      {Array.from({ length: itemCount }).map((_, i) => (
        <CartItemSkeleton key={i} />
      ))}
      <Card style={styles.summary} variant="outlined">
        <Skeleton width="40%" height={18} style={{ marginBottom: 12 }} />
        <View style={styles.summaryRow}>
          <Skeleton width="35%" height={14} />
          <Skeleton width="20%" height={14} />
        </View>
        <View style={styles.summaryRow}>
          <Skeleton width="30%" height={14} />
          <Skeleton width="15%" height={14} />
        </View>
        <Skeleton width="100%" height={44} borderRadius={8} style={{ marginTop: 12 }} />
      </Card>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  itemCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
    gap: 6,
  },
  summary: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
});
