# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RepMotivatedSeller is a foreclosure assistance platform built with:
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase Edge Functions (Deno runtime)
- **Database**: PostgreSQL via Supabase with Row Level Security (RLS)
- **Auth**: Supabase Auth with PKCE flow
- **Integrations**: MailerLite (email), Twilio (SMS), CRM systems (HubSpot/Salesforce/Pipedrive), AI voice handling

The project uses a hybrid architecture with both a React SPA and static HTML fallback options. Development is Windows-centric with `.bat` scripts throughout.

## Development Commands

```bash
# Development
npm run dev                    # Start dev server on port 3000
npm run build                  # TypeScript compile + Vite build
npm run typecheck              # Run TypeScript type checking
npm run lint                   # ESLint check
npm run preview                # Preview production build

# Supabase Local Development
npm run supabase:start         # Start local Supabase (Docker)
npm run supabase:stop          # Stop local Supabase
npm run supabase:types         # Generate TypeScript types from DB schema
npm run supabase:reset         # Reset local DB to migrations

# Supabase Deployment
npm run supabase:deploy        # Deploy all Edge Functions
npm run supabase:migrations    # Push migrations to remote DB

# Database Operations
npm run db:migrate             # Apply pending migrations
npm run db:status              # Check DB connection and version
npm run db:backup              # Create timestamped SQL backup

# RLS Policy Management
npm run policy:health          # Check RLS policy health
npm run policy:audit           # Audit policy configuration
npm run policy:consolidate-dry # Preview policy consolidation
npm run policy:consolidate     # Consolidate duplicate policies

# Testing
npm run test                   # Run Vitest tests
npm run test:watch             # Watch mode
npm run test:connection        # Test Supabase connection
npm run health-check           # Quick health check
```

## Environment Configuration

The project uses multiple `.env` files:
- `.env` - Main local development config
- `.env.development` - Development-specific overrides
- `.env.production.local` - Production values
- `.env.supabase` - Supabase-specific vars

**Critical variables for frontend** (must have `VITE_` prefix):
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

**Edge Function environment** (set in Supabase dashboard or config.toml):
- `SUPABASE_SERVICE_ROLE_KEY` - Service role for admin operations
- `MAILERLITE_API_KEY` - Email integration
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` - SMS integration
- `HUBSPOT_API_KEY` - CRM integration (if using HubSpot)

See `.env.example` for complete list.

## Architecture

### Frontend Structure
```
src/
├── components/          # React components
│   ├── ForeclosureQuestionnaire.tsx  # Main form for property submissions
│   ├── AdminDashboard.tsx            # Admin interface
│   ├── AuthForm.tsx                  # Login/signup
│   └── ProtectedRoute.tsx            # Auth guard wrapper
├── contexts/            # React contexts (AuthContext)
├── pages/               # Route pages (Homepage, BookConsultation, etc)
├── lib/
│   └── supabase.ts      # Supabase client with PKCE auth config
└── App.tsx              # Main router with public/protected routes
```

### Edge Functions
Located in `supabase/functions/`, each function is a standalone Deno module:

**Core Functions:**
- `admin-dashboard` - REST API for admin operations (CRUD on submissions)
- `public-form-handler` - Process foreclosure form submissions
- `send-notification-email` - Email notifications via MailerLite
- `sms-handler` - SMS processing and responses via Twilio

**Integration Functions:**
- `external-api-integration` - Multi-provider CRM integration
- `calendly-webhook` - Consultation booking webhook
- `payment-webhook`, `paypal-webhook`, `stripe-webhook` - Payment processing
- `unified-webhook` - Central webhook router

**AI/Automation:**
- `ai-voice-handler` - AI-powered voice call handling
- `schedule-follow-ups`, `schedule-property-followup` - Automated follow-up scheduling
- `tts-processor` - Text-to-speech processing

**Security/Compliance:**
- `compliance-logger` - GLBA compliance logging
- `policy-manager` - RLS policy management
- `privacy-request` - Handle privacy/GDPR requests
- `security-scanner` - Security scanning utilities

All functions share authentication patterns via `_shared/` utilities.

### Database Schema

The database uses a migration-based approach with files in `supabase/migrations/`:

**Key migration sequences:**
1. `20230101000000_initial_schema.sql` - Base tables (foreclosure_responses, notification_settings, etc)
2. `20231028010*` - Security audit system, user roles, admin logs, dashboard views
3. `20250103000*` - API views, RPC functions, hardening, compliance
4. `20250625140000_ai_call_system.sql` - AI voice call tables
5. `20250915170044_glba_compliance_tables.sql` - Financial compliance (GLBA)

**Important tables:**
- `foreclosure_responses` - Property submission data
- `notification_settings` - User notification preferences
- `admin_operation_logs` - Audit trail for admin actions
- `legal_documents` - Terms, privacy policy, etc
- `payments` - Payment tracking

All tables use RLS policies for security. Use `npm run policy:health` to check policy configuration.

## Authentication Flow

The app uses Supabase Auth with PKCE flow:
1. Frontend: Managed by `AuthContext` (`src/contexts/AuthContext`)
2. Client initialization: `src/lib/supabase.ts` with `persistSession: true`
3. Protected routes: Wrapped with `<ProtectedRoute>` component
4. Edge Functions: JWT verification in each function's auth middleware

Session tokens expire in 900 seconds (15 minutes) with refresh token rotation enabled.

## Deployment

### Frontend Deployment
```bash
npm run build  # Creates dist/ folder
# Deploy dist/ to Cloudflare Pages, Netlify, or serve with Nginx
```

For Cloudflare Pages, use `_redirects` file for SPA routing.

### Edge Functions Deployment
```bash
npm run supabase:deploy  # Deploys all functions
# Or deploy individually via Supabase dashboard
```

Functions are deployed to: `https://ltxqodqlexvojqqxquew.functions.supabase.co/{function-name}`

