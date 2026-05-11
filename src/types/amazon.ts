import type {
  AmazonFreshCategory,
  ChakraAlignment,
} from "@/data/amazon/freshMapping";

export type AmazonSearchSource =
  | "verified_static_asin_map"
  | "amazon_paapi"
  | "amazon_paapi_low_confidence"
  | "amazon_paapi_error"
  | "amazon_creators_api"
  | "amazon_creators_api_low_confidence"
  | "amazon_creators_api_empty"
  | "amazon_creators_api_error"
  | "no_live_catalog_credentials";

export type AmazonMatchConfidence = "high" | "medium" | "low";

export type AmazonSubstitutionReason =
  | "primary_empty"
  | "primary_low_confidence"
  | "primary_oos";

export interface AmazonSearchResult {
  ingredient: string;
  normalized: string;
  amazonOptimizedSearchString: string;
  amazonCategoryNode: AmazonFreshCategory;
  primaryBrandSelected: string;
  chakraAlignment: ChakraAlignment;
  asin: string | null;
  searchUrl: string;
  source: AmazonSearchSource;
  matchConfidence: AmazonMatchConfidence;
  alternateBrands?: string[];
  imageUrl?: string;
  price?: string | number;
  inStock?: boolean;
  substituted?: boolean;
  substitutedBrand?: string;
  substitutionReason?: AmazonSubstitutionReason;
  title?: string;
  detailPageUrl?: string | null;
  reason?: string;
  /** Marker so the client can back off, populated for upstream 429s. */
  rateLimited?: boolean;
}
