import React from 'react';
import { Link } from 'react-router-dom';
import { Key } from 'lucide-react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export function Logo({ className, size = 'md', showSubtitle = true }: LogoProps) {
  const sizeClasses = {
    sm: {
      container: 'w-8 h-8',
      icon: 'w-4 h-4',
      text: 'text-base',
      subtitle: 'text-[8px]',
    },
    md: {
      container: 'w-10 h-10 sm:w-12 sm:h-12',
      icon: 'w-5 h-5 sm:w-6 sm:h-6',
      text: 'text-lg sm:text-xl',
      subtitle: 'text-[9px] sm:text-[10px]',
    },
    lg: {
      container: 'w-14 h-14 sm:w-16 sm:h-16',
      icon: 'w-7 h-7 sm:w-8 sm:h-8',
      text: 'text-2xl sm:text-3xl',
      subtitle: 'text-[10px] sm:text-xs',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <Link to="/" className={cn('flex items-center gap-3 group', className)}>
      {/* Hexagonal Icon */}
      <div className={cn('relative', sizes.container)}>
        <div
          className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-orange-primary)] to-[var(--color-brand-orange-secondary)] flex items-center justify-center group-hover:scale-110 transition-transform bg-glow-orange"
          style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)' }}
        >
          <Key className={cn('text-white', sizes.icon)} />
        </div>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <span className={cn('font-display font-black tracking-tighter leading-none text-white', sizes.text)}>
          KEYPRO
        </span>
        {showSubtitle && (
          <span className={cn('uppercase tracking-[0.25em] text-[var(--color-brand-orange-primary)] leading-none mt-1 font-bold', sizes.subtitle)}>
            Service Center
          </span>
        )}
      </div>
    </Link>
  );
}
