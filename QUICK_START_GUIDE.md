# RepMotivatedSeller Quick Start Guide

This guide provides the essential steps to get the RepMotivatedSeller platform up and running quickly.

## 1. Project Setup

### Clone and Install

```bash
# Navigate to your project directory
cd "c:\Users\monte\Documents\cert api token keys ids\supabase project deployment"

# Open the project folder
cd rep-motivated-seller

# Install dependencies (if needed)
npm install
```

### Environment Setup

Copy the example environment file and update it:

```bash
copy .env.example .env
```

Edit `.env` with your Supabase credentials:

```
VITE_SUPABASE_URL=https://ltxqodqlexvojqqxquew.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_wQE2WLlEvqE1RqWtNPcxGw_tSpNMwmg
```

## 2. Quick Development Start

### Option 1: Static HTML Version (Recommended)

For the simplest setup, use the static HTML version:

```bash
# Open the static HTML site
scripts\open-html.bat
```

This will open `index.html` in your default browser.

### Option 2: Build and Run Locally

```bash
# Build and deploy locally
scripts\build-and-deploy-local.bat
```

## 3. Deploy Edge Functions

### Deploy Admin Dashboard

```bash
# Deploy the admin dashboard function
scripts\deploy-admin-dashboard.bat
```

### Deploy All Functions

```bash
# Deploy all Edge Functions
scripts\deploy-all-functions.bat
```

## 4. Test Edge Functions

```bash
# Test the admin dashboard
scripts\test-admin-dashboard.bat
```

## 5. Access Admin Dashboard

Open `admin-dashboard.html` in your browser:

```bash
# Open the admin dashboard
start admin-dashboard.html
```

## 6. Production Deployment

### Build for Production

```bash
# Create production build
scripts\production-build.bat
```

### Deploy to Server

Copy the contents of the `dist` directory to your web server.

## 7. Common Tasks

### Set Secrets

```bash
# Set Supabase secrets
scripts\set-secrets.bat

# Set Twilio secrets (if using SMS)
scripts\set-twilio-secrets.bat
```

### Backup Before Changes

```bash
# Create backup before making changes
scripts\backup-and-deploy.bat
```

## 8. Useful Links

- Supabase Project: https://supabase.com/dashboard/project/ltxqodqlexvojqqxquew
- Admin Dashboard: https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/admin-dashboard
- Production Site: https://repmotivatedseller.shoprealestatespace.org

## 9. Need More Details?

For more comprehensive instructions, refer to:

- `DETAILED_DEPLOYMENT_GUIDE.md` - Complete deployment instructions
- `SUPABASE_EDGE_FUNCTIONS_GUIDE.md` - Edge Functions documentation
- `NGINX_SETUP_GUIDE.md` - Nginx configuration guide

## 10. Troubleshooting

If you encounter issues:

1. Check the Supabase dashboard for function logs
2. Verify environment variables are set correctly
3. Try the static HTML version as a fallback
4. Run `scripts\fix-install.bat` for dependency issues