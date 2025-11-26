export interface EmailTemplate {
  id: string
  name: string
  subject: string
  html_content: string
  plain_content: string
  generation: 'dynamic' | 'legacy'
  updated_at: string
}

export interface EmailRecipient {
  email: string
  name?: string
}

export interface EmailData {
  to: EmailRecipient[]
  from: EmailRecipient
  subject: string
  html?: string
  text?: string
  templateId?: string
  dynamicTemplateData?: any
  categories?: string[]
  customArgs?: { [key: string]: string }
}

export interface EmailStats {
  date: string
  stats: Array<{
    type: string
    name: string
    metrics: {
      blocks: number
      bounce_drops: number
      bounces: number
      clicks: number
      deferred: number
      delivered: number
      invalid_emails: number
      opens: number
      processed: number
      requests: number
      spam_report_drops: number
      spam_reports: number
      unique_clicks: number
      unique_opens: number
      unsubscribe_drops: number
      unsubscribes: number
    }
  }>
}

export interface ContactList {
  id: string
  name: string
  contact_count: number
  _metadata?: {
    self: string
  }
}

export interface Contact {
  id?: string
  email: string
  first_name?: string
  last_name?: string
  phone_number?: string
  address_line_1?: string
  address_line_2?: string
  city?: string
  state_province_region?: string
  postal_code?: string
  country?: string
  custom_fields?: { [key: string]: any }
  created_at?: string
  updated_at?: string
}

export interface BulkEmailRequest {
  recipients: EmailRecipient[]
  templateId?: string
  subject?: string
  html?: string
  text?: string
  from: EmailRecipient
  categories?: string[]
  sendAt?: Date
}

class SendGridService {
  private apiKey: string
  private baseUrl = 'https://api.sendgrid.com/v3'

  constructor() {
    this.apiKey = import.meta.env.VITE_SENDGRID_API_KEY || ''
  }

