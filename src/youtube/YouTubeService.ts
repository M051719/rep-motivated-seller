export interface YouTubeVideo {
  id: string
  title: string
  description: string
  thumbnails: {
    default: { url: string; width: number; height: number }
    medium: { url: string; width: number; height: number }
    high: { url: string; width: number; height: number }
  }
  publishedAt: string
  duration: string
  durationFormatted: string
  viewCount: number
  likeCount: number
  commentCount: number
  categoryId: string
  embedUrl: string
}

export interface YouTubePlaylist {
  id: string
  title: string
  description: string
  thumbnails: any
  publishedAt: string
  itemCount: number
}

export interface YouTubeChannel {
  id: string
  title: string
  description: string
  subscriberCount: number
  videoCount: number
  viewCount: number
  thumbnails: any
}

class YouTubeService {
  private apiKey: string
  private channelId: string
  private baseUrl = 'https://www.googleapis.com/youtube/v3'

  constructor() {
    this.apiKey = import.meta.env.VITE_YOUTUBE_API_KEY || ''
    this.channelId = import.meta.env.VITE_YOUTUBE_CHANNEL_ID || ''
  }

  // Get channel information
  async getChannelInfo(): Promise<YouTubeChannel | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/channels?part=snippet,statistics&id=${this.channelId}&key=${this.apiKey}`
      )

      if (!response.ok) throw new Error('Failed to fetch channel info')

      const data = await response.json()
      const channel = data.items?.[0]

      if (!channel) return null

      return {
        id: channel.id,
        title: channel.snippet.title,
        description: channel.snippet.description,
        subscriberCount: parseInt(channel.statistics.subscriberCount),
        videoCount: parseInt(channel.statistics.videoCount),
        viewCount: parseInt(channel.statistics.viewCount),
        thumbnails: channel.snippet.thumbnails
      }
    } catch (error) {
      console.error('YouTube channel info error:', error)
      return null
    }
  }

  // Get recent videos from channel
  async getChannelVideos(maxResults: number = 12): Promise<YouTubeVideo[]> {
    try {
      // First get video IDs from channel
      const searchResponse = await fetch(
        `${this.baseUrl}/search?part=id&channelId=${this.channelId}&type=video&order=date&maxResults=${maxResults}&key=${this.apiKey}`
      )

      if (!searchResponse.ok) throw new Error('Failed to fetch videos')

      const searchData = await searchResponse.json()
      const videoIds = searchData.items?.map((item: any) => item.id.videoId).join(',')

      if (!videoIds) return []

      return this.getVideoDetails(videoIds)
    } catch (error) {
      console.error('YouTube videos error:', error)
      return []
    }
  }

  // Get video by ID
  async getVideoById(videoId: string): Promise<YouTubeVideo | null> {
    try {
      const videos = await this.getVideoDetails(videoId)
      return videos[0] || null
    } catch (error) {
      console.error('YouTube video error:', error)
      return null
    }
  }

  // Get playlists from channel
  async getChannelPlaylists(maxResults: number = 10): Promise<YouTubePlaylist[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/playlists?part=snippet,contentDetails&channelId=${this.channelId}&maxResults=${maxResults}&key=${this.apiKey}`
      )

      if (!response.ok) throw new Error('Failed to fetch playlists')

      const data = await response.json()

      return data.items?.map((playlist: any) => ({
        id: playlist.id,
        title: playlist.snippet.title,
        description: playlist.snippet.description,
        thumbnails: playlist.snippet.thumbnails,
        publishedAt: playlist.snippet.publishedAt,
        itemCount: playlist.contentDetails.itemCount
      })) || []
    } catch (error) {
      console.error('YouTube playlists error:', error)
      return []
    }
  }

  // Get videos from a specific playlist
  async getPlaylistVideos(playlistId: string, maxResults: number = 50): Promise<YouTubeVideo[]> {
    try {
      // Get playlist items
      const playlistResponse = await fetch(
        `${this.baseUrl}/playlistItems?part=contentDetails&playlistId=${playlistId}&maxResults=${maxResults}&key=${this.apiKey}`
      )

      if (!playlistResponse.ok) throw new Error('Failed to fetch playlist items')

      const playlistData = await playlistResponse.json()
      const videoIds = playlistData.items?.map((item: any) => item.contentDetails.videoId).join(',')

      if (!videoIds) return []

      return this.getVideoDetails(videoIds)
    } catch (error) {
      console.error('YouTube playlist videos error:', error)
      return []
    }
  }

  // Search for videos
  async searchVideos(query: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
    try {
      // Search for videos
      const searchResponse = await fetch(
        `${this.baseUrl}/search?part=id&q=${encodeURIComponent(query)}&type=video&order=relevance&maxResults=${maxResults}&key=${this.apiKey}`
      )

      if (!searchResponse.ok) throw new Error('Failed to search videos')

      const searchData = await searchResponse.json()
      const videoIds = searchData.items?.map((item: any) => item.id.videoId).join(',')

      if (!videoIds) return []

      return this.getVideoDetails(videoIds)
    } catch (error) {
      console.error('YouTube search error:', error)
      return []
    }
  }

  // Helper method to get detailed video information
  private async getVideoDetails(videoIds: string): Promise<YouTubeVideo[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${this.apiKey}`
      )

      if (!response.ok) throw new Error('Failed to fetch video details')

      const data = await response.json()

      return data.items?.map((video: any) => ({
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnails: video.snippet.thumbnails,
        publishedAt: video.snippet.publishedAt,
        duration: video.contentDetails.duration,
        durationFormatted: this.formatDuration(video.contentDetails.duration),
        viewCount: parseInt(video.statistics.viewCount || '0'),
        likeCount: parseInt(video.statistics.likeCount || '0'),
        commentCount: parseInt(video.statistics.commentCount || '0'),
        categoryId: video.snippet.categoryId,
        embedUrl: `https://www.youtube.com/embed/${video.id}`
      })) || []
    } catch (error) {
      console.error('Get video details error:', error)
      return []
    }
  }

  // Convert ISO 8601 duration to readable format
  formatDuration(isoDuration: string): string {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!match) return '0:00'

    const hours = parseInt(match[1] || '0')
    const minutes = parseInt(match[2] || '0')
    const seconds = parseInt(match[3] || '0')

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }
  }

  // Format large numbers (views, subscribers, etc.)
  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    } else {
      return num.toString()
    }
  }

  // Get video categories
  async getVideoCategories(): Promise<{id: string, title: string}[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/videoCategories?part=snippet&regionCode=US&key=${this.apiKey}`
      )

      if (!response.ok) throw new Error('Failed to fetch categories')

      const data = await response.json()

      return data.items?.map((category: any) => ({
        id: category.id,
        title: category.snippet.title
      })) || []
    } catch (error) {
      console.error('YouTube categories error:', error)
      return []
    }
  }

  // Get video comments
  async getVideoComments(videoId: string, maxResults: number = 20): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/commentThreads?part=snippet&videoId=${videoId}&maxResults=${maxResults}&order=relevance&key=${this.apiKey}`
      )

      if (!response.ok) throw new Error('Failed to fetch comments')

      const data = await response.json()

      return data.items?.map((item: any) => ({
        id: item.id,
        text: item.snippet.topLevelComment.snippet.textDisplay,
        author: item.snippet.topLevelComment.snippet.authorDisplayName,
        publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
        likeCount: item.snippet.topLevelComment.snippet.likeCount
      })) || []
    } catch (error) {
      console.error('YouTube comments error:', error)
      return []
    }
  }

  // Get trending videos in real estate/finance category
  async getTrendingVideos(categoryId: string = '25', maxResults: number = 10): Promise<YouTubeVideo[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/videos?part=snippet,statistics,contentDetails&chart=mostPopular&regionCode=US&videoCategoryId=${categoryId}&maxResults=${maxResults}&key=${this.apiKey}`
      )

      if (!response.ok) throw new Error('Failed to fetch trending videos')

      const data = await response.json()

      return data.items?.map((video: any) => ({
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnails: video.snippet.thumbnails,
        publishedAt: video.snippet.publishedAt,
        duration: video.contentDetails.duration,
        durationFormatted: this.formatDuration(video.contentDetails.duration),
        viewCount: parseInt(video.statistics.viewCount || '0'),
        likeCount: parseInt(video.statistics.likeCount || '0'),
        commentCount: parseInt(video.statistics.commentCount || '0'),
        categoryId: video.snippet.categoryId,
        embedUrl: `https://www.youtube.com/embed/${video.id}`
      })) || []
    } catch (error) {
      console.error('YouTube trending videos error:', error)
      return []
    }
  }

  // Get channel analytics (requires OAuth - for admin use)
  async getChannelAnalytics(startDate: string, endDate: string): Promise<any> {
    try {
      // Note: This requires OAuth authentication for your own channel
      const response = await fetch(
        `${this.baseUrl}/reports?ids=channel==${this.channelId}&startDate=${startDate}&endDate=${endDate}&metrics=views,comments,likes,subscribersGained&dimensions=day&key=${this.apiKey}`
      )

      if (!response.ok) throw new Error('Failed to fetch analytics')

      return await response.json()
    } catch (error) {
      console.error('YouTube analytics error:', error)
      return null
    }
  }

  // Create embed URL with custom parameters
  createEmbedUrl(videoId: string, options?: {
    autoplay?: boolean
    mute?: boolean
    start?: number
    end?: number
    controls?: boolean
    showinfo?: boolean
    rel?: boolean
  }): string {
    const params = new URLSearchParams()
    
    if (options?.autoplay) params.append('autoplay', '1')
    if (options?.mute) params.append('mute', '1')
    if (options?.start) params.append('start', options.start.toString())
    if (options?.end) params.append('end', options.end.toString())
    if (options?.controls === false) params.append('controls', '0')
    if (options?.showinfo === false) params.append('showinfo', '0')
    if (options?.rel === false) params.append('rel', '0')

    const queryString = params.toString()
    return `https://www.youtube.com/embed/${videoId}${queryString ? '?' + queryString : ''}`
  }

  // Generate video thumbnail URL
  getThumbnailUrl(videoId: string, quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'high'): string {
    return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`
  }
}

export default new YouTubeService()