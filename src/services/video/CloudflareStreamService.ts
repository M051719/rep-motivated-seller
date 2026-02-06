// Cloudflare Stream Video Service
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
  duration: number;
  input: {
    width: number;
    height: number;
  };
}

class CloudflareStreamService {
  private accountId: string;
  private apiToken: string;

  constructor() {
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID || "";
    this.apiToken = process.env.CLOUDFLARE_API_TOKEN || "";
  }

  async uploadVideo(
    file: File,
    metadata?: Record<string, any>,
  ): Promise<{ success: boolean; video?: StreamVideo; error?: string }> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (metadata) {
        formData.append("meta", JSON.stringify(metadata));
      }

      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
          },
          body: formData,
        },
      );

      const data = await response.json();
      return { success: response.ok, video: data.result };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async getVideo(
    videoId: string,
  ): Promise<{ success: boolean; video?: StreamVideo; error?: string }> {
    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream/${videoId}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
          },
        },
      );

      const data = await response.json();
      return { success: response.ok, video: data.result };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async deleteVideo(
    videoId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream/${videoId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
          },
        },
      );

      return { success: response.ok };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  getStreamUrl(videoId: string): string {
    return `https://customer-${this.accountId}.cloudflarestream.com/${videoId}/manifest/video.m3u8`;
  }

  getThumbnailUrl(videoId: string, time?: number): string {
    const timeParam = time ? `?time=${time}s` : "";
    return `https://customer-${this.accountId}.cloudflarestream.com/${videoId}/thumbnails/thumbnail.jpg${timeParam}`;
  }
}

export default new CloudflareStreamService();
