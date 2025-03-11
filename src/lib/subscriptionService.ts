// src/lib/subscriptionService.ts - DIAGNOSTIC VERSION
import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

/**
 * Subscription interface representing a user's subscription record
 */
export interface Subscription {
  id: string;
  user_id: string;
  user_email?: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing' | 'unpaid';
  plan_type: 'plus' | 'pro';
  stripe_customer_id: string;
  stripe_subscription_id: string;
  created_at?: string;
  updated_at?: string;
  cancel_at_period_end?: boolean;
  current_period_end?: string;
  price_id?: string;
}

/**
 * Operation result interface for subscription operations
 */
export interface SubscriptionResult {
  success: boolean;
  data?: any;
  error?: any;
  message?: string;
}

// Utility function to create and display diagnostic overlay
function createDiagnosticOverlay(): { log: (message: string) => void, close: () => void } {
  // Create diagnostic overlay
  const diagnosticDiv = document.createElement('div');
  diagnosticDiv.style.position = 'fixed';
  diagnosticDiv.style.top = '10px';
  diagnosticDiv.style.right = '10px';
  diagnosticDiv.style.padding = '20px';
  diagnosticDiv.style.background = 'rgba(0,0,0,0.9)';
  diagnosticDiv.style.color = 'white';
  diagnosticDiv.style.fontFamily = 'monospace';
  diagnosticDiv.style.fontSize = '12px';
  diagnosticDiv.style.zIndex = '10000';
  diagnosticDiv.style.maxWidth = '80%';
  diagnosticDiv.style.maxHeight = '80%';
  diagnosticDiv.style.overflow = 'auto';
  diagnosticDiv.style.borderRadius = '5px';
  diagnosticDiv.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
  
  // Create title
  const titleDiv = document.createElement('div');
  titleDiv.textContent = '🔍 DIAGNOSTIC LOG';
  titleDiv.style.fontWeight = 'bold';
  titleDiv.style.marginBottom = '10px';
  titleDiv.style.fontSize = '14px';
  titleDiv.style.borderBottom = '1px solid rgba(255,255,255,0.3)';
  titleDiv.style.paddingBottom = '5px';
  diagnosticDiv.appendChild(titleDiv);
  
  // Create content container
  const contentDiv = document.createElement('div');
  diagnosticDiv.appendChild(contentDiv);
  
  // Create close button
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '10px';
  closeButton.style.right = '10px';
  closeButton.style.padding = '3px 8px';
  closeButton.style.background = 'rgba(255,255,255,0.2)';
  closeButton.style.border = 'none';
  closeButton.style.borderRadius = '3px';
  closeButton.style.color = 'white';
  closeButton.style.cursor = 'pointer';
  closeButton.onclick = () => document.body.removeChild(diagnosticDiv);
  diagnosticDiv.appendChild(closeButton);
  
  document.body.appendChild(diagnosticDiv);
  
  // Log function
  function log(message: string) {
    console.log(message);
    const logLine = document.createElement('div');
    logLine.textContent = `${new Date().toISOString().substr(11, 8)}: ${message}`;
    contentDiv.appendChild(logLine);
    // Auto-scroll to bottom
    diagnosticDiv.scrollTop = diagnosticDiv.scrollHeight;
  }
  
  return { 
    log,
    close: () => {
      if (diagnosticDiv.parentNode) {
        document.body.removeChild(diagnosticDiv);
      }
    }
  };
}

/**
 * Creates a Stripe checkout session for subscription upgrade with detailed diagnostics
 * @param email User's email for the checkout session
 * @returns Promise that resolves when the checkout process has started
 */
