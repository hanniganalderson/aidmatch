import { supabase } from './supabase';
import { SubscriptionStatus } from '../contexts/SubscriptionContext';

// Check if a user has an active subscription
export async function checkSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No subscription found
        return null;
      }
      throw error;
    }

    return data.status as SubscriptionStatus;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    throw error;
  }
}

// Grant Plus access to a user (for admin use)
export async function grantPlusAccess(userId: string): Promise<void> {
  try {
    // Check if user already has a subscription record
    const { data: existingSub, error: checkError } = await supabase
      .from('subscriptions')
      .select('id, status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    // If subscription exists, update it
    if (existingSub) {
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSub.id);
        
      if (updateError) throw updateError;
    } else {
      // Create new subscription record
      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          subscription_id: `admin_granted_${Date.now()}`,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (insertError) throw insertError;
    }
  } catch (error) {
    console.error('Error granting Plus access:', error);
    throw error;
  }
}

// Revoke Plus access from a user (for admin use)
export async function revokePlusAccess(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error revoking Plus access:', error);
    throw error;
  }
}

// Clear subscription cache for a user
export function clearSubscriptionCache(userId: string): void {
  localStorage.removeItem(`subscription_${userId}`);
}

// Get subscription expiration date
export async function getSubscriptionExpirationDate(userId: string): Promise<Date | null> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('current_period_end')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    
    return data.current_period_end ? new Date(data.current_period_end) : null;
  } catch (error) {
    console.error('Error getting subscription expiration:', error);
    return null;
  }
} 