### Database Migrations
```bash
npm run supabase:migrations  # Push local migrations to remote
```

Always test migrations locally first with `npm run supabase:reset`.

## Common Workflows

### Adding a New Edge Function
1. Create directory: `supabase/functions/my-function/`
2. Create `index.ts` with Deno imports
3. Add to deployment: `supabase functions deploy my-function`
4. Set environment secrets in Supabase dashboard or via CLI
5. Test with `curl` or Postman

### Modifying Database Schema
1. Create new migration: `supabase migration new my_changes`
2. Write SQL in the generated file
3. Apply locally: `npm run supabase:reset`
4. Test thoroughly
5. Push to production: `npm run supabase:migrations`

### Updating RLS Policies
1. Check current health: `npm run policy:health`
2. Modify policies in migration file
3. Test with `npm run supabase:reset`
4. Audit: `npm run policy:audit`
5. Push when ready

### Testing Supabase Connection
```bash
npm run test:connection     # Full diagnostic
npm run health-check        # Quick check
```

Or use the `testConnection()` function from `src/lib/supabase.ts` in browser console.

## Windows-Specific Notes

The project includes many `.bat` scripts in the root and `scripts/` directory for Windows development:
- `MASTER-PRODUCTION-DEPLOY.bat` - Full production deployment
- `backup-and-deploy.bat` - Backup before deploying
- `test-form-submission.bat` - Test form functionality
- Various Twilio, auth, and admin testing scripts

When working on Windows, prefer these scripts. When converting to Unix, replace with shell scripts.

## Integration Points

### MailerLite
- API endpoint: `https://connect.mailerlite.com/api/`
- Used for: Lead notifications, automated emails
- Groups: `new_leads`, `urgent_cases`, `foreclosure_clients`

### Twilio
- Used for: SMS notifications, AI voice handling
- Webhook URL: Set in Twilio console to point to `sms-handler` or `ai-voice-handler` functions

### CRM Integration
- Supports: HubSpot, Salesforce, Pipedrive, or custom
- Configure via `CRM_TYPE` environment variable
- Implementation: `supabase/functions/external-api-integration/`

## Security Considerations

- **Never commit** `.env` files with real credentials
- Service role keys should only be used in Edge Functions, never in frontend
- All database access is protected by RLS policies
- JWT tokens are verified in Edge Functions before processing
- Admin operations are logged in `admin_operation_logs` table
- GLBA compliance logging is enabled for financial data

## Troubleshooting

### Build Failures
Check Node version (requires >=18.0.0) and ensure all dependencies are installed. The project previously had esbuild issues, which led to the static HTML fallback option.

### Supabase Connection Issues
1. Verify environment variables are set correctly with `VITE_` prefix
2. Check Supabase project is running: https://supabase.com/dashboard/project/ltxqodqlexvojqqxquew
3. Test connection: `npm run health-check`
4. Check browser console for CORS or CSP errors

### Edge Function Errors
1. Check function logs in Supabase dashboard
2. Verify environment secrets are set
3. Ensure JWT token is being sent in Authorization header
4. Test locally: `supabase functions serve {function-name}`

### RLS Policy Issues
1. Run health check: `npm run policy:health`
2. Check for conflicting policies: `npm run policy:audit`
3. Review policy definitions in migration files
4. Use service role key for admin bypass when needed

## Documentation

Extensive guides are available in the repository:
- `PROJECT_HISTORY_AND_WALKTHROUGH.md` - Complete project history
- `QUICK_START_GUIDE.md` - Fast onboarding
- `DETAILED_DEPLOYMENT_GUIDE.md` - Production deployment
- `SUPABASE_EDGE_FUNCTIONS_GUIDE.md` - Edge Functions reference
- `TROUBLESHOOTING_GUIDE.md` - Common issues
- `MAILERLITE_INTEGRATION_GUIDE.md` - MailerLite setup
- `EDGE_FUNCTIONS_SECURITY.md` - Security patterns

Open `DOCUMENTATION.html` in a browser for an indexed view of all docs.
