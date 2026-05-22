import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6', className)}>
      <div className="w-20 h-20 bg-bg-secondary rounded-full flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-text-tertiary" />
      </div>

      <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>

      {description && (
        <p className="text-text-tertiary text-center max-w-md mb-6">
          {description}
        </p>
      )}

      {action && <div>{action}</div>}
    </div>
  );
}
