// src/lib/checkout.ts
import { supabase } from './supabase';

/**
 * Creates a Stripe checkout session for subscription upgrade
 * @param email User's email for the checkout session
 * @returns Promise that resolves when the checkout process has started
 */
export async function createCheckoutSession(email: string): Promise<void> {
  try {
    // Call our serverless function to create a Checkout session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create checkout session');
    }

    const { url } = await response.json();
    
    // Track the checkout initiation event
    try {
      await supabase.from('user_events').insert({
        event_type: 'checkout_initiated',
        user_email: email,
        metadata: { timestamp: new Date().toISOString() }
      });
    } catch (eventError) {
      // Non-critical error, just log
      console.error('Failed to track checkout event:', eventError);
    }

    // Redirect to Stripe Checkout
    window.location.href = url;
  } catch (error) {
    console.error('Checkout error:', error);
    throw error;
  }
}