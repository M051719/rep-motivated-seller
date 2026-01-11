// src/services/video/CloudflareStreamService.ts
export interface StreamVideo {
  uid: string;
  thumbnail: string;
  readyToStream: boolean;
  status: {
    state: string;
    pctComplete: string;
  };
  meta: {
    name: string;
  };
  created: string;
  modified: string;
  size: number;
  preview: string;
  duration: number;
}

export interface UploadResult {
  success: boolean;
  videoId?: string;
  uploadUrl?: string;
  error?: string;
}

class CloudflareStreamService {
  private accountId: string;
  private apiToken: string;
  private baseUrl: string;

  constructor() {
    this.accountId = import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID || '';
    this.apiToken = import.meta.env.VITE_CLOUDFLARE_API_TOKEN || '';
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream`;
  }

  // Get signed upload URL for direct upload
  async getUploadUrl(filename: string): Promise<UploadResult> {
    try {
      const response = await fetch(`${this.baseUrl}/direct_upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxDurationSeconds: 3600, // 1 hour max
          meta: {
            name: filename
          }
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          videoId: data.result.uid,
          uploadUrl: data.result.uploadURL
        };
      } else {
        return {
          success: false,
          error: data.errors?.[0]?.message || 'Failed to get upload URL'
        };
      }
    } catch (error) {
      console.error('Upload URL error:', error);
      return {
        success: false,
        error: 'Network error occurred'
      };
    }
  }

  // Upload video file
  async uploadVideo(file: File, onProgress?: (progress: number) => void): Promise<UploadResult> {
    try {
      // First get upload URL
      const uploadResult = await this.getUploadUrl(file.name);
      if (!uploadResult.success || !uploadResult.uploadUrl) {
        return uploadResult;
      }

      // Upload the file
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();

      return new Promise<UploadResult>((resolve) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable && onProgress) {
            const progress = (e.loaded / e.total) * 100;
            onProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            resolve({
              success: true,
              videoId: uploadResult.videoId
            });
          } else {
            resolve({
              success: false,
              error: 'Upload failed'
            });
          }
        });

        xhr.addEventListener('error', () => {
          resolve({
            success: false,
            error: 'Upload error occurred'
          });
        });

        xhr.open('POST', uploadResult.uploadUrl!);
        xhr.send(formData);
      });
    } catch (error) {
      console.error('Video upload error:', error);
      return {
        success: false,
        error: 'Upload failed'
      };
    }
  }

  // Get video details
  async getVideoDetails(videoId: string): Promise<StreamVideo | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${videoId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return data.result;
      }
      
      return null;
    } catch (error) {
      console.error('Get video details error:', error);
      return null;
    }
  }

  // Get all videos
  async listVideos(): Promise<StreamVideo[]> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return data.result;
      }
      
      return [];
    } catch (error) {
      console.error('List videos error:', error);
      return [];
    }
  }

  // Delete video
  async deleteVideo(videoId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        }
      });

      const data = await response.json();
      return response.ok && data.success;
    } catch (error) {
      console.error('Delete video error:', error);
      return false;
    }
  }

  // Get video embed URL
  getEmbedUrl(videoId: string): string {
    return `https://iframe.videodelivery.net/${videoId}`;
  }

  // Get video thumbnail URL
  getThumbnailUrl(videoId: string, time: number = 0): string {
    return `https://videodelivery.net/${videoId}/thumbnails/thumbnail.jpg?time=${time}s`;
  }

  // Get video stream URL for custom player
  getStreamUrl(videoId: string): string {
    return `https://videodelivery.net/${videoId}/manifest/video.m3u8`;
  }
}

export default new CloudflareStreamService();