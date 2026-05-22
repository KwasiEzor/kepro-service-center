import React from 'react';
import { cn } from '../lib/utils';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({ rows = 5, columns = 4, className }: TableSkeletonProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-4 p-4 bg-bg-secondary/50 rounded-lg animate-pulse"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="h-6 bg-bg-tertiary rounded"
              style={{
                width: colIndex === 0 ? '40%' : colIndex === columns - 1 ? '30%' : '70%'
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card-dark p-6 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-bg-tertiary rounded-lg" />
            <div className="h-8 w-16 bg-bg-tertiary rounded" />
          </div>
          <div className="h-4 w-24 bg-bg-tertiary rounded" />
        </div>
      ))}
    </div>
  );
}
