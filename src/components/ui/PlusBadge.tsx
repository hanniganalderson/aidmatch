// src/components/ui/PlusBadge.tsx
import React from 'react';
import { Crown, Sparkles } from 'lucide-react';
import { motion, MotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

interface PlusBadgeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, keyof MotionProps> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'glow'; 
}

export function PlusBadge({ 
  size = 'md', 
  variant = 'default',
  className,
  ...props
}: PlusBadgeProps) {
  // Size classes for the badge
  const sizeClasses = {
    sm: 'text-xs py-0.5 px-1.5',
    md: 'text-xs py-1 px-2',
    lg: 'text-sm py-1 px-2.5'
  };
  
  // Icon size based on badge size
  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  };
  
  // Logic for different variants
  if (variant === 'minimal') {
    // Just the crown icon with no background
    return (
      <Crown 
        className={cn(
          "text-amber-500 dark:text-amber-400",
          iconSize[size],
          className
        )} 
      />
    );
  }
  
  if (variant === 'glow') {
    // Animated glowing badge
    return (
      <motion.div
        initial={{ 
          opacity: 0.9, 
          boxShadow: '0 0 0 rgba(124, 58, 237, 0)' 
        }}
        animate={{ 
          opacity: 1, 
          boxShadow: [
            '0 0 0px rgba(124, 58, 237, 0.3)', 
            '0 0 8px rgba(124, 58, 237, 0.5)', 
            '0 0 0px rgba(124, 58, 237, 0.3)'
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className={cn(
          "rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium",
          "flex items-center gap-1 whitespace-nowrap",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <Sparkles className={iconSize[size]} />
        <span>Plus</span>
      </motion.div>
    );
  }
  
  // Default badge
  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium",
        "flex items-center gap-1 whitespace-nowrap",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <Crown className={iconSize[size]} />
      <span>Plus</span>
    </div>
  );
}