/**
 * Ingredient element resolution.
 *
 * The optional legacy scalar `element` on ingredient records is defined on
 * **0 of the 1,158** catalog entries (measured over
 * `UnifiedIngredientService.getAllIngredients()`). The elemental data that does
 * exist lives in `elementalProperties`, populated on 1158/1158. Any consumer
 * reading the scalar therefore takes its `|| "Fire"` fallback branch 100% of
 * the time and labels the entire catalog Fire — a falsy chain that reads as a
 * deliberate default at the call site and is invisible in the output, because
 * "Fire" is a perfectly plausible answer for any single ingredient.
 *
 * Resolution here reads the data that actually exists and routes it through the
 * canonical {@link elementalSignature} model, so the dominant element and its
 * documented three-way tie-break are identical to every other elemental
 * surface — no per-call-site argmax.
 *
 * There is deliberately **no substitute constant**: when a record carries no
 * usable vector this returns `null` and reports the gap at error level, because
 * a second silent default would only move the bug rather than fix it. Callers
 * that structurally require an `Element` decide what to do with `null` at the
 * point where that requirement actually exists.
 *
 * @file src/utils/elemental/ingredientElement.ts
 */

import { _logger } from "@/lib/logger";
import type { Element } from "@/types/alchemy";
import { isElementalProperties } from "./elementalUtils";
import { elementalSignature, type ElementalVector } from "./signature";

const ELEMENT_NAMES: readonly string[] = ["Fire", "Water", "Earth", "Air"];

/**
 * Structural shape of anything that might carry element information.
 *
 * Kept to `unknown` fields on purpose: the ingredient types in this repo reach
 * these properties through index signatures (`[key: string]: unknown`) or not
 * at all, so a narrower parameter type would force an assertion at every call
 * site and hide exactly the "field is absent" case this module exists to catch.
 */
export interface ElementBearingIngredient {
  name?: unknown;
  element?: unknown;
  elementalProperties?: unknown;
}

/** Whether a value is one of the four canonical element names. */
export function isElement(value: unknown): value is Element {
  return typeof value === "string" && ELEMENT_NAMES.includes(value);
}

/**
 * The dominant element of a four-channel vector, or `null` when the vector
 * carries no signal.
 *
 * {@link elementalSignature} normalizes an absent or all-zero vector to an even
 * 0.25 spread and reports Fire by canonical tie-break. That is right for a
 * display bar — something has to be drawn — but wrong as a claim about an
 * ingredient, so emptiness is checked here rather than inside the shared model.
 */
export function dominantElementOf(props: unknown): Element | null {
  if (!isElementalProperties(props)) return null;

  const vector = props as ElementalVector;
  const channels = [vector.Fire, vector.Water, vector.Earth, vector.Air];

  // `isElementalProperties` only checks `typeof === "number"`, which admits
  // NaN and Infinity; both would make the ranking meaningless.
  if (channels.some((value) => !Number.isFinite(value) || value < 0)) {
    return null;
  }
  if (channels.reduce((sum, value) => sum + value, 0) <= 0) return null;

  return elementalSignature(vector).dominant;
}

/** Bound on distinct unresolvable records reported, so a bad load cannot spam. */
const REPORT_LIMIT = 50;
const reported = new Set<string>();

/**
 * Resolve an ingredient's element from whatever the record actually carries.
 *
 * Precedence:
 *  1. A valid `element` scalar on the record itself. Nothing in the catalog
 *     sets one today, but honouring it means populating the field at the data
 *     layer later needs no change here.
 *  2. The dominant element of `elementalProperties`, via the canonical
 *     signature model.
 *  3. `null`, reported at error level — never a substituted element.
 *
 * @param context Identifies the caller in the error log, so an unresolvable
 *   record can be traced to the surface that needed it.
 */
export function resolveIngredientElement(
  ingredient: ElementBearingIngredient | null | undefined,
  context = "ingredient",
): Element | null {
  if (!ingredient || typeof ingredient !== "object") return null;

  if (isElement(ingredient.element)) return ingredient.element;

  const derived = dominantElementOf(ingredient.elementalProperties);
  if (derived) return derived;

  const name =
    typeof ingredient.name === "string" && ingredient.name
      ? ingredient.name
      : "(unnamed)";
  const key = `${context}:${name}`;
  if (!reported.has(key) && reported.size < REPORT_LIMIT) {
    reported.add(key);
    // `_logger.warn` is suppressed in production; only `.error` is ungated, and
    // a record with no elemental basis at all is worth seeing there.
    _logger.error(
      `[${context}] no element could be resolved for "${name}": the record has ` +
        "neither a valid `element` scalar nor usable `elementalProperties`. " +
        "Returning null rather than substituting one.",
    );
  }
  return null;
}

/** Test seam: forget which records have already been reported. */
export function _resetElementResolutionReports(): void {
  reported.clear();
}
