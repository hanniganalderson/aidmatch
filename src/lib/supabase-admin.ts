import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with admin privileges
// This should only be used in server-side code
export const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || ''
);

// Helper function to get a user by their email
export async function getUserByEmail(email: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
    
  if (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
  
  return data;
}

// Helper function to update a user's subscription status
export async function updateUserSubscription(userId: string, status: string, subscriptionId?: string) {
  const { error } = await supabaseAdmin
    .from('users')
    .update({ 
      is_subscribed: status === 'active' || status === 'trialing',
      subscription_id: subscriptionId || null,
      subscription_status: status
    })
    .eq('id', userId);
    
  if (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
  
  return true;
}

// Helper function to create a subscription record
export async function createSubscriptionRecord(userId: string, subscriptionId: string, status: string, data: any) {
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .insert({
      user_id: userId,
      subscription_id: subscriptionId,
      status,
      data
    });
    
  if (error) {
    console.error('Error creating subscription record:', error);
    throw error;
  }
  
  return true;
}

// Helper function to update a subscription record
export async function updateSubscriptionRecord(subscriptionId: string, status: string, data: any) {
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({
      status,
      data,
      updated_at: new Date().toISOString()
    })
    .eq('subscription_id', subscriptionId);
    
  if (error) {
    console.error('Error updating subscription record:', error);
    throw error;
  }
  
  return true;
} 