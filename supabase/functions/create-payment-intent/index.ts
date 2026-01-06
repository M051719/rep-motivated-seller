import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planId, planPrice, userId } = await req.json();

    // Validate input
    if (!planId || !planPrice || !userId) {
      throw new Error('Missing required fields: planId, planPrice, or userId');
    }

    // Validate plan price (must be positive and reasonable)
    if (planPrice < 100 || planPrice > 100000) {
      throw new Error('Invalid plan price');
    }

    console.log(`Creating payment intent for user ${userId}, plan ${planId}, amount ${planPrice}`);

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: planPrice, // Amount in cents
      currency: 'usd',
      metadata: {
        user_id: userId,
        plan_id: planId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log(`Payment intent created: ${paymentIntent.id}`);

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create payment intent' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
