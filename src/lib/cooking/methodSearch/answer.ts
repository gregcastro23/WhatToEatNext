/**
 * Query → answer (owner ruling 2026-11-25: cited guides first, then honest
 * general information).
 *
 *   1. A food with a guide: the guide, at the method asked for.
 *   2. Several guided foods fit the words: ask which.
 *   3. A recipe or an ingredient without a guide: say there is no tested guide,
 *      link what the words named, and give general method information.
 *   4. A method alone: that method, and the guided foods that use it.
 */
import type { FoodGuide, GuideMethodId } from "@/lib/cooking/foodGuides/schema";
import { containingRows } from "@/lib/search/omnibarParts";
import { rankEntities } from "@/lib/search/rank";
import type { SearchIndex } from "@/lib/search/searchIndex";
import { normalizeText } from "@/lib/search/text";
import type { SearchHit } from "@/lib/search/types";
import type { MethodAnswer, MethodSuggestion } from "@/lib/validation/methodSearchSchemas";
import { generalMethodFor } from "./generalMethod";
import { matchGuides } from "./matchGuides";
import { parseMethodQuery, type ParsedMethodQuery } from "./parseMethodQuery";
import { bestMethod, METHOD_LABELS, pickMethod } from "./pickMethod";

/** Recipe or ingredient hits this close (exact or whole words) are offered. */
const NAMED_TIER = 1;
const LINK_LIMIT = 5;
const SUGGESTION_LIMIT = 8;

export interface MethodSearchContext {
  guides: readonly FoodGuide[];
  index: SearchIndex;
}

type GeneralAnswer = Extract<MethodAnswer, { kind: "general" }>;

function suggestion(verb: string | null, guide: FoodGuide): MethodSuggestion {
  const query = verb === null ? guide.name.toLowerCase() : `${verb} ${guide.name.toLowerCase()}`;
  return { label: guide.name, query };
}

function guideAnswer(guide: FoodGuide, method: GuideMethodId | null): MethodAnswer | null {
  const picked = pickMethod(guide, method);
  return picked ? { kind: "guide", guide, selected: picked.method.id, note: picked.note } : null;
}

/** Guides whose methods include the requested one, else a sample of all. */
function guideSuggestions(guides: readonly FoodGuide[], method: GuideMethodId | null, verb: string | null): MethodSuggestion[] {
  const covering = method === null ? guides : guides.filter((guide) => guide.methods.some((candidate) => candidate.id === method));
  const listed = covering.length > 0 ? covering : guides;
  const [first] = listed;
  const askVerb = covering.length > 0 ? verb : null;
  return first ? listed.slice(0, SUGGESTION_LIMIT).map((guide) => suggestion(askVerb, guide)) : [];
}

function general(context: MethodSearchContext, parsed: ParsedMethodQuery, note: string, links: GeneralAnswer["links"]): GeneralAnswer {
  return {
    kind: "general",
    note,
    links,
    method: parsed.method === null ? null : generalMethodFor(parsed.method),
    suggestions: guideSuggestions(context.guides, parsed.method, parsed.methodWords),
  };
}

function hitsFor(index: SearchIndex, text: string, kind: SearchHit["entity"]["kind"]): SearchHit[] {
  return rankEntities(index, normalizeText(text)).filter((hit) => hit.entity.kind === kind && hit.tier <= NAMED_TIER);
}

/** Words that make an ingredient line a different food ("ground beef", "chicken stock", "rice vinegar"). */
const OTHER_FOOD = /\b(ground|minced?|broth|stock|sausages?|belly|shoulder|ribs?|brisket|liver|bouillon|sauce|paste|powder|starch|flour|noodles?|vinegar|wine|paper|wrappers?)\b/i;

function lineNames(line: string, guide: FoodGuide): boolean {
  if (OTHER_FOOD.test(line)) return false;
  const text = ` ${normalizeText(line).stemmed} `;
  return [guide.name, ...guide.aliases].some((name) => text.includes(` ${normalizeText(name).stemmed} `));
}

/** Guides whose own food a recipe line names; a broad catalog card is not enough. */
function guidesInRecipe(context: MethodSearchContext, recipeId: string): FoodGuide[] {
  const lines = context.index.recipes.get(recipeId)?.ingredientLines ?? [];
  return context.guides.filter((guide) => lines.some((line) => lineNames(line, guide)));
}

function recipeAnswer(context: MethodSearchContext, parsed: ParsedMethodQuery, hits: readonly SearchHit[]): MethodAnswer {
  const links = hits.slice(0, LINK_LIMIT).map((hit) => ({
    name: hit.entity.name,
    href: hit.entity.href,
    detail: context.index.recipes.get(hit.entity.key)?.cuisine ?? null,
  }));
  const [first] = hits;
  const parts = first ? guidesInRecipe(context, first.entity.key) : [];
  const base = general(context, parsed, "Here is the recipe. For its ingredients, these tested guides apply:", links);
  const note = parts.length > 0 ? base.note : "Here is the recipe. No tested ingredient guide covers it yet.";
  return { ...base, note, suggestions: parts.slice(0, SUGGESTION_LIMIT).map((guide) => suggestion(null, guide)) };
}

