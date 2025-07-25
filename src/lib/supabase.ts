import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export interface ForeclosureResponse {
  id: string;
  
  // Contact Information
  name: string;
  email: string;
  phone: string;
  
  // Situation Assessment
  property_address?: string;
  property_value?: number;
  mortgage_balance?: number;
  missed_payments?: number;
  received_nod?: boolean;
  
  // Problem Identification
  challenges?: string;
  difficulties?: string;
  
  // Impact Analysis
  family_impact?: string;
  financial_impact?: string;
  
  // Solution Planning
  preferred_solution?: string;
  openness_to_options?: string;
  
  // Status Tracking
  status: 'new' | 'in_progress' | 'contacted' | 'resolved' | 'closed';
  notes?: string;
  assigned_to?: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
  urgency_level: 'low' | 'medium' | 'high';
  crm_sync_status: 'pending' | 'synced' | 'failed';
  crm_id?: string;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  slack_notifications: boolean;
  follow_up_days: number[];
  created_at: string;
  updated_at: string;
}

// Helper functions for common database operations
export async function getForeclosureResponses(options?: {
  status?: string;
  urgency?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}) {
  let query = supabase.from('foreclosure_responses').select('*');
  
  // Apply filters
  if (options?.status) {
    query = query.eq('status', options.status);
  }
  
  if (options?.urgency) {
    query = query.eq('urgency_level', options.urgency);
  }
  
  if (options?.search) {
    query = query.or(`name.ilike.%${options.search}%,email.ilike.%${options.search}%,phone.ilike.%${options.search}%`);
  }
  
  // Apply sorting
  if (options?.sortBy) {
    query = query.order(options.sortBy, { ascending: options.sortOrder === 'asc' });
  } else {
    // Default sort by created_at desc
    query = query.order('created_at', { ascending: false });
  }
  
  // Apply pagination
  if (options?.page && options?.limit) {
    const from = (options.page - 1) * options.limit;
    const to = from + options.limit - 1;
    query = query.range(from, to);
  }
  
  const { data, error, count } = await query;
  
  if (error) {
    console.error('Error fetching foreclosure responses:', error);
    throw error;
  }
  
  return { data, count };
}

export async function getForeclosureResponseById(id: string) {
  const { data, error } = await supabase
    .from('foreclosure_responses')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching foreclosure response:', error);
    throw error;
  }
  
  return data;
}

export async function updateForeclosureResponse(id: string, updates: Partial<ForeclosureResponse>) {
  const { data, error } = await supabase
    .from('foreclosure_responses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating foreclosure response:', error);
    throw error;
  }
  
  return data;
}

export async function getNotificationSettings() {
  const { data, error } = await supabase
    .from('notification_settings')
    .select('*')
    .limit(1)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
    console.error('Error fetching notification settings:', error);
    throw error;
  }
  
  return data;
}

export async function updateNotificationSettings(updates: Partial<NotificationSettings>) {
  const { data: existingSettings } = await supabase
    .from('notification_settings')
    .select('id')
    .limit(1)
    .single();
  
  let result;
  
  if (existingSettings) {
    // Update existing settings
    const { data, error } = await supabase
      .from('notification_settings')
      .update(updates)
      .eq('id', existingSettings.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
    
    result = data;
  } else {
    // Create new settings
    const { data, error } = await supabase
      .from('notification_settings')
      .insert([updates])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating notification settings:', error);
      throw error;
    }
    
    result = data;
  }
  
  return result;
}