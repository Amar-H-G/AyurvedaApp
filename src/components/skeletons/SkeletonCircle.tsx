import React, { memo } from 'react';
import { Skeleton, SkeletonProps } from './Skeleton';

export interface SkeletonCircleProps extends Omit<SkeletonProps, 'variant'> {
  size: number;
}

export const SkeletonCircle = memo(({ size, style }: SkeletonCircleProps) => (
  <Skeleton width={size} height={size} variant="circular" style={style} />
));
