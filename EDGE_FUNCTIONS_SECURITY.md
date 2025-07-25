# Edge Functions Security Guide

This guide explains the security configuration for Supabase Edge Functions in the RepMotivatedSeller project.

## JWT Verification

JWT verification is a critical security feature that ensures only authenticated users can access protected Edge Functions. The `verify_jwt` setting in `config.toml` determines whether a function requires authentication.

### Configuration Overview

The project uses different security settings based on each function's purpose:

| Function | JWT Verification | Reason |
|----------|-----------------|--------|
| auth-test | ✅ Enabled | Tests authentication flow |
| admin-dashboard | ✅ Enabled | Contains sensitive admin operations |
| foreclosure-submission | ❌ Disabled | Public webhook endpoint |
| notification-dispatcher | ❌ Disabled | Internal service communication |
| send-notification-email | ❌ Disabled | Webhook trigger endpoint |
| schedule-property-followup | ✅ Enabled | Contains sensitive property data |
| schedule-follow-ups | ✅ Enabled | Contains sensitive customer data |
| external-api-integration | ✅ Enabled | Accesses external services with credentials |
| ai-voice-handler | ❌ Disabled | Twilio webhook endpoint |
| test-secrets | ✅ Enabled | Tests access to sensitive environment variables |
| weather-api | ❌ Disabled | Public demo endpoint |

## Authentication Methods

### 1. JWT Authentication (For Protected Functions)

For functions with `verify_jwt = true`, you must include a valid JWT token in the request:

```bash
curl -X POST "https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/admin-dashboard" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"summary"}'
```

To obtain a JWT token:

```bash
curl -X POST "https://ltxqodqlexvojqqxquew.supabase.co/auth/v1/token?grant_type=password" \
  -H "apikey: sb_publishable_wQE2WLlEvqE1RqWtNPcxGw_tSpNMwmg" \
  -H "Content-Type: application/json" \
  -d '{"email":"your-admin-email@example.com","password":"your-password"}'
```

### 2. Anonymous Access (For Public Functions)

Functions with `verify_jwt = false` can be accessed without authentication:

```bash
curl -X POST "https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/foreclosure-submission" \
  -H "Content-Type: application/json" \
  -d '{"property":"123 Main St"}'
```

### 3. Service Role Key (For Development Only)

For testing protected functions during development:

```bash
curl -X POST "https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/admin-dashboard" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0eHFvZHFsZXh2b2pxcXhxdWV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4OTk3NTc1MCwiZXhwIjoyMDA1NTUxNzUwfQ.Rl_0RZCnxQHvGFzQVxXdYgHWtgdTxj-Ot-uf-XnEkwE" \
  -H "Content-Type: application/json" \
  -d '{"action":"summary"}'
```

**IMPORTANT**: Never expose the service role key in client-side code or public repositories.

## Additional Security Measures

### 1. Role-Based Access Control

Even with JWT verification enabled, the admin-dashboard function implements additional role checks:

```typescript
// Check if user is an admin
const { data: adminProfile, error: adminError } = await supabaseClient
  .from('admin_profiles')
  .select('*')
  .eq('user_id', user.id)
  .single()

if (adminError || !adminProfile || adminProfile.role !== 'admin') {
  return new Response(
    JSON.stringify({ error: 'Forbidden: Admin access required' }),
    {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  )
}
```

### 2. CORS Headers

All functions implement proper CORS headers to control which domains can access them:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
}
```

For production, you should restrict 'Access-Control-Allow-Origin' to specific domains.

### 3. Environment Variables

Sensitive information is stored in environment variables, not in the function code:

```typescript
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  // ...
)
```

## Best Practices

1. **Principle of Least Privilege**: Only disable JWT verification when absolutely necessary
2. **Input Validation**: Always validate and sanitize user input
3. **Error Handling**: Return generic error messages to users, log detailed errors internally
4. **Rate Limiting**: Implement rate limiting for public endpoints
5. **Audit Logging**: Log all sensitive operations for security auditing

## Updating Security Configuration

To update the JWT verification settings:

1. Edit `supabase/config.toml`
2. Redeploy the affected functions:
   ```bash
   supabase functions deploy function-name --project-ref ltxqodqlexvojqqxquew
   ```

## Testing Security Configuration

Use the `auth-test` function to verify your JWT configuration is working correctly:

```bash
curl -X GET "https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/auth-test" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

If JWT verification is working, you'll receive a 200 response. If not, you'll get a 401 Unauthorized error.