/**
 * Client-safe mint helpers — fetch wrappers only (NO server imports, so this is
 * safe in client bundles). Used by the Promotion mint panel and the recipe
 * builder's "Mint as NFT" action.
 */

import type { CoinAmounts } from "./types";

export interface MintQuoteResult {
  enabled: boolean;
  fingerprint: { aSharp: number; totals: CoinAmounts };
  quote: { liveCost: CoinAmounts; swap: { rulingHourPlanet: string } };
}

export interface MintResult {
  ok: boolean;
  status?: "pending_chain" | "minting" | "minted" | "failed";
  pending?: boolean;
  cost?: CoinAmounts;
  weightedToCoin?: string | null;
  contentHash?: string;
  error?: string;
  httpStatus: number;
}

const coinSum = (c: CoinAmounts) => c.spirit + c.essence + c.matter + c.substance;
export const totalEsms = coinSum;

/** Quote the cost of minting an arbitrary recipe (read-only). */
export async function quoteRecipeMint(recipe: unknown): Promise<MintQuoteResult | null> {
  try {
    const res = await fetch("/api/recipes/mint-quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipe }),
    });
    if (!res.ok) return null;
    return (await res.json()) as MintQuoteResult;
  } catch {
    return null;
  }
}

/** Mint a recipe (backend-sponsored). Spends ESMS; returns a structured result. */
export async function mintRecipe(recipe: unknown): Promise<MintResult> {
  try {
    const res = await fetch("/api/recipes/mint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipe }),
    });
    const data = await res.json().catch(() => ({}));
    return {
      ok: res.ok,
      httpStatus: res.status,
      status: data?.status,
      pending: data?.pending,
      cost: data?.cost,
      weightedToCoin: data?.weightedToCoin,
      contentHash: data?.contentHash,
      error: data?.error,
    };
  } catch {
    return { ok: false, httpStatus: 0, error: "network_error" };
  }
}

/** Human message for a mint result. */
export function mintResultMessage(r: MintResult): string {
  if (r.ok) {
    if (r.pending) return "Recipe locked in! Its NFT mints on-chain when the protocol goes live on Base.";
    if (r.status === "minted") return "Minted on-chain! 🎉";
    return "Mint recorded.";
  }
  switch (r.httpStatus) {
    case 0: return "Network hiccup — check your connection and try again.";
    case 400:
    case 422: return "That recipe can't be minted as-is — try regenerating it.";
    case 401: return "Sign in to mint a recipe NFT.";
    case 402: return r.cost ? `Not enough ESMS — minting costs ${coinSum(r.cost).toFixed(2)} across all four coins.` : "Not enough ESMS to mint.";
    case 409: return "This exact recipe has already been minted.";
    case 503: return "Minting isn't available right now. Please try again shortly.";
    // 500s here always refund the debit, so the user's ESMS are untouched.
    default: return "Couldn't mint right now — your ESMS weren't spent. Please try again shortly.";
  }
}
