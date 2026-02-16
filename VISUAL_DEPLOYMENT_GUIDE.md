# Visual Deployment Guide for RepMotivatedSeller

This guide provides a visual walkthrough of the deployment process for the RepMotivatedSeller project.

## Project Architecture Overview

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│                     │     │                     │     │                     │
│  Client Browser     │────▶│  Nginx Web Server   │────▶│  Static HTML/JS/CSS │
│                     │     │                     │     │                     │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
          │                           │                           │
          │                           │                           │
          ▼                           ▼                           ▼
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│                     │     │                     │     │                     │
│  Supabase Edge      │◀───▶│  Supabase Database  │◀───▶│  External Services  │
│  Functions          │     │                     │     │  (MailerLite, etc.) │
│                     │     │                     │     │                     │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
```

## Deployment Flow

```
1. Set Up Environment ──▶ 2. Deploy Edge Functions ──▶ 3. Configure Integrations
       │                           │                           │
       ▼                           ▼                           ▼
4. Deploy to Nginx ◀───── 5. Test Functionality ◀───── 6. Set Up DNS & SSL
```

## Step 1: Initial Setup

### Environment Variables Setup

```
.env
├── Supabase Configuration
│   ├── VITE_SUPABASE_URL=https://ltxqodqlexvojqqxquew.supabase.co
│   └── VITE_SUPABASE_ANON_KEY=sb_publishable_wQE2WLlEvqE1RqWtNPcxGw_tSpNMwmg
│
├── MailerLite Configuration
│   ├── MAILERLITE_API_KEY=your_mailerlite_api_key
│   └── FROM_EMAIL=noreply@repmotivatedseller.org
│
├── Email Recipients
│   ├── ADMIN_EMAIL=admin@repmotivatedseller.org
│   ├── URGENT_EMAIL=urgent@repmotivatedseller.org
│   └── MANAGER_EMAIL=manager@repmotivatedseller.org
│
├── Site Configuration
│   └── SITE_URL=https://repmotivatedseller.shoprealestatespace.org
│
└── Integration Settings
    ├── CRM_TYPE=custom
    ├── CUSTOM_CRM_URL=https://your-crm-api.com/webhook
    ├── ENABLE_SMS_NOTIFICATIONS=true
    └── TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, etc.
```

### Directory Structure

```
rep-motivated-seller/
├── src/                        # Source code
│   ├── components/             # React components
│   │   └── ForeclosureQuestionnaire.tsx
│   └── lib/                    # Utility functions
│       ├── supabase.ts         # Supabase client
│       ├── crm.ts              # CRM integration
│       └── sms.ts              # SMS notifications
│
├── supabase/                   # Supabase configuration
│   ├── functions/              # Edge Functions
│   │   ├── admin-dashboard/    # Admin API
│   │   ├── send-notification-email/
│   │   ├── schedule-follow-ups/
│   │   └── ...
│   │
│   ├── migrations/             # Database migrations
│   │   └── 20230101000000_initial_schema.sql
│   │
│   └── config.toml             # JWT verification settings
│
├── scripts/                    # Deployment scripts
│   ├── deploy-admin-dashboard.bat
│   ├── setup-mailerlite.bat
│   ├── windows-deploy.bat
│   └── ...
│
├── etc/                        # Configuration files
│   └── nginx/
│       └── conf.d/
│           └── repmotivatedseller-windows.conf
│
└── *.html                      # Static HTML files
```

## Step 2: Deploy Edge Functions

### Edge Functions Architecture

```
┌─────────────────────┐
│  admin-dashboard    │──┐
└─────────────────────┘  │
                         │
┌─────────────────────┐  │    ┌─────────────────────┐
│  send-notification- │  │    │                     │
│  email              │──┼───▶│  Supabase Database  │
└─────────────────────┘  │    │                     │
                         │    └─────────────────────┘
┌─────────────────────┐  │              │
│  schedule-follow-ups│──┘              │
└─────────────────────┘                 ▼
                                ┌─────────────────────┐
┌─────────────────────┐         │  External Services  │
│  ai-voice-handler   │────────▶│  - MailerLite       │
└─────────────────────┘         │  - Twilio           │
                                │  - CRM Systems      │
                                └─────────────────────┘
```

### JWT Verification Settings

```
# supabase/config.toml

[functions.admin-dashboard]
verify_jwt = true  # Requires authentication

[functions.send-notification-email]
verify_jwt = false  # Public webhook access

[functions.ai-voice-handler]
verify_jwt = false  # For Twilio webhook
```

## Step 3: Configure Integrations

### MailerLite Integration

```
┌─────────────────────┐     ┌─────────────────────┐
│                     │     │                     │
│  Edge Function      │────▶│  MailerLite API     │
│  send-notification- │     │  connect.mailerlite │
│  email              │     │  .com/api           │
│                     │◀────│                     │
└─────────────────────┘     └─────────────────────┘
          │                           │
          ▼                           ▼
