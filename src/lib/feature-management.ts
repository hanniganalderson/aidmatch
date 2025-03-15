export enum FeatureName {
  AI_RECOMMENDATIONS = 'ai_recommendations',
  SAVED_SCHOLARSHIPS = 'saved_scholarships',
  MATCHES_VIEWED = 'matches_viewed',
  ESSAY_ASSISTANCE = 'essay_assistance',
  FINANCIAL_OPTIMIZER = 'financial_optimizer',
  DEADLINE_TRACKER = 'deadline_tracker',
  AUTO_FILL = 'auto_fill',
  ADVANCED_FILTERS = 'advanced_filters', // Add missing feature
  EXPORT_DATA = 'export_data', // Add missing feature
  DEADLINE_REMINDERS = 'deadline_reminders' // Add missing feature
}

export interface FeatureLimit {
  name: FeatureName;
  freeLimit: number;
  plusLimit: number | null; // null means unlimited
  description: string;
  upgradeMessage: string;
}

// Define feature limits and restrictions
export const FEATURE_LIMITS: Record<FeatureName, FeatureLimit> = {
  [FeatureName.SAVED_SCHOLARSHIPS]: {
    name: FeatureName.SAVED_SCHOLARSHIPS,
    freeLimit: 3,
    plusLimit: null, // unlimited
    description: 'Save scholarships to your dashboard',
    upgradeMessage: 'Upgrade to Plus for unlimited saved scholarships'
  },
  [FeatureName.AI_RECOMMENDATIONS]: {
    name: FeatureName.AI_RECOMMENDATIONS,
    freeLimit: 5,
    plusLimit: null, // unlimited
    description: 'Get AI-powered scholarship recommendations',
    upgradeMessage: 'Upgrade to Plus for unlimited AI recommendations'
  },
  [FeatureName.ESSAY_ASSISTANCE]: {
    name: FeatureName.ESSAY_ASSISTANCE,
    freeLimit: 0, // Not available in free plan
    plusLimit: null, // unlimited
    description: 'Get AI assistance with scholarship essays',
    upgradeMessage: 'Upgrade to Plus to unlock AI essay assistance'
  },
  [FeatureName.FINANCIAL_OPTIMIZER]: {
    name: FeatureName.FINANCIAL_OPTIMIZER,
    freeLimit: 0, // Not available in free plan
    plusLimit: null, // unlimited
    description: 'Optimize your financial aid package',
    upgradeMessage: 'Upgrade to Plus to unlock financial optimization'
  },
  [FeatureName.DEADLINE_TRACKER]: {
    name: FeatureName.DEADLINE_TRACKER,
    freeLimit: 3,
    plusLimit: null, // unlimited
    description: 'Track scholarship application deadlines',
    upgradeMessage: 'Upgrade to Plus for unlimited deadline tracking'
  },
  [FeatureName.AUTO_FILL]: {
    name: FeatureName.AUTO_FILL,
    freeLimit: 0, // Not available in free plan
    plusLimit: null, // unlimited
    description: 'Auto-fill scholarship applications',
    upgradeMessage: 'Upgrade to Plus to unlock auto-fill'
  },
  [FeatureName.ADVANCED_FILTERS]: {
    name: FeatureName.ADVANCED_FILTERS,
    freeLimit: 0, // Not available in free plan
    plusLimit: null, // unlimited
    description: 'Access advanced scholarship filters',
    upgradeMessage: 'Upgrade to Plus to unlock advanced filters'
  },
  [FeatureName.EXPORT_DATA]: {
    name: FeatureName.EXPORT_DATA,
    freeLimit: 0, // Not available in free plan
    plusLimit: null, // unlimited
    description: 'Export your scholarship data',
    upgradeMessage: 'Upgrade to Plus to export your data'
  },
  [FeatureName.MATCHES_VIEWED]: {
    name: FeatureName.MATCHES_VIEWED,
    freeLimit: 10,
    plusLimit: null, // unlimited
    description: 'View scholarship matches',
    upgradeMessage: 'Upgrade to Plus for unlimited match views'
  },
  [FeatureName.DEADLINE_REMINDERS]: {
    name: FeatureName.DEADLINE_REMINDERS,
    freeLimit: 3,
    plusLimit: null, // unlimited
    description: 'Set scholarship deadline reminders',
    upgradeMessage: 'Upgrade to Plus for unlimited reminders'
  }
}

// Feature usage tracking service
export class FeatureUsageService {
  // Check if a user has reached their limit for a feature
  static async hasReachedLimit(
    userId: string, 
    featureName: FeatureName, 
    isSubscribed: boolean,
    supabase: any
  ): Promise<boolean> {
    // Plus users have no limits
    if (isSubscribed) return false;
    
    const feature = FEATURE_LIMITS[featureName];
    
    // If feature is not available in free plan
    if (feature.freeLimit === 0) return true;
    
    // Check current usage from database
    const { data, error } = await supabase
      .from('feature_usage')
      .select('count')
      .eq('user_id', userId)
      .eq('feature_name', featureName)
      .single();
      
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking feature usage:', error);
      return false; // Default to allowing access on error
    }
    
