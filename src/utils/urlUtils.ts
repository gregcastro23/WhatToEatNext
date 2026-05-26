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

/**
 * Returns the absolute base URL of *this* Next.js app for server-side
 * self-fetches (Node `fetch` rejects relative paths). Prefer the
 * production alias over the deployment URL — Vercel's deployment URL
 * is gated by Deployment Protection and returns 401 to internal
 * fetches that do not carry the bypass header. The production alias
 * (e.g. `alchm.kitchen`) is not gated.
 *
 * Resolution order:
 *   1. NEXT_PUBLIC_SITE_URL / SITE_URL   — explicit override
 *   2. VERCEL_PROJECT_PRODUCTION_URL     — Vercel-managed production alias
 *   3. VERCEL_URL                        — deployment URL (last resort,
 *                                          may be Deployment-Protection-gated)
 *   4. http://localhost:${PORT||3000}    — local dev
 *
 * Browser callers should keep using relative `/api/...` paths instead.
 */
export const getSelfBaseUrl = (): string => {
  const explicit =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/+$/, "");
  }

  const productionAlias = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (productionAlias) {
    return `https://${productionAlias.replace(/^https?:\/\//, "")}`;
  }

  const deploymentUrl = process.env.VERCEL_URL?.trim();
  if (deploymentUrl) {
    return `https://${deploymentUrl.replace(/^https?:\/\//, "")}`;
  }

  const port = process.env.PORT || "3000";
  return `http://localhost:${port}`;
};
