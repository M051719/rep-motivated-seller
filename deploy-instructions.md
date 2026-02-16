# Deploying the Updated Admin Dashboard Edge Function

## Option 1: Deploy via Supabase Dashboard (Recommended)

1. Go to the Supabase Dashboard at https://supabase.com/dashboard/project/ltxqodqlexvojqqxquew/functions
2. Click on the existing "admin-dashboard" function or create a new one
3. Copy the code from `supabase/functions/admin-dashboard/index.ts`
4. Paste the code into the editor
5. Click "Deploy Function"

## Option 2: Deploy via Supabase CLI (If Available)

If you have the Supabase CLI working:

```bash
cd rep-motivated-seller
supabase functions deploy admin-dashboard --project-ref ltxqodqlexvojqqxquew
```

## Testing the Deployed Function

### Using the Service Role Key (For Testing Only)

```bash
curl -X POST "https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/admin-dashboard" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0eHFvZHFsZXh2b2pxcXhxdWV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4OTk3NTc1MCwiZXhwIjoyMDA1NTUxNzUwfQ.Rl_0RZCnxQHvGFzQVxXdYgHWtgdTxj-Ot-uf-XnEkwE" \
  -H "Content-Type: application/json" \
  -d '{"action":"summary"}'
```

### Using a User JWT Token (For Production)

1. First, get a JWT token by logging in:

```bash
curl -X POST "https://ltxqodqlexvojqqxquew.supabase.co/auth/v1/token?grant_type=password" \
  -H "apikey: sb_publishable_wQE2WLlEvqE1RqWtNPcxGw_tSpNMwmg" \
  -H "Content-Type: application/json" \
  -d '{"email":"your-admin-email@example.com","password":"your-password"}'
```

2. Then use the token to call the function:

```bash
curl -X POST "https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/admin-dashboard" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"summary"}'
```

## Important Notes

1. The function requires a valid JWT token from an authenticated user with admin privileges
2. The service role key should only be used for testing, not in production code
3. In production, your frontend application should handle authentication and pass the user's JWT token to the function

## Function Endpoints

The updated function supports the following endpoints:

- `GET /admin-dashboard/submissions` - List property submissions with pagination and filtering
- `GET /admin-dashboard/submissions/{id}` - Get a single property submission by ID
- `GET /admin-dashboard/stats` - Get dashboard statistics
- `POST /admin-dashboard/follow-ups` - Add a follow-up to a property submission
- `PATCH /admin-dashboard/submissions/{id}` - Update a property submission
