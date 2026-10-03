/**
 * Query → intent (plan §3, Phase 5): a diet, a time, a meal, a season, a
 * planet, a thermal quality, a category, a region, and the ingredients the
 * query names. Intent words leave the text the name search runs on; named
 * ingredients stay in it.
 *
 * Segmentation is longest-first, so a catalog name beats the intent word it
 * contains: "summer savory" is an herb, not a season.
 */
import type { Season } from "@/constants/seasons";
import { INTENT_RULES, type RuleKind } from "./intentRules";
import { timeAt, type TimeIntent } from "./intentTime";
import { stemToken } from "./text";
import type { DietIntent, MealIntent, QualityIntent, UnverifiableDiet } from "./intentLexicon";

export type { TimeIntent } from "./intentTime";

export interface QueryIntent {
  diet: DietIntent | null;
  unverified: UnverifiableDiet[];
  time: TimeIntent | null;
  meal: MealIntent | null;
  /** `now`: asked for "in season", resolved against the request date. */
  season: { season: Season; now: boolean } | null;
  planet: string | null;
  quality: { quality: QualityIntent; stem: string } | null;
  category: { label: string; categories: readonly string[] } | null;
  region: { phrase: string; cuisine: string; basis: string } | null;
  /** Catalog keys of the ingredients named, in query order, once each. */
  ingredients: string[];
  /** The query without its intent words. */
  text: string;
}

/** Folded words → catalog key, for exact names only (name, key, alias, synonym). */
export type ExactIngredient = (text: string) => string | null;

type Apply = (intent: QueryIntent, today: Season) => void;

type Span =
  | { kind: "ingredient"; length: number; key: string }
  | { kind: RuleKind; length: number; apply: Apply }
  | { kind: "text"; length: number };

const MAX_INGREDIENT_WORDS = 4;

function lexiconSpan(tokens: readonly string[], stems: readonly string[], at: number): Span | null {
  let best: Span | null = null;
  for (const rule of INTENT_RULES) {
    const source = rule.asTyped ? tokens : stems;
    const fits = rule.words.every((word, i) => source[at + i] === word);
    if (fits && (best === null || rule.words.length > best.length)) best = { kind: rule.kind, length: rule.words.length, apply: rule.apply };
  }
  const time = timeAt(tokens, stems, at);
  if (time && (best === null || time.length > best.length)) {
    const { intent: found } = time;
    best = { kind: "intent", length: time.length, apply: (intent): void => { intent.time ??= found; } };
  }
  return best;
}

function ingredientSpan(tokens: readonly string[], at: number, exact: ExactIngredient): Span | null {
  for (let length = Math.min(MAX_INGREDIENT_WORDS, tokens.length - at); length > 0; length--) {
    const key = exact(tokens.slice(at, at + length).join(" "));
    if (key !== null) return { kind: "ingredient", length, key };
  }
  return null;
}

/** The longest span at `at`; a catalog name wins a tie with an intent word. */
function spanAt(tokens: readonly string[], stems: readonly string[], at: number, exact: ExactIngredient): Span {
  const lexicon = lexiconSpan(tokens, stems, at);
  const ingredient = ingredientSpan(tokens, at, exact);
  if (ingredient && (lexicon === null || ingredient.length >= lexicon.length)) return ingredient;
  return lexicon ?? { kind: "text", length: 1 };
}

function emptyIntent(): QueryIntent {
  return { diet: null, unverified: [], time: null, meal: null, season: null, planet: null, quality: null, category: null, region: null, ingredients: [], text: "" };
}

/** An ingredient-list intent: season, planet or quality (a category only narrows one of these). */
export function hasIngredientIntent(intent: QueryIntent): boolean {
  return intent.season !== null || intent.planet !== null || intent.quality !== null;
}

/** A recipe-list intent: diet, time or meal. */
export function hasRecipeIntent(intent: QueryIntent): boolean {
  return intent.diet !== null || intent.time !== null || intent.meal !== null;
}

/** True when the query asked for anything beyond a plain name search. */
export function hasIntent(intent: QueryIntent): boolean {
  return (
    hasRecipeIntent(intent) || hasIngredientIntent(intent) || intent.unverified.length > 0 || intent.region !== null || intent.ingredients.length > 1
  );
}

/** Whether a span's words leave the text; categories, filler and connectors depend on the rest. */
function dropped(span: Span, intent: QueryIntent): boolean {
  if (span.kind === "intent") return true;
  if (span.kind === "category") return hasIngredientIntent(intent);
  if (span.kind === "connector") return intent.ingredients.length > 1;
  return span.kind === "filler" && hasIntent(intent);
}

/**
 * Parse folded tokens. Conditional words: a category counts only beside an
 * ingredient intent, filler only beside any intent, and a connector only
 * between two named ingredients; otherwise each stays in the text. A region
 * is a suggestion and stays in the text too.
 */
export function parseIntent(tokens: readonly string[], exact: ExactIngredient, today: Season): QueryIntent {
  const stems = tokens.map(stemToken);
  const intent = emptyIntent();
  const spans: Array<{ span: Span; words: string[] }> = [];
  for (let at = 0; at < tokens.length; ) {
    const span = spanAt(tokens, stems, at, exact);
    spans.push({ span, words: tokens.slice(at, at + span.length) });
    if (span.kind === "ingredient" && !intent.ingredients.includes(span.key)) intent.ingredients.push(span.key);
    if (span.kind === "intent" || span.kind === "region") span.apply(intent, today);
    at += span.length;
  }
  if (hasIngredientIntent(intent)) {
    for (const { span } of spans) if (span.kind === "category") span.apply(intent, today);
  }
  intent.text = spans
    .filter(({ span }) => !dropped(span, intent))
    .flatMap(({ words }) => words)
    .join(" ");
  return intent;
}

