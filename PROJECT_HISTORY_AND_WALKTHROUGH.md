# RepMotivatedSeller Project: History and Step-by-Step Walkthrough

## Project History

### Phase 1: Initial Setup and Infrastructure
1. Created CloudFormation template (`supabase-deployment.yaml`) for Supabase deployment on EC2
2. Set up project directory structure for RepMotivatedSeller foreclosure assistance platform
3. Encountered build issues with esbuild and npm dependencies
4. Created static HTML version as a workaround for build issues

### Phase 2: Supabase Integration
1. Connected static HTML to Supabase backend
2. Deployed initial Edge Functions for basic functionality
3. Set up database schema with tables for foreclosure responses and notification settings
4. Addressed JWT authentication issues with Edge Functions

### Phase 3: Admin Dashboard Development
1. Implemented admin dashboard Edge Function with REST API endpoints
2. Created admin-dashboard.html interface for managing foreclosure submissions
3. Enhanced admin dashboard with filtering, sorting, and CSV export
4. Added follow-up scheduling and notification management

### Phase 4: Integration Development
1. Implemented MailerLite integration for email notifications
2. Set up CRM integration with multiple provider options
3. Added Twilio integration for SMS notifications and AI voice handling
4. Created deployment scripts for all integrations

### Phase 5: Production Preparation
1. Created comprehensive deployment guides for different environments
2. Set up Nginx configuration for production hosting
3. Implemented security measures including JWT verification
4. Created testing scripts and troubleshooting guides

## Step-by-Step Walkthrough

### 1. Project Setup

#### Clone and Configure Repository
```bash
# Clone repository
git clone <repository-url>
cd rep-motivated-seller

# Install dependencies
npm install

# Copy environment example
copy .env.example .env
```

#### Configure Environment Variables
1. Open `.env` file and update:
   - Supabase URL: `https://ltxqodqlexvojqqxquew.supabase.co`
   - Supabase Anon Key: `sb_publishable_wQE2WLlEvqE1RqWtNPcxGw_tSpNMwmg`
   - MailerLite API Key: Your API key
   - Email settings and recipients
   - Site URL: `https://repmotivatedseller.shoprealestatespace.org`

#### Set Up Supabase Project
1. Access Supabase dashboard: https://supabase.com/dashboard/project/ltxqodqlexvojqqxquew
2. Navigate to SQL Editor
3. Run migration file: `supabase/migrations/20230101000000_initial_schema.sql`

### 2. Deploy Edge Functions

#### Set Up Supabase CLI (Optional)
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to project
supabase link --project-ref ltxqodqlexvojqqxquew
```

#### Deploy Core Functions
```bash
# Using batch scripts
scripts\deploy-all-functions.bat

# Or deploy individual functions
scripts\deploy-admin-dashboard.bat
```

#### Alternative: Manual Deployment
1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/ltxqodqlexvojqqxquew/functions
2. Click "New Function" or select existing function
3. Copy code from `supabase/functions/[function-name]/index.ts`
4. Paste into editor and click "Deploy Function"

### 3. Set Up Integrations

#### MailerLite Integration
```bash
# Run MailerLite setup script
scripts\setup-mailerlite.bat
```

Then in MailerLite account:
1. Create subscriber groups: `new_leads`, `urgent_cases`, `foreclosure_clients`
2. Set up email templates for notifications
3. Configure domain verification for better deliverability

#### CRM Integration
```bash
# Run CRM setup script
scripts\deploy-crm-functions.bat
```

Select your CRM type when prompted (HubSpot, Salesforce, Pipedrive, or Custom).

#### SMS Notifications (Twilio)
```bash
# Run Twilio setup script
scripts\setup-twilio.bat
```

Enter your Twilio credentials when prompted.

#### AI Voice Handler
```bash
# Deploy AI voice handler
scripts\deploy-ai-voice-handler.bat
```

Then in Twilio Console:
1. Go to Phone Numbers → Manage → Active Numbers
2. Select your phone number
3. Set Voice webhook URL to: `https://ltxqodqlexvojqqxquew.functions.supabase.co/ai-voice-handler`
4. Set HTTP Method to POST

### 4. Local Development

#### Run Development Server
```bash
npm run dev
```

#### Use Static HTML Version
```bash
# Open static HTML site
scripts\open-html.bat
```

### 5. Testing

#### Test Edge Functions
```bash
# Test all endpoints
scripts\test-all-endpoints.bat

# Test authentication
scripts\test-auth.bat
```

