// src/components/ui/PlusBadge.tsx
import React from 'react';
import { Crown } from 'lucide-react';
import { useSubscription } from '../../contexts/SubscriptionContext';

interface PlusBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const PlusBadge: React.FC<PlusBadgeProps> = ({ 
  size = 'md', 
  showLabel = true,
  className = ''
}) => {
  const { isSubscribed } = useSubscription();
  
  if (!isSubscribed) return null;
  
  const sizeClasses = {
    'sm': 'text-xs px-1.5 py-0.5',
    'md': 'text-sm px-2 py-1',
    'lg': 'text-base px-3 py-1.5'
  };
  
  const iconSizes = {
    'sm': 'w-3 h-3',
    'md': 'w-4 h-4',
    'lg': 'w-5 h-5'
  };
  
  return (
    <span className={`inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-400 text-white rounded-full font-medium shadow-sm ${sizeClasses[size]} ${className}`}>
      <Crown className={iconSizes[size]} />
      {showLabel && <span>Plus</span>}
    </span>
  );
};

export default PlusBadge;