// src/components/ui/PremiumFeatureGate.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Sparkles, Crown } from 'lucide-react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { Button } from './button';

interface PremiumFeatureGateProps {
  feature: string;
  description?: string;
  icon?: 'lock' | 'sparkles' | 'crown';
  children?: React.ReactNode;
  showChildren?: boolean; // Whether to show the children regardless of subscription status
  blurChildren?: boolean; // Whether to blur the children for free users
  limitCount?: { current: number; max: number }; // For showing usage limits
}

export function PremiumFeatureGate({
  feature,
  description,
  icon = 'lock',
  children,
  showChildren = false,
  blurChildren = true,
  limitCount
}: PremiumFeatureGateProps) {
  const { isSubscribed } = useSubscription();
  const navigate = useNavigate();

  const IconComponent = {
    lock: Lock,
    sparkles: Sparkles,
    crown: Crown
  }[icon];

  // If the user is subscribed, just show the children
  if (isSubscribed) {
    return <>{children}</>;
  }

  return (
    <div className="w-full">
      {/* Premium Feature Banner */}
      <motion.div 
        initial={{ opacity: 0.8 }}
        whileHover={{ opacity: 1 }}
        className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 
          border border-indigo-100 dark:border-indigo-800/30 rounded-lg p-4 mb-3"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-800/50 rounded-full">
              <IconComponent className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                {feature}
              </h4>
              {description && (
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {description}
                </p>
              )}
              
              {/* Usage limit indicator */}
              {limitCount && (
                <div className="mt-1.5">
                  <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${Math.min(100, (limitCount.current / limitCount.max) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {limitCount.current} of {limitCount.max} free uses
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <Button 
            size="sm"
            onClick={() => navigate('/pricing')}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Upgrade to Plus
          </Button>
        </div>
      </motion.div>
      
      {/* Show blurred content or restricted message */}
      {showChildren && children && (
        <div className="relative">
          <div className={blurChildren ? "blur-sm pointer-events-none" : ""}>
            {children}
          </div>
          
          {blurChildren && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                onClick={() => navigate('/pricing')}
                className="z-10 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-md shadow-lg"
              >
                Unlock with Plus
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}