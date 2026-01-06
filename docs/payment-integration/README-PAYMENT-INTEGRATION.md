# 💳 Payment Integration Quick Start

## Overview

Complete payment integration with **Stripe** and **PayPal** for subscription management across three tiers:

| Tier | Price | Features |
|------|-------|----------|
| **FREE** | $0/mo | Basic access, limited features |
| **PREMIUM** | $97/mo | 100 direct mail postcards/month, AI features |
| **ELITE** | $297/mo | Unlimited postcards, white-glove service |

## ✅ What's Included

- ✅ **Stripe Integration** - Credit/debit card payments
- ✅ **PayPal Integration** - PayPal account payments
- ✅ **Subscription Management** - Auto-recurring billing
- ✅ **Webhook Handling** - Real-time payment notifications
- ✅ **Security** - PCI DSS compliant, encrypted
- ✅ **Components** - React components ready to use
- ✅ **Database Schema** - Subscription tracking
- ✅ **Edge Functions** - Serverless payment processing

## 🚀 Quick Setup (5 Minutes)

### 1. Get API Keys

**Stripe:**
1. Go to [https://dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)
2. Copy your **Publishable Key** and **Secret Key**

**PayPal:**
1. Go to [https://developer.paypal.com/dashboard](https://developer.paypal.com/dashboard)
2. Create an app and get **Client ID** and **Secret**

### 2. Configure Environment

Copy `.env.template` to `.env.development`:

```bash
# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# PayPal
VITE_PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_CLIENT_SECRET=your_secret_here
PAYPAL_MODE=sandbox  # Change to "live" for production
```

### 3. Set Supabase Secrets

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key_here
supabase secrets set PAYPAL_CLIENT_SECRET=your_secret_here
```

### 4. Deploy Edge Functions

```bash
supabase functions deploy create-payment-intent
supabase functions deploy stripe-webhook
supabase functions deploy paypal-webhook
```

### 5. Configure Webhooks

**Stripe:**
- URL: `https://your-project.supabase.co/functions/v1/stripe-webhook`
- Events: `payment_intent.succeeded`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`

**PayPal:**
- URL: `https://your-project.supabase.co/functions/v1/paypal-webhook`
- Events: `BILLING.SUBSCRIPTION.CREATED`, `BILLING.SUBSCRIPTION.UPDATED`, `BILLING.SUBSCRIPTION.CANCELLED`

## 🧪 Test with Test Cards

### Stripe Test Cards:
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
Expiry: Any future date
CVV: Any 3 digits
```

### PayPal Sandbox:
Use PayPal sandbox accounts from your developer dashboard.

## 📦 Usage in Your App

### Stripe Checkout:
```tsx
import StripeCheckout from '../components/payments/StripeCheckout';

<StripeCheckout
  planId="premium"
  planName="Premium"
  planPrice={97}
  onSuccess={() => navigate('/dashboard')}
  onCancel={() => navigate('/pricing')}
/>
```

### PayPal Checkout:
```tsx
import PayPalButton from '../components/payments/PayPalButton';

<PayPalButton
  planId="premium"
  planName="Premium"
  planPrice={97}
  onSuccess={() => navigate('/dashboard')}
  onCancel={() => navigate('/pricing')}
/>
```

## 🗄️ Database Schema

Subscriptions are tracked in the `subscriptions` table:

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  tier TEXT NOT NULL, -- 'free', 'premium', 'elite'
  status TEXT NOT NULL, -- 'active', 'canceled', 'past_due'
  stripe_subscription_id TEXT,
  paypal_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔒 Security Features

- ✅ PCI DSS Level 1 compliant (Stripe/PayPal handle card data)
- ✅ Webhook signature verification
- ✅ Encrypted environment variables
- ✅ Row Level Security (RLS) policies
- ✅ No card data stored on your servers
- ✅ HTTPS-only communication

## 📚 Additional Documentation

- [Master Guide](./PAYMENT-INTEGRATION-MASTER-GUIDE.md) - Comprehensive 45+ page guide
- [Implementation Checklist](./IMPLEMENTATION-CHECKLIST.md) - 200+ item checklist
- [Stripe Guide](./stripe-integration-guide.md) - Stripe-specific setup
- [PayPal Guide](./paypal-integration-guide.md) - PayPal-specific setup
- [Quick Reference](./QUICK-REFERENCE.md) - Commands and test cards

## ⚡ Common Issues

**"Publishable key not found"**
- Check `VITE_STRIPE_PUBLISHABLE_KEY` is in `.env.development`
- Restart dev server after changing .env

**"Payment failed"**
- Check Stripe Dashboard logs
- Verify webhook is receiving events
- Check Edge Function logs: `supabase functions logs create-payment-intent`

**"Subscription not updating"**
- Verify webhook secret matches
- Check webhook events in Stripe Dashboard
- Ensure Edge Function is deployed

## 🆘 Support

- Stripe Docs: [https://stripe.com/docs](https://stripe.com/docs)
- PayPal Docs: [https://developer.paypal.com/docs](https://developer.paypal.com/docs)
- Supabase Docs: [https://supabase.com/docs](https://supabase.com/docs)

---

**Ready to go live?** See [Going to Production](./PAYMENT-INTEGRATION-MASTER-GUIDE.md#going-to-production) in the Master Guide.
