// src/lib/simpleSubscription.ts
import { supabase } from './supabase';

/**
 * Simple function to create a test subscription with only the required fields
 */
export async function createSimpleSubscription(userId: string) {
  try {
    console.log(`Creating simple test subscription for user ${userId}`);
    
    // Create the minimum required fields for a subscription
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        status: 'active',
        plan_type: 'plus',
        stripe_customer_id: 'test_customer_' + Date.now(),
        stripe_subscription_id: 'test_subscription_' + Date.now(),
      })
      .select();
    
    if (error) {
      console.error('Error creating simple subscription:', error);
      return { success: false, error };
    }
    
    console.log('Successfully created simple subscription:', data);
    return { success: true, data };
    
  } catch (error) {
    console.error('Exception in createSimpleSubscription:', error);
    return { success: false, error };
  }
}