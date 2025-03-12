import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = require('stripe')(Deno.env.get('STRIPE_SECRET_KEY'));
const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  
  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }
  
  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Extract customer email and metadata
        const customerEmail = session.customer_email;
        const subscriptionId = session.subscription;
        
        if (!customerEmail || !subscriptionId) {
          console.error('Missing customer email or subscription ID');
          break;
        }
        
        // Get user ID from email
        const { data: userData, error: userError } = await supabase
          .from('auth.users')
          .select('id')
          .eq('email', customerEmail)
          .single();
          
        if (userError) {
          console.error('Error finding user:', userError);
          break;
        }
        
        const userId = userData.id;
        
        // Create subscription record
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_subscription_id: subscriptionId,
            status: 'active',
            plan: 'plus',
            current_period_start: new Date().toISOString(),
            current_period_end: null, // Will be updated when we get subscription details
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (subscriptionError) {
          console.error('Error creating subscription:', subscriptionError);
        }
        
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        
        // Update subscription status
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);
          
        if (error) {
          console.error('Error updating subscription:', error);
        }
        
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        // Update subscription status to canceled
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);
          
        if (error) {
          console.error('Error canceling subscription:', error);
        }
        
        break;
      }
    }
    
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
    
  } catch (err) {
    console.error(`Webhook error: ${err.message}`);
    return new Response(`Webhook error: ${err.message}`, { status: 400 });
  }
}); 