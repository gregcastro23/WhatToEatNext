/**
 * The two readings an agent's `consciousness` carries, kept apart.
 *
 * CONTEXT.md: quantities (ESMS) and elements are ORTHOGONAL readings of the same
 * chart, "not two names for the same four things" (CONTEXT.md:13-15); quantities come
 * from the planets, elements from the signs (:52). Deriving ESMS from elements is
 * called "fundamentally incorrect" there (:23-24), and by the same orthogonality
 * nothing here derives an element from a quantity either. So:
 * - `dominantElement` is Fire, Water, Earth or Air (read from the signs);
 * - `dominantAlchemicalQuantity` is Spirit, Essence, Matter or Substance (read from
 *   the planets).
 *
 * "Spirit" is a QUANTITY. `users/[userId]/route.ts` used to fall back to "Spirit"
 * INSIDE `dominantElement`, which put a quantity in the element field. These
 * helpers only validate and default each reading on its own; nothing maps a
 * quantity to an element or back (Essence is not Water).
 *
 * Basis of the defaults: the owner's ruling of 2026-11-14, recorded in the commit
 * message and pull request that added this file: when the service names neither,
 * the pair is element Fire, quantity Spirit. Fire is
 * also the element default the route (synthesised profiles) and `AgentProfile.tsx`
 * already used; Spirit is the value the route's old element fallback was reaching
 * for. A default is a placeholder, not a measurement: callers that default a
 * present-but-wrong value report it.
 *
 * Client-safe: constants and pure functions only.
 */

import { ALCHEMICAL_PROPERTIES, ELEMENT_TYPES, type AlchemicalProperty, type ElementType } from "@/types/constants";

export const DEFAULT_DOMINANT_ELEMENT: ElementType = "Fire";
export const DEFAULT_DOMINANT_ALCHEMICAL_QUANTITY: AlchemicalProperty = "Spirit";

/**
 * Whether a value is exactly one of Fire, Water, Earth, Air. A quantity (Spirit...) is not.
 * Takes `unknown` and needs no cast; `isElementType` in types/constants.ts takes a `string` and casts.
 */
export function isClassicalElement(value: unknown): value is ElementType {
  return ELEMENT_TYPES.some((name) => name === value);
}

/** Whether a value is exactly one of Spirit, Essence, Matter, Substance. An element (Fire...) is not. */
export function isAlchemicalQuantity(value: unknown): value is AlchemicalProperty {
  return ALCHEMICAL_PROPERTIES.some((name) => name === value);
}

/** The element itself when it is one; Fire for anything else ("Spirit" and every other quantity included). */
export function toClassicalElement(value: unknown): ElementType {
  return isClassicalElement(value) ? value : DEFAULT_DOMINANT_ELEMENT;
}

/** The quantity itself when it is one; Spirit for anything else (an element included). */
export function toAlchemicalQuantity(value: unknown): AlchemicalProperty {
  return isAlchemicalQuantity(value) ? value : DEFAULT_DOMINANT_ALCHEMICAL_QUANTITY;
}