function ingredientAnswer(context: MethodSearchContext, parsed: ParsedMethodQuery, hit: SearchHit): MethodAnswer {
  const recipes = containingRows(context.index, hit.entity.key, LINK_LIMIT - 1).rows;
  const links = [
    { name: hit.entity.name, href: hit.entity.href, detail: "ingredient card" },
    ...recipes.map((row) => ({ name: row.name, href: row.href, detail: row.cuisine })),
  ];
  const how = parsed.method === null ? "cooking" : METHOD_LABELS[parsed.method];
  return general(context, parsed, `There is no tested guide for ${how} ${hit.entity.name.toLowerCase()} yet.`, links);
}

/** Recipes that only mention the food, once the cooking words are set aside. */
function mentionsAnswer(context: MethodSearchContext, parsed: ParsedMethodQuery, query: string, hits: readonly SearchHit[]): MethodAnswer {
  const found = recipeAnswer(context, parsed, hits);
  return { ...found, note: `No recipe is called “${query.trim()}”. These recipes mention ${parsed.food}:` };
}

/** A recipe or ingredient the words name, for a food no guide covers. */
function unguidedAnswer(context: MethodSearchContext, parsed: ParsedMethodQuery, query: string): MethodAnswer | null {
  const hasCookingWords = normalizeText(query).folded !== parsed.food;
  const named = hasCookingWords ? hitsFor(context.index, query, "recipe") : [];
  if (named.length > 0) return recipeAnswer(context, parsed, named);
  const [ingredient] = hitsFor(context.index, parsed.food, "ingredient");
  if (ingredient?.tier === 0) return ingredientAnswer(context, parsed, ingredient);
  const mentions = hitsFor(context.index, parsed.food, "recipe");
  if (mentions.length > 0) {
    return hasCookingWords ? mentionsAnswer(context, parsed, query, mentions) : recipeAnswer(context, parsed, mentions);
  }
  return ingredient ? ingredientAnswer(context, parsed, ingredient) : null;
}

/** The whole query is a recipe's own name ("fried rice", "smoked salmon salad"). */
function exactRecipes(context: MethodSearchContext, query: string): SearchHit[] {
  return rankEntities(context.index, normalizeText(query)).filter((hit) => hit.entity.kind === "recipe" && hit.tier === 0);
}

function foodAnswer(context: MethodSearchContext, parsed: ParsedMethodQuery, query: string): MethodAnswer | null {
  const matches = matchGuides(parsed.food, context.guides);
  const [only] = matches;
  if (matches.length === 1 && only) return guideAnswer(only, parsed.method);
  if (matches.length > 1) {
    return { kind: "choose", note: "Which one are you cooking?", choices: matches.map((guide) => suggestion(parsed.methodWords, guide)) };
  }
  return unguidedAnswer(context, parsed, query);
}

function methodOnlyAnswer(context: MethodSearchContext, parsed: ParsedMethodQuery, method: GuideMethodId): MethodAnswer {
  const covering = context.guides.filter((guide) => guide.methods.some((candidate) => candidate.id === method));
  const best = covering.filter((guide) => bestMethod(guide)?.id === method).length;
  const note =
    covering.length === 0
      ? `No tested food guide uses ${METHOD_LABELS[method]} yet.`
      : `${covering.length} tested guides include ${METHOD_LABELS[method]}${best > 0 ? `; for ${best} it is the recommended method` : ""}. Pick a food.`;
  return general(context, parsed, note, []);
}

/** Dish names whose cooking word is part of the name, not a request. */
const DISH_NAMES: ReadonlySet<string> = new Set(["fried rice", "baked beans"]);

export function answerMethodQuery(context: MethodSearchContext, query: string): MethodAnswer {
  const parsed = parseMethodQuery(query);
  const isDish = DISH_NAMES.has(normalizeText(query).folded);
  const named = isDish ? hitsFor(context.index, query, "recipe") : exactRecipes(context, query);
  if (named.length > 0 && matchGuides(query, context.guides).length === 0) return recipeAnswer(context, { ...parsed, method: null }, named);
  const answer = parsed.food === "" ? null : foodAnswer(context, parsed, query);
  if (answer) return answer;
  if (parsed.food === "" && parsed.method !== null) return methodOnlyAnswer(context, parsed, parsed.method);
  return general(context, parsed, "Nothing matched that. Try a food on its own, or one of these tested guides.", []);
}
