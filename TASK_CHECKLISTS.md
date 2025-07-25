# RepMotivatedSeller Task Checklists

This document provides step-by-step checklists for common tasks in the RepMotivatedSeller project.

## Initial Setup Checklist

### Environment Setup
- [ ] Clone repository: `git clone <repository-url>`
- [ ] Navigate to project: `cd rep-motivated-seller`
- [ ] Install dependencies: `npm install`
- [ ] Copy environment file: `copy .env.example .env`
- [ ] Update environment variables in `.env`
- [ ] Set Windows environment variables: `scripts\set-windows-env.bat`

### Supabase Setup
- [ ] Access Supabase dashboard: https://supabase.com/dashboard/project/ltxqodqlexvojqqxquew
- [ ] Run database migrations in SQL Editor
- [ ] Create admin user in `admin_profiles` table
- [ ] Set required secrets: `scripts\set-all-secrets.bat`

### Local Development
- [ ] Start development server: `npm run dev`
- [ ] Or use static HTML: `scripts\open-html.bat`
- [ ] Test admin dashboard: Open `admin-dashboard.html`

## Edge Function Deployment Checklist

### Authentication Function
- [ ] Deploy auth-test function: `scripts\deploy-auth-test.bat`
- [ ] Test authentication: `scripts\test-auth.bat`

### Admin Dashboard Function
- [ ] Deploy admin dashboard: `scripts\deploy-admin-dashboard.bat`
- [ ] Test admin endpoints: `scripts\test-all-endpoints.bat`
- [ ] Verify dashboard in browser: Open `admin-dashboard.html`

### Email Notification Function
- [ ] Update MailerLite API: `scripts\update-mailerlite-api.bat`
- [ ] Deploy notification function: `scripts\setup-mailerlite.bat`
- [ ] Test email notification: Select "Y" when prompted to test

### CRM Integration Function
- [ ] Deploy CRM function: `scripts\deploy-crm-functions.bat`
- [ ] Select appropriate CRM type when prompted
- [ ] Configure CRM-specific settings in your CRM platform

### SMS and Voice Functions
- [ ] Set up Twilio integration: `scripts\setup-twilio.bat`
- [ ] Deploy AI voice handler: `scripts\deploy-ai-voice-handler.bat`
- [ ] Configure Twilio webhook in Twilio Console

### All Functions
- [ ] Deploy all integrations: `scripts\deploy-all-integrations.bat`
- [ ] Test all endpoints: `scripts\test-all-endpoints.bat`

## Windows Nginx Deployment Checklist

### Nginx Installation
- [ ] Run installation script: `scripts\install-nginx-windows.bat`
- [ ] Create required directories if prompted
- [ ] Verify Nginx is running: http://localhost

### SSL Certificate Setup
- [ ] Create SSL directory: `mkdir C:\nginx\conf\ssl`
- [ ] Copy certificate files to SSL directory:
  - Certificate: `star_repmotivatedseller_shoprealestatespace_org.csr`
  - Private Key: `star_repmotivatedseller_shoprealestatespace_org.key`
- [ ] Generate DH parameters: `openssl dhparam -out C:/nginx/conf/dhparam.pem 2048`

### Application Deployment
- [ ] Build application: `npm run build`
- [ ] Deploy to Nginx: `scripts\windows-deploy.bat`
- [ ] Verify deployment: http://localhost and https://repmotivatedseller.shoprealestatespace.org

### DNS Configuration
- [ ] Set up A record for domain pointing to server IP
- [ ] Wait for DNS propagation
- [ ] Test domain access: https://repmotivatedseller.shoprealestatespace.org

## MailerLite Integration Checklist

### API Configuration
- [ ] Get API key from MailerLite dashboard
- [ ] Set API key in Supabase: `scripts\setup-mailerlite.bat`
- [ ] Update to new API endpoint: `scripts\update-mailerlite-api.bat`

### Group Setup
- [ ] Create `new_leads` group in MailerLite
- [ ] Create `urgent_cases` group in MailerLite
- [ ] Create `foreclosure_clients` group in MailerLite

### Email Templates
- [ ] Create new submission template
- [ ] Create urgent case template
- [ ] Create follow-up reminder templates
- [ ] Create welcome sequence template

### Domain Verification
- [ ] Add domain in MailerLite settings
- [ ] Add DNS records for verification
- [ ] Configure DKIM for better deliverability
- [ ] Set up custom tracking domain (optional)

## CRM Integration Checklist

### HubSpot Integration
- [ ] Get HubSpot API key
- [ ] Set CRM_TYPE=hubspot in environment
- [ ] Configure custom properties for foreclosure data
- [ ] Set up workflows for lead scoring

### Salesforce Integration
- [ ] Get Salesforce credentials
- [ ] Set CRM_TYPE=salesforce in environment
- [ ] Configure custom fields for foreclosure data
- [ ] Set up lead assignment rules

### Custom CRM Integration
- [ ] Set CRM_TYPE=custom in environment
- [ ] Configure webhook URL
- [ ] Set API key for authentication
- [ ] Test webhook with sample submission

## Twilio Integration Checklist

### SMS Notifications
- [ ] Get Twilio account SID and auth token
- [ ] Set ENABLE_SMS_NOTIFICATIONS=true
- [ ] Configure recipient phone numbers
- [ ] Test SMS notification

### AI Voice Handler
- [ ] Get OpenAI API key
- [ ] Select AI model (gpt-3.5-turbo or gpt-4-turbo-preview)
- [ ] Configure agent handoff phone numbers
- [ ] Set up Twilio webhook URL:
  ```
  https://ltxqodqlexvojqqxquew.functions.supabase.co/ai-voice-handler
  ```
- [ ] Test by calling your Twilio number

## Testing Checklist

### Edge Function Testing
- [ ] Test authentication: `scripts\test-auth.bat`
- [ ] Test admin dashboard: `scripts\test-admin-dashboard.bat`
- [ ] Test all endpoints: `scripts\test-all-endpoints.bat`
- [ ] Check function logs in Supabase dashboard

### Form Submission Testing
- [ ] Submit test foreclosure questionnaire
- [ ] Verify data saved to database
- [ ] Check email notification received
- [ ] Verify submission appears in admin dashboard

### Integration Testing
- [ ] Verify MailerLite subscriber added
- [ ] Check CRM for new lead
- [ ] Test SMS notification if enabled
- [ ] Test AI voice handler by calling Twilio number

## Maintenance Checklist

### Backup Procedure
- [ ] Create backup before changes: `scripts\backup-and-deploy.bat`
- [ ] Verify backup created in `backups` directory
- [ ] Document changes being made

### Update Procedure
- [ ] Pull latest code from repository
- [ ] Install any new dependencies
- [ ] Update environment variables if needed
- [ ] Deploy updated functions
- [ ] Test all functionality after update

### Monitoring
- [ ] Check Edge Function logs regularly
- [ ] Monitor Nginx error logs
- [ ] Review email delivery statistics
- [ ] Check CRM integration status