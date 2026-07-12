/**
 * Shared elemental harmony math.
 *
 * `elementalCosineHarmony` was module-private inside
 * src/app/api/group-recommendations/route.ts (the group-cuisine scorer). It is
 * extracted here verbatim — same vector order, same neutral-0.7 fallback for
 * empty vectors, same [0,1] clamp — so BOTH that route and the Tables
 * discovery scorers (src/services/discoveryService.ts) share ONE
 * implementation. The route re-imports it (zero behavior change; guarded by
 * the parity test in ./__tests__/harmony.test.ts).
 *
 * This is intentionally distinct from `calculateElementalHarmony`
 * (src/utils/astrology/elementalValidation.ts), which stays untouched for its
 * existing `groupDynamics` consumers.
 *
 * @file src/utils/elemental/harmony.ts
 */

import type { Element } from "@/types/celestial";

/** Fire/Water/Earth/Air, the canonical order both vectors are read in. */
const ELEMENT_ORDER: readonly Element[] = ["Fire", "Water", "Earth", "Air"];

/**
 * Cosine similarity between two elemental property vectors over
 * Fire/Water/Earth/Air. Missing components count as 0. Returns a neutral 0.7
 * when either vector is all-zero (no signal to compare), and clamps the result
 * to [0, 1].
 */
export function elementalCosineHarmony(
  a: Record<string, number | undefined>,
  b: Record<string, number | undefined>,
): number {
  const va = ELEMENT_ORDER.map((e) => a[e] ?? 0);
  const vb = ELEMENT_ORDER.map((e) => b[e] ?? 0);
  const dot = va.reduce((s, ai, i) => s + ai * vb[i], 0);
  const magA = Math.sqrt(va.reduce((s, ai) => s + ai * ai, 0));
  const magB = Math.sqrt(vb.reduce((s, bi) => s + bi * bi, 0));
  if (magA === 0 || magB === 0) return 0.7; // Neutral harmony for empty vectors
  return Math.max(0, Math.min(1, dot / (magA * magB)));
}
