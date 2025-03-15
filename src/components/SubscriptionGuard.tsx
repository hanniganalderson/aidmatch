import { ReactNode } from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { motion } from 'framer-motion';
import { Sparkles, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

interface SubscriptionGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  featureName: string;
  description?: string;
}

export function SubscriptionGuard({
  children,
  fallback,
  featureName,
  description
}: SubscriptionGuardProps) {
  const { isSubscribed, isLoading } = useSubscription();
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }
  
  if (isSubscribed) {
    return <>{children}</>;
  }
  
  if (fallback) {
    return <>{fallback}</>;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 text-center"
    >
      <div className="mb-4 flex justify-center">
        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
          <Lock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {featureName} is a Plus Feature
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {description || `Upgrade to AidMatch Plus to access ${featureName} and other premium features.`}
      </p>
      
      <Button
        onClick={() => navigate('/pricing')}
        className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Upgrade to Plus
      </Button>
    </motion.div>
  );
} 