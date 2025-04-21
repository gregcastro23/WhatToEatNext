/**
 * General utility functions for the application
 */
export class Utils {
  /**
   * Generates a deterministic ID based on a string input
   * This ensures the same input always produces the same ID
   * 
   * @param input The input string to generate an ID from
   * @returns A deterministic string ID
   */
  static generateDeterministicId(input: string): string {
    if (!input) return `id-${Date.now()}`;
    
    // Simple hash function for deterministic IDs
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    
    // Convert to hex string and ensure positive
    const hashStr = Math.abs(hash).toString(16);
    
    // Create an ID with a prefix based on the input's first chars
    const prefix = input.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 5);
    return `${prefix}-${hashStr}`;
  }
  
  /**
   * Creates a slug from a string by removing special characters,
   * converting to lowercase, and replacing spaces with hyphens
   * 
   * @param str String to convert to a slug
   * @returns Slugified string
   */
  static slugify(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  /**
   * Deep clones an object
   * 
   * @param obj The object to clone
   * @returns A deep clone of the object
   */
  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (e) {
      console.error('Failed to deep clone object:', e);
      // Fallback for objects that can't be JSON serialized
      return Object.assign({}, obj) as T;
    }
  }
  
  /**
   * Safely get a nested property from an object without throwing
   * errors when intermediate properties don't exist
   * 
   * @param obj The object to get the property from
   * @param path The property path (e.g., 'user.profile.name')
   * @param defaultValue Value to return if the property doesn't exist
   * @returns The property value or the default value
   */
  static safeGet<T>(obj: any, path: string, defaultValue: T): T {
    if (!obj || !path) return defaultValue;
    
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return defaultValue;
      }
      current = current[key];
    }
    
    return current === undefined ? defaultValue : current;
  }
  
  /**
   * Formats a number with commas as thousands separators
   * 
   * @param num The number to format
   * @returns Formatted number string
   */
  static formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  
  /**
   * Checks if a value is nullish (null or undefined)
   * 
   * @param value The value to check
   * @returns True if the value is null or undefined
   */
  static isNullish(value: unknown): value is null | undefined {
    return value === null || value === undefined;
  }
  
  /**
   * Truncates a string to a specified length and adds an ellipsis
   * 
   * @param str The string to truncate
   * @param maxLength Maximum length before truncating
   * @returns The truncated string
   */
  static truncate(str: string, maxLength: number): string {
    if (!str || str.length <= maxLength) return str;
    return `${str.substring(0, maxLength)}...`;
  }
} 