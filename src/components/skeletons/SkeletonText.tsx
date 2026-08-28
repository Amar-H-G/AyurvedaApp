import React, { memo } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Skeleton } from './Skeleton';

export interface SkeletonTextProps {
  lines?: number;
  height?: number;
  gap?: number;
  lastLineWidth?: number | string;
  style?: StyleProp<ViewStyle>;
}

export const SkeletonText = memo(({
  lines = 2,
  height = 14,
  gap = 8,
  lastLineWidth = '60%',
  style,
}: SkeletonTextProps) => {
  const lineArray = Array.from({ length: lines });

  return (
    <View style={[styles.container, style]}>
      {lineArray.map((_, index) => {
        const isLast = index === lines - 1;
        const lineW = isLast && lines > 1 ? lastLineWidth : '100%';
        return (
          <Skeleton
            key={index}
            width={lineW}
            height={height}
            style={{ marginBottom: isLast ? 0 : gap }}
          />
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
