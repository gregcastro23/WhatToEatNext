/**
 * Pure unit tests for the MCP top-up SKU catalog. No DB, no Stripe —
 * just shape + env wiring + payload generation.
 */
import {
  buildCreditPayload,
  findSku,
  getMcpTopUpCatalog,
  listAvailableSkus,
  MCP_TOP_UP_PURPOSE,
  type McpTopUpDefinition,
} from "@/lib/billing/mcpTopUp";

const ENV_KEYS = [
  "STRIPE_MCP_TOP_UP_5_PRICE_ID",
  "STRIPE_MCP_TOP_UP_20_PRICE_ID",
  "STRIPE_MCP_TOP_UP_50_PRICE_ID",
] as const;

describe("mcpTopUp catalog", () => {
  const saved: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const k of ENV_KEYS) {
      saved[k] = process.env[k];
      delete process.env[k];
    }
  });

  afterEach(() => {
    for (const k of ENV_KEYS) {
      const v = saved[k];
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });

  it("exposes the purpose constant used by the webhook handler", () => {
    expect(MCP_TOP_UP_PURPOSE).toBe("mcp_top_up");
  });

  it("returns 3 SKUs at the documented price/esms split", () => {
    const catalog = getMcpTopUpCatalog();
    expect(catalog).toHaveLength(3);
    expect(catalog.map((s) => ({ sku: s.sku, c: s.priceCents, e: s.esmsPerAxis }))).toEqual([
      { sku: "mcp_top_up_5", c: 500, e: 50 },
      { sku: "mcp_top_up_20", c: 2000, e: 250 },
      { sku: "mcp_top_up_50", c: 5000, e: 750 },
    ]);
  });

  it("resolves stripe price ids from env vars", () => {
    process.env.STRIPE_MCP_TOP_UP_5_PRICE_ID = "price_abc123";
    const five = findSku("mcp_top_up_5");
    expect(five?.stripePriceId).toBe("price_abc123");
    // SKUs without a configured price id surface null.
    const twenty = findSku("mcp_top_up_20");
    expect(twenty?.stripePriceId).toBeNull();
  });

  it("rejects env values that aren't a Stripe price id", () => {
    process.env.STRIPE_MCP_TOP_UP_5_PRICE_ID = "not-a-price-id";
    expect(findSku("mcp_top_up_5")?.stripePriceId).toBeNull();
  });

  it("listAvailableSkus only returns SKUs with a configured price id", () => {
    process.env.STRIPE_MCP_TOP_UP_5_PRICE_ID = "price_aaa";
    process.env.STRIPE_MCP_TOP_UP_50_PRICE_ID = "price_zzz";
    // mcp_top_up_20 has no env set → filtered out.
    const available = listAvailableSkus();
    expect(available.map((s) => s.sku)).toEqual([
      "mcp_top_up_5",
      "mcp_top_up_50",
    ]);
  });

  it("findSku returns null for unknown skus", () => {
    expect(findSku("not_a_real_sku")).toBeNull();
  });

  it("buildCreditPayload emits one entry per axis with esmsPerAxis", () => {
    const def: McpTopUpDefinition = {
      sku: "mcp_top_up_20",
      label: "Builder",
      priceCents: 2000,
      esmsPerAxis: 250,
      stripePriceId: "price_demo",
    };
    expect(buildCreditPayload(def)).toEqual([
      { tokenType: "Spirit", amount: 250 },
      { tokenType: "Essence", amount: 250 },
      { tokenType: "Matter", amount: 250 },
      { tokenType: "Substance", amount: 250 },
    ]);
  });
});
