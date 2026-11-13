/**
 * Wire parser for `GET /api/techniques/[name]` as `TechniqueModal` reads it.
 *
 * Producer: `src/app/api/techniques/[name]/route.ts`.
 *   - success (route.ts:109-113): `{ success: true, technique, canonicalKey }`,
 *     where `technique` is a RAW `allCookingMethods` entry
 *     (`src/data/cooking/methods/index.ts:14-22`, typed `CookingMethodData`,
 *     `src/types/cookingMethod.ts:40-109`) serialised by `NextResponse.json`.
 *   - refusals: 404 `{ success: false, error, query }` (route.ts:102-107) and
 *     500 `{ success: false, error }` (route.ts:115-119).
 *   - the rate limiter (route.ts:75-76) answers 429 with
 *     `{ error, message, retryAfter }` and NO `success` key
 *     (`src/lib/rateLimit.ts:159-175`), so `success` must stay optional on the
 *     wire: the modal then shows that body's `error` exactly as before.
 *
 * The modal parses BEFORE it checks `res.ok` / `success`, so every refusal body
 * above must parse without throwing.
 *
 * Failure contract (inside the modal's existing try/catch):
 *   - a body that is not a JSON object throws;
 *   - `success` present but not a boolean throws (never coerced);
 *   - `success: true` with a `technique` that is absent or not a JSON object
 *     throws, so drift cannot read as an empty modal. `technique` is only
 *     parsed on `success: true`, the one case the modal reads it;
 *   - inside a technique every displayed field is optional (the modal renders
 *     each section only when present). A MISTYPED field, or mistyped element
 *     of a list/map, is dropped, never coerced. If fields were present and NONE
 *     survived, that throws; one bad field never rejects the technique;
 *   - fields the modal never reads (`pairingSuggestions`, `chemicalChanges`,
 *     `nutrientRetention`, `history`, ...) are not validated or returned.
 *
 * Client-safe: imports only `@/lib/api/json`.
 *
 * @file src/components/recipes/techniqueParser.ts
 */

import { isJsonRecord } from "@/lib/api/json";

/** The technique fields `TechniqueModal` renders; nothing else is parsed. */
export interface TechniqueData {
  name?: string;
  description?: string;
  shortDescription?: string;
  culinaryArchetype?: string;
  elementalEffect?: { Fire?: number; Water?: number; Earth?: number; Air?: number };
  duration?: { min?: number; max?: number };
  suitable_for?: string[];
  benefits?: string[];
  toolsRequired?: string[];
  commonMistakes?: string[];
  optimalTemperatures?: Record<string, number>;
  scientificPrinciples?: string[];
  expertTips?: string[];
  doneness_indicators?: Record<string, string>;
}

export interface TechniqueApiResponse {
  success?: boolean;
  technique?: TechniqueData;
  canonicalKey?: string;
  error?: string;
}

/**
 * Every key `parseTechnique` can return. A `Record` over `keyof TechniqueData`
 * is exhaustive at compile time: a field added to `TechniqueData` but not listed
 * here fails `tsc`, so the nothing-survived check cannot silently miss it.
 */
const DISPLAY_FIELDS: Record<keyof TechniqueData, true> = {
  name: true,
  description: true,
  shortDescription: true,
  culinaryArchetype: true,
  elementalEffect: true,
  duration: true,
  suitable_for: true,
  benefits: true,
  toolsRequired: true,
  commonMistakes: true,
  optimalTemperatures: true,
  scientificPrinciples: true,
  expertTips: true,
  doneness_indicators: true,
};
const DISPLAY_KEYS: readonly string[] = Object.keys(DISPLAY_FIELDS);

function isString(value: unknown): value is string {
  return typeof value === "string";
}

/** JSON cannot carry NaN/Infinity, but `1e999` parses to Infinity. */
function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function asString(value: unknown): string | undefined {
  return isString(value) ? value : undefined;
}

/** A list keeps its string elements; a non-empty list with none is dropped. */
function stringList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const list: readonly unknown[] = value;
  const kept = list.filter(isString);
  return list.length > 0 && kept.length === 0 ? undefined : kept;
}

