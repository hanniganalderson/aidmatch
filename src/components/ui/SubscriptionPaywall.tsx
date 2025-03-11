// src/components/ui/SubscriptionPaywall.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Crown, Lock, Sparkles } from 'lucide-react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { Button } from './button';

interface SubscriptionPaywallProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showOnSubscribed?: boolean;
}

/**
 * A paywall component that restricts content to Plus subscribers
 * Shows upgrade prompt for free users and the actual content for Plus users
 */
export const SubscriptionPaywall: React.FC<SubscriptionPaywallProps> = ({
  children,
  title = "Plus Feature",
  description = "This feature is available exclusively to Plus subscribers.",
  showOnSubscribed = false // If true, shows the children when subscribed, otherwise hides the entire component
}) => {
  const { isSubscribed } = useSubscription();
  const navigate = useNavigate();
  
  // If the user is subscribed and we don't want to show anything, return null
  if (isSubscribed && !showOnSubscribed) {
    return null;
  }
  
  // If the user is subscribed, show the children
  if (isSubscribed) {
    return <>{children}</>;
  }
  
  // Otherwise, show the paywall
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-lg border border-indigo-200 dark:border-indigo-800/30 overflow-hidden bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20"
    >
      <div className="p-5 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mb-4">
          <Crown className="w-8 h-8 text-white" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
          {description}
        </p>
        
        <div className="space-y-4 w-full max-w-md mb-6">
          <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span>Unlimited AI scholarship recommendations</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span>AI-powered essay assistance & feedback</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span>Priority support & unlimited saved scholarships</span>
          </div>
        </div>
        
        <Button
          onClick={() => navigate('/pricing')}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
        >
          <Lock className="w-4 h-4" />
          <span>Upgrade to Plus</span>
        </Button>
      </div>
    </motion.div>
  );
};

export default SubscriptionPaywall;