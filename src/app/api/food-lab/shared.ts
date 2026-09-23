/**
 * Shared Food Lab Utilities
 * Extracted to resolve build-time import errors when routes are proxied.
 */

export interface FoodLabEntry {
  id: string;
  userId: string;
  dishName: string;
  description?: string;
  notes?: string;
  recipeName?: string;
  cuisineType?: string;
  cookingMethod?: string;
  cookedAt: string;
  photos: Array<{ dataUrl: string; caption?: string; uploadedAt: string }>;
  elementalTags: Record<string, number>;
  alchemicalTags: Record<string, number>;
  planetaryContext: Record<string, unknown>;
  rating?: number;
  tags: string[];
  isPublic: boolean;
  shareToken?: string;
  createdAt: string;
  updatedAt: string;
}

/** In-memory fallback when DB is unavailable */
export const memStore = new Map<string, FoodLabEntry[]>(); // userId -> entries

export function getUserEntries(userId: string): FoodLabEntry[] {
  return memStore.get(userId) ?? [];
}

export function saveUserEntries(userId: string, entries: FoodLabEntry[]) {
  memStore.set(userId, entries);
}

export function generateShareToken(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 10)}`;
}

export function rowToEntry(row: Record<string, unknown>): FoodLabEntry {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    dishName: row.dish_name as string,
    ...(typeof row.description === "string" ? { description: row.description } : {}),
    ...(typeof row.notes === "string" ? { notes: row.notes } : {}),
    ...(typeof row.recipe_name === "string" ? { recipeName: row.recipe_name } : {}),
    ...(typeof row.cuisine_type === "string" ? { cuisineType: row.cuisine_type } : {}),
    ...(typeof row.cooking_method === "string" ? { cookingMethod: row.cooking_method } : {}),
    cookedAt: (row.cooked_at as Date).toISOString(),
    photos: (typeof row.photos === "string" ? JSON.parse(row.photos) : row.photos) as FoodLabEntry["photos"],
    elementalTags: (typeof row.elemental_tags === "string" ? JSON.parse(row.elemental_tags) : row.elemental_tags) as Record<string, number>,
    alchemicalTags: (typeof row.alchemical_tags === "string" ? JSON.parse(row.alchemical_tags) : row.alchemical_tags) as Record<string, number>,
    planetaryContext: (typeof row.planetary_context === "string" ? JSON.parse(row.planetary_context) : row.planetary_context) as Record<string, unknown>,
    ...(typeof row.rating === "number" ? { rating: row.rating } : {}),
    tags: (row.tags as string[]) ?? [],
    isPublic: row.is_public as boolean,
    ...(typeof row.share_token === "string" ? { shareToken: row.share_token } : {}),
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}