export async function createCheckoutSession(email: string): Promise<void> {
  const diagnostic = createDiagnosticOverlay();
  const { log } = diagnostic;
  
  log('🚀 Starting checkout diagnostic...');
  log(`📧 Email: ${email}`);
  
  try {
    // Check environment
    log('🌐 Environment check:');
    log(`URL: ${window.location.href}`);
    log(`User Agent: ${navigator.userAgent}`);
    
    // Try direct URL to see if the server is accessible at all
    log('🔄 Testing server connectivity...');
    
    try {
      const pingResponse = await fetch('/api/ping', { 
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' }
      });
      log(`Ping response: ${pingResponse.status} ${pingResponse.statusText}`);
    } catch (pingError) {
      log(`⚠️ Ping failed: ${pingError instanceof Error ? pingError.message : String(pingError)}`);
    }
    
    // Define possible API endpoints to try in order
    const endpoints: string[] = [
      '/api/create-checkout-session',                // Next.js API route
      '/.netlify/functions/create-checkout-session', // Netlify function
      '/supabase/functions/create-checkout-session', // Supabase edge function
      '/stripe/create-checkout-session',             // Custom route
      '/functions/create-checkout-session',          // Firebase function
      `${window.location.origin}/api/create-checkout-session`, // Absolute URL
      `/create-checkout-session`,                    // Root path
      `/checkout`,                                   // Simple path
    ];
    
    log(`📝 Will try ${endpoints.length} possible endpoints`);
    
    let response: Response | null = null;
    let lastError: Error | null = null;
    let successfulEndpoint: string | null = null;
    
    // Try each endpoint until one works
    for (const endpoint of endpoints) {
      log(`🔍 Trying endpoint: ${endpoint}`);
      
      try {
        // Add a random query parameter to avoid caching
        const cacheBuster = `?cb=${Date.now()}`;
        const fullUrl = `${endpoint}${cacheBuster}`;
        
        // Use a timeout to avoid hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        log(`📤 Sending POST request to ${fullUrl}...`);
        
        response = await fetch(fullUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
          },
          body: JSON.stringify({ email }),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        log(`📥 Response from ${endpoint}: ${response.status} ${response.statusText}`);
        
        // Log response headers for debugging
        const headerEntries = Array.from(response.headers.entries());
        if (headerEntries.length > 0) {
          log(`Response headers: ${JSON.stringify(Object.fromEntries(headerEntries))}`);
        }
        
        // If we get a successful response, save it and break
        if (response.ok) {
          successfulEndpoint = endpoint;
          log(`✅ SUCCESS with endpoint: ${endpoint}`);
          break;
        } else if (response.status !== 404) {
          // If we get an error that's not a 404, still break (it's a valid endpoint with an error)
          successfulEndpoint = endpoint;
          log(`⚠️ Non-404 error with endpoint: ${endpoint} (status ${response.status})`);
          break;
        }
        
        // If we get a 404, continue to the next endpoint
        log(`❌ 404 Not Found for ${endpoint}, will try next endpoint`);
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        log(`⚠️ Network error with ${endpoint}: ${errorMsg}`);
        lastError = e instanceof Error ? e : new Error(String(e));
      }
    }
    
    // If we didn't get any response, throw the last error
    if (!response) {
      const errorMsg = lastError ? lastError.message : 'Failed to connect to any API endpoint';
      log(`❌ FATAL: ${errorMsg}`);
      throw lastError || new Error('Failed to connect to any API endpoint');
    }

    // Try to get the response text for diagnostics
    log('📄 Attempting to read response body...');
    const responseText = await response.text();
    log(`Response body (first 200 chars): ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`);
    
    // Parse the JSON
    let data;
    try {
      data = JSON.parse(responseText);
      log('✅ Successfully parsed JSON response');
    } catch (jsonError) {
      log(`❌ Failed to parse JSON: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`);
      throw new Error(`Server error: Invalid JSON response from ${successfulEndpoint}`);
    }

    // Check if the response was ok
    if (!response.ok) {
      const errorMessage = data.error || `Error: ${response.status}`;
      log(`❌ API error: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    // Check for a valid URL
    if (!data.url) {
      log('❌ ERROR: No checkout URL returned from server');
      throw new Error('No checkout URL returned from server');
    }
    
    log(`✅ Got checkout URL: ${data.url.substring(0, 40)}...`);
    
    // Track the checkout initiation event
    try {
      log('📊 Logging checkout event to Supabase...');
      await supabase.from('user_events').insert({
        event_type: 'checkout_initiated',
        user_email: email,
        metadata: { 
          timestamp: new Date().toISOString(),
          successful_endpoint: successfulEndpoint
        }
      });
      log('✅ Successfully logged checkout event to Supabase');
    } catch (eventError) {
      log(`⚠️ Failed to track checkout event: ${eventError instanceof Error ? eventError.message : String(eventError)}`);
    }

    // Set a brief delay to ensure logs are visible before redirect
    log(`⏱️ Redirecting to Stripe in 3 seconds...`);
    
    // Store successful endpoint in localStorage for future use
    if (successfulEndpoint) {
      try {
        localStorage.setItem('successfulCheckoutEndpoint', successfulEndpoint);
        log(`💾 Saved successful endpoint for future use: ${successfulEndpoint}`);
      } catch (storageError) {
        log(`⚠️ Unable to save endpoint to localStorage: ${storageError instanceof Error ? storageError.message : String(storageError)}`);
      }
    }
    
    setTimeout(() => {
      log('🚀 Redirecting now!');
      window.location.href = data.url;
    }, 3000);
    
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    log(`❌ FATAL ERROR: ${errorMsg}`);
    console.error('Checkout error:', error);
    
    // Keep the diagnostic window visible for errors
    throw error;
  }
}

/**
 * Create a Stripe customer portal session for managing subscriptions
 * @param customerId The Stripe customer ID
 * @returns Promise that resolves with the portal URL
 */
export async function createCustomerPortalSession(customerId: string): Promise<string> {
  const diagnostic = createDiagnosticOverlay();
  const { log } = diagnostic;
  
  log('🚀 Starting portal session diagnostic...');
  log(`👤 Customer ID: ${customerId}`);
  
  try {
    // Try to use the endpoint we've successfully used before
    let successfulEndpoint: string | null = null;
    try {
      successfulEndpoint = localStorage.getItem('successfulCheckoutEndpoint');
      if (successfulEndpoint) {
        log(`💾 Found previously successful endpoint: ${successfulEndpoint}`);
        // Convert checkout endpoint to portal endpoint
        successfulEndpoint = successfulEndpoint.replace('create-checkout-session', 'create-portal-session');
        log(`🔄 Converted to portal endpoint: ${successfulEndpoint}`);
      }
    } catch (storageError) {
      log(`⚠️ Unable to access localStorage: ${storageError instanceof Error ? storageError.message : String(storageError)}`);
    }
    
    // Define possible API endpoints to try in order
    const endpoints: string[] = [];
    
    // Add the previously successful endpoint first if available
    if (successfulEndpoint) {
      endpoints.push(successfulEndpoint);
    }
    
    // Add all other potential endpoints
    endpoints.push(
      '/api/create-portal-session',                // Next.js API route
      '/.netlify/functions/create-portal-session', // Netlify function
      '/supabase/functions/create-portal-session', // Supabase edge function
      '/stripe/create-portal-session',             // Custom route
      '/functions/create-portal-session',          // Firebase function
      `${window.location.origin}/api/create-portal-session`, // Absolute URL
      '/create-portal-session',                    // Root path
      '/portal',                                   // Simple path
    );
    
    log(`📝 Will try ${endpoints.length} possible endpoints`);
    
    let response: Response | null = null;
    let lastError: Error | null = null;
    let workingEndpoint: string | null = null;
    
    // Try each endpoint until one works
    for (const endpoint of endpoints) {
      log(`🔍 Trying endpoint: ${endpoint}`);
      
      try {
        // Add a random query parameter to avoid caching
        const cacheBuster = `?cb=${Date.now()}`;
        const fullUrl = `${endpoint}${cacheBuster}`;
        
        // Use a timeout to avoid hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        response = await fetch(fullUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
          },
          body: JSON.stringify({ customer_id: customerId }),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        log(`📥 Response from ${endpoint}: ${response.status} ${response.statusText}`);
        
        // If we get a successful response, save it and break
        if (response.ok) {
          workingEndpoint = endpoint;
          log(`✅ SUCCESS with endpoint: ${endpoint}`);
          break;
        } else if (response.status !== 404) {
          // If we get an error that's not a 404, still break (it's a valid endpoint with an error)
          workingEndpoint = endpoint;
          log(`⚠️ Non-404 error with endpoint: ${endpoint} (status ${response.status})`);
          break;
        }
        
        // If we get a 404, continue to the next endpoint
        log(`❌ 404 Not Found for ${endpoint}, will try next endpoint`);
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        log(`⚠️ Network error with ${endpoint}: ${errorMsg}`);
        lastError = e instanceof Error ? e : new Error(String(e));
      }
    }
    
    // If we didn't get any response, throw the last error
    if (!response) {
      const errorMsg = lastError ? lastError.message : 'Failed to connect to any API endpoint';
      log(`❌ FATAL: ${errorMsg}`);
      throw lastError || new Error('Failed to connect to any API endpoint');
    }

    // Try to get the response text for diagnostics
    log('📄 Attempting to read response body...');
    const responseText = await response.text();
    log(`Response body (first 200 chars): ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`);
    
    // Parse the JSON
    let data;
    try {
      data = JSON.parse(responseText);
      log('✅ Successfully parsed JSON response');
    } catch (jsonError) {
      log(`❌ Failed to parse JSON: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`);
      throw new Error(`Server error: Invalid JSON response from ${workingEndpoint}`);
    }

    if (!response.ok) {
      const errorMessage = data.error || `Error: ${response.status}`;
      log(`❌ API error: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    if (!data.url) {
      log('❌ ERROR: No portal URL returned from server');
      throw new Error('No portal URL returned from server');
    }
    
    log(`✅ Got portal URL: ${data.url.substring(0, 40)}...`);
    
    // Store successful endpoint in localStorage for future use
    if (workingEndpoint) {
      try {
        localStorage.setItem('successfulPortalEndpoint', workingEndpoint);
        log(`💾 Saved successful portal endpoint for future use: ${workingEndpoint}`);
      } catch (storageError) {
        log(`⚠️ Unable to save endpoint to localStorage: ${storageError instanceof Error ? storageError.message : String(storageError)}`);
      }
    }
    
    // Set a brief delay to ensure logs are visible before redirect
    log(`⏱️ Redirecting to Stripe Portal in 3 seconds...`);
    
    // Return the URL
    setTimeout(() => {
      log('🚀 Redirecting now!');
      diagnostic.close();
      window.location.href = data.url;
    }, 3000);
    
    return data.url;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    log(`❌ FATAL ERROR: ${errorMsg}`);
    console.error('Portal session error:', error);
    throw error;
  }
}

/**
 * Get a user's active subscription from the database
 * @param userId User ID to check subscription for
 * @returns The subscription record or null
 */
export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user subscription:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Exception in getUserSubscription:', error);
    return null;
  }
}

