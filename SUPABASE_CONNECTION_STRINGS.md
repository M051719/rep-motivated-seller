# Supabase Connection Strings Reference
## Project: ltxqodqlexvojqqxquew

---

## 📱 Frontend (React/Vite) - Browser Only

**Use Supabase JavaScript Client - NOT PostgreSQL connection strings!**

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ltxqodqlexvojqqxquew.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0eHFvZHFsZXh2b2pxcXhxdWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDMzNTksImV4cCI6MjA2ODIxOTM1OX0.xDv7hOEuQ_eRf4Efiyv4X7GsxQN-xDnGHRwLp5Qw_eM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**Environment Variables (.env):**
```bash
VITE_SUPABASE_URL=https://ltxqodqlexvojqqxquew.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0eHFvZHFsZXh2b2pxcXhxdWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDMzNTksImV4cCI6MjA2ODIxOTM1OX0.xDv7hOEuQ_eRf4Efiyv4X7GsxQN-xDnGHRwLp5Qw_eM
```

---

## 🖥️ Backend - PostgreSQL Connection Strings

### Option 1: Pooled Connection (Port 6543) - ⭐ RECOMMENDED
**Use for:** Most backend operations (better performance, connection pooling)

```bash
# Correct format (NO pgbouncer=true):
DATABASE_URL=postgresql://postgres:Medtronic%40007%24@db.ltxqodqlexvojqqxquew.supabase.co:6543/postgres?sslmode=require
```

**Why no `pgbouncer=true`?**
- PgBouncer is already active on port 6543
- Adding the parameter causes issues with psql and many ORMs
- It's automatically detected by the port number

### Option 2: Direct Connection (Port 5432)
**Use for:** Session-level features (temp tables, advisory locks, LISTEN/NOTIFY)

```bash
DIRECT_URL=postgresql://postgres:Medtronic%40007%24@db.ltxqodqlexvojqqxquew.supabase.co:5432/postgres?sslmode=require
```

### Option 3: AWS Multi-Tenant Pooler (Alternative)
**Use if:** You need the AWS pooler specifically

```bash
# Pooled (port 6543):
DATABASE_URL=postgresql://postgres.ltxqodqlexvojqqxquew:Medtronic%40007%24@aws-0-us-east-2.pooler.supabase.com:6543/postgres?sslmode=require

# Direct (port 5432):
DIRECT_URL=postgresql://postgres.ltxqodqlexvojqqxquew:Medtronic%40007%24@aws-0-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require
```

**Note:** Username is `postgres.ltxqodqlexvojqqxquew` (with project ref) for AWS pooler.

---

## 🔑 Edge Functions - Supabase Client

**Set in Supabase Dashboard → Edge Functions → Secrets:**

```bash
SUPABASE_URL=https://ltxqodqlexvojqqxquew.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0eHFvZHFsZXh2b2pxcXhxdWV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjY0MzM1OSwiZXhwIjoyMDY4MjE5MzU5fQ.agVifh1Zwl1ohX75eZVw2NDV6GkO2iuIAS2pfvNMeTE
```

**In Edge Function code:**
```typescript
import { createClient } from 'jsr:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)
```

---

## 🛠️ Command Line Tools (psql, Supabase CLI)

### Using psql:

```bash
# Pooled connection (6543):
psql "postgresql://postgres:Medtronic%40007%24@db.ltxqodqlexvojqqxquew.supabase.co:6543/postgres?sslmode=require"

# Direct connection (5432):
psql "postgresql://postgres:Medtronic%40007%24@db.ltxqodqlexvojqqxquew.supabase.co:5432/postgres?sslmode=require"
```

### Using Supabase CLI:
```bash
# Links to remote project automatically
supabase link --project-ref ltxqodqlexvojqqxquew

# Then use:
supabase db push
supabase db pull
```

---

## 📊 Quick Reference Table

| Use Case | Port | Connection String | Username |
|----------|------|-------------------|----------|
| **Frontend (browser)** | N/A | Use Supabase JS client | N/A |
| **Backend queries (pooled)** | 6543 | `postgres://postgres:pass@db...` | `postgres` |
| **Backend session ops** | 5432 | `postgres://postgres:pass@db...` | `postgres` |
| **AWS Pooler** | 6543 | `postgres://postgres.project:pass@aws...` | `postgres.ltxqodqlexvojqqxquew` |
| **Edge Functions** | N/A | Use Supabase JS client | N/A |
| **Migrations/Admin** | 5432 or CLI | Use Supabase CLI or direct | `postgres` |

---

## ⚠️ Common Mistakes to Avoid

### ❌ Don't Do This:
```bash
# Don't add pgbouncer=true on port 6543:
DATABASE_URL=postgresql://...6543/postgres?pgbouncer=true  # ❌

# Don't use Postgres connection string in frontend:
const supabase = new Client("postgresql://...")  # ❌

# Don't use wrong username for AWS pooler:
postgres:password@aws-0-...  # ❌ (missing project ref in username)
```

### ✅ Do This Instead:
```bash
# Pooled connection (correct):
DATABASE_URL=postgresql://...6543/postgres?sslmode=require  # ✅

# Frontend (correct):
const supabase = createClient(url, anonKey)  # ✅

# AWS pooler (correct):
postgres.ltxqodqlexvojqqxquew:password@aws-0-...  # ✅
```

---

## 🔐 Password Encoding

Your password: `Medtronic@007$`
URL-encoded: `Medtronic%40007%24`

**Special characters in passwords MUST be URL-encoded:**
- `@` → `%40`
- `$` → `%24`
- `#` → `%23`
- `&` → `%26`
- `=` → `%3D`
- `+` → `%2B`
- ` ` (space) → `%20`

---

## 📝 SMS Compliance - Additional Variables

Add these for the SMS opt-in/opt-out system:

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACc3e11adc363709f0252ae8d2cf26ae29
TWILIO_AUTH_TOKEN=28640c6e07a1989260c623c7d924dab0
TWILIO_PHONE_NUMBER=+18778064677

# For Edge Functions (set in Supabase Dashboard):
SUPABASE_URL=https://ltxqodqlexvojqqxquew.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
TWILIO_ACCOUNT_SID=ACc3e11adc363709f0252ae8d2cf26ae29
TWILIO_AUTH_TOKEN=28640c6e07a1989260c623c7d924dab0
TWILIO_PHONE_NUMBER=+18778064677
```

---

## 🚀 Ready to Use

**Your connection strings are correct if:**
- ✅ Frontend uses `createClient(url, anonKey)`
- ✅ Backend uses port 6543 for pooled queries
- ✅ Backend uses port 5432 for session operations
- ✅ No `pgbouncer=true` parameter in connection strings
- ✅ Password is URL-encoded in connection strings
- ✅ Edge Functions use service role key from environment

**All systems deployed and ready for SMS compliance testing!**
