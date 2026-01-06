# PostgreSQL Upgrade Pre-Flight Checklist

**Project:** ltxqodqlexvojqqxquew (rep-motivated-seller)
**Date:** December 10, 2025
**Current Status:** Security patches available

## ✅ Pre-Upgrade Verification

### Database Health
- ✅ **Latest Migration Applied:** `20251210124144_create_direct_mail_and_legal_tables.sql`
- ✅ **Direct Mail Integration:** Working (tested Dec 10, 2025)
- ✅ **Lob API:** Configured with test secret key
- ✅ **Functions Deployed:** send-direct-mail function active

### Known Issues (Fixed)
- ✅ **Environment File:** Fixed invalid variable names with spaces
  - Backup saved: `.env.development.backup`
  - Fixed variables: VITE_MAILERLITE_*, CLIENT_ID, FACEBOOK_GRAPH_API, etc.

### Critical Data
- ✅ **Automatic Backups:** Supabase handles automatic backups before upgrade
- ⚠️ **Manual Backup Recommended:** Consider exporting critical tables before upgrade

### Active Integrations
- Lob Direct Mail API (test mode active)
- Supabase Auth
- Edge Functions (send-direct-mail)
- Storage buckets (if any)

## 📋 Upgrade Process

### Step 1: Access Dashboard
1. Go to: https://supabase.com/dashboard/project/ltxqodqlexvojqqxquew/settings/infrastructure
2. Navigate to **Settings > Infrastructure**
3. Find **Database** section

### Step 2: Review Upgrade Details
- [ ] Note current Postgres version
- [ ] Review target version
- [ ] Check estimated downtime (typically 5-15 minutes)
- [ ] Review breaking changes (if any)

### Step 3: Schedule or Execute
**Recommended:** Schedule during low-traffic period
- [ ] Click **Upgrade** button
- [ ] Choose immediate or scheduled upgrade
- [ ] Confirm upgrade

### Step 4: Post-Upgrade Verification
- [ ] Test database connection
- [ ] Verify all migrations applied successfully
- [ ] Test Lob direct mail integration:
  ```javascript
  fetch('https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/send-direct-mail', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0eHFvZHFsZXh2b2pxcXhxdWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDMzNTksImV4cCI6MjA2ODIxOTM1OX0.xDv7hOEuQ_eRf4Efiyv4X7GsxQN-xDnGHRwLp5Qw_eM'
    },
    body: JSON.stringify({
      to_address: {
        name: 'Test Owner',
        address_line1: '210 King St',
        address_city: 'San Francisco',
        address_state: 'CA',
        address_zip: '94107'
      },
      template_type: 'land_acquisition',
      campaign_id: 'upgrade_test'
    })
  })
  .then(res => res.json())
  .then(data => console.log(data));
  ```
- [ ] Verify Edge Functions are responding
- [ ] Check application performance
- [ ] Monitor error logs for 24 hours

## 🔧 Environment Configuration

### Fixed Environment Variables
The following variables had spaces and have been corrected:

**Before → After:**
- `VITE_MAILERLITE WEBHOOK URL` → `VITE_MAILERLITE_WEBHOOK_URL`
- `VITE_MAILERLITE WEBHOOK NAME` → `VITE_MAILERLITE_WEBHOOK_NAME`
- `VITE_MAILERLITE SIGNING SECRET` → `VITE_MAILERLITE_SIGNING_SECRET`
- `Client Id` → `CLIENT_ID`
- `VITE_API_Zone ID` → `VITE_API_ZONE_ID`
- `VITE_Account ID` → `VITE_ACCOUNT_ID`
- `VITE_youtube key` → `VITE_YOUTUBE_KEY`
- `VITE_Unique ID` → `VITE_UNIQUE_ID`
- `TURNSTILE Site Key` → `TURNSTILE_SITE_KEY`
- `WEBHOOK URL` → `WEBHOOK_URL`
- `Account API Token` → `ACCOUNT_API_TOKEN`
- `FACEBOOK GRAPH API` → `FACEBOOK_GRAPH_API`
- `PAYPAL API CLIENT_ID` → `PAYPAL_API_CLIENT_ID`
- `BASE URL` → `BASE_URL`
- `Shorthand identifier for your profile` → `PROFILE_SHORTHAND`
- `service role auth3CLIENT_ID` → `SERVICE_ROLE_AUTH3_CLIENT_ID`
- `Client Secret` → `CLIENT_SECRET`

**Note:** If your application references these old variable names, update the code to use the new names.

## 🚨 Rollback Plan

If issues occur after upgrade:
1. Contact Supabase support immediately
2. Supabase can restore from automatic pre-upgrade backup
3. Document any errors or performance issues
4. Check Supabase status page: https://status.supabase.com/

## 📞 Support Resources

- **Supabase Dashboard:** https://supabase.com/dashboard/project/ltxqodqlexvojqqxquew
- **Supabase Support:** https://supabase.com/dashboard/support/new
- **Upgrade Documentation:** https://supabase.com/docs/guides/platform/migrating-and-upgrading-projects
- **Status Page:** https://status.supabase.com/

## ✅ Sign-Off

- [ ] Pre-upgrade checklist reviewed
- [ ] Team notified of scheduled downtime (if applicable)
- [ ] Monitoring tools ready
- [ ] Emergency contacts available
- [ ] Backup verification complete

---

**Ready to Upgrade:** Review all items above, then proceed via the dashboard.
