import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface QuickAccessCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionText: string;
  onClick: () => void;
  variant?: 'default' | 'blue';
}

export const QuickAccessCard: React.FC<QuickAccessCardProps> = ({
  title,
  description,
  icon: Icon,
  actionText,
  onClick,
  variant = 'default'
}) => {
  return (
    <div 
      onClick={onClick}
      className="card-dark p-6 hover:bg-bg-secondary transition-colors cursor-pointer group"
    >
      <Icon className={cn(
        "w-10 h-10 mb-4",
        variant === 'default' ? "text-brand-red" : "text-blue-500"
      )} />
      <h3 className={cn(
        "text-xl font-semibold mb-2 transition-colors",
        variant === 'default' ? "group-hover:text-brand-red" : "group-hover:text-blue-500"
      )}>
        {title}
      </h3>
      <p className="text-text-secondary text-sm mb-4">
        {description}
      </p>
      <span className={cn(
        "text-sm font-bold",
        variant === 'default' ? "text-brand-red" : "text-blue-500"
      )}>
        {actionText} →
      </span>
    </div>
  );
};
