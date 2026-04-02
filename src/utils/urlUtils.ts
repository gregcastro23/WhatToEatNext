/**
 * URL Utilities for Hybrid Edge Deployment (Vercel + Cloudflare)
 */

/**
 * Returns the base URL for Edge-optimized routes.
 * Prioritizes the Cloudflare Worker URL if configured, otherwise falls back to 
 * the standard backend URL or the current domain.
 */
export const getEdgeWorkerBaseUrl = (): string => {
  // Check for the supplemental Cloudflare Worker URL first
  const workerUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL;
  if (workerUrl) {
    // Remove trailing slash if present
    return workerUrl.replace(/\/$/, "");
  }

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
 * Helper to construct an Edge API URL
 */
export const getEdgeApiUrl = (path: string): string => {
  const baseUrl = getEdgeWorkerBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  
  // If we have a baseUrl, use it. If not, return the relative path.
  return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;
};
