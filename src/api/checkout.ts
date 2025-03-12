import { supabase } from '../lib/supabase';

// Endpoint configuration constants
const ENDPOINTS = {
  PRODUCTION: 'https://aidmatch.app/api/create-checkout-session',
  DEVELOPMENT: 'http://localhost:3000/api/create-checkout-session',
  SUPABASE_EDGE: 'https://aidmatch.supabase.co/functions/v1/create-checkout-session'
};

// Determine the correct endpoint based on environment
const getCheckoutEndpoint = () => {
  // For local development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return ENDPOINTS.DEVELOPMENT; // Use local development server
  }
  
  // For production
  return ENDPOINTS.PRODUCTION;
};

interface CheckoutOptions {
  email: string;
  subscriptionType?: 'plus';
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
  onDiagnostic?: (message: string) => void;
}

export async function createCheckoutSession({
  email,
  subscriptionType = 'plus',
  onSuccess,
  onError,
  onDiagnostic
}: CheckoutOptions) {
  const endpoint = getCheckoutEndpoint();
  
  // Log diagnostic information
  const logDiagnostic = (message: string) => {
    // Only log in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log(`CHECKOUT: ${message}`);
    }
    if (onDiagnostic) onDiagnostic(message);
  };
  
  logDiagnostic(`Starting checkout for ${email} (${subscriptionType})`);
  logDiagnostic(`Using endpoint: ${endpoint}`);
  
  try {
    // Get auth token for authenticated requests
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    // Add authorization if we have a token
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      logDiagnostic('Using authenticated request');
    } else {
      logDiagnostic('Using unauthenticated request');
    }
    
    // Make the request
    logDiagnostic('Sending checkout request...');
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email,
        subscriptionType
      })
    });
    
    // Handle non-200 responses
    if (!response.ok) {
      const errorText = await response.text();
      logDiagnostic(`Error response (${response.status}): ${errorText}`);
      throw new Error(`Checkout failed: ${response.status} ${response.statusText}`);
    }
    
    // Parse the response
    const data = await response.json();
    logDiagnostic('Checkout successful, redirecting to Stripe');
    
    if (onSuccess) onSuccess(data.url);
    return data;
    
  } catch (error) {
    logDiagnostic(`Checkout error: ${error instanceof Error ? error.message : String(error)}`);
    if (onError) onError(error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
} 