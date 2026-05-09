import { NextResponse } from "next/server";
import { resolveAsin } from "@/data/amazon";
import { isPaapiConfigured, searchItem } from "@/lib/amazon/paapi";
import {
  hasAmazonCreatorsCredentials,
  searchAmazonCreatorsCatalog,
} from "@/lib/amazonCreators";
import { rateLimit } from "@/lib/rateLimit";

const MAX_BATCH_SIZE = 50;

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

interface AmazonSearchResult {
  ingredient: string;
  normalized: string;
  asin: string | null;
  searchUrl: string;
  source:
    | "verified_static_asin_map"
    | "amazon_paapi"
    | "amazon_paapi_low_confidence"
    | "amazon_paapi_error"
    | "amazon_creators_api"
    | "amazon_creators_api_low_confidence"
    | "amazon_creators_api_empty"
    | "amazon_creators_api_error"
    | "no_live_catalog_credentials";
  title?: string;
  detailPageUrl?: string | null;
  reason?: string;
}

function getAmazonPartnerTag(): string {
  return (
    process.env.AMAZON_PARTNER_TAG ||
    process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG ||
    "cookingwi03f1-20"
  );
}

function buildAmazonSearchUrl(query: string): string {
  const params = new URLSearchParams({
    k: query,
    i: "amazonfresh",
    tag: getAmazonPartnerTag(),
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
  return ingredient
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, " ")
    .replace(/[^a-z0-9\s-]/g, " ")
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

async function resolveAmazonIngredient(ingredient: string): Promise<AmazonSearchResult> {
  const normalized = normalizeIngredient(ingredient);
  const staticAsin = resolveAsin(normalized);

  if (staticAsin) {
    return {
      ingredient,
      normalized,
      asin: staticAsin,
      searchUrl: buildAmazonSearchUrl(normalized),
      source: "verified_static_asin_map",
    };
  }

  const hasPaapiCredentials = isPaapiConfigured();
  const hasCreatorsCredentials = hasAmazonCreatorsCredentials();

  if (hasPaapiCredentials) {
    try {
      const paapiResult = await searchItem(normalized, {
        searchIndex: "GroceryAndGourmetFood",
        itemCount: 1,
      });

      if (paapiResult?.asin) {
        const confident = isConfidentCatalogMatch(normalized, paapiResult.title);
        return {
          ingredient,
          normalized,
          asin: confident ? paapiResult.asin : null,
          searchUrl: buildAmazonSearchUrl(normalized),
          title: paapiResult.title,
          detailPageUrl: paapiResult.detailPageUrl,
          source: confident ? "amazon_paapi" : "amazon_paapi_low_confidence",
          reason: confident ? undefined : "Catalog result title did not match ingredient tokens.",
        };
      }
    } catch (error) {
      console.warn("Amazon PA-API lookup failed, trying remaining fallbacks", error);
    }
  }

  if (hasCreatorsCredentials) {
    try {
      const creatorsResult = await searchAmazonCreatorsCatalog(normalized);
      const confident = isConfidentCatalogMatch(normalized, creatorsResult.title);

      if (creatorsResult.asin) {
        return {
          ingredient,
          normalized,
          asin: confident ? creatorsResult.asin : null,
          searchUrl: buildAmazonSearchUrl(normalized),
          title: creatorsResult.title,
          detailPageUrl: creatorsResult.detailPageUrl,
          source: confident
            ? "amazon_creators_api"
            : "amazon_creators_api_low_confidence",
          reason: confident ? undefined : "Catalog result title did not match ingredient tokens.",
        };
      }

      return {
        ingredient,
        normalized,
        asin: null,
        searchUrl: buildAmazonSearchUrl(normalized),
        source: "amazon_creators_api_empty",
      };
    } catch (error) {
      console.warn("Amazon Creators API lookup failed, returning graceful fallback", error);

      return {
        ingredient,
        normalized,
        asin: null,
        searchUrl: buildAmazonSearchUrl(normalized),
        source: "amazon_creators_api_error",
      };
    }
  }

  return {
    ingredient,
    normalized,
    asin: null,
    searchUrl: buildAmazonSearchUrl(normalized),
    source: "no_live_catalog_credentials",
  };
}

export async function GET(request: Request) {
  const rl = rateLimit(request, { window: 60_000, max: 30, bucket: "amazon-search" });
  if (!rl.allowed) return rl.response!;

  const { searchParams } = new URL(request.url);
  const ingredient = searchParams.get("ingredient");

  if (!ingredient) {
    return NextResponse.json({ error: "Missing ingredient parameter" }, { status: 400 });
  }

  return NextResponse.json(await resolveAmazonIngredient(ingredient));
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

  return NextResponse.json({
    results,
    configured: {
      paapi: isPaapiConfigured(),
      creators: hasAmazonCreatorsCredentials(),
    },
  });
}
