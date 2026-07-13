/**
 * Parity test for the extracted cosine harmony (src/utils/elemental/harmony.ts).
 *
 * Guards the PR 6 extraction: `elementalCosineHarmony` must be byte-for-byte
 * behaviorally identical to the original module-private `elementalHarmony` that
 * lived inside src/app/api/group-recommendations/route.ts — same vector order,
 * same neutral-0.7 empty-vector fallback, same [0,1] clamp.
 */

import { elementalCosineHarmony } from "@/utils/elemental/harmony";

// The ORIGINAL implementation, inlined verbatim as the reference oracle.
const ELEMENT_ORDER = ["Fire", "Water", "Earth", "Air"] as const;
function referenceHarmony(a: Record<string, number>, b: Record<string, number>): number {
  const va = ELEMENT_ORDER.map((e) => (a as any)[e] ?? 0);
  const vb = ELEMENT_ORDER.map((e) => (b as any)[e] ?? 0);
  const dot = va.reduce((s, ai, i) => s + ai * vb[i], 0);
  const magA = Math.sqrt(va.reduce((s, ai) => s + ai * ai, 0));
  const magB = Math.sqrt(vb.reduce((s, bi) => s + bi * bi, 0));
  if (magA === 0 || magB === 0) return 0.7;
  return Math.max(0, Math.min(1, dot / (magA * magB)));
}

describe("elementalCosineHarmony — parity with the original group-recommendations math", () => {
  const cases: Array<[Record<string, number>, Record<string, number>]> = [
    [{ Fire: 1, Water: 0, Earth: 0, Air: 0 }, { Fire: 1, Water: 0, Earth: 0, Air: 0 }],
    [{ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }, { Fire: 0.4, Water: 0.1, Earth: 0.3, Air: 0.2 }],
    [{ Fire: 0.7, Water: 0.1, Earth: 0.1, Air: 0.1 }, { Fire: 0.1, Water: 0.7, Earth: 0.1, Air: 0.1 }],
    [{ Fire: 0, Water: 0, Earth: 0, Air: 0 }, { Fire: 0.5, Water: 0.5, Earth: 0, Air: 0 }], // empty → 0.7
    [{ Fire: 3, Water: 1, Earth: 1, Air: 1 }, { Fire: 1, Water: 1, Earth: 1, Air: 1 }],
    [{ Fire: 0.5 }, { Water: 0.5 }], // missing keys count as 0
  ];

  it.each(cases)("matches the reference for %o vs %o", (a, b) => {
    expect(elementalCosineHarmony(a, b)).toBe(referenceHarmony(a, b));
  });

  it("returns neutral 0.7 when either vector is all-zero", () => {
    expect(elementalCosineHarmony({ Fire: 0, Water: 0, Earth: 0, Air: 0 }, { Fire: 1 })).toBe(0.7);
    expect(elementalCosineHarmony({ Fire: 1 }, {})).toBe(0.7);
  });

  it("clamps to [0,1]; identical vectors score ~1 (fp rounding, same as the original)", () => {
    const v = { Fire: 0.3, Water: 0.2, Earth: 0.4, Air: 0.1 };
    expect(elementalCosineHarmony(v, v)).toBeCloseTo(1, 10);
    expect(elementalCosineHarmony(v, v)).toBeLessThanOrEqual(1); // clamp holds
    // A single-axis vector is exactly 1 (no fp drift).
    expect(elementalCosineHarmony({ Fire: 1 }, { Fire: 2 })).toBe(1);
  });
});
