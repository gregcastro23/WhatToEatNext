/**
 * Data Loader Utility
 * 
 * A robust utility for loading data with error handling, data transformation, 
 * and fallback mechanisms.
 * 
 * @module dataLoader
 */

import { logger } from './logger';
import { cache } from './cache';
import { AppError, errorMessages, errorCodes } from './errorHandling';

/**
 * Interface for DataLoader configuration options
 * 
 * @template T - The type of data to be loaded
 */
export interface DataLoaderOptions<T> {
  /** 
   * Cache key for storing/retrieving data
   * If provided, data will be cached under this key
   */
  cacheKey?: string;
  
  /** 
   * Maximum age of cached data in milliseconds
   * Default: 1 hour (3600000ms)
   */
  cacheTtl?: number;
  
  /** 
   * Function to transform loaded data into the expected format
   * @param data - The raw data from the source
   * @returns The transformed data of type T
   */
  transformer?: (data: unknown) => T;
  
  /** 
   * Validation function to ensure data is correct
   * @param data - The data to validate
   * @returns Boolean indicating if the data is valid
   */
  validator?: (data: unknown) => boolean;
  
  /** 
   * Default/fallback data to use when loading fails
   * If not provided and loading fails, an error will be thrown
   */
  fallback?: T;
  
  /** 
   * Whether to throw on error or silently use fallback
   * Default: false (use fallback without throwing)
   */
  throwOnError?: boolean;
  
  /** 
   * Retry configuration for failed requests
   */
  retry?: {
    /** Number of retry attempts (default: 3) */
    attempts: number;
    /** Delay between retries in milliseconds (default: 1000ms) */
    delay: number;
  };
}

/**
 * Result of a data loading operation
 * 
 * @template T - The type of data that was loaded
 */
export interface DataLoadResult<T> {
  /** The loaded data */
  data: T;
  
  /** The source from which the data was retrieved */
  source: 'cache' | 'remote' | 'fallback';
  
  /** Whether the data was transformed */
  transformed: boolean;
  
  /** Error that occurred during loading (if any) */
  error?: Error;
}

/**
 * Generic data loader that handles loading from various sources
 * with error handling, caching, and transformation support.
 * 
 * @template T - The type of data to be loaded
 * 
 * @example
 * ```typescript
 * const userLoader = new DataLoader<User[]>({
 *   cacheKey: 'users',
 *   fallback: [],
 *   retry: { attempts: 3, delay: 1000 }
 * });
 * 
 * const result = await userLoader.loadData(async () => {
 *   const response = await fetch('/api/users');
 *   return response.json();
 * });
 * ```
 */
export class DataLoader<T> {
  private options: DataLoaderOptions<T>;

  /**
   * Creates a new data loader with the specified options
   * 
   * @param options - Configuration options for the data loader
   */
  constructor(options: DataLoaderOptions<T> = {}) {
    this.options = {
      cacheKey: undefined,
      cacheTtl: 3600000, // 1 hour default
      transformer: (data: unknown) => data as T,
      validator: () => true,
      fallback: undefined,
      throwOnError: false,
      retry: {
        attempts: 3,
        delay: 1000,
      },
      ...options,
    };
  }

