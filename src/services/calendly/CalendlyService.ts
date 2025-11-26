export interface CalendlyEvent {
  uri: string
  name: string
  status: string
  start_time: string
  end_time: string
  event_type: string
  location?: {
    type: string
    location?: string
    join_url?: string
  }
  invitee: {
    name: string
    email: string
    phone?: string
  }
}

export interface CalendlyEventType {
  uri: string
  name: string
  slug: string
  duration: number
  description_plain: string
  scheduling_url: string
  active: boolean
  color: string
  internal_note?: string
}

class CalendlyService {
  private apiKey: string
  private baseUrl = 'https://api.calendly.com'
  private userUri: string

  constructor() {
    this.apiKey = import.meta.env.VITE_CALENDLY_API_KEY || ''
    this.userUri = import.meta.env.VITE_CALENDLY_USER_URI || ''
  }

  // Get user's event types
  async getEventTypes(): Promise<CalendlyEventType[]> {
    try {
      const response = await fetch(`${this.baseUrl}/event_types?user=${this.userUri}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to fetch event types')

      const data = await response.json()
      return data.collection || []
    } catch (error) {
      console.error('Calendly event types error:', error)
      return []
    }
  }

  // Get scheduled events
  async getScheduledEvents(count: number = 20): Promise<CalendlyEvent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/scheduled_events?user=${this.userUri}&count=${count}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to fetch scheduled events')

      const data = await response.json()
      return data.collection || []
    } catch (error) {
      console.error('Calendly scheduled events error:', error)
      return []
    }
  }

  // Get single event details
  async getEvent(eventUri: string): Promise<CalendlyEvent | null> {
    try {
      const response = await fetch(`${this.baseUrl}/scheduled_events/${eventUri}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Failed to fetch event')

      const data = await response.json()
      return data.resource || null
    } catch (error) {
      console.error('Calendly event error:', error)
      return null
    }
  }

  // Cancel an event
  async cancelEvent(eventUri: string, reason?: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/scheduled_events/${eventUri}/cancellation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: reason || 'Cancelled by user'
        })
      })

      return response.ok
    } catch (error) {
      console.error('Calendly cancel event error:', error)
      return false
    }
  }

  // Generate embed URL
  generateEmbedUrl(eventTypeSlug: string, options?: {
    prefill?: {
      name?: string
      email?: string
      phone?: string
    }
    utm?: {
      source?: string
      medium?: string
      campaign?: string
    }
    hideGdprBanner?: boolean
    hideLandingPageDetails?: boolean
  }): string {
    const baseUrl = `https://calendly.com/${eventTypeSlug}`
    const params = new URLSearchParams()

    if (options?.prefill) {
      if (options.prefill.name) params.append('name', options.prefill.name)
      if (options.prefill.email) params.append('email', options.prefill.email)
      if (options.prefill.phone) params.append('phone', options.prefill.phone)
    }

    if (options?.utm) {
      if (options.utm.source) params.append('utm_source', options.utm.source)
      if (options.utm.medium) params.append('utm_medium', options.utm.medium)
      if (options.utm.campaign) params.append('utm_campaign', options.utm.campaign)
    }

    if (options?.hideGdprBanner) params.append('hide_gdpr_banner', '1')
    if (options?.hideLandingPageDetails) params.append('hide_landing_page_details', '1')

    return `${baseUrl}${params.toString() ? '?' + params.toString() : ''}`
  }

  // Generate popup widget URL
  generatePopupUrl(eventTypeSlug: string): string {
    return `https://calendly.com/${eventTypeSlug}`
  }
}

export default new CalendlyService()