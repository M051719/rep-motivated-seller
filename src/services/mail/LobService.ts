// Lob Direct Mail Service
export interface MailingAddress {
  name: string;
  address_line1: string;
  address_line2?: string;
  address_city: string;
  address_state: string;
  address_zip: string;
}

export interface PostcardOptions {
  to: MailingAddress;
  from: MailingAddress;
  front: string;
  back: string;
  size?: '4x6' | '6x9' | '6x11';
}

export interface LetterOptions {
  to: MailingAddress;
  from: MailingAddress;
  file: string;
  color?: boolean;
  double_sided?: boolean;
}

class LobService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.LOB_API_KEY || '';
  }

  async sendPostcard(options: PostcardOptions): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const response = await fetch('https://api.lob.com/v1/postcards', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(this.apiKey + ':')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(options)
      });

      const data = await response.json();
      return { success: response.ok, id: data.id };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async sendLetter(options: LetterOptions): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const response = await fetch('https://api.lob.com/v1/letters', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(this.apiKey + ':')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(options)
      });

      const data = await response.json();
      return { success: response.ok, id: data.id };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async verifyAddress(address: Partial<MailingAddress>): Promise<{ success: boolean; verified?: MailingAddress; error?: string }> {
    try {
      const response = await fetch('https://api.lob.com/v1/us_verifications', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(this.apiKey + ':')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(address)
      });

      const data = await response.json();
      return { success: response.ok, verified: data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}

export default new LobService();