    const currentUsage = data?.count || 0;
    return currentUsage >= feature.freeLimit;
  }
  
  // Increment usage counter for a feature
  static async incrementUsage(
    userId: string, 
    featureName: FeatureName,
    supabase: any
  ): Promise<boolean> {
    try {
      // First try to update existing record
      const { data, error } = await supabase
        .from('feature_usage')
        .upsert({
          user_id: userId,
          feature_name: featureName,
          count: 1, // Start with 1 if new record
          last_used: new Date().toISOString()
        }, {
          onConflict: 'user_id,feature_name',
          returning: 'minimal'
        });
        
      if (error) throw error;
      
      // If no error but no data returned, it means we need to increment existing record
      if (!data) {
        const { error: incrementError } = await supabase.rpc('increment_feature_usage', {
          p_user_id: userId,
          p_feature_name: featureName
        });
        
        if (incrementError) throw incrementError;
      }
      
      return true;
    } catch (err) {
      console.error('Error incrementing feature usage:', err);
      return false;
    }
  }
  
  // Get current usage for a feature
  static async getUsage(
    userId: string, 
    featureName: FeatureName,
    supabase: any
  ): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('feature_usage')
        .select('count')
        .eq('user_id', userId)
        .eq('feature_name', featureName)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error getting feature usage:', error);
        return 0;
      }
      
      return data?.count || 0;
    } catch (err) {
      console.error('Error getting feature usage:', err);
      return 0;
    }
  }
}

// Define limits for free users
export const FREE_USER_LIMITS: Record<string, number> = {
  [FeatureName.AI_RECOMMENDATIONS]: 5,
  [FeatureName.SAVED_SCHOLARSHIPS]: 10,
  [FeatureName.MATCHES_VIEWED]: 50,
  [FeatureName.ESSAY_ASSISTANCE]: 3,
  [FeatureName.FINANCIAL_OPTIMIZER]: 2,
  [FeatureName.DEADLINE_TRACKER]: 5,
  [FeatureName.AUTO_FILL]: 3,
  [FeatureName.ADVANCED_FILTERS]: 0,
  [FeatureName.EXPORT_DATA]: 0,
  [FeatureName.DEADLINE_REMINDERS]: 3
};

// Define feature descriptions for UI
export const FEATURE_DESCRIPTIONS: Record<string, string> = {
  [FeatureName.AI_RECOMMENDATIONS]: 'Get AI-powered scholarship recommendations based on your profile',
  [FeatureName.SAVED_SCHOLARSHIPS]: 'Save scholarships to your personal list',
  [FeatureName.MATCHES_VIEWED]: 'View detailed scholarship matches',
  [FeatureName.ESSAY_ASSISTANCE]: 'Get AI assistance with scholarship essays',
  [FeatureName.FINANCIAL_OPTIMIZER]: 'Optimize your financial aid package',
  [FeatureName.DEADLINE_TRACKER]: 'Track scholarship application deadlines',
  [FeatureName.AUTO_FILL]: 'Auto-fill scholarship applications',
  [FeatureName.ADVANCED_FILTERS]: 'Access advanced scholarship filters',
  [FeatureName.EXPORT_DATA]: 'Export your scholarship data',
  [FeatureName.DEADLINE_REMINDERS]: 'Get reminders for scholarship deadlines'
};

// Define feature icons (for UI components)
export const FEATURE_ICONS: Record<string, string> = {
  [FeatureName.AI_RECOMMENDATIONS]: 'Sparkles',
  [FeatureName.SAVED_SCHOLARSHIPS]: 'Bookmark',
  [FeatureName.MATCHES_VIEWED]: 'Search',
  [FeatureName.ESSAY_ASSISTANCE]: 'FileText',
  [FeatureName.FINANCIAL_OPTIMIZER]: 'DollarSign',
  [FeatureName.DEADLINE_TRACKER]: 'Calendar',
  [FeatureName.AUTO_FILL]: 'ClipboardCheck',
  [FeatureName.ADVANCED_FILTERS]: 'Filter',
  [FeatureName.EXPORT_DATA]: 'Download',
  [FeatureName.DEADLINE_REMINDERS]: 'Bell'
};

// Check if a feature is available based on subscription and usage
export function isFeatureAvailable(
  featureName: FeatureName,
  isSubscribed: boolean,
  currentUsage: number
): boolean {
  // Subscribed users always have access to all features
  if (isSubscribed) return true;
  
  // Free users are limited by usage counts
  const limit = FREE_USER_LIMITS[featureName];
  return currentUsage < limit;
}

// Get the remaining usage for a feature
export function getRemainingUsage(
  featureName: FeatureName,
  isSubscribed: boolean,
  currentUsage: number
): number {
  if (isSubscribed) return Infinity;
  
  const limit = FREE_USER_LIMITS[featureName];
  return Math.max(0, limit - currentUsage);
}

// Get the usage percentage for a feature
export function getUsagePercentage(
  featureName: FeatureName,
  isSubscribed: boolean,
  currentUsage: number
): number {
  if (isSubscribed) return 0; // Always show 0% for subscribed users
  
  const limit = FREE_USER_LIMITS[featureName];
  return Math.min(100, Math.round((currentUsage / limit) * 100));
}