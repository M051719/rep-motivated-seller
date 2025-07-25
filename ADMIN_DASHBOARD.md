# RepMotivatedSeller Admin Dashboard

This document provides an overview of the admin dashboard and the new Edge Functions that have been implemented for the RepMotivatedSeller foreclosure assistance platform.

## Admin Dashboard

The admin dashboard provides a comprehensive interface for managing foreclosure submissions, follow-ups, notifications, and user management. It integrates with multiple Supabase Edge Functions to provide real-time data and functionality.

### Features

- **Dashboard Overview**: View key metrics including total submissions, new submissions, follow-ups due today, and conversion rate
- **Submission Management**: View, filter, and update foreclosure submissions
- **Follow-up Management**: Schedule, track, and complete follow-ups with potential clients
- **Notification System**: Send bulk email and SMS notifications to clients
- **User Management**: Add, update, and remove admin users with different role levels
- **System Settings**: Configure general settings and integration credentials

### Access

To access the admin dashboard, open `admin-dashboard.html` in your browser. You'll need to log in with admin credentials that have been set up in the Supabase authentication system.

## New Edge Functions

### 1. send-sms-notification

This Edge Function enables sending SMS notifications to clients using the Twilio API.

#### Features:
- Send individual SMS messages to specific clients
- Send bulk SMS messages to filtered groups of clients
- Automatically log SMS communications in the follow-up logs
- Template support with variable substitution (e.g., `{{name}}`)

#### Usage:
```javascript
// Send individual SMS
fetch(`${SUPABASE_URL}/functions/v1/send-sms-notification`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    to: '+15551234567',
    name: 'John Doe',
    submissionId: '123',
    message: 'Hello {{name}}, this is a test message.'
  })
});

// Send bulk SMS
fetch(`${SUPABASE_URL}/functions/v1/send-sms-notification`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    recipients: 'new', // 'all', 'new', 'processing', or 'custom'
    message: 'Hello {{name}}, this is a bulk message.',
    bulkSend: true
  })
});
```

### 2. auth-management

This Edge Function provides administrative capabilities for user management, including creating, updating, and deleting users with specific roles.

#### Features:
- Create new admin users with specific roles (admin, agent, support)
- Update existing user roles
- Delete users from the system
- Role-based access control

#### Usage:
```javascript
// Create a new user
fetch(`${SUPABASE_URL}/functions/v1/auth-management`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    action: 'create',
    user: {
      email: 'newuser@example.com',
      password: 'securepassword',
      role: 'agent'
    }
  })
});

// Update a user's role
fetch(`${SUPABASE_URL}/functions/v1/auth-management`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    action: 'update',
    userId: 'user-uuid',
    user: {
      role: 'admin'
    }
  })
});

// Delete a user
fetch(`${SUPABASE_URL}/functions/v1/auth-management`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    action: 'delete',
    userId: 'user-uuid'
  })
});
```

## Database Schema Updates

The following tables have been added to support the admin dashboard and new functionality:

### admin_profiles

Stores user role information for access control.

```sql
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'agent', 'support')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### notification_settings

Stores user preferences for notifications.

```sql
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID REFERENCES auth.users(id),
  email_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  follow_up_frequency TEXT DEFAULT 'weekly',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### admin_dashboard_view

A view that provides aggregated data for the admin dashboard.

```sql
CREATE OR REPLACE VIEW public.admin_dashboard_view
WITH (security_invoker=on)
AS
SELECT 
  fr.id,
  fr.property_address,
  fr.name AS contact_name,
  fr.email AS contact_email,
  fr.phone AS contact_phone,
  fr.property_value,
  fr.mortgage_lender,
  fr.missed_payments,
  fr.outstanding_balance,
  fr.current_loan_balance,
  fr.primary_challenge,
  fr.challenge_details,
  fr.urgency_level,
  fr.status,
  fr.processed,
  fr.created_at,
  fr.updated_at,
  (SELECT COUNT(*) FROM public.follow_up_logs ful WHERE ful.submission_id = fr.id) AS follow_up_count,
  (SELECT MAX(ful.contact_date) FROM public.follow_up_logs ful WHERE ful.submission_id = fr.id) AS last_follow_up_date,
  (SELECT MIN(ful.contact_date) FROM public.follow_up_logs ful 
   WHERE ful.submission_id = fr.id AND ful.contact_date > NOW()) AS next_follow_up_date
FROM 
  public.foreclosure_responses fr;
```

## Deployment Instructions

1. Deploy the Edge Functions using the provided script:
   ```
   scripts/deploy-new-functions.bat
   ```

2. Set up the required Twilio credentials as Supabase secrets:
   ```
   supabase secrets set TWILIO_ACCOUNT_SID=your_account_sid TWILIO_AUTH_TOKEN=your_auth_token TWILIO_PHONE_NUMBER=your_phone_number --project-ref ltxqodqlexvojqqxquew
   ```

3. Create an initial admin user via the Supabase dashboard or using the auth-management function

4. Access the admin dashboard by opening `admin-dashboard.html` in your browser

## Security Considerations

- The admin dashboard uses Row Level Security (RLS) policies to ensure that users can only access data appropriate for their role
- The auth-management function verifies that the requesting user has admin privileges before allowing user management operations
- All sensitive credentials (Twilio, etc.) are stored as Supabase secrets and not exposed in client-side code
- Authentication is handled through Supabase Auth with JWT tokens