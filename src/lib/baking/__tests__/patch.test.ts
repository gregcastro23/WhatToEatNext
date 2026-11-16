/** @jest-environment node */
import { BROWN_BUTTER_COOKIE, GENOISE_SPONGE } from "@/data/baking/presets";
import { DEFAULT_PATCH_SETS, PATCH_CAPS, solvePatch } from "@/lib/baking/patchSolver";
import { formulaTelemetry } from "@/lib/baking/telemetry";
import { functionalDelta, deltaTargets, substituteCandidates, swapLine } from "@/lib/baking/substitution";
import { thermalPatch } from "@/lib/baking/thermalPatch";

const AMBIENT = { kitchenC: 20, kitchenRhPct: 50 };

describe("swapping", () => {
  it("a matched fat swap keeps the fat grams; a mass swap keeps the grams", () => {
    const f = { id: "f", name: "f", lines: [{ ingredientId: "butter", grams: 100 }, { ingredientId: "all-purpose-flour", grams: 200 }] };
    const matched = swapLine(f, 0, "olive-oil", "matched");
    // Olive oil is 100 % fat, so 81.1 g of it carries butter's 81.1 g of fat.
    expect(matched.grams).toBeCloseTo(81.1, 9);
    expect(swapLine(f, 0, "olive-oil", "mass").grams).toBe(100);
  });

  it("offers same-category substitutes, keeping cocoa apart from the gums", () => {
    expect(substituteCandidates("cocoa-natural").map((i) => i.id)).toEqual(["cocoa-dutch"]);
    expect(substituteCandidates("butter").map((i) => i.id)).toContain("olive-oil");
  });

  it("the delta of a formula against itself is zero everywhere", () => {
    const d = deltaTargets(GENOISE_SPONGE.formula);
    for (const e of functionalDelta(d, d)) expect(e.delta === null || e.delta === 0).toBe(true);
  });
});

describe("the counter-balance patch", () => {
  const flourIndex = BROWN_BUTTER_COOKIE.formula.lines.findIndex((l) => l.ingredientId === "all-purpose-flour");
  const almond = swapLine(BROWN_BUTTER_COOKIE.formula, flourIndex, "almond-flour", "matched").formula;

  it("restores the gluten-free cookie: xanthan for the lost network, water for the lost hydration", () => {
    const patch = solvePatch(BROWN_BUTTER_COOKIE.formula, almond, DEFAULT_PATCH_SETS.flour_grain);
    const ids = patch.adjustments.map((a) => a.ingredientId);
    expect(ids).toContain("xanthan-gum");
    expect(patch.misfitAfter).toBeLessThan(patch.misfitBefore / 10);
  });

  it("never exceeds a dose cap and never removes more than the formula holds", () => {
    const patch = solvePatch(BROWN_BUTTER_COOKIE.formula, almond, ["water", "xanthan-gum", "psyllium-husk"]);
    const flour = formulaTelemetry(almond).flourGrams;
    for (const a of patch.adjustments) {
      const cap = PATCH_CAPS[a.ingredientId];
      if (cap !== undefined && "pctOfFlour" in cap) expect(a.deltaGrams).toBeLessThanOrEqual((cap.pctOfFlour * flour) / 100 + 0.05);
    }
    for (const line of patch.patched.lines) expect(line.grams).toBeGreaterThanOrEqual(0);
  });

  it("says what it could not restore instead of hiding it", () => {
    const sugarIndex = BROWN_BUTTER_COOKIE.formula.lines.findIndex((l) => l.ingredientId === "granulated-sugar");
    const honey = swapLine(BROWN_BUTTER_COOKIE.formula, sugarIndex, "honey", "matched").formula;
    const patch = solvePatch(BROWN_BUTTER_COOKIE.formula, honey, ["water"]);
    expect(patch.unresolved.map((u) => u.id)).toContain("hydration-water");
  });
});

describe("the thermal patch", () => {
  it("leaves an unchanged formula's oven alone", () => {
    const r = thermalPatch(GENOISE_SPONGE, GENOISE_SPONGE, AMBIENT);
    expect(r.available).toBe(true);
    if (r.available) expect(r.value.deltaC).toBe(0);
  });

  it("returns a bounded setting and a stated reason for a real swap", () => {
    const eggIndex = GENOISE_SPONGE.formula.lines.findIndex((l) => l.ingredientId === "whole-egg");
    const swapped = swapLine(GENOISE_SPONGE.formula, eggIndex, "aquafaba", "mass").formula;
    const r = thermalPatch(GENOISE_SPONGE, { ...GENOISE_SPONGE, formula: swapped }, AMBIENT);
    expect(r.available).toBe(true);
    if (r.available) {
      expect(Math.abs(r.value.deltaC)).toBeLessThanOrEqual(60);
      expect(r.value.reason.length).toBeGreaterThan(20);
    }
  });
});
