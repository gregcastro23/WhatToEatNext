/**
 * Every ranked cooking method's thermodynamics are real, measured values.
 *
 * `EnhancedCookingMethodRecommender` sorts its list by `harmony.harmonyIndex`,
 * and `calculateHarmonyIndex` takes the method's thermodynamics as an input —
 * so list position depends on that triple. The recommender used to end its
 * lookup chain with `|| { heat: 0.5, entropy: 0.5, reactivity: 0.5 }`, which
 * meant a method with no data would rank as though measured to be exactly
 * average in every dimension. That fallback is gone; an un-scoreable method is
 * now omitted from the ranking instead of being given invented merit.
 *
 * These tests are what make the omission safe. The registries reach the
 * component through an `as Record<string, MethodData>` cast, so the optional
 * `thermodynamicProperties?` field on `MethodData` cannot enforce anything at
 * compile time — the guarantee has to be measured here, or a method could
 * silently vanish from the UI.
 */
import {
  dryCookingMethods,
  wetCookingMethods,
  molecularCookingMethods,
  traditionalCookingMethods,
  transformationMethods,
} from "@/data/cooking/methods";
import { getCookingMethodThermodynamics } from "@/constants/alchemicalPillars";

/** The exact five registries `categories` is built from, same ids. */
const CATEGORIES: Record<string, Record<string, unknown>> = {
  dry: dryCookingMethods as Record<string, unknown>,
  wet: wetCookingMethods as Record<string, unknown>,
  molecular: molecularCookingMethods as Record<string, unknown>,
  traditional: traditionalCookingMethods as Record<string, unknown>,
  transformation: transformationMethods as Record<string, unknown>,
};

type Thermo = { heat: number; entropy: number; reactivity: number };

function entries(): Array<{ label: string; id: string; method: Record<string, unknown> }> {
  const out: Array<{ label: string; id: string; method: Record<string, unknown> }> = [];
  for (const [catId, methods] of Object.entries(CATEGORIES)) {
    for (const [id, method] of Object.entries(methods)) {
      out.push({ label: `${catId}/${id}`, id, method: method as Record<string, unknown> });
    }
  }
  return out;
}

/** The component's chain, after the fabricated tail was removed. */
function resolveThermo(id: string, method: Record<string, unknown>): Thermo | null {
  return (method.thermodynamicProperties as Thermo | undefined) ?? getCookingMethodThermodynamics(id);
}

describe("every ranked method carries real thermodynamics", () => {
  const all = entries();

  it("the registries are non-empty (a vacuous sweep would pass silently)", () => {
    expect(all.length).toBeGreaterThanOrEqual(20);
  });

  it("no method reaches the recommender without resolvable thermodynamics", () => {
    // If this fails, the named method would be DROPPED from its category's
    // ranking rather than mis-ranked. The fix is to give it real measured
    // values in src/data/cooking/methods — not to restore a fallback.
    const unresolvable = all.filter(({ id, method }) => resolveThermo(id, method) === null);
    expect(unresolvable.map((u) => u.label)).toEqual([]);
  });

  // `[MEASURED 2026-08-17]` Every method has TWO independent real sources:
  // its own `thermodynamicProperties` (26/26) and pillar derivation from its
  // elemental associations (26/26). That is why the removed fabrication was
  // unreachable — it required both to fail at once. The two tests below assert
  // each source separately, so erosion of either is caught while the other is
  // still covering for it; asserting only the resolved chain would stay green
  // until BOTH were gone, at which point a method silently leaves the list.
  it("source 1: every method carries its own measured thermodynamicProperties", () => {
    const missing = all
      .filter(({ method }) => !method.thermodynamicProperties)
      .map((m) => m.label);
    expect(missing).toEqual([]);
  });

  it("source 2: every method id also derives thermodynamics from its pillar", () => {
    const noPillar = all
      .filter(({ id }) => getCookingMethodThermodynamics(id) === null)
      .map((m) => m.label);
    expect(noPillar).toEqual([]);
  });

  it("every triple is finite and within the unit interval", () => {
    const bad: string[] = [];
    for (const { label, id, method } of all) {
      const t = resolveThermo(id, method);
      if (!t) continue; // covered by the test above
      for (const key of ["heat", "entropy", "reactivity"] as const) {
        const v = t[key];
        if (!Number.isFinite(v) || v < 0 || v > 1) bad.push(`${label}.${key} = ${String(v)}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("removing the fabricated tail changed no method's inputs", () => {
    // Equivalence proof for the refactor: for every real method, the old chain
    // (`props || pillar || {0.5,0.5,0.5}`) and the new one (`props ?? pillar`)
    // resolve to the SAME object. So harmony — and therefore list position —
    // is unchanged for today's data, and the diff cannot have re-ranked
    // anything. The two differ only for a method that has no data at all,
    // which the test above forbids.
    for (const { label, id, method } of all) {
      const oldChain =
        (method.thermodynamicProperties as Thermo | undefined) ||
        getCookingMethodThermodynamics(id) ||
        { heat: 0.5, entropy: 0.5, reactivity: 0.5 };
      const newChain = resolveThermo(id, method);
      expect({ label, ...newChain }).toEqual({ label, ...oldChain });
    }
  });

  it("control: the gate really does reject a method with no thermodynamics", () => {
    // Proves the sweep above is not vacuous — an id the registries do not know,
    // carrying no properties of its own, resolves to null and would be omitted.
    expect(resolveThermo("definitely_not_a_cooking_method_xyz", {})).toBeNull();
  });

  it("the fabricated literal is gone from the recommender's CODE", () => {
    // Belt for the specific regression: a future edit re-adding a midpoint
    // default would restore silent average-merit ranking.
    //
    // Comments are stripped before matching, and that is not incidental — the
    // first version of this test failed against the comment that documents the
    // removal. An assertion over raw source text cannot tell code from prose
    // about code, so it must be given only the code.
    const fs = require("fs");
    const path = require("path");
    const raw: string = fs.readFileSync(
      path.join(process.cwd(), "src/components/recommendations/EnhancedCookingMethodRecommender.tsx"),
      "utf8",
    );
    const code = raw
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/(^|[^:"'`])\/\/[^\n]*/gm, "$1");

    const MIDPOINT_TRIPLE = /heat:\s*0\.5\s*,\s*entropy:\s*0\.5\s*,\s*reactivity:\s*0\.5/;
    expect(code).not.toMatch(MIDPOINT_TRIPLE);
    // Control: the stripping did not eat the whole file, and the pattern does
    // match when the literal is genuinely present as code.
    expect(code).toContain("harmonyIndex");
    expect(`x = { heat: 0.5, entropy: 0.5, reactivity: 0.5 }`).toMatch(MIDPOINT_TRIPLE);
  });
});
