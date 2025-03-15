// api/create-checkout-session.js
import Stripe from 'stripe';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Initialize Stripe with the secret key
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    const { email, subscriptionType = 'plus' } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    console.log(`Creating checkout session for ${email}`);
    
    // Get the price ID from environment variables
    const priceId = process.env.STRIPE_PLUS_PRICE_ID;
    
    if (!priceId) {
      return res.status(500).json({ error: 'Price ID not configured' });
    }
    
    // Create Stripe checkout session with the price ID
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin || 'https://aidmatch.co'}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'https://aidmatch.co'}/subscription-cancel`,
      allow_promotion_codes: true,
      // Add metadata to track the source
      metadata: {
        source: 'aidmatch_web',
        user_email: email
      }
    });
    
    // Return checkout session URL
    return res.status(200).json({ 
      url: session.url,
      sessionId: session.id 
    });
  } catch (error) {
    console.error('Checkout session creation error:', error);
    
    return res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message 
    });
  }
}