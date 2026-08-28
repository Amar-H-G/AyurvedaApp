import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '../design-system/Card';
import { Skeleton } from './Skeleton';

export const ProductCardSkeleton = memo(() => {
  return (
    <View style={styles.wrapper}>
      <Card style={styles.card} variant="elevated" padding="none">
        {/* Product image placeholder */}
        <Skeleton width="100%" height={150} borderRadius={0} style={styles.image} />
        {/* Product info lines */}
        <View style={styles.info}>
          <Skeleton width="85%" height={16} style={styles.line} />
          <Skeleton width="45%" height={12} style={styles.line} />
          <Skeleton width="60%" height={16} style={styles.line} />
          <Skeleton width="35%" height={12} style={styles.line} />
        </View>
        {/* Add button placeholder */}
        <Skeleton width="100%" height={32} borderRadius={0} style={styles.addBtn} />
      </Card>
    </View>
  );
});

export const ProductGridSkeleton = memo(({ count = 6 }: { count?: number }) => {
  return (
    <View style={styles.grid} accessibilityLabel="Loading products...">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    width: '48%',
    marginBottom: 12,
  },
  card: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  info: {
    padding: 10,
    gap: 6,
  },
  line: {
    marginBottom: 2,
  },
  addBtn: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
