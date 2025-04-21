/**
 * API Response Handler
 * 
 * This utility provides standardized response handling for API calls with proper TypeScript typing.
 */

import { AppError } from '../types/errors';
import { fetchWithTimeout, FetchTimeoutError, FetchWithTimeoutOptions } from './fetchWithTimeout';

/**
 * Base response shape for all API calls
 */
export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  statusCode: number;
  success: boolean;
}

/**
 * API request options
 */
export interface ApiRequestOptions extends FetchWithTimeoutOptions {
  /**
   * Optional error message override
   */
  errorMessage?: string;
  
  /**
   * Validate that the response contains expected fields
   */
  validator?: (data: unknown) => boolean;
  
  /**
   * Transform the response data
   */
  transform?: <R, S>(data: R) => S;
}

/**
 * Generic typed API request function
 * 
 * @template T - The expected response data type
 * @param url - The URL to fetch
 * @param options - Request options
 * @returns Promise resolving to a standardized ApiResponse object
 * 
 * @example
 * ```typescript
 * interface PlanetaryData {
 *   sun: { sign: string; degree: number };
 *   moon: { sign: string; degree: number };
 * }
 * 
 * const response = await apiRequest<PlanetaryData>('https://api.astronomy.com/positions', {
 *   timeout: 5000,
 *   validator: (data) => {
 *     return data && typeof data === 'object' && 'sun' in data && 'moon' in data;
 *   }
 * });
 * 
 * if (response.success && response.data) {
 *   // Type-safe access to data
 *   console.log(response.data.sun.sign);
 * }
 * ```
 */
export async function apiRequest<T>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const { 
    timeout = 10000, 
    errorMessage = 'API request failed',
    validator,
    transform,
    ...fetchOptions 
  } = options;
  
  try {
    // Make the request with timeout
    const response = await fetchWithTimeout(url, {
      ...fetchOptions,
      timeout
    });
    
    // Return early if unsuccessful
    if (!response.ok) {
      return {
        data: null,
        error: new Error(`${errorMessage}: ${response.status} ${response.statusText}`),
        statusCode: response.status,
        success: false
      };
    }
    
    // Parse the response
    let data: unknown;
    try {
      data = await response.json();
    } catch (error) {
      return {
        data: null,
        error: new Error('Invalid JSON response'),
        statusCode: 200, // Response was OK but JSON parsing failed
        success: false
      };
    }
    
    // Validate the data if a validator was provided
    if (validator && !validator(data)) {
      return {
        data: null,
        error: new Error('Response validation failed'),
        statusCode: 200, // Response was OK but validation failed
        success: false
      };
    }
    
    // Transform the data if a transformer was provided
    const finalData = transform ? transform(data) : (data as T);
    
    return {
      data: finalData as T,
      error: null,
      statusCode: response.status,
      success: true
    };
  } catch (error) {
    // Handle timeout errors specifically
    if (error instanceof FetchTimeoutError) {
      return {
        data: null,
        error: new Error(`Request timed out after ${timeout}ms`),
        statusCode: 408, // Request Timeout
        success: false
      };
    }
    
    // Handle other errors
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
      statusCode: 500,
      success: false
    };
  }
}

/**
 * Type guard to check if an API response was successful
 * 
 * @template T - The expected response data type
 * @param response - The API response to check
 * @returns True if the response was successful and has data
 * 
 * @example
 * ```typescript
 * const response = await apiRequest<UserData>('/api/users/1');
 * 
 * if (isSuccessResponse(response)) {
 *   // response.data is now typed as UserData (non-null)
 *   console.log(response.data.name);
 * } else {
 *   // Handle error case
 *   console.error(response.error?.message);
 * }
 * ```
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { data: T; error: null } {
  return response.success === true && response.data !== null;
}

/**
 * Helper function to process API errors consistently
 * 
 * @param error - The error to process
 * @param defaultMessage - Default message to use if error is not an Error instance
 * @returns Standardized AppError
 */
export function processApiError(error: unknown, defaultMessage = 'API request failed'): AppError {
  if (error instanceof AppError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new AppError(error.message, { cause: error });
  }
  
  return new AppError(defaultMessage, { cause: error });
} 