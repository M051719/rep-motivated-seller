# 🔵 Stripe Integration Guide

Complete step-by-step guide for integrating Stripe payment processing into your real estate platform.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Account Setup](#account-setup)
3. [Product Configuration](#product-configuration)
4. [Frontend Integration](#frontend-integration)
5. [Backend Integration](#backend-integration)
6. [Webhook Configuration](#webhook-configuration)
7. [Testing](#testing)
8. [Going Live](#going-live)
9. [Troubleshooting](#troubleshooting)

---

## Overview

### What is Stripe?

Stripe is a payment processing platform that handles credit/debit card payments securely. It's PCI DSS Level 1 compliant, meaning card data never touches your servers.

### Why Stripe?

- ✅ **Security**: PCI compliant, encrypted
- ✅ **Easy Integration**: React components available
- ✅ **Recurring Billing**: Built-in subscription management
- ✅ **Global**: Supports 135+ currencies
- ✅ **Developer Friendly**: Excellent docs and tools

### Pricing

- **2.9% + $0.30** per successful card charge
- **0.5%** additional for international cards
- **No setup fees**, no monthly fees

---

## Account Setup

### 1. Create Stripe Account

1. Go to [stripe.com/register](https://stripe.com/register)
2. Enter your email and create password
3. Verify your email
4. Complete business information:
   - Business type (LLC, Corporation, etc.)
   - Tax ID (EIN)
   - Bank account for payouts
   - Business address

### 2. Activate Test Mode

1. Click "Developers" in top right
2. Toggle "Test Mode" to ON
3. You'll see test data in dashboard

### 3. Get API Keys

1. Go to **Developers > API Keys**
2. Find two keys:

**Publishable Key (Frontend)**

```
pk_test_51QrVNcH2rnPeJ...
```

- Safe to expose in client-side code
- Used to initialize Stripe.js
- Starts with `pk_test_` in test mode

**Secret Key (Backend)**

```
sk_test_51QrVNcH2rnPeJ...
```

- ⚠️ **NEVER expose to clients**
- Used in server/Edge Functions
- Starts with `sk_test_` in test mode

### 4. Install Stripe CLI (Optional but Recommended)

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop install stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.0/stripe_1.19.0_linux_x86_64.tar.gz
tar -xvf stripe_1.19.0_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/

# Login
stripe login
```

---

## Product Configuration

### Create Products in Dashboard

#### Premium Tier ($97/month)

1. Go to **Products > Create Product**
2. Fill in details:
   ```
   Name: Premium Tier
   Description: 100 direct mail postcards per month + AI tools
   Pricing Model: Recurring
   Price: $97.00 USD
   Billing Period: Monthly
   ```
3. Click **Save product**
4. Copy the **Price ID** (starts with `price_`)
5. Save as `STRIPE_PREMIUM_PRICE_ID` in your `.env`

#### Elite Tier ($297/month)

1. Create another product:
   ```
   Name: Elite Tier
   Description: Unlimited direct mail + white-glove service
   Pricing Model: Recurring
   Price: $297.00 USD
   Billing Period: Monthly
   ```
2. Copy the **Price ID**
3. Save as `STRIPE_ELITE_PRICE_ID` in your `.env`

### Product Settings

Enable these for both products:

- ✅ **Require customer's billing address**
- ✅ **Require email address**
- ✅ **Send invoice emails automatically**
- ✅ **Send receipt emails for one-off payments**

---

## Frontend Integration

### 1. Install Dependencies

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 2. Configure Environment

Create `.env.development`:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51QrVNcH2rnPeJ...
STRIPE_SECRET_KEY=sk_test_51QrVNcH2rnPeJ...
STRIPE_PREMIUM_PRICE_ID=price_1234567890
STRIPE_ELITE_PRICE_ID=price_0987654321
```

### 3. Use StripeCheckout Component

The `StripeCheckout.tsx` component is already created. Use it like this:

```tsx
import StripeCheckout from "../components/payments/StripeCheckout";

function PricingPage() {
  return (
    <div>
      {/* Premium Tier */}
      <StripeCheckout
        planId="premium"
        planName="Premium Tier"
        planPrice={97}
        onSuccess={() => navigate("/dashboard")}
        onCancel={() => navigate("/pricing")}
      />

      {/* Elite Tier */}
      <StripeCheckout
        planId="elite"
        planName="Elite Tier"
        planPrice={297}
        onSuccess={() => navigate("/dashboard")}
        onCancel={() => navigate("/pricing")}
      />
    </div>
  );
}
```

### 4. Component Flow

```
User clicks "Subscribe"
  → StripeCheckout calls create-payment-intent Edge Function
  → Edge Function creates PaymentIntent with Stripe API
  → Returns clientSecret to frontend
  → Stripe Elements loads payment form
  → User enters card details
  → User clicks "Pay"
  → Stripe processes payment
  → Success: Update database, redirect to success page
  → Failure: Show error message, allow retry
```

---

## Backend Integration

### 1. Create Edge Function: create-payment-intent

Create `supabase/functions/create-payment-intent/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2024-11-20.acacia",
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planId, planPrice, userId } = await req.json();

    // Validate input
    if (!planId || !planPrice || !userId) {
      throw new Error("Missing required fields");
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: planPrice, // Amount in cents
      currency: "usd",
      metadata: {
        user_id: userId,
        plan_id: planId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
```

### 2. Deploy Edge Function

```bash
supabase functions deploy create-payment-intent
```

### 3. Set Supabase Secrets

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_51QrVNcH2rnPeJ...
```

### 4. Test Edge Function

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/create-payment-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "planId": "premium",
    "planPrice": 9700,
    "userId": "test-user-id"
  }'
```

Expected response:

```json
{
  "clientSecret": "pi_xxxxx_secret_xxxxx"
}
```

---

## Webhook Configuration

### Why Webhooks?

Webhooks notify your backend when payments succeed, subscriptions are created/updated/canceled, etc. They're essential for keeping your database in sync.

### 1. Create Webhook Edge Function

Create `supabase/functions/stripe-webhook/index.ts`:

```typescript
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
    return new Response("Missing signature or secret", { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret,
    );

    console.log("Received event:", event.type);

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const userId = paymentIntent.metadata.user_id;
        const planId = paymentIntent.metadata.plan_id;

        // Update subscription in database
        await supabase.from("subscriptions").upsert({
          user_id: userId,
          tier: planId,
          status: "active",
          stripe_subscription_id: paymentIntent.id,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        });

        console.log(`Updated subscription for user ${userId} to ${planId}`);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const userId = subscription.metadata.user_id;

        await supabase.from("subscriptions").upsert({
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
        });

        console.log(`Subscription ${subscription.status} for user ${userId}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const userId = subscription.metadata.user_id;

        await supabase
          .from("subscriptions")
          .update({ status: "canceled", tier: "free" })
          .eq("user_id", userId);

        console.log(`Canceled subscription for user ${userId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
```

### 2. Deploy Webhook Function

```bash
supabase functions deploy stripe-webhook
```

### 3. Configure Webhook in Stripe Dashboard

1. Go to **Developers > Webhooks**
2. Click **Add endpoint**
3. Enter URL:
   ```
   https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook
   ```
4. Select events:
   - ✅ `payment_intent.succeeded`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)

### 4. Set Webhook Secret

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### 5. Test Webhook

In Stripe Dashboard:

1. Go to **Developers > Webhooks**
2. Click on your webhook
3. Click **Send test webhook**
4. Select `payment_intent.succeeded`
5. Click **Send test webhook**

Check logs:

```bash
supabase functions logs stripe-webhook --tail
```

You should see:

```
Received event: payment_intent.succeeded
Updated subscription for user test-user to premium
```

---

## Testing

### Test Cards

**Success**

```
Card: 4242 4242 4242 4242
Expiry: 12/34
CVV: 123
ZIP: 12345
```

**Decline (Generic)**

```
Card: 4000 0000 0000 0002
```

**Insufficient Funds**

```
Card: 4000 0000 0000 9995
```

**3D Secure Required**

```
Card: 4000 0025 0000 3155
(Enter any code in test mode)
```

### Test Flow

1. Navigate to pricing page
2. Click "Subscribe to Premium"
3. Enter test card: `4242 4242 4242 4242`
4. Enter future expiry: `12/34`
5. Enter any CVV: `123`
6. Click "Subscribe Now"
7. ✅ Payment should succeed
8. Check database:
   ```sql
   SELECT * FROM subscriptions
   WHERE user_id = 'your-user-id';
   ```
9. Verify `tier = 'premium'` and `status = 'active'`

### Test Declined Payment

1. Use declined card: `4000 0000 0000 0002`
2. ❌ Should show error: "Your card was declined"
3. User should be able to try again

### Test 3D Secure

1. Use 3D Secure card: `4000 0025 0000 3155`
2. Modal should pop up asking for authentication
3. Enter any code (test mode)
4. Payment should succeed

---

## Going Live

### 1. Switch to Live Mode

In Stripe Dashboard:

1. Complete business verification
2. Add bank account for payouts
3. Toggle "Live Mode" ON

### 2. Get Live API Keys

1. Go to **Developers > API Keys**
2. Copy **live** publishable key (starts with `pk_live_`)
3. Copy **live** secret key (starts with `sk_live_`)

### 3. Update Production Environment

Update `.env.production`:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
```

Set Supabase production secrets:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxxxx --project-ref YOUR_PROD_PROJECT
```

### 4. Create Live Webhook

1. Go to **Developers > Webhooks**
2. **Add endpoint** (for live mode)
3. Enter production URL:
   ```
   https://YOUR_PROD_PROJECT.supabase.co/functions/v1/stripe-webhook
   ```
4. Select same events as test webhook
5. Copy live webhook secret
6. Set in production:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx --project-ref YOUR_PROD_PROJECT
   ```

### 5. Make Test Payment

⚠️ **This will charge a real card!**

1. Use a real card (not test card)
2. Use small amount first ($1)
3. Complete payment
4. Verify in Stripe Dashboard
5. Verify in database
6. Refund test payment

### 6. Monitor

- Check **Stripe Dashboard > Payments** daily
- Set up email alerts for failed payments
- Monitor webhook delivery rate (should be >99%)

---

## Troubleshooting

### "Invalid API Key"

**Problem**: Wrong API key or key not set

**Solution**:

```bash
# Check key is set
echo $VITE_STRIPE_PUBLISHABLE_KEY

# Restart dev server
npm run dev
```

### "Webhook Signature Verification Failed"

**Problem**: Webhook secret doesn't match

**Solution**:

```bash
# Get webhook secret from Stripe Dashboard
# Set in Supabase
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Redeploy function
supabase functions deploy stripe-webhook
```

### "Payment Succeeded but Tier Not Updated"

**Problem**: Webhook not processing correctly

**Solution**:

```bash
# Check webhook logs
supabase functions logs stripe-webhook

# Check if webhook is receiving events
# Go to Stripe Dashboard > Webhooks > Click webhook > View logs
```

### "Test Cards Not Working"

**Problem**: Not in test mode or wrong card format

**Solution**:

- Verify dashboard shows "Test Mode"
- Use exact card: `4242 4242 4242 4242`
- Use future expiry (any year > current)
- Use any 3-digit CVV

### "3D Secure Not Working"

**Problem**: Test environment or browser blocking popup

**Solution**:

- Disable popup blocker
- Use card: `4000 0025 0000 3155`
- In test mode, any code works
- Try incognito/private browsing

---

## Advanced Features

### Coupon Codes

```typescript
const paymentIntent = await stripe.paymentIntents.create({
  amount: 9700,
  currency: "usd",
  metadata: { coupon: "SAVE20" },
  // Apply 20% discount
  amount: 7760, // $97 - 20% = $77.60
});
```

### Trial Periods

```typescript
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: priceId }],
  trial_period_days: 14,
});
```

### Proration

```typescript
const subscription = await stripe.subscriptions.update(subscriptionId, {
  items: [{ id: itemId, price: newPriceId }],
  proration_behavior: "create_prorations",
});
```

### Multiple Payment Methods

Allow users to save cards:

```typescript
const setupIntent = await stripe.setupIntents.create({
  customer: customerId,
  payment_method_types: ["card"],
});
```

---

## Security Best Practices

- ✅ **Never expose secret key** in client-side code
- ✅ **Always verify webhook signatures**
- ✅ **Use HTTPS only** in production
- ✅ **Set up webhook signing** for security
- ✅ **Validate amounts** on server side
- ✅ **Log all payment events** for audit trail
- ✅ **Use idempotency keys** for retries
- ✅ **Implement rate limiting**

---

## Support

- **Stripe Docs**: [stripe.com/docs](https://stripe.com/docs)
- **Support**: [support.stripe.com](https://support.stripe.com)
- **Status**: [status.stripe.com](https://status.stripe.com)
- **Community**: [support.stripe.com/questions](https://support.stripe.com/questions)

---

**Integration Complete!** 🎉

You now have a fully functional Stripe payment system with:

- ✅ Credit card processing
- ✅ Subscription management
- ✅ Webhook handling
- ✅ Secure payment flow
- ✅ Test and production environments

For PayPal integration, see [paypal-integration-guide.md](./paypal-integration-guide.md).
