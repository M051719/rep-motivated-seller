# 🔌 Establish Supabase Connection - Quick Fix Guide

## 🎯 Issue - RESOLVED ✅
Supabase Dashboard showed "Not Connected" because:
1. ~~SMS compliance tables don't exist yet~~ **FIXED**: Migration had RLS policy error (wrong column name)
2. Migration referenced `profiles.role = 'admin'` but schema uses `profiles.is_admin` boolean

**Status:** Migration file corrected and ready to apply!

---

> **📖 SEE DETAILED GUIDE:** For complete step-by-step instructions with troubleshooting, see:
> **[APPLY_SMS_MIGRATION.md](./APPLY_SMS_MIGRATION.md)**

---

## ✅ Solution Steps

### Step 1: Apply SMS Compliance Migration

**Option A: Via Supabase SQL Editor (Easiest) ⭐ RECOMMENDED**

1. Go to: [Supabase SQL Editor](https://supabase.com/dashboard/project/ltxqodqlexvojqqxquew/sql)

2. Click "New Query"

3. Copy and paste the entire contents of:
   ```
   supabase/migrations/20251118000000_sms_consent_tracking.sql
   ```

4. Click "Run" (or press Ctrl+Enter)

5. You should see: "Success. No rows returned"

6. Verify tables created:
   ```sql
   SELECT tablename
   FROM pg_tables
   WHERE schemaname = 'public'
   AND tablename LIKE 'sms_%'
   ORDER BY tablename;
   ```

   Should return:
   - sms_consent
   - sms_consent_audit
   - sms_keywords
   - sms_message_log

**Option B: Mark Migration as Un-applied and Re-apply**

```bash
# 1. Mark as not applied
supabase migration repair --status reverted 20251118000000

# 2. Apply it
supabase db push
```

---

### Step 2: Update Your .env File

Copy `.env.connection` to `.env`:

```bash
copy .env.connection .env
```

Or manually ensure your `.env` has:

```bash
# Frontend connection (browser)
VITE_SUPABASE_URL=https://ltxqodqlexvojqqxquew.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0eHFvZHFsZXh2b2pxcXhxdWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDMzNTksImV4cCI6MjA2ODIxOTM1OX0.xDv7hOEuQ_eRf4Efiyv4X7GsxQN-xDnGHRwLp5Qw_eM

# Backend connection (if using PostgreSQL directly)
DATABASE_URL=postgresql://postgres:Medtronic%40007%24@db.ltxqodqlexvojqqxquew.supabase.co:6543/postgres?sslmode=require
```

---

### Step 3: Test Connection

**Test with Node.js:**
```bash
node test-connection.js
```

**Or test with your dev server:**
```bash
npm run dev
```

Then in browser console:
```javascript
import { supabase } from './lib/supabase'

// Test query
const { data, error } = await supabase
  .from('sms_keywords')
  .select('*')
  .limit(5)

console.log('Connection test:', { data, error })
```

---

### Step 4: Maintain Connection (Show as "Connected" in Dashboard)

**Option A: Keep Dev Server Running**

```bash
npm run dev
```

As long as your app is running and making queries, Supabase will show "Connected"

**Option B: Run Continuous Connection Test**

```bash
node test-connection.js
```

This keeps the connection alive and active.

**Option C: Run in Background**

Create `keep-alive.js`:
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ltxqodqlexvojqqxquew.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
)

// Keep connection alive with periodic queries
setInterval(async () => {
  const { data } = await supabase.from('sms_keywords').select('count').limit(1)
  console.log(new Date().toISOString(), 'Connection alive')
}, 30000) // Every 30 seconds

console.log('Supabase connection keep-alive started...')
```

Run it:
```bash
node keep-alive.js
```

---

## 🎯 Quick Commands Reference

### Apply Migration (SQL Editor)
```sql
-- Run this in Supabase SQL Editor
-- Copy from: supabase/migrations/20251118000000_sms_consent_tracking.sql
```

### Verify Tables Exist
```sql
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE 'sms_%';
```

### Test Connection
```bash
# Node.js test
node test-connection.js

# Or start dev server
npm run dev
```

### Check Connection Status
Go to: https://supabase.com/dashboard/project/ltxqodqlexvojqqxquew

Look for "Connected" indicator in top right or Activity tab.

---

## 🔍 Troubleshooting

### Issue: "relation does not exist"
**Fix:** Migration not applied. Follow Step 1 above.

### Issue: Still shows "Not Connected"
**Fix:**
1. Make sure your app is running (`npm run dev`)
2. Make a query to the database
3. Refresh the Dashboard page

### Issue: Connection string doesn't work
**Fix:**
1. Check password encoding: `Medtronic@007$` → `Medtronic%40007%24`
2. Try both connection options:
   - `db.ltxqodqlexvojqqxquew.supabase.co:6543` (direct)
   - `aws-0-us-east-2.pooler.supabase.com:6543` (pooler)

### Issue: IPv4 error
**Fix:** Use AWS pooler connection string (see `.env.connection` file)

---

## ✅ Success Criteria

You'll know it's working when:
1. ✅ Migration applied (tables exist)
2. ✅ App runs without connection errors
3. ✅ Dashboard shows "Connected"
4. ✅ Test queries return data
5. ✅ Edge Functions can query database

---

## 📊 What "Connected" Means in Dashboard

The Supabase Dashboard shows "Connected" when:
- Active database connections exist
- Queries are being made
- Real-time subscriptions are active
- Edge Functions are running

**It does NOT mean:**
- Your app is configured correctly (it might still be misconfigured)
- Migrations are applied (separate concern)

**Think of it as:** "Is anyone actively using the database right now?"

---

## 🚀 Final Steps

1. **Apply Migration** (SQL Editor - Step 1)
2. **Update .env** (Step 2)
3. **Start Dev Server** (`npm run dev`)
4. **Check Dashboard** - Should show "Connected"
5. **Test SMS Compliance** (send "START" to Twilio number)

---

## 📝 Next Actions

After establishing connection:

1. ✅ Configure Twilio webhook
2. ✅ Test SMS opt-in/opt-out
3. ✅ Add SMSConsentManager to user settings page
4. ✅ Update foreclosure form with SMS opt-in checkbox

---

## 🔧 What Was Fixed

**Before (Error):**
```sql
-- RLS policy referenced non-existent column
WHERE profiles.role = 'admin'  -- ❌ This column doesn't exist
```

**After (Fixed):**
```sql
-- Now uses correct boolean column
WHERE profiles.is_admin = true  -- ✅ Correct!
```

**Bonus:** Added performance index for faster admin checks:
```sql
CREATE INDEX idx_profiles_id_is_admin ON public.profiles(id, is_admin) WHERE is_admin = true;
```

---

**Connection Status:** ✅ Migration Fixed - Ready to Apply

**Next Step:** Apply the corrected migration in SQL Editor (see [APPLY_SMS_MIGRATION.md](./APPLY_SMS_MIGRATION.md) for detailed instructions)