  /**
   * Load data from a specified source with error handling and caching
   * 
   * This method will:
   * 1. Check the cache for data if a cacheKey is provided
   * 2. If not found in cache, attempt to load from the source
   * 3. Validate the loaded data
   * 4. Transform the data to the expected format
   * 5. Cache the result if a cacheKey is provided
   * 6. Fall back to default data if loading fails
   * 
   * @param source - Function that returns a Promise resolving to the data
   * @param options - Optional runtime options that override constructor options
   * @returns Promise resolving to the loaded data with metadata
   * @throws {AppError} If loading fails and no fallback is provided or throwOnError is true
   * 
   * @example
   * ```typescript
   * const result = await loader.loadData(async () => {
   *   const response = await fetch('/api/data');
   *   return response.json();
   * });
   * 
   * console.log(`Loaded from ${result.source}:`, result.data);
   * ```
   */
  async loadData(
    source: () => Promise<unknown>,
    options?: Partial<DataLoaderOptions<T>>
  ): Promise<DataLoadResult<T>> {
    const mergedOptions = { ...this.options, ...options };
    const {
      cacheKey,
      cacheTtl,
      transformer,
      validator,
      fallback,
      throwOnError,
      retry,
    } = mergedOptions;

    // Try cache first if a cache key is provided
    if (cacheKey) {
      try {
        const cachedData = cache.get<T>(cacheKey);
        if (cachedData !== undefined) {
          return {
            data: cachedData,
            source: 'cache',
            transformed: false,
          };
        }
      } catch (error) {
        logger.warn(`Failed to retrieve data from cache: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // Try to load from source with retries
    let lastError: Error | undefined;
    let attempts = 0;
    
    while (attempts < (retry?.attempts || 1)) {
      try {
        let data = await source();
        
        // Validate data
        if (!validator(data)) {
          throw new AppError(
            'Data validation failed',
            'VALIDATION_ERROR',
            errorCodes.VALIDATION_ERROR,
            { data }
          );
        }
        
        // Transform data
        const transformedData = transformer(data);
        
        // Cache the result if a cache key is provided
        if (cacheKey) {
          cache.set(cacheKey, transformedData, cacheTtl);
        }
        
        return {
          data: transformedData,
          source: 'remote',
          transformed: true,
        };
      } catch (error) {
        attempts++;
        lastError = error instanceof Error 
          ? error 
          : new Error(typeof error === 'string' ? error : 'Unknown error');
        
        logger.error(`Data loading error (attempt ${attempts}): ${lastError.message}`);
        
        if (attempts < (retry?.attempts || 1)) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retry?.delay || 1000));
        }
      }
    }
    
    // If we get here, all attempts failed
    if (fallback !== undefined) {
      logger.warn(`Using fallback data after ${retry?.attempts || 1} failed attempts`);
      return {
        data: fallback,
        source: 'fallback',
        transformed: false,
        error: lastError,
      };
    }
    
    // No fallback provided, handle error based on configuration
    if (throwOnError) {
      throw lastError || new AppError(
        'Failed to load data and no fallback provided',
        'DATA_ERROR',
        errorCodes.DATA_ERROR
      );
    }
    
    throw new AppError(
      'Failed to load data and no fallback provided',
      'DATA_ERROR',
      errorCodes.DATA_ERROR
    );
  }

  /**
   * Transform data using the configured transformer
   * 
   * @param data - The data to transform
   * @returns The transformed data of type T
   */
  transform(data: unknown): T {
    return this.options.transformer ? this.options.transformer(data) : data as T;
  }

  /**
   * Validate data using the configured validator
   * 
   * @param data - The data to validate
   * @returns Boolean indicating if the data is valid
   */
  validate(data: unknown): boolean {
    return this.options.validator ? this.options.validator(data) : true;
  }
}

/**
 * Utility functions for transforming data
 */
export const dataTransformers = {
  /**
   * Convert array to record by key
   * 
   * @template T - The type of items in the array
   * @param arr - The array to convert
   * @param keyFn - Function that extracts a key from each item
   * @returns Record mapping keys to items
   * 
   * @example
   * ```typescript
   * const users = [
   *   { id: 'u1', name: 'Alice' },
   *   { id: 'u2', name: 'Bob' }
   * ];
   * 
   * const userById = dataTransformers.arrayToRecord(users, user => user.id);
   * // Result: { u1: { id: 'u1', name: 'Alice' }, u2: { id: 'u2', name: 'Bob' } }
   * ```
   */
  arrayToRecord<T>(arr: T[], keyFn: (item: T) => string): Record<string, T> {
    return arr.reduce((acc, item) => {
      acc[keyFn(item)] = item;
      return acc;
    }, {} as Record<string, T>);
  },

  /**
   * Normalize strings (lowercase, trim)
   * 
   * @param value - The value to normalize
   * @returns Normalized string (trimmed and lowercased)
   * 
   * @example
   * ```typescript
   * dataTransformers.normalizeString('  Hello World  '); // 'hello world'
   * dataTransformers.normalizeString(null); // ''
   * dataTransformers.normalizeString(123); // '123'
   * ```
   */
  normalizeString(value: unknown): string {
    if (typeof value === 'string') {
      return value.trim().toLowerCase();
    }
    
    if (value === null || value === undefined) {
      return '';
    }
    
    return String(value).trim().toLowerCase();
  },

  /**
   * Normalize to number with fallback
   * 
   * @param value - The value to normalize
   * @param fallback - The fallback value to use if parsing fails (default: 0)
   * @returns Normalized number or fallback value
   * 
   * @example
   * ```typescript
   * dataTransformers.normalizeNumber('42'); // 42
   * dataTransformers.normalizeNumber('abc'); // 0
   * dataTransformers.normalizeNumber('abc', 10); // 10
   * ```
   */
  normalizeNumber(value: unknown, fallback = 0): number {
    if (typeof value === 'number' && !isNaN(value)) {
      return value;
    }
    
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? fallback : parsed;
    }
    
    return fallback;
  },

  /**
   * Normalize boolean values
   * 
   * @param value - The value to normalize
   * @returns Normalized boolean value
   * 
   * @example
   * ```typescript
   * dataTransformers.normalizeBoolean(true); // true
   * dataTransformers.normalizeBoolean('true'); // true
   * dataTransformers.normalizeBoolean('yes'); // true
   * dataTransformers.normalizeBoolean('1'); // true
   * dataTransformers.normalizeBoolean('false'); // false
   * dataTransformers.normalizeBoolean(0); // false
   * ```
   */
  normalizeBoolean(value: unknown): boolean {
    if (typeof value === 'boolean') {
      return value;
    }
    
    if (typeof value === 'string') {
      const lowered = value.toLowerCase();
      return lowered === 'true' || lowered === 'yes' || lowered === '1';
    }
    
    if (typeof value === 'number') {
      return value === 1;
    }
    
    return false;
  },

  /**
   * Deep clone an object to avoid reference issues
   * 
   * @template T - The type of object to clone
   * @param obj - The object to clone
   * @returns Deep copy of the object
   * 
   * @example
   * ```typescript
   * const original = { a: 1, b: { c: 2 } };
   * const clone = dataTransformers.deepClone(original);
   * clone.b.c = 3; // Doesn't affect original
   * ```
   */
  deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  },

  /**
   * Filter out null/undefined values from an object
   * 
   * @template T - The type of object to filter
   * @param obj - The object with potential nullish values
   * @returns Object with null/undefined values removed
   * 
   * @example
   * ```typescript
   * const obj = { a: 1, b: null, c: undefined, d: 0 };
   * dataTransformers.removeNullish(obj); // { a: 1, d: 0 }
   * ```
   */
  removeNullish<T extends Record<string, unknown>>(obj: T): Partial<T> {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined) {
        acc[key as keyof T] = value as T[keyof T];
      }
      return acc;
    }, {} as Partial<T>);
  },

  /**
   * Apply default values to missing object properties
   * 
   * @template T - The type of object to apply defaults to
   * @param obj - The partial object to fill in
   * @param defaults - The default values to use
   * @returns Object with defaults applied
   * 
   * @example
   * ```typescript
   * const partial = { name: 'Test' };
   * const defaults = { name: 'Default', age: 30, active: true };
   * dataTransformers.applyDefaults(partial, defaults);
   * // Result: { name: 'Test', age: 30, active: true }
   * ```
   */
  applyDefaults<T extends Record<string, unknown>>(
    obj: Partial<T>,
    defaults: T
  ): T {
    return {
      ...defaults,
      ...dataTransformers.removeNullish(obj),
    };
  }
};

/**
 * Create a standard loader for a specific data type
 * 
 * @template T - The type of data to be loaded
 * @param options - Configuration options for the data loader
 * @returns A new DataLoader instance
 * 
 * @example
 * ```typescript
 * const recipeLoader = createDataLoader<Recipe[]>({
 *   cacheKey: 'recipes',
 *   fallback: []
 * });
 * ```
 */
export function createDataLoader<T>(options: DataLoaderOptions<T> = {}): DataLoader<T> {
  return new DataLoader<T>(options);
}

/**
 * Helper to load JSON data with proper typing and error handling
 * 
 * @template T - The expected type of the JSON data
 * @param fetchFn - Function that returns a Promise resolving to a Response
 * @param options - Configuration options for the data loader
 * @returns Promise resolving to the loaded JSON data with metadata
 * 
 * @example
 * ```typescript
 * const result = await loadJsonData<User[]>(
 *   () => fetch('/api/users'),
 *   { cacheKey: 'users', fallback: [] }
 * );
 * ```
 */
export async function loadJsonData<T>(
  fetchFn: () => Promise<Response>,
  options: DataLoaderOptions<T> = {}
): Promise<DataLoadResult<T>> {
  const loader = new DataLoader<T>(options);
  
  return loader.loadData(async () => {
    const response = await fetchFn();
    
    if (!response.ok) {
      throw new AppError(
        `Failed to fetch data: ${response.statusText}`,
        'API_ERROR',
        response.status,
        { status: response.status }
      );
    }
    
    return response.json();
  }, options);
} 