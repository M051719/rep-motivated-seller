/**
 * YouTube Data API v3 Integration
 *
 * This module provides functions to fetch videos from a YouTube channel
 * and integrate them into the RepMotivatedSeller platform.
 *
 * Setup Instructions:
 * 1. Go to https://console.cloud.google.com/
 * 2. Create a new project or select existing
 * 3. Enable YouTube Data API v3
 * 4. Create credentials (API Key)
 * 5. Add API key to .env as VITE_YOUTUBE_API_KEY
 * 6. Add channel ID to .env as VITE_YOUTUBE_CHANNEL_ID
 */

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  videoId: string;
}

export interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  itemCount: number;
}

/**
 * Convert ISO 8601 duration to readable format
 * Example: PT15M51S -> 15:51
 */
function parseDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';

  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format view count for display
 */
function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Fetch videos from a YouTube channel
 */
export async function fetchChannelVideos(
  channelId?: string,
  maxResults: number = 50
): Promise<YouTubeVideo[]> {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
  const channelIdToUse = channelId || import.meta.env.VITE_YOUTUBE_CHANNEL_ID;

  if (!apiKey) {
    console.warn('YouTube API key not configured. Set VITE_YOUTUBE_API_KEY in .env file.');
    return [];
  }

  if (!channelIdToUse) {
    console.warn('YouTube Channel ID not configured. Set VITE_YOUTUBE_CHANNEL_ID in .env file.');
    return [];
  }

  try {
    // Step 1: Get the uploads playlist ID for the channel
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelIdToUse}&key=${apiKey}`
    );

    if (!channelResponse.ok) {
      throw new Error(`YouTube API error: ${channelResponse.statusText}`);
    }

    const channelData = await channelResponse.json();

    if (!channelData.items || channelData.items.length === 0) {
      console.warn('No channel found with the provided ID');
      return [];
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

    // Step 2: Get videos from the uploads playlist
    const playlistResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${apiKey}`
    );

    if (!playlistResponse.ok) {
      throw new Error(`YouTube API error: ${playlistResponse.statusText}`);
    }

    const playlistData = await playlistResponse.json();

    if (!playlistData.items || playlistData.items.length === 0) {
      return [];
    }

    // Step 3: Get video details (duration, views, likes)
    const videoIds = playlistData.items.map((item: any) => item.snippet.resourceId.videoId).join(',');

    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${apiKey}`
    );

    if (!videosResponse.ok) {
      throw new Error(`YouTube API error: ${videosResponse.statusText}`);
    }

    const videosData = await videosResponse.json();

    // Combine the data
    const videos: YouTubeVideo[] = playlistData.items.map((item: any, index: number) => {
      const videoDetails = videosData.items.find((v: any) => v.id === item.snippet.resourceId.videoId);

      return {
        id: item.id,
        videoId: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
        duration: videoDetails ? parseDuration(videoDetails.contentDetails.duration) : '0:00',
        publishedAt: item.snippet.publishedAt,
        viewCount: videoDetails ? parseInt(videoDetails.statistics.viewCount || '0') : 0,
        likeCount: videoDetails ? parseInt(videoDetails.statistics.likeCount || '0') : 0,
      };
    });

    return videos;
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    return [];
  }
}

/**
 * Fetch playlists from a YouTube channel
 */
export async function fetchChannelPlaylists(
  channelId?: string,
  maxResults: number = 25
): Promise<YouTubePlaylist[]> {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
  const channelIdToUse = channelId || import.meta.env.VITE_YOUTUBE_CHANNEL_ID;

  if (!apiKey || !channelIdToUse) {
    return [];
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&channelId=${channelIdToUse}&maxResults=${maxResults}&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return [];
    }

    const playlists: YouTubePlaylist[] = data.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
      itemCount: item.contentDetails.itemCount,
    }));

    return playlists;
  } catch (error) {
    console.error('Error fetching YouTube playlists:', error);
    return [];
  }
}

/**
 * Fetch videos from a specific playlist
 */
export async function fetchPlaylistVideos(
  playlistId: string,
  maxResults: number = 50
): Promise<YouTubeVideo[]> {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

  if (!apiKey) {
    return [];
  }

  try {
    const playlistResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${maxResults}&key=${apiKey}`
    );

    if (!playlistResponse.ok) {
      throw new Error(`YouTube API error: ${playlistResponse.statusText}`);
    }

    const playlistData = await playlistResponse.json();

    if (!playlistData.items || playlistData.items.length === 0) {
      return [];
    }

    const videoIds = playlistData.items.map((item: any) => item.snippet.resourceId.videoId).join(',');

    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${apiKey}`
    );

    if (!videosResponse.ok) {
      throw new Error(`YouTube API error: ${videosResponse.statusText}`);
    }

    const videosData = await videosResponse.json();

    const videos: YouTubeVideo[] = playlistData.items.map((item: any) => {
      const videoDetails = videosData.items.find((v: any) => v.id === item.snippet.resourceId.videoId);

      return {
        id: item.id,
        videoId: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
        duration: videoDetails ? parseDuration(videoDetails.contentDetails.duration) : '0:00',
        publishedAt: item.snippet.publishedAt,
        viewCount: videoDetails ? parseInt(videoDetails.statistics.viewCount || '0') : 0,
        likeCount: videoDetails ? parseInt(videoDetails.statistics.likeCount || '0') : 0,
      };
    });

    return videos;
  } catch (error) {
    console.error('Error fetching playlist videos:', error);
    return [];
  }
}

/**
 * Get YouTube embed URL for a video
 */
export function getEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Get YouTube watch URL for a video
 */
export function getWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * Format view count for display
 */
export function formatViews(count: number): string {
  return formatViewCount(count);
}
