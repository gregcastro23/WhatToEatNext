import { readFileSync } from "fs";
import { join } from "path";
import { PLANETARY_SECTARIAN_ELEMENTS } from "@/utils/planetaryAlchemyMapping";

/**
 * The doc comment above PLANETARY_SECTARIAN_ELEMENTS lists each planet's
 * diurnal/nocturnal element. It silently drifted out of sync with the code
 * for FOUR of the ten planets (Venus, Jupiter, Uranus, Pluto) — the code was
 * right, the comment was wrong.
 *
 * That matters more than a normal stale comment: the sect element drives the
 * 0.4-weight sect pull on every FBD card, and the sibling repos (Pentacles,
 * AlchmAgentsETH, PlanetaryAgents) are expected to hand-port this table. A
 * porter reading the header would have encoded four wrong pairs.
 *
 * This test parses the comment back out of the source and asserts it matches
 * the runtime table, so the two can never diverge again unnoticed.
 */
describe("PLANETARY_SECTARIAN_ELEMENTS doc comment", () => {
  test("the header table matches the code for all ten planets", () => {
    const src = readFileSync(
      join(process.cwd(), "src/utils/planetaryAlchemyMapping.ts"),
      "utf8",
    );

    // Lines shaped like: " *   Venus   Water / Earth"
    const rowRe = /^\s*\*\s+([A-Z][a-z]+)\s+(Fire|Water|Earth|Air)\s*\/\s*(Fire|Water|Earth|Air)/gm;
    const documented: Record<string, { diurnal: string; nocturnal: string }> = {};
    for (const m of src.matchAll(rowRe)) {
      documented[m[1]] = { diurnal: m[2], nocturnal: m[3] };
    }

    // Guard against the regex silently matching nothing and the test passing
    // vacuously — the exact failure mode this test exists to prevent.
    expect(Object.keys(documented).length).toBe(10);

    for (const [planet, pair] of Object.entries(PLANETARY_SECTARIAN_ELEMENTS)) {
      expect(documented[planet]).toBeDefined();
      expect({ planet, ...documented[planet] }).toEqual({
        planet,
        diurnal: pair.diurnal,
        nocturnal: pair.nocturnal,
      });
    }
  });
});
