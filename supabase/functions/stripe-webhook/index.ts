import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2024-11-20.acacia",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    console.error("Missing signature or webhook secret");
    return new Response("Missing signature or secret", { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret,
    );

    console.log(`Received Stripe event: ${event.type}, ID: ${event.id}`);

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const userId = paymentIntent.metadata.user_id;
        const planId = paymentIntent.metadata.plan_id;

        if (!userId || !planId) {
          console.error("Missing user_id or plan_id in payment metadata");
          break;
        }

        // Update subscription in database
        const { error } = await supabase.from("subscriptions").upsert({
          user_id: userId,
          tier: planId,
          status: "active",
          stripe_subscription_id: paymentIntent.id,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) {
          console.error("Database update error:", error);
        } else {
          console.log(
            `✅ Updated subscription for user ${userId} to ${planId}`,
          );
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.user_id;

        if (!userId) {
          console.error("Missing user_id in subscription metadata");
          break;
        }

        const { error } = await supabase.from("subscriptions").upsert({
          user_id: userId,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          current_period_start: new Date(
            subscription.current_period_start * 1000,
          ).toISOString(),
          current_period_end: new Date(
            subscription.current_period_end * 1000,
          ).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        });

        if (error) {
          console.error("Database update error:", error);
        } else {
          console.log(
            `✅ Subscription ${subscription.status} for user ${userId}`,
          );
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.user_id;

        if (!userId) {
          console.error("Missing user_id in subscription metadata");
          break;
        }

        const { error } = await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            tier: "free",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        if (error) {
          console.error("Database update error:", error);
        } else {
          console.log(`✅ Canceled subscription for user ${userId}`);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Payment succeeded for invoice ${invoice.id}`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.error(`❌ Payment failed for invoice ${invoice.id}`);

        // Optionally update subscription status to 'past_due'
        if (invoice.subscription) {
          await supabase
            .from("subscriptions")
            .update({ status: "past_due" })
            .eq("stripe_subscription_id", invoice.subscription);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
