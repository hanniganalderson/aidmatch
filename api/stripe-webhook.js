// api/stripe-webhook.js
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { buffer } from 'micro';

// Configuration for raw body parsing
export const config = {
  api: {
    bodyParser: false
  }
};

// Helper function to get raw body
async function getRawBody(req) {
  const buf = await buffer(req);
  return buf;
}

// Handler for checkout session completion
async function handleCheckoutSessionCompleted(session, supabase) {
  try {
    // Extract data from the session
    const customerId = session.customer;
    const subscriptionId = session.subscription;
    const customerEmail = session.customer_details?.email;
    
    if (!customerId || !customerEmail || !subscriptionId) {
      throw new Error("Missing required data from checkout session");
    }

    console.log(`Processing subscription for ${customerEmail}`);
    
    // Find the user by email
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', customerEmail)
      .limit(1);

    if (error) {
      throw new Error(`Error finding user: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      throw new Error(`No user found with email: ${customerEmail}`);
    }
    
    const userId = data[0].id;
    
    // Create or update subscription record
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        status: "active",
        plan_type: 'plus',
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (subscriptionError) {
      throw new Error(`Error updating subscription: ${subscriptionError.message}`);
    }

    // Log the event
    await supabase.from('user_events').insert({
      user_id: userId,
      user_email: customerEmail,
      event_type: 'subscription_created',
      metadata: { 
        subscription_id: subscriptionId,
        timestamp: new Date().toISOString()
      }
    });

    console.log(`Subscription created successfully for user ${userId}`);
    return true;
  } catch (error) {
    console.error(`Error handling checkout session: ${error.message}`);
    throw error;
  }
}

// Handler for subscription updates
async function handleSubscriptionUpdated(subscription, supabase) {
  try {
    const subscriptionId = subscription.id;
    const status = subscription.status;
    
    console.log(`Updating subscription ${subscriptionId} with status ${status}`);
    
    // Find the subscription in our database
    const { data, error } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscriptionId)
      .limit(1);
    
    if (error) {
      throw new Error(`Error finding subscription: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      throw new Error(`No subscription found with ID: ${subscriptionId}`);
    }
    
    const userId = data[0].user_id;
    
    // Update the subscription status
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId);
    
    if (updateError) {
      throw new Error(`Error updating subscription: ${updateError.message}`);
    }
    
    // Log the event
    await supabase.from('user_events').insert({
      user_id: userId,
      event_type: 'subscription_updated',
      metadata: {
        subscription_id: subscriptionId,
        status: status,
        timestamp: new Date().toISOString()
      }
    });
    
    console.log(`Subscription ${subscriptionId} updated to ${status}`);
    return true;
  } catch (error) {
    console.error(`Error handling subscription update: ${error.message}`);
    throw error;
  }
}

// Handler for subscription deletion
async function handleSubscriptionDeleted(subscription, supabase) {
  try {
    const subscriptionId = subscription.id;
    
    console.log(`Processing subscription cancellation for ${subscriptionId}`);
    
    // Find the subscription in our database
    const { data, error } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscriptionId)
      .limit(1);
    
    if (error) {
      throw new Error(`Error finding subscription: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      throw new Error(`No subscription found with ID: ${subscriptionId}`);
    }
    
    const userId = data[0].user_id;
    
    // Update the subscription status to canceled
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId);
    
    if (updateError) {
      throw new Error(`Error updating subscription: ${updateError.message}`);
    }
    
    // Log the event
    await supabase.from('user_events').insert({
      user_id: userId,
      event_type: 'subscription_canceled',
      metadata: {
        subscription_id: subscriptionId,
        timestamp: new Date().toISOString()
      }
    });
    
    console.log(`Subscription ${subscriptionId} marked as canceled`);
    return true;
  } catch (error) {
    console.error(`Error handling subscription deletion: ${error.message}`);
    throw error;
  }
}

// Main webhook handler
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const signature = req.headers['stripe-signature'];
  
  if (!signature) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  try {
    // Get raw body buffer for signature verification
    const rawBody = await getRawBody(req);
    
    // Initialize Stripe with secret key
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!stripeKey || !webhookSecret) {
      throw new Error('Missing required environment variables');
    }
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2025-02-24.acacia',
    });
    
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verify the webhook signature
    const event = stripe.webhooks.constructEvent(
      rawBody, 
      signature, 
      webhookSecret
    );
    
    console.log(`Webhook received: ${event.type}`);
    
    // Handle specific event types
    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutSessionCompleted(event.data.object, supabase);
        break;
      }
      
      case 'customer.subscription.updated': {
        await handleSubscriptionUpdated(event.data.object, supabase);
        break;
      }
      
      case 'customer.subscription.deleted': {
        await handleSubscriptionDeleted(event.data.object, supabase);
        break;
      }
      
      // Process payment_intent.succeeded if needed
      case 'payment_intent.succeeded': {
        console.log('Payment intent succeeded (for record keeping)');
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error(`Webhook error: ${error.message}`);
    return res.status(400).json({ 
      error: 'Webhook error', 
      message: error.message 
    });
  }
}