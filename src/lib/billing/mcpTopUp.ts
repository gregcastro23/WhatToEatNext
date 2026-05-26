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

export type McpTopUpSku =
  | "mcp_top_up_5"
  | "mcp_top_up_20"
  | "mcp_top_up_50";

export interface McpTopUpDefinition {
  sku: McpTopUpSku;
  label: string;
  /** Display price (cents). Same as the Stripe Price's `unit_amount`. */
  priceCents: number;
  /** ESMS units credited per axis. Total = 4 × this value. */
  esmsPerAxis: number;
  /** Stripe Price id, resolved from env at runtime. Null = SKU disabled. */
  stripePriceId: string | null;
}

const STATIC_DEFS: Array<Omit<McpTopUpDefinition, "stripePriceId">> = [
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

const PRICE_ENV: Record<McpTopUpSku, string> = {
  mcp_top_up_5: "STRIPE_MCP_TOP_UP_5_PRICE_ID",
  mcp_top_up_20: "STRIPE_MCP_TOP_UP_20_PRICE_ID",
  mcp_top_up_50: "STRIPE_MCP_TOP_UP_50_PRICE_ID",
};

function resolvePriceId(sku: McpTopUpSku): string | null {
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
