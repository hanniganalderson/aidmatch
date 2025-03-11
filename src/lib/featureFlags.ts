// src/lib/featureFlags.ts
import { useSubscription } from '../contexts/SubscriptionContext';

// Feature Flag Keys
export enum FeatureFlagName {
  SAVE_SCHOLARSHIPS = 'save-scholarships',
  AI_RECOMMENDATIONS = 'ai-recommendations',
  BASIC_MATCHING = 'basic-matching',
  ESSAY_ASSISTANCE = 'essay-assistance',
  UNLIMITED_SAVES = 'unlimited-saves',
  PRIORITY_SUPPORT = 'priority-support',
  DEADLINE_REMINDERS = 'deadline-reminders',
  VIEW_RESULTS = 'view-results',
}

// Feature Flag Limits
export const FeatureLimits = {
  [FeatureFlagName.SAVE_SCHOLARSHIPS]: {
    free: 3,     // Free users can save up to 3 scholarships
    plus: Infinity // Effectively unlimited for plus users
  },
  [FeatureFlagName.AI_RECOMMENDATIONS]: {
    free: 5,     // Free users get 5 AI recommendations per month
    plus: Infinity // Unlimited for plus users
  },
  [FeatureFlagName.BASIC_MATCHING]: {
    free: 10,     // Free users get 10 basic matching per month
    plus: Infinity // Unlimited for plus users
  },
  [FeatureFlagName.ESSAY_ASSISTANCE]: {
    free: 0,     // Free users get 0 essay assistance
    plus: Infinity // Unlimited for plus users
  },
  [FeatureFlagName.UNLIMITED_SAVES]: {
    free: 0,     // Free users get 0 unlimited saves
    plus: Infinity // Unlimited for plus users
  },
  [FeatureFlagName.PRIORITY_SUPPORT]: {
    free: 0,     // Free users get 0 priority support
    plus: Infinity // Unlimited for plus users
  },
  [FeatureFlagName.DEADLINE_REMINDERS]: {
    free: 3,     // Free users get 3 deadline reminders
    plus: Infinity // Unlimited for plus users
  },
  [FeatureFlagName.VIEW_RESULTS]: {
    free: 10,     // Free users get 10 view results
    plus: Infinity // Unlimited for plus users
  }
};

/**
 * Hook to check if a feature is enabled for the current user
 */
export function useFeatureFlag(featureName: FeatureFlagName): boolean {
  const { isSubscribed } = useSubscription();
  
  // Check if feature is a plus-only feature
  const isPlusFeature = [
    FeatureFlagName.AI_RECOMMENDATIONS,
    FeatureFlagName.ESSAY_ASSISTANCE,
    FeatureFlagName.UNLIMITED_SAVES,
    FeatureFlagName.PRIORITY_SUPPORT,
    FeatureFlagName.DEADLINE_REMINDERS
  ].includes(featureName);
  
  // Free features are always available
  if (!isPlusFeature) {
    return true;
  }
  
  // Plus features are only available to subscribers
  return isSubscribed;
}

/**
 * Hook to get the limit for a feature
 */
export function useFeatureLimit(featureName: FeatureFlagName): number {
  const { isSubscribed } = useSubscription();
  
  if (featureName in FeatureLimits) {
    return isSubscribed 
      ? FeatureLimits[featureName].plus 
      : FeatureLimits[featureName].free;
  }
  
  return 0;
}