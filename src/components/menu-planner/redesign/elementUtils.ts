/**
 * Elemental display helpers for the redesigned weekly planner.
 * Maps recipe elemental properties onto the app's element tokens
 * (fire-spirit / water-essence / earth-matter / air-substance).
 *
 * @file src/components/menu-planner/redesign/elementUtils.ts
 */

export type ElementName = "Fire" | "Water" | "Earth" | "Air";

/** Tailwind background tokens for the small per-meal element dot. */
export const ELEMENT_DOT: Record<ElementName, string> = {
  Fire: "bg-fire-spirit",
  Water: "bg-water-essence",
  Earth: "bg-earth-matter",
  Air: "bg-air-substance",
};

/** Tailwind text tokens for element labels. */
export const ELEMENT_TEXT: Record<ElementName, string> = {
  Fire: "text-fire-spirit",
  Water: "text-water-essence",
  Earth: "text-earth-matter",
  Air: "text-air-substance",
};

/**
 * Read a normalized elemental record, tolerating both capitalized
 * (Fire/Water/…) and lowercase (fire/water/…) keys.
 */
export function readElemental(
  ep?: Record<string, number> | null,
): Record<ElementName, number> {
  return {
    Fire: ep?.Fire ?? ep?.fire ?? 0,
    Water: ep?.Water ?? ep?.water ?? 0,
    Earth: ep?.Earth ?? ep?.earth ?? 0,
    Air: ep?.Air ?? ep?.air ?? 0,
  };
}

/** The dominant element of a recipe, or null when no elemental data is present. */
export function dominantElement(
  ep?: Record<string, number> | null,
): ElementName | null {
  if (!ep) return null;
  const vals = readElemental(ep);
  const entries = Object.entries(vals) as Array<[ElementName, number]>;
  const max = entries.reduce((a, b) => (b[1] > a[1] ? b : a));
  return max[1] > 0 ? max[0] : null;
}
