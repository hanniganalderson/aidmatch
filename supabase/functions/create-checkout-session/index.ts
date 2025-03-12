// supabase/functions/create-checkout-session/index.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createCheckoutSession(req, res) {
  try {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Validate request method
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { email, subscriptionType } = req.body; // Expect subscription type in the request

    // Validate email and subscription type
    if (!email || typeof email !== 'string' || !subscriptionType) {
      return res.status(400).json({ error: 'Invalid or missing email or subscription type' });
    }

    // Determine price ID based on subscription type
    const priceId = subscriptionType === 'plus' ? process.env.STRIPE_PLUS_PLAN_PRICE_ID : process.env.STRIPE_FREE_PLAN_PRICE_ID;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      success_url: `${process.env.SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL}/cancel`,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      allow_promotion_codes: true,
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

module.exports = createCheckoutSession;