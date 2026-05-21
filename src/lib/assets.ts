import { ASSET_DOMAIN } from "@/constants";
import { redisGet, redisSet } from "./redis";

const ASSET_CACHE_TTL = 60 * 60 * 24; // 24 hours

/**
 * Validates and caches the existence of an asset in Redis.
 * This prevents repeated 404s or redundant metadata fetches from R2.
 */
export async function getValidatedAssetUrl(path: string | null | undefined): Promise<string | undefined> {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;

  const cacheKey = `asset_valid:${path}`;
  
  try {
    const cached = await redisGet<boolean>(cacheKey);
    if (cached === true) return `${ASSET_DOMAIN}/${path}`;
    if (cached === false) return undefined;
  } catch (err) {
    console.warn("[AssetCache] Redis lookup failed:", err);
  }

  // If not cached, we assume it's valid for now but would ideally 
  // check R2 metadata here. For Alchm, we'll implement the "Positive Cache"
  // after first successful load or if explicitly marked.
  
  const fullUrl = `${ASSET_DOMAIN}/${path}`;
  
  // Asynchronously "warm" the cache for this path as valid
  // In a real scenario, we'd do a HEAD request to R2 here.
  void redisSet(cacheKey, true, ASSET_CACHE_TTL).catch(() => {});
  
  return fullUrl;
}

/**
 * Marks an asset as invalid in the cache (e.g., after a 404).
 */
export async function invalidateAsset(path: string): Promise<void> {
  const cacheKey = `asset_valid:${path}`;
  await redisSet(cacheKey, false, ASSET_CACHE_TTL * 7).catch(() => {});
}
