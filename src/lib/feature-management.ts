export enum FeatureName {
  SAVED_SCHOLARSHIPS = 'saved_scholarships',
  AI_RECOMMENDATIONS = 'ai_recommendations',
  ESSAY_ASSISTANCE = 'essay_assistance',
  DEADLINE_REMINDERS = 'deadline_reminders',
  ADVANCED_FILTERS = 'advanced_filters',
  EXPORT_DATA = 'export_data',
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
  [FeatureName.DEADLINE_REMINDERS]: {
    name: FeatureName.DEADLINE_REMINDERS,
    freeLimit: 3,
    plusLimit: null, // unlimited
    description: 'Set reminders for scholarship deadlines',
    upgradeMessage: 'Upgrade to Plus for unlimited deadline reminders'
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