┌─────────────────────┐     ┌─────────────────────┐
│  Subscriber Groups  │     │  Email Templates    │
│  - new_leads        │     │  - New Submission   │
│  - urgent_cases     │     │  - Urgent Case      │
│  - foreclosure_     │     │  - Follow-up        │
│    clients          │     │  - Welcome          │
└─────────────────────┘     └─────────────────────┘
```

### CRM Integration

```
┌─────────────────────┐
│  CRM Options        │
│                     │
│  ┌───────────────┐  │     ┌─────────────────────┐
│  │ HubSpot       │──┼────▶│  Contact Creation   │
│  └───────────────┘  │     │  Lead Scoring       │
│  ┌───────────────┐  │     │  Custom Fields      │
│  │ Salesforce    │──┼────▶│  Activity Logging   │
│  └───────────────┘  │     │                     │
│  ┌───────────────┐  │     └─────────────────────┘
│  │ Custom CRM    │──┘
│  └───────────────┘
└─────────────────────┘
```

### Twilio Integration

```
┌─────────────────────┐     ┌─────────────────────┐
│                     │     │                     │
│  Twilio Phone       │────▶│  ai-voice-handler   │
│  Number             │     │  Edge Function      │
│                     │◀────│                     │
└─────────────────────┘     └─────────────────────┘
                                      │
                                      ▼
                            ┌─────────────────────┐
                            │  OpenAI API         │
                            │  - gpt-3.5-turbo    │
                            │  - gpt-4-turbo      │
                            └─────────────────────┘
```

## Step 4: Deploy to Nginx

### Nginx Configuration

```
server {
    listen 443 ssl;
    server_name repmotivatedseller.shoprealestatespace.org;

    # SSL Configuration
    ssl_certificate     /path/to/certificate.csr;
    ssl_certificate_key /path/to/private.key;
    ssl_dhparam         /path/to/dhparam.pem;

    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000";
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;

    # Application Root
    root /path/to/application/dist;
    index index.html;

    # SPA Routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api/ {
        proxy_pass https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/;
        proxy_set_header Host ltxqodqlexvojqqxquew.supabase.co;
    }
}
```

### Windows Deployment

```
┌─────────────────────┐     ┌─────────────────────┐
│                     │     │                     │
│  install-nginx-     │────▶│  C:\nginx\          │
│  windows.bat        │     │  Installation       │
│                     │     │                     │
└─────────────────────┘     └─────────────────────┘
                                      │
                                      ▼
┌─────────────────────┐     ┌─────────────────────┐
│                     │     │                     │
│  windows-deploy.bat │────▶│  C:\nginx\html\     │
│                     │     │  repmotivatedseller │
│                     │     │                     │
└─────────────────────┘     └─────────────────────┘
```

## Step 5: Testing

### Authentication Testing

```
┌─────────────────────┐     ┌─────────────────────┐
│                     │     │                     │
│  test-auth.bat      │────▶│  JWT Token          │
│                     │     │  Validation         │
│                     │     │                     │
└─────────────────────┘     └─────────────────────┘
                                      │
                                      ▼
                            ┌─────────────────────┐
                            │                     │
                            │  Protected Edge     │
                            │  Functions          │
                            │                     │
                            └─────────────────────┘
```

### Integration Testing

```
┌─────────────────────┐     ┌─────────────────────┐
│  Form Submission    │────▶│  Database Entry     │
└─────────────────────┘     └─────────────────────┘
          │                           │
          ▼                           ▼
┌─────────────────────┐     ┌─────────────────────┐
│  Email Notification │     │  CRM Lead Creation  │
└─────────────────────┘     └─────────────────────┘
          │                           │
          ▼                           ▼
┌─────────────────────┐     ┌─────────────────────┐
│  Admin Dashboard    │     │  Follow-up          │
│  Display            │     │  Scheduling         │
└─────────────────────┘     └─────────────────────┘
```

## Step 6: DNS and SSL

### DNS Configuration

```
Domain: repmotivatedseller.shoprealestatespace.org

A Record:
repmotivatedseller.shoprealestatespace.org → [Your Server IP]

CNAME Records:
www.repmotivatedseller.shoprealestatespace.org → repmotivatedseller.shoprealestatespace.org
```

### SSL Certificate

```
Certificate Files:
- star_repmotivatedseller_shoprealestatespace_org.csr
- star_repmotivatedseller_shoprealestatespace_org.key

Location:
C:/nginx/conf/ssl/

DH Parameters:
C:/nginx/conf/dhparam.pem
```

## Maintenance and Updates

### Backup Process

```
┌─────────────────────┐     ┌─────────────────────┐
│                     │     │                     │
│  backup-and-deploy  │────▶│  backups/           │
│  .bat               │     │  YYYYMMDD_HHMMSS/   │
│                     │     │                     │
└─────────────────────┘     └─────────────────────┘
                                      │
                                      ▼
                            ┌─────────────────────┐
                            │  - dist/            │
                            │  - supabase/        │
                            │    functions/       │
                            └─────────────────────┘
```

### Update Process

```
1. Backup ──▶ 2. Code Changes ──▶ 3. Build
     │               │                │
     ▼               ▼                ▼
6. Monitor ◀── 5. Test ◀───── 4. Deploy
```

## Troubleshooting

### Common Issues and Solutions

```
┌─────────────────────┐     ┌─────────────────────┐
│  Build Issues       │────▶│  fix-install.bat    │
└─────────────────────┘     └─────────────────────┘

┌─────────────────────┐     ┌─────────────────────┐
│  JWT Auth Issues    │────▶│  test-auth.bat      │
└─────────────────────┘     └─────────────────────┘

┌─────────────────────┐     ┌─────────────────────┐
│  Function Errors    │────▶│  Supabase Dashboard │
│                     │     │  Function Logs      │
└─────────────────────┘     └─────────────────────┘

┌─────────────────────┐     ┌─────────────────────┐
│  Nginx Issues       │────▶│  C:\nginx\logs\     │
│                     │     │  error.log          │
└─────────────────────┘     └─────────────────────┘
```
