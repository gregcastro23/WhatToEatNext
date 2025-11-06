/*
 * Auto-generated on 2025-07-07 – Phase 9 'Guard & Clean'
 * Reusable type-guard helpers used across high-traffic modules.
 *
 * These helpers allow safer property access and help us migrate away from
 * pervasive `as any` casts while we continue the systematic error-reduction
 * campaign.
 */

import type { PlanetaryPosition } from "./alchemy";
import type { AstrologicalProfile } from "./astrology";
import type { CookingMethod } from "./cooking";
import type { Nutrition } from "./index";
import type { Ingredient } from "./ingredient";

/** Narrow unknown object to `Nutrition` (aka NutritionalProfile). */
export function isNutritionalProfile(obj: unknown): obj is Nutrition {
  if (!obj || typeof obj !== "object") return false;
  const maybe = obj as Partial<Nutrition>;
  return (
    typeof maybe.calories === "number" ||
    typeof maybe.protein === "number" ||
    typeof maybe.carbs === "number" ||
    !!(maybe as any).vitamins ||
    !!(maybe as any).minerals
  );
}

/** Narrow unknown object to `PlanetaryPosition`. */
export function isPlanetaryPosition(obj: unknown): obj is PlanetaryPosition {
  if (!obj || typeof obj !== "object") return false;
  const maybe = obj as Partial<PlanetaryPosition>;
  return (
    typeof maybe.degree === "number" ||
    typeof (maybe as any).exactLongitude === "number" ||
    typeof maybe.sign === "string"
  );
}

/** Check for embedded AstrologicalProfile field on a broader object. */
export function hasAstrologicalProfile(
  obj: unknown,
): obj is { astrologicalProfile: AstrologicalProfile } {
  return (
    !!obj &&
    typeof obj === "object" &&
    "astrologicalProfile" in obj &&
    isAstrologicalProfile((obj as any).astrologicalProfile)
  );
}

/** Dedicated guard for AstrologicalProfile itself. */
export function isAstrologicalProfile(
  obj: unknown,
): obj is AstrologicalProfile {
  if (!obj || typeof obj !== "object") return false;
  const maybe = obj as Partial<AstrologicalProfile>;
  return (
    Array.isArray(maybe.zodiac) ||
    Array.isArray(maybe.lunar) ||
    Array.isArray(maybe.planetary) ||
    Array.isArray(maybe.aspects)
  );
}

/** Narrow unknown object to `CookingMethod`. */
export function isCookingMethod(obj: unknown): obj is CookingMethod {
  if (!obj || typeof obj !== "object") return false;
  const maybe = obj as Partial<CookingMethod>;
  return (
    typeof maybe.id === "string" ||
    typeof maybe.name === "string" ||
    typeof maybe.description === "string" ||
    Array.isArray(maybe.benefits) ||
    Array.isArray(maybe.variations) ||
    !!maybe.time_range
  );
}

/** Narrow unknown object to `Ingredient`. */
export function isIngredient(obj: unknown): obj is Ingredient {
  if (!obj || typeof obj !== "object") return false;
  const maybe = obj as Partial<Ingredient>;
  return (
    typeof maybe.name === "string" ||
    typeof maybe.category === "string" ||
    Array.isArray(maybe.qualities) ||
    !!maybe.elementalProperties
  );
}
