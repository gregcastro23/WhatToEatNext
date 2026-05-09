/**
 * URL Utilities for alchm.kitchen
 */

/**
 * Returns the base URL for API routes.
 */
export const getApiBaseUrl = (): string => {
  if (typeof window === "undefined") {
    // Server-side: use absolute URL from environment variables
    return (
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
      "http://localhost:3000"
    );
  }

  // Client-side: use relative URL if backend is proxied, or absolute if explicitly set
  return process.env.NEXT_PUBLIC_BACKEND_URL || "";
};

/**
 * Helper to construct an API URL
 */
export const getApiUrl = (path: string): string => {
  const baseUrl = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  
  // If we have a baseUrl, use it. If not, return the relative path.
  return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;
};
