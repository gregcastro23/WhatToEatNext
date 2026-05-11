import { NextResponse } from "next/server";
import {
  getAmazonFreshAlternateSearchString,
  getAmazonFreshMapping,
  normalizeAmazonIngredientKey,
  resolveAsin,
} from "@/data/amazon";
import {
  getCachedAmazonResult,
  setCachedAmazonResult,
} from "@/lib/amazon/cache";
import { AMAZON_CONFIG } from "@/lib/amazon/config";
import {
  isPaapiConfigured,
  PaapiError,
  searchItem,
} from "@/lib/amazon/paapi";
import type { PaapiResource, PaapiSearchResult } from "@/lib/amazon/paapi";
import {
  CreatorsApiError,
  hasAmazonCreatorsCredentials,
  searchAmazonCreatorsCatalog,
} from "@/lib/amazonCreators";
import { rateLimit } from "@/lib/rateLimit";
import type {
  AmazonMatchConfidence,
  AmazonSearchResult,
  AmazonSubstitutionReason,
} from "@/types/amazon";

const MAX_BATCH_SIZE = 50;
const PAAPI_GROCERY_RESOURCES = [
  "Images.Primary.Large",
  "Offers.Listings.Price",
  "ItemInfo.Title",
] as const satisfies readonly PaapiResource[];

const STOP_WORDS = new Set([
  "and",
  "or",
  "the",
  "a",
  "an",
  "of",
  "for",
  "to",
  "with",
  "fresh",
  "dried",
  "ground",
  "powdered",
  "organic",
  "large",
  "small",
  "medium",
  "chopped",
  "sliced",
  "diced",
  "minced",
  "peeled",
  "whole",
  "cup",
  "cups",
  "tbsp",
  "tablespoon",
  "tablespoons",
  "tsp",
  "teaspoon",
  "teaspoons",
  "lb",
  "lbs",
  "oz",
  "g",
  "kg",
]);

function buildAmazonSearchUrl(query: string): string {
  const params = new URLSearchParams({
    k: query,
    i: "amazonfresh",
    tag: AMAZON_CONFIG.tag,
  });

  return `https://www.amazon.com/s?${params.toString()}`;
}

function singularize(value: string): string {
  if (value.endsWith("ies")) return `${value.slice(0, -3)}y`;
  if (value.endsWith("oes") || value.endsWith("ses") || value.endsWith("xes")) {
    return value.slice(0, -2);
  }
  if (value.endsWith("s") && !value.endsWith("ss")) return value.slice(0, -1);
  return value;
}

