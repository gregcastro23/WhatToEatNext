/**
 * Planet → culinary domain mapping for the Live Network Feed's planetary
 * resonance posts. Each classical planet, at its CURRENT active degree, resonates
 * with a culinary domain + element (the user's "jumping off point" logic):
 *
 *   Sun     → Fire  → grilled / fire-kissed fare
 *   Moon    → Water → soups & broths
 *   Mercury → Air   → salads & fresh herbs
 *   Venus   → Water → elixirs & sweet beverages
 *   Mars    → Fire  → spiced, pungent plates
 *   Jupiter → Air   → abundant feasts & roasts
 *   Saturn  → Earth → fermented / slow-cooked roots
 *
 * Presentation/mapping only — the elemental keys reuse the canonical FeedElement.
 */

import type { FeedElement } from "@/lib/feed/historicalAgentFeed";

export interface PlanetCulinaryDomain {
  element: FeedElement;
  glyph: string;
  /** Short domain label shown as a tag, e.g. "soups & restorative broths". */
  domain: string;
  /** Verb for the narrated post, e.g. "steeps". */
  verb: string;
  /** Dish noun phrase, e.g. "a restorative soup". */
  dish: string;
}

export const CLASSICAL_PLANETS = [
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
] as const;

export type ClassicalPlanet = (typeof CLASSICAL_PLANETS)[number];

export const PLANET_CULINARY: Record<ClassicalPlanet, PlanetCulinaryDomain> = {
  Sun: { element: "Fire", glyph: "☉", domain: "fire-kissed, grilled fare", verb: "ignites", dish: "a flame-grilled dish" },
  Moon: { element: "Water", glyph: "☽", domain: "soups & restorative broths", verb: "steeps", dish: "a restorative soup" },
  Mercury: { element: "Air", glyph: "☿", domain: "crisp salads & fresh herbs", verb: "tosses", dish: "a bright salad" },
  Venus: { element: "Water", glyph: "♀", domain: "elixirs & sweet beverages", verb: "infuses", dish: "an aromatic elixir" },
  Mars: { element: "Fire", glyph: "♂", domain: "spiced, pungent plates", verb: "fires", dish: "a fiery, spiced plate" },
  Jupiter: { element: "Air", glyph: "♃", domain: "abundant feasts & roasts", verb: "lavishes", dish: "a generous roast" },
  Saturn: { element: "Earth", glyph: "♄", domain: "fermented & slow-cooked roots", verb: "cures", dish: "a slow-cured, earthen dish" },
};
