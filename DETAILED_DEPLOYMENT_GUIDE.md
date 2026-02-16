# RepMotivatedSeller: Detailed Deployment Guide

This comprehensive guide provides step-by-step instructions for setting up, configuring, and deploying the RepMotivatedSeller foreclosure assistance platform. It covers both development and production environments.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Local Development Setup](#local-development-setup)
4. [Supabase Configuration](#supabase-configuration)
5. [Edge Functions Deployment](#edge-functions-deployment)
6. [Environment Variables](#environment-variables)
7. [Production Deployment](#production-deployment)
8. [Nginx Configuration](#nginx-configuration)
9. [Testing and Verification](#testing-and-verification)
10. [Troubleshooting](#troubleshooting)
11. [Maintenance and Updates](#maintenance-and-updates)

## Project Overview

RepMotivatedSeller is a foreclosure assistance platform built with:

- **Frontend**: React + Vite (with static HTML fallback)
- **Backend**: Supabase (Database, Authentication, Edge Functions)
- **Integrations**: MailerLite, Twilio, CRM systems
- **Hosting**: Nginx on custom server

## Prerequisites

- Node.js (v16+)
- Supabase CLI (optional but recommended)
- Git
- Nginx web server (for production)
- SSL certificate (for production)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd rep-motivated-seller
```

### 2. Install Dependencies

```bash
npm install
```

If you encounter build issues with esbuild or npm dependencies, use the fix-install script:

```bash
scripts\fix-install.bat
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
copy .env.example .env
```

Edit the `.env` file with your Supabase credentials and other configuration values:

```
# Supabase Configuration
VITE_SUPABASE_URL=https://ltxqodqlexvojqqxquew.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_wQE2WLlEvqE1RqWtNPcxGw_tSpNMwmg

# Other configurations...
```

### 4. Run Development Server

```bash
npm run dev
```

### 5. Build for Local Testing

```bash
npm run build
```

To test the build locally:

```bash
scripts\build-and-deploy-local.bat
```

## Supabase Configuration

### 1. Project Setup

Your Supabase project is already set up at:

- **URL**: https://ltxqodqlexvojqqxquew.supabase.co
- **Project Reference**: ltxqodqlexvojqqxquew
- **Anon Key**: sb_publishable_wQE2WLlEvqE1RqWtNPcxGw_tSpNMwmg

### 2. Database Schema

The database schema is defined in:

```
supabase/migrations/20230101000000_initial_schema.sql
```

Key tables include:

- `property_submissions`: Stores foreclosure questionnaire responses
- `follow_ups`: Tracks follow-up activities for each submission
- `admin_profiles`: Manages admin users and permissions

### 3. Authentication Setup

Ensure your Supabase project has:

- Email authentication enabled
- Admin users created
- JWT configuration properly set

## Edge Functions Deployment

### 1. Available Edge Functions

The project includes several Edge Functions:

- `admin-dashboard`: Admin dashboard API
- `send-notification-email`: Email notification system
- `schedule-follow-ups`: Automated follow-up scheduling
- `external-api-integration`: CRM integration
- `schedule-property-followup`: Property-specific follow-ups
- `test-secrets`: For testing environment variables

### 2. Deploy via Supabase Dashboard (Recommended)

1. Go to the [Supabase Dashboard](https://supabase.com/dashboard/project/ltxqodqlexvojqqxquew/functions)
2. Select the function you want to deploy
3. Copy the code from the corresponding file in `supabase/functions/`
4. Paste into the editor and click "Deploy Function"

### 3. Deploy via Batch Scripts

For convenience, use the provided batch scripts:

```bash
# Deploy all functions
scripts\deploy-all-functions.bat

# Deploy only admin dashboard
scripts\deploy-admin-dashboard.bat

# Deploy property-related functions
scripts\deploy-property-functions.bat
```

### 4. Deploy via Supabase CLI (Advanced)

If you have the Supabase CLI configured:

```bash
supabase functions deploy admin-dashboard --project-ref ltxqodqlexvojqqxquew
```

## Environment Variables

### 1. Supabase Secrets

Set required secrets for Edge Functions:

```bash
scripts\set-secrets.bat
```

For Twilio integration:

```bash
scripts\set-twilio-secrets.bat
```

### 2. Required Environment Variables

Ensure these variables are set in your Supabase project:

- `MAILERLITE_API_KEY`: For email integration
- `FROM_EMAIL`: Sender email address
- `ADMIN_EMAIL`: Admin notification recipient
- `SITE_URL`: Your production site URL

For SMS notifications (if enabled):

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

## Production Deployment

### 1. Build for Production

```bash
scripts\production-build.bat
```

This creates optimized files in the `dist` directory.

### 2. Backup Before Deployment

Always back up your current deployment:

```bash
scripts\backup-and-deploy.bat
```

This creates a timestamped backup in the `backups` directory.

### 3. Deploy to Production Server

#### Option 1: Manual Deployment

1. Copy the contents of the `dist` directory to your web server
2. Configure Nginx (see Nginx Configuration section)

#### Option 2: GitHub Actions CI/CD

Use the provided GitHub Actions workflow in `.github/workflows/deploy.yml`:

1. Configure secrets in your GitHub repository:
   - `SERVER_HOST`: Your server's hostname
   - `SERVER_USER`: SSH username
   - `SERVER_SSH_KEY`: Private SSH key for authentication

2. Push to the main branch to trigger deployment

## Nginx Configuration

### 1. Basic Configuration

Place this in `/etc/nginx/conf.d/repmotivatedseller.conf`:

```nginx
server {
    listen 443 ssl http2;
    server_name repmotivatedseller.shoprealestatespace.org;

    # SSL modern config
    include /etc/nginx/conf.d/ssl-modern.conf;

    root /var/www/repmotivatedseller/dist;

    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        try_files $uri =404;
        access_log off;
        expires 30d;
        add_header Cache-Control "public";
    }
}
```

### 2. SSL Configuration

Place this in `/etc/nginx/conf.d/ssl-modern.conf`:

```nginx
# Modern SSL/TLS Configuration for Cloudflare Compatibility

ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_session_tickets off;
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 1.1.1.1 1.0.0.1 valid=300s;
resolver_timeout 5s;
ssl_dhparam /etc/nginx/ssl/dhparam.pem;
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header X-Frame-Options DENY always;
add_header X-Content-Type-Options nosniff always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
ssl_buffer_size 8k;
ssl_early_data on;
```

### 3. Windows Nginx Configuration

For Windows development environment, use:

```
etc\nginx\conf.d\repmotivatedseller-windows.conf
```

## Testing and Verification

### 1. Test Edge Functions

Use the provided test scripts:

```bash
scripts\test-functions.bat
```

Or test individual functions:

```bash
scripts\test-admin-dashboard.bat
```

### 2. Test Admin Dashboard API

Using curl (replace with your actual JWT token):

```bash
curl -X POST "https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/admin-dashboard" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"summary"}'
```

For testing with service role key (development only):

```bash
curl -X POST "https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/admin-dashboard" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0eHFvZHFsZXh2b2pxcXhxdWV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4OTk3NTc1MCwiZXhwIjoyMDA1NTUxNzUwfQ.Rl_0RZCnxQHvGFzQVxXdYgHWtgdTxj-Ot-uf-XnEkwE" \
  -H "Content-Type: application/json" \
  -d '{"action":"summary"}'
```

### 3. Test Static HTML Version

Open the static HTML files in your browser:

```bash
scripts\open-html.bat
```

## Troubleshooting

### 1. Edge Function Deployment Issues

If you encounter errors deploying Edge Functions:

1. Check Supabase logs in the dashboard
2. Verify your JWT token is valid
3. Ensure all required environment variables are set
4. Try deploying via the Supabase dashboard instead of CLI

### 2. Authentication Issues

If you experience JWT authentication problems:

1. Verify the JWT secret in your Supabase project
2. Check that your token hasn't expired
3. Ensure the user has admin privileges in the `admin_profiles` table

### 3. Build Issues

For esbuild or npm dependency issues:

1. Run `scripts\fix-install.bat`
2. Try using the static HTML version as a fallback
3. Check for compatibility issues between dependencies

## Maintenance and Updates

### 1. Regular Backups

Run backups before making changes:

```bash
scripts\backup-and-deploy.bat
```

### 2. Updating Edge Functions

1. Edit the function code in `supabase/functions/`
2. Deploy using the appropriate script or dashboard
3. Test thoroughly after each update

### 3. Database Migrations

When updating the database schema:

1. Create a new migration file in `supabase/migrations/`
2. Apply the migration through the Supabase dashboard
3. Update any affected Edge Functions

### 4. Monitoring

Regularly check:

- Supabase logs for Edge Function errors
- Nginx logs for web server issues
- Database performance and storage usage

---

For additional assistance, refer to the documentation in the `README.md` files throughout the project or contact the development team.
