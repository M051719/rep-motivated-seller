# DB Ping + CI Precheck (database-tests.yml)

## What this does
Adds a fast DB connectivity check (`db:ping`) that runs **before** migrations in CI so broken credentials/network/SSL fail fast prior to `supabase db push`.

## Usage

### Local Supabase
```
DATABASE_URL="postgresql://postgres:postgres@localhost:54322/postgres" npm run db:ping
```

### Remote Supabase / pooler (SSL)
If the connection string includes sslmode=require, the script enables SSL automatically.
```
DATABASE_URL="postgresql://...sslmode=require" npm run db:ping
```

### Override URL
```
npm run db:ping -- --url "postgresql://...sslmode=require"
```

## CI secrets required
- SUPABASE_PROJECT_REF
- SUPABASE_ACCESS_TOKEN
- DATABASE_URL

## Verification
- Good URL should print `✅ DB ping OK: { ok: 1, db: ..., user: ..., now: ... }` and exit 0
- Bad URL should print `❌ DB ping FAILED:` and exit non-zero
- CI workflow order should be: supabase link → db:ping → supabase db push → supabase test db

---

# Minimal git-diff checklist (file-by-file)

- `src/lib/database/connection-pool.ts`
  - init/reset added, initOptions stored
  - singleton rebuild on init when instance exists
  - default export preserved
  - named export `{ DatabasePool }` added
  - removed unsupported `min`

- `scripts/db-connection-test.ts`
  - now uses `DatabasePool`
  - supports `--url`
  - SSL only when `sslmode=require`
  - timeouts/max set
  - non-zero exit on failure + always resets pool

- `package.json`
  - adds `db:ping` script
  - adds `ts-node` devDependency

- `.github/workflows/database-tests.yml`
  - split to link → db:ping → db push/test

- `README.md`
  - adds db:ping usage section

- `DB_PING_CI_PRECHECK.md`
  - new doc with summary + verification steps
