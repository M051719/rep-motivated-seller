# Supabase Edge Functions Guide for RepMotivatedSeller

This guide provides detailed information about the Supabase Edge Functions used in the RepMotivatedSeller project, including deployment instructions, testing procedures, and best practices.

## Table of Contents

1. [Overview](#overview)
2. [Available Edge Functions](#available-edge-functions)
3. [Deployment Methods](#deployment-methods)
4. [Authentication](#authentication)
5. [Testing Edge Functions](#testing-edge-functions)
6. [Environment Variables](#environment-variables)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

## Overview

Supabase Edge Functions are serverless functions that run on Deno at the edge. In the RepMotivatedSeller project, they handle various backend operations including:

- Admin dashboard API endpoints
- Email notifications
- Follow-up scheduling
- External API integrations
- Property submission processing

## Available Edge Functions

### 1. admin-dashboard

**Purpose**: Provides REST API endpoints for the admin dashboard.

**Endpoints**:

- `GET /admin-dashboard/submissions` - List property submissions with pagination and filtering
- `GET /admin-dashboard/submissions/{id}` - Get a single property submission by ID
- `GET /admin-dashboard/stats` - Get dashboard statistics
- `POST /admin-dashboard/follow-ups` - Add a follow-up to a property submission
- `PATCH /admin-dashboard/submissions/{id}` - Update a property submission

**File Location**: `supabase/functions/admin-dashboard/index.ts`

### 2. send-notification-email

**Purpose**: Sends email notifications when new property submissions are received.

**Triggers**: Database changes on the `property_submissions` table.

**File Location**: `supabase/functions/send-notification-email/index.ts`

### 3. schedule-follow-ups

**Purpose**: Schedules follow-up tasks for property submissions.

**Triggers**: Can be called manually or on a schedule.

**File Location**: `supabase/functions/schedule-follow-ups/index.ts`

### 4. external-api-integration

**Purpose**: Integrates with external CRM systems.

**Triggers**: New property submissions or manual calls.

**File Location**: `supabase/functions/external-api-integration/index.ts`

### 5. schedule-property-followup

**Purpose**: Handles property-specific follow-up scheduling.

**Triggers**: Based on property status changes.

**File Location**: `supabase/functions/schedule-property-followup/index.ts`

### 6. test-secrets

**Purpose**: Tests access to environment variables and secrets.

**Usage**: Development and debugging only.

**File Location**: `supabase/functions/test-secrets/index.ts`

### 7. weather-api

**Purpose**: Example function demonstrating external API integration.

**Usage**: Development and learning purposes.

**File Location**: `supabase/functions/weather-api/index.ts`

## Deployment Methods

### Method 1: Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/ltxqodqlexvojqqxquew/functions)
2. Click on the function you want to deploy (or create a new one)
3. Copy the code from the corresponding file in `supabase/functions/`
4. Paste into the editor and click "Deploy Function"

### Method 2: Batch Scripts

For convenience, use the provided batch scripts:

```bash
# Deploy all functions
scripts\deploy-all-functions.bat

# Deploy only admin dashboard
scripts\deploy-admin-dashboard.bat

# Deploy property-related functions
scripts\deploy-property-functions.bat
```

### Method 3: Supabase CLI (Advanced)

If you have the Supabase CLI configured:

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref ltxqodqlexvojqqxquew

# Deploy a specific function
supabase functions deploy admin-dashboard
```

## Authentication

Edge Functions can be accessed using two types of authentication:

### 1. JWT Authentication (Recommended for Production)

User authentication tokens are obtained after login:

```bash
# Get JWT token
curl -X POST "https://ltxqodqlexvojqqxquew.supabase.co/auth/v1/token?grant_type=password" \
  -H "apikey: sb_publishable_wQE2WLlEvqE1RqWtNPcxGw_tSpNMwmg" \
  -H "Content-Type: application/json" \
  -d '{"email":"your-admin-email@example.com","password":"your-password"}'

# Use token to call function
curl -X POST "https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/admin-dashboard" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"summary"}'
```

### 2. Service Role Key (Development Only)

For testing purposes only:

```bash
curl -X POST "https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/admin-dashboard" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0eHFvZHFsZXh2b2pxcXhxdWV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4OTk3NTc1MCwiZXhwIjoyMDA1NTUxNzUwfQ.Rl_0RZCnxQHvGFzQVxXdYgHWtgdTxj-Ot-uf-XnEkwE" \
  -H "Content-Type: application/json" \
  -d '{"action":"summary"}'
```

**IMPORTANT**: Never expose the service role key in client-side code or public repositories.

## Testing Edge Functions

### Using Batch Scripts

```bash
# Test all functions
scripts\test-functions.bat

# Test admin dashboard specifically
scripts\test-admin-dashboard.bat

# Simple test with minimal output
scripts\simple-test.bat
```

### Manual Testing with cURL

```bash
# Test admin dashboard
curl -X POST "https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/admin-dashboard" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"summary"}'

# Test with specific endpoint
curl -X GET "https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/admin-dashboard/submissions?status=new" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Viewing Logs

To view function logs in the Supabase dashboard:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/ltxqodqlexvojqqxquew/functions)
2. Select the function
3. Click on "Logs" tab

## Environment Variables

### Setting Environment Variables

```bash
# Set a single secret
supabase secrets set MY_SECRET=value --project-ref ltxqodqlexvojqqxquew

# Set multiple secrets
scripts\set-secrets.bat
```

### Required Environment Variables

For all functions:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key

For email notifications:

- `MAILERLITE_API_KEY`: MailerLite API key
- `FROM_EMAIL`: Sender email address
- `ADMIN_EMAIL`: Admin notification recipient

For Twilio integration:

- `TWILIO_ACCOUNT_SID`: Twilio account SID
- `TWILIO_AUTH_TOKEN`: Twilio auth token
- `TWILIO_PHONE_NUMBER`: Twilio phone number

### Viewing Environment Variables

```bash
# List all secrets
supabase secrets list --project-ref ltxqodqlexvojqqxquew
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**:
   - Verify JWT token is valid and not expired
   - Check that the user has admin privileges
   - Ensure correct Authorization header format: `Bearer YOUR_TOKEN`

2. **Deployment Failures**:
   - Check for TypeScript errors in your function code
   - Verify all imports are properly specified
   - Use `scripts\skip-ts-errors.bat` for temporary workarounds

3. **Runtime Errors**:
   - Check function logs in Supabase dashboard
   - Verify all required environment variables are set
   - Test with simplified requests to isolate issues

### Debugging Tips

1. Add console.log statements to your functions:

   ```typescript
   console.log("Request received:", JSON.stringify(req, null, 2));
   ```

2. Create a test endpoint that returns environment information:

   ```typescript
   if (path === "debug") {
     return new Response(
       JSON.stringify({
         env: Object.keys(Deno.env.toObject()),
         headers: Object.fromEntries(req.headers.entries()),
       }),
       { headers: { "Content-Type": "application/json" } },
     );
   }
   ```

3. Use the `test-secrets` function to verify environment variables are accessible

## Best Practices

1. **Security**:
   - Never expose service role keys in client code
   - Always validate user permissions before performing actions
   - Use CORS headers appropriately

2. **Performance**:
   - Keep functions small and focused
   - Minimize database queries
   - Use pagination for large result sets

3. **Error Handling**:
   - Always include try/catch blocks
   - Return appropriate HTTP status codes
   - Provide meaningful error messages

4. **Deployment**:
   - Back up functions before deployment
   - Test thoroughly in development before deploying
   - Use version control for function code

5. **Monitoring**:
   - Regularly check function logs
   - Set up alerts for function errors
   - Monitor function performance and usage

---

For additional assistance, refer to the [Supabase Edge Functions documentation](https://supabase.com/docs/guides/functions) or contact the development team.
