/**
 * Historical Agent Culinary Scoring, Critique, Comment & Insight Builders.
 *
 * Produces elementally grounded recipe ratings (3.0–5.0 in 0.5 increments),
 * authentic catalog reflections, interactive feed comments, and chart-grounded
 * insight posts.
 *
 * @file src/lib/recipes/historicalAgentCopy.ts
 */

import { HISTORICAL_LORE_CRITIQUES } from "../../data/historicalCritiqueLore";
import {
  deterministicHashInt,
  recipeTextBlob,
  type DietaryProfile,
} from "./historicalAgentPersona";
import type { Recipe } from "../../types/recipe";

function dominantElementOfRecipe(recipe: Recipe): string {
  const entries = Object.entries(recipe.elementalProperties);
  let top = "Earth";
  let max = -1;
  for (const [el, val] of entries) {
    if (typeof val === "number" && val > max) {
      max = val;
      top = el;
    }
  }
  return top;
}

function elementsComplement(a: string, b: string): boolean {
  const pair = new Set([a.toLowerCase(), b.toLowerCase()]);
  return (
    (pair.has("fire") && pair.has("air")) ||
    (pair.has("water") && pair.has("earth"))
  );
}

/**
 * Compute an honest elemental- and dietary-affinity score (3.0–5.0 in 0.5 steps)
 * for a compliant catalog recipe evaluated by a historical thinker.
 */
export function computeAgentRecipeRating(params: {
  agentElement: string | null;
  recipe: Recipe;
  profile: DietaryProfile;
  slug: string;
}): number {
  const { agentElement, recipe, profile, slug } = params;
  const agentEl = (agentElement ?? "Earth").toLowerCase();
  const recipeEl = dominantElementOfRecipe(recipe).toLowerCase();

  let score = 3.0;
  if (agentEl === recipeEl) score += 1.0;
  else if (elementsComplement(agentEl, recipeEl)) score += 0.5;

  const blob = recipeTextBlob(recipe);
  const keywordHits = profile.favoriteKeywords.reduce(
    (acc, kw) => (blob.includes(kw) ? acc + 1 : acc),
    0,
  );
  if (keywordHits >= 2) score += 1.0;
  else if (keywordHits === 1) score += 0.5;

  const cuisineLower = (recipe.cuisine ?? "").toLowerCase();
  const culturalTokens = profile.culturalCuisine
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((w) => w.length >= 4);
  if (cuisineLower && culturalTokens.some((tok) => cuisineLower.includes(tok))) {
    score += 0.5;
  } else if (deterministicHashInt(`${slug}:${recipe.id}:harmony`) % 3 === 0) {
    score += 0.5;
  }

  return Math.min(5, Math.max(3, Math.round(score * 2) / 2));
}

/** Generate grounded culinary reflection commentary mentioning actual dish ingredients. */
export function buildCatalogCritiqueText(params: {
  agentSlug: string;
  agentName: string;
  dominantElement: string | null;
  profile: DietaryProfile;
  recipe: Recipe;
}): string {
  const { agentSlug, agentName, dominantElement, profile, recipe } = params;
  const customLore = HISTORICAL_LORE_CRITIQUES[agentSlug];
  const ingHighlights = recipe.ingredients
    .slice(0, 3)
    .map((i) => i.name.toLowerCase())
    .join(", ");

  if (customLore) {
    return `${customLore(recipe.name, recipe.cuisine)} The interplay of ${ingHighlights} exemplifies this balance at the table.`;
  }

  const element = dominantElement ?? "Earth";
  const firstSentence = `From the perspective of ${profile.culturalCuisine} tradition, "${recipe.name}" brings together ${ingHighlights} with ${element}-aligned clarity.`;
  const trimmedPhilosophy =
    profile.dietaryPhilosophy.length > 150
      ? `${profile.dietaryPhilosophy.slice(0, 147).trim()}...`
      : profile.dietaryPhilosophy;
  const secondSentence = `In keeping with ${agentName}'s culinary ethos — ${trimmedPhilosophy} — this preparation sustains focus and vitality without excess.`;
  return `${firstSentence} ${secondSentence}`;
}

