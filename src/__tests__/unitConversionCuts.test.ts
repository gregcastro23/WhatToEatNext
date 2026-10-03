/**
 * A measure USDA weighed only several ways — a cup of walnuts ground (80 g),
 * chopped (117 g), in pieces (120 g), shelled halves (100 g) — is weighed at
 * the cut the recipe line names. A line naming no one cut is weighed at the
 * lightest, and the gap to the heaviest comes back as its `spread`.
 */
import { convertToGramsDetailed } from "@/utils/unitConversion";

const WALNUTS = { basis: "usda-measured", fdcId: 170187 };

describe("a measure USDA weighed several ways", () => {
  it("weighs the cut the line names", () => {
    expect(convertToGramsDetailed(1, "cup", "walnuts", "walnuts toasted and chopped")).toEqual({
      grams: 117,
      ...WALNUTS,
      measuredAs: "chopped",
    });
    expect(convertToGramsDetailed(1, "cup", "walnuts", "walnuts ground in food processor")?.grams).toBe(80);
    expect(convertToGramsDetailed(1, "cup", "walnuts", "walnut pieces")?.grams).toBe(120);
    // FDC 170931 weighs a teaspoon of pepper ground (2.3 g) and whole (2.9 g).
    expect(convertToGramsDetailed(2, "tsp", "black pepper", "whole black pepper")?.grams).toBeCloseTo(5.8, 9);
  });

  it("weighs a line naming no cut at the lightest, and says how much more it may be", () => {
    expect(convertToGramsDetailed(1, "cup", "walnuts", "walnuts toasted")).toEqual({
      grams: 80,
      ...WALNUTS,
      measuredAs: "ground",
      spread: 40,
    });
    const pepper = convertToGramsDetailed(1, "tsp", "black pepper", "black pepper to taste");
    expect(pepper?.grams).toBe(2.3);
    expect(pepper?.spread).toBeCloseTo(0.6, 9);
  });

  it("names no cut when the line names two", () => {
    // Baklava: "Coarsely chopped, not ground."
    expect(convertToGramsDetailed(2, "cups", "walnuts", "raw walnuts Coarsely chopped, not ground.")).toMatchObject({
      grams: 160,
      spread: 80,
    });
  });

  it("gives no spread to a measure USDA weighed one way", () => {
    // Parsley's only cup is FDC 170416's "cup chopped", 60 g.
    expect(convertToGramsDetailed(0.5, "cup", "parsley", "parsley roughly torn")).toEqual({
      grams: 30,
      basis: "usda-measured",
      fdcId: 170416,
    });
  });

  it("reads a portion label with or without its comma", () => {
    // FDC 170000 weighs "cup, chopped" at 160 g and "tbsp chopped" at 10 g: 160 / 16 = 10.
    expect(convertToGramsDetailed(1, "tbsp", "onion")?.grams).toBe(10);
    expect(convertToGramsDetailed(1, "cup", "onion", "chopped onion")?.grams).toBe(160);
  });
});
