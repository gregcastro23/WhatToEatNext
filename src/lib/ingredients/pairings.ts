/**
 * A card's pairings, linked where the name is another card (omnibar Phase 4,
 * #870). Resolution is the exact catalog resolver (slug, key, either catalog's
 * name, alias): a pairing that names no card stays text, never a guess.
 */
import { resolveCatalogIngredient } from "./ingredientCatalog";

export interface PairingLink {
  name: string;
  /** The paired card's dossier slug; null when the name is no card. */
  slug: string | null;
}

/**
 * [MEASURED 2026-09-24, 1,002 union cards] 989 list pairings: median 4, p90 6,
 * max 13; 21 list more than 8. Of 4,208 pairing names, 2,336 (55.5%) are an
 * exact card name and get a link.
 */
export const MAX_PAIRINGS = 8;

/** Names in the card's order, one per paired card, the card itself excluded. */
export function resolvePairings(names: readonly string[], selfSlug: string): PairingLink[] {
  const seen = new Set<string>([selfSlug]);
  const links: PairingLink[] = [];
  for (const name of names) {
    const slug = resolveCatalogIngredient(name)?.entry.slug ?? null;
    const identity = slug ?? name.trim().toLowerCase();
    if (!identity || seen.has(identity)) continue;
    seen.add(identity);
    links.push({ name: name.trim(), slug });
    if (links.length === MAX_PAIRINGS) break;
  }
  return links;
}
