# 🟦 PayPal Integration Guide

Complete step-by-step guide for integrating PayPal payment processing into your real estate platform.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Account Setup](#account-setup)
3. [Subscription Plan Configuration](#subscription-plan-configuration)
4. [Frontend Integration](#frontend-integration)
5. [Backend Integration](#backend-integration)
6. [Webhook Configuration](#webhook-configuration)
7. [Testing](#testing)
8. [Going Live](#going-live)
9. [Troubleshooting](#troubleshooting)

---

## Overview

### What is PayPal?

PayPal is a payment platform that allows customers to pay using their PayPal balance, bank accounts, or credit/debit cards. It's trusted worldwide with over 400 million active users.

### Why PayPal?

- ✅ **Trust**: Recognized brand, 400M+ users
- ✅ **Convenience**: One-click checkout for PayPal users
- ✅ **Global**: Available in 200+ countries
- ✅ **No Card Required**: Users can pay from balance
- ✅ **Buyer Protection**: Built-in dispute resolution

### Pricing

- **2.99% + $0.49** per US domestic transaction
- **4.49% + fixed fee** for international transactions
- **No setup fees**, no monthly fees
- **5% additional** for micropayments under $10

---

## Account Setup

### 1. Create PayPal Business Account

1. Go to [paypal.com/business](https://www.paypal.com/business)
2. Click **Sign Up**
3. Select **Business Account**
4. Fill in business information:
   - Business name
   - Business type (LLC, Corporation, etc.)
   - Tax ID (EIN or SSN)
   - Bank account for withdrawals
5. Verify email and phone

### 2. Create Developer Account

1. Go to [developer.paypal.com](https://developer.paypal.com)
2. Log in with your PayPal account
3. You'll automatically have access to sandbox

### 3. Create Sandbox App

1. Go to [developer.paypal.com/dashboard](https://developer.paypal.com/dashboard)
2. Click **Apps & Credentials**
3. Toggle **Sandbox** mode
4. Click **Create App**
5. Name it: `rep-motivated-seller-sandbox`
6. Click **Create App**

### 4. Get API Credentials

After creating the app, you'll see:

**Client ID**
```
AeA1QIZXiflr1_JZpjS3sdg...
```
- Used in frontend PayPal buttons
- Safe to expose publicly

**Secret**
```
EBWKjlELKMYqRNQ6sYvFo92...
```
- ⚠️ **NEVER expose to clients**
- Used in server/Edge Functions
- Stored in environment variables

### 5. Create Sandbox Test Accounts

1. Go to [developer.paypal.com/dashboard](https://developer.paypal.com/dashboard)
2. Click **Testing Tools > Sandbox Accounts**
3. Click **Create Account**

**Personal Account (Buyer)**
```
Type: Personal
Email: [auto-generated]@personal.example.com
Password: [auto-generated]
Balance: $5,000 (default)
```

**Business Account (Seller)**
```
Type: Business  
Email: [auto-generated]@business.example.com
Password: [auto-generated]
```

Save these credentials - you'll use them for testing!

---

## Subscription Plan Configuration

### Create Subscription Plans in Dashboard

#### 1. Navigate to Products & Billing

1. Log in to [paypal.com/businesswallet](https://paypal.com/businesswallet)
2. Go to **Products & Services**
3. Click **Plans & Pricing** (may need to enable subscriptions first)

#### 2. Create Premium Plan ($97/month)

1. Click **Create Plan**
2. Fill in details:
   ```
   Plan Name: Premium Tier
   Plan ID: premium-tier-97 (auto-generated or custom)
   Description: 100 direct mail postcards per month + AI tools
   
   Billing Cycle:
   - Frequency: Monthly
   - Price: $97.00 USD
   - Trial: 0 days (or add if desired)
   
   Setup Fee: $0.00
   ```
3. Click **Save**
4. Copy the **Plan ID** (looks like `P-1AB23456CD789012E`)
5. Save as `PAYPAL_PREMIUM_PLAN_ID` in your `.env`

#### 3. Create Elite Plan ($297/month)

1. Create another plan:
   ```
   Plan Name: Elite Tier
   Plan ID: elite-tier-297
   Description: Unlimited direct mail + white-glove service
   
   Billing Cycle:
   - Frequency: Monthly
   - Price: $297.00 USD
   - Trial: 0 days
   
   Setup Fee: $0.00
   ```
2. Copy the **Plan ID**
3. Save as `PAYPAL_ELITE_PLAN_ID` in your `.env`

### Alternative: Create Plans via API

You can also create plans programmatically. Create a script:

```typescript
// scripts/create-paypal-plans.ts
import fetch from 'node-fetch';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API_BASE = 'https://api-m.sandbox.paypal.com'; // Use sandbox

async function getAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  
  const data = await response.json();
  return data.access_token;
}

async function createPlan(name: string, price: number) {
  const accessToken = await getAccessToken();
  
  const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/plans`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_id: 'PROD-XXXX', // Create product first
      name,
      description: `${name} subscription`,
      billing_cycles: [
        {
          frequency: {
            interval_unit: 'MONTH',
            interval_count: 1,
          },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0, // Infinite
          pricing_scheme: {
            fixed_price: {
              value: price.toString(),
              currency_code: 'USD',
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: {
          value: '0',
          currency_code: 'USD',
        },
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 3,
      },
    }),
  });
  
  const plan = await response.json();
  console.log(`Created plan: ${plan.id}`);
  return plan.id;
}

// Run script
(async () => {
  const premiumId = await createPlan('Premium Tier', 97);
  const eliteId = await createPlan('Elite Tier', 297);
  
  console.log(`\nAdd to .env:`);
  console.log(`PAYPAL_PREMIUM_PLAN_ID=${premiumId}`);
  console.log(`PAYPAL_ELITE_PLAN_ID=${eliteId}`);
})();
```

Run:
```bash
npx ts-node scripts/create-paypal-plans.ts
```

---

## Frontend Integration

### 1. Install Dependencies

```bash
npm install @paypal/react-paypal-js
```

### 2. Configure Environment

Create `.env.development`:
```env
VITE_PAYPAL_CLIENT_ID=AeA1QIZXiflr1_JZpjS3sdg...
PAYPAL_CLIENT_SECRET=EBWKjlELKMYqRNQ6sYvFo92...
PAYPAL_MODE=sandbox  # Change to "live" for production

PAYPAL_PREMIUM_PLAN_ID=P-1AB23456CD789012E
PAYPAL_ELITE_PLAN_ID=P-9XY87654FE321098Z
```

### 3. Use PayPalCheckout Component

Use the `PayPalCheckout.tsx` component for one-time payments:

```tsx
import PayPalCheckout from '../components/payments/PayPalCheckout';

function PricingPage() {
  return (
    <PayPalCheckout
      amount={100}
      description="Consultation Payment"
      onSuccess={() => navigate('/dashboard')}
      onCancel={() => navigate('/pricing')}
    />
  );
}
```

### 4. Component Flow

```
User clicks PayPal button
  → PayPal popup/modal opens
  → User logs into PayPal (or guest checkout)
  → User reviews subscription details
  → User approves subscription
  → onApprove callback fires
  → Update database with subscription ID
  → Redirect to success page
  → PayPal sends webhook to your server
```

---

## Backend Integration

### 1. Create Edge Function: paypal-webhook

Create `supabase/functions/paypal-webhook/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID') || '';
const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET') || '';
const PAYPAL_API_BASE = 'https://api-m.sandbox.paypal.com'; // Change for production

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

async function getAccessToken() {
  const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`);
  
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  
  const data = await response.json();
  return data.access_token;
}

async function verifyWebhook(
  headers: Headers,
  body: string,
  webhookId: string
): Promise<boolean> {
  const accessToken = await getAccessToken();
  
  const verificationBody = {
    auth_algo: headers.get('paypal-auth-algo'),
    cert_url: headers.get('paypal-cert-url'),
    transmission_id: headers.get('paypal-transmission-id'),
    transmission_sig: headers.get('paypal-transmission-sig'),
    transmission_time: headers.get('paypal-transmission-time'),
    webhook_id: webhookId,
    webhook_event: JSON.parse(body),
  };

  const response = await fetch(
    `${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verificationBody),
    }
  );

  const data = await response.json();
  return data.verification_status === 'SUCCESS';
}

serve(async (req) => {
  try {
    const body = await req.text();
    const webhookId = Deno.env.get('PAYPAL_WEBHOOK_ID') || '';

    // Verify webhook signature
    const isValid = await verifyWebhook(req.headers, body, webhookId);
    if (!isValid) {
      console.error('Invalid webhook signature');
      return new Response('Unauthorized', { status: 401 });
    }

    const event = JSON.parse(body);
    console.log('Received PayPal event:', event.event_type);

    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.CREATED': {
        const subscription = event.resource;
        const userId = subscription.custom_id; // Pass user_id as custom_id

        await supabase.from('subscriptions').insert({
          user_id: userId,
          paypal_subscription_id: subscription.id,
          tier: subscription.plan_id.includes('premium') ? 'premium' : 'elite',
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(subscription.billing_info.next_billing_time).toISOString(),
        });

        console.log(`Created subscription for user ${userId}`);
        break;
      }

      case 'BILLING.SUBSCRIPTION.UPDATED': {
        const subscription = event.resource;
        
        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status.toLowerCase(),
            current_period_end: new Date(subscription.billing_info.next_billing_time).toISOString(),
          })
          .eq('paypal_subscription_id', subscription.id);

        console.log(`Updated subscription ${subscription.id}`);
        break;
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED': {
        const subscription = event.resource;

        await supabase
          .from('subscriptions')
          .update({ status: 'canceled', tier: 'free' })
          .eq('paypal_subscription_id', subscription.id);

        console.log(`Canceled subscription ${subscription.id}`);
        break;
      }

      case 'PAYMENT.SALE.COMPLETED': {
        const sale = event.resource;
        console.log(`Payment completed: ${sale.id}, Amount: ${sale.amount.total}`);
        // You can add payment tracking here if needed
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.event_type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
```

### 2. Deploy Edge Function

```bash
supabase functions deploy paypal-webhook
```

### 3. Set Supabase Secrets

```bash
supabase secrets set PAYPAL_CLIENT_ID=AeA1QIZXiflr1_JZpjS3sdg...
supabase secrets set PAYPAL_CLIENT_SECRET=EBWKjlELKMYqRNQ6sYvFo92...
supabase secrets set PAYPAL_WEBHOOK_ID=your-webhook-id
```

---

## Webhook Configuration

### 1. Create Webhook in PayPal Dashboard

1. Go to [developer.paypal.com/dashboard](https://developer.paypal.com/dashboard)
2. Click your app name
3. Scroll to **Webhooks**
4. Click **Add Webhook**
5. Enter webhook URL:
   ```
   https://YOUR_PROJECT.supabase.co/functions/v1/paypal-webhook
   ```
6. Select event types:
   - ✅ `BILLING.SUBSCRIPTION.CREATED`
   - ✅ `BILLING.SUBSCRIPTION.UPDATED`
   - ✅ `BILLING.SUBSCRIPTION.CANCELLED`
   - ✅ `BILLING.SUBSCRIPTION.EXPIRED`
   - ✅ `PAYMENT.SALE.COMPLETED`
   - ✅ `PAYMENT.SALE.REFUNDED`
7. Click **Save**
8. Copy the **Webhook ID**
9. Save as `PAYPAL_WEBHOOK_ID` in Supabase secrets

### 2. Test Webhook

1. Go to [developer.paypal.com/dashboard](https://developer.paypal.com/dashboard)
2. Click **Webhooks**
3. Click your webhook
4. Click **Webhook events simulator**
5. Select `BILLING.SUBSCRIPTION.CREATED`
6. Customize JSON with your data
7. Click **Send**

Check logs:
```bash
supabase functions logs paypal-webhook --tail
```

You should see:
```
Received PayPal event: BILLING.SUBSCRIPTION.CREATED
Created subscription for user test-user-123
```

---

## Testing

### 1. Get Sandbox Test Accounts

From earlier setup, you should have:
- **Buyer account**: xxx@personal.example.com
- **Seller account**: xxx@business.example.com

### 2. Test Subscription Flow

1. **Navigate to your pricing page**
2. **Click PayPal button**
3. **PayPal modal opens**
4. **Enter sandbox buyer credentials**:
   - Email: (from sandbox accounts)
   - Password: (from sandbox accounts)
5. **Review subscription details**
6. **Click "Agree & Subscribe"**
7. ✅ **Should redirect to success page**
8. **Check database**:
   ```sql
   SELECT * FROM subscriptions 
   WHERE user_id = 'your-user-id';
   ```
9. **Verify** `tier = 'premium'` and `status = 'active'`

### 3. Verify in PayPal Sandbox

1. Log in to [sandbox.paypal.com](https://www.sandbox.paypal.com)
2. Use **seller** credentials
3. Go to **Activity**
4. See subscription payment received

### 4. Test Cancellation

1. Log in to sandbox with **buyer** credentials
2. Go to **Settings > Payments > Manage automatic payments**
3. Find your subscription
4. Click **Cancel**
5. Verify webhook received
6. Check database: `status = 'canceled'`

### 5. Test Webhook Manually

Use IPN Simulator:
1. Go to [developer.paypal.com/dashboard/tools/ipn-simulator](https://developer.paypal.com/dashboard/tools/ipn-simulator)
2. Select transaction type: `Subscriptions`
3. Fill in fields
4. Click **Send IPN**
5. Check Edge Function logs

---

## Going Live

### 1. Switch to Live Mode

1. Go to [developer.paypal.com/dashboard](https://developer.paypal.com/dashboard)
2. Toggle to **Live** mode
3. Click **Create App**
4. Name: `rep-motivated-seller-live`
5. Click **Create App**

### 2. Get Live Credentials

Copy from app settings:
- **Live Client ID**: starts with `A`
- **Live Secret**: long string

### 3. Create Live Subscription Plans

Either:
- **Option A**: Use PayPal Business Portal to create plans
- **Option B**: Run your script with live credentials

### 4. Update Production Environment

Update `.env.production`:
```env
VITE_PAYPAL_CLIENT_ID=YOUR_LIVE_CLIENT_ID
PAYPAL_MODE=live
```

Set Supabase production secrets:
```bash
supabase secrets set PAYPAL_CLIENT_ID=YOUR_LIVE_CLIENT_ID --project-ref YOUR_PROD_PROJECT
supabase secrets set PAYPAL_CLIENT_SECRET=YOUR_LIVE_SECRET --project-ref YOUR_PROD_PROJECT
```

### 5. Create Live Webhook

1. In live mode, go to **Webhooks**
2. **Add Webhook**
3. URL: `https://YOUR_PROD_PROJECT.supabase.co/functions/v1/paypal-webhook`
4. Select same events
5. Copy webhook ID
6. Set in production:
   ```bash
   supabase secrets set PAYPAL_WEBHOOK_ID=your-webhook-id --project-ref YOUR_PROD_PROJECT
   ```

### 6. Test Live Payment

⚠️ **This will charge a real PayPal account!**

1. Use your personal PayPal account
2. Subscribe to lowest tier first
3. Complete payment
4. Verify in PayPal business account
5. Verify in database
6. Cancel subscription immediately (if testing)

### 7. Monitor

- Check [paypal.com/businesswallet](https://paypal.com/businesswallet) daily
- Review transactions and subscriptions
- Monitor webhook delivery in dashboard

---

## Troubleshooting

### "PayPal button not rendering"

**Problem**: Client ID not loaded or invalid

**Solution**:
```bash
# Check client ID is set
echo $VITE_PAYPAL_CLIENT_ID

# Verify in .env.development
cat .env.development | grep PAYPAL

# Restart dev server
npm run dev
```

### "Error: Plan ID not found"

**Problem**: Plan doesn't exist or wrong ID

**Solution**:
```bash
# List all plans (requires access token)
curl https://api-m.sandbox.paypal.com/v1/billing/plans \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Verify plan ID in .env matches PayPal dashboard
```

### "Webhook not receiving events"

**Problem**: Wrong URL, webhook not configured, or signature verification failing

**Solution**:
```bash
# Check webhook URL is correct
# Should be: https://YOUR_PROJECT.supabase.co/functions/v1/paypal-webhook

# Check webhook is receiving requests (even if failing)
supabase functions logs paypal-webhook --tail

# Check webhook delivery attempts in PayPal Dashboard
# Go to Webhooks > Click webhook > Event history
```

### "Subscription created but tier not updated"

**Problem**: custom_id not passed or webhook not processing

**Solution**:
```typescript
// Make sure to pass custom_id when creating subscription
createSubscription: async (data, actions) => {
  return actions.subscription.create({
    plan_id: planId,
    custom_id: userId, // ← IMPORTANT
  });
}
```

### "Payment completed but no webhook"

**Problem**: Webhook delivery failed or blocked

**Solution**:
- Check PayPal Dashboard > Webhooks > Event History
- Look for failed deliveries
- Check if your server returned non-200 status
- Verify webhook signature verification is working
- Check Edge Function logs for errors

---

## Advanced Features

### Add Trial Period

```typescript
createSubscription: (data, actions) => {
  return actions.subscription.create({
    plan_id: planId,
    custom_id: userId,
    start_time: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
  });
}
```

### Custom Onboarding Amount

```typescript
createSubscription: (data, actions) => {
  return actions.subscription.create({
    plan_id: planId,
    custom_id: userId,
    application_context: {
      shipping_preference: 'NO_SHIPPING',
    },
    plan: {
      billing_cycles: [
        {
          sequence: 1,
          total_cycles: 1,
          pricing_scheme: {
            fixed_price: {
              value: '1.00', // First month $1
              currency_code: 'USD',
            },
          },
        },
      ],
    },
  });
}
```

### Cancel Subscription via API

```typescript
async function cancelSubscription(subscriptionId: string, reason: string) {
  const accessToken = await getAccessToken();
  
  const response = await fetch(
    `https://api-m.paypal.com/v1/billing/subscriptions/${subscriptionId}/cancel`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    }
  );

  return response.status === 204; // Success
}
```

### Get Subscription Details

```typescript
async function getSubscription(subscriptionId: string) {
  const accessToken = await getAccessToken();
  
  const response = await fetch(
    `https://api-m.paypal.com/v1/billing/subscriptions/${subscriptionId}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return await response.json();
}
```

---

## Security Best Practices

- ✅ **Never expose secret** in client-side code
- ✅ **Always verify webhook signatures**
- ✅ **Use HTTPS only** in production
- ✅ **Validate subscription IDs** on server
- ✅ **Check subscription status** before granting access
- ✅ **Log all payment events** for audit
- ✅ **Handle webhook retries** (PayPal retries for 30 days)
- ✅ **Set up monitoring** for failed webhooks

---

## Support

- **PayPal Docs**: [developer.paypal.com/docs](https://developer.paypal.com/docs)
- **Support**: [developer.paypal.com/support](https://developer.paypal.com/support)
- **Status**: [status.paypal.com](https://status.paypal.com)
- **Community**: [community.paypal.com](https://community.paypal.com)

---

**Integration Complete!** 🎉

You now have a fully functional PayPal payment system with:
- ✅ Subscription billing
- ✅ Webhook handling
- ✅ Sandbox testing
- ✅ Live payment processing
- ✅ Cancellation management

Combined with Stripe, you offer customers maximum payment flexibility!
