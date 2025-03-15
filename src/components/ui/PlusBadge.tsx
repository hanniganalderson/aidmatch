// src/components/ui/PlusBadge.tsx
import React from 'react';
import { Crown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PlusBadgeProps {
  variant?: 'default' | 'glow' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PlusBadge({ 
  variant = 'default', 
  size = 'md',
  className 
}: PlusBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 gap-0.5',
    md: 'text-sm px-2 py-0.5 gap-1',
    lg: 'text-base px-2.5 py-1 gap-1.5',
  };
  
  const variantClasses = {
    default: 'bg-primary-600 text-white',
    glow: 'bg-primary-600 text-white shadow-glow-sm',
    subtle: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };
  
  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-medium',
      sizeClasses[size],
      variantClasses[variant],
      className
    )}>
      <Crown className={iconSizes[size]} />
      <span>Plus</span>
    </span>
  );
}