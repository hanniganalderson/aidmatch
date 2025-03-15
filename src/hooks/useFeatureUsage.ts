import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { FeatureName } from '../lib/feature-management';
import { getUserFeatureUsage, incrementFeatureUsage } from '../lib/feature-usage';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';

export function useFeatureUsage(featureName: FeatureName) {
  const { user } = useAuth();
  const { isSubscribed } = useSubscription();
  const [usage, setUsage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);

  // Add these computed properties
  const hasReachedLimit = !isSubscribed && !isAvailable;
  const canUseFeature = isSubscribed || isAvailable;

  // Fetch current usage
  const fetchUsage = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const currentUsage = await getUserFeatureUsage(user.id, featureName);
      setUsage(currentUsage);
      
      // Check if feature is available based on subscription and usage
      if (isSubscribed) {
        setIsAvailable(true);
      } else {
        // For free users, check against limits
        const { FREE_USER_LIMITS } = await import('../lib/feature-management');
        setIsAvailable(currentUsage < FREE_USER_LIMITS[featureName]);
      }
    } catch (err) {
      console.error(`Error fetching usage for ${featureName}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsAvailable(false);
    } finally {
      setLoading(false);
    }
  }, [user, featureName, isSubscribed]);

  // Increment usage
  const incrementUsage = useCallback(async () => {
    if (!user) return false;
    
    try {
      const success = await incrementFeatureUsage(user.id, featureName);
      
      if (success) {
        setUsage(prev => prev + 1);
        
        // Check if feature is still available
        if (!isSubscribed) {
          const { FREE_USER_LIMITS } = await import('../lib/feature-management');
          setIsAvailable((usage + 1) < FREE_USER_LIMITS[featureName]);
        }
      }
      return success;
    } catch (err) {
      console.error(`Error incrementing usage for ${featureName}:`, err);
      return false;
    }
  }, [user, featureName, isSubscribed, usage]);

  // Load usage on mount and when dependencies change
  useEffect(() => {
    if (user) {
      fetchUsage();
    }
  }, [user, featureName, isSubscribed, fetchUsage]);

  return {
    usage,
    loading,
    error,
    isAvailable,
    incrementUsage,
    refreshUsage: fetchUsage,
    // Add these properties to the return object
    hasReachedLimit,
    canUseFeature
  };
} 