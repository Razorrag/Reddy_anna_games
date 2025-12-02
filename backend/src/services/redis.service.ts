import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

class RedisService {
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;

  async connect(): Promise<void> {
    try {
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        password: process.env.REDIS_PASSWORD,
      });

      this.client.on('error', (err) => {
        logger.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis client connected');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        logger.info('Redis client ready');
      });

      await this.client.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      logger.info('Redis client disconnected');
    }
  }

  getClient(): RedisClientType {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis client not connected');
    }
    return this.client;
  }

  isHealthy(): boolean {
    return this.isConnected && this.client !== null;
  }

  // Cache operations
  async get(key: string): Promise<string | null> {
    try {
      return await this.getClient().get(key);
    } catch (error) {
      logger.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: string, expirySeconds?: number): Promise<void> {
    try {
      if (expirySeconds) {
        await this.getClient().setEx(key, expirySeconds, value);
      } else {
        await this.getClient().set(key, value);
      }
    } catch (error) {
      logger.error(`Redis SET error for key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.getClient().del(key);
    } catch (error) {
      logger.error(`Redis DEL error for key ${key}:`, error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.getClient().exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  // Session operations
  async setSession(sessionId: string, data: any, ttl: number = 86400): Promise<void> {
    await this.set(`session:${sessionId}`, JSON.stringify(data), ttl);
  }

  async getSession(sessionId: string): Promise<any | null> {
    const data = await this.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.del(`session:${sessionId}`);
  }

  // Rate limiting
  async incrementRateLimit(key: string, window: number): Promise<number> {
    try {
      const client = this.getClient();
      const value = await client.incr(`ratelimit:${key}`);
      
      if (value === 1) {
        await client.expire(`ratelimit:${key}`, window);
      }
      
      return value;
    } catch (error) {
      logger.error(`Redis rate limit error for key ${key}:`, error);
      return 0;
    }
  }

  // Pub/Sub for multi-server WebSocket sync
  async publish(channel: string, message: string): Promise<void> {
    try {
      await this.getClient().publish(channel, message);
    } catch (error) {
      logger.error(`Redis PUBLISH error for channel ${channel}:`, error);
    }
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    try {
      const subscriber = this.client!.duplicate();
      await subscriber.connect();
      
      await subscriber.subscribe(channel, (message) => {
        callback(message);
      });
    } catch (error) {
      logger.error(`Redis SUBSCRIBE error for channel ${channel}:`, error);
    }
  }

  // Cache helpers for common patterns
  async cacheData<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = 300
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch fresh data
    const data = await fetchFn();
    
    // Store in cache
    await this.set(key, JSON.stringify(data), ttl);
    
    return data;
  }

  // List operations for game rooms
  async addToList(listKey: string, value: string): Promise<void> {
    try {
      await this.getClient().rPush(listKey, value);
    } catch (error) {
      logger.error(`Redis RPUSH error for list ${listKey}:`, error);
    }
  }

  async removeFromList(listKey: string, value: string): Promise<void> {
    try {
      await this.getClient().lRem(listKey, 0, value);
    } catch (error) {
      logger.error(`Redis LREM error for list ${listKey}:`, error);
    }
  }

  async getList(listKey: string): Promise<string[]> {
    try {
      return await this.getClient().lRange(listKey, 0, -1);
    } catch (error) {
      logger.error(`Redis LRANGE error for list ${listKey}:`, error);
      return [];
    }
  }

  // Set operations for active users
  async addToSet(setKey: string, member: string): Promise<void> {
    try {
      await this.getClient().sAdd(setKey, member);
    } catch (error) {
      logger.error(`Redis SADD error for set ${setKey}:`, error);
    }
  }

  async removeFromSet(setKey: string, member: string): Promise<void> {
    try {
      await this.getClient().sRem(setKey, member);
    } catch (error) {
      logger.error(`Redis SREM error for set ${setKey}:`, error);
    }
  }

  async getSetMembers(setKey: string): Promise<string[]> {
    try {
      return await this.getClient().sMembers(setKey);
    } catch (error) {
      logger.error(`Redis SMEMBERS error for set ${setKey}:`, error);
      return [];
    }
  }

  async getSetSize(setKey: string): Promise<number> {
    try {
      return await this.getClient().sCard(setKey);
    } catch (error) {
      logger.error(`Redis SCARD error for set ${setKey}:`, error);
      return 0;
    }
  }
}

export const redisService = new RedisService();