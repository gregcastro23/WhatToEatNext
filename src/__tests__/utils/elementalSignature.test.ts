import {
  BALANCED_SPREAD,
  CO_DOMINANT_DELTA,
} from "@/constants/elementalSignature";
// Also assert the helper is reachable through the elemental barrel.
import { elementalSignature as fromBarrel } from "@/utils/elemental";
import { elementalSignature } from "@/utils/elemental/signature";
import type { ElementalProperties } from "@/types/alchemy";

const props = (
  Fire: number,
  Water: number,
  Earth: number,
  Air: number,
): ElementalProperties => ({ Fire, Water, Earth, Air });

describe("elementalSignature", () => {
  it("is exported through the elemental barrel", () => {
    expect(typeof fromBarrel).toBe("function");
    // Behaves identically to the direct import.
    expect(fromBarrel(props(0.21, 0.29, 0.29, 0.21)).label).toBe(
      elementalSignature(props(0.21, 0.29, 0.29, 0.21)).label,
    );
  });

  describe("clear single lean", () => {
    const sig = elementalSignature(props(0.5, 0.25, 0.15, 0.1));

    it("names one dominant element", () => {
      expect(sig.dominant).toBe("Fire");
      expect(sig.tier).toBe("single");
      expect(sig.coDominant).toEqual(["Fire"]);
    });

    it("uses a single-element label", () => {
      expect(sig.label).toBe("leans fire");
      expect(sig.shortLabel).toBe("Fire");
    });
  });

  describe("exact two-way tie — the Water/Earth bug case", () => {
    // The sky that read "leans water": Water 29% / Earth 29% (a tie).
    const sig = elementalSignature(props(0.21, 0.29, 0.29, 0.21));

    it("surfaces as co-dominant, not a silent single pick", () => {
      expect(sig.tier).toBe("co-dominant");
      expect(sig.coDominant).toEqual(["Water", "Earth"]);
    });

    it('reads "leans water & earth"', () => {
      expect(sig.label).toBe("leans water & earth");
      expect(sig.shortLabel).toBe("Water & Earth");
    });

    it("picks a deterministic dominant via canonical order (Water before Earth)", () => {
      expect(sig.dominant).toBe("Water");
    });

    it("is identical regardless of the input object's key order", () => {
      const reordered: ElementalProperties = {
        Air: 0.21,
        Earth: 0.29,
        Water: 0.29,
        Fire: 0.21,
      };
      const other = elementalSignature(reordered);
      expect(other.dominant).toBe(sig.dominant);
      expect(other.label).toBe(sig.label);
      expect(other.coDominant).toEqual(sig.coDominant);
    });
  });

  describe("near-tie within the co-dominant delta", () => {
    const sig = elementalSignature(props(0.31, 0.29, 0.2, 0.2));

    it("names the close runner-up but not the distant elements", () => {
      expect(sig.tier).toBe("co-dominant");
      expect(sig.coDominant).toEqual(["Fire", "Water"]);
      expect(sig.label).toBe("leans fire & water");
    });

    it("excludes elements beyond the delta", () => {
      // Earth/Air are 0.11 below the leader — well past CO_DOMINANT_DELTA.
      expect(0.31 - 0.2).toBeGreaterThan(CO_DOMINANT_DELTA);
      expect(sig.coDominant).not.toContain("Earth");
    });
  });

  describe("three-way cluster", () => {
    const sig = elementalSignature(props(0.3, 0.29, 0.28, 0.13));

    it("names all three close elements", () => {
      expect(sig.tier).toBe("co-dominant");
      expect(sig.coDominant).toEqual(["Fire", "Water", "Earth"]);
      expect(sig.label).toBe("leans fire, water & earth");
      expect(sig.shortLabel).toBe("Fire, Water & Earth");
    });
  });

  describe("balanced sky", () => {
    it("reads balanced for a perfectly even vector", () => {
      const sig = elementalSignature(props(0.25, 0.25, 0.25, 0.25));
      expect(sig.tier).toBe("balanced");
      expect(sig.label).toBe("is in balance");
      expect(sig.shortLabel).toBe("Balanced");
      expect(sig.balance).toBeCloseTo(1, 5);
    });

    it("reads balanced for a near-even vector under the spread threshold", () => {
      const sig = elementalSignature(props(0.27, 0.26, 0.24, 0.23));
      expect(0.27 - 0.23).toBeLessThan(BALANCED_SPREAD);
      expect(sig.tier).toBe("balanced");
    });
  });

  describe("deterministic tie-break (canonical Fire → Water → Earth → Air)", () => {
    it("breaks a four-way exact tie toward Fire", () => {
      expect(elementalSignature(props(0.25, 0.25, 0.25, 0.25)).dominant).toBe(
        "Fire",
      );
    });

    it("breaks an Earth/Air top tie toward Earth", () => {
      const sig = elementalSignature(props(0.2, 0.2, 0.3, 0.3));
      expect(sig.dominant).toBe("Earth");
      expect(sig.coDominant).toEqual(["Earth", "Air"]);
    });
  });

  describe("normalization", () => {
    it("normalizes raw intensities (sum > 1) to shares summing to 1", () => {
      const sig = elementalSignature(props(5, 3, 1, 1));
      const sum =
        sig.values.Fire + sig.values.Water + sig.values.Earth + sig.values.Air;
      expect(sum).toBeCloseTo(1, 6);
      expect(sig.values.Fire).toBeCloseTo(0.5, 6);
      expect(sig.dominant).toBe("Fire");
      expect(sig.tier).toBe("single");
    });

    it("preserves canonical Fire/Water/Earth/Air key order in values", () => {
      const sig = elementalSignature(props(0.4, 0.3, 0.2, 0.1));
      expect(Object.keys(sig.values)).toEqual(["Fire", "Water", "Earth", "Air"]);
    });

    it("ranks strongest → weakest across all four", () => {
      const sig = elementalSignature(props(0.4, 0.3, 0.2, 0.1));
      expect(sig.ranked.map((r) => r.element)).toEqual([
        "Fire",
        "Water",
        "Earth",
        "Air",
      ]);
    });
  });

  describe("degenerate input guards", () => {
    it("falls back to an even balanced split for an all-zero vector", () => {
      const sig = elementalSignature(props(0, 0, 0, 0));
      expect(sig.tier).toBe("balanced");
      expect(sig.dominant).toBe("Fire");
      expect(sig.values.Fire).toBeCloseTo(0.25, 6);
    });

    it("treats NaN / non-finite channels as zero without throwing", () => {
      const sig = elementalSignature(
        props(0.5, Number.NaN, Number.POSITIVE_INFINITY, -2),
      );
      // Only Fire is a valid positive number → it dominates.
      expect(sig.dominant).toBe("Fire");
      expect(Number.isFinite(sig.values.Water)).toBe(true);
      expect(sig.values.Water).toBeCloseTo(0, 6);
    });

    it("handles null / undefined input", () => {
      expect(() => elementalSignature(null)).not.toThrow();
      expect(elementalSignature(undefined).tier).toBe("balanced");
    });
  });

  describe("invariants", () => {
    const samples: ElementalProperties[] = [
      props(0.5, 0.25, 0.15, 0.1),
      props(0.21, 0.29, 0.29, 0.21),
      props(0.25, 0.25, 0.25, 0.25),
      props(0.3, 0.29, 0.28, 0.13),
      props(5, 3, 1, 1),
    ];

    it("always includes the dominant in coDominant and ranks four elements", () => {
      for (const sample of samples) {
        const sig = elementalSignature(sample);
        expect(sig.coDominant[0]).toBe(sig.dominant);
        expect(sig.coDominant.length).toBeGreaterThanOrEqual(1);
        expect(sig.ranked).toHaveLength(4);
        expect(sig.balance).toBeGreaterThanOrEqual(0);
        expect(sig.balance).toBeLessThanOrEqual(1);
      }
    });

    it("never uses opposition language (elements do not oppose)", () => {
      for (const sample of samples) {
        const sig = elementalSignature(sample);
        for (const text of [sig.label, sig.shortLabel]) {
          expect(text.toLowerCase()).not.toMatch(/\bvs\b|oppos|conflict|versus/);
        }
      }
    });
  });
});
