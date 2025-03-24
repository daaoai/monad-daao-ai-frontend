import { Skeleton } from '@/shadcn/components/ui/skeleton';
import React from 'react';

export interface AnimatedSkeletonProps extends React.ComponentPropsWithoutRef<typeof Skeleton> {
  variant?: 'shimmer' | 'pulse';
}

const AnimatedSkeleton: React.FC<AnimatedSkeletonProps> = ({ variant = 'shimmer', className, ...props }) => {
  return (
    <div className="relative overflow-hidden">
      <Skeleton className={className} {...props} />
      {variant === 'shimmer' ? (
        <div className="absolute inset-0 animate-[shimmer_2s_infinite]">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        </div>
      ) : (
        <div className="absolute inset-0 animate-pulse" />
      )}
    </div>
  );
};

export default AnimatedSkeleton;
