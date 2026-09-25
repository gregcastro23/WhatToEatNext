/**
 * What a parsed intent keeps, and the chips that say so (plan §3, Phase 5).
 * Every chip carries its basis, shown with the results. Recipe intents (diet,
 * time, meal) filter recipes; ingredient intents (season, planet, quality,
 * category) filter ingredient cards; a diet filters both.
 */
import { titleCase } from "@/lib/ingredients/dossierView";
import { QUICK_MINUTES, type UnverifiableDiet } from "./intentLexicon";
import { stemToken } from "./text";
import type { QueryIntent, TimeIntent } from "./intent";
import type { SearchIndex } from "./searchIndex";
import type { IntentChip } from "./types";

export type Keep = (id: string) => boolean;

/** Recipes the intent keeps. Unknown verdicts and unstated times fail: a filter only keeps what it can vouch for. */
export function recipeFilter(index: SearchIndex, intent: QueryIntent): Keep {
  const { diet, time, meal } = intent;
  return (id) => {
    const recipe = index.recipes.get(id);
    if (!recipe) return false;
    if (diet !== null && index.recipeDiet.get(id)?.[diet] !== "compliant") return false;
    if (time !== null && (recipe.totalMinutes === null || recipe.totalMinutes > time.minutes)) return false;
    return meal === null || recipe.meals.includes(meal);
  };
}

/** Ingredient cards the intent keeps. A season list names the season; year-round cards would be in every one. */
export function ingredientFilter(index: SearchIndex, intent: QueryIntent): Keep {
  const { diet, season, planet, quality, category } = intent;
  return (key) => {
    const card = index.ingredients.get(key);
    if (!card) return false;
    if (diet !== null && card.diet[diet] !== "compliant") return false;
    if (season !== null && !card.seasons.includes(season.season)) return false;
    if (planet !== null && !card.rulingPlanets.includes(planet)) return false;
    if (quality !== null && !card.qualities.some((tag) => stemToken(tag.trim().toLowerCase()) === quality.stem)) return false;
    return category === null || category.categories.includes(card.category);
  };
}

function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}

function timeChip(time: TimeIntent): IntentChip {
  const label = time.quick ? `Quick · ${QUICK_MINUTES} min or less` : `${formatMinutes(time.minutes)} or less`;
  return { kind: "time", label, basis: "Prep plus cook as the recipe states it; recipes without a stated time are left out.", applied: true };
}

const DIET_BASIS = {
  vegan: "No ingredient, by its line or its catalog card, is an animal product (the ingredient classifier). Recipes with an unclear ingredient, such as stock, are left out.",
  vegetarian: "No ingredient, by its line or its catalog card, is meat or fish (the ingredient classifier). Recipes with an unclear ingredient, such as stock, are left out.",
};

const UNVERIFIED_LABEL: Record<UnverifiableDiet, string> = { "gluten-free": "Gluten-free", "dairy-free": "Dairy-free", "nut-free": "Nut-free" };

function recipeChips(intent: QueryIntent): IntentChip[] {
  const chips: IntentChip[] = [];
  if (intent.diet !== null) chips.push({ kind: "diet", label: titleCase(intent.diet), basis: DIET_BASIS[intent.diet], applied: true });
  for (const diet of intent.unverified) {
    const basis = `Allergen claims need the ingredient data to state them, and it does not, so results are not filtered for ${diet}.`;
    chips.push({ kind: "unverified", label: `${UNVERIFIED_LABEL[diet]} · not verified`, basis, applied: false });
  }
  if (intent.time !== null) chips.push(timeChip(intent.time));
  if (intent.meal !== null) chips.push({ kind: "meal", label: titleCase(intent.meal), basis: "The meal the recipe catalog files it under.", applied: true });
  return chips;
}

function ingredientChips(intent: QueryIntent): IntentChip[] {
  const chips: IntentChip[] = [];
  const { season, planet, quality, category } = intent;
  if (season !== null) {
    const label = season.now ? `In season · ${titleCase(season.season)}` : titleCase(season.season);
    chips.push({ kind: "season", label, basis: "Ingredients whose season names it; year-round ingredients are left out.", applied: true });
  }
  if (planet !== null) chips.push({ kind: "planet", label: `Ruled by ${planet}`, basis: "The ingredient's ruling planets.", applied: true });
  if (quality !== null) {
    const basis = `Ingredients the catalog tags ${quality.quality} (or ${quality.stem}).`;
    chips.push({ kind: "quality", label: titleCase(quality.quality), basis, applied: true });
  }
  if (category !== null) chips.push({ kind: "category", label: category.label, basis: "The ingredient's catalog category.", applied: true });
  return chips;
}

/** Chips in reading order; a region is a suggestion, not a filter. `cuisineName` labels its cuisine. */
export function intentChips(intent: QueryIntent, cuisineName: (key: string) => string): IntentChip[] {
  const chips = [...recipeChips(intent), ...ingredientChips(intent)];
  const { region } = intent;
  if (region !== null) {
    chips.push({ kind: "region", label: `${titleCase(region.phrase)} → ${cuisineName(region.cuisine)} cuisine`, basis: region.basis, applied: false });
  }
  return chips;
}
