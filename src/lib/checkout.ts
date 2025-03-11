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

    // Clone the response for use in case of error
    const responseClone = response.clone();

    // First, try to parse as JSON
    let data;
    try {
      data = await response.json();
    } catch (e) {
      // If JSON parsing fails, handle as text response
      const textResponse = await responseClone.text();
      throw new Error(`Server error: ${textResponse || response.status}`);
    }

    // Check if the response was ok
    if (!response.ok) {
      throw new Error(data.error || `Error: ${response.status}`);
    }

    // Check for a valid URL
    if (!data.url) {
      throw new Error('No checkout URL returned from server');
    }
    
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
    window.location.href = data.url;
  } catch (error) {
    console.error('Checkout error:', error);
    throw error;
  }
}