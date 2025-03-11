// src/lib/manualSubscription.ts
import { supabase } from './supabase';

/**
 * Creates a test subscription record for a user
 * Use this for testing subscription features when webhooks aren't working
 */
export async function createTestSubscription(userId: string, userEmail: string) {
  try {
    console.log(`Creating test subscription for user ${userId} (${userEmail})`);
    
    // First check if a subscription already exists
    const { data: existingSubscription, error: checkError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .limit(1);
      
    if (checkError) {
      console.error('Error checking for existing subscription:', checkError);
      return { success: false, error: checkError };
    }
    
    // If subscription exists, return it
    if (existingSubscription && existingSubscription.length > 0) {
      console.log('Subscription already exists:', existingSubscription[0]);
      return { success: true, data: existingSubscription[0], message: 'Subscription already exists' };
    }
    
    // Create a new subscription record
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        user_email: userEmail,
        status: 'active',
        plan_type: 'plus',
        stripe_customer_id: 'test_customer_' + Date.now(),
        stripe_subscription_id: 'test_subscription_' + Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating test subscription:', error);
      return { success: false, error };
    }
    
    console.log('Successfully created test subscription:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Exception in createTestSubscription:', error);
    return { success: false, error };
  }
}