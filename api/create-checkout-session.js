// api/create-checkout-session.js
import Stripe from 'stripe';

// Your actual price ID from Stripe dashboard
const PRICE_ID = "price_1R1YV0Jpo3xPmFJPjtV3iy6p";

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize Stripe with the secret key
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      throw new Error('Missing Stripe secret key');
    }
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2025-02-24.acacia', // Updated to match your environment
    });
    
    // Get email from request body
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    // Determine the origin for success/cancel URLs
    const origin = req.headers.origin || 'https://aidmatch.co';

    // Create checkout session with absolute URLs and added session ID parameter
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
      line_items: [
        {
          price: PRICE_ID,
          quantity: 1,
        },
      ],
      metadata: {
        source: 'aidmatch_website',
        created_at: new Date().toISOString(),
      },
    });

    // Return session URL
    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return res.status(500).json({ 
      error: 'Failed to create checkout session',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}