#### Test Admin Dashboard
1. Open `admin-dashboard.html` in browser
2. Log in with admin credentials
3. Verify all dashboard features work correctly

### 6. Production Deployment

#### Windows Deployment
```bash
# Install and configure Nginx
scripts\install-nginx-windows.bat

# Deploy to Nginx
scripts\windows-deploy.bat
```

#### SSL Certificate Setup
1. Place SSL certificate files in `C:/nginx/conf/ssl/`:
   - Certificate: `star_repmotivatedseller_shoprealestatespace_org.csr`
   - Private Key: `star_repmotivatedseller_shoprealestatespace_org.key`
2. Generate DH parameters: `openssl dhparam -out C:/nginx/conf/dhparam.pem 2048`

#### DNS Configuration
1. Set up A record for `repmotivatedseller.shoprealestatespace.org` pointing to your server IP
2. Wait for DNS propagation (up to 48 hours)

### 7. Security Configuration

#### JWT Authentication
1. Update `supabase/config.toml` with JWT verification settings
2. Deploy functions with updated settings
3. Test authentication with `scripts\test-auth.bat`

#### Environment Variables
1. Set all required secrets in Supabase:
   ```bash
   scripts\set-all-secrets.bat
   ```
2. Verify secrets are set correctly:
   ```bash
   supabase secrets list --project-ref ltxqodqlexvojqqxquew
   ```

### 8. Verification and Monitoring

#### Verify Deployment
1. Access site at `https://repmotivatedseller.shoprealestatespace.org`
2. Test foreclosure questionnaire submission
3. Verify email notifications are sent
4. Check admin dashboard for new submission

#### Monitor Edge Functions
```bash
# View function logs
supabase functions logs admin-dashboard --project-ref ltxqodqlexvojqqxquew
```

### 9. Maintenance

#### Backup Before Changes
```bash
# Create backup
scripts\backup-and-deploy.bat
```

#### Update Edge Functions
1. Edit function code in `supabase/functions/`
2. Deploy using appropriate script
3. Test thoroughly after updates

## Key Files and Directories

### Core Files
- `.env.example`: Template for environment variables
- `supabase/config.toml`: JWT verification settings
- `supabase/migrations/`: Database schema files
- `admin-dashboard.html`: Admin interface

### Edge Functions
- `supabase/functions/admin-dashboard/`: Admin dashboard API
- `supabase/functions/send-notification-email/`: Email notifications
- `supabase/functions/schedule-follow-ups/`: Follow-up scheduling
- `supabase/functions/external-api-integration/`: CRM integration
- `supabase/functions/ai-voice-handler/`: Twilio voice handling

### Deployment Scripts
- `scripts/deploy-all-functions.bat`: Deploy all Edge Functions
- `scripts/deploy-admin-dashboard.bat`: Deploy admin dashboard only
- `scripts/windows-deploy.bat`: Deploy to Windows with Nginx
- `scripts/install-nginx-windows.bat`: Set up Nginx on Windows

### Documentation
- `DETAILED_DEPLOYMENT_GUIDE.md`: Complete deployment instructions
- `WINDOWS_DEPLOYMENT_GUIDE.md`: Windows-specific deployment guide
- `SUPABASE_EDGE_FUNCTIONS_GUIDE.md`: Edge Functions documentation
- `NGINX_SETUP_GUIDE.md`: Nginx configuration guide
- `MAILERLITE_INTEGRATION_GUIDE.md`: MailerLite integration guide
- `TROUBLESHOOTING_GUIDE.md`: Common issues and solutions

## Troubleshooting Common Issues

### Build Issues
- Run `scripts\fix-install.bat` for dependency problems
- Use static HTML version as fallback

### Authentication Issues
- Verify JWT token is valid and not expired
- Check user has admin privileges in `admin_profiles` table
- Ensure correct Authorization header format: `Bearer YOUR_TOKEN`

### Edge Function Deployment Failures
- Check for TypeScript errors in function code
- Verify all imports are properly specified
- Try deploying via Supabase dashboard instead of CLI

### Email Notification Issues
- Verify MailerLite API key is correct
- Check sender email is verified in MailerLite
- Ensure recipient email addresses are valid

### Nginx Configuration Issues
- Check if ports 80/443 are already in use
- Verify SSL certificate paths are correct
- Check Nginx error logs: `C:\nginx\logs\error.log`