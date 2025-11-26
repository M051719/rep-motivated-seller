import React, { useEffect, useRef } from 'react'

interface CalendlyWidgetProps {
  url: string
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
  height?: number
  onEventScheduled?: (event: any) => void
  onDateAndTimeSelected?: (event: any) => void
  onEventTypeViewed?: (event: any) => void
}

const CalendlyWidget: React.FC<CalendlyWidgetProps> = ({
  url,
  prefill,
  utm,
  height = 630,
  onEventScheduled,
  onDateAndTimeSelected,
  onEventTypeViewed
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load Calendly widget script
    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    document.body.appendChild(script)

    script.onload = () => {
      if (window.Calendly && containerRef.current) {
        // Build URL with parameters
        const params = new URLSearchParams()
        
        if (prefill) {
          Object.entries(prefill).forEach(([key, value]) => {
            if (value) params.append(key, value)
          })
        }
        
        if (utm) {
          Object.entries(utm).forEach(([key, value]) => {
            if (value) params.append(`utm_${key}`, value)
          })
        }

        const fullUrl = `${url}${params.toString() ? '?' + params.toString() : ''}`

        // Initialize Calendly widget
        window.Calendly.initInlineWidget({
          url: fullUrl,
          parentElement: containerRef.current,
          prefill: prefill || {},
          utm: utm || {}
        })

        // Event listeners
        if (onEventScheduled) {
          window.addEventListener('message', (e) => {
            if (e.data.event && e.data.event === 'calendly.event_scheduled') {
              onEventScheduled(e.data.payload)
            }
          })
        }

        if (onDateAndTimeSelected) {
          window.addEventListener('message', (e) => {
            if (e.data.event && e.data.event === 'calendly.date_and_time_selected') {
              onDateAndTimeSelected(e.data.payload)
            }
          })
        }

        if (onEventTypeViewed) {
          window.addEventListener('message', (e) => {
            if (e.data.event && e.data.event === 'calendly.event_type_viewed') {
              onEventTypeViewed(e.data.payload)
            }
          })
        }
      }
    }

    return () => {
      document.body.removeChild(script)
    }
  }, [url, prefill, utm, onEventScheduled, onDateAndTimeSelected, onEventTypeViewed])

  return (
    <div 
      ref={containerRef}
      style={{ minWidth: '320px', height: `${height}px` }}
      className="calendly-inline-widget"
    />
  )
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    Calendly: {
      initInlineWidget: (options: any) => void
      initPopupWidget: (options: any) => void
      showPopupWidget: (url: string) => void
      closePopupWidget: () => void
    }
  }
}

export default CalendlyWidget