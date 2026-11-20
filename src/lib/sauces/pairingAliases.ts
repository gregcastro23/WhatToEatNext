/**
 * Cross-cuisine pairing alias resolution and dietary inference.
 *
 * Different cuisine files use varying key vocabularies (e.g. `poultry` vs
 * `chicken`, `greens` vs `leafy`, `stir_fry` vs `sautéing`, `westCoast` vs
 * `california`, camelCase `newEngland` vs `.toLowerCase()`). This module
 * reconciles them without duplicating per-cuisine data.
 *
 * @file src/lib/sauces/pairingAliases.ts
 */

export function foldKey(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "");
}

const PROTEIN_ALIASES: Readonly<Record<string, readonly string[]>> = {
  beef: ["beef", "redmeat", "game"],
  pork: ["pork", "bacon", "ham"],
  chicken: ["chicken", "poultry", "turkey"],
  poultry: ["poultry", "chicken", "turkey"],
  fish: ["fish", "seafood"],
  seafood: ["seafood", "fish", "shellfish"],
  lamb: ["lamb", "goat"],
  goat: ["goat", "lamb"],
  eggs: ["eggs", "egg", "vegetarian"],
  tofu: ["tofu", "vegetarian", "vegetable", "vegetables", "legumes"],
  vegetarian: ["vegetarian", "vegetable", "vegetables", "legumes", "paneer", "tofu"],
  vegetables: ["vegetables", "vegetable", "vegetarian", "legumes"],
  legumes: ["legumes", "vegetarian", "vegetable", "vegetables"],
  game: ["game", "lamb", "beef"],
};

const VEGETABLE_ALIASES: Readonly<Record<string, readonly string[]>> = {
  leafy: ["leafy", "greens", "herbs", "freshcrunch"],
  greens: ["greens", "leafy", "herbs"],
  root: ["root", "roots", "potato", "potatoes"],
  roots: ["roots", "root", "potato", "potatoes"],
  nightshades: ["nightshades", "eggplant", "fruiting"],
  squash: ["squash", "gourds", "zucchini", "okra"],
  mushroom: ["mushroom", "mushrooms"],
  mushrooms: ["mushrooms", "mushroom"],
  seaweed: ["seaweed", "greens"],
  cruciferous: ["cruciferous", "cauliflower", "asparagus", "sprouts"],
  legumes: ["legumes", "legume", "beans", "corn", "grain"],
  alliums: ["alliums", "cactus", "herbs"],
  fermented: ["fermented", "pickled", "preserved"],
};

const METHOD_ALIASES: Readonly<Record<string, readonly string[]>> = {
  grilling: ["grilling", "tandoor", "smoking"],
  roasting: ["roasting", "tandoor", "baking"],
  sauteing: ["sauteing", "stirfrying", "stirfry", "panfrying", "frying"],
  stirfrying: ["stirfrying", "stirfry", "panfrying", "sauteing", "frying"],
  braising: ["braising", "stewing", "currying", "curry"],
  steaming: ["steaming", "poaching"],
  frying: ["frying", "panfrying", "deepfrying", "stirfrying", "stirfry"],
  deepfrying: ["deepfrying", "frying", "panfrying"],
  baking: ["baking", "roasting"],
  simmering: ["simmering", "boiling", "stewing", "currying", "curry", "poaching"],
  raw: ["raw", "salads"],
};

const REGION_ALIASES: Readonly<Record<string, readonly string[]>> = {
  sicilian: ["sicilian", "insular", "southern"],
  tuscan: ["tuscan", "central"],
  emilian: ["emilian", "northern"],
  neapolitan: ["neapolitan", "southern"],
  california: ["california", "westcoast"],
  southernafrican: ["southernafrican", "southafrican"],
  levantine: ["levantine", "levant"],
  northafrican: ["northafrican", "northafrica"],
  punjabi: ["punjabi", "north", "northern"],
  bengali: ["bengali", "east", "eastern"],
  southindian: ["southindian", "south", "southern"],
  gujarati: ["gujarati", "west", "western"],
  gyeongsang: ["gyeongsang", "busan"],
  hunan: ["hunan", "sichuan"],
  jiangsu: ["jiangsu", "shanghainese"],
  shandong: ["shandong", "northern"],
  northern: ["northern", "north"],
  southern: ["southern", "south"],
  northeastern: ["northeastern", "isaan"],
  royalthaicuisine: ["royalthaicuisine", "central"],
  mekongdelta: ["mekongdelta", "mekong"],
  highlandvietnamese: ["highlandvietnamese", "central", "northern"],
};