/** A map keeps its well-typed entries; a non-empty map with none is dropped. */
function entryMap<T>(
  value: unknown,
  isValue: (entry: unknown) => entry is T,
): Record<string, T> | undefined {
  if (!isJsonRecord(value)) return undefined;
  const entries = Object.entries(value);
  const kept = entries.filter((entry): entry is [string, T] => isValue(entry[1]));
  return entries.length > 0 && kept.length === 0 ? undefined : Object.fromEntries(kept);
}

function parseElementalEffect(value: unknown): TechniqueData["elementalEffect"] {
  if (!isJsonRecord(value)) return undefined;
  const { Fire, Water, Earth, Air } = value;
  const effect = {
    ...(isFiniteNumber(Fire) ? { Fire } : {}),
    ...(isFiniteNumber(Water) ? { Water } : {}),
    ...(isFiniteNumber(Earth) ? { Earth } : {}),
    ...(isFiniteNumber(Air) ? { Air } : {}),
  };
  const sent = [Fire, Water, Earth, Air].some((entry) => entry !== undefined);
  return sent && Object.keys(effect).length === 0 ? undefined : effect;
}

/** The modal prints a duration only when BOTH bounds are numbers. */
function parseDuration(value: unknown): TechniqueData["duration"] {
  if (!isJsonRecord(value)) return undefined;
  const { min, max } = value;
  return isFiniteNumber(min) && isFiniteNumber(max) ? { min, max } : undefined;
}

function parseTechniqueFields(raw: Record<string, unknown>): TechniqueData {
  const name = asString(raw.name);
  const description = asString(raw.description);
  const shortDescription = asString(raw.shortDescription);
  const culinaryArchetype = asString(raw.culinaryArchetype);
  const elementalEffect = parseElementalEffect(raw.elementalEffect);
  const duration = parseDuration(raw.duration);
  const suitableFor = stringList(raw.suitable_for);
  const benefits = stringList(raw.benefits);
  const toolsRequired = stringList(raw.toolsRequired);
  const commonMistakes = stringList(raw.commonMistakes);
  const optimalTemperatures = entryMap(raw.optimalTemperatures, isFiniteNumber);
  const scientificPrinciples = stringList(raw.scientificPrinciples);
  const expertTips = stringList(raw.expertTips);
  const donenessIndicators = entryMap(raw.doneness_indicators, isString);
  return {
    ...(name !== undefined ? { name } : {}),
    ...(description !== undefined ? { description } : {}),
    ...(shortDescription !== undefined ? { shortDescription } : {}),
    ...(culinaryArchetype !== undefined ? { culinaryArchetype } : {}),
    ...(elementalEffect !== undefined ? { elementalEffect } : {}),
    ...(duration !== undefined ? { duration } : {}),
    ...(suitableFor !== undefined ? { suitable_for: suitableFor } : {}),
    ...(benefits !== undefined ? { benefits } : {}),
    ...(toolsRequired !== undefined ? { toolsRequired } : {}),
    ...(commonMistakes !== undefined ? { commonMistakes } : {}),
    ...(optimalTemperatures !== undefined ? { optimalTemperatures } : {}),
    ...(scientificPrinciples !== undefined ? { scientificPrinciples } : {}),
    ...(expertTips !== undefined ? { expertTips } : {}),
    ...(donenessIndicators !== undefined ? { doneness_indicators: donenessIndicators } : {}),
  };
}

function parseTechnique(value: unknown): TechniqueData {
  if (!isJsonRecord(value)) {
    throw new TypeError("Technique response had no technique object");
  }
  const technique = parseTechniqueFields(value);
  const sent = DISPLAY_KEYS.some((key) => value[key] !== undefined);
  if (sent && Object.keys(technique).length === 0) {
    throw new TypeError("Technique had no well-typed displayable fields");
  }
  return technique;
}

/** `parse` for `readJson`. Throws on drift; passes every producer refusal. */
export function parseTechniqueResponse(value: unknown): TechniqueApiResponse {
  if (!isJsonRecord(value)) {
    throw new TypeError("Technique response was not a JSON object");
  }
  const { success, technique, canonicalKey, error } = value;
  if (success !== undefined && typeof success !== "boolean") {
    throw new TypeError("Technique response success flag was not a boolean");
  }
  return {
    ...(typeof success === "boolean" ? { success } : {}),
    ...(success === true ? { technique: parseTechnique(technique) } : {}),
    ...(typeof canonicalKey === "string" ? { canonicalKey } : {}),
    ...(typeof error === "string" ? { error } : {}),
  };
}
