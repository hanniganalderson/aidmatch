import { supabase } from '../lib/supabase';

// Endpoint configuration constants
const ENDPOINTS = {
  PRODUCTION: 'https://aidmatch.app/api/create-checkout-session',
  DEVELOPMENT: 'http://localhost:3000/api/create-checkout-session',
  SUPABASE_EDGE: 'https://aidmatch.supabase.co/functions/v1/create-checkout-session'
};

// Determine the correct endpoint based on environment
const getCheckoutEndpoint = () => {
  // Always use the relative path for Vercel deployment
  return '/api/create-checkout-session';
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
    console.log(`CHECKOUT: ${message}`);
    if (onDiagnostic) onDiagnostic(message);
  };
  
  logDiagnostic(`Starting checkout for ${email} (${subscriptionType})`);
  logDiagnostic(`Using endpoint: ${endpoint}`);
  
  try {
    // Make the request with more detailed error handling
    logDiagnostic('Sending checkout request...');
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        subscriptionType
      })
    });
    
    // Handle non-200 responses with more detailed logging
    if (!response.ok) {
      const statusText = response.statusText;
      let errorText = '';
      
      try {
        // Try to get JSON error
        const errorJson = await response.json();
        errorText = JSON.stringify(errorJson);
      } catch (e) {
        // If not JSON, get text
        try {
          errorText = await response.text();
        } catch (e2) {
          errorText = 'Unable to read error response';
        }
      }
      
      logDiagnostic(`Error response (${response.status} ${statusText}): ${errorText}`);
      throw new Error(`Checkout failed: ${response.status} ${statusText}`);
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