function normalizeIngredient(ingredient: string): string {
  return normalizeAmazonIngredientKey(ingredient)
    .replace(/\b\d+([./]\d+)?\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function significantTokens(value: string): string[] {
  return normalizeIngredient(value)
    .split(/\s+/)
    .map(singularize)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function isConfidentCatalogMatch(normalizedIngredient: string, title?: string): boolean {
  if (!title) return false;

  const ingredientTokens = significantTokens(normalizedIngredient);
  if (ingredientTokens.length === 0) return false;

  const titleTokens = new Set(significantTokens(title));
  return ingredientTokens.some((token) => titleTokens.has(token));
}

/** Cache key includes the resolver version so we can bust if format changes. */
function cacheKey(normalized: string): string {
  return `v3:${normalized}`;
}

function getPaapiSubstitutionReason(
  paapiResult: PaapiSearchResult | null,
  confident: boolean,
): AmazonSubstitutionReason {
  if (!paapiResult) return "primary_empty";
  if (!confident) return "primary_low_confidence";
  return "primary_oos";
}

function buildPaapiSearchResult({
  ingredient,
  normalized,
  mapping,
  query,
  selectedBrand,
  paapiResult,
  confident,
  substituted = false,
  substitutionReason,
}: {
  ingredient: string;
  normalized: string;
  mapping: ReturnType<typeof getAmazonFreshMapping>;
  query: string;
  selectedBrand: string;
  paapiResult: PaapiSearchResult;
  confident: boolean;
  substituted?: boolean;
  substitutionReason?: AmazonSubstitutionReason;
}): AmazonSearchResult {
  const inStock = paapiResult.inStock;
  const matchConfidence: AmazonMatchConfidence =
    confident && inStock ? "medium" : "low";

  return {
    ingredient,
    normalized,
    amazonOptimizedSearchString: query,
    amazonCategoryNode: mapping.categoryNode,
    primaryBrandSelected: selectedBrand,
    chakraAlignment: mapping.chakraAlignment,
    alternateBrands: mapping.alternateBrands,
    asin: confident && inStock ? paapiResult.asin : null,
    searchUrl: buildAmazonSearchUrl(query),
    title: paapiResult.title,
    imageUrl: paapiResult.imageUrl,
    price: paapiResult.price,
    inStock,
    detailPageUrl: paapiResult.detailPageUrl,
    source: confident && inStock ? "amazon_paapi" : "amazon_paapi_low_confidence",
    matchConfidence,
    substituted: substituted || undefined,
    substitutedBrand: substituted ? selectedBrand : undefined,
    substitutionReason: substituted ? substitutionReason : undefined,
    reason:
      confident && inStock
        ? undefined
        : inStock
          ? "Catalog result title did not match ingredient tokens."
          : "Catalog result did not include an active priced offer.",
  };
}

async function resolveAmazonIngredient(ingredient: string): Promise<AmazonSearchResult> {
  const normalized = normalizeIngredient(ingredient);
  const cached = getCachedAmazonResult<AmazonSearchResult>(cacheKey(normalized));
  if (cached) {
    return { ...cached, ingredient };
  }

  const result = await resolveAmazonIngredientUncached(ingredient, normalized);

  const cacheable =
    result.source === "verified_static_asin_map" ||
    result.source === "amazon_paapi" ||
    result.source === "amazon_paapi_low_confidence" ||
    result.source === "amazon_creators_api" ||
    result.source === "amazon_creators_api_low_confidence" ||
    result.source === "amazon_creators_api_empty";

  if (cacheable) setCachedAmazonResult(cacheKey(normalized), result);
  return result;
}

async function resolveAmazonIngredientUncached(
  ingredient: string,
  normalized: string,
): Promise<AmazonSearchResult> {
  const staticAsin = resolveAsin(normalized);
  const mapping = getAmazonFreshMapping(ingredient, staticAsin);
  const lookupQuery = mapping.optimizedSearchString;

  if (staticAsin) {
    return {
      ingredient,
      normalized,
      amazonOptimizedSearchString: lookupQuery,
      amazonCategoryNode: mapping.categoryNode,
      primaryBrandSelected: mapping.primaryBrand,
      chakraAlignment: mapping.chakraAlignment,
      alternateBrands: mapping.alternateBrands,
      asin: staticAsin,
      searchUrl: buildAmazonSearchUrl(lookupQuery),
      source: "verified_static_asin_map",
      matchConfidence: "high",
      inStock: true,
    };
  }

  const hasPaapiCredentials = isPaapiConfigured();
  const hasCreatorsCredentials = hasAmazonCreatorsCredentials();

  if (hasPaapiCredentials) {
    try {
      const paapiResult = await searchItem(lookupQuery, {
        searchIndex: "GroceryAndGourmetFood",
        itemCount: 1,
        resources: PAAPI_GROCERY_RESOURCES,
      });

      if (paapiResult?.asin) {
        const confident = isConfidentCatalogMatch(normalized, paapiResult.title);
        if (confident && paapiResult.inStock) {
          return buildPaapiSearchResult({
            ingredient,
            normalized,
            mapping,
            query: lookupQuery,
            selectedBrand: mapping.primaryBrand,
            paapiResult,
            confident,
          });
        }
      }

      const primaryConfident = Boolean(
        paapiResult?.asin && isConfidentCatalogMatch(normalized, paapiResult.title),
      );
      const substitutionReason = getPaapiSubstitutionReason(
        paapiResult,
        primaryConfident,
      );

      for (const alternateBrand of mapping.alternateBrands ?? []) {
        const alternateQuery = getAmazonFreshAlternateSearchString(mapping, alternateBrand);
        const alternateResult = await searchItem(alternateQuery, {
          searchIndex: "GroceryAndGourmetFood",
          itemCount: 1,
          resources: PAAPI_GROCERY_RESOURCES,
        });

        if (!alternateResult?.asin) continue;
        const alternateConfident = isConfidentCatalogMatch(
          normalized,
          alternateResult.title,
        );
        if (!alternateConfident || !alternateResult.inStock) continue;

        return buildPaapiSearchResult({
          ingredient,
          normalized,
          mapping,
          query: alternateQuery,
          selectedBrand: alternateBrand,
          paapiResult: alternateResult,
          confident: alternateConfident,
          substituted: true,
          substitutionReason,
        });
      }

      if (paapiResult?.asin) {
        const confident = isConfidentCatalogMatch(normalized, paapiResult.title);
        return buildPaapiSearchResult({
          ingredient,
          normalized,
          mapping,
          query: lookupQuery,
          selectedBrand: mapping.primaryBrand,
          paapiResult,
          confident,
        });
      }
    } catch (error) {
      const status = error instanceof PaapiError ? error.status : undefined;
      if (status === 429) {
        console.warn(`Amazon PA-API throttled (429) for "${normalized}"`);
        return {
          ingredient,
          normalized,
          amazonOptimizedSearchString: lookupQuery,
          amazonCategoryNode: mapping.categoryNode,
          primaryBrandSelected: mapping.primaryBrand,
          chakraAlignment: mapping.chakraAlignment,
          alternateBrands: mapping.alternateBrands,
          asin: null,
          searchUrl: buildAmazonSearchUrl(lookupQuery),
          source: "amazon_paapi_error",
          matchConfidence: "low",
          reason: "rate_limited",
          rateLimited: true,
        };
      }
      console.warn("Amazon PA-API lookup failed, trying remaining fallbacks", error);
    }
  }

  if (hasCreatorsCredentials) {
    try {
      const creatorsResult = await searchAmazonCreatorsCatalog(lookupQuery);
      const confident = isConfidentCatalogMatch(normalized, creatorsResult.title);

      if (creatorsResult.asin) {
        return {
          ingredient,
          normalized,
          amazonOptimizedSearchString: lookupQuery,
          amazonCategoryNode: mapping.categoryNode,
          primaryBrandSelected: mapping.primaryBrand,
          chakraAlignment: mapping.chakraAlignment,
          alternateBrands: mapping.alternateBrands,
          asin: confident ? creatorsResult.asin : null,
          searchUrl: buildAmazonSearchUrl(lookupQuery),
          title: creatorsResult.title,
          detailPageUrl: creatorsResult.detailPageUrl,
          source: confident
            ? "amazon_creators_api"
            : "amazon_creators_api_low_confidence",
          matchConfidence: confident ? "medium" : "low",
          reason: confident ? undefined : "Catalog result title did not match ingredient tokens.",
        };
      }

      return {
        ingredient,
        normalized,
        amazonOptimizedSearchString: lookupQuery,
        amazonCategoryNode: mapping.categoryNode,
        primaryBrandSelected: mapping.primaryBrand,
        chakraAlignment: mapping.chakraAlignment,
        alternateBrands: mapping.alternateBrands,
        asin: null,
        searchUrl: buildAmazonSearchUrl(lookupQuery),
        source: "amazon_creators_api_empty",
        matchConfidence: "low",
      };
    } catch (error) {
      const status = error instanceof CreatorsApiError ? error.status : undefined;
      const isRateLimit = status === 429;
      if (isRateLimit) {
        console.warn(`Amazon Creators API throttled (429) for "${normalized}"`);
      } else {
        console.warn("Amazon Creators API lookup failed, returning graceful fallback", error);
      }
      return {
        ingredient,
        normalized,
        amazonOptimizedSearchString: lookupQuery,
        amazonCategoryNode: mapping.categoryNode,
        primaryBrandSelected: mapping.primaryBrand,
        chakraAlignment: mapping.chakraAlignment,
        alternateBrands: mapping.alternateBrands,
        asin: null,
        searchUrl: buildAmazonSearchUrl(lookupQuery),
        source: "amazon_creators_api_error",
        matchConfidence: "low",
        reason: isRateLimit ? "rate_limited" : undefined,
        rateLimited: isRateLimit || undefined,
      };
    }
  }

  return {
    ingredient,
    normalized,
    amazonOptimizedSearchString: lookupQuery,
    amazonCategoryNode: mapping.categoryNode,
    primaryBrandSelected: mapping.primaryBrand,
    chakraAlignment: mapping.chakraAlignment,
    alternateBrands: mapping.alternateBrands,
    asin: null,
    searchUrl: buildAmazonSearchUrl(lookupQuery),
    source: "no_live_catalog_credentials",
    matchConfidence: "low",
  };
}

function buildBatchResponse(results: AmazonSearchResult[]) {
  const allRateLimited =
    results.length > 0 && results.every((r) => r.rateLimited === true);
  const payload = {
    results,
    configured: {
      paapi: isPaapiConfigured(),
      creators: hasAmazonCreatorsCredentials(),
    },
  };

  if (allRateLimited) {
    return NextResponse.json(payload, {
      status: 503,
      headers: { "Retry-After": "60" },
    });
  }
  return NextResponse.json(payload);
}

export async function GET(request: Request) {
  const rl = rateLimit(request, { window: 60_000, max: 30, bucket: "amazon-search" });
  if (!rl.allowed) return rl.response!;

  const { searchParams } = new URL(request.url);
  const ingredient = searchParams.get("ingredient");

  if (!ingredient) {
    return NextResponse.json({ error: "Missing ingredient parameter" }, { status: 400 });
  }

  const result = await resolveAmazonIngredient(ingredient);
  if (result.rateLimited) {
    return NextResponse.json(result, {
      status: 503,
      headers: { "Retry-After": "60" },
    });
  }
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const rl = rateLimit(request, { window: 60_000, max: 30, bucket: "amazon-search-batch" });
  if (!rl.allowed) return rl.response!;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const ingredients = Array.isArray((body as { ingredients?: unknown }).ingredients)
    ? (body as { ingredients: unknown[] }).ingredients
    : [];

  const uniqueIngredients = Array.from(
    new Set(
      ingredients
        .filter((ingredient): ingredient is string => typeof ingredient === "string")
        .map((ingredient) => ingredient.trim())
        .filter(Boolean),
    ),
  ).slice(0, MAX_BATCH_SIZE);

  if (uniqueIngredients.length === 0) {
    return NextResponse.json({ error: "Missing ingredients array" }, { status: 400 });
  }

  const results: AmazonSearchResult[] = [];
  for (const ingredient of uniqueIngredients) {
    results.push(await resolveAmazonIngredient(ingredient));
  }

  return buildBatchResponse(results);
}
