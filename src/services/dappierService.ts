/**
 * Dappier Service
 * Real-time AI data retrieval and search service
 * Documentation: https://mcp.dappier.com
 */

interface DappierSearchParams {
  query: string;
  limit?: number;
  filters?: Record<string, any>;
}

interface DappierResponse {
  success: boolean;
  data: any;
  error?: string;
}

interface DappierRealTimeData {
  content: string;
  sources: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  timestamp: string;
}

class DappierService {
  private apiKey: string;
  private baseUrl: string = 'https://api.dappier.com/app/datamodelconversation';

  constructor() {
    this.apiKey = import.meta.env.VITE_DAPPIER_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('❌ Dappier API key not configured. Set VITE_DAPPIER_API_KEY in environment variables.');
    } else {
      console.log('✅ Dappier Service initialized with API key');
    }
  }

  /**
   * Check if Dappier service is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Search for real-time information using Dappier AI Data Models
   */
  async search(params: DappierSearchParams): Promise<DappierResponse> {
    if (!this.isConfigured()) {
      console.warn('⚠️ Dappier not configured - returning empty result');
      return {
        success: false,
        data: null,
        error: 'Dappier API key not configured'
      };
    }

    try {
      console.log('🔍 Dappier API Request:', { query: params.query });
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.apiKey
        },
        body: JSON.stringify({
          query: params.query,
          num_articles_ref: params.limit || 5
        })
      });

      console.log('📡 Dappier Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Dappier API error:', response.status, errorText);
        throw new Error(`Dappier API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Dappier data received:', data);
      
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('❌ Dappier search error:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get real-time data for a specific topic
   */
  async getRealTimeData(topic: string): Promise<DappierRealTimeData | null> {
    const result = await this.search({ query: topic, limit: 3 });
    
    if (!result.success || !result.data) {
      return null;
    }

    return {
      content: result.data.summary || '',
      sources: result.data.sources || [],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Enhance AI chat responses with real-time data
   */
  async enhanceWithRealTimeData(userMessage: string): Promise<string | null> {
    console.log('🤖 Checking if message needs real-time data:', userMessage);
    
    // Detect if the message is asking for current/real-time information
    const realTimeKeywords = [
      'current', 'latest', 'today', 'now', 'recent',
      'market', 'price', 'rates', 'forecast', 'trends',
      'foreclosure', 'mortgage', 'real estate'
    ];

    const needsRealTimeData = realTimeKeywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword)
    );

    if (!needsRealTimeData) {
      console.log('ℹ️ No real-time data needed for this query');
      return null;
    }

    console.log('🔄 Fetching real-time data from Dappier...');
    const result = await this.search({ query: userMessage, limit: 3 });
    
    if (!result.success || !result.data) {
      console.warn('⚠️ No real-time data available:', result.error);
      return null;
    }

    // Format the real-time data from Dappier response
    let enhancement = `\n\n📊 **Real-Time Data (powered by Dappier AI):**\n\n`;
    
    // Dappier returns a response with content and references
    if (result.data.response) {
      enhancement += `${result.data.response}\n`;
    }
    
    if (result.data.references && result.data.references.length > 0) {
      enhancement += `\n**📰 Sources:**\n`;
      result.data.references.forEach((ref: any, idx: number) => {
        enhancement += `${idx + 1}. ${ref.title || 'Source'}\n`;
        if (ref.snippet) {
          enhancement += `   "${ref.snippet}"\n`;
        }
      });
    }

    enhancement += `\n*✓ Live data retrieved ${new Date().toLocaleTimeString()}*\n`;

    console.log('✅ Real-time data enhancement ready');
    return enhancement;
  }

  /**
   * Get real estate market data for a specific location
   */
  async getMarketData(location: string): Promise<DappierResponse> {
    return this.search({
      query: `real estate market data for ${location}`,
      limit: 5,
      filters: {
        category: 'real-estate',
        type: 'market-data'
      }
    });
  }

  /**
   * Get foreclosure information for a location
   */
  async getForeclosureData(location: string): Promise<DappierResponse> {
    return this.search({
      query: `foreclosure rates and trends in ${location}`,
      limit: 5,
      filters: {
        category: 'real-estate',
        type: 'foreclosure'
      }
    });
  }

  /**
   * Get mortgage rate information
   */
  async getMortgageRates(): Promise<DappierResponse> {
    return this.search({
      query: 'current mortgage rates and trends',
      limit: 3,
      filters: {
        category: 'finance',
        type: 'mortgage-rates'
      }
    });
  }

  /**
   * Stream real-time data using SSE
   */
  async streamData(
    query: string, 
    onData: (data: any) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    if (!this.isConfigured()) {
      onError(new Error('Dappier API key not configured'));
      return;
    }

    try {
      const eventSource = new EventSource(
        `${this.baseUrl}/sse?apiKey=${this.apiKey}&query=${encodeURIComponent(query)}`
      );

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onData(data);
        } catch (error) {
          console.error('Error parsing SSE data:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        eventSource.close();
        onError(new Error('SSE connection failed'));
      };
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Unknown streaming error'));
    }
  }
}

// Export singleton instance
export const dappierService = new DappierService();

// Export types
export type { DappierSearchParams, DappierResponse, DappierRealTimeData };
