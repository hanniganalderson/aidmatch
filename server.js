// server.js - Express server for local development
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Create checkout session endpoint
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { email, subscriptionType = 'plus' } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin || 'http://localhost:5173'}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://localhost:5173'}/subscription-cancel`,
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
});

// Create portal session endpoint
app.post('/api/create-portal-session', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Get user from Supabase
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
      
    if (userError) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get subscription from Supabase
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('user_id', userData.id)
      .eq('status', 'active')
      .single();
      
    if (subscriptionError) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    // Create Stripe portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscriptionData.stripe_customer_id,
      return_url: `${req.headers.origin || 'http://localhost:5173'}/dashboard`,
    });
    
    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Portal session error:', error);
    
    return res.status(500).json({ 
      error: 'Failed to create portal session',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 