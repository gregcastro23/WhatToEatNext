/**
 * Order-list builder — turns recipe/menu/cart ingredients into the checklist
 * the OrderIngredientsModal renders. Pure functions, isomorphic.
 *
 * Smarts (all four from the planning round): serving-scaled quantities,
 * cross-recipe merge (slug(name)+unit keying, mirroring GroceryCartContext),
 * a curated staples set default-excluded behind a toggle, and pantry memory —
 * items the user marks "already have" live in localStorage and default
 * unchecked forever after.
 *
 * Every item gets a tagged Amazon Fresh SEARCH link (works for the whole
 * catalog day one); items that resolve an ASIN via /api/amazon/search ride
 * the existing Associates cart-POST instead.
 */

import { AMAZON_ASSOCIATE_TAG } from "@/data/amazon";

export interface OrderInput {
  name: string;
  amount?: number;
  unit?: string;
  category?: string;
  optional?: boolean;
}

export interface OrderListItem {
  key: string; // slug(name)__slug(unit)
  name: string;
  quantity: number;
  unit: string;
  category?: string;
  isStaple: boolean;
  optional: boolean;
  searchUrl: string;
  asin: string | null;
}

/**
 * Pantry-class staples most kitchens already hold — default-excluded from
 * order lists behind the "include staples" toggle. Matched on the slugged
 * name CONTAINING one of these tokens.
 */
const STAPLE_TOKENS = [
  "salt",
  "black-pepper",
  "pepper",
  "water",
  "olive-oil",
  "vegetable-oil",
  "canola-oil",
  "sugar",
  "flour",
  "baking-powder",
  "baking-soda",
  "soy-sauce",
  "vinegar",
  "butter",
  "garlic-powder",
  "onion-powder",
  "cooking-spray",
  "ice",
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isStapleName(name: string): boolean {
  const slug = slugify(name);
  return STAPLE_TOKENS.some((t) => slug === t || slug.endsWith(`-${t}`) || slug.startsWith(`${t}-`) || slug.includes(`-${t}-`));
}

/** Tagged Amazon Fresh search URL for an ingredient name. */
export function freshSearchUrl(name: string): string {
  const params = new URLSearchParams({
    k: name.trim(),
    i: "amazonfresh",
  });
  if (AMAZON_ASSOCIATE_TAG) params.set("tag", AMAZON_ASSOCIATE_TAG);
  return `https://www.amazon.com/s?${params.toString()}`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Build the merged, scaled order list. `scale` multiplies every amount
 * (servings / baseServings on recipe surfaces; 1 elsewhere). Items merge by
 * (name, unit) slug key across everything passed in.
 */
export function buildOrderList(inputs: OrderInput[], scale = 1): OrderListItem[] {
  const merged = new Map<string, OrderListItem>();
  for (const input of inputs) {
    const name = (input.name || "").trim();
    if (!name) continue;
    const unit = (input.unit || "each").trim();
    const key = `${slugify(name)}__${slugify(unit)}`;
    const amount = typeof input.amount === "number" && Number.isFinite(input.amount) ? input.amount : 1;
    const quantity = round2(Math.max(0, amount) * Math.max(0, scale));

    const existing = merged.get(key);
    if (existing) {
      existing.quantity = round2(existing.quantity + quantity);
      existing.optional = existing.optional && Boolean(input.optional);
    } else {
      merged.set(key, {
        key,
        name,
        quantity,
        unit,
        category: input.category,
        isStaple: isStapleName(name),
        optional: Boolean(input.optional),
        searchUrl: freshSearchUrl(name),
        asin: null,
      });
    }
  }
  // Non-staples first, then staples; alphabetical within each group.
  return [...merged.values()].sort((a, b) =>
    a.isStaple === b.isStaple ? a.name.localeCompare(b.name) : a.isStaple ? 1 : -1,
  );
}

// ── Pantry memory (client-side) ─────────────────────────────────────────────

const PANTRY_CACHE_KEY = "alchm:order:pantry";

export function pantryCache(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(PANTRY_CACHE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function setPantryItem(key: string, inPantry: boolean): void {
  if (typeof window === "undefined") return;
  try {
    const cache = pantryCache();
    if (inPantry) cache.add(key);
    else cache.delete(key);
    window.localStorage.setItem(PANTRY_CACHE_KEY, JSON.stringify([...cache]));
  } catch {
    /* private mode — pantry memory just doesn't persist */
  }
}
