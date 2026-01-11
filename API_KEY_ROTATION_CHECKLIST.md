# 🔐 API KEY ROTATION CHECKLIST

**Date:** January 8, 2026  
**Status:** 🔴 URGENT - Keys exposed in git history + HubSpot token auto-expired

---

## ⚠️ CRITICAL: All API keys must be rotated immediately

Your `.env.development` AND `env.production` files were in git history and publicly visible on GitHub, meaning all keys were exposed. HubSpot has already auto-expired their token. Follow this checklist to secure your application.

---

## 📋 Rotation Checklist

### 1. Supabase 🗄️
- [ ] **Login to Supabase Dashboard**: https://app.supabase.com
- [ ] Navigate to: Project Settings → API
- [ ] **Rotate `anon` key** (public key)
- [ ] **Rotate `service_role` key** (server-side only)
- [ ] **Update database password**
- [ ] Update `.env.local` with new keys
- [ ] Redeploy application

**Environment Variables:**
```bash
VITE_SUPABASE_URL=https://[your-project].supabase.co
VITE_SUPABASE_ANON_KEY=[new-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[new-service-role-key]
```

---

### 2. Calendly 📅
- [ ] **Login to Calendly**: https://calendly.com
- [ ] Navigate to: Integrations → API & Webhooks
- [ ] **Delete old personal access token**
- [ ] **Generate new personal access token**
- [ ] Update `.env.local` with new token

**Environment Variables:**
```bash
VITE_CALENDLY_API_KEY=[new-api-key]
VITE_CALENDLY_ACCESS_TOKEN=[new-access-token]
```

---

### 3. Dappier AI 🤖
- [ ] **Login to Dappier Dashboard**: https://dappier.com
- [ ] Navigate to: API Keys
- [ ] **Revoke old API key**
- [ ] **Generate new API key**
- [ ] Update `.env.local` with new key

**Environment Variables:**
```bash
VITE_DAPPIER_API_KEY=[new-api-key]
VITE_DAPPIER_AI_MODEL_ID=[keep-same]
```

---

### 4. Stripe 💳
- [ ] **Login to Stripe Dashboard**: https://dashboard.stripe.com
- [ ] Navigate to: Developers → API keys
- [ ] **Roll publishable key**
- [ ] **Roll secret key**
- [ ] **Roll webhook signing secret**
- [ ] Update `.env.local` with new keys
- [ ] Update webhook endpoint if needed

**Environment Variables:**
```bash
VITE_STRIPE_PUBLISHABLE_KEY=[new-publishable-key]
STRIPE_SECRET_KEY=[new-secret-key]
STRIPE_WEBHOOK_SECRET=[new-webhook-secret]
```

---

### 5. YouTube Data API 📺
- [ ] **Login to Google Cloud Console**: https://console.cloud.google.com
- [ ] Navigate to: APIs & Services → Credentials
- [ ] **Delete old YouTube API key**
- [ ] **Create new API key**
- [ ] **Restrict key to YouTube Data API v3**
- [ ] Update `.env.local` with new key
- [ ] Update GitHub Secrets (if deployed)

**Environment Variables:**
```bash
VITE_YOUTUBE_API_KEY=[new-api-key]
VITE_YOUTUBE_CHANNEL_ID=[your-channel-id]
```

**Steps to Rotate:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to: APIs & Services → Credentials
4. Find existing YouTube API key → Click "Delete"
5. Click "Create Credentials" → "API Key"
6. Copy the new API key
7. Click "Restrict Key":
   - Under "API restrictions", select "Restrict key"
   - Choose "YouTube Data API v3"
   - Click "Save"
8. Update your `.env.local` file
9. Restart development server: `npm run dev`

**Verify it works:**
- Navigate to `/videos` page
- Check browser console for errors
- Videos should load from your YouTube channel

---

### 6. PayPal 💰
- [ ] **Login to PayPal Developer**: https://developer.paypal.com
- [ ] Navigate to: My Apps & Credentials
- [ ] **Delete old REST API app**
- [ ] **Create new REST API app**
- [ ] Update `.env.local` with new credentials

**Environment Variables:**
```bash
VITE_PAYPAL_CLIENT_ID=[new-client-id]
PAYPAL_CLIENT_SECRET=[new-client-secret]
```

---

