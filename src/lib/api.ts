import { supabase } from './supabase'

const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL + '/functions/v1'


export const api = {

  // ============================================================================
  // PUBLIC API (No auth required)
  // ============================================================================
  
  // Get consultation types and pricing
  getConsultationTypes: async () => {
    const { data, error } = await supabase
      .from('consultation_types_public')
      .select('*')
    return { data, error }
  },

  // Get platform statistics  
  getPlatformStats: async () => {
    const { data, error } = await supabase
      .from('platform_stats')
      .select('*')
      .single()
    return { data, error }
  },

  // ============================================================================
  // AUTHENTICATED USER API (Views)
  // ============================================================================

  // Get user's payments
  getMyPayments: async () => {
    const { data, error } = await supabase
      .from('my_payments')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Get user's consultations
  getMyConsultations: async () => {
    const { data, error } = await supabase
      .from('my_consultations')
      .select('*')
      .order('booking_date', { ascending: false })
    return { data, error }
  },

  // Get user's leads
  getMyLeads: async () => {
    const { data, error } = await supabase
      .from('my_leads')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // ============================================================================
  // SECURE RPC FUNCTIONS (Writes)
  // ============================================================================

  // Create a new lead
  createLead: async (lead: {
    name: string
    email: string
    phone?: string
    property_address?: string
    lead_source?: string
    notes?: string
  }) => {
    const { data, error } = await supabase.rpc('create_lead', {
      p_name: lead.name,
      p_email: lead.email,
      p_phone: lead.phone,
      p_property_address: lead.property_address,
      p_lead_source: lead.lead_source,
      p_notes: lead.notes
    })
    return { data, error }
  },

  // Update lead status
  updateLeadStatus: async (leadId: string, status: string, notes?: string) => {
    const { data, error } = await supabase.rpc('update_lead_status', {
      p_lead_id: leadId,
      p_status: status,
      p_notes: notes
    })
    return { data, error }
  },

  // Book consultation
  bookConsultation: async (booking: {
    consultation_type: string
    invitee_name: string
    invitee_email: string
    booking_date: string
    notes?: string
  }) => {
    const { data, error } = await supabase.rpc('book_consultation', {
      p_consultation_type: booking.consultation_type,
      p_invitee_name: booking.invitee_name,
      p_invitee_email: booking.invitee_email,
      p_booking_date: booking.booking_date,
      p_notes: booking.notes
    })
    return { data, error }
  },

  // Update consultation status
  updateConsultationStatus: async (
    bookingId: string, 
    status: string, 
    meetingUrl?: string, 
    notes?: string
  ) => {
    const { data, error } = await supabase.rpc('update_consultation_status', {
      p_booking_id: bookingId,
      p_status: status,
      p_meeting_url: meetingUrl,
      p_notes: notes
    })
    return { data, error }
  },

  // ============================================================================
  // FUNCTION CALLS
  // ============================================================================

  // Send SMS
  sendSMS: async (to: string, body: string) => {
    const { data, error } = await supabase.functions.invoke('sms-handler', {
      body: { action: 'send', to, body }
    })
    return { data, error }
  },


  // Webhook security validation
  validateWebhook: async (signature: string, payload: string) => {
    const { data, error } = await supabase.functions.invoke('webhook-security', {
      body: { signature, payload }
    })
    return { data, error }
  }

  // Health check
  healthCheck: async () => {
    const { data, error } = await supabase.functions.invoke('webhook-security', {
      body: { action: 'health' }
    })
    return { data, error }
  }
}

// Test function connectivity
  healthCheck: async () => {
    const { data, error } = await supabase.functions.invoke('webhook-security', {
      body: { action: 'health' }
    })
    return { data, error }
  }
}

// TypeScript types for better development experience
export type ConsultationType = 'basic' | 'premium' | 'enterprise'
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
export type ConsultationStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled'