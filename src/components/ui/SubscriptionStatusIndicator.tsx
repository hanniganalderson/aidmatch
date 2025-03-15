import { useSubscription } from '../../contexts/SubscriptionContext';
import { Sparkles, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { cn } from '../../lib/utils';

interface SubscriptionStatusIndicatorProps {
  variant?: 'badge' | 'icon' | 'text' | 'full';
  className?: string;
}

export function SubscriptionStatusIndicator({ 
  variant = 'badge',
  className 
}: SubscriptionStatusIndicatorProps) {
  const { 
    isSubscribed, 
    isLoading, 
    subscriptionStatus, 
    refreshSubscription,
    lastChecked
  } = useSubscription();
  
  // Format the last checked time
  const lastCheckedText = lastChecked 
    ? new Date(lastChecked).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Never';
  
  if (isLoading) {
    return (
      <div className={cn("flex items-center", className)}>
        {variant === 'badge' && (
          <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
        )}
        {variant === 'icon' && (
          <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />
        )}
        {variant === 'text' && (
          <span className="text-sm text-gray-500 dark:text-gray-400">Checking...</span>
        )}
        {variant === 'full' && (
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Checking subscription status...</span>
          </div>
        )}
      </div>
    );
  }
  
  if (isSubscribed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex items-center", className)}>
              {variant === 'badge' && (
                <div className="px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-medium flex items-center">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Plus
                </div>
              )}
              {variant === 'icon' && (
                <Sparkles className="h-4 w-4 text-indigo-500" />
              )}
              {variant === 'text' && (
                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Plus Active</span>
              )}
              {variant === 'full' && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    AidMatch Plus Active
                  </span>
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>AidMatch Plus is active</p>
            <p className="text-xs text-gray-500">Last checked: {lastCheckedText}</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-1 h-6 text-xs w-full"
              onClick={() => refreshSubscription()}
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Refresh
            </Button>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // Handle different non-subscribed states
  if (subscriptionStatus === 'canceled') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex items-center", className)}>
              {variant === 'badge' && (
                <div className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-medium flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Ending
                </div>
              )}
              {variant === 'icon' && (
                <Clock className="h-4 w-4 text-amber-500" />
              )}
              {variant === 'text' && (
                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">Plus Ending</span>
              )}
              {variant === 'full' && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                    Plus Subscription Ending
                  </span>
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Your Plus subscription is ending soon</p>
            <p className="text-xs text-gray-500">You'll still have access until the end of your billing period</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-1 h-6 text-xs w-full"
              onClick={() => window.location.href = '/account/billing'}
            >
              Manage Subscription
            </Button>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  if (subscriptionStatus === 'past_due' || subscriptionStatus === 'unpaid') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex items-center", className)}>
              {variant === 'badge' && (
                <div className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs font-medium flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Payment Issue
                </div>
              )}
              {variant === 'icon' && (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              {variant === 'text' && (
                <span className="text-sm font-medium text-red-600 dark:text-red-400">Payment Issue</span>
              )}
              {variant === 'full' && (
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    Payment Issue
                  </span>
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>There's an issue with your subscription payment</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-1 h-6 text-xs w-full"
              onClick={() => window.location.href = '/account/billing'}
            >
              Update Payment Method
            </Button>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // Default free state
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center", className)}>
            {variant === 'badge' && (
              <div className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 text-xs font-medium">
                Free
              </div>
            )}
            {variant === 'icon' && (
              <div className="h-4 w-4 text-gray-400">•</div>
            )}
            {variant === 'text' && (
              <span className="text-sm text-gray-600 dark:text-gray-400">Free Plan</span>
            )}
            {variant === 'full' && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Free Plan
                </span>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>You're on the Free plan</p>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-1 h-6 text-xs w-full"
            onClick={() => window.location.href = '/pricing'}
          >
            <Sparkles className="h-3 w-3 mr-1" /> Upgrade to Plus
          </Button>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 