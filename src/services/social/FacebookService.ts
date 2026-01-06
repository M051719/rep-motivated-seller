export interface FacebookPost {
  id: string;
  message?: string;
  story?: string;
  full_picture?: string;
  permalink_url: string;
  created_time: string;
  updated_time: string;
  likes?: {
    data: any[];
    summary: {
      total_count: number;
    };
  };
  comments?: {
    data: any[];
    summary: {
      total_count: number;
    };
  };
  shares?: {
    count: number;
  };
}

export interface FacebookPage {
  id: string;
  name: string;
  about?: string;
  category: string;
  fan_count: number;
  picture: {
    data: {
      url: string;
    };
  };
  cover?: {
    source: string;
  };
  website?: string;
}

export interface FacebookEvent {
  id: string;
  name: string;
  description?: string;
  start_time: string;
  end_time?: string;
  place?: {
    name: string;
    location: {
      city: string;
      country: string;
      latitude: number;
      longitude: number;
      state: string;
      street: string;
      zip: string;
    };
  };
  cover?: {
    source: string;
  };
  attending_count: number;
  interested_count: number;
}

class FacebookService {
  private accessToken: string;
  private pageId: string;
  private baseUrl = "https://graph.facebook.com/v18.0";

  constructor() {
    this.accessToken = import.meta.env.VITE_FACEBOOK_ACCESS_TOKEN || "";
    this.pageId = import.meta.env.VITE_FACEBOOK_PAGE_ID || "";
  }

  // Get page information
  async getPageInfo(): Promise<FacebookPage | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.pageId}?fields=id,name,about,category,fan_count,picture{url},cover{source},website&access_token=${this.accessToken}`,
      );

      if (response.ok) {
        return await response.json();
      }

      return null;
    } catch (error) {
      console.error("Facebook page info error:", error);
      return null;
    }
  }

  // Get page posts
  async getPagePosts(limit: number = 10): Promise<FacebookPost[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.pageId}/posts?fields=id,message,story,full_picture,permalink_url,created_time,updated_time,likes.summary(true),comments.summary(true),shares&limit=${limit}&access_token=${this.accessToken}`,
      );

      if (response.ok) {
        const data = await response.json();
        return data.data || [];
      }

      return [];
    } catch (error) {
      console.error("Facebook posts error:", error);
      return [];
    }
  }

  // Get page events
  async getPageEvents(limit: number = 10): Promise<FacebookEvent[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.pageId}/events?fields=id,name,description,start_time,end_time,place,cover{source},attending_count,interested_count&limit=${limit}&access_token=${this.accessToken}`,
      );

      if (response.ok) {
        const data = await response.json();
        return data.data || [];
      }

      return [];
    } catch (error) {
      console.error("Facebook events error:", error);
      return [];
    }
  }

  // Post to page (requires page access token with publish permissions)
  async createPost(
    message: string,
    link?: string,
    pictureUrl?: string,
  ): Promise<{ id: string } | null> {
    try {
      const postData: any = {
        message: message,
        access_token: this.accessToken,
      };

      if (link) postData.link = link;
      if (pictureUrl) postData.picture = pictureUrl;

      const response = await fetch(`${this.baseUrl}/${this.pageId}/feed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        return await response.json();
      }

      return null;
    } catch (error) {
      console.error("Facebook create post error:", error);
      return null;
    }
  }

  // Get post insights (requires page access token)
  async getPostInsights(postId: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${postId}/insights?metric=post_impressions,post_reach,post_reactions_by_type_total&access_token=${this.accessToken}`,
      );

      if (response.ok) {
        const data = await response.json();
        return data.data || [];
      }

      return [];
    } catch (error) {
      console.error("Facebook post insights error:", error);
      return [];
    }
  }

  // Get page insights
  async getPageInsights(
    period: "day" | "week" | "days_28" = "week",
  ): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.pageId}/insights?metric=page_fans,page_impressions,page_reach,page_engaged_users&period=${period}&access_token=${this.accessToken}`,
      );

      if (response.ok) {
        const data = await response.json();
        return data.data || [];
      }

      return [];
    } catch (error) {
      console.error("Facebook page insights error:", error);
      return [];
    }
  }

  // Search for posts with specific hashtag or keyword
  async searchPosts(query: string, limit: number = 10): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/search?q=${encodeURIComponent(query)}&type=post&limit=${limit}&access_token=${this.accessToken}`,
      );

      if (response.ok) {
        const data = await response.json();
        return data.data || [];
      }

      return [];
    } catch (error) {
      console.error("Facebook search posts error:", error);
      return [];
    }
  }

  // Format date for display
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Generate Facebook share URL
  generateShareUrl(url: string, quote?: string): string {
    const params = new URLSearchParams({
      u: url,
    });

    if (quote) params.append("quote", quote);

    return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
  }

  // Generate Facebook page URL
  getPageUrl(): string {
    return `https://www.facebook.com/${this.pageId}`;
  }
}

export default new FacebookService();
