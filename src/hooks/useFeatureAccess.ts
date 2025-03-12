import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { FeatureName, FeatureUsageService, FEATURE_LIMITS } from '../lib/feature-management';

export function useFeatureAccess(featureName: FeatureName) {
  const { user, isSubscribed } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [currentUsage, setCurrentUsage] = useState(0);
  const [limit, setLimit] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  
  // Get feature limit based on subscription status
  useEffect(() => {
    const feature = FEATURE_LIMITS[featureName];
    const featureLimit = isSubscribed ? feature.plusLimit : feature.freeLimit;
    setLimit(featureLimit === null ? Infinity : featureLimit);
    
    // Plus users always have access
    if (isSubscribed) {
      setHasAccess(true);
      setLoading(false);
      return;
    }
    
    // Check if feature is available in free plan
    if (feature.freeLimit === 0) {
      setHasAccess(false);
      setLoading(false);
      return;
    }
    
    // For free users, check current usage
    const checkAccess = async () => {
      if (!user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const usage = await FeatureUsageService.getUsage(user.id, featureName, supabase);
        setCurrentUsage(usage);
        setHasAccess(usage < feature.freeLimit);
      } catch (err) {
        console.error('Error checking feature access:', err);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAccess();
  }, [featureName, isSubscribed, user]);
  
  // Function to use the feature and track usage
  const useFeature = useCallback(async () => {
    if (!user) return false;
    
    // Plus users can always use features
    if (isSubscribed) return true;
    
    // Check if free user has reached limit
    const hasReachedLimit = await FeatureUsageService.hasReachedLimit(
      user.id, 
      featureName, 
      isSubscribed,
      supabase
    );
    
    if (hasReachedLimit) {
      setShowPaywall(true);
      return false;
    }
    
    // Increment usage
    const success = await FeatureUsageService.incrementUsage(
      user.id,
      featureName,
      supabase
    );
    
    if (success) {
      // Update local state
      const newUsage = currentUsage + 1;
      setCurrentUsage(newUsage);
      setHasAccess(newUsage < limit);
    }
    
    return success;
  }, [user, isSubscribed, featureName, currentUsage, limit]);
  
  // Close paywall modal
  const closePaywall = useCallback(() => {
    setShowPaywall(false);
  }, []);
  
  return {
    loading,
    hasAccess,
    currentUsage,
    limit,
    useFeature,
    showPaywall,
    closePaywall
  };
} 