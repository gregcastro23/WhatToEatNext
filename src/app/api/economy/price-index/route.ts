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

async function loadSupply(): Promise<EsmsSupplyBlock> {
  try {
    const { sql, values } = circulatingSupplySql();
    const res = await executeQuery<{
      spirit: number;
      essence: number;
      matter: number;
      substance: number;
    }>(sql, values);
    const [row] = res.rows;
    if (!row) return SUPPLY_FALLBACK;
    return {
      live: true,
      spirit: Number(row.spirit) || 0,
      essence: Number(row.essence) || 0,
      matter: Number(row.matter) || 0,
      substance: Number(row.substance) || 0,
    };
  } catch {
    return SUPPLY_FALLBACK;
  }
}

export async function GET() {
  let snapshot;
  try {
    snapshot = getLivePriceIndexSnapshot();
  } catch (error) {
    // A broken engine must never quote — no defaults, no last-known-good.
    console.error("[GET /api/economy/price-index]", error);
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
