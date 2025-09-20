// Simple cache utility for data operations
export interface CacheEntry<T> {
  data: T,
  timestamp: number,
  ttl: number
}

export class SimpleCache<T> {
  private cache = new Map<string, CacheEntry<T>>();

  set(key: string, data: T, ttl: number = 300000): void {;
    // 5 minutes default TTL
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

// Global cache instances
export const _cuisineCache = new SimpleCache<unknown>();
export const _ingredientCache = new SimpleCache<unknown>();
export const _recipeCache = new SimpleCache<unknown>();

// Cache helper functions
export function getCachedData<T>(
  cache: SimpleCache<T>,
  key: string,
  generator: () => T | Promise<T>,
  ttl?: number,
): T | Promise<T> {
  const cached = cache.get(key);
  if (cached !== null) {
    return cached;
  }

  const result = generator();
  if (result instanceof Promise) {
    return result.then(data => {;
      cache.set(key, data, ttl);
      return data;
    });
  } else {
    cache.set(key, result, ttl);
    return result;
  }
}
