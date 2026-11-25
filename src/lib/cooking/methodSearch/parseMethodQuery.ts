/**
 * "baking bacon" → the method asked for (oven bake) and the food (bacon).
 *
 * Whole words only: "grilled" is grill, but "strawberries" is never "raw".
 * Longest phrase wins, so "deep fry" is not "fry". Words that only ask for help
 * ("how to cook", "best way to make") are dropped.
 */
import { GUIDE_METHOD_IDS, type GuideMethodId } from "@/lib/cooking/foodGuides/schema";
import { normalizeText } from "@/lib/search/text";

export const METHOD_PHRASES: Readonly<Record<GuideMethodId, readonly string[]>> = {
  oven_bake: ["oven bake", "oven baking", "oven baked", "in the oven", "in an oven", "oven", "bake", "baked", "baking"],
  roast: ["oven roast", "oven roasted", "oven roasting", "roast", "roasted", "roasting"],
  pan_fry: ["pan fry", "pan fried", "pan frying", "shallow fry", "shallow fried", "skillet", "stovetop", "stove top", "fry", "fried", "frying", "sear", "seared", "searing", "pan sear", "pan seared"],
  saute: ["saute", "sauteed", "sauteing"],
  stir_fry: ["stir fry", "stir fried", "stir frying", "wok"],
  deep_fry: ["deep fry", "deep fried", "deep frying"],
  air_fry: ["air fry", "air fried", "air frying", "air fryer", "airfryer"],
  microwave: ["microwave", "microwaved", "microwaving"],
  grill: ["grill", "grilled", "grilling", "barbecue", "barbeque", "bbq"],
  broil: ["broil", "broiled", "broiling"],
  boil: ["hard boil", "hard boiled", "soft boil", "soft boiled", "boil", "boiled", "boiling", "blanch", "blanched", "blanching"],
  simmer: ["simmer", "simmered", "simmering", "stovetop simmer"],
  steam: ["steam", "steamed", "steaming"],
  poach: ["poach", "poached", "poaching"],
  scramble: ["scramble", "scrambled", "scrambling"],
  braise: ["braise", "braised", "braising", "stew", "stewed", "stewing"],
  slow_cook: ["slow cook", "slow cooked", "slow cooking", "slow cooker", "crock pot", "crockpot"],
  pressure_cook: ["pressure cook", "pressure cooked", "pressure cooking", "pressure cooker", "instant pot", "instapot"],
  rice_cooker: ["rice cooker"],
  sous_vide: ["sous vide"],
  smoke: ["smoke", "smoked", "smoking", "smoker"],
};

/** Words that ask for help rather than name a food or a method. */
const HELP_PHRASES: readonly string[] = [
  "what is the best way to", "what s the best way to", "best way to", "best ways to", "how do i", "how do you", "how to",
  "how long to", "how long do i", "instructions for", "instructions", "tips for", "tips", "recipe for", "recipe", "method for",
  "best", "way", "cook", "cooked", "cooking", "make", "making", "prepare", "preparing", "a", "an", "the", "my", "some", "for", "in", "on",
];

interface Phrase {
  words: readonly string[];
  method: GuideMethodId | null;
}

const METHOD_LIST: Phrase[] = GUIDE_METHOD_IDS.flatMap((method) =>
  METHOD_PHRASES[method].map((phrase): Phrase => ({ words: normalizeText(phrase).tokens, method })),
);

const PHRASES: readonly Phrase[] = [
  ...METHOD_LIST,
  ...HELP_PHRASES.map((phrase): Phrase => ({ words: normalizeText(phrase).tokens, method: null })),
].sort((a, b) => b.words.length - a.words.length || Number(a.method === null) - Number(b.method === null));

function matchesAt(tokens: readonly string[], phrase: Phrase, at: number): boolean {
  return phrase.words.every((word, offset) => tokens[at + offset] === word);
}

export interface ParsedMethodQuery {
  /** The first method the query names, or null. */
  method: GuideMethodId | null;
  /** The words that named it ("baking"), for the reply. */
  methodWords: string | null;
  /** What is left: the food or dish. */
  food: string;
}

export function parseMethodQuery(query: string): ParsedMethodQuery {
  const { tokens } = normalizeText(query);
  const food: string[] = [];
  const found: Phrase[] = [];
  let at = 0;
  while (at < tokens.length) {
    const phrase = PHRASES.find((candidate) => matchesAt(tokens, candidate, at));
    if (phrase) found.push(phrase);
    else food.push(tokens[at] ?? "");
    at += phrase ? phrase.words.length : 1;
  }
  const named = found.find((phrase) => phrase.method !== null);
  return { method: named?.method ?? null, methodWords: named?.words.join(" ") ?? null, food: food.join(" ") };
}
