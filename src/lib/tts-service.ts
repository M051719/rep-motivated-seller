interface TTSRequest {
  text: string
  voice_id?: string
  output_format?: string
  sample_rate?: string
  speed?: 'x-slow' | 'slow' | 'medium' | 'fast' | 'x-fast'
  pitch?: 'x-low' | 'low' | 'medium' | 'high' | 'x-high'
}

interface TTSResponse {
  success: boolean
  audio_url?: string
  audio_id?: string
  duration?: number
  voice_id?: string
  text_length?: number
  metadata?: {
    format: string
    sample_rate: string
    speed: string
    pitch: string
  }
  error?: string
  details?: string
  request_id?: string
}

export class TTSService {
  private static instance: TTSService
  private lambdaUrl: string
  private cache = new Map<string, TTSResponse>()

  private constructor() {
    this.lambdaUrl = import.meta.env.VITE_LAMBDA_FUNCTION_URL || ''
    if (!this.lambdaUrl) {
      throw new Error('VITE_LAMBDA_FUNCTION_URL environment variable is required')
    }
  }

  static getInstance(): TTSService {
    if (!TTSService.instance) {
      TTSService.instance = new TTSService()
    }
    return TTSService.instance
  }

  async synthesizeText(request: TTSRequest): Promise<TTSResponse> {
    // Create cache key
    const cacheKey = JSON.stringify(request)
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!
      console.log('Returning cached TTS result')
      return cached
    }

    try {
      console.log('Synthesizing text:', request.text.substring(0, 50) + '...')
      
      const response = await fetch(this.lambdaUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: request.text,
          voice_id: request.voice_id || 'Joanna',
          output_format: request.output_format || 'mp3',
          sample_rate: request.sample_rate || '22050',
          speed: request.speed || 'medium',
          pitch: request.pitch || 'medium',
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: TTSResponse = await response.json()

      if (result.success && result.audio_url) {
        // Cache successful results
        this.cache.set(cacheKey, result)
        console.log('TTS synthesis successful:', result.audio_id)
      }

      return result
    } catch (error) {
      console.error('TTS synthesis failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  async getVoices(): Promise<string[]> {
    // Return available Polly voices
    return [
      'Joanna',    // US English, Female
      'Matthew',   // US English, Male
      'Ivy',       // US English, Child
      'Kendra',    // US English, Female
      'Kimberly',  // US English, Female
      'Salli',     // US English, Female
      'Joey',      // US English, Male
      'Justin',    // US English, Child
      'Emma',      // British English, Female
      'Brian',     // British English, Male
      'Amy',       // British English, Female
      'Nicole',    // Australian English, Female
      'Russell',   // Australian English, Male
    ]
  }

  preloadAudio(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio()
      audio.oncanplaythrough = () => resolve()
      audio.onerror = () => reject(new Error('Failed to preload audio'))
      audio.src = url
      audio.load()
    })
  }

  clearCache(): void {
    this.cache.clear()
    console.log('TTS cache cleared')
  }
}