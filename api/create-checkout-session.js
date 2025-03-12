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
    
    // Create a product with a unique name to avoid caching issues
    const product = await stripe.products.create({
      name: `AidMatch Plus Subscription - ${new Date().toISOString()}`,
      description: 'Monthly subscription to AidMatch Plus - $9/month',
    });
    
    // Create a price for the product
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 900, // $9.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
    });
    
    // Create Stripe checkout session with the price ID
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin || 'https://aidmatch.co'}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'https://aidmatch.co'}/subscription-cancel`,
      allow_promotion_codes: true,
    });
    
    // Return the session details
    return res.status(200).json({ 
      url: session.url,
      sessionId: session.id 
    });
  } catch (error) {
    console.error('Checkout error:', error);
    
    // Return a properly formatted error response
    return res.status(500).json({ 
      error: 'Failed to create checkout session',
      message: error.message
    });
  }
}