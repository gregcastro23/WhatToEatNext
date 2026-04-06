/**
 * Instacart Developer Platform (IDP) API types.
 * Spec: https://docs.instacart.com/developer_platform_api/
 *
 * Three endpoints available:
 *   POST /idp/v1/products/products_link  — Create shopping list page
 *   POST /idp/v1/products/recipe         — Create recipe page
 *   GET  /idp/v1/retailers               — Get nearby retailers
 */

// ─── Shared Objects ──────────────────────────────────────────────────────────

export interface InstacartMeasurement {
  /** Product quantity. Defaults to 1.0 */
  quantity: number;
  /** Unit of measurement (each, package, tablespoon, ounce, kilogram, etc.) */
  unit: string;
}

export interface InstacartFilter {
  /** Brand names, case-sensitive, exactly as they appear on Instacart */
  brand_filters?: string[];
  /** ORGANIC, GLUTEN_FREE, FAT_FREE, VEGAN, KOSHER, SUGAR_FREE, LOW_FAT */
  health_filters?: string[];
}

export interface InstacartLandingPageConfiguration {
  /** URL link back to the recipe/shopping list on our site */
  partner_linkback_url?: string;
  /** Allow users to mark pantry items. Only supported on 'recipe' link_type */
  enable_pantry_items?: boolean;
}

// ─── Line Items ──────────────────────────────────────────────────────────────

export interface InstacartLineItem {
  /** Product name — used by Instacart as search term */
  name: string;
  /** Display text shown in search results and ingredient list */
  display_text?: string;
  /** Product IDs for exact matching. Mutually exclusive with upcs */
  product_ids?: number[];
  /** UPC codes for exact matching. Mutually exclusive with product_ids */
  upcs?: string[];
  /** Measurement options for this line item */
  line_item_measurements?: InstacartMeasurement[];
  /** Optional brand/health filters for product matching */
  filters?: InstacartFilter;
}

/** @deprecated Use InstacartMeasurement instead */
export interface InstacartLineItemMeasurement {
  quantity: string;
  unit: string;
}

// ─── Shopping List ───────────────────────────────────────────────────────────
// POST /idp/v1/products/products_link

export interface InstacartShoppingListRequest {
  title: string;
  image_url?: string;
  link_type?: "shopping_list" | "recipe";
  expires_in?: number;
  instructions?: string[];
  line_items: InstacartLineItem[];
  landing_page_configuration?: InstacartLandingPageConfiguration;
  /** @deprecated Use line_items with line_item_measurements instead */
  ingredients?: string[];
}

export interface InstacartShoppingListResponse {
  products_link_url: string;
}

// ─── Recipe Page ─────────────────────────────────────────────────────────────
// POST /idp/v1/products/recipe

export interface InstacartRecipeRequest {
  title: string;
  image_url?: string;
  author?: string;
  servings?: number;
  cooking_time?: number;
  external_reference_id?: string;
  content_creator_credit_info?: string;
  expires_in?: number;
  instructions?: string[];
  ingredients: InstacartLineItem[];
  landing_page_configuration?: InstacartLandingPageConfiguration;
}

export interface InstacartRecipeResponse {
  products_link_url: string;
}

// ─── Retailers ───────────────────────────────────────────────────────────────
// GET /idp/v1/retailers?postal_code={zip}&country_code={cc}

export interface InstacartRetailer {
  /** Unique identifier for the retailer organization */
  retailer_key: string;
  /** Retailer display name */
  name: string;
  /** URL to the retailer's logo */
  retailer_logo_url: string;
}

export interface InstacartRetailersResponse {
  retailers: InstacartRetailer[];
}
