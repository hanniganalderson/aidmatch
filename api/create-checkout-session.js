import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
  apiVersion: "2023-10-16",
});

// Your actual price ID from Stripe dashboard
const PRICE_ID = "price_1R1XL5Jpo3xPmFJP5WfjqnOZ";

serve(async (req) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
  
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers, status: 204 });
  }
  
  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Missing email" }), { 
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: email,
      success_url: `${req.headers.get("origin") || "https://aidmatch.co"}/success`,
      cancel_url: `${req.headers.get("origin") || "https://aidmatch.co"}/cancel`,
      line_items: [
        {
          price: PRICE_ID,
          quantity: 1,
        },
      ],
      // Metadata to pass through to the webhook
      metadata: {
        source: "aidmatch_website",
        created_at: new Date().toISOString(),
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...headers, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create checkout session" }),
      {
        status: 500,
        headers: { ...headers, "Content-Type": "application/json" },
      }
    );
  }
});