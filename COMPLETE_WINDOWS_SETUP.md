# Complete Windows Setup Guide for RepMotivatedSeller

This comprehensive guide covers all aspects of setting up the RepMotivatedSeller platform on a Windows environment, including all integrations described in the project.

## Table of Contents

1. [Initial Setup](#initial-setup)
2. [Nginx Configuration](#nginx-configuration)
3. [Supabase Edge Functions](#supabase-edge-functions)
4. [Email Integration (MailerLite)](#email-integration-mailerlite)
5. [CRM Integration](#crm-integration)
6. [SMS Notifications (Twilio)](#sms-notifications-twilio)
7. [AI Voice Handler](#ai-voice-handler)
8. [Admin Dashboard](#admin-dashboard)
9. [Testing and Verification](#testing-and-verification)
10. [Production Deployment](#production-deployment)

## Initial Setup

### Prerequisites

- Windows 10/11 with administrator access
- Node.js 16+ installed
- Git installed
- Supabase CLI (optional but recommended)
- OpenSSL for Windows (for SSL certificate management)

### Project Setup

1. Clone the repository:
   ```batch
   git clone <repository-url>
   cd rep-motivated-seller
   ```

2. Install dependencies:
   ```batch
   npm install
   ```

3. Set up environment variables:
   ```batch
   scripts\set-windows-env.bat
   ```

4. Create a production build:
   ```batch
   npm run build
   ```

## Nginx Configuration

### Install and Configure Nginx

Run the Nginx installation script:
```batch
scripts\install-nginx-windows.bat
```

This script will:
- Check if Nginx is installed
- Create required directories
- Copy configuration files
- Set up SSL certificates
- Optionally install Nginx as a Windows service

### SSL Certificate Setup

Ensure your SSL certificate files are in place:
- Certificate: `C:/nginx/conf/ssl/star_repmotivatedseller_shoprealestatespace_org.csr`
- Private Key: `C:/nginx/conf/ssl/star_repmotivatedseller_shoprealestatespace_org.key`
- DH Parameters: `C:/nginx/conf/dhparam.pem`

If you need to generate DH parameters:
```batch
openssl dhparam -out C:/nginx/conf/dhparam.pem 2048
```

### Deploy to Nginx

Deploy your application to Nginx:
```batch
scripts\windows-deploy.bat
```

## Supabase Edge Functions

### Authentication Configuration

1. Deploy the auth-test function:
   ```batch
   scripts\deploy-auth-test.bat
   ```

2. Update the Supabase config.toml file with JWT verification settings:
   - The file is already created at `supabase/config.toml`
   - It configures which functions require JWT authentication

3. Test authentication:
   ```batch
   scripts\test-auth.bat
   ```

## Email Integration (MailerLite)

### Set Up MailerLite Integration

Run the MailerLite setup script:
```batch
scripts\setup-mailerlite.bat
```

This script will:
- Set your MailerLite API key
- Configure sender email address
- Set notification recipient emails
- Deploy the send-notification-email function

### MailerLite Account Configuration

After running the script, complete these steps in your MailerLite account:

1. Create these subscriber groups:
   - `new_leads`
   - `urgent_cases`
   - `foreclosure_clients`

2. Set up email templates for:
   - New submission notifications
   - Urgent case alerts
   - Welcome sequences
   - Follow-up emails

3. Verify your sending domain in MailerLite settings

## CRM Integration

### Deploy CRM Integration

Run the CRM integration script:
```batch
scripts\deploy-crm-functions.bat
```

This script will:
- Set your CRM type (HubSpot, Salesforce, Pipedrive, or custom)
- Deploy the external-api-integration function

### CRM-Specific Configuration

#### HubSpot
- Create custom properties for foreclosure data
- Set up workflows for lead scoring based on urgency

#### Salesforce
- Create custom fields to match submission data
- Configure lead assignment rules

#### Pipedrive
- Set up custom fields for foreclosure information
- Configure deal stages to match your workflow

#### Custom CRM
- Ensure your webhook endpoint can process the data format
- Test with sample submissions

## SMS Notifications (Twilio)

### Set Up Twilio Integration

Run the Twilio setup script:
```batch
scripts\setup-twilio.bat
```

This script will:
- Enable or disable SMS notifications
- Set your Twilio credentials
- Configure your Twilio phone number

### Twilio Account Configuration

If using SMS notifications:

1. Verify your Twilio account is active
2. Ensure your phone number can send SMS
3. Set up SMS templates in your code

## AI Voice Handler

### Deploy AI Voice Handler

Run the AI voice handler deployment script:
```batch
scripts\deploy-ai-voice-handler.bat
```

This script will:
- Set your OpenAI API key
- Configure the OpenAI model
- Set phone numbers for agent handoff
- Deploy the ai-voice-handler function

### Twilio Phone Configuration

After deploying the function:

1. Go to the Twilio Console
2. Navigate to Phone Numbers → Manage → Active Numbers
3. Select your phone number
4. Set the Voice webhook URL to:
   ```
   https://ltxqodqlexvojqqxquew.functions.supabase.co/ai-voice-handler
   ```
5. Set the HTTP Method to POST

## Admin Dashboard

### Deploy Admin Dashboard Function

```batch
scripts\deploy-admin-dashboard.bat
```

### Access the Admin Dashboard

1. Open `admin-dashboard.html` in your browser
2. Log in with your admin credentials
3. Verify all dashboard features are working:
   - Real-time statistics
   - Submission filtering
   - Status management
   - Follow-up scheduling
   - Notification settings

## Testing and Verification

### Test Edge Functions

Test all Edge Functions:
```batch
scripts\test-all-endpoints.bat
```

### Test Form Submissions

1. Open your site in a browser
2. Complete the foreclosure questionnaire
3. Verify data is saved to Supabase
4. Check for email notifications
5. Verify CRM integration

### Test AI Call Answering

1. Call your Twilio phone number
2. Interact with the AI voice handler
3. Test agent handoff functionality
4. Verify call data is logged

## Production Deployment

### Final Deployment Steps

1. Deploy all integrations:
   ```batch
   scripts\deploy-all-integrations.bat
   ```

2. Deploy to production web server:
   ```batch
   scripts\windows-deploy.bat
   ```

3. Verify all features in production:
   - Form submissions
   - Email notifications
   - CRM integration
   - Admin dashboard
   - AI call answering

### DNS Configuration

Ensure your domain points to your server:
1. Set up an A record for `repmotivatedseller.shoprealestatespace.org` pointing to your server IP
2. Wait for DNS propagation (can take up to 48 hours)

### Firewall Configuration

Ensure Windows Firewall allows incoming connections on ports 80 and 443:
```batch
netsh advfirewall firewall add rule name="HTTP" dir=in action=allow protocol=TCP localport=80
netsh advfirewall firewall add rule name="HTTPS" dir=in action=allow protocol=TCP localport=443
```

## Maintenance and Updates

### Backup Procedure

Before making changes:
```batch
scripts\backup-and-deploy.bat
```

### Update Procedure

1. Pull latest code from repository
2. Install any new dependencies
3. Build the project
4. Deploy updated functions
5. Deploy to web server

---

This guide covers all aspects of setting up the RepMotivatedSeller platform on a Windows environment. Follow each section carefully to ensure all components are properly configured and integrated.