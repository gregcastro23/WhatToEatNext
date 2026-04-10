/**
 * Sign → Element Mapping
 *
 * Shared helper for mapping zodiac signs to their classical element.
 * Extracted from `/api/generate-cosmic-recipe/route.ts` so the recipe builder
 * and any runtime path can share one canonical table.
 */

export type ClassicalElement = "Fire" | "Water" | "Earth" | "Air";

export const SIGN_TO_ELEMENT: Record<string, ClassicalElement> = {
  aries: "Fire",
  leo: "Fire",
  sagittarius: "Fire",
  taurus: "Earth",
  virgo: "Earth",
  capricorn: "Earth",
  gemini: "Air",
  libra: "Air",
  aquarius: "Air",
  cancer: "Water",
  scorpio: "Water",
  pisces: "Water",
};

/**
 * Given a set of planetary positions (sign per planet), returns the dominant
 * classical element — the element represented by the most planets. Ties are
 * broken by the natural element order (Fire > Water > Earth > Air).
 *
 * Accepts positions in either the shape returned by
 * `getAccuratePlanetaryPositions` (`{ [planet]: { sign: string } }`) or a
 * flat `{ [planet]: string }` map. Returns `"Fire"` when no recognizable
 * signs are present so callers never need to null-check.
 */
export function getDominantElementFromPositions(
  positions: Record<string, { sign?: unknown } | string | null | undefined>,
): ClassicalElement {
  const counts: Record<ClassicalElement, number> = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
  };

  for (const value of Object.values(positions)) {
    if (!value) continue;
    const raw =
      typeof value === "string"
        ? value
        : typeof value === "object" && "sign" in value
          ? String((value as { sign?: unknown }).sign ?? "")
          : "";
    const element = SIGN_TO_ELEMENT[raw.toLowerCase()];
    if (element) counts[element] += 1;
  }

  const order: ClassicalElement[] = ["Fire", "Water", "Earth", "Air"];
  let dominant: ClassicalElement = "Fire";
  let highest = -1;
  for (const element of order) {
    if (counts[element] > highest) {
      highest = counts[element];
      dominant = element;
    }
  }
  return dominant;
}
