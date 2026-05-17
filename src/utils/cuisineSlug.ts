/**
 * Slug helpers for cuisine routing.
 *
 * Maps between CUISINES_METADATA keys ("MiddleEastern"), display names
 * ("Middle Eastern"), and URL slugs ("middle-eastern").
 */

import { CUISINES_METADATA } from "@/data/cuisines/index";

export function cuisineToSlug(displayName: string): string {
  return displayName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function slugToCuisineKey(slug: string): string | null {
  const normalized = slug.toLowerCase();
  for (const key of Object.keys(CUISINES_METADATA)) {
    const meta = CUISINES_METADATA[key];
    const display = meta?.name ?? key;
    if (cuisineToSlug(display) === normalized) return key;
  }
  return null;
}

export function getCuisineByDisplayName(displayName: string) {
  const target = displayName.trim().toLowerCase();
  for (const key of Object.keys(CUISINES_METADATA)) {
    const meta = CUISINES_METADATA[key];
    if ((meta?.name ?? "").toLowerCase() === target) return { key, meta };
  }
  return null;
}
