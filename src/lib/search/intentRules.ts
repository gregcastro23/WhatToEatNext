/**
 * The intent lexicon as matching rules: each phrase stemmed once, with what
 * it sets on the parsed intent. Built at module load.
 */
import type { Season } from "@/constants/seasons";
import {
  CATEGORY_PHRASES,
  CONNECTOR_WORDS,
  DIET_PHRASES,
  FILLER_WORDS,
  MEAL_PHRASES,
  PLANETS,
  QUALITY_PHRASES,
  REGIONAL_CUISINES,
  SEASON_PHRASES,
  UNVERIFIABLE_PHRASES,
} from "./intentLexicon";
import { stemToken } from "./text";
import type { QueryIntent } from "./intent";

/**
 * intent: always leaves the text. category: narrows an ingredient intent.
 * filler, connector: dropped only in context. region: a suggestion; stays.
 */
export type RuleKind = "intent" | "category" | "filler" | "connector" | "region";

export interface IntentRule {
  kind: RuleKind;
  /** The phrase's words: stemmed, or as typed when `asTyped`. */
  words: readonly string[];
  /** Match the folded words, not their stems ("warming" must not take "warm"). */
  asTyped: boolean;
  apply: (intent: QueryIntent, today: Season) => void;
}

function rule(kind: RuleKind, phrase: string, apply: IntentRule["apply"], asTyped = false): IntentRule {
  const words = phrase.split(" ");
  return { kind, words: asTyped ? words : words.map(stemToken), asTyped, apply };
}

function recipeRules(): IntentRule[] {
  return [
    // Vegan is the stricter preference, so it wins when both are asked.
    ...DIET_PHRASES.map(({ phrase, diet }) =>
      rule("intent", phrase, (intent) => {
        intent.diet = intent.diet === "vegan" ? "vegan" : diet;
      }),
    ),
    ...UNVERIFIABLE_PHRASES.map(({ phrase, diet }) =>
      rule("intent", phrase, (intent) => {
        if (!intent.unverified.includes(diet)) intent.unverified.push(diet);
      }),
    ),
    ...MEAL_PHRASES.map(({ phrase, meal }) =>
      rule("intent", phrase, (intent) => {
        intent.meal ??= meal;
      }),
    ),
  ];
}

function ingredientRules(): IntentRule[] {
  return [
    ...SEASON_PHRASES.map(({ phrase, season }) =>
      rule("intent", phrase, (intent, today) => {
        intent.season ??= season === "now" ? { season: today, now: true } : { season, now: false };
      }),
    ),
    ...PLANETS.map((planet) =>
      rule("intent", planet.toLowerCase(), (intent) => {
        intent.planet ??= planet;
      }),
    ),
    ...QUALITY_PHRASES.map(({ phrase, quality, stem }) =>
      rule(
        "intent",
        phrase,
        (intent) => {
          intent.quality ??= { quality, stem };
        },
        true,
      ),
    ),
    ...CATEGORY_PHRASES.map(({ phrase, label, categories }) =>
      rule("category", phrase, (intent) => {
        intent.category ??= { label, categories };
      }),
    ),
  ];
}

function wordRules(): IntentRule[] {
  const none = (): void => undefined;
  return [
    ...FILLER_WORDS.map((word) => rule("filler", word, none)),
    ...CONNECTOR_WORDS.map((word) => rule("connector", word, none)),
    ...REGIONAL_CUISINES.map(({ phrase, cuisine, basis }) =>
      rule("region", phrase, (intent) => {
        intent.region ??= { phrase, cuisine, basis };
      }),
    ),
  ];
}

export const INTENT_RULES: readonly IntentRule[] = [...recipeRules(), ...ingredientRules(), ...wordRules()];
