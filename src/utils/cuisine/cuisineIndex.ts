/**
 * Cuisine Index
 *
 * Typed loader over `src/utils/cuisineSignatures.generated.ts`. The generated
 * file is produced by `yarn cuisines:process-all` and contains the statistical
 * aggregate properties and signatures for every primary cuisine.
 *
 * Responsibilities:
 *   - Normalize incoming cuisine names so "italian", "Italian", and
 *     "middle eastern" all resolve to the same canonical entry.
 *   - Expose ergonomic getters for pages/components that want signatures,
 *     planetary patterns, or the dominant element.
 *   - Cache all lookups in a module-level `Map` so the generated data is
 *     parsed once per process.
 */

import type {
  CuisineComputedProperties,
  CuisineSignature,
  PlanetaryPattern,
} from "@/types/hierarchy";
import type { ElementalProperties } from "@/types/alchemy";
import {
  CUISINE_SIGNATURES,
  CUISINE_GLOBAL_AVERAGES,
} from "@/utils/cuisineSignatures.generated";
import type { ClassicalElement } from "@/utils/astrology/signElement";

export interface CuisineIndexEntry {
  cuisine: string;
  sampleSize: number;
  averageElementals: CuisineComputedProperties["averageElementals"];
  averageAlchemical?: CuisineComputedProperties["averageAlchemical"];
  averageThermodynamics?: CuisineComputedProperties["averageThermodynamics"];
  variance: CuisineComputedProperties["variance"];
  signatures: CuisineSignature[];
  planetaryPatterns?: PlanetaryPattern[];
}

export type GlobalPropertyAverages = typeof CUISINE_GLOBAL_AVERAGES;

// ---------- Name normalization ----------

/**
 * Canonicalize a cuisine name for lookup.
 *
 * Mirrors the algorithm in `src/scripts/process-all-cuisines.ts` so names
 * emitted by the generator and names supplied by consumers resolve to the
 * same key. Preserves a single special-case for "Middle Eastern" because the
 * generator treats it as a single word.
 */
export function normalizeCuisineName(value: string): string {
  const trimmed = value?.trim?.() ?? "";
  if (!trimmed) return trimmed;
  if (/middle\s*eastern/i.test(trimmed)) return "Middle Eastern";
  return trimmed
    .split(/\s+/)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase())
    .join(" ");
}

// ---------- Memoized index ----------

let indexCache: Map<string, CuisineIndexEntry> | null = null;
let namesCache: string[] | null = null;

function buildIndex(): Map<string, CuisineIndexEntry> {
  const map = new Map<string, CuisineIndexEntry>();
  for (const raw of CUISINE_SIGNATURES as readonly unknown[]) {
    const entry = raw as CuisineIndexEntry;
    const key = normalizeCuisineName(entry.cuisine);
    if (!key) continue;
    map.set(key, {
      ...entry,
      cuisine: key,
      signatures: [...(entry.signatures ?? [])],
      planetaryPatterns: entry.planetaryPatterns
        ? [...entry.planetaryPatterns]
        : undefined,
    });
  }
  return map;
}

function getIndex(): Map<string, CuisineIndexEntry> {
  if (!indexCache) indexCache = buildIndex();
  return indexCache;
}

// ---------- Public API ----------

/**
 * All cuisine names in the generated manifest, ordered by sample size
 * descending. Cached for repeated calls.
 */
export function getAllCuisineNames(): string[] {
  if (namesCache) return namesCache;
  const entries = Array.from(getIndex().values()).sort(
    (a, b) => b.sampleSize - a.sampleSize,
  );
  namesCache = entries.map((entry) => entry.cuisine);
  return namesCache;
}

/**
 * Look up a cuisine entry by display or slug form. Returns `null` when the
 * cuisine is not present in the manifest so the caller can distinguish
 * "unknown cuisine" from "no signatures".
 */
export function getCuisineEntry(name: string): CuisineIndexEntry | null {
  if (!name) return null;
  return getIndex().get(normalizeCuisineName(name)) ?? null;
}

export function getCuisineSignatures(name: string): CuisineSignature[] {
  return getCuisineEntry(name)?.signatures ?? [];
}

export function getPlanetaryPatterns(name: string): PlanetaryPattern[] {
  return getCuisineEntry(name)?.planetaryPatterns ?? [];
}

export function getGlobalAverages(): GlobalPropertyAverages {
  return CUISINE_GLOBAL_AVERAGES;
}

/**
 * Returns the dominant element for a cuisine (the element with the highest
 * average) or `null` when the cuisine is missing from the manifest. Tie
 * resolution follows the natural order Fire > Water > Earth > Air.
 */
export function getDominantElementForCuisine(
  name: string,
): ClassicalElement | null {
  const entry = getCuisineEntry(name);
  if (!entry) return null;
  const averages = entry.averageElementals as ElementalProperties;
  const order: ClassicalElement[] = ["Fire", "Water", "Earth", "Air"];
  let dominant: ClassicalElement = "Fire";
  let highest = -Infinity;
  for (const element of order) {
    const value = Number(averages[element] ?? 0);
    if (value > highest) {
      highest = value;
      dominant = element;
    }
  }
  return dominant;
}
