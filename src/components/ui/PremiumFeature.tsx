import { ReactNode, useState } from 'react';
import { Sparkles, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PaywallModal } from './PaywallModal';
import { FeatureName } from '../../lib/feature-management';

interface PremiumFeatureProps {
  children: ReactNode;
  featureName: FeatureName;
  showBadge?: boolean;
  locked?: boolean;
}

export function PremiumFeature({
  children,
  featureName,
  showBadge = true,
  locked = true
}: PremiumFeatureProps) {
  const { isSubscribed } = useAuth();
  const [showPaywall, setShowPaywall] = useState(false);
  
  // If user is subscribed, just render the children
  if (isSubscribed) {
    return (
      <div className="relative">
        {showBadge && (
          <div className="absolute -top-2 -right-2 z-10">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Plus
            </div>
          </div>
        )}
        {children}
      </div>
    );
  }
  
  // For non-subscribers, show locked state if specified
  if (locked) {
    return (
      <div className="relative">
        <div 
          className="absolute inset-0 bg-gray-200/80 dark:bg-gray-800/80 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center rounded-lg cursor-pointer"
          onClick={() => setShowPaywall(true)}
        >
          <Lock className="w-8 h-8 text-gray-500 dark:text-gray-400 mb-2" />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Plus Feature
          </p>
          <button className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
            Upgrade to Unlock
          </button>
        </div>
        
        <div className="opacity-50 pointer-events-none filter grayscale">
          {children}
        </div>
        
        <PaywallModal
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
          featureName={featureName}
        />
      </div>
    );
  }
  
  // For non-subscribers, but not locked (just showing the badge)
  return (
    <div className="relative">
      {showBadge && (
        <div 
          className="absolute -top-2 -right-2 z-10 cursor-pointer"
          onClick={() => setShowPaywall(true)}
        >
          <div className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 border border-gray-300 dark:border-gray-600">
            <Lock className="w-3 h-3" />
            Plus
          </div>
        </div>
      )}
      {children}
      
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        featureName={featureName}
      />
    </div>
  );
} 