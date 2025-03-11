// api/stripe-webhook.js
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Super simplified handler to start with
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Return a simple success response
    return res.status(200).json({ 
      received: true, 
      message: 'Webhook endpoint working'
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(400).json({ 
      error: 'Webhook error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}