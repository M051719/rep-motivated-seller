# Apply SMS Compliance Migration - Fixed Version

## 🎯 Issues Fixed

### Issue 1: Incorrect Column Reference
The migration had an RLS policy referencing `profiles.role = 'admin'` but your schema uses `profiles.is_admin` boolean.

### Issue 2: Potential Column Conflicts
If `sms_message_log` or other SMS tables already existed with different column names, creating indexes would fail with "column does not exist" errors.

## ✅ Fixes Applied
1. **Added table drops** at migration start to ensure clean schema (no column conflicts)
2. **Changed RLS policy** from `profiles.role = 'admin'` to `profiles.is_admin = true`
3. **Added performance index:** `idx_profiles_id_is_admin` for faster admin checks
4. **Added function drops** before recreation to ensure clean function definitions

## 📋 Apply Migration via Supabase SQL Editor

### Step 1: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard/project/ltxqodqlexvojqqxquew/sql
2. Click **"New Query"**

### Step 2: Copy and Paste Migration
Copy the entire contents of the corrected migration file:
```
supabase/migrations/20251118000000_sms_consent_tracking.sql
```

### Step 3: Execute Migration
1. Click **"Run"** (or press `Ctrl+Enter`)
2. You should see: **"Success. No rows returned"**
3. You may see success notices:
   - `SMS Opt-In/Opt-Out compliance schema created successfully`
   - `TCPA compliance: STOP, START, HELP keywords configured`
   - `Ready for Twilio integration`

### Step 4: Verify Tables Created

Run this verification query in SQL Editor:
```sql
SELECT tablename, schemaname
FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE 'sms_%'
ORDER BY tablename;
```

**Expected Output:**
```
sms_consent
sms_consent_audit
sms_keywords
sms_message_log
```

### Step 5: Verify Keywords Inserted

```sql
SELECT keyword, action, is_active
FROM public.sms_keywords
ORDER BY priority DESC, keyword;
```

**Expected Output:** 11 keywords (START, YES, UNSTOP, STOP, STOPALL, UNSUBSCRIBE, CANCEL, END, QUIT, HELP, INFO)

### Step 6: Verify Indexes Created

```sql
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_sms%'
ORDER BY tablename, indexname;
```

**Expected Output:** 9 indexes including the new `idx_profiles_id_is_admin`

### Step 7: Test Connection

Run the connection test:
```bash
node test-connection.js
```

You should now see:
- ✅ Basic connection successful
- ✅ Table query successful (sms_keywords)
- ✅ Connection maintained

---

## 🔧 Alternative: Use Supabase CLI

If you prefer using CLI:

```bash
# Mark migration as not applied (so it can be re-applied)
supabase migration repair --status reverted 20251118000000

# Apply the migration
supabase db push

# Verify it was applied
supabase migration list
```

---

## 🧪 Test SMS Compliance Workflow

After migration is applied:

### 1. Test Opt-In via API
```bash
curl -X POST https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/sms-consent/opt-in \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "phone_number": "+15555551234",
    "method": "web_form",
    "marketing_consent": true
  }'
```

### 2. Test Opt-Out via SMS
Send SMS to your Twilio number:
```
STOP
```

Expected response:
```
You have been unsubscribed from RepMotivatedSeller SMS alerts. You will not receive further messages. Reply START to resubscribe.
```

### 3. Check Consent Status
```bash
curl -X GET "https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/sms-consent/status?phone_number=%2B15555551234" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### 4. View Audit Log
```sql
SELECT phone_number, action, new_status, method, created_at
FROM public.sms_consent_audit
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🚨 Troubleshooting

### Issue: "relation already exists"
**Solution:** This should NOT happen anymore because the migration now starts with `DROP TABLE IF EXISTS` statements. However, if it still occurs, the migration will handle it automatically.

**Note:** The migration now includes:
```sql
-- At the very start of migration
DROP TABLE IF EXISTS public.sms_consent_audit CASCADE;
DROP TABLE IF EXISTS public.sms_message_log CASCADE;
DROP TABLE IF EXISTS public.sms_keywords CASCADE;
DROP TABLE IF EXISTS public.sms_consent CASCADE;
```

This ensures a clean slate before creating tables.

### Issue: "column profiles.is_admin does not exist"
**Solution:** Verify profiles table schema:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
AND column_name IN ('role', 'is_admin');
```

If `is_admin` doesn't exist, you need to add it:
```sql
ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
```

### Issue: Migration runs but no notices appear
**Cause:** Some SQL clients don't show NOTICE messages.
**Solution:** Verify tables exist using the verification query in Step 4 above.

---

## ✅ Success Criteria

You'll know it worked when:

1. ✅ All 4 SMS tables exist (`sms_consent`, `sms_message_log`, `sms_consent_audit`, `sms_keywords`)
2. ✅ 11 keywords inserted in `sms_keywords` table
3. ✅ 9 indexes created (8 SMS + 1 profiles admin index)
4. ✅ Connection test shows successful queries
5. ✅ Supabase Dashboard shows **"Connected"** status
6. ✅ `test-connection.js` runs without errors

---

## 📊 Database Connection After Migration

Once migration is applied, test your connection:

```bash
# Test with Node.js
node test-connection.js

# Or start dev server
npm run dev
```

Then check Supabase Dashboard:
https://supabase.com/dashboard/project/ltxqodqlexvojqqxquew

You should see **"Connected"** indicator.

---

## 🔐 Next Steps: Configure Twilio

After migration is applied and verified:

1. **Set Twilio Environment Variables** in Supabase Edge Functions:
   ```bash
   supabase secrets set TWILIO_ACCOUNT_SID=your_account_sid
   supabase secrets set TWILIO_AUTH_TOKEN=your_auth_token
   supabase secrets set TWILIO_PHONE_NUMBER=your_twilio_number
   ```

2. **Configure Twilio Webhook**:
   - Go to: https://console.twilio.com/
   - Navigate to: Phone Numbers > Manage > Active Numbers
   - Click your number
   - Under "Messaging", set webhook URL to:
     ```
     https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/sms-handler
     ```
   - Method: POST
   - Click Save

3. **Test End-to-End**:
   - Send "START" to your Twilio number
   - Should receive opt-in confirmation
   - Check database: `SELECT * FROM sms_consent WHERE phone_number = '+1YOUR_NUMBER';`
   - Send "STOP" to opt-out
   - Verify in database that status changed to 'opted_out'

4. **Add Frontend Component**:
   - Integrate `SMSConsentManager.tsx` into user settings page
   - Update foreclosure form to include SMS opt-in checkbox

---

## 📝 Migration File Location

The corrected migration file is at:
```
supabase/migrations/20251118000000_sms_consent_tracking.sql
```

**Key Changes Made:**
- Line 190: `profiles.role = 'admin'` → `profiles.is_admin = true`
- Line 132: Added performance index for admin checks

---

**Status:** ✅ Migration file corrected and ready to apply

Apply it now using Step 1-3 above via Supabase SQL Editor!
