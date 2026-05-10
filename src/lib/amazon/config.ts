/**
 * Single source of truth for Amazon Associates / PA-API / Creators API config.
 *
 * Every Amazon-touching module must import from here — no per-file hardcoded
 * tag fallbacks. If the production tag is missing the fallback is used so that
 * build-time static analysis (Next.js "Collecting page data") doesn't throw;
 * runtime handlers validate credentials as needed.
 */

const FALLBACK_TAG = "cookingwi03f1-20";

const TAG_ENV =
  process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG ||
  process.env.AMAZON_PARTNER_TAG ||
  null;

export const AMAZON_CONFIG = {
  tag: TAG_ENV ?? FALLBACK_TAG,
  isProduction: process.env.NODE_ENV === "production",
} as const;

export const AMAZON_ASSOCIATE_TAG = AMAZON_CONFIG.tag;

export interface PaapiCredentials {
  accessKey: string;
  secretKey: string;
  partnerTag: string;
  marketplace: string;
  region: string;
  host: string;
}

export function getPaapiCredentials(): PaapiCredentials | null {
  const accessKey = process.env.AMAZON_PAAPI_ACCESS_KEY;
  const secretKey = process.env.AMAZON_PAAPI_SECRET_KEY;
  const partnerTag = process.env.AMAZON_PAAPI_PARTNER_TAG || AMAZON_CONFIG.tag;
  if (!accessKey || !secretKey || !partnerTag) return null;

  return {
    accessKey,
    secretKey,
    partnerTag,
    marketplace: process.env.AMAZON_PAAPI_MARKETPLACE || "www.amazon.com",
    region: process.env.AMAZON_PAAPI_REGION || "us-east-1",
    host: process.env.AMAZON_PAAPI_HOST || "webservices.amazon.com",
  };
}

export interface CreatorsCredentials {
  clientId: string;
  clientSecret: string;
  version: string;
  partnerTag: string;
}

export function getCreatorsCredentials(): CreatorsCredentials | null {
  const clientId = process.env.AMAZON_CREATOR_ID;
  const clientSecret = process.env.AMAZON_CREATOR_SECRET;
  const version = process.env.AMAZON_CREATOR_VERSION;
  const partnerTag = AMAZON_CONFIG.tag;
  if (!clientId || !clientSecret || !version || !partnerTag) return null;

  return { clientId, clientSecret, version, partnerTag };
}

export function isPaapiConfigured(): boolean {
  return getPaapiCredentials() !== null;
}

export function isCreatorsConfigured(): boolean {
  return getCreatorsCredentials() !== null;
}
