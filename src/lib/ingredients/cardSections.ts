/**
 * A catalog card's own culinary facts as titled lists. Cards store several
 * shapes (strings, lists, labelled objects); each is read defensively.
 * Uncited health claims and safety thresholds are left out: cited safety lives
 * in the food guides.
 */
import type { CardSection } from "@/lib/validation/culinaryCardSchemas";
import { ownValue, readPath, type CardRecord, type TemplateIndex } from "./cardFiller";

const LINE_LIMIT = 12;

/** "preparationTips" → "Preparation tips"; "indole_3_carbinol" → "Indole 3 carbinol". */
export function label(key: string): string {
  const words = key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Every readable line in a value; objects become "Label: …" lines. */
export function lines(value: unknown): string[] {
  if (typeof value === "string") return value.trim() === "" ? [] : [value.trim()];
  // A bare true or false ("washing: false") says nothing to a reader.
  if (typeof value === "number") return [String(value)];
  if (Array.isArray(value)) return value.flatMap(lines);
  if (typeof value !== "object" || value === null) return [];
  const name: unknown = Reflect.get(value, "name");
  if (typeof name === "string") return [name];
  return Object.entries(value).flatMap(([key, entry]) => {
    const inner = lines(entry);
    return inner.length === 0 ? [] : [`${label(key)}: ${inner.join("; ")}`];
  });
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values)].slice(0, LINE_LIMIT);
}

function section(id: string, title: string, items: readonly string[]): CardSection[] {
  const kept = unique(items);
  return kept.length > 0 ? [{ id, title, items: kept }] : [];
}

function flavorLines(record: CardRecord, templates: TemplateIndex): string[] {
  const profile = ownValue(record, "culinaryProfile.flavorProfile", templates);
  return lines(profile).map((line) => line.replace(/^Primary: /, "Main notes: ").replace(/^Secondary: /, "Also: "));
}

function cookingLines(record: CardRecord, templates: TemplateIndex): string[] {
  const methods = [
    ...lines(readPath(record, "recommendedCookingMethods")),
    ...lines(readPath(record, "cookingMethods")),
    ...lines(ownValue(record, "culinaryProfile.cookingMethods", templates)),
  ].map((method) => label(method.replace(/-/g, " ")));
  return [...methods.length > 0 ? [`Methods: ${unique(methods).join(", ")}`] : [], ...lines(ownValue(record, "culinaryProfile.preparationTips", templates))];
}

function smokePointLines(record: CardRecord): string[] {
  const celsius: unknown = readPath(record, "smokePoint.celsius");
  const fahrenheit: unknown = readPath(record, "smokePoint.fahrenheit");
  return typeof celsius === "number" && typeof fahrenheit === "number" ? [`${fahrenheit}°F (${celsius}°C)`] : [];
}

function pairingSections(record: CardRecord, templates: TemplateIndex): CardSection[] {
  const pairing = ownValue(record, "pairingRecommendations", templates);
  if (Array.isArray(pairing)) return section("pairs", "Pairs well with", lines(pairing));
  const part = (key: string): string[] => (typeof pairing === "object" && pairing !== null ? lines(Reflect.get(pairing, key)) : []);
  return [
    ...section("pairs", "Pairs well with", part("complementary")),
    ...section("contrasts", "Contrast with", part("contrasting")),
    ...section("avoid", "Use sparingly with", part("toAvoid")),
  ];
}

const MACROS: ReadonlyArray<[string, string]> = [
  ["protein", "Protein"],
  ["carbs", "Carbohydrate"],
  ["fat", "Fat"],
  ["fiber", "Fibre"],
];

/** Calories and macros per serving, labelled with their source; none without one. */
function nutritionLines(record: CardRecord): string[] {
  const source: unknown = readPath(record, "nutritionalProfile.source");
  const serving: unknown = readPath(record, "nutritionalProfile.serving_size");
  const calories: unknown = readPath(record, "nutritionalProfile.calories");
  if (typeof source !== "string" || /default/i.test(source) || typeof calories !== "number") return [];
  const macros = MACROS.flatMap(([key, name]) => {
    const grams: unknown = readPath(record, `nutritionalProfile.macros.${key}`);
    return typeof grams === "number" ? [`${name}: ${grams} g`] : [];
  });
  return [...(typeof serving === "string" ? [`Per ${serving}`] : []), `Calories: ${calories}`, ...macros, `Source: ${source}`];
}

const ANIMAL_FOOD = /protein|meat|poultry|seafood|fish|egg/i;
const STATES_TEMPERATURE = /\d\s*(?:°\s*[CF]\b|degrees)/i;

/**
 * Meat, fish and egg cards print no uncited cooking temperature (some sit below
 * the safe minimum); those come only from the cited food guides.
 */
function safeLines(record: CardRecord, items: readonly string[]): string[] {
  const kind = `${String(readPath(record, "category") ?? "")} ${String(readPath(record, "subcategory") ?? "")}`;
  return ANIMAL_FOOD.test(kind) ? items.filter((line) => !STATES_TEMPERATURE.test(line)) : [...items];
}

export function cardSections(record: CardRecord, templates: TemplateIndex): CardSection[] {
  return [
    ...section("flavor", "Flavor", flavorLines(record, templates)),
    ...section("cooking", "Cooking", safeLines(record, cookingLines(record, templates))),
    ...section("uses", "Culinary uses", safeLines(record, lines(readPath(record, "culinaryApplications")))),
    ...section("preparation", "Preparing", safeLines(record, lines(readPath(record, "preparation")))),
    ...section("storage", "Storing", lines(ownValue(record, "storage", templates))),
    ...section("smoke-point", "Smoke point", smokePointLines(record)),
    ...pairingSections(record, templates),
    ...section("substitutions", "Substitutes", lines(readPath(record, "substitutions"))),
    ...section("varieties", "Varieties", lines(readPath(record, "varieties"))),
    ...section("nutrition", "Nutrition", nutritionLines(record)),
  ];
}