/**
 * Check if a user has an active subscription
 * @param userId User ID to check
 * @returns Boolean indicating if user has an active subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  return subscription !== null;
}

/**
 * Get all subscriptions for a user, including inactive ones
 * @param userId User ID to check
 * @returns Array of subscription records
 */
export async function getAllUserSubscriptions(userId: string): Promise<Subscription[]> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching all user subscriptions:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Exception in getAllUserSubscriptions:', error);
    return [];
  }
}

/**
 * Creates a test subscription record for a user - for development purposes
 * @param userId User ID to create subscription for
 * @param userEmail User email
 * @returns Result of operation
 */
export async function createTestSubscription(userId: string, userEmail: string): Promise<SubscriptionResult> {
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
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
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

/**
 * Simple function to create a test subscription with only the required fields
 * @param userId User ID to create subscription for
 * @returns Result of operation
 */
export async function createSimpleSubscription(userId: string): Promise<SubscriptionResult> {
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

/**
 * Cancel a subscription
 * @param subscriptionId The subscription ID to cancel
 * @returns Result of operation
 */
export async function cancelSubscription(subscriptionId: string): Promise<SubscriptionResult> {
  try {
    // Update subscription status
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        cancel_at_period_end: true,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscriptionId)
      .select()
      .single();
    
    if (error) {
      console.error('Error canceling subscription:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Exception in cancelSubscription:', error);
    return { success: false, error };
  }
}

/**
 * Utility to check subscription table structure and content - for admin purposes
 */
export async function checkSubscriptionDatabase(): Promise<SubscriptionResult> {
  try {
    // Check subscriptions table content
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('subscriptions')
      .select('*');
    
    if (subscriptionsError) {
      if (subscriptionsError.code === 'PGRST116') {
        return {
          success: false,
          error: subscriptionsError,
          message: 'Subscriptions table does not exist'
        };
      }
      
      console.error('Error querying subscriptions:', subscriptionsError);
      return { 
        success: false, 
        error: subscriptionsError,
        message: 'Failed to query subscriptions'
      };
    }
    
    return {
      success: true,
      data: {
        subscriptionCount: subscriptions?.length || 0,
        subscriptions
      }
    };
  } catch (error) {
    console.error('Exception in checkSubscriptionDatabase:', error);
    return { 
      success: false, 
      error,
      message: 'Exception occurred while checking database'
    };
  }
}

/**
 * Track a subscription event
 * @param userId User ID
 * @param eventType Type of event
 * @param metadata Additional event data
 */
export async function trackSubscriptionEvent(
  userId: string, 
  eventType: 'checkout_initiated' | 'checkout_success' | 'subscription_canceled' | 'subscription_updated',
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    await supabase.from('user_events').insert({
      user_id: userId,
      event_type: eventType,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error(`Error tracking subscription event (${eventType}):`, error);
  }
}

/**
 * Get a formatted estimate of the next billing date
 * @param subscription The subscription object
 * @returns Formatted date string
 */
export function formatNextBillingDate(subscription: Subscription | null): string {
  if (!subscription?.current_period_end && !subscription?.updated_at) {
    return 'Unknown';
  }
  
  // Use current_period_end if available, otherwise estimate from updated_at
  const dateStr = subscription.current_period_end || subscription.updated_at;
  if (!dateStr) return 'Unknown';
  
  const date = new Date(dateStr);
  
  // If using updated_at, estimate next billing as 1 month later
  if (!subscription.current_period_end && subscription.updated_at) {
    date.setMonth(date.getMonth() + 1);
  }
  
  return date.toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

/**
 * Reset or reactivate a test subscription for development
 * @param userId User ID
 */
export async function resetTestSubscription(userId: string): Promise<SubscriptionResult> {
  try {
    // Delete existing subscriptions for this user
    const { error: deleteError } = await supabase
      .from('subscriptions')
      .delete()
      .eq('user_id', userId);
    
    if (deleteError) {
      console.error('Error deleting existing subscriptions:', deleteError);
      return { success: false, error: deleteError };
    }
    
    // Create a new test subscription
    return createTestSubscription(userId, 'test@example.com');
  } catch (error) {
    console.error('Exception in resetTestSubscription:', error);
    return { success: false, error };
  }
}