export function lookupPairingValues(
  map: Readonly<Record<string, readonly string[] | undefined>> | undefined,
  queryKey: string,
  aliasTable?: Readonly<Record<string, readonly string[]>>,
): string[] {
  if (!map || !queryKey) return [];
  const foldedMap = new Map<string, readonly string[]>();
  for (const [k, v] of Object.entries(map)) {
    if (Array.isArray(v)) foldedMap.set(foldKey(k), v);
  }

  const foldedQuery = foldKey(queryKey);
  const candidates = aliasTable?.[foldedQuery] ?? [foldedQuery];
  const collected = new Set<string>();
  for (const candidate of candidates) {
    const direct = foldedMap.get(candidate);
    if (direct) direct.forEach((item) => collected.add(item));
  }
  if (collected.size > 0) return Array.from(collected);

  // Word-boundary and longest-prefix fallback for descriptive labels like "Northern Thai (Lanna)"
  const queryWords = queryKey
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 3);

  const sortedEntries = Array.from(foldedMap.entries()).sort(
    ([a], [b]) => b.length - a.length,
  );
  for (const [mapKey, values] of sortedEntries) {
    if (queryWords.includes(mapKey)) {
      values.forEach((item) => collected.add(item));
      return Array.from(collected);
    }
  }
  for (const [mapKey, values] of sortedEntries) {
    if (mapKey.length >= 4 && (foldedQuery.startsWith(mapKey) || mapKey.startsWith(foldedQuery))) {
      values.forEach((item) => collected.add(item));
      return Array.from(collected);
    }
  }
  return Array.from(collected);
}

export function lookupProteinPairing(
  map: Readonly<Record<string, readonly string[] | undefined>> | undefined,
  protein: string,
): string[] {
  return lookupPairingValues(map, protein, PROTEIN_ALIASES);
}

export function lookupVegetablePairing(
  map: Readonly<Record<string, readonly string[] | undefined>> | undefined,
  vegetable: string,
): string[] {
  return lookupPairingValues(map, vegetable, VEGETABLE_ALIASES);
}

export function lookupMethodPairing(
  map: Readonly<Record<string, readonly string[] | undefined>> | undefined,
  method: string,
): string[] {
  return lookupPairingValues(map, method, METHOD_ALIASES);
}

export function lookupRegionPairing(
  map: Readonly<Record<string, readonly string[] | undefined>> | undefined,
  region: string,
): string[] {
  return lookupPairingValues(map, region, REGION_ALIASES);
}

const MEAT_RE =
  /\b(beef|pork|lamb|veal|chicken|turkey|duck|goose|game|bacon|guanciale|pancetta|prosciutto|ham|sausage|meat|lard|tallow|bone broth|chicken stock|beef stock|veal stock|brown stock|gelatin)\b/;
const SEAFOOD_RE =
  /\b(fish|anchovy|anchovies|shrimp|prawn|crab|lobster|oyster|clam|mussel|squid|octopus|bonito|dashi|katsuobushi|fish sauce|shrimp paste)\b/;
const DAIRY_RE =
  /\b(milk|butter|clarified butter|ghee|cream|cheese|parmesan|parmigiano|pecorino|gorgonzola|yogurt|paneer|curd|buttermilk|whey)\b/;
const EGG_HONEY_RE = /\b(egg|eggs|egg yolk|yolks|mayonnaise|honey)\b/;
const GLUTEN_RE = /\b(flour|wheat|barley|rye|roux|soy sauce|shoyu|hoisin|oyster sauce|breadcrumbs|malt|seitan)\b/;
const SODIUM_RE =
  /\b(soy sauce|shoyu|tamari|fish sauce|anchovy|anchovies|miso|doenjang|gochujang|guanciale|pancetta|bacon|cured|brine|bouillon|salted)\b/;

function stripPlantSubstitutes(text: string): string {
  return text
    .replace(/\b(coconut|almond|oat|soy|rice|cashew)\s+(milk|cream)\b/g, " ")
    .replace(/\b(peanut|almond|cashew|cocoa|shea|apple)\s+butter\b/g, " ")
    .replace(/\bbutternut\b/g, " ")
    .replace(/\b(rice|corn|chickpea|almond|tapioca|garbanzo|coconut|oat|potato)\s+flour\b/g, " ");
}

/**
 * Fallback dietary compatibility check for sauces omitted from a cuisine's
 * brief `byDietary` list. Returns `true` when no conflicting ingredient cues appear.
 */
export function inferDietaryCompatibility(diet: string, ingredientsText: string): boolean {
  const cleaned = stripPlantSubstitutes(ingredientsText.toLowerCase());
  switch (foldKey(diet)) {
    case "vegetarian":
      return !MEAT_RE.test(cleaned) && !SEAFOOD_RE.test(cleaned);
    case "vegan":
      return (
        !MEAT_RE.test(cleaned) &&
        !SEAFOOD_RE.test(cleaned) &&
        !DAIRY_RE.test(cleaned) &&
        !EGG_HONEY_RE.test(cleaned)
      );
    case "dairyfree":
      return !DAIRY_RE.test(cleaned);
    case "glutenfree":
      return !GLUTEN_RE.test(cleaned);
    case "lowsodium":
      return !SODIUM_RE.test(cleaned);
    default:
      return true;
  }
}
