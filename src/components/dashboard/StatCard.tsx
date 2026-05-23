import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  onClick?: () => void;
  variant?: 'default' | 'success' | 'blue';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  icon: Icon, 
  onClick, 
  variant = 'default',
  className
}) => {
  const CardWrapper = onClick ? 'button' : 'div';

  return (
    <CardWrapper
      onClick={onClick}
      className={cn(
        "card-dark p-6 text-left transition-all group",
        onClick && "hover:border-brand-red/50",
        variant === 'success' && "border-l-4 border-l-green-500",
        variant === 'blue' && "border-l-4 border-l-blue-500",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className={cn(
          "w-8 h-8 transition-transform group-hover:scale-110",
          variant === 'default' && "text-brand-red",
          variant === 'success' && "text-green-500",
          variant === 'blue' && "text-blue-500"
        )} />
        <span className="text-3xl font-bold">{value}</span>
      </div>
      <h3 className="text-text-secondary text-sm font-bold uppercase tracking-widest">{label}</h3>
    </CardWrapper>
  );
};
