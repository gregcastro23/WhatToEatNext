import {
  getCreatorsCredentials,
  isCreatorsConfigured as configIsCreatorsConfigured,
} from "@/lib/amazon/config";

const AMAZON_CREATORS_TOKEN_URL = "https://api.amazon.com/auth/o2/token";
const AMAZON_CREATORS_CATALOG_BASE_URL = "https://creatorsapi.amazon/catalog/v1";
const AMAZON_CREATORS_MARKETPLACE = "www.amazon.com";
const AMAZON_CREATORS_DEFAULT_SEARCH_INDEX = "Grocery";
const AMAZON_CREATORS_DEFAULT_ITEM_COUNT = 1;
const AMAZON_TOKEN_SAFETY_WINDOW_MS = 60_000;

interface AmazonCreatorsTokenCache {
  accessToken: string;
  expiresAt: number;
}

interface AmazonCreatorsTokenResponse {
  access_token?: string;
  expires_in?: number;
}

interface AmazonCreatorsSearchItem {
  asin?: string;
  detailPageUrl?: string;
  itemInfo?: {
    title?: {
      displayValue?: string;
      DisplayValue?: string;
    };
  };
  ItemInfo?: {
    Title?: {
      DisplayValue?: string;
    };
  };
  title?: string;
}

interface AmazonCreatorsSearchResponse {
  items?: AmazonCreatorsSearchItem[];
  searchResult?: {
    items?: AmazonCreatorsSearchItem[];
  };
  data?: {
    items?: AmazonCreatorsSearchItem[];
  };
  errors?: Array<{
    code?: string;
    message?: string;
  }>;
  message?: string;
}

interface AmazonCreatorsSearchPayload {
  keywords: string;
  partnerTag: string;
  partnerType: "Associates";
  itemCount: number;
  searchIndex: string;
  marketplace?: string;
  resources?: string[];
}

declare global {
  var amazonCreatorsTokenCache: AmazonCreatorsTokenCache | undefined;
}

function getAmazonCreatorsCredentials() {
  const creds = getCreatorsCredentials();
  return {
    clientId: creds?.clientId,
    clientSecret: creds?.clientSecret,
    version: creds?.version,
    partnerTag: creds?.partnerTag,
  };
}

export function hasAmazonCreatorsCredentials(): boolean {
  return configIsCreatorsConfigured();
}

/**
 * Surface Creators API errors with a status code so callers can distinguish
 * throttling (429) and eligibility (403) from "no result."
 */
export class CreatorsApiError extends Error {
  status: number;
  payload: unknown;
  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "CreatorsApiError";
    this.status = status;
    this.payload = payload;
  }
}

function getCachedToken(): string | null {
  const cache = globalThis.amazonCreatorsTokenCache;
  if (!cache) return null;
  if (Date.now() >= cache.expiresAt - AMAZON_TOKEN_SAFETY_WINDOW_MS) return null;
  return cache.accessToken;
}

function setCachedToken(accessToken: string, expiresInSeconds: number) {
  globalThis.amazonCreatorsTokenCache = {
    accessToken,
    expiresAt: Date.now() + expiresInSeconds * 1000,
  };
}

async function readErrorPayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    return await response.text();
  } catch {
    return null;
  }
}

function buildAmazonCreatorsError(status: number, payload: unknown): CreatorsApiError {
  const message =
    typeof payload === "string"
      ? payload
      : typeof payload === "object" && payload !== null && "message" in payload
        ? String(payload.message)
        : `Amazon Creators API request failed with status ${status}`;

  return new CreatorsApiError(message, status, payload);
}

async function getAmazonCreatorsAccessToken(): Promise<string> {
  const cachedToken = getCachedToken();
  if (cachedToken) return cachedToken;

  const { clientId, clientSecret } = getAmazonCreatorsCredentials();
  if (!clientId || !clientSecret) {
    throw new Error("Missing Amazon Creators API credentials");
  }

  const tokenResponse = await fetch(AMAZON_CREATORS_TOKEN_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
    cache: "no-store",
  });

  if (!tokenResponse.ok) {
    throw buildAmazonCreatorsError(
      tokenResponse.status,
      await readErrorPayload(tokenResponse),
    );
  }

  const tokenPayload = (await tokenResponse.json()) as AmazonCreatorsTokenResponse;
  const accessToken = tokenPayload.access_token;
  const expiresIn = tokenPayload.expires_in ?? 3600;

  if (!accessToken) {
    throw new Error("Amazon Creators API token response did not include an access token");
  }

  setCachedToken(accessToken, expiresIn);
  return accessToken;
}

function buildSearchPayload(keywords: string): AmazonCreatorsSearchPayload {
  const { partnerTag } = getAmazonCreatorsCredentials();
  if (!partnerTag) {
    throw new Error("Missing Amazon partner tag");
  }

  return {
    keywords,
    partnerTag,
    partnerType: "Associates",
    itemCount: AMAZON_CREATORS_DEFAULT_ITEM_COUNT,
    searchIndex: AMAZON_CREATORS_DEFAULT_SEARCH_INDEX,
    marketplace: AMAZON_CREATORS_MARKETPLACE,
    resources: [
      "itemInfo.title",
      "images.primary.large"
    ],
  };
}

function extractItems(payload: AmazonCreatorsSearchResponse): AmazonCreatorsSearchItem[] {
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.searchResult?.items)) return payload.searchResult.items;
  if (Array.isArray(payload.data?.items)) return payload.data.items;
  return [];
}

export async function searchAmazonCreatorsCatalog(keywords: string): Promise<{
  asin: string | null;
  detailPageUrl: string | null;
  title?: string;
}> {
  const { version } = getAmazonCreatorsCredentials();
  if (!version) {
    throw new Error("Missing Amazon Creators API version");
  }

  const accessToken = await getAmazonCreatorsAccessToken();
  const response = await fetch(`${AMAZON_CREATORS_CATALOG_BASE_URL}/searchItems`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}, Version ${version}`,
      "content-type": "application/json",
      "x-marketplace": AMAZON_CREATORS_MARKETPLACE,
    },
    body: JSON.stringify(buildSearchPayload(keywords)),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorPayload = await readErrorPayload(response);
    
    // Specifically handle the 10 sales eligibility error (403 Forbidden)
    if (response.status === 403) {
      throw buildAmazonCreatorsError(403, errorPayload);
    }
    
    throw buildAmazonCreatorsError(response.status, errorPayload);
  }

  const payload = (await response.json()) as AmazonCreatorsSearchResponse;
  if (payload.errors?.length) {
    const isEligibilityError = payload.errors.some(
      (e) => e.code === "AssociateNotEligible" || e.code === "403"
    );
    throw buildAmazonCreatorsError(isEligibilityError ? 403 : 502, payload);
  }

  const [firstItem] = extractItems(payload);
  const title =
    firstItem?.title ??
    firstItem?.itemInfo?.title?.displayValue ??
    firstItem?.itemInfo?.title?.DisplayValue ??
    firstItem?.ItemInfo?.Title?.DisplayValue;

  return {
    asin: firstItem?.asin ?? null,
    detailPageUrl: firstItem?.detailPageUrl ?? null,
    title,
  };
}
