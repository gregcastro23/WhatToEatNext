/**
 * MCP top-up SKU catalog — one-shot ESMS bundles purchasable via Stripe.
 *
 * Each SKU credits an equal amount across all four ESMS axes (Spirit /
 * Essence / Matter / Substance), so a single top-up scales the user's
 * MCP capacity uniformly. Pricing tiers match the prompt:
 *
 *   $5  → 50 / axis (200 total)
 *   $20 → 250 / axis (1000 total)
 *   $50 → 750 / axis (3000 total)
 *
 * The actual Stripe Product / Price objects are configured out-of-band
 * (Stripe dashboard or stripe-cli); this module only knows the SKU
 * identifier and reads the matching `STRIPE_MCP_TOP_UP_*_PRICE_ID` env
 * var at runtime. SKUs without a configured price id are filtered out
 * of `listAvailableSkus()` so the UI doesn't surface a broken buy button.
 *
 * The webhook handler in `src/app/api/stripe/webhook/route.ts` reads
 * `session.metadata.sku` to determine which SKU was purchased and
 * which credit amounts to apply.
 */

import type { TokenType } from "@/types/economy";

export const MCP_TOP_UP_PURPOSE = "mcp_top_up" as const;
export const TOKEN_PACKAGE_PURPOSE = "token_package" as const;

export type TokenPackageSku =
  | "initiate_box"
  | "adept_sphere"
  | "alchemist_chest"
  | "sovereign_vault"
  | "mcp_top_up_5"
  | "mcp_top_up_20"
  | "mcp_top_up_50";

/** Backward compatibility alias for McpTopUpSku */
export type McpTopUpSku = TokenPackageSku;

export interface TokenPackageDefinition {
  sku: TokenPackageSku;
  label: string;
  /** Display price (cents). Same as the Stripe Price's `unit_amount`. */
  priceCents: number;
  /** ESMS units credited per axis. Total = 4 × this value. */
  esmsPerAxis: number;
  /** Stripe Price id, resolved from env at runtime. Null = SKU disabled. */
  stripePriceId: string | null;
}

export type McpTopUpDefinition = TokenPackageDefinition;

const STATIC_DEFS: Array<Omit<TokenPackageDefinition, "stripePriceId">> = [
  {
    sku: "initiate_box",
    label: "Initiate Box — 50 of each axis (200 ESMS)",
    priceCents: 500,
    esmsPerAxis: 50,
  },
  {
    sku: "adept_sphere",
    label: "Adept Sphere — 120 of each axis (480 ESMS)",
    priceCents: 1000,
    esmsPerAxis: 120,
  },
  {
    sku: "alchemist_chest",
    label: "Alchemist Chest — 350 of each axis (1,400 ESMS)",
    priceCents: 2500,
    esmsPerAxis: 350,
  },
  {
    sku: "sovereign_vault",
    label: "Sovereign Vault — 800 of each axis (3,200 ESMS)",
    priceCents: 5000,
    esmsPerAxis: 800,
  },
  // MCP legacy / compatibility SKUs
  {
    sku: "mcp_top_up_5",
    label: "Starter — 50 of each axis",
    priceCents: 500,
    esmsPerAxis: 50,
  },
  {
    sku: "mcp_top_up_20",
    label: "Builder — 250 of each axis",
    priceCents: 2000,
    esmsPerAxis: 250,
  },
  {
    sku: "mcp_top_up_50",
    label: "Adept — 750 of each axis",
    priceCents: 5000,
    esmsPerAxis: 750,
  },
];

const PRICE_ENV: Record<TokenPackageSku, string> = {
  initiate_box: "STRIPE_TOKEN_PACKAGE_INITIATE_PRICE_ID",
  adept_sphere: "STRIPE_TOKEN_PACKAGE_ADEPT_PRICE_ID",
  alchemist_chest: "STRIPE_TOKEN_PACKAGE_CHEST_PRICE_ID",
  sovereign_vault: "STRIPE_TOKEN_PACKAGE_VAULT_PRICE_ID",
  mcp_top_up_5: "STRIPE_MCP_TOP_UP_5_PRICE_ID",
  mcp_top_up_20: "STRIPE_MCP_TOP_UP_20_PRICE_ID",
  mcp_top_up_50: "STRIPE_MCP_TOP_UP_50_PRICE_ID",
};

function resolvePriceId(sku: TokenPackageSku): string | null {
  const envKey = PRICE_ENV[sku];
  const value = process.env[envKey];
  if (typeof value === "string" && value.startsWith("price_")) {
    return value;
  }
  return null;
}

/** Hydrate the static catalog with the env-resolved Stripe price ids. */
export function getMcpTopUpCatalog(): McpTopUpDefinition[] {
  return STATIC_DEFS.map((def) => ({
    ...def,
    stripePriceId: resolvePriceId(def.sku),
  }));
}

/** Catalog filtered to SKUs that have a configured Stripe price id. */
export function listAvailableSkus(): McpTopUpDefinition[] {
  return getMcpTopUpCatalog().filter((s) => s.stripePriceId !== null);
}

/** Look up a single SKU. Returns null when the sku is unknown. */
export function findSku(sku: string): McpTopUpDefinition | null {
  const all = getMcpTopUpCatalog();
  return all.find((s) => s.sku === sku) ?? null;
}

/**
 * Build the per-axis credit payload for `creditMultipleTokens`. Pure
 * function so the webhook handler stays declarative.
 */
export function buildCreditPayload(
  def: McpTopUpDefinition,
): Array<{ tokenType: TokenType; amount: number }> {
  const axes: TokenType[] = ["Spirit", "Essence", "Matter", "Substance"];
  return axes.map((tokenType) => ({ tokenType, amount: def.esmsPerAxis }));
}
