// src/utils/apiUtils.ts

import { createLogger } from "@/utils/logger";

const logger = createLogger("ApiUtils");

/**
 * Retries a promise-returning function with a timeout.
 * @param fn The function to retry.
 * @param retries The maximum number of retries.
 * @param timeout The timeout in milliseconds for each attempt.
 * @param delay The delay in milliseconds between retries.
 * @returns The result of the function if successful.
 * @throws An error if all retries fail or if a timeout occurs.
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
    try {
      // Create a promise that rejects in <timeout> milliseconds
      const timeoutPromise = new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Timeout after ${timeout}ms`)),
          timeout,
        ),
      );

      // Race the function call against the timeout
      const result = await Promise.race([fn(), timeoutPromise]);
      return result;
    } catch (error) {
      logger.warn(
        `Attempt ${attempt} failed with error: ${error instanceof Error ? error.message : String(error)}`,
      );
      if (attempt <= retries) {
        logger.info(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error; // All retries failed
      }
    }
  }
  // This line should ideally not be reached, but for type safety
  throw new Error("Maximum retries exceeded");
}
