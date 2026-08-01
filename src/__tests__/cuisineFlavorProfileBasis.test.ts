/**
 * cuisineFlavorProfiles.elementalAlignment basis pins.
 *
 * korean and indian shipped the byte-identical literal
 * { Fire: 0.5, Earth: 0.3, Water: 0.1, Air: 0.1 } — the same Indian≡Korean
 * copy-paste that PR #699 killed in CUISINE_ELEMENTAL_MAP. Both now read
 * their own corpus row LIVE from cuisineSignatures.generated.ts, so there is
 * no transcribed decimal that can drift (a copied `toPrecision()` print is
 * how three irreproducible scales shipped once before).
 *
 * These pins guard:
 * 1. Both MEASURED rows round-trip exactly from the corpus artifact.
 * 2. They stay separated, and each stays a normalized recipe mean.
 * 3. The 14 hand-authored rows stay an explicit, exhaustive list — migrating
 *    one, or adding a new unbased row, must be a conscious act.
 */
import { cuisineFlavorProfiles } from "@/data/cuisineFlavorProfiles";
import { CUISINE_SIGNATURES } from "@/utils/cuisineSignatures.generated";

/** profile key → corpus `cuisine` key it is measured from. */
const MEASURED_ROWS: Record<string, string> = {
  korean: "Korean",
  indian: "Indian",
};

const ELEMENTS = ["Fire", "Water", "Earth", "Air"] as const;

describe("cuisineFlavorProfiles elementalAlignment basis", () => {
  it("every measured row round-trips from the corpus artifact", () => {
    for (const [profileKey, corpusKey] of Object.entries(MEASURED_ROWS)) {
      const corpus = CUISINE_SIGNATURES.find((s) => s.cuisine === corpusKey);
      expect(corpus).toBeDefined();
      const alignment = cuisineFlavorProfiles[profileKey].elementalAlignment;
      for (const el of ELEMENTS) {
        expect(alignment[el]).toBe(corpus!.averageElementals[el]);
      }
    }
  });

  it("measured rows are normalized recipe means (each sums to ~1)", () => {
    for (const profileKey of Object.keys(MEASURED_ROWS)) {
      const row = cuisineFlavorProfiles[profileKey].elementalAlignment;
      const sum = row.Fire + row.Water + row.Earth + row.Air;
      expect(sum).toBeGreaterThan(0.999);
      expect(sum).toBeLessThan(1.001);
    }
  });

  it("indian and korean are no longer the same cuisine", () => {
    // The defect this file exists to kill: both rows were the byte-identical
    // literal { Fire: 0.5, Earth: 0.3, Water: 0.1, Air: 0.1 }.
    const indian = cuisineFlavorProfiles.indian.elementalAlignment;
    const korean = cuisineFlavorProfiles.korean.elementalAlignment;
    const differs = ELEMENTS.some((el) => indian[el] !== korean[el]);
    expect(differs).toBe(true);
    // POSITIVE CONTROL — the comparison machinery detects sameness where
    // sameness is real: a row always equals itself.
    expect(ELEMENTS.some((el) => indian[el] !== indian[el])).toBe(false);
  });

  it("the two measured rows disagree on their dominant element", () => {
    // Not merely unequal decimals — the corpus separates them on the axis
    // consumers actually branch on (restaurantDiscoveryService renders a
    // dominant-element badge). Korean is Fire-dominant, Indian Earth-dominant.
    const dominant = (profileKey: string) =>
      ELEMENTS.slice().sort(
        (a, b) =>
          cuisineFlavorProfiles[profileKey].elementalAlignment[b] -
          cuisineFlavorProfiles[profileKey].elementalAlignment[a],
      )[0];
    expect(dominant("korean")).toBe("Fire");
    expect(dominant("indian")).toBe("Earth");
  });

  it("only the unmigrated rows are hand-authored", () => {
    const handAuthored = Object.keys(cuisineFlavorProfiles).filter(
      (k) => !(k in MEASURED_ROWS),
    );
    // UNBASED (pre-existing) rows, exhaustively. These are hand-authored
    // decimals with no recorded derivation, left untouched by the conflation
    // fix. Migrating one to the corpus means deleting it from this list —
    // which is the point: it cannot happen silently.
    expect(handAuthored.sort()).toEqual([
      "african",
      "american",
      "cantonese",
      "chinese",
      "french",
      "greek",
      "italian",
      "japanese",
      "mexican",
      "middleEastern",
      "russian",
      "sichuanese",
      "thai",
      "vietnamese",
    ]);
  });
});
