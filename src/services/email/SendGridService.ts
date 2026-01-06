// SendGrid Email Service
export interface EmailOptions {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
}

class SendGridService {
  private apiKey: string;
  private defaultFrom: string = 'noreply@repmotivatedseller.com';

  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY || '';
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: options.to }],
            dynamic_template_data: options.dynamicTemplateData
          }],
          from: { email: options.from || this.defaultFrom },
          subject: options.subject,
          content: options.html ? [{ type: 'text/html', value: options.html }] : [{ type: 'text/plain', value: options.text || '' }],
          template_id: options.templateId
        })
      });

      return { success: response.ok };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async sendBulkEmail(emails: EmailOptions[]): Promise<{ success: boolean; sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const email of emails) {
      const result = await this.sendEmail(email);
      if (result.success) sent++;
      else failed++;
    }

    return { success: sent > 0, sent, failed };
  }
}

export default new SendGridService();
