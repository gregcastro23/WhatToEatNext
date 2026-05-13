/**
 * URL Utilities for alchm.kitchen
 */

import { ASSET_DOMAIN } from "@/constants";

/**
 * Construct an asset URL (R2 bucket objects)
 */
export const getAssetUrl = (path: string | null | undefined): string | undefined => {
  if (!path) return undefined;
  
  // If it's already an absolute URL, return it
  if (path.startsWith("http")) return path;
  
  // If it's a relative path starting with common asset folders, prefix with ASSET_DOMAIN
  if (path.startsWith("ingredients/") || path.startsWith("recipes/") || path.startsWith("images/")) {
    return `${ASSET_DOMAIN}/${path}`;
  }
  
  return path;
};

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
