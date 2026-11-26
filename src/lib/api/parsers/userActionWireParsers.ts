/**
 * Pure runtime wire parsers for commensal, vault economy, and favorite recipe routes.
 *
 * @file src/lib/api/parsers/userActionWireParsers.ts
 */

import type { TrackedIngredient } from "@/lib/recipes/favoriteRecipes";
import {
  isPlainObject,
  readFiniteNumber,
  readString,
  readStringArray,
} from "./wirePrimitives";

export interface VaultTokenBalances {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}

/** Producer: `src/app/api/user/commensals/route.ts:103-198` */
export function parseCommensalSaveResponse(raw: unknown): {
  success: boolean;
  message?: string;
} {
  if (!isPlainObject(raw)) return { success: false };
  const message = readString(raw.message);
  return message !== undefined
    ? { success: raw.success === true, message }
    : { success: raw.success === true };
}

/** Producer: `src/app/api/commensal/save-group/route.ts:56-175` */
export function parseSaveGroupResponse(raw: unknown): {
  success: boolean;
  message?: string;
  diningGroup?: { id?: string };
} {
  if (!isPlainObject(raw)) return { success: false };
  const out: {
    success: boolean;
    message?: string;
    diningGroup?: { id?: string };
  } = { success: raw.success === true };
  if (typeof raw.message === "string") out.message = raw.message;
  if (isPlainObject(raw.diningGroup)) {
    const groupId = readString(raw.diningGroup.id);
    out.diningGroup = groupId !== undefined ? { id: groupId } : {};
  }
  return out;
}

/** Producer: `src/app/api/economy/balance/route.ts:52-88` (vault balance shape) */
export function parseVaultBalancesResponse(raw: unknown): {
  balances?: VaultTokenBalances;
} {
  if (!isPlainObject(raw) || !isPlainObject(raw.balances)) return {};
  const spirit = readFiniteNumber(raw.balances.spirit);
  const essence = readFiniteNumber(raw.balances.essence);
  const matter = readFiniteNumber(raw.balances.matter);
  const substance = readFiniteNumber(raw.balances.substance);
  if (spirit === undefined || essence === undefined || matter === undefined || substance === undefined) {
    return {};
  }
  return { balances: { spirit, essence, matter, substance } };
}

/** Producer: `src/app/api/economy/claim-daily/route.ts:87-141` */
export function parseClaimDailyResponse(raw: unknown): {
  success: boolean;
  message?: string;
} {
  if (!isPlainObject(raw)) return { success: false };
  const message = readString(raw.message);
  return message !== undefined
    ? { success: raw.success === true, message }
    : { success: raw.success === true };
}

function parseTrackedIngredient(raw: unknown): TrackedIngredient | null {
  if (!isPlainObject(raw)) return null;
  const name = readString(raw.name);
  const count = readFiniteNumber(raw.count);
  if (!name || count === undefined) return null;
  return { name, count };
}

function parseTrackedList(raw: unknown): TrackedIngredient[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  return raw
    .map(parseTrackedIngredient)
    .filter((item): item is TrackedIngredient => item !== null);
}

/** Producer: `src/app/api/recipes/favorites/route.ts:115-127` */
export function parseFavoriteRecipesResponse(raw: unknown): {
  success: boolean;
  favoriteIds?: string[];
  topTrackedIngredients?: TrackedIngredient[];
  topLikedIngredients?: TrackedIngredient[];
} {
  if (!isPlainObject(raw)) return { success: false };
  const out: {
    success: boolean;
    favoriteIds?: string[];
    topTrackedIngredients?: TrackedIngredient[];
    topLikedIngredients?: TrackedIngredient[];
  } = { success: raw.success === true };
  if (Array.isArray(raw.favoriteIds)) out.favoriteIds = readStringArray(raw.favoriteIds);
  const tracked = parseTrackedList(raw.topTrackedIngredients);
  if (tracked) out.topTrackedIngredients = tracked;
  const liked = parseTrackedList(raw.topLikedIngredients);
  if (liked) out.topLikedIngredients = liked;
  return out;
}
