# SMS Monitoring System - Migration Fix Summary

## ✅ Problem Fixed

**Original Error:**
```
Failed reading config: Invalid db.major_version: 17.
```

**Root Cause:**
The `supabase/config.toml` file had PostgreSQL version 17 specified, but Supabase currently supports version 15 as the latest stable version.

**Fix Applied:**
Changed `supabase/config.toml` line 11 from:
```toml
major_version = 17
```
to:
```toml
major_version = 15
```

---

## 🚧 Current Status: Migration Pending

The configuration error is **FIXED**, but the migration still needs to be applied to your database.

**Why?** The `npm run supabase:migrations` command requires your database password, which isn't configured in the local environment files.

---

## 📋 How to Apply the Migration (Choose One Method)

### **Method 1: Manual Application via Supabase Dashboard (EASIEST)**

1. **Run the helper script:**
   ```bash
   apply-sms-migration.bat
   ```

   This will:
   - Open the Supabase SQL Editor in your browser
   - Open the migration file in Notepad

2. **In Notepad (migration file):**
   - Press `Ctrl+A` to select all
   - Press `Ctrl+C` to copy

3. **In Supabase SQL Editor:**
   - Click "New Query"
   - Press `Ctrl+V` to paste
   - Click "Run"
   - Wait for success message

4. **Verify tables created:**
   - Check that these tables now exist:
     - `sms_conversations`
     - `sms_alert_rules`
     - `sms_alert_history`
     - `sms_quick_replies`

---

### **Method 2: Configure Database Password & Use CLI**

If you prefer command-line:

1. **Get your database password:**
   - Go to: https://supabase.com/dashboard/project/ltxqodqlexvojqqxquew/settings/database
   - Find "Database password" or reset it

2. **Set environment variable:**
   ```bash
   set PGPASSWORD=your_database_password_here
   ```

3. **Run migration:**
   ```bash
   npm run supabase:migrations
   ```

---

## 🎯 After Migration is Applied

### 1. Verify Installation

Run these queries in the Supabase SQL Editor to confirm:

```sql
-- Check tables exist
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE 'sms_%';

-- Check alert rules (should return 5 rows)
SELECT rule_name, priority FROM sms_alert_rules
ORDER BY priority DESC;

-- Check quick replies (should return 5 rows)
SELECT title, category FROM sms_quick_replies
ORDER BY sort_order;
```

Expected results:
- **4 tables** created
- **5 alert rules** pre-configured
- **5 quick reply templates** ready to use

---

### 2. Access the SMS Dashboard

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Login as admin:**
   - Your user account must have `is_admin = true` in the `profiles` table
   - To check: `SELECT is_admin FROM profiles WHERE id = 'your-user-id'`
   - To update: `UPDATE profiles SET is_admin = true WHERE id = 'your-user-id'`

3. **Navigate to:**
   ```
   http://localhost:3000/admin/sms
   ```

---

### 3. Test the System

**Send a test SMS:**
1. Text your Twilio number: **(877) 806-4677**
2. Message example: "Help! I'm behind on my mortgage payments"

**Expected behavior:**
- Conversation appears in dashboard automatically
- Categorized as "Prospect" / "Foreclosure Assistance"
- Priority set to "Urgent"
- Alert email sent to: `admin@repmotivatedseller.shoprealestatespace.org`
- Alert SMS sent to: `+18778064677`

**Reply from dashboard:**
- Click the conversation
- Use "Foreclosure Help - Initial Response" quick reply
- Or type a custom message
- Click "Send"
- Verify SMS received on your phone

---

## 📊 What Was Installed

### Database Tables

| Table | Purpose | Records |
|-------|---------|---------|
| `sms_conversations` | Thread SMS messages by phone number | Auto-created on first message |
| `sms_alert_rules` | Configurable alert triggers | 5 pre-configured rules |
| `sms_alert_history` | Audit trail of all alerts sent | Created as alerts fire |
| `sms_quick_replies` | Response templates | 5 pre-loaded templates |

### Pre-Configured Alert Rules

1. **New Foreclosure Prospect** (Priority 100)
   - Triggers: foreclosure keywords
   - Contact type: Prospect
   - Alerts: Email + SMS

2. **New Real Estate Professional** (Priority 90)
   - Triggers: realtor/broker keywords
   - Contact type: Real Estate Professional
   - Alerts: Email only

3. **New Investor Inquiry** (Priority 85)
   - Triggers: funding/loan keywords
   - Contact type: Investor
   - Alerts: Email only

4. **Membership Help Request** (Priority 70)
   - Triggers: membership keywords
   - Contact type: Client
   - Alerts: Email only

5. **Urgent Keywords Detected** (Priority 150)
   - Triggers: emergency/asap/urgent/sheriff
   - Contact type: Any
   - Alerts: Email + SMS

### Quick Reply Templates

1. **Foreclosure Help - Initial Response**
2. **Loan Application - Next Steps**
3. **Real Estate Professional - Welcome**
4. **Membership Help**
5. **Business Hours**

---

## 📖 Documentation

Full guides available:
- `SMS_MONITORING_SYSTEM_GUIDE.md` - Comprehensive 50-page guide
- `SMS_MONITORING_QUICK_START.md` - 5-minute quick start

---

## 🔧 Troubleshooting

### "No conversations appearing"
- ✅ Verify migration applied successfully
- ✅ Check user has `is_admin = true`
- ✅ Verify SMS messages exist in `sms_message_log` table

### "Can't send messages"
- ✅ Check Twilio credentials in Supabase Edge Function secrets
- ✅ Verify `sms-handler` Edge Function is deployed
- ✅ Check browser console for errors

### "Alerts not working"
- ✅ Verify alert rules are active: `SELECT * FROM sms_alert_rules WHERE is_active = true`
- ✅ Check Edge Function logs in Supabase dashboard
- ✅ Verify email/SMS configuration in alert recipients

---

## ✅ Quick Checklist

**Configuration Fixed:**
- [x] PostgreSQL version corrected from 17 to 15
- [x] Helper script created (`apply-sms-migration.bat`)

**Migration Application (Do Now):**
- [ ] Apply migration via Supabase SQL Editor OR CLI
- [ ] Verify 4 tables created
- [ ] Verify 5 alert rules exist
- [ ] Verify 5 quick replies exist

**Testing (After Migration):**
- [ ] Set your user as admin (`is_admin = true`)
- [ ] Access `/admin/sms` dashboard
- [ ] Send test SMS to (877) 806-4677
- [ ] Verify conversation appears
- [ ] Test sending reply
- [ ] Verify alerts received

---

## 🚀 Ready to Deploy

Once testing is complete:

1. **Enable Realtime** in Supabase dashboard (if not already)
2. **Configure Twilio webhook** to point to your `sms-handler` function
3. **Set up email notifications** (MailerLite or SMTP)
4. **Train admin users** on dashboard usage
5. **Set response time SLAs** for different priority levels

---

**Support:** Refer to `SMS_MONITORING_QUICK_START.md` for detailed usage instructions

**Business Number:** (877) 806-4677
**Admin Email:** admin@repmotivatedseller.shoprealestatespace.org
