# Production Readiness Checklist for RepMotivatedSeller

This checklist covers all the essential steps to make your RepMotivatedSeller project production-ready.

## Environment Variables

### Supabase Configuration

- [ ] `VITE_SUPABASE_URL`: Set to `https://ltxqodqlexvojqqxquew.supabase.co`
- [ ] `VITE_SUPABASE_ANON_KEY`: Set to `sb_publishable_wQE2WLlEvqE1RqWtNPcxGw_tSpNMwmg`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`: Set for server-side operations (keep secure)

### Email Configuration

- [ ] `MAILERLITE_API_KEY`: Your MailerLite API key
- [ ] `FROM_EMAIL`: Set to `noreply@repmotivatedseller.org` or your verified sender
- [ ] `ADMIN_EMAIL`: Email for admin notifications
- [ ] `URGENT_EMAIL`: Email for urgent notifications
- [ ] `MANAGER_EMAIL`: Email for manager notifications

### Site Configuration

- [ ] `SITE_URL`: Set to `https://repmotivatedseller.shoprealestatespace.org`

### CRM Integration

- [ ] `CRM_TYPE`: Set to `hubspot`, `salesforce`, or `custom`
- [ ] CRM-specific credentials configured based on your chosen CRM

### SMS Notifications (Twilio)

- [ ] `ENABLE_SMS_NOTIFICATIONS`: Set to `true` if using SMS
- [ ] `TWILIO_ACCOUNT_SID`: Your Twilio Account SID
- [ ] `TWILIO_AUTH_TOKEN`: Your Twilio Auth Token
- [ ] `TWILIO_PHONE_NUMBER`: Your Twilio phone number

### AI Voice Handler

- [ ] `OPENAI_API_KEY`: Your OpenAI API key
- [ ] `OPENAI_MODEL`: Set to `gpt-3.5-turbo` or `gpt-4-turbo-preview`
- [ ] `AGENT_PHONE_NUMBER`: Phone number for agent handoff
- [ ] `SCHEDULING_PHONE_NUMBER`: Phone number for scheduling

## Deployment

### Frontend Deployment

- [ ] Build the application with `npm run build`
- [ ] Deploy the `dist` folder to your web server
- [ ] Configure Nginx with the provided configuration files
- [ ] Set up SSL certificates for secure HTTPS access

### Supabase Edge Functions Deployment

- [ ] Deploy `admin-dashboard` function
- [ ] Deploy `auth-test` function
- [ ] Deploy `send-notification-email` function
- [ ] Deploy `schedule-follow-ups` function
- [ ] Deploy `external-api-integration` function
- [ ] Deploy `ai-voice-handler` function (if using AI call answering)
- [ ] Deploy other required functions based on your feature set

### Database Setup

- [ ] Apply all migrations to your Supabase project
- [ ] Verify database schema is correctly set up
- [ ] Create initial admin user in the `admin_profiles` table

## External Services Configuration

### Twilio Setup (for AI Call Answering)

- [ ] Configure Twilio phone number webhook to point to your `ai-voice-handler` function
- [ ] Set webhook HTTP method to POST
- [ ] Configure status callbacks if needed

### MailerLite Setup

- [ ] Verify sending domain in MailerLite
- [ ] Create required subscriber groups
- [ ] Set up email templates and automations

### CRM Integration

- [ ] Configure API credentials in your chosen CRM
- [ ] Map custom fields for foreclosure data
- [ ] Test data flow from form submissions to CRM

## Security Configuration

### JWT Authentication

- [ ] Verify JWT authentication is working with protected Edge Functions
- [ ] Ensure `config.toml` has correct `verify_jwt` settings for each function
- [ ] Test authentication flow with the `auth-test` function

### CORS Configuration

- [ ] Update CORS headers in production to restrict to your domain
- [ ] Test cross-origin requests to ensure they work as expected

### SSL Configuration

- [ ] Install valid SSL certificate
- [ ] Configure Nginx with secure SSL settings
- [ ] Test SSL configuration with SSL Labs (aim for A+ rating)

## Testing

### Functionality Testing

- [ ] Test form submissions
- [ ] Test admin dashboard access and features
- [ ] Test email notifications
- [ ] Test SMS notifications (if enabled)
- [ ] Test AI call answering (if implemented)

### Security Testing

- [ ] Verify authentication works correctly
- [ ] Test role-based access control
- [ ] Ensure sensitive data is properly protected

### Performance Testing

- [ ] Test site loading speed
- [ ] Verify Edge Functions respond within acceptable timeframes
- [ ] Check database query performance

## Monitoring and Maintenance

### Logging

- [ ] Set up logging for Edge Functions
- [ ] Configure web server logs
- [ ] Implement error tracking

### Backups

- [ ] Set up regular database backups
- [ ] Create backup procedure for application code
- [ ] Test backup restoration process

### Monitoring

- [ ] Set up uptime monitoring
- [ ] Configure performance monitoring
- [ ] Set up alerts for critical errors

## Documentation

### User Documentation

- [ ] Create admin user guide
- [ ] Document form submission process
- [ ] Provide troubleshooting guides

### Technical Documentation

- [ ] Document deployment process
- [ ] Create maintenance procedures
- [ ] Document API endpoints and authentication

## Final Verification

- [ ] Perform end-to-end testing of all features
- [ ] Verify all environment variables are correctly set
- [ ] Check all external service integrations
- [ ] Test on multiple browsers and devices
- [ ] Verify SSL certificate is valid and secure

---

## Windows-Specific Checklist

### Nginx on Windows

- [ ] Nginx installed at `C:\nginx`
- [ ] Configuration files in `C:\nginx\conf\conf.d`
- [ ] SSL certificate files in `C:\nginx\conf\ssl`
- [ ] DH parameters generated at `C:\nginx\conf\dhparam.pem`

### Windows Environment

- [ ] Environment variables set using `set-windows-env.bat`
- [ ] Command prompt restarted to apply environment variables
- [ ] Windows Firewall configured to allow ports 80 and 443
- [ ] Nginx running as a Windows service (optional)

### Windows Deployment

- [ ] Build files deployed to `C:\nginx\html\repmotivatedseller`
- [ ] Nginx configuration tested and working
- [ ] Site accessible at both localhost and your domain
