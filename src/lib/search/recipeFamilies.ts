/**
 * Which recipes are versions of one dish.
 *
 * The catalog stores no family key, so it is read from the name, with only
 * these rules (owner ruling 2026-11-25: group by dish name):
 *
 *   - accents, quotes, parentheticals and punctuation are ignored;
 *   - "authentic", "traditional", "classic" and "homemade" say nothing about
 *     which dish it is, and are dropped;
 *   - a diet word ("vegan", "gluten-free") marks a version, and becomes its label;
 *   - plural endings are ignored ("cookies" = "cookie");
 *   - a leading cuisine word ("greek baklava") is dropped only when the shorter
 *     name is itself a family, so "Greek Salad" never becomes "Salad".
 *
 * Any other word is part of the dish: "Egg Fried Rice" is not "Fried Rice".
 */

export interface FamilyName {
  /** The family key: "moussaka", "chocolate chip cookie". */
  key: string;
  /** What marks this version apart, as read from its name: "Vegan", "Shrimp Dumplings". */
  labels: readonly string[];
}

const FILLER_WORDS: ReadonlySet<string> = new Set(["authentic", "traditional", "classic", "homemade"]);

/** Diet phrases, longest first; each becomes a version label. */
const DIET_PHRASES: ReadonlyArray<{ words: readonly string[]; label: string }> = [
  { words: ["gluten", "free"], label: "Gluten-free" },
  { words: ["dairy", "free"], label: "Dairy-free" },
  { words: ["low", "carb"], label: "Low-carb" },
  { words: ["vegan"], label: "Vegan" },
  { words: ["vegetarian"], label: "Vegetarian" },
  { words: ["keto"], label: "Keto" },
];

const CUISINE_PREFIXES: readonly string[] = [
  "middle eastern",
  "african",
  "american",
  "chinese",
  "french",
  "greek",
  "indian",
  "italian",
  "japanese",
  "korean",
  "mexican",
  "russian",
  "thai",
  "vietnamese",
];

/** Plural and singular must meet: "cookies" and "cookie" both become "cooky". */
function singular(word: string): string {
  if (word.length > 4 && word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.length > 3 && word.endsWith("ie")) return `${word.slice(0, -2)}y`;
  const keepsS = word.endsWith("ss") || word.endsWith("us") || word.endsWith("is");
  return word.length > 3 && word.endsWith("s") && !keepsS ? word.slice(0, -1) : word;
}

function folded(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

function wordsOf(text: string): string[] {
  return folded(text)
    .replace(/['’"“”]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((word) => word !== "");
}

/** "(Shrimp Dumplings)" → "Shrimp Dumplings", as authored. */
function parentheticals(name: string): string[] {
  return [...name.matchAll(/\(([^()]*)\)/g)].flatMap((match) => {
    const inner = match[1]?.trim();
    return inner === undefined || inner === "" ? [] : [inner];
  });
}

function startsWithAt(words: readonly string[], phrase: readonly string[], at: number): boolean {
  return phrase.every((word, offset) => words[at + offset] === word);
}

/** Words with diet phrases lifted out, and the labels they became. */
function splitDiet(words: readonly string[]): { kept: string[]; labels: string[] } {
  const kept: string[] = [];
  const labels: string[] = [];
  let at = 0;
  while (at < words.length) {
    const diet = DIET_PHRASES.find((phrase) => startsWithAt(words, phrase.words, at));
    if (diet) labels.push(diet.label);
    else kept.push(words[at] ?? "");
    at += diet ? diet.words.length : 1;
  }
  return { kept, labels };
}

export function familyName(name: string): FamilyName {
  const bare = name.replace(/\([^()]*\)/g, " ");
  const { kept, labels } = splitDiet(wordsOf(bare));
  const dish = kept.filter((word) => !FILLER_WORDS.has(word)).map(singular);
  const key = dish.length > 0 ? dish.join(" ") : wordsOf(name).map(singular).join(" ");
  return { key, labels: [...labels, ...parentheticals(name)] };
}

/** The family key with a leading cuisine word removed, or null when it has none. */
function withoutCuisinePrefix(key: string): string | null {
  const prefix = CUISINE_PREFIXES.find((candidate) => key.startsWith(`${candidate} `));
  return prefix === undefined ? null : key.slice(prefix.length + 1);
}

/**
 * Family key per name. Resolved over the whole list at once, because the
 * cuisine-prefix rule depends on which other families exist.
 */
export function familyKeys(names: readonly string[]): string[] {
  const own = names.map((name) => familyName(name).key);
  const known = new Set(own);
  return own.map((key) => {
    const shorter = withoutCuisinePrefix(key);
    return shorter !== null && known.has(shorter) ? shorter : key;
  });
}

/** The live catalog stores "middle eastern" and "Greek" alike; show one casing. */
export function cuisineLabel(cuisine: string): string {
  return cuisine.replace(/(^|[\s-])(\p{Ll})/gu, (_, boundary: string, letter: string) => `${boundary}${letter.toUpperCase()}`);
}

/** "PAD THAI" → "Pad Thai"; names with any lower case are kept as authored. */
export function displayName(name: string): string {
  if (name !== name.toUpperCase()) return name;
  return name.toLowerCase().replace(/(^|[\s(/"-])(\p{Ll})/gu, (_, boundary: string, letter: string) => `${boundary}${letter.toUpperCase()}`);
}