  // Send single email
  async sendEmail(emailData: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/mail/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: emailData.to,
              subject: emailData.subject,
              dynamic_template_data: emailData.dynamicTemplateData || {}
            }
          ],
          from: emailData.from,
          content: emailData.templateId ? undefined : [
            {
              type: 'text/plain',
              value: emailData.text || ''
            },
            {
              type: 'text/html',
              value: emailData.html || ''
            }
          ].filter(c => c.value),
          template_id: emailData.templateId,
          categories: emailData.categories || ['repmotivatedseller'],
          custom_args: emailData.customArgs || {},
          tracking_settings: {
            click_tracking: {
              enable: true,
              enable_text: false
            },
            open_tracking: {
              enable: true,
              substitution_tag: '%open_track%'
            },
            subscription_tracking: {
              enable: true,
              text: 'If you would like to unsubscribe and stop receiving these emails click here: <%unsubscribe%>.',
              html: '<p>If you would like to unsubscribe and stop receiving these emails <% click here %>.</p>',
              substitution_tag: '<%unsubscribe%>'
            }
          }
        })
      })

      if (response.ok) {
        const messageId = response.headers.get('x-message-id')
        return { success: true, messageId: messageId || undefined }
      } else {
        const errorData = await response.json()
        return { success: false, error: errorData.errors?.[0]?.message || 'Send failed' }
      }
    } catch (error) {
      console.error('SendGrid send email error:', error)
      return { success: false, error: 'Network error occurred' }
    }
  }

  // Send bulk emails
  async sendBulkEmails(
    recipients: EmailRecipient[],
    templateId: string,
    dynamicTemplateData?: any,
    sendAt?: Date
  ): Promise<{ success: boolean; results: any[]; errors: any[] }> {
    try {
      const personalizations = recipients.map(recipient => ({
        to: [recipient],
        dynamic_template_data: {
          ...dynamicTemplateData,
          recipient_name: recipient.name || recipient.email.split('@')[0],
          recipient_email: recipient.email
        }
      }))

      // SendGrid allows max 1000 personalizations per request
      const batchSize = 1000
      const results = []
      const errors = []

      for (let i = 0; i < personalizations.length; i += batchSize) {
        const batch = personalizations.slice(i, i + batchSize)
        
        const requestBody: any = {
          personalizations: batch,
          from: {
            email: 'noreply@repmotivatedseller.org',
            name: 'RepMotivatedSeller'
          },
          template_id: templateId,
          categories: ['repmotivatedseller', 'bulk'],
          tracking_settings: {
            click_tracking: { enable: true },
            open_tracking: { enable: true },
            subscription_tracking: { enable: true }
          }
        }

        if (sendAt) {
          requestBody.send_at = Math.floor(sendAt.getTime() / 1000)
        }

        try {
          const response = await fetch(`${this.baseUrl}/mail/send`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          })

          if (response.ok) {
            results.push({
              batch: i / batchSize + 1,
              sent: batch.length,
              messageId: response.headers.get('x-message-id')
            })
          } else {
            const errorData = await response.json()
            errors.push({
              batch: i / batchSize + 1,
              error: errorData.errors?.[0]?.message || 'Batch send failed'
            })
          }
        } catch (batchError) {
          errors.push({
            batch: i / batchSize + 1,
            error: `Network error: ${batchError}`
          })
        }

        // Add delay between batches to avoid rate limiting
        if (i + batchSize < personalizations.length) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }

      return {
        success: errors.length === 0,
        results,
        errors
      }
    } catch (error) {
      console.error('SendGrid bulk email error:', error)
      return {
        success: false,
        results: [],
        errors: [{ error: error.message }]
      }
    }
  }

  // Get all templates
  async getTemplates(): Promise<EmailTemplate[]> {
    try {
      const response = await fetch(`${this.baseUrl}/templates?generations=dynamic,legacy&page_size=200`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        return data.templates || []
      }
      
      return []
    } catch (error) {
      console.error('SendGrid get templates error:', error)
      return []
    }
  }

  // Get single template
  async getTemplate(templateId: string): Promise<EmailTemplate | null> {
    try {
      const response = await fetch(`${this.baseUrl}/templates/${templateId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        return await response.json()
      }
      
      return null
    } catch (error) {
      console.error('SendGrid get template error:', error)
      return null
    }
  }

  // Create new template
  async createTemplate(
    name: string,
    subject: string,
    htmlContent: string,
    plainContent?: string
  ): Promise<EmailTemplate | null> {
    try {
      const response = await fetch(`${this.baseUrl}/templates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          generation: 'dynamic'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create template')
      }

      const template = await response.json()

      // Add version to the template
      const versionResponse = await fetch(`${this.baseUrl}/templates/${template.id}/versions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          template_id: template.id,
          active: 1,
          name: `${name} - Version 1`,
          subject: subject,
          html_content: htmlContent,
          plain_content: plainContent || this.stripHtml(htmlContent),
          generate_plain_content: !plainContent
        })
      })

      if (versionResponse.ok) {
        return template
      } else {
        // Clean up template if version creation failed
        await this.deleteTemplate(template.id)
        throw new Error('Failed to create template version')
      }
    } catch (error) {
      console.error('SendGrid create template error:', error)
      return null
    }
  }

  // Update template
  async updateTemplate(
    templateId: string,
    name?: string,
    subject?: string,
    htmlContent?: string,
    plainContent?: string
  ): Promise<boolean> {
    try {
      // Update template name if provided
      if (name) {
        await fetch(`${this.baseUrl}/templates/${templateId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name })
        })
      }

      // Update template version if content provided
      if (subject || htmlContent || plainContent) {
        // Get active version
        const versionsResponse = await fetch(`${this.baseUrl}/templates/${templateId}/versions`, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        })

        if (versionsResponse.ok) {
          const versionsData = await versionsResponse.json()
          const activeVersion = versionsData.versions.find((v: any) => v.active === 1)

          if (activeVersion) {
            const updateData: any = {}
            if (subject) updateData.subject = subject
            if (htmlContent) updateData.html_content = htmlContent
            if (plainContent) updateData.plain_content = plainContent
            else if (htmlContent) updateData.plain_content = this.stripHtml(htmlContent)

            const response = await fetch(`${this.baseUrl}/templates/${templateId}/versions/${activeVersion.id}`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(updateData)
            })

            return response.ok
          }
        }
      }

      return true
    } catch (error) {
      console.error('SendGrid update template error:', error)
      return false
    }
  }

  // Delete template
  async deleteTemplate(templateId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      return response.ok
    } catch (error) {
      console.error('SendGrid delete template error:', error)
      return false
    }
  }

  // Get email statistics
  async getEmailStats(
    startDate: string,
    endDate?: string,
    aggregatedBy: 'day' | 'week' | 'month' = 'day'
  ): Promise<EmailStats[]> {
    try {
      const params = new URLSearchParams({
        start_date: startDate,
        aggregated_by: aggregatedBy
      })

      if (endDate) {
        params.append('end_date', endDate)
      }

      const response = await fetch(`${this.baseUrl}/stats?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        return await response.json()
      }
      
      return []
    } catch (error) {
      console.error('SendGrid get stats error:', error)
      return []
    }
  }

  // Get bounces
  async getBounces(startTime?: number, endTime?: number, limit: number = 100): Promise<any[]> {
    try {
      const params = new URLSearchParams({ limit: limit.toString() })
      if (startTime) params.append('start_time', startTime.toString())
      if (endTime) params.append('end_time', endTime.toString())

      const response = await fetch(`${this.baseUrl}/suppression/bounces?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        return await response.json()
      }
      
      return []
    } catch (error) {
      console.error('SendGrid get bounces error:', error)
      return []
    }
  }

  // Get spam reports
  async getSpamReports(startTime?: number, endTime?: number, limit: number = 100): Promise<any[]> {
    try {
      const params = new URLSearchParams({ limit: limit.toString() })
      if (startTime) params.append('start_time', startTime.toString())
      if (endTime) params.append('end_time', endTime.toString())

      const response = await fetch(`${this.baseUrl}/suppression/spam_reports?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        return await response.json()
      }
      
      return []
    } catch (error) {
      console.error('SendGrid get spam reports error:', error)
      return []
    }
  }

  // Get unsubscribes
  async getUnsubscribes(startTime?: number, endTime?: number, limit: number = 100): Promise<any[]> {
    try {
      const params = new URLSearchParams({ limit: limit.toString() })
      if (startTime) params.append('start_time', startTime.toString())
      if (endTime) params.append('end_time', endTime.toString())

      const response = await fetch(`${this.baseUrl}/suppression/unsubscribes?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        return await response.json()
      }
      
      return []
    } catch (error) {
      console.error('SendGrid get unsubscribes error:', error)
      return []
    }
  }

  // Create contact list
  async createContactList(name: string): Promise<ContactList | null> {
    try {
      const response = await fetch(`${this.baseUrl}/marketing/lists`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
      })

      if (response.ok) {
        return await response.json()
      }
      
      return null
    } catch (error) {
      console.error('SendGrid create contact list error:', error)
      return null
    }
  }

  // Get all contact lists
  async getContactLists(): Promise<ContactList[]> {
    try {
      const response = await fetch(`${this.baseUrl}/marketing/lists`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        return data.result || []
      }
      
      return []
    } catch (error) {
      console.error('SendGrid get contact lists error:', error)
      return []
    }
  }

  // Add contacts to list
  async addContactsToList(listId: string, contacts: Contact[]): Promise<{ success: boolean; jobId?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/marketing/contacts`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          list_ids: [listId],
          contacts: contacts
        })
      })

      if (response.ok) {
        const data = await response.json()
        return { success: true, jobId: data.job_id }
      }
      
      return { success: false }
    } catch (error) {
      console.error('SendGrid add contacts error:', error)
      return { success: false }
    }
  }

  // Remove email from suppression list
  async removeFromSuppressionList(email: string, type: 'bounces' | 'spam_reports' | 'unsubscribes' = 'unsubscribes'): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/suppression/${type}/${email}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      return response.ok
    } catch (error) {
      console.error('SendGrid remove from suppression error:', error)
      return false
    }
  }

  // Send test email
  async sendTestEmail(
    to: string,
    subject: string,
    htmlContent: string,
    plainContent?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendEmail({
      to: [{ email: to }],
      from: { email: 'noreply@repmotivatedseller.org', name: 'RepMotivatedSeller' },
      subject: `[TEST] ${subject}`,
      html: htmlContent,
      text: plainContent,
      categories: ['test', 'repmotivatedseller']
    })
  }

  // Validate email address
  async validateEmail(email: string): Promise<{ valid: boolean; reason?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/validations/email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          source: 'signup'
        })
      })

      if (response.ok) {
        const data = await response.json()
        return {
          valid: data.result.verdict === 'Valid',
          reason: data.result.verdict !== 'Valid' ? data.result.verdict : undefined
        }
      }
      
      return { valid: false, reason: 'Validation service unavailable' }
    } catch (error) {
      console.error('SendGrid email validation error:', error)
      return { valid: false, reason: 'Validation failed' }
    }
  }

  // Helper method to strip HTML tags
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim()
  }

  // Format date for SendGrid API
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0]
  }

// Send welcome email
await SendGridService.sendEmail({
  to: [{ email: 'user@example.com', name: 'John Doe' }],
  from: { email: 'noreply@repmotivatedseller.org', name: 'RepMotivatedSeller' },
  subject: 'Welcome to RepMotivatedSeller!',
  html: '<h1>Welcome!</h1><p>Thanks for joining us.</p>',
  categories: ['welcome']
})

// Send bulk emails
await SendGridService.sendBulkEmails(
  [
    { email: 'user1@example.com', name: 'User 1' },
    { email: 'user2@example.com', name: 'User 2' }
  ],
  'template-id-here',
  { company: 'RepMotivatedSeller' }
)

// Get email statistics
const stats = await SendGridService.getEmailStats('2024-01-01', '2024-01-31')

  // Get API status
  async getApiStatus(): Promise<{ status: string; version?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      return {
        status: response.ok ? 'connected' : 'error',
        version: response.headers.get('x-api-version') || undefined
      }
    } catch (error) {
      return { status: 'error' }
    }
  }
}

export default new SendGridService()