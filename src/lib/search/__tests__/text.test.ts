import { normalizeForMatch } from "@/utils/searchNormalize";
import { matchTier } from "../match";
import { boundedEditDistance, normalizeText, stemToken } from "../text";

function tier(query: string, candidate: string): number | null {
  return matchTier(normalizeText(query), normalizeText(candidate));
}

describe("normalizeForMatch folds diacritics instead of deleting them", () => {
  it.each([
    ["Béarnaise", "bearnaise"],
    ["jalapeño", "jalapeno"],
    ["Crème Fraîche!", "creme fraiche"],
    ["oat_milk", "oat milk"],
  ])("%s → %s", (input, expected) => {
    expect(normalizeForMatch(input)).toBe(expected);
  });
});

describe("stemToken", () => {
  it.each([
    ["braising", "brais"],
    ["braise", "brais"],
    ["tomatoes", "tomato"],
    ["tomatos", "tomato"],
    ["tomatoe", "tomato"],
    ["cherries", "cherry"],
    ["fermentation", "ferment"],
    ["fry", "fry"],
  ])("%s → %s", (input, expected) => {
    expect(stemToken(input)).toBe(expected);
  });
});

describe("boundedEditDistance", () => {
  it("counts an adjacent transposition as one edit", () => {
    expect(boundedEditDistance("spinahc", "spinach", 2)).toBe(1);
  });

  it("returns max + 1 once the distance exceeds the cap", () => {
    expect(boundedEditDistance("xqzv", "cod", 1)).toBe(2);
    expect(boundedEditDistance("aubergine", "eggplant", 2)).toBe(3);
  });
});

describe("matchTier", () => {
  it("tier 0: folded, compact (oatmilk) and stemmed (tomatos) equality", () => {
    expect(tier("Béarnaise", "bearnaise")).toBe(0);
    expect(tier("oatmilk", "oat milk")).toBe(0);
    expect(tier("tomatos", "tomato")).toBe(0);
    expect(tier("braise", "braising")).toBe(0);
  });

  it("tier 1: whole words beat word prefixes", () => {
    expect(tier("egg", "Scrambled Eggs")).toBe(1);
    expect(tier("egg", "eggplant")).toBe(2);
    expect(tier("dan dan", "Authentic Sichuan Dan Dan Noodles")).toBe(1);
    expect(tier("dan dan", "dangmyeon")).toBe(2);
  });

  it("tier 2: word prefixes, including every word of a multi-word query", () => {
    expect(tier("spin", "spinach")).toBe(2);
    expect(tier("sichuan noodles", "Authentic Sichuan Dan Dan Noodles")).toBe(2);
  });

  it("tier 3: mid-word only from 4 characters", () => {
    expect(tier("pinach", "spinach")).toBe(3);
    expect(tier("pin", "spinach")).toBeNull();
  });

  it("tiers 4 and 5: one edit from 4 characters, two from 7", () => {
    expect(tier("spinich", "spinach")).toBe(4);
    expect(tier("spinich", "baby spinach")).toBe(4);
    expect(tier("spinnahc", "spinach")).toBe(5);
  });

  it("compact form never makes a prefix: 'tomatosa' only reaches 'tomato sauce' by edits", () => {
    // Compact prefixing ("tomatosauce".startsWith("tomatosa")) would have made this tier 0-2.
    expect(tier("tomatosa", "tomato sauce")).toBe(5);
    // The plural still reaches it as a whole word.
    expect(tier("tomatos", "tomato sauce")).toBe(1);
  });

  it("regression: the 'too far' sentinel is not read as a distance of 2", () => {
    expect(tier("xqzv", "Cod")).toBeNull();
    expect(tier("thai", "Fig")).toBeNull();
    expect(tier("braise", "ham")).toBeNull();
  });
});
