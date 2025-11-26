// Business Hours Helper
// Determines if the business is currently open

export interface BusinessHours {
  isOpen: boolean
  currentTime: Date
  dayOfWeek: string
  message: string
  nextOpenTime?: string
}

/**
 * Check if business is currently open
 * Business Hours: Monday-Friday, 9 AM - 5 PM Pacific Time
 */
export function checkBusinessHours(): BusinessHours {
  const now = new Date()

  // Convert to Pacific Time (UTC-8 or UTC-7 for DST)
  const pacificTime = new Date(
    now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })
  )

  const day = pacificTime.getDay() // 0 = Sunday, 6 = Saturday
  const hour = pacificTime.getHours()
  const minute = pacificTime.getMinutes()

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayOfWeek = dayNames[day]

  // Business hours: Monday (1) through Friday (5), 9 AM to 5 PM
  const isWeekday = day >= 1 && day <= 5
  const isWithinHours = hour >= 9 && (hour < 17 || (hour === 17 && minute === 0))

  const isOpen = isWeekday && isWithinHours

  let message = ''
  let nextOpenTime = ''

  if (isOpen) {
    message = 'We are currently open. Our business hours are Monday through Friday, 9 AM to 5 PM Pacific Time.'
  } else {
    // After hours or weekend
    if (day === 0) {
      // Sunday
      message = 'We are currently closed. Our office is closed on weekends. We will be open Monday at 9 AM Pacific Time.'
      nextOpenTime = 'Monday at 9 AM Pacific Time'
    } else if (day === 6) {
      // Saturday
      message = 'We are currently closed. Our office is closed on weekends. We will be open Monday at 9 AM Pacific Time.'
      nextOpenTime = 'Monday at 9 AM Pacific Time'
    } else if (hour < 9) {
      // Before business hours on weekday
      message = `We are currently closed. Our office opens at 9 AM Pacific Time. We will be open today at 9 AM.`
      nextOpenTime = 'today at 9 AM Pacific Time'
    } else {
      // After business hours on weekday
      if (day === 5) {
        // Friday after hours
        message = 'We are currently closed. Our business hours are Monday through Friday, 9 AM to 5 PM Pacific Time. We will be open Monday at 9 AM.'
        nextOpenTime = 'Monday at 9 AM Pacific Time'
      } else {
        // Monday-Thursday after hours
        message = 'We are currently closed. Our business hours are Monday through Friday, 9 AM to 5 PM Pacific Time. We will be open tomorrow at 9 AM.'
        nextOpenTime = 'tomorrow at 9 AM Pacific Time'
      }
    }
  }

  return {
    isOpen,
    currentTime: pacificTime,
    dayOfWeek,
    message,
    nextOpenTime,
  }
}

/**
 * Get after-hours greeting message
 */
export function getAfterHoursGreeting(): string {
  const hours = checkBusinessHours()

  return `Thank you for calling RepMotivatedSeller.
${hours.message}

If this is an urgent foreclosure matter, please press 5 to leave a detailed voicemail, and we will prioritize your call.
For general information, please visit our website at repmotivatedseller dot com.`
}

/**
 * Get business hours greeting message
 */
export function getBusinessHoursGreeting(): string {
  return `Thank you for calling RepMotivatedSeller, your foreclosure assistance partner.
We are currently open and ready to help you.`
}

/**
 * Check if it's an urgent time (close to foreclosure deadlines)
 * This can be enhanced to check against caller's foreclosure deadline
 */
export function isUrgentTime(): boolean {
  // For now, treat all calls during last hour of business day as potentially urgent
  const hours = checkBusinessHours()
  const hour = hours.currentTime.getHours()

  return hour >= 16 && hour < 17 // 4-5 PM Pacific
}

/**
 * Get emergency contact message
 */
export function getEmergencyMessage(): string {
  return `If you are facing an immediate foreclosure emergency, such as a sale scheduled within 24 hours,
please hang up and call our emergency hotline at 1-877-806-4677.
You can also text URGENT to that number for immediate assistance.`
}
