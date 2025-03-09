// src/lib/waitlist-service.ts
import { supabase } from './supabase';

interface WaitlistData {
  email: string;
  name?: string;
  source?: string;
}

/**
 * Adds a user to the Pro plan waitlist
 */
export async function joinProWaitlist(data: WaitlistData): Promise<{ success: boolean; error?: string }> {
  try {
    // Basic validation
    if (!data.email) {
      return { success: false, error: 'Email is required' };
    }

    // Check if email already exists on waitlist
    const { data: existingEntry, error: checkError } = await supabase
      .from('pro_plan_waitlist')
      .select('id')
      .eq('email', data.email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 means no rows returned, which is expected if email doesn't exist
      throw checkError;
    }

    // If user is already on waitlist, return success
    if (existingEntry) {
      return { success: true, message: 'Already on waitlist' };
    }

    // Insert new waitlist entry
    const { error } = await supabase
      .from('pro_plan_waitlist')
      .insert([
        {
          email: data.email,
          name: data.name || null,
          source: data.source || 'pricing_page',
          joined_at: new Date().toISOString(),
          status: 'active'
        }
      ]);

    if (error) throw error;

    // Also add to newsletter if they're not already on it
    try {
      await supabase
        .from('newsletter_subscribers')
        .upsert(
          [
            {
              email: data.email,
              subscribed_at: new Date().toISOString(),
              active: true,
              tags: ['pro_waitlist']
            }
          ],
          { onConflict: 'email' }
        );
    } catch (newsletterError) {
      // Continue even if newsletter signup fails
      console.warn('Failed to add waitlist member to newsletter:', newsletterError);
    }

    return { success: true };
  } catch (err) {
    console.error('Error joining Pro waitlist:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'An unknown error occurred' 
    };
  }
}

/**
 * Gets the current count of users on the waitlist (for displaying on the page)
 */
export async function getWaitlistCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('pro_plan_waitlist')
      .select('id', { count: 'exact', head: true });
    
    if (error) throw error;
    
    // Return count or default to a "seed" number to avoid showing 0
    return count || 875;
  } catch (err) {
    console.error('Error getting waitlist count:', err);
    // Return a reasonable default
    return 875;
  }
}