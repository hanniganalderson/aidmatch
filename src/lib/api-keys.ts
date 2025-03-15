// This file handles API key management for the application

/**
 * Get the OpenAI API key from environment variables
 */
export function getOpenAIKey(): string {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OpenAI API key is not set in environment variables');
    throw new Error('OpenAI API key is missing');
  }
  return apiKey;
}

/**
 * Get the Stripe publishable key from environment variables
 */
export function getStripePublishableKey(): string {
  const apiKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (!apiKey) {
    console.error('Stripe publishable key is not set in environment variables');
    throw new Error('Stripe publishable key is missing');
  }
  return apiKey;
}

/**
 * Get the Stripe secret key from environment variables
 */
export function getStripeSecretKey(): string {
  const apiKey = import.meta.env.VITE_STRIPE_SECRET_KEY;
  if (!apiKey) {
    console.error('Stripe secret key is not set in environment variables');
    throw new Error('Stripe secret key is missing');
  }
  return apiKey;
}

/**
 * Get the Supabase URL from environment variables
 */
export function getSupabaseUrl(): string {
  const url = import.meta.env.VITE_SUPABASE_URL;
  if (!url) {
    console.error('Supabase URL is not set in environment variables');
    throw new Error('Supabase URL is missing');
  }
  return url;
}

/**
 * Get the Supabase anon key from environment variables
 */
export function getSupabaseAnonKey(): string {
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!key) {
    console.error('Supabase anon key is not set in environment variables');
    throw new Error('Supabase anon key is missing');
  }
  return key;
} 