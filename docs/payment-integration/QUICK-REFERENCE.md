# ⚡ Payment Integration Quick Reference

Quick commands, test cards, and troubleshooting for Stripe and PayPal integration.

## 🔑 Essential Commands

### Supabase Secrets
```bash
# Set secrets
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxx
supabase secrets set PAYPAL_CLIENT_SECRET=your_secret

# List secrets
supabase secrets list

# Unset secret
supabase secrets unset SECRET_NAME
```

### Edge Functions
```bash
# Deploy all
supabase functions deploy

# Deploy specific
supabase functions deploy create-payment-intent
supabase functions deploy stripe-webhook
supabase functions deploy paypal-webhook

# View logs (real-time)
supabase functions logs create-payment-intent --tail

# View logs (last 100)
supabase functions logs stripe-webhook -n 100
```

### Development
```bash
# Start dev server with env
npm run dev

# Build for production
npm run build

# Test production build locally
npm run preview
```

---

## 💳 Stripe Test Cards

### Successful Payments
```
Card: 4242 4242 4242 4242
Expiry: Any future date
CVV: Any 3 digits
ZIP: Any valid ZIP

Result: Payment succeeds
```

### Declined Payments
```
Card: 4000 0000 0000 0002
Result: Card declined (generic)

Card: 4000 0000 0000 9995
Result: Insufficient funds

Card: 4000 0000 0000 9987
Result: Lost card

Card: 4000 0000 0000 9979
Result: Stolen card
```

### Authentication Required (3D Secure)
```
Card: 4000 0025 0000 3155
Result: Requires authentication
Note: Enter any SMS code in test mode

Card: 4000 0000 0000 3220
Result: Authentication fails
```

### Special Test Cases
```
Card: 4000 0000 0000 0077
Result: Charge succeeds but card is about to expire

Card: 4000 0000 0000 0341
Result: Charge succeeds but triggers dispute (lost)

Card: 4000 0000 0000 5126
Result: Charge succeeds but triggers dispute (fraudulent)
```

### All test cards: [stripe.com/docs/testing](https://stripe.com/docs/testing)

---

## 💰 PayPal Sandbox Accounts

