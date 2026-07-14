'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// ─── Stats Grid ───────────────────────────────────────────────────────────────

interface StatsSkeletonProps {
  count?: number;
  className?: string;
}

export function StatsGridSkeleton({ count = 4, className }: StatsSkeletonProps) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3 w-36" />
        </div>
      ))}
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
  className?: string;
}

export function TableSkeleton({ columns = 5, rows = 8, className }: TableSkeletonProps) {
  return (
    <div className={cn('w-full space-y-2', className)}>
      {/* Header */}
      <div className="flex gap-4 px-4 py-3 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4 px-4 py-3 border-b last:border-0">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton
              key={colIdx}
              className={cn('h-4 flex-1', colIdx === 0 && 'w-8 flex-none')}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Page Header ──────────────────────────────────────────────────────────────

export function PageHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>
      <Skeleton className="h-10 w-32 rounded-md" />
    </div>
  );
}

// ─── Card List ────────────────────────────────────────────────────────────────

interface CardListSkeletonProps {
  count?: number;
  className?: string;
}

export function CardListSkeleton({ count = 6, className }: CardListSkeletonProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
