# MailerLite Integration Guide for RepMotivatedSeller

This guide explains how to set up and use the MailerLite integration for email notifications in the RepMotivatedSeller project.

## API Configuration

The RepMotivatedSeller project uses the MailerLite JSON API with the following configuration:

- **Base URL**: `https://connect.mailerlite.com/api`
- **Required Headers**:
  ```
  Content-Type: application/json
  Accept: application/json
  Authorization: Bearer YOUR_API_KEY
  ```

## Setup Instructions

### 1. Get Your MailerLite API Key

1. Sign up or log in to your MailerLite account at [MailerLite.com](https://www.mailerlite.com/)
2. Go to **Settings** > **Integrations** > **Developer API**
3. Generate a new API key with appropriate permissions
4. Copy the API key for use in the next step

### 2. Set Up Environment Variables

Run the MailerLite setup script:

```batch
scripts\setup-mailerlite.bat
```

This script will:
- Set your MailerLite API key in Supabase secrets
- Configure sender email address
- Set notification recipient emails
- Deploy the send-notification-email function

### 3. Create Required Subscriber Groups

The system uses the following subscriber groups:

1. **new_leads** - All new submissions
2. **urgent_cases** - High-priority cases
3. **foreclosure_clients** - All foreclosure clients

These groups will be created automatically when the first subscriber is added, but you can also create them manually in your MailerLite account:

1. Go to **Subscribers** > **Groups**
2. Click **Create group**
3. Enter the group name (e.g., "new_leads")
4. Repeat for each required group

### 4. Set Up Email Templates (Optional)

For more advanced email customization:

1. Go to **Campaigns** > **Templates**
2. Create templates for different notification types:
   - New submission notifications
   - Urgent case alerts
   - Welcome emails
   - Follow-up reminders

## Using the Integration

### Automatic Notifications

The system automatically sends notifications when:

1. A new foreclosure questionnaire is submitted
2. A submission is marked as urgent
3. A submission status is updated
4. Follow-up reminders are due

### Manual Testing

To test the email notification system:

```batch
scripts\update-mailerlite-api.bat
```

Select "Y" when prompted to test the function.

## API Endpoints Used

The integration uses the following MailerLite API endpoints:

### Subscribers

- **Create/Update Subscriber**: `POST /api/subscribers`
  ```json
  {
    "email": "subscriber@example.com",
    "fields": {
      "name": "John Doe",
      "phone": "+1234567890",
      "address": "123 Main St",
      "urgency": "high",
      "status": "new",
      "submission_date": "2023-07-15T12:00:00Z"
    }
  }
  ```

### Groups

- **Get Groups**: `GET /api/groups?filter[name]=group_name`
- **Create Group**: `POST /api/groups`
  ```json
  {
    "name": "group_name"
  }
  ```
- **Add Subscriber to Group**: `POST /api/subscribers/{subscriber_id}/groups/{group_id}`

### Campaigns

- **Create Campaign**: `POST /api/campaigns`
  ```json
  {
    "name": "Campaign Name",
    "type": "regular",
    "emails": [{
      "subject": "Email Subject",
      "from": "sender@example.com",
      "from_name": "Sender Name",
      "content": {
        "html": "HTML Content"
      }
    }],
    "recipients": {
      "type": "email",
      "emails": ["recipient@example.com"]
    }
  }
  ```

## Troubleshooting

### Common Issues

1. **API Key Invalid**
   - Verify your API key is correct
   - Check that the API key has the necessary permissions
   - Regenerate the API key if needed

2. **Groups Not Found**
   - The system will create groups automatically if they don't exist
   - Check for typos in group names

3. **Email Sending Fails**
   - Verify sender email is verified in MailerLite
   - Check recipient email addresses are valid
   - Ensure your MailerLite account is in good standing

### Debugging

If you encounter issues with the MailerLite integration:

1. Check Supabase Edge Function logs:
   ```
   supabase functions logs send-notification-email --project-ref ltxqodqlexvojqqxquew
   ```

2. Test the function directly:
   ```
   curl -X POST "https://ltxqodqlexvojqqxquew.supabase.co/functions/v1/send-notification-email" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"type":"test"}'
   ```

3. Verify environment variables are set correctly:
   ```
   supabase secrets list --project-ref ltxqodqlexvojqqxquew
   ```

## Advanced Configuration

### Domain Verification

For better deliverability:

1. Go to **Settings** > **Domains**
2. Add your domain
3. Verify domain ownership via DNS records
4. Configure DKIM for better deliverability

### Custom Tracking Domain

To use your own domain for tracking:

1. Go to **Settings** > **Domains**
2. Set up a custom tracking domain
3. Add the required DNS records

### Automation Workflows

Create automated workflows for follow-ups:

1. Go to **Automation** > **Workflows**
2. Create workflows for:
   - Welcome sequences
   - Follow-up reminders
   - Abandoned form recovery

---

For more information, refer to the [MailerLite API Documentation](https://developers.mailerlite.com/docs/).