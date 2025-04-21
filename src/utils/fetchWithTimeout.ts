/**
 * Enhanced fetch utility with built-in timeout and TypeScript types
 */

/**
 * Options for the fetch request with timeout
 */
export interface FetchWithTimeoutOptions extends RequestInit {
  /**
   * Timeout in milliseconds
   * @default 10000 (10 seconds)
   */
  timeout?: number;
}

/**
 * Error thrown when a fetch request times out
 */
export class FetchTimeoutError extends Error {
  /**
   * The URL that timed out
   */
  public readonly url: string;
  
  /**
   * The timeout duration in milliseconds
   */
  public readonly timeout: number;

  constructor(url: string, timeout: number) {
    super(`Fetch request to ${url} timed out after ${timeout}ms`);
    this.name = 'FetchTimeoutError';
    this.url = url;
    this.timeout = timeout;
  }
}

/**
 * Wrapper around fetch that adds timeout functionality
 * 
 * @param url - The URL to fetch
 * @param options - Options for the fetch request and timeout
 * @returns Promise resolving to fetch Response
 * @throws FetchTimeoutError if the request times out
 * 
 * @example
 * ```typescript
 * try {
 *   const response = await fetchWithTimeout('https://api.example.com/data', { 
 *     timeout: 5000,
 *     headers: { 'Content-Type': 'application/json' }
 *   });
 *   const data = await response.json();
 * } catch (error) {
 *   if (error instanceof FetchTimeoutError) {
 *     console.error(`Request timed out: ${error.message}`);
 *   } else {
 *     console.error(`Request failed: ${error}`);
 *   }
 * }
 * ```
 */
export async function fetchWithTimeout(
  url: string, 
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const { timeout = 10000, ...fetchOptions } = options;
  
  const controller = new AbortController();
  const { signal } = controller;
  
  // Create a timeout promise that rejects after specified time
  const timeoutPromise = new Promise<never>((_, reject) => {
    const timeoutId = setTimeout(() => {
      controller.abort();
      reject(new FetchTimeoutError(url, timeout));
    }, timeout);
    
    // If the signal is aborted elsewhere, clear the timeout
    if (signal) {
      signal.addEventListener('abort', () => clearTimeout(timeoutId));
    }
  });
  
  // Race between the fetch and the timeout
  return Promise.race([
    fetch(url, {
      ...fetchOptions,
      signal: signal as AbortSignal
    }),
    timeoutPromise
  ]);
}

/**
 * Wrapper around fetchWithTimeout that parses JSON response
 * 
 * @template T - The expected response data type
 * @param url - The URL to fetch
 * @param options - Options for the fetch request and timeout
 * @returns Promise resolving to the parsed JSON data of type T
 * @throws FetchTimeoutError if the request times out
 * 
 * @example
 * ```typescript
 * interface User {
 *   id: number;
 *   name: string;
 * }
 * 
 * const users = await fetchJsonWithTimeout<User[]>('https://api.example.com/users', {
 *   timeout: 5000
 * });
 * ```
 */
export async function fetchJsonWithTimeout<T>(
  url: string,
  options: FetchWithTimeoutOptions = {}
): Promise<T> {
  const response = await fetchWithTimeout(url, options);
  
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
  }
  
  return response.json() as Promise<T>;
} 