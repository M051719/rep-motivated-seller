# ✅ Payment Integration Implementation Checklist

Use this comprehensive checklist to ensure complete implementation of Stripe and PayPal payment systems.

## 🎯 Phase 1: Setup & Configuration (30 mins)

### Account Setup

- [ ] Create Stripe account at [stripe.com](https://stripe.com)
- [ ] Activate test mode in Stripe Dashboard
- [ ] Create PayPal developer account at [developer.paypal.com](https://developer.paypal.com)
- [ ] Create PayPal sandbox app
- [ ] Create PayPal sandbox test accounts (buyer and seller)

### API Keys Collection

- [ ] Copy Stripe publishable key (pk*test*...)
- [ ] Copy Stripe secret key (sk*test*...)
- [ ] Generate Stripe webhook secret (whsec\_...)
- [ ] Copy PayPal client ID
- [ ] Copy PayPal client secret
- [ ] Note PayPal webhook ID

### Environment Configuration

- [ ] Copy `.env.template` to `.env.development`
- [ ] Add VITE_STRIPE_PUBLISHABLE_KEY to .env.development
- [ ] Add STRIPE_SECRET_KEY to .env.development
- [ ] Add STRIPE_WEBHOOK_SECRET to .env.development
- [ ] Add VITE_PAYPAL_CLIENT_ID to .env.development
- [ ] Add PAYPAL_CLIENT_SECRET to .env.development
- [ ] Add PAYPAL_MODE=sandbox to .env.development
- [ ] Verify .env.development is in .gitignore
- [ ] Restart development server

### Supabase Configuration

- [ ] Run `supabase secrets set STRIPE_SECRET_KEY=<value>`
- [ ] Run `supabase secrets set PAYPAL_CLIENT_SECRET=<value>`
- [ ] Verify secrets: `supabase secrets list`
- [ ] Check secrets are encrypted in dashboard

---

## 🗄️ Phase 2: Database Setup (15 mins)

### Create Tables

- [ ] Create `subscriptions` table with schema:
  - [ ] `id` UUID primary key
  - [ ] `user_id` UUID references auth.users
  - [ ] `tier` TEXT (free/premium/elite)
  - [ ] `status` TEXT (active/canceled/past_due)
  - [ ] `stripe_subscription_id` TEXT nullable
  - [ ] `paypal_subscription_id` TEXT nullable
  - [ ] `current_period_start` TIMESTAMPTZ
  - [ ] `current_period_end` TIMESTAMPTZ
  - [ ] `cancel_at_period_end` BOOLEAN default false
  - [ ] `created_at` TIMESTAMPTZ default NOW()
  - [ ] `updated_at` TIMESTAMPTZ default NOW()
- [ ] Add index on `user_id`
- [ ] Add index on `stripe_subscription_id`
- [ ] Add index on `paypal_subscription_id`

### Row Level Security (RLS)

- [ ] Enable RLS on `subscriptions` table
- [ ] Create policy: Users can view own subscriptions
- [ ] Create policy: Service role can manage all subscriptions
- [ ] Test RLS with test user
- [ ] Verify admins can view all subscriptions

### Functions & Triggers

- [ ] Create `update_subscription_status()` function
- [ ] Create trigger on `subscriptions` UPDATE
- [ ] Create `get_user_tier()` function for quick lookups
- [ ] Test functions with sample data

---

## 💳 Phase 3: Stripe Integration (45 mins)

### Product Setup in Stripe Dashboard

- [ ] Create "Premium Tier" product
  - [ ] Set price to $97.00/month
  - [ ] Set billing period to monthly
  - [ ] Enable recurring billing
  - [ ] Copy price ID
- [ ] Create "Elite Tier" product
  - [ ] Set price to $297.00/month
  - [ ] Set billing period to monthly
  - [ ] Enable recurring billing
  - [ ] Copy price ID
- [ ] Add price IDs to .env.development:
  - [ ] STRIPE_PREMIUM_PRICE_ID=price_xxxxx
  - [ ] STRIPE_ELITE_PRICE_ID=price_xxxxx

### Stripe Components

- [ ] Verify `StripeCheckout.tsx` exists in src/components/payments/
- [ ] Review StripeCheckout component code
- [ ] Test Stripe Elements rendering
- [ ] Test payment form validation
- [ ] Test error handling
- [ ] Test success state

### Edge Function: create-payment-intent

- [ ] Create `supabase/functions/create-payment-intent/index.ts`
- [ ] Import Stripe SDK
- [ ] Validate request body (planId, planPrice, userId)
- [ ] Create Payment Intent with metadata
- [ ] Return client secret
- [ ] Deploy: `supabase functions deploy create-payment-intent`
- [ ] Test with curl/Postman
- [ ] Check logs: `supabase functions logs create-payment-intent`

### Edge Function: stripe-webhook

- [ ] Create `supabase/functions/stripe-webhook/index.ts`
- [ ] Verify webhook signature
- [ ] Handle `payment_intent.succeeded`
  - [ ] Extract user_id from metadata
  - [ ] Update subscriptions table
  - [ ] Set tier and status
- [ ] Handle `customer.subscription.created`
- [ ] Handle `customer.subscription.updated`
- [ ] Handle `customer.subscription.deleted`
- [ ] Log all events
- [ ] Deploy: `supabase functions deploy stripe-webhook`
- [ ] Check logs: `supabase functions logs stripe-webhook`

### Webhook Configuration in Stripe

- [ ] Go to Stripe Dashboard > Developers > Webhooks
- [ ] Click "Add endpoint"
- [ ] Enter URL: `https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook`
- [ ] Select events:
  - [ ] `payment_intent.succeeded`
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_succeeded`
  - [ ] `invoice.payment_failed`
- [ ] Copy webhook signing secret
- [ ] Update STRIPE_WEBHOOK_SECRET in .env and Supabase secrets
- [ ] Test webhook with "Send test webhook" button

### Testing Stripe

- [ ] Test successful payment with 4242 4242 4242 4242
- [ ] Verify subscription created in database
- [ ] Verify user tier updated
- [ ] Test declined card: 4000 0000 0000 0002
- [ ] Verify error handling
- [ ] Test 3D Secure card: 4000 0025 0000 3155
- [ ] Test refund in Stripe Dashboard
- [ ] Verify webhook received
- [ ] Check all Edge Function logs
- [ ] Test subscription cancellation

---

## 💰 Phase 4: PayPal Integration (45 mins)

### Product Setup in PayPal Dashboard

- [ ] Go to PayPal Developer Dashboard
- [ ] Navigate to Products & Plans
- [ ] Create "Premium Tier" subscription plan
  - [ ] Set billing cycle to monthly
  - [ ] Set price to $97.00
  - [ ] Enable auto-renewal
  - [ ] Copy plan ID
- [ ] Create "Elite Tier" subscription plan
  - [ ] Set billing cycle to monthly
  - [ ] Set price to $297.00
  - [ ] Enable auto-renewal
  - [ ] Copy plan ID
- [ ] Add plan IDs to .env.development:
  - [ ] PAYPAL_PREMIUM_PLAN_ID=P-xxxxx
  - [ ] PAYPAL_ELITE_PLAN_ID=P-xxxxx

### PayPal Components

- [ ] Verify `PayPalButton.tsx` exists in src/components/payments/
- [ ] Review PayPalButton component code
- [ ] Test PayPal button rendering
- [ ] Test subscription flow
- [ ] Test error handling
- [ ] Test success state

### Edge Function: paypal-webhook

- [ ] Create `supabase/functions/paypal-webhook/index.ts`
- [ ] Verify webhook signature with PayPal API
- [ ] Handle `BILLING.SUBSCRIPTION.CREATED`
  - [ ] Extract user_id from custom_id
  - [ ] Create subscription record
- [ ] Handle `BILLING.SUBSCRIPTION.UPDATED`
- [ ] Handle `BILLING.SUBSCRIPTION.CANCELLED`
- [ ] Handle `PAYMENT.SALE.COMPLETED`
- [ ] Log all events
- [ ] Deploy: `supabase functions deploy paypal-webhook`
- [ ] Check logs: `supabase functions logs paypal-webhook`

### Webhook Configuration in PayPal

- [ ] Go to PayPal App Settings
- [ ] Enable webhooks
- [ ] Enter URL: `https://YOUR_PROJECT.supabase.co/functions/v1/paypal-webhook`
- [ ] Select events:
  - [ ] `BILLING.SUBSCRIPTION.CREATED`
  - [ ] `BILLING.SUBSCRIPTION.UPDATED`
  - [ ] `BILLING.SUBSCRIPTION.CANCELLED`
  - [ ] `PAYMENT.SALE.COMPLETED`
  - [ ] `PAYMENT.SALE.REFUNDED`
- [ ] Copy webhook ID
- [ ] Update PAYPAL_WEBHOOK_ID in .env

### Testing PayPal

- [ ] Login to sandbox buyer account
- [ ] Test successful subscription creation
- [ ] Verify subscription in database
- [ ] Verify user tier updated
- [ ] Test subscription with insufficient funds
- [ ] Verify error handling
- [ ] Test subscription cancellation
- [ ] Verify webhook received
- [ ] Check PayPal IPN simulator
- [ ] Check all Edge Function logs

---

## 🎨 Phase 5: UI Integration (30 mins)

### Pricing Page

- [ ] Import StripeCheckout component
- [ ] Import PayPalButton component
- [ ] Add payment provider selection (Stripe/PayPal tabs)
- [ ] Pass correct planId prop
- [ ] Pass correct planName prop
- [ ] Pass correct planPrice prop
- [ ] Add onSuccess navigation
- [ ] Add onCancel navigation
- [ ] Style payment section
- [ ] Test responsive design
- [ ] Add loading states

### Subscription Page

- [ ] Display current subscription tier
- [ ] Display billing cycle dates
- [ ] Add "Upgrade" button for lower tiers
- [ ] Add "Cancel" button for active subscriptions
- [ ] Show payment method used (Stripe/PayPal)
- [ ] Add subscription history
- [ ] Implement cancellation flow
- [ ] Test tier changes

### Success/Error Pages

- [ ] Create `/subscription/success` route
- [ ] Display success message
- [ ] Show tier details
- [ ] Add "Go to Dashboard" button
- [ ] Create `/subscription/error` route
- [ ] Display error message
- [ ] Add "Try Again" button
- [ ] Add support contact info

### User Dashboard

- [ ] Display tier badge
- [ ] Show remaining direct mail credits (if Premium/Elite)
- [ ] Add "Manage Subscription" link
- [ ] Display next billing date
- [ ] Show billing history

---

## 🔒 Phase 6: Security & Compliance (30 mins)

### Security Checks

- [ ] Verify no API keys in client-side code
- [ ] Verify webhook signatures are validated
- [ ] Test with invalid webhook signatures
- [ ] Verify RLS policies prevent unauthorized access
- [ ] Test subscription updates by non-owners
- [ ] Ensure HTTPS only in production
- [ ] Verify CORS settings
- [ ] Test CSRF protection
- [ ] Check for SQL injection vulnerabilities
- [ ] Test XSS prevention

### Compliance

- [ ] Add privacy policy link
- [ ] Add terms of service link
- [ ] Include "Payments processed by Stripe" disclosure
- [ ] Include "Payments processed by PayPal" disclosure
- [ ] Add PCI DSS compliance statement
- [ ] Include refund policy
- [ ] Add cancellation policy
- [ ] Include billing descriptor info
- [ ] Verify GDPR compliance (if EU customers)
- [ ] Add cookie consent (if required)

### Error Handling

- [ ] Test network failures
- [ ] Test API timeout scenarios
- [ ] Test invalid card numbers
- [ ] Test expired cards
- [ ] Test insufficient funds
- [ ] Test webhook failures
- [ ] Verify user-friendly error messages
- [ ] Log errors to monitoring service
- [ ] Test graceful degradation

---

## 🧪 Phase 7: Testing & Quality Assurance (1 hour)

### Unit Tests

- [ ] Test StripeCheckout component rendering
- [ ] Test PayPalButton component rendering
- [ ] Test payment form validation
- [ ] Test error state rendering
- [ ] Test success state rendering
- [ ] Test Edge Function logic
- [ ] Test webhook signature verification
- [ ] Test database functions

### Integration Tests

- [ ] Test full Stripe payment flow
- [ ] Test full PayPal payment flow
- [ ] Test tier upgrade flow
- [ ] Test tier downgrade flow
- [ ] Test subscription cancellation
- [ ] Test webhook processing
- [ ] Test concurrent payments
- [ ] Test edge cases (0 amount, negative, etc.)

### User Acceptance Testing

- [ ] Have beta users test Stripe checkout
- [ ] Have beta users test PayPal checkout
- [ ] Collect feedback on UX
- [ ] Test on mobile devices
- [ ] Test on different browsers
- [ ] Test with screen readers
- [ ] Verify accessibility (WCAG 2.1)
- [ ] Test loading performance

### Load Testing

- [ ] Test with 100 simultaneous checkouts
- [ ] Monitor Edge Function performance
- [ ] Check database query performance
- [ ] Test webhook processing under load
- [ ] Monitor error rates
- [ ] Check timeout thresholds

---

## 📊 Phase 8: Monitoring & Analytics (20 mins)

### Logging Setup

- [ ] Enable Edge Function logging
- [ ] Set up log retention
- [ ] Configure log filters
- [ ] Set up error alerts
- [ ] Add custom log events
- [ ] Test log aggregation

### Analytics

- [ ] Track payment attempts
- [ ] Track payment successes
- [ ] Track payment failures
- [ ] Track tier distribution
- [ ] Track monthly recurring revenue (MRR)
- [ ] Track churn rate
- [ ] Set up conversion funnels
- [ ] Create payment dashboard

### Alerts

- [ ] Alert on payment failures > 10%
- [ ] Alert on webhook processing errors
- [ ] Alert on Edge Function errors
- [ ] Alert on unusual payment patterns
- [ ] Alert on subscription cancellations > threshold
- [ ] Set up Slack/email notifications

---

## 🚀 Phase 9: Going Live (1 hour)

### Production Keys

- [ ] Switch Stripe to live mode
- [ ] Copy live publishable key
- [ ] Copy live secret key
- [ ] Generate live webhook secret
- [ ] Switch PayPal to live mode
- [ ] Copy live PayPal credentials
- [ ] Update production environment variables
- [ ] Update Supabase production secrets
- [ ] Verify .env.production is secure

### Production Deployment

- [ ] Deploy Edge Functions to production
- [ ] Test production Edge Functions
- [ ] Configure production webhooks (Stripe)
- [ ] Configure production webhooks (PayPal)
- [ ] Test live webhook delivery
- [ ] Update DNS/SSL if needed
- [ ] Deploy frontend to production
- [ ] Run smoke tests in production

### Final Checks

- [ ] Make a real $1 test payment
- [ ] Verify payment appears in Stripe Dashboard
- [ ] Verify subscription created in database
- [ ] Verify webhook received
- [ ] Refund test payment
- [ ] Test cancellation flow
- [ ] Verify all analytics tracking
- [ ] Check error monitoring

### Documentation

- [ ] Update README with production setup
- [ ] Document rollback procedure
- [ ] Create runbook for common issues
- [ ] Document webhook retry logic
- [ ] Update API documentation
- [ ] Train support team
- [ ] Create customer FAQ

---

## 📞 Phase 10: Post-Launch (Ongoing)

### Week 1

- [ ] Monitor all payments daily
- [ ] Check webhook success rate
- [ ] Review error logs
- [ ] Respond to customer issues < 1 hour
- [ ] Track payment success rate
- [ ] Monitor churn

### Month 1

- [ ] Analyze payment trends
- [ ] Review failed payments
- [ ] Optimize checkout flow based on data
- [ ] Update documentation based on support tickets
- [ ] Plan feature improvements
- [ ] Survey customers

### Ongoing

- [ ] Review Stripe/PayPal updates quarterly
- [ ] Update SDKs when new versions release
- [ ] Audit security quarterly
- [ ] Review PCI compliance annually
- [ ] Monitor for fraud patterns
- [ ] Optimize based on metrics

---

## ✅ Completion Criteria

All checkboxes must be completed before considering the integration "done":

- [ ] **Setup**: All accounts created, keys obtained
- [ ] **Database**: Schema created, RLS enabled, tested
- [ ] **Stripe**: Fully integrated, webhooks working, tested
- [ ] **PayPal**: Fully integrated, webhooks working, tested
- [ ] **UI**: All pages implemented, responsive, accessible
- [ ] **Security**: All security checks passed
- [ ] **Testing**: All test suites passing
- [ ] **Monitoring**: Logs and alerts configured
- [ ] **Production**: Live payments working
- [ ] **Documentation**: All docs updated

**Total Items**: 200+
**Estimated Time**: 6-8 hours for experienced developer
**Difficulty**: Intermediate to Advanced

---

**Questions?** Refer to [Master Guide](./PAYMENT-INTEGRATION-MASTER-GUIDE.md) or [Quick Reference](./QUICK-REFERENCE.md).
