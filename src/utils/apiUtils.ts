// src/utils/apiUtils.ts

import { createLogger } from "@/utils/logger";

const logger = createLogger("ApiUtils");

interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  backoff?: number;
}

/**
 * Enhanced fetch with timeout and exponential backoff retry logic.
 */
export async function fetchWithRetry(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { 
    timeout = 15000, 
    retries = 2, 
    backoff = 1000, 
    ...fetchOptions 
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      if (attempt > 0) {
        const delay = backoff * Math.pow(2, attempt - 1);
        logger.info(`Retry attempt ${attempt} for ${url} after ${delay}ms delay...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(id);

      // Retry on 5xx errors
      if (response.status >= 500 && attempt < retries) {
        logger.warn(`Server error ${response.status} for ${url}, retrying...`);
        continue;
      }

      return response;
    } catch (err) {
      clearTimeout(id);
      lastError = err instanceof Error ? err : new Error(String(err));

      const isTimeout = lastError.name === 'AbortError';
      const isNetworkError = lastError.message.includes('NetworkError') || lastError.message.includes('Failed to fetch');

      if ((isTimeout || isNetworkError) && attempt < retries) {
        logger.warn(`${isTimeout ? 'Timeout' : 'Network error'} on attempt ${attempt + 1} for ${url}: ${lastError.message}`);
        continue;
      }

      throw lastError;
    }
  }

  throw lastError || new Error(`Failed to fetch ${url} after ${retries} retries`);
}

/**
 * Retries a promise-returning function with a timeout.
 */
export async function retryWithTimeout<T>(
  fn: () => Promise<T>,
  retries: number,
  timeout: number,
  delay: number = 0,
): Promise<T> {
  let attempt = 0;
  while (attempt <= retries) {
    attempt++;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const result = await fn();
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      logger.warn(
        `Attempt ${attempt} failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      if (attempt <= retries) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error("Maximum retries exceeded");
}
