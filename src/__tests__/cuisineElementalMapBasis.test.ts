/**
 * CUISINE_ELEMENTAL_MAP basis pins.
 *
 * The map's measured rows are read LIVE from cuisineSignatures.generated.ts —
 * there is no copied constant to drift (a copied `toPrecision()` print is how
 * three irreproducible scales shipped once before). These pins guard the
 * things that made the old hand map indefensible:
 *
 * 1. Every MEASURED key must have a corpus row — the map throws at module
 *    load otherwise, so this suite failing green-gates the deploy.
 * 2. Indian and Korean were byte-identical copy-paste for years. The corpus
 *    separates them; pin that they stay separated.
 * 3. The RULED and ABSENT rows are exactly the ones with no corpus.
 */
import { CUISINE_ELEMENTAL_MAP } from "@/services/restaurantScoring";
import { CUISINE_SIGNATURES } from "@/utils/cuisineSignatures.generated";

const MEASURED_ROWS: Record<string, string> = {
  Italian: "Italian",
  French: "French",
  Japanese: "Japanese",
  Chinese: "Chinese",
  Mexican: "Mexican",
  Indian: "Indian",
  Thai: "Thai",
  American: "American",
  Greek: "Greek",
  Korean: "Korean",
  Vietnamese: "Vietnamese",
  Ethiopian: "African", // continental proxy — african.ts covers the continent
};

const ELEMENTS = ["Fire", "Water", "Earth", "Air"] as const;

describe("CUISINE_ELEMENTAL_MAP basis", () => {
  it("every measured row round-trips from the corpus artifact", () => {
    for (const [mapKey, corpusKey] of Object.entries(MEASURED_ROWS)) {
      const corpus = CUISINE_SIGNATURES.find((s) => s.cuisine === corpusKey);
      expect(corpus).toBeDefined();
      for (const el of ELEMENTS) {
        expect(CUISINE_ELEMENTAL_MAP[mapKey][el]).toBe(
          corpus!.averageElementals[el],
        );
      }
    }
  });

  it("measured rows are normalized recipe means (each sums to ~1)", () => {
    for (const mapKey of Object.keys(MEASURED_ROWS)) {
      const row = CUISINE_ELEMENTAL_MAP[mapKey];
      const sum = row.Fire + row.Water + row.Earth + row.Air;
      expect(sum).toBeGreaterThan(0.999);
      expect(sum).toBeLessThan(1.001);
    }
  });

  it("Indian and Korean are no longer the same cuisine", () => {
    // The defect this PR exists to kill: both rows were the byte-identical
    // literal { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 }.
    const indian = CUISINE_ELEMENTAL_MAP.Indian;
    const korean = CUISINE_ELEMENTAL_MAP.Korean;
    const differs = ELEMENTS.some((el) => indian[el] !== korean[el]);
    expect(differs).toBe(true);
    // POSITIVE CONTROL — the comparison machinery detects sameness where
    // sameness is real: a row always equals itself.
    expect(ELEMENTS.some((el) => indian[el] !== indian[el])).toBe(false);
  });

  it("only the no-corpus rows are hand-authored", () => {
    const measuredOrSentinel = new Set([...Object.keys(MEASURED_ROWS), "Default"]);
    const handAuthored = Object.keys(CUISINE_ELEMENTAL_MAP).filter(
      (k) => !measuredOrSentinel.has(k),
    );
    // RULED rows, exhaustively: Mediterranean (meta-category, no cuisine
    // file), Spanish (no cuisine file). Adding a row here without a corpus
    // measurement must be a conscious act — extend this list and say why.
    expect(handAuthored.sort()).toEqual(["Mediterranean", "Spanish"]);
  });

  it("Default stays the honest-neutral sentinel", () => {
    expect(CUISINE_ELEMENTAL_MAP.Default).toEqual({
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
      planetaryRuler: "Sun",
    });
  });
});
