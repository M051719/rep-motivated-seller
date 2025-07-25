/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly MAILERLITE_API_KEY: string
  readonly FROM_EMAIL: string
  readonly ADMIN_EMAIL: string
  readonly URGENT_EMAIL: string
  readonly MANAGER_EMAIL: string
  readonly SITE_URL: string
  readonly ENABLE_SMS_NOTIFICATIONS: string
  readonly TWILIO_ACCOUNT_SID?: string
  readonly TWILIO_AUTH_TOKEN?: string
  readonly TWILIO_PHONE_NUMBER?: string
  readonly URGENT_SMS_RECIPIENTS?: string
  readonly CRM_TYPE?: string
  readonly HUBSPOT_API_KEY?: string
  readonly HUBSPOT_OWNER_ID?: string
  readonly SALESFORCE_CLIENT_ID?: string
  readonly SALESFORCE_CLIENT_SECRET?: string
  readonly SALESFORCE_USERNAME?: string
  readonly SALESFORCE_PASSWORD?: string
  readonly SALESFORCE_SECURITY_TOKEN?: string
  readonly PIPEDRIVE_API_KEY?: string
  readonly CUSTOM_CRM_URL?: string
  readonly CUSTOM_CRM_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}