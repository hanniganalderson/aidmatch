import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { FeatureName } from '../lib/feature-management';
import { getUserFeatureUsage } from '../lib/feature-usage';
import { Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

// Create a simple Progress component since the import is missing
const Progress = ({ 
  value, 
  className, 
  indicatorClassName 
}: { 
  value: number, 
  className?: string, 
  indicatorClassName?: string 
}) => {
  return (
    <div className={`w-full h-2 bg-gray-200 rounded-full overflow-hidden ${className || ''}`}>
      <div 
        className={`h-full ${indicatorClassName || 'bg-indigo-500'}`} 
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

interface FeatureLimitIndicatorProps {
  featureName: FeatureName;
  limit: number;
  showUpgradeButton?: boolean;
  className?: string;
}

export function FeatureLimitIndicator({
  featureName,
  limit,
  showUpgradeButton = true,
  className
}: FeatureLimitIndicatorProps) {
  const { user } = useAuth();
  const { isSubscribed } = useSubscription();
  const [usage, setUsage] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUsage = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const currentUsage = await getUserFeatureUsage(user.id, featureName);
        setUsage(currentUsage);
      } catch (error) {
        console.error(`Error fetching ${featureName} usage:`, error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsage();
  }, [user, featureName]);
  
  // If user is subscribed, don't show the limit indicator
  if (isSubscribed) {
    return null;
  }
  
  const percentage = Math.min(Math.round((usage / limit) * 100), 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;
  
  return (
    <div className={`p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {getFeatureDisplayName(featureName)} Usage
        </h3>
        <span className={`text-xs font-medium ${
          isAtLimit 
            ? 'text-red-600 dark:text-red-400' 
            : isNearLimit 
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-gray-600 dark:text-gray-400'
        }`}>
          {loading ? '...' : `${usage}/${limit}`}
        </span>
      </div>
      
      <Progress 
        value={percentage} 
        className={`h-2 ${
          isAtLimit 
            ? 'bg-red-100 dark:bg-red-900/30' 
            : isNearLimit 
              ? 'bg-amber-100 dark:bg-amber-900/30'
              : 'bg-gray-100 dark:bg-gray-700'
        }`}
        indicatorClassName={
          isAtLimit 
            ? 'bg-red-500' 
            : isNearLimit 
              ? 'bg-amber-500'
              : 'bg-indigo-500'
        }
      />
      
      {isAtLimit && (
        <div className="mt-2 text-xs text-red-600 dark:text-red-400">
          You've reached your monthly limit for this feature.
        </div>
      )}
      
      {isNearLimit && !isAtLimit && (
        <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
          You're approaching your monthly limit for this feature.
        </div>
      )}
      
      {(isNearLimit || isAtLimit) && showUpgradeButton && (
        <Button
          size="sm"
          onClick={() => navigate('/pricing')}
          className="mt-3 w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90"
        >
          <Sparkles className="h-3 w-3 mr-1" />
          Upgrade to Plus for Unlimited
        </Button>
      )}
    </div>
  );
}

function getFeatureDisplayName(featureName: FeatureName): string {
  switch (featureName) {
    case FeatureName.AI_RECOMMENDATIONS:
      return 'AI Recommendations';
    case FeatureName.SAVED_SCHOLARSHIPS:
      return 'Saved Scholarships';
    case FeatureName.MATCHES_VIEWED:
      return 'Scholarship Matches';
    case FeatureName.ESSAY_ASSISTANCE:
      return 'Essay Assistance';
    default:
      return featureName;
  }
}