### Create Test Accounts
1. Go to [developer.paypal.com/dashboard](https://developer.paypal.com/dashboard)
2. Navigate to "Sandbox > Accounts"
3. Create "Personal" account (buyer)
4. Create "Business" account (seller)
5. Fund accounts with test money

### Test Credentials
```
Buyer Account:
Email: [auto-generated]@personal.example.com
Password: [auto-generated]

Seller Account:
Email: [auto-generated]@business.example.com
Password: [auto-generated]
```

### Test Subscription
```
1. Use buyer account to subscribe
2. Verify subscription in seller account
3. Test cancellation from buyer side
4. Verify webhook received
```

---

## 🔍 Debugging Tools

### Stripe Dashboard
```
Logs: https://dashboard.stripe.com/logs
Webhooks: https://dashboard.stripe.com/webhooks
Payments: https://dashboard.stripe.com/payments
Subscriptions: https://dashboard.stripe.com/subscriptions
```

### PayPal Dashboard
```
Dashboard: https://developer.paypal.com/dashboard
Sandbox: https://www.sandbox.paypal.com
IPN Simulator: https://developer.paypal.com/dashboard/tools/ipn-simulator
```

### Supabase Dashboard
```
Database: https://supabase.com/dashboard/project/YOUR_PROJECT/editor
Edge Functions: https://supabase.com/dashboard/project/YOUR_PROJECT/functions
Logs: https://supabase.com/dashboard/project/YOUR_PROJECT/logs
```

### Test Webhooks Locally
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook

# Trigger test webhook
stripe trigger payment_intent.succeeded
```

---

## 🛠️ Common SQL Queries

### Check User Subscription
```sql
SELECT 
  s.*,
  u.email
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
WHERE u.email = 'user@example.com';
```

### Get Active Subscriptions
```sql
SELECT 
  COUNT(*) as total_active,
  tier,
  COUNT(*) as count
FROM subscriptions
WHERE status = 'active'
GROUP BY tier;
```

### Find Expired Subscriptions
```sql
SELECT 
  s.*,
  u.email
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
WHERE s.current_period_end < NOW()
  AND s.status = 'active';
```

### Monthly Recurring Revenue (MRR)
```sql
SELECT 
  tier,
  COUNT(*) as subscribers,
  CASE 
    WHEN tier = 'premium' THEN COUNT(*) * 97
    WHEN tier = 'elite' THEN COUNT(*) * 297
    ELSE 0
  END as mrr
FROM subscriptions
WHERE status = 'active'
GROUP BY tier;
```

### Failed Payments Last 7 Days
```sql
SELECT 
  created_at,
  user_id,
  tier,
  status
FROM subscriptions
WHERE status = 'past_due'
  AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

---

## 🚨 Troubleshooting

### "Publishable key not found"
```bash
# Check .env.development
cat .env.development | grep STRIPE

# Restart dev server
npm run dev
```

### "Webhook signature verification failed"
```bash
# Check webhook secret
supabase secrets list | grep WEBHOOK

# Update secret
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Redeploy function
supabase functions deploy stripe-webhook
```

### "Payment succeeded but tier not updated"
```bash
# Check webhook logs
supabase functions logs stripe-webhook --tail

# Manually check database
supabase db pull
```

### "Edge Function timeout"
```bash
# Check function logs
supabase functions logs create-payment-intent

# Increase timeout in function config (if needed)
# Default is 60s, max is 300s
```

### "CORS error in browser"
```typescript
// Ensure your Edge Function has CORS headers:
return new Response(JSON.stringify(data), {
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  },
});
```

---

## 📊 Monitoring Checklist

### Daily Checks
- [ ] Payment success rate > 95%
- [ ] No Edge Function errors
- [ ] Webhooks delivering successfully
- [ ] No stuck subscriptions

### Weekly Checks
- [ ] Review failed payments
- [ ] Check churn rate
- [ ] Monitor MRR growth
- [ ] Review support tickets

### Monthly Checks
- [ ] Audit subscription status
- [ ] Review payment trends
- [ ] Check for fraud patterns
- [ ] Update dependencies

---

## 🔐 Security Checklist

- [ ] No API keys in Git
- [ ] .env.development in .gitignore
- [ ] Webhook signatures verified
- [ ] RLS enabled on subscriptions table
- [ ] HTTPS only in production
- [ ] Supabase secrets encrypted
- [ ] Error messages don't leak sensitive info
- [ ] Rate limiting on payment endpoints

---

## 📞 Support Resources

### Stripe
- Docs: [stripe.com/docs](https://stripe.com/docs)
- Support: [support.stripe.com](https://support.stripe.com)
- Status: [status.stripe.com](https://status.stripe.com)
- Community: [support.stripe.com/questions](https://support.stripe.com/questions)

### PayPal
- Docs: [developer.paypal.com/docs](https://developer.paypal.com/docs)
- Support: [developer.paypal.com/support](https://developer.paypal.com/support)
- Status: [status.paypal.com](https://status.paypal.com)
- Forums: [community.paypal.com](https://community.paypal.com)

### Supabase
- Docs: [supabase.com/docs](https://supabase.com/docs)
- Support: [supabase.com/support](https://supabase.com/support)
- Status: [status.supabase.com](https://status.supabase.com)
- Discord: [discord.supabase.com](https://discord.supabase.com)

---

## 💡 Pro Tips

**Faster Debugging:**
```bash
# Watch all logs simultaneously
supabase functions logs --tail | grep -i error
```

**Test Webhook Locally:**
```bash
# Forward Stripe webhooks to localhost
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook
```

**Quick Database Reset (Development Only):**
```bash
supabase db reset
```

**Export Production Data:**
```bash
supabase db dump -f backup.sql
```

**Test Card in One Command:**
```bash
stripe payment_intents create \
  --amount=9700 \
  --currency=usd \
  --payment-method=pm_card_visa
```

---

**Last Updated**: 2025-01-11  
**Version**: 1.0.0  
**Maintainer**: Development Team
