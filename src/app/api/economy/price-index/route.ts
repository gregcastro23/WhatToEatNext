/**
 * GET /api/economy/price-index
 *
 * The Elemental Exchange Index (ADR-011): deterministic per-token quotes for
 * Spirit / Essence / Matter / Substance, the two real USD rails, and the
 * per-axis circulating supply. Public — like swap-rates, anyone can see how
 * the cosmos is pricing the four coins before authenticating.
 *
 * Honesty contract:
 *  - Oracle math is DB-free and deterministic per minute bucket; identical
 *    across instances, CDN-cacheable.
 *  - Engine failure → 503 with `live: false` and NO token values. Never a
 *    fabricated quote under `success: true`.
 *  - The supply block degrades independently (`supply.live: false`, zeroed) —
 *    the panel renders absence, never a fabricated zero (economyIntegrity
 *    pattern).
 */

import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";
import {
  ORACLE_BUCKET_MS,
  getLivePriceIndexSnapshot,
  type EsmsSupplyBlock,
  type PriceIndexApiPayload,
} from "@/lib/economy/priceIndex";
import { getUsdRails } from "@/lib/economy/usdRails";
import { _logger } from "@/lib/logger";
import { redisCached } from "@/lib/redis";
import { circulatingSupplySql } from "@/services/tokenEconomyQueries";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SUPPLY_CACHE_TTL_SECONDS = 60;

const SUPPLY_FALLBACK: EsmsSupplyBlock = {
  live: false,
  spirit: 0,
  essence: 0,
  matter: 0,
  substance: 0,
};

/**
 * Coerce one supply column off a raw driver row.
 *
 * Two reasons this cannot just read `row.spirit as number`:
 *  - `executeQuery`'s type parameter is declared `_T` and never used in its
 *    return type, so a `executeQuery<{spirit: number}>` annotation buys nothing
 *    — the row is `any` at runtime and at compile time.
 *  - node-postgres returns NUMERIC/BIGINT as **strings**, so the shape that
 *    annotation claimed was wrong anyway.
 *
 * So the row genuinely is unknown here, and the honest move is to say so and
 * coerce explicitly. A non-finite or non-numeric column reads 0, matching the
 * previous `Number(...) || 0` behaviour exactly.
 */
function toSupplyAmount(value: unknown): number {
  const n =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;
  return Number.isFinite(n) ? n : 0;
}

async function loadSupply(): Promise<EsmsSupplyBlock> {
  try {
    const { sql, values } = circulatingSupplySql();
    const res = (await executeQuery(sql, values)) as {
      rows?: Array<Record<string, unknown>>;
    };
    const row = res.rows?.[0];
    if (!row) return SUPPLY_FALLBACK;
    return {
      live: true,
      spirit: toSupplyAmount(row.spirit),
      essence: toSupplyAmount(row.essence),
      matter: toSupplyAmount(row.matter),
      substance: toSupplyAmount(row.substance),
    };
  } catch {
    return SUPPLY_FALLBACK;
  }
}

export async function GET(): Promise<NextResponse> {
  let snapshot;
  try {
    snapshot = getLivePriceIndexSnapshot();
  } catch (error) {
    // A broken engine must never quote — no defaults, no last-known-good.
    _logger.error("[GET /api/economy/price-index]", error);
    return NextResponse.json(
      {
        success: false,
        live: false,
        message: "Price oracle unavailable — the position engine failed",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const supply = await redisCached(
    "economy:price-index:supply:v1",
    SUPPLY_CACHE_TTL_SECONDS,
    loadSupply,
  ).catch(() => SUPPLY_FALLBACK);

  const bucketSeconds = Math.floor(ORACLE_BUCKET_MS / 1000);
  const payload: PriceIndexApiPayload = {
    success: true,
    live: true,
    generatedAt: new Date().toISOString(),
    ...snapshot,
    railsUsd: getUsdRails(),
    supply,
  };
  return NextResponse.json(
    payload,
    {
      headers: {
        // Half the oracle bucket: a CDN hit can be stale by at most one
        // bucket boundary, and every client in a bucket shares one compute.
        "Cache-Control": `public, s-maxage=${bucketSeconds / 2}, stale-while-revalidate=${bucketSeconds * 2}`,
      },
    },
  );
}
