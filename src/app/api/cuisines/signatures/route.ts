/**
 * GET /api/cuisines/signatures
 *
 * Returns the 4-element signature of each cuisine plus a `match` score against
 * the current sky elemental weights (same dot-product math used by
 * /api/recommendations/ingredients). Source data lives in
 * `backend/alchm_kitchen/data/json/cuisines.json`.
 *
 * Response contract: CuisineSignaturesResponseSchema in
 * src/lib/schemas/dashboard.ts.
 */

import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import {
  CuisineSignaturesResponseSchema,
  type CuisineSignature,
} from "@/lib/schemas/dashboard";
import type { ElementalProperties } from "@/types/alchemy";
import { getAccuratePlanetaryPositions } from "@/utils/astrology/positions";
import { calculateElementalInfluences } from "@/utils/recommendation/ingredientRecommendation";

export const dynamic = "force-dynamic";

const CUISINES_JSON_PATH = path.join(
  process.cwd(),
  "backend",
  "alchm_kitchen",
  "data",
  "json",
  "cuisines.json",
);

/** Short region tag used by the CUISINE EXPLORER panel. */
const REGION_TAGS: Record<string, string> = {
  african: "AFR",
  american: "AMR·US",
  chinese: "ASIA·CN",
  french: "EUR·FR",
  greek: "MED·GR",
  indian: "ASIA·IN",
  italian: "MED·IT",
  japanese: "ASIA·JP",
  korean: "ASIA·KR",
  mexican: "AMR·MX",
  middleeastern: "MENA",
  russian: "EUR·RU",
  thai: "ASIA·TH",
  vietnamese: "ASIA·VN",
};

interface RawCuisine {
  id?: string;
  name?: string;
  elementalProperties?: Partial<ElementalProperties>;
  astrologicalInfluences?: string[];
}

let cuisineCache: Map<string, RawCuisine> | null = null;

function loadCuisines(): Map<string, RawCuisine> {
  if (cuisineCache) return cuisineCache;
  const raw = fs.readFileSync(CUISINES_JSON_PATH, "utf-8");
  const parsed = JSON.parse(raw) as Record<string, RawCuisine>;
  // The JSON ships two entries per cuisine (capitalized + lowercase keys) with
  // slightly different `id` values like "mexican" vs "cuisine-mexican". Dedupe
  // on normalized name and prefer the canonical lowercase id when present.
  const byName = new Map<string, RawCuisine>();
  for (const entry of Object.values(parsed)) {
    const name = (entry?.name ?? "").toString().trim();
    if (!name) continue;
    const key = name.toLowerCase();
    const existing = byName.get(key);
    if (!existing) {
      byName.set(key, entry);
      continue;
    }
    // Prefer the entry whose id matches the simple slug of the name.
    const slug = key.replace(/\s+/g, "-");
    if ((entry.id ?? "").toLowerCase() === slug) byName.set(key, entry);
  }
  cuisineCache = byName;
  return byName;
}

function regionFor(id: string, name: string): string {
  const key = id.replace(/[^a-z]/g, "");
  return REGION_TAGS[key] ?? name.slice(0, 3).toUpperCase();
}

function dot(a: ElementalProperties, b: ElementalProperties): number {
  return (
    (a.Fire ?? 0) * (b.Fire ?? 0) +
    (a.Water ?? 0) * (b.Water ?? 0) +
    (a.Earth ?? 0) * (b.Earth ?? 0) +
    (a.Air ?? 0) * (b.Air ?? 0)
  );
}

export async function GET(request: Request) {
  const rl = await rateLimit(request, {
    window: 60_000,
    max: 60,
    bucket: "cuisines-signatures",
  });
  if (!rl.allowed) return rl.response!;

  try {
    const cuisines = loadCuisines();

    const now = new Date();
    const positions = getAccuratePlanetaryPositions(now);
    const alignment: Record<string, { sign: string; degree: number }> = {};
    for (const [planet, data] of Object.entries(positions)) {
      if (!data) continue;
      alignment[planet] = {
        sign: String((data as { sign?: string }).sign ?? "aries"),
        degree: Number((data as { degree?: number }).degree ?? 0),
      };
    }
    const sky = calculateElementalInfluences(alignment);

    const rows: CuisineSignature[] = [];
    for (const [nameKey, entry] of cuisines) {
      const id = (entry.id ?? nameKey).toString().toLowerCase();
      const name = entry.name ?? nameKey;
      const elem = entry.elementalProperties ?? {};
      const signature: [number, number, number, number] = [
        Number(elem.Fire ?? 0.25),
        Number(elem.Water ?? 0.25),
        Number(elem.Earth ?? 0.25),
        Number(elem.Air ?? 0.25),
      ];
      const cuisineElem: ElementalProperties = {
        Fire: signature[0],
        Water: signature[1],
        Earth: signature[2],
        Air: signature[3],
      };
      const match = Math.max(0, Math.min(1, dot(sky, cuisineElem)));
      rows.push({
        id,
        name,
        region: regionFor(id, name),
        match: Number(match.toFixed(4)),
        signature: signature.map((v) => Number(v.toFixed(4))) as [
          number,
          number,
          number,
          number,
        ],
      });
    }

    rows.sort((a, b) => b.match - a.match);

    const body = CuisineSignaturesResponseSchema.parse({
      total: rows.length,
      cuisines: rows,
    });

    return NextResponse.json(body);
  } catch (error) {
    console.error("[cuisines/signatures] Error:", error);
    return NextResponse.json(
      { error: "Failed to load cuisine signatures" },
      { status: 500 },
    );
  }
}
