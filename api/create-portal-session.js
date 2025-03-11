// api/create-portal-session.js
const Stripe = require('stripe');

module.exports = async (req, res) => {
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
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    // Get customer ID from request body
    const { customer_id } = req.body;

    if (!customer_id) {
      return res.status(400).json({ error: 'Missing customer_id' });
    }

    // Determine the origin for return URL
    const origin = req.headers.origin || 'https://aidmatch.co';

    // Create a billing portal session for the customer
    const session = await stripe.billingPortal.sessions.create({
      customer: customer_id,
      return_url: `${origin}/account/billing`,
    });

    // Return session URL
    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Portal session error:', error);
    return res.status(500).json({ error: 'Failed to create portal session' });
  }
};