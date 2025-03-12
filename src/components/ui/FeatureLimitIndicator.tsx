// src/components/ui/FeatureLimitIndicator.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFeatureUsage, FeatureName } from '../../lib/feature-usage';
import { Button } from './button';
import { FEATURE_LIMITS } from '../../lib/feature-management';

interface FeatureLimitIndicatorProps {
  featureName: FeatureName;
  messageWhenLimited?: string;
  showUpgradeButton?: boolean;
  className?: string;
  variant?: 'default' | 'minimal' | 'inline' | 'banner';
  onLimitReached?: () => void;
}

export function FeatureLimitIndicator({
  featureName,
  messageWhenLimited,
  showUpgradeButton = true,
  className = '',
  variant = 'default',
  onLimitReached
}: FeatureLimitIndicatorProps) {
  const navigate = useNavigate();
  const { 
    usage, 
    limit, 
    loading, 
    hasReachedLimit, 
    remainingUses,
    isSubscribed
  } = useFeatureUsage(featureName);
  
  const feature = FEATURE_LIMITS[featureName];
  const percentage = Math.min(Math.round((usage.count / limit) * 100), 100);
  
  // If user is subscribed, don't show any limit indicator
  if (isSubscribed || loading) return null;
  
  // Default message if not provided
  const defaultMessage = hasReachedLimit
    ? `You've reached your free limit for this feature`
    : `You have ${remainingUses} of ${limit} free uses remaining`;
  
  const message = messageWhenLimited || defaultMessage;
  
  // If limit reached, call the callback once
  React.useEffect(() => {
    if (hasReachedLimit && onLimitReached) {
      onLimitReached();
    }
  }, [hasReachedLimit, onLimitReached]);
  
  // Handle upgrade click
  const handleUpgradeClick = () => {
    navigate('/pricing');
  };
  
  // Color classes based on usage percentage
  const getColorClasses = () => {
    if (hasReachedLimit) {
      return {
        text: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-500',
        border: 'border-red-200 dark:border-red-800/30',
        containerBg: 'bg-red-50 dark:bg-red-900/20'
      };
    }
    
    if (percentage >= 70) {
      return {
        text: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-500',
        border: 'border-amber-200 dark:border-amber-800/30',
        containerBg: 'bg-amber-50 dark:bg-amber-900/20'
      };
    }
    
    return {
      text: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-500',
      border: 'border-green-200 dark:border-green-800/30',
      containerBg: 'bg-green-50 dark:bg-green-900/20'
    };
  };
  
  const colors = getColorClasses();
  
  // Minimal variant - just shows the counter
  if (variant === 'minimal') {
    return (
      <span className={`text-xs font-medium ${colors.text} ${className}`}>
        {remainingUses}/{limit}
      </span>
    );
  }
  
  // Inline variant - compact display for headers, etc.
  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <div className="h-1.5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`h-full ${colors.bg}`}
          />
        </div>
        <span className={`text-xs font-medium ${colors.text}`}>
          {remainingUses}/{limit}
        </span>
        {showUpgradeButton && (
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleUpgradeClick}
            className="py-0 h-auto text-xs underline-offset-2 hover:underline"
          >
            Upgrade
          </Button>
        )}
      </div>
    );
  }
  
  // Banner variant - full width notification
  if (variant === 'banner') {
    return (
      <div className={`w-full ${colors.containerBg} border ${colors.border} rounded-md p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasReachedLimit ? (
              <AlertTriangle className={`w-5 h-5 ${colors.text}`} />
            ) : (
              <div className="relative">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <circle 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    className="stroke-gray-200 dark:stroke-gray-700" 
                    fill="none" 
                    strokeWidth="2" 
                  />
                  <motion.circle 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    className={`stroke-current ${colors.text}`}
                    fill="none" 
                    strokeWidth="2" 
                    strokeDasharray={Math.PI * 20}
                    strokeDashoffset={Math.PI * 20 * (1 - percentage / 100)}
                    transform="rotate(-90 12 12)"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-medium">
                  {usage.count}/{limit}
                </span>
              </div>
            )}
            <div>
              <p className={`font-medium text-sm ${colors.text}`}>
                {message}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {hasReachedLimit 
                  ? 'Upgrade to Plus for unlimited access' 
                  : 'Resets at the beginning of each month'}
              </p>
            </div>
          </div>
          
          {showUpgradeButton && (
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90"
              onClick={handleUpgradeClick}
            >
              Upgrade
            </Button>
          )}
        </div>
      </div>
    );
  }
  
  // Default variant - progress bar with text
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <p className={`text-xs font-medium ${colors.text}`}>
          {message}
        </p>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {usage.count}/{limit}
        </span>
      </div>
      <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`h-full ${colors.bg}`}
        />
      </div>
      
      {showUpgradeButton && hasReachedLimit && (
        <div className="mt-2 flex justify-end">
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90"
            onClick={handleUpgradeClick}
          >
            Upgrade to Plus
          </Button>
        </div>
      )}
    </div>
  );
}