import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
  apiVersion: "2023-10-16",
});

serve(async (req) => {
  try {
    const { email } = await req.json();

    if (!email) {
      return new Response("Missing email", { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: email,
      success_url: "https://aidmatch.co/success",
      cancel_url: "https://aidmatch.co/cancel",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "AidMatch Pro Plan",
              description: "Unlock premium scholarship matching.",
            },
            unit_amount: 900, // $9.00 (in cents)
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response("Error creating checkout session", { status: 500 });
  }
});