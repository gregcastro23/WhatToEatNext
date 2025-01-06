import { config } from '@/config';

type CacheItem<T> = {
  value: T;
  timestamp: number;
  expiresAt: number;
};

export class Cache {
  private static instance: Cache;
  private storage: Map<string, CacheItem<any>>;
  private readonly defaultTTL: number;

  constructor(defaultTTL: number = 3600000) { // default 1 hour timeout
    this.storage = new Map();
    this.defaultTTL = defaultTTL;
  }

  static getInstance(defaultTTL?: number): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache(defaultTTL);
    }
    return Cache.instance;
  }

  set<T>(
    key: string, 
    value: T, 
    ttl: number = this.defaultTTL
  ): void {
    const now = Date.now();
    this.storage.set(key, {
      value,
      timestamp: now,
      expiresAt: now + ttl
    });

    // Clean up expired items periodically
    if (Math.random() < 0.1) { // 10% chance to clean up
      this.cleanup();
    }
  }

  get<T>(key: string): T | null {
    const item = this.storage.get(key);
    
    if (!item) {
      return null;
    }

    const now = Date.now();
    
    // Check if expired
    if (now > item.expiresAt) {
      this.storage.delete(key);
      return null;
    }

    return item.value as T;
  }

  getOrSet<T>(
    key: string,
    factory: () => T | Promise<T>,
    ttl?: number
  ): Promise<T> {
    return new Promise(async (resolve, reject) => {
      try {
        // Check cache first
        const cached = this.get<T>(key);
        if (cached !== null) {
          return resolve(cached);
        }

        // Generate new value
        const value = await factory();
        this.set(key, value, ttl);
        resolve(value);
      } catch (error) {
        reject(error);
      }
    });
  }

  has(key: string): boolean {
    const item = this.storage.get(key);
    if (!item) return false;
    
    const now = Date.now();
    if (now > item.expiresAt) {
      this.storage.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    this.storage.forEach((item, key) => {
      if (now > item.expiresAt) {
        this.storage.delete(key);
      }
    });
  }
}

// Create a default cache instance with a 1-hour timeout if config is not available
const DEFAULT_CACHE_TIMEOUT = 3600000;

export const recipeCache = Cache.getInstance(
  config?.api?.cacheTimeout || DEFAULT_CACHE_TIMEOUT
);

export const cache = {
  get: (key: string) => recipeCache.get(key),
  set: (key: string, value: any) => recipeCache.set(key, value),
  clear: () => recipeCache.clear()
}; 