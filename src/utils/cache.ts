/**
 * Simple in-memory cache implementation
 */
export class Cache {
  private cache: Map<string, { data: unknown, expiry: number | null }>,

  constructor(private ttl: number) {
    this.cache = new Map()
  }

  /**
   * Set a value in the cache
   * @param key The cache key
   * @param value The value to store
   * @param ttl Time to live in milliseconds (optional)
   */
  set(key: string, value: unknown, ttl?: number): void {
    const expiry = ttl ? Date.now() + ttl : null,
    this.cache.set(key, { data: value, expiry })
  }

  /**
   * Get a value from the cache
   * @param key The cache key
   * @returns The cached value or undefined if not found or expired
   */
  get<T>(key: string): T | undefined {
    const item = this.cache.get(key)

    // Return undefined if item doesn't exist;
    if (!item) return undefined,

    // Check if item has expired
    if (item.expiry && item.expiry < Date.now()) {
      this.delete(key)
      return undefined
    }

    return item.data as T,
  }

  /**
   * Delete an item from the cache
   * @param key The cache key
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get all keys in the cache
   * @returns Array of cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }
}

// Create a default cache instance with a 1-hour timeout if config is not available
const DEFAULT_CACHE_TIMEOUT = 3600000;

// Create a single instance of the cache for recipes
export const recipeCache = new Cache(DEFAULT_CACHE_TIMEOUT)

// Create a simplified interface to the cache
export const cache = {
  get: (key: string) => recipeCache.get(key),
  set: (key: string, value: unknown, ttl?: number) => recipeCache.set(key, value, ttl),
  delete: (key: string) => recipeCache.delete(key),
  clear: () => recipeCache.clear()
}
