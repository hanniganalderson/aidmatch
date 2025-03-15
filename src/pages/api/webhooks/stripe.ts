import { supabaseAdmin } from '../../../lib/supabase-admin';
import Stripe from 'stripe';
import { getStripeSecretKey } from '../../../lib/api-keys';

// Initialize Stripe with the secret key
const stripe = new Stripe(getStripeSecretKey(), {
  apiVersion: '2023-10-16' as any, // Type assertion to bypass the version mismatch
});

// Handle webhook requests
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return res.status(500).json({ error: 'Webhook secret is not set' });
  }

  try {
    // Get the signature from headers
    const signature = req.headers['stripe-signature'];
    
    // Verify the event
    let event;
    try {
      const body = await req.text();
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`Webhook signature verification failed: ${errorMessage}`);
      return res.status(400).json({ error: `Webhook Error: ${errorMessage}` });
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Update user's subscription status in the database
      if (session.customer && session.subscription) {
        const customerId = session.customer.toString();
        const subscriptionId = session.subscription.toString();
        
        // Find the user with this customer ID
        const { data: users, error: userError } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .limit(1);
          
        if (userError || !users || users.length === 0) {
          console.error('User not found for customer ID:', customerId);
          return res.status(404).json({ error: 'User not found' });
        }
        
        const userId = users[0].id;
        
        // Update the user's subscription
        const { error: updateError } = await supabaseAdmin
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_subscription_id: subscriptionId,
            status: 'active',
            price_id: session.metadata?.priceId || null,
            quantity: 1,
            cancel_at_period_end: false,
            created_at: new Date().toISOString(),
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          });
          
        if (updateError) {
          console.error('Error updating subscription:', updateError);
          return res.status(500).json({ error: 'Failed to update subscription' });
        }
      }
    }
    
    // Return a response to acknowledge receipt of the event
    return res.json({ received: true });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook error: ${errorMessage}`);
    return res.status(500).json({ error: `Webhook Error: ${errorMessage}` });
  }
} 