function readMetaTitle(metadata: Record<string, unknown>, keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const val = metadata[key];
    if (typeof val === "string" && val.trim()) return val.trim();
  }
  return undefined;
}

/** Build an interactive comment from one historical agent replying to a feed post. */
export function buildHistoricalFeedComment(params: {
  commenterName: string;
  commenterElement: string | null;
  postActorName: string;
  eventType: string;
  metadata: Record<string, unknown>;
  profile: DietaryProfile;
}): string {
  const { commenterName, commenterElement, postActorName, eventType, metadata, profile } = params;
  const element = commenterElement ?? "Earth";
  const recipeName = readMetaTitle(metadata, ["recipeName", "title", "dishName"]);
  const insightTitle = readMetaTitle(metadata, ["insightTitle"]);

  if (eventType === "recipe_review" && recipeName) {
    return `Thoughtful notes on ${recipeName}, ${postActorName}. Through an ${element}-tempered palate from the ${profile.culturalCuisine} table, clean technique lets those natural essences sing without heaviness.`.slice(0, 950);
  }
  if (recipeName) {
    return `${recipeName} carries real vitality here, ${postActorName} — balanced seasoning and mindful timing serve both mind and digestion.`.slice(0, 950);
  }
  if (insightTitle) {
    return `Well observed on "${insightTitle}", ${postActorName}. As ${commenterName} holds at the hearth, nourishing habits begin with deliberate craft.`.slice(0, 950);
  }
  return `A worthy observation for the commons, ${postActorName} — aligning ingredient temperament with steady preparation rewards the whole table.`.slice(0, 950);
}

interface GeneratedInsight {
  title: string;
  content: string;
}

const INSIGHT_ANGLES: ReadonlyArray<(element: string, cuisine: string, philosophy: string) => GeneratedInsight> = [
  (element: string, cuisine: string, philosophy: string): GeneratedInsight => ({
    title: `${element} Balance at the ${cuisine} Hearth`,
    content: `Considering today's celestial temperament through ${element} clarity: ${philosophy} Choosing whole seasonal aromatics keeps the table vivid and unburdened.`,
  }),
  (element: string, cuisine: string, philosophy: string): GeneratedInsight => ({
    title: `Proportion and Temperament in ${cuisine} Fare`,
    content: `Even simple grains, roots, and gentle herbs transform when tempered with ${element} discipline. ${philosophy}`,
  }),
  (element: string, cuisine: string, philosophy: string): GeneratedInsight => ({
    title: `Culinary Notes on ${element} Nourishment`,
    content: `Between appetite and restraint lies true craft at the ${cuisine} table. ${philosophy} Let every preparation sustain clarity of spirit.`,
  }),
];

/** Build a chart-grounded culinary insight post for a historical agent. */
export function buildHistoricalFeedInsight(params: {
  slug: string;
  dominantElement: string | null;
  profile: DietaryProfile;
  hourBucket: number;
}): { insightTitle: string; insightContent: string; summary: string } {
  const { slug, dominantElement, profile, hourBucket } = params;
  const element = dominantElement ?? "Earth";
  const idx = deterministicHashInt(`${slug}:${hourBucket}:insight`) % INSIGHT_ANGLES.length;
  const factory = INSIGHT_ANGLES[idx] ?? INSIGHT_ANGLES[0];
  if (!factory) {
    const content = `Considering today's celestial temperament through ${element} clarity: ${profile.dietaryPhilosophy}`;
    return {
      insightTitle: `${element} Balance at the ${profile.culturalCuisine} Hearth`,
      insightContent: content,
      summary: content.slice(0, 175),
    };
  }
  const generated = factory(element, profile.culturalCuisine, profile.dietaryPhilosophy);
  return {
    insightTitle: generated.title,
    insightContent: generated.content,
    summary: generated.content.slice(0, 175),
  };
}
