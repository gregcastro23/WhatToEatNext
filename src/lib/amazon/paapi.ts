/**
 * Minimal Amazon Product Advertising API v5 client.
 *
 * Implements the AWS SigV4 request signing required by PA-API directly
 * with node:crypto, so we avoid pulling in the heavyweight aws-sdk for
 * a single endpoint. SearchItems is the only operation we need today.
 *
 * Required env vars:
 *   AMAZON_PAAPI_ACCESS_KEY  — IAM access key issued by Amazon Associates
 *   AMAZON_PAAPI_SECRET_KEY  — paired secret
 *   AMAZON_PAAPI_PARTNER_TAG — Associates tracking tag (e.g. "alchm-20")
 *
 * Optional:
 *   AMAZON_PAAPI_MARKETPLACE — defaults to "www.amazon.com" (US)
 *   AMAZON_PAAPI_REGION      — defaults to "us-east-1"
 *   AMAZON_PAAPI_HOST        — defaults to "webservices.amazon.com"
 */

import { createHash, createHmac } from "node:crypto";

const SERVICE = "ProductAdvertisingAPI";
const ALGORITHM = "AWS4-HMAC-SHA256";

export interface PaapiSearchResult {
  asin: string;
  title?: string;
  imageUrl?: string;
  price?: string;
  detailPageUrl?: string;
}

interface PaapiConfig {
  accessKey: string;
  secretKey: string;
  partnerTag: string;
  marketplace: string;
  region: string;
  host: string;
}

function loadConfig(): PaapiConfig | null {
  const accessKey = process.env.AMAZON_PAAPI_ACCESS_KEY;
  const secretKey = process.env.AMAZON_PAAPI_SECRET_KEY;
  const partnerTag = process.env.AMAZON_PAAPI_PARTNER_TAG;
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

function sha256Hex(data: string | Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

function hmac(key: Buffer | string, data: string): Buffer {
  return createHmac("sha256", key).update(data, "utf8").digest();
}

function signingKey(secret: string, dateStamp: string, region: string): Buffer {
  const kDate = hmac(`AWS4${secret}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, SERVICE);
  return hmac(kService, "aws4_request");
}

interface SignedRequest {
  url: string;
  headers: Record<string, string>;
  body: string;
}

function signRequest(config: PaapiConfig, target: string, payload: object): SignedRequest {
  const path = "/paapi5/searchitems";
  const body = JSON.stringify(payload);

  // Use UTC for both amzDate (basic ISO) and dateStamp (just yyyymmdd)
  const now = new Date();
  const amzDate =
    now.getUTCFullYear().toString().padStart(4, "0") +
    (now.getUTCMonth() + 1).toString().padStart(2, "0") +
    now.getUTCDate().toString().padStart(2, "0") +
    "T" +
    now.getUTCHours().toString().padStart(2, "0") +
    now.getUTCMinutes().toString().padStart(2, "0") +
    now.getUTCSeconds().toString().padStart(2, "0") +
    "Z";
  const dateStamp = amzDate.slice(0, 8);

  const canonicalHeaders =
    `content-encoding:amz-1.0\n` +
    `content-type:application/json; charset=utf-8\n` +
    `host:${config.host}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-amz-target:${target}\n`;
  const signedHeaders = "content-encoding;content-type;host;x-amz-date;x-amz-target";

  const payloadHash = sha256Hex(body);

  const canonicalRequest = [
    "POST",
    path,
    "", // empty query string
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${config.region}/${SERVICE}/aws4_request`;
  const stringToSign = [
    ALGORITHM,
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");

  const key = signingKey(config.secretKey, dateStamp, config.region);
  const signature = createHmac("sha256", key).update(stringToSign, "utf8").digest("hex");

  const authorization =
    `${ALGORITHM} Credential=${config.accessKey}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return {
    url: `https://${config.host}${path}`,
    headers: {
      "content-encoding": "amz-1.0",
      "content-type": "application/json; charset=utf-8",
      host: config.host,
      "x-amz-date": amzDate,
      "x-amz-target": target,
      authorization: authorization,
    },
    body,
  };
}

interface PaapiSearchItem {
  ASIN?: string;
  DetailPageURL?: string;
  ItemInfo?: { Title?: { DisplayValue?: string } };
  Images?: { Primary?: { Large?: { URL?: string }; Medium?: { URL?: string } } };
  Offers?: { Listings?: Array<{ Price?: { DisplayAmount?: string } }> };
}

interface PaapiSearchResponse {
  SearchResult?: { Items?: PaapiSearchItem[] };
  Errors?: Array<{ Code?: string; Message?: string }>;
}

/**
 * SearchItems against PA-API v5 for a single keyword.
 * Returns the first matching item (or null), shaped for our UI.
 *
 * Returns null if PA-API env is not configured — the caller decides
 * how to fall back. Throws on transport / signing errors so the route
 * can log them.
 */
export async function searchItem(
  keyword: string,
  options: { searchIndex?: string; itemCount?: number } = {},
): Promise<PaapiSearchResult | null> {
  const config = loadConfig();
  if (!config) return null;

  const payload = {
    Keywords: keyword,
    PartnerTag: config.partnerTag,
    PartnerType: "Associates",
    Marketplace: config.marketplace,
    Resources: [
      "Images.Primary.Large",
      "Images.Primary.Medium",
      "ItemInfo.Title",
      "Offers.Listings.Price",
    ],
    ItemCount: options.itemCount ?? 1,
    SearchIndex: options.searchIndex ?? "GroceryAndGourmetFood",
  };

  const target = "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems";
  const signed = signRequest(config, target, payload);

  const res = await fetch(signed.url, {
    method: "POST",
    headers: signed.headers,
    body: signed.body,
  });

  const text = await res.text();
  let parsed: PaapiSearchResponse;
  try {
    parsed = JSON.parse(text) as PaapiSearchResponse;
  } catch {
    throw new Error(`PA-API returned non-JSON (status ${res.status}): ${text.slice(0, 200)}`);
  }

  if (!res.ok) {
    const code = parsed.Errors?.[0]?.Code ?? "Unknown";
    const message = parsed.Errors?.[0]?.Message ?? `HTTP ${res.status}`;
    throw new Error(`PA-API error [${code}]: ${message}`);
  }

  const item = parsed.SearchResult?.Items?.[0];
  if (!item?.ASIN) return null;

  return {
    asin: item.ASIN,
    title: item.ItemInfo?.Title?.DisplayValue,
    imageUrl: item.Images?.Primary?.Large?.URL ?? item.Images?.Primary?.Medium?.URL,
    price: item.Offers?.Listings?.[0]?.Price?.DisplayAmount,
    detailPageUrl: item.DetailPageURL,
  };
}

export function isPaapiConfigured(): boolean {
  return loadConfig() !== null;
}
