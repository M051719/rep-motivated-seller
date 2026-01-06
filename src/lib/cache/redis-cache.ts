import Redis from "ioredis";

class CacheManager {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: 3,
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds = 3600): Promise<void> {
    try {
      await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.error("Cache set error:", error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error("Cache delete error:", error);
    }
  }

  async flush(): Promise<void> {
    try {
      await this.redis.flushall();
    } catch (error) {
      console.error("Cache flush error:", error);
    }
  }
}

export const cache = new CacheManager();

// Usage example:
// const cachedData = await cache.get('foreclosure_stats')
// if (!cachedData) {
//   const data = await database.query('SELECT * FROM stats')
//   await cache.set('foreclosure_stats', data, 1800) // Cache for 30 minutes
//   return data
// }
// return cachedData
