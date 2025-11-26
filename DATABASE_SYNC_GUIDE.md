# Database Sync Guide - Local ↔ Supabase
## Automatic Synchronization Setup

---

## 🎯 Goal
Keep your local database and Supabase database in sync automatically, so data changes (not just schema migrations) are reflected in both directions.

---

## 📋 Table of Contents
1. [Approach 1: Direct Connection to Remote Database (Recommended for Development)](#approach-1-direct-connection)
2. [Approach 2: Supabase Local Dev with Push/Pull](#approach-2-supabase-local-dev)
3. [Approach 3: PostgreSQL Logical Replication](#approach-3-logical-replication)
4. [Approach 4: Real-time Sync with Triggers](#approach-4-realtime-sync)
5. [Approach 5: Connection Pooling with PgBouncer](#approach-5-connection-pooling)

---

## Approach 1: Direct Connection to Remote Database ⭐ RECOMMENDED

**Best for:** Development work where you want changes to immediately reflect in Supabase.

### Setup

#### Option A: Use Remote Database Directly (No Local DB)

**Configure your app to connect directly to Supabase:**

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// Always use remote database
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ltxqodqlexvojqqxquew.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)
```

**Update .env to always use remote:**
```bash
# Frontend - always points to remote
VITE_SUPABASE_URL=https://ltxqodqlexvojqqxquew.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend - direct connection to remote (pooled)
DATABASE_URL=postgresql://postgres:Medtronic%40007%24@db.ltxqodqlexvojqqxquew.supabase.co:6543/postgres?sslmode=require
```

**Benefits:**
- ✅ Zero setup required
- ✅ Changes are immediately in Supabase
- ✅ No sync needed
- ✅ Works offline? No (requires internet)

**When to use:** Most development scenarios, testing, quick iterations

---

## Approach 2: Supabase Local Dev with Push/Pull

**Best for:** Working offline or testing migrations before applying to production.

### Setup Local Supabase

```bash
# 1. Start local Supabase (includes PostgreSQL, Auth, Storage, etc.)
supabase start

# This creates:
# - Local PostgreSQL: postgresql://postgres:postgres@localhost:54322/postgres
# - Local API: http://localhost:54321
# - Local Studio: http://localhost:54323
```

### Sync Data Between Local and Remote

#### Push Changes to Remote

```bash
# Option 1: Push migrations only
supabase db push

# Option 2: Push data (using pg_dump/restore)
# Export from local
pg_dump "postgresql://postgres:postgres@localhost:54322/postgres" \
  --data-only \
  --table=your_table \
  > local_data.sql

# Import to remote
psql "postgresql://postgres:Medtronic%40007%24@db.ltxqodqlexvojqqxquew.supabase.co:5432/postgres?sslmode=require" \
  < local_data.sql
```

#### Pull Changes from Remote

```bash
# Pull schema changes
supabase db pull

# Pull data
pg_dump "postgresql://postgres:Medtronic%40007%24@db.ltxqodqlexvojqqxquew.supabase.co:5432/postgres?sslmode=require" \
  --data-only \
  --table=your_table \
  > remote_data.sql

psql "postgresql://postgres:postgres@localhost:54322/postgres" \
  < remote_data.sql
```

### Automated Sync Script

Create `sync-database.bat`:

```batch
@echo off
echo ============================================
echo Database Sync: Local ↔ Remote
echo ============================================

SET LOCAL_DB=postgresql://postgres:postgres@localhost:54322/postgres
SET REMOTE_DB=postgresql://postgres:Medtronic%%40007%%24@db.ltxqodqlexvojqqxquew.supabase.co:5432/postgres?sslmode=require

echo.
echo [1/3] Pulling schema from remote...
supabase db pull

echo.
echo [2/3] Applying migrations to local...
supabase db reset

echo.
echo [3/3] Syncing data...
echo Choose direction:
echo 1. Remote → Local (pull data)
echo 2. Local → Remote (push data)
echo 3. Both ways (merge)
set /p choice="Enter choice (1-3): "

if "%choice%"=="1" (
    echo Pulling data from remote to local...
    pg_dump "%REMOTE_DB%" --data-only > remote_data.sql
    psql "%LOCAL_DB%" < remote_data.sql
    del remote_data.sql
)

if "%choice%"=="2" (
    echo Pushing data from local to remote...
    pg_dump "%LOCAL_DB%" --data-only > local_data.sql
    psql "%REMOTE_DB%" < local_data.sql
    del local_data.sql
)

echo.
echo Sync complete!
pause
```

**Benefits:**
- ✅ Work offline
- ✅ Test migrations safely
- ✅ Full local environment
- ✅ Fast development

**Drawbacks:**
- ❌ Manual sync required
- ❌ Potential data conflicts
- ❌ Requires Docker

---

## Approach 3: PostgreSQL Logical Replication

**Best for:** Production environments requiring real-time sync between databases.

### Setup Logical Replication

#### On Remote Database (Publisher)

```sql
-- 1. Enable logical replication on Supabase
-- (Usually already enabled - check with support)

-- 2. Create publication for tables you want to sync
CREATE PUBLICATION local_sync FOR TABLE
  sms_consent,
  sms_message_log,
  sms_consent_audit,
  foreclosure_responses;

-- Or publish all tables:
CREATE PUBLICATION local_sync FOR ALL TABLES;
```

#### On Local Database (Subscriber)

```sql
-- 1. Create subscription to remote database
CREATE SUBSCRIPTION remote_sync
CONNECTION 'postgresql://postgres:Medtronic%40007%24@db.ltxqodqlexvojqqxquew.supabase.co:5432/postgres?sslmode=require'
PUBLICATION local_sync;

-- 2. Check replication status
SELECT * FROM pg_stat_subscription;
```

### Automated Setup Script

```sql
-- setup_replication.sql

-- On Remote (Supabase)
CREATE PUBLICATION supabase_to_local FOR ALL TABLES;

-- On Local
CREATE SUBSCRIPTION local_from_supabase
CONNECTION 'postgresql://postgres:Medtronic%40007%24@db.ltxqodqlexvojqqxquew.supabase.co:5432/postgres?sslmode=require'
PUBLICATION supabase_to_local
WITH (copy_data = true);
```

**Benefits:**
- ✅ Real-time sync (milliseconds)
- ✅ Automatic updates
- ✅ Bi-directional possible
- ✅ Production-ready

**Drawbacks:**
- ❌ Complex setup
- ❌ Requires PostgreSQL 10+
- ❌ May require Supabase support assistance

---

## Approach 4: Real-time Sync with Triggers

**Best for:** Selective sync of specific tables with custom logic.

### Create Sync Function

```sql
-- On Local Database
CREATE OR REPLACE FUNCTION sync_to_remote()
RETURNS TRIGGER AS $$
DECLARE
  remote_conn TEXT := 'postgresql://postgres:Medtronic%40007%24@db.ltxqodqlexvojqqxquew.supabase.co:5432/postgres?sslmode=require';
BEGIN
  -- Use dblink extension for remote connections
  PERFORM dblink_connect('remote', remote_conn);

  IF TG_OP = 'INSERT' THEN
    PERFORM dblink_exec('remote',
      format('INSERT INTO %I VALUES %L', TG_TABLE_NAME, NEW)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM dblink_exec('remote',
      format('UPDATE %I SET data = %L WHERE id = %L', TG_TABLE_NAME, NEW, NEW.id)
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM dblink_exec('remote',
      format('DELETE FROM %I WHERE id = %L', TG_TABLE_NAME, OLD.id)
    );
  END IF;

  PERFORM dblink_disconnect('remote');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Enable dblink extension
CREATE EXTENSION IF NOT EXISTS dblink;

-- Create triggers for tables to sync
CREATE TRIGGER sync_sms_consent_to_remote
AFTER INSERT OR UPDATE OR DELETE ON sms_consent
FOR EACH ROW EXECUTE FUNCTION sync_to_remote();

CREATE TRIGGER sync_messages_to_remote
AFTER INSERT OR UPDATE OR DELETE ON sms_message_log
FOR EACH ROW EXECUTE FUNCTION sync_to_remote();
```

**Benefits:**
- ✅ Selective sync
- ✅ Custom logic possible
- ✅ Can add transformations
- ✅ Works with any PostgreSQL version

**Drawbacks:**
- ❌ Performance overhead
- ❌ Requires dblink extension
- ❌ Manual trigger management

---

## Approach 5: Connection Pooling with PgBouncer

**Best for:** High-performance applications with many connections.

### Setup PgBouncer Locally

**Install PgBouncer:**
```bash
# Windows (using Chocolatey)
choco install pgbouncer

# Or download from: https://www.pgbouncer.org/downloads.html
```

**Configure pgbouncer.ini:**
```ini
[databases]
; Point local app to remote Supabase
mydb = host=db.ltxqodqlexvojqqxquew.supabase.co port=6543 dbname=postgres user=postgres password=Medtronic@007$

[pgbouncer]
listen_addr = 127.0.0.1
listen_port = 6432
auth_type = md5
auth_file = userlist.txt
pool_mode = transaction
max_client_conn = 100
default_pool_size = 20
```

**Create userlist.txt:**
```
"postgres" "md5<hash-of-password>"
```

**Use in your app:**
```bash
# Now connect to localhost, PgBouncer forwards to Supabase
DATABASE_URL=postgresql://postgres:Medtronic%40007%24@localhost:6432/mydb
```

**Benefits:**
- ✅ Connection pooling
- ✅ Better performance
- ✅ Connection limits management
- ✅ Automatic reconnection

---

## 🎯 Recommended Approach for Your Use Case

### For Development: **Approach 1** (Direct Connection)

**Configure .env.development:**
```bash
# Always use remote Supabase - changes reflect immediately
VITE_SUPABASE_URL=https://ltxqodqlexvojqqxquew.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:Medtronic%40007%24@db.ltxqodqlexvojqqxquew.supabase.co:6543/postgres?sslmode=require
```

**Benefits:**
- ✅ Zero setup
- ✅ Changes immediately in Supabase
- ✅ No sync scripts needed
- ✅ Team members see changes instantly

### For Production: **Approach 3** (Logical Replication)

If you need local → remote sync for production backups or multi-region setup.

---

## 🔧 Quick Setup: Direct Connection (Recommended)

### 1. Update .env files

```bash
# .env.development (local development)
VITE_SUPABASE_URL=https://ltxqodqlexvojqqxquew.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://postgres:Medtronic%40007%24@db.ltxqodqlexvojqqxquew.supabase.co:6543/postgres?sslmode=require

# .env.production (same as development for consistency)
VITE_SUPABASE_URL=https://ltxqodqlexvojqqxquew.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://postgres:Medtronic%40007%24@db.ltxqodqlexvojqqxquew.supabase.co:6543/postgres?sslmode=require
```

### 2. Update vite.config.ts (if needed)

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: true,
  },
  // Ensure env variables are loaded
  envPrefix: 'VITE_',
})
```

### 3. Test Connection

```bash
# Test remote connection
psql "postgresql://postgres:Medtronic%40007%24@db.ltxqodqlexvojqqxquew.supabase.co:6543/postgres?sslmode=require"

# Run query
SELECT current_database(), current_user, version();
```

### 4. Verify in Your App

```typescript
// Test in browser console
import { supabase } from './lib/supabase'

// Test query
const { data, error } = await supabase
  .from('sms_consent')
  .select('*')
  .limit(1)

console.log('Connection test:', data, error)
```

---

## 📊 Comparison Table

| Approach | Sync Speed | Setup Complexity | Offline Work | Best For |
|----------|------------|------------------|--------------|----------|
| **Direct Connection** | Instant | ⭐ Easy | ❌ No | Development |
| **Local Dev + Scripts** | Manual | ⭐⭐ Medium | ✅ Yes | Testing |
| **Logical Replication** | Real-time | ⭐⭐⭐⭐ Hard | Partial | Production |
| **Trigger Sync** | Real-time | ⭐⭐⭐ Medium | ❌ No | Selective sync |
| **PgBouncer** | Instant | ⭐⭐ Medium | ❌ No | Performance |

---

## 🚀 Next Steps

1. **Choose your approach** (recommend: Direct Connection for dev)
2. **Update .env files** to point to remote
3. **Test connection** with psql or Supabase Studio
4. **Verify in application** that changes reflect immediately
5. **Optional:** Set up automated backups

---

## 💡 Pro Tips

### Tip 1: Use Environment-Specific Configs
```bash
# .env.local (local development with local DB)
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# .env.development (development with remote DB)
DATABASE_URL=postgresql://postgres:pass@db.ltxqodqlexvojqqxquew.supabase.co:6543/postgres?sslmode=require

# .env.production (production)
DATABASE_URL=postgresql://postgres:pass@db.ltxqodqlexvojqqxquew.supabase.co:6543/postgres?sslmode=require
```

### Tip 2: Connection Pooling for Better Performance
Use the pooled connection (port 6543) for better performance with multiple queries.

### Tip 3: Monitor Connection Usage
```sql
-- Check active connections
SELECT * FROM pg_stat_activity WHERE datname = 'postgres';

-- Check connection limits
SELECT * FROM pg_settings WHERE name = 'max_connections';
```

---

## 🆘 Troubleshooting

### Issue: Changes not reflecting immediately

**Solution:**
1. Verify you're using remote database URL in .env
2. Check connection string has correct password encoding
3. Restart dev server: `npm run dev`
4. Clear browser cache and reload

### Issue: Too many connections

**Solution:**
1. Use pooled connection (port 6543)
2. Implement connection pooling with PgBouncer
3. Close connections properly in code

### Issue: Slow queries

**Solution:**
1. Use pooled connection instead of direct
2. Add indexes to frequently queried columns
3. Use Supabase connection pooling

---

## ✅ Summary

**For automatic sync where local changes reflect in Supabase:**

**Best Choice:** Use **Approach 1 (Direct Connection)**
- Point your app directly to remote Supabase database
- No sync needed - all changes are immediate
- Perfect for development and most use cases

```bash
# Just use this in .env:
VITE_SUPABASE_URL=https://ltxqodqlexvojqqxquew.supabase.co
DATABASE_URL=postgresql://postgres:Medtronic%40007%24@db.ltxqodqlexvojqqxquew.supabase.co:6543/postgres?sslmode=require
```

**That's it!** Your local app is now directly connected to Supabase, and all changes are automatically reflected.