### 7. Cloudflare ☁️
- [ ] **Login to Cloudflare**: https://dash.cloudflare.com
- [ ] Navigate to: My Profile → API Tokens
- [ ] **Revoke old API tokens**
- [ ] **Create new API token** (with minimal permissions)
- [ ] **Regenerate origin certificates**
- [ ] Update `.env.local` with new token

**Environment Variables:**
```bash
CLOUDFLARE_API_TOKEN=[new-api-token]
CLOUDFLARE_ZONE_ID=[keep-same]
```

---

### 8. GitHub 🐙
- [ ] **Login to GitHub**: https://github.com/settings/tokens
- [ ] Navigate to: Settings → Developer settings → Personal access tokens
- [ ] **Delete old tokens**
- [ ] **Generate new fine-grained token**

**Environment Variables:**
```bash
GITHUB_TOKEN=[new-token]
```

---

### 9. HubSpot 📧
- [ ] **Login to HubSpot**: https://app.hubspot.com
- [ ] Navigate to: Settings → Integrations → Private Apps
- [ ] **⚠️ TOKEN AUTO-EXPIRED** (discovered in public GitHub repo)
- [ ] **Delete old private app** (Sofie's Investment Group - Account 243491083)
- [ ] **Create new private app** with minimal scopes
- [ ] **Generate new access token**
- [ ] Update `.env.local` with new token
- [ ] Remove from `env.production` (already exposed in git history)

**Environment Variables:**
```bash
VITE_HUBSPOT_ACCESS_TOKEN=[new-access-token]
VITE_HUBSPOT_PORTAL_ID=243491083
```

**⚠️ CRITICAL:** Token was found in public file:
`https://github.com/M051719/rep-motivated-seller/blob/620a9a838f1d001f3aac74ee42fac449b7cc2e70/env.production`

---

### 10. Google Analytics 📊
- [ ] **Login to Google Analytics**: https://analytics.google.com
- [ ] Verify measurement ID (no rotation needed)
- [ ] Check if Measurement Protocol API key exists
- [ ] If yes, rotate in Google Cloud Console

**Environment Variables:**
```bash
VITE_GA_MEASUREMENT_ID=[keep-same-unless-compromised]
```

---

## 🔒 Security Best Practices After Rotation

### 1. Never Commit Secrets Again
```bash
# Add to .gitignore (already done)
.env
.env.*
!.env.example
*.pem
*.crt
*.key
```

### 2. Use Secret Management
Choose one:
- **Azure Key Vault** (recommended for Azure deployments)
- **AWS Secrets Manager** (recommended for AWS deployments)
- **1Password** (recommended for local development)
- **Doppler** (good for team collaboration)

### 3. Update Your `.env.example`
```bash
# Copy structure only (no real values)
cp .env.local .env.example

# Then manually replace all values with placeholders
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Set Up Environment Variable Injection
For production deployments:

**Netlify:**
```bash
# In Netlify UI: Site settings → Environment variables
```

**Vercel:**
```bash
# In Vercel UI: Project → Settings → Environment Variables
```

**Azure Static Web Apps:**
```bash
# In Azure Portal: Configuration → Application settings
```

---

## 📝 Verification Steps

After rotating all keys:

1. **Test locally:**
   ```bash
   npm run dev
   ```

2. **Verify each integration:**
   - [ ] Supabase auth works
   - [ ] Calendly widget loads
   - [ ] Dappier AI responds
   - [ ] Stripe checkout works
   - [ ] PayPal buttons render

3. **Deploy to staging/production**

4. **Monitor for errors** in first 24 hours

---

## 🆘 Emergency Contacts

If you discover active exploitation:

1. **Immediately revoke all keys** (don't wait for rotation)
2. **Check Stripe/PayPal dashboards** for unauthorized transactions
3. **Review Supabase logs** for suspicious queries
4. **Check access logs** on all services

---

## ✅ Completion

Once all items are checked:

- [ ] All 9 services have new API keys (including HubSpot)
- [ ] `.env.local` updated with new keys
- [ ] Application tested locally
- [ ] Application deployed with new keys
- [ ] Old backup files moved to secure storage
- [ ] Team notified of key rotation
- [ ] Monitoring enabled for 48 hours
- [ ] `env.production` removed from repository

**Completed by:** _______________  
**Date:** _______________  
**Verified by:** _______________

---

**🔴 Remember:** Your git history was rewritten. All team members must:
```bash
git fetch origin
git reset --hard origin/main  # or your branch name
```

Do NOT merge - this will reintroduce the old history!
