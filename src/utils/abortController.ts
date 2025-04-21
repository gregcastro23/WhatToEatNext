/**
 * Enhanced AbortController utility with TypeScript support
 * This provides a standard way to manage AbortController instances
 * across the application with proper typing and timeout functionality.
 */

/**
 * Options for creating an abortable operation
 */
export interface AbortableOptions {
  /**
   * Timeout in milliseconds after which the operation will be aborted
   * @default undefined (no timeout)
   */
  timeout?: number;
  
  /**
   * Optional signal from a parent AbortController to allow
   * propagation of abort signals
   */
  signal?: AbortSignal;
  
  /**
   * Optional callback to run when the operation is aborted
   */
  onAbort?: (reason?: unknown) => void;
}

/**
 * Result of creating an abortable operation
 */
export interface AbortableOperation {
  /**
   * The AbortController instance
   */
  controller: AbortController;
  
  /**
   * The AbortSignal to pass to fetch or other APIs
   */
  signal: AbortSignal;
  
  /**
   * Function to abort the operation with an optional reason
   */
  abort: (reason?: unknown) => void;
  
  /**
   * Optional timeout ID if a timeout was set
   */
  timeoutId?: number;
  
  /**
   * Function to clean up resources (clear timeout)
   */
  cleanup: () => void;
}

/**
 * Creates an abortable operation with optional timeout
 * 
 * @param options - Options for the abortable operation
 * @returns An object with the controller, signal, and abort function
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const { signal, abort, cleanup } = createAbortable();
 * 
 * try {
 *   const response = await fetch(url, { signal });
 *   const data = await response.json();
 * } catch (error) {
 *   // Handle error
 * } finally {
 *   cleanup();
 * }
 * 
 * // With timeout
 * const { signal } = createAbortable({ timeout: 5000 });
 * 
 * // With parent signal
 * const parent = new AbortController();
 * const { signal: childSignal } = createAbortable({ signal: parent.signal });
 * 
 * // Clean up in useEffect
 * useEffect(() => {
 *   const { signal, cleanup } = createAbortable({ timeout: 10000 });
 *   
 *   const fetchData = async () => {
 *     const response = await fetch(url, { signal });
 *     // Process response
 *   };
 *   
 *   fetchData();
 *   
 *   return cleanup; // Will be called on component unmount
 * }, []);
 * ```
 */
export function createAbortable(options: AbortableOptions = {}): AbortableOperation {
  const { timeout, signal: parentSignal, onAbort } = options;
  
  const controller = new AbortController();
  const { signal } = controller;
  
  // Set up parent signal listener if provided
  if (parentSignal) {
    if (parentSignal.aborted) {
      // If the parent signal is already aborted, abort immediately
      controller.abort(parentSignal.reason);
    } else {
      // Otherwise listen for abort events from the parent
      const abortListener = () => {
        controller.abort(parentSignal.reason);
      };
      
      parentSignal.addEventListener('abort', abortListener);
      
      // Add event listener for local signal to clean up parent listener
      signal.addEventListener('abort', () => {
        parentSignal.removeEventListener('abort', abortListener);
      });
    }
  }
  
  // Set up onAbort callback if provided
  if (onAbort) {
    signal.addEventListener('abort', () => {
      onAbort(signal.reason);
    });
  }
  
  // Set up timeout if provided
  let timeoutId: number | undefined;
  if (timeout !== undefined && timeout > 0) {
    timeoutId = window.setTimeout(() => {
      controller.abort(new Error(`Operation timed out after ${timeout}ms`));
    }, timeout);
    
    // Clear timeout if aborted through other means
    signal.addEventListener('abort', () => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    });
  }
  
  return {
    controller,
    signal,
    abort: (reason?: unknown) => controller.abort(reason),
    timeoutId,
    cleanup: () => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    }
  };
}

/**
 * Wrapper around fetch that uses the abortable utility
 * 
 * @param input - URL or Request object
 * @param init - Fetch options
 * @param abortableOptions - Options for the abortable operation
 * @returns Promise with fetch response and cleanup function
 * 
 * @example
 * ```typescript
 * const { response, cleanup } = await abortableFetch('https://api.example.com/data', 
 *   { headers: { 'Content-Type': 'application/json' } },
 *   { timeout: 5000 }
 * );
 * 
 * try {
 *   if (response.ok) {
 *     const data = await response.json();
 *     // Use data
 *   }
 * } finally {
 *   cleanup();
 * }
 * ```
 */
export async function abortableFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
  abortableOptions: AbortableOptions = {}
): Promise<{ response: Response; cleanup: () => void }> {
  const { signal, cleanup } = createAbortable(abortableOptions);
  
  const response = await fetch(input, {
    ...init,
    signal
  });
  
  return { response, cleanup };
} 