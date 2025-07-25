# Property Submission System

This document provides an overview of the property submission system implemented for the RepMotivatedSeller platform.

## Database Schema

The system uses the following tables:

### property_submissions

Stores information about properties submitted by users.

```sql
CREATE TABLE IF NOT EXISTS public.property_submissions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID REFERENCES auth.users(id),
  property_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  property_type TEXT NOT NULL,
  estimated_value NUMERIC(12,2),
  mortgage_balance NUMERIC(12,2),
  foreclosure_status TEXT NOT NULL,
  timeline TEXT,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  preferred_contact_method TEXT NOT NULL,
  additional_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### follow_ups

Tracks scheduled follow-ups for property submissions.

```sql
CREATE TABLE IF NOT EXISTS public.follow_ups (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  submission_id BIGINT REFERENCES public.property_submissions(id) ON DELETE CASCADE,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  notes TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Components

### 1. Property Submission Form

A user-friendly form for collecting property and contact information.

- **File**: `property-submission-form.html`
- **Features**:
  - Collects property details (address, value, foreclosure status)
  - Gathers contact information
  - Submits data to Supabase
  - Triggers notification emails

### 2. Edge Functions

#### schedule-property-followup

Automatically schedules follow-ups for submitted properties.

- **File**: `supabase/functions/schedule-property-followup/index.ts`
- **Features**:
  - Creates multiple follow-up entries based on schedule type
  - Supports urgent, standard, and relaxed follow-up schedules
  - Assigns follow-ups to specific team members

## Setup Instructions

### 1. Database Setup

Run the SQL scripts to create the necessary tables and RLS policies:

```bash
# Connect to your Supabase project's SQL editor and run:
# 1. The table creation script
# 2. The RLS policies script
```

### 2. Create Admin User

Run the admin user creation script in the Supabase SQL editor:

```bash
# Run the create-admin-user.sql script in the SQL editor
```

### 3. Deploy Edge Functions

Use the provided script to deploy the Edge Functions:

```bash
scripts/deploy-property-functions.bat
```

## Usage

### Submitting a Property

1. Open `property-submission-form.html` in a web browser
2. Fill out the property and contact information
3. Submit the form

### Scheduling Follow-ups

Use the Edge Function to schedule follow-ups:

```javascript
// Example API call
fetch('https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/schedule-property-followup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  },
  body: JSON.stringify({
    submissionId: 123,
    scheduleType: 'urgent', // 'urgent', 'standard', or 'relaxed'
    notes: 'High priority lead',
    assignedTo: 'agent-user-id'
  })
});
```

## Security Considerations

- Row Level Security (RLS) policies ensure users can only access their own submissions
- Admin users have elevated privileges to view and manage all submissions
- Authentication is required for sensitive operations