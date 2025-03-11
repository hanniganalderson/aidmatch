// src/lib/feature-usage.ts
import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';

// Define the feature names that we'll track
export enum FeatureName {
  AI_RECOMMENDATIONS = 'ai-recommendations',
  SAVED_SCHOLARSHIPS = 'saved-scholarships',
  MATCHES_VIEWED = 'matches-viewed',
  ESSAY_ASSISTANCE = 'essay-assistance'
}

// Define feature limits for free users
export const FREE_LIMITS: Record<FeatureName, number> = {
  [FeatureName.AI_RECOMMENDATIONS]: 5,
  [FeatureName.SAVED_SCHOLARSHIPS]: 3,
  [FeatureName.MATCHES_VIEWED]: 10,
  [FeatureName.ESSAY_ASSISTANCE]: 0
};

// Feature usage interface
interface FeatureUsage {
  count: number;
  lastReset: string;
  resetPeriod: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
}

// Hook for tracking feature usage
export function useFeatureUsage(featureName: FeatureName) {
  const { user } = useAuth();
  const { isSubscribed } = useSubscription();
  const [usage, setUsage] = useState<FeatureUsage>({
    count: 0,
    lastReset: new Date().toISOString(),
    resetPeriod: 'monthly'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Maximum allowed for this feature
  const limit = FREE_LIMITS[featureName];
  
  // Calculate if user has reached the limit
  const hasReachedLimit = !isSubscribed && usage.count >= limit;
  
  // Determine if we need to reset based on period
  const needsReset = () => {
    if (!usage.lastReset || usage.resetPeriod === 'never') return false;
    
    const lastReset = new Date(usage.lastReset);
    const now = new Date();
    
    switch (usage.resetPeriod) {
      case 'daily':
        return lastReset.getDate() !== now.getDate() || 
               lastReset.getMonth() !== now.getMonth() ||
               lastReset.getFullYear() !== now.getFullYear();
               
      case 'weekly':
        // Reset if it's been 7 days
        const diffTime = Math.abs(now.getTime() - lastReset.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 7;
        
      case 'monthly':
        return lastReset.getMonth() !== now.getMonth() ||
               lastReset.getFullYear() !== now.getFullYear();
               
      case 'yearly':
        return lastReset.getFullYear() !== now.getFullYear();
        
      default:
        return false;
    }
  };

  // Load usage data from local storage or database
  useEffect(() => {
    const loadUsage = async () => {
      setLoading(true);
      try {
        // Skip if user is subscribed - they have unlimited usage
        if (isSubscribed) {
          setUsage({
            count: 0,
            lastReset: new Date().toISOString(),
            resetPeriod: 'never'
          });
          setLoading(false);
          return;
        }
        
        // First try to get from localStorage for anonymous users
        const storageKey = `feature_usage_${featureName}`;
        const storedUsage = localStorage.getItem(storageKey);
        
        if (storedUsage) {
          const parsedUsage = JSON.parse(storedUsage) as FeatureUsage;
          
          // Check if we need to reset
          if (needsReset()) {
            const resetUsage = {
              ...parsedUsage,
              count: 0,
              lastReset: new Date().toISOString()
            };
            localStorage.setItem(storageKey, JSON.stringify(resetUsage));
            setUsage(resetUsage);
          } else {
            setUsage(parsedUsage);
          }
        } else {
          // Initialize with default values
          const defaultUsage: FeatureUsage = {
            count: 0,
            lastReset: new Date().toISOString(),
            resetPeriod: 'monthly'
          };
          localStorage.setItem(storageKey, JSON.stringify(defaultUsage));
          setUsage(defaultUsage);
        }
        
        // If user is logged in, also try to get from database for persistence across devices
        if (user) {
          try {
            const { data, error } = await supabase
              .from('user_feature_usage')
              .select('*')
              .eq('user_id', user.id)
              .eq('feature_name', featureName)
              .single();
              
            if (error && error.code !== 'PGRST116') {
              // PGRST116 means no rows found, which is expected for new users
              console.error('Error fetching feature usage:', error);
            }
            
            if (data) {
              // If we found usage data in the database, use it
              const dbUsage: FeatureUsage = {
                count: data.usage_count,
                lastReset: data.last_reset,
                resetPeriod: data.reset_period || 'monthly'
              };
              
              // Check if we need to reset
              if (needsReset()) {
                const resetUsage = {
                  ...dbUsage,
                  count: 0,
                  lastReset: new Date().toISOString()
                };
                
                // Update local state
                setUsage(resetUsage);
                
                // Update database
                await supabase
                  .from('user_feature_usage')
                  .update({
                    usage_count: 0,
                    last_reset: new Date().toISOString()
                  })
                  .eq('user_id', user.id)
                  .eq('feature_name', featureName);
                  
                // Update localStorage too for offline access
                localStorage.setItem(storageKey, JSON.stringify(resetUsage));
              } else {
                // Use the database value and update localStorage
                setUsage(dbUsage);
                localStorage.setItem(storageKey, JSON.stringify(dbUsage));
              }
            } else if (storedUsage) {
              // If we have localStorage data but no database entry, save to database
              await supabase
                .from('user_feature_usage')
                .insert({
                  user_id: user.id,
                  feature_name: featureName,
                  usage_count: usage.count,
                  last_reset: usage.lastReset,
                  reset_period: usage.resetPeriod
                });
            }
          } catch (dbError) {
            // If there's an error with the database, fall back to localStorage
            console.error('Database error when fetching feature usage:', dbError);
          }
        }
      } catch (err) {
        console.error(`Error loading usage for ${featureName}:`, err);
        setError(`Failed to load feature usage data`);
      } finally {
        setLoading(false);
      }
    };
    
    loadUsage();
  }, [featureName, user, isSubscribed]);
  
  // Function to increment usage count
  const incrementUsage = async () => {
    // If subscribed, don't track usage
    if (isSubscribed) return true;
    
    // If already at limit, prevent further usage
    if (hasReachedLimit) return false;
    
    try {
      // Increment the count
      const newCount = usage.count + 1;
      const updatedUsage = { ...usage, count: newCount };
      
      // Update local state
      setUsage(updatedUsage);
      
      // Update localStorage
      const storageKey = `feature_usage_${featureName}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedUsage));
      
      // If user is logged in, update database
      if (user) {
        const { error } = await supabase
          .from('user_feature_usage')
          .upsert({
            user_id: user.id,
            feature_name: featureName,
            usage_count: newCount,
            last_reset: updatedUsage.lastReset,
            reset_period: updatedUsage.resetPeriod
          });
          
        if (error) {
          console.error('Error updating feature usage in database:', error);
        }
      }
      
      // Return true if we're still under the limit after incrementing
      return newCount < limit;
    } catch (err) {
      console.error(`Error incrementing usage for ${featureName}:`, err);
      return false;
    }
  };
  
  // Function to check if we can use the feature
  const canUseFeature = () => {
    // Subscribed users can always use features
    if (isSubscribed) return true;
    
    // Free users can use if under limit
    return usage.count < limit;
  };
  
  // Return the hook interface
  return {
    usage,
    limit,
    loading,
    error,
    hasReachedLimit,
    incrementUsage,
    canUseFeature,
    remainingUses: Math.max(0, limit - usage.count),
    isSubscribed
  };
}