/**
 * GET /api/recipes/[recipeId]/discover — three "Discover More" lenses.
 *
 * Computed over the static catalog: it carries the ESMS and Monica scores the
 * live rows lack. Recipe pages are keyed by live ids, so a live id is read
 * through its static twin, and each result links to its canonical page.
 * [MEASURED 2026-09-25, production] this route 404'd for every live id, so
 * the section rendered on no live recipe page.
 */
import { NextResponse } from "next/server";
import { _logger } from "@/lib/logger";
import { loadStaticTwinBridge, withAuthoredFactsAll, type StaticTwinBridge } from "@/lib/recipes/recipeRefResolver";
import type { Recipe } from "@/types/recipe";
import { publicCuisine } from "@/utils/internalCuisineCodes";

export const dynamic = "force-dynamic";

interface ElementalVec {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
}

interface ESMSVec {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}

function getElemental(r: Recipe): ElementalVec | null {
  const e = r.elementalProperties;
  if (!e) return null;
  const v = {
    Fire: e.Fire ?? 0,
    Water: e.Water ?? 0,
    Earth: e.Earth ?? 0,
    Air: e.Air ?? 0,
  };
  if (v.Fire === 0 && v.Water === 0 && v.Earth === 0 && v.Air === 0) return null;
  return v;
}

function getESMS(r: Recipe): ESMSVec | null {
  const v = {
    spirit: r.spirit ?? 0,
    essence: r.essence ?? 0,
    matter: r.matter ?? 0,
    substance: r.substance ?? 0,
  };
  if (v.spirit === 0 && v.essence === 0 && v.matter === 0 && v.substance === 0) return null;
  return v;
}

function euclideanDistance(a: ElementalVec, b: ElementalVec): number {
  return Math.sqrt(
    (a.Fire - b.Fire) ** 2 +
    (a.Water - b.Water) ** 2 +
    (a.Earth - b.Earth) ** 2 +
    (a.Air - b.Air) ** 2,
  );
}

function cosineSimilarity(a: ESMSVec, b: ESMSVec): number {
  const dot = a.spirit * b.spirit + a.essence * b.essence + a.matter * b.matter + a.substance * b.substance;
  const magA = Math.sqrt(a.spirit ** 2 + a.essence ** 2 + a.matter ** 2 + a.substance ** 2);
  const magB = Math.sqrt(b.spirit ** 2 + b.essence ** 2 + b.matter ** 2 + b.substance ** 2);
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

function byElementalDistance(base: Recipe, others: readonly Recipe[]): Recipe[] {
  const target = getElemental(base);
  if (!target) return [];
  return others
    .flatMap((r) => {
      const v = getElemental(r);
      return v ? [{ r, d: euclideanDistance(target, v) }] : [];
    })
    .sort((a, b) => a.d - b.d)
    .map(({ r }) => r);
}

function byAlchemicalSimilarity(base: Recipe, others: readonly Recipe[]): Recipe[] {
  const target = getESMS(base);
  if (!target) return [];
  return others
    .flatMap((r) => {
      const v = getESMS(r);
      return v ? [{ r, s: cosineSimilarity(target, v) }] : [];
    })
    .sort((a, b) => b.s - a.s)
    .map(({ r }) => r);
}

/** An internal archive code (HSCA) is not a tradition, so it has no lens. */
function bySameCuisine(base: Recipe, others: readonly Recipe[]): Recipe[] {
  const cuisine = publicCuisine(base.cuisine)?.toLowerCase();
  if (cuisine === undefined) return [];
  return others
    .filter((r) => publicCuisine(r.cuisine)?.toLowerCase() === cuisine)
    .sort((a, b) => (b.monicaScore ?? 0) - (a.monicaScore ?? 0));
}

/** The first `n` recipes with distinct pages, never the page itself. */
function topDistinct(ranked: readonly Recipe[], n: number, bridge: StaticTwinBridge, selfId: string): Recipe[] {
  const seen = new Set([selfId]);
  const top: Recipe[] = [];
  for (const recipe of ranked) {
    if (top.length === n) break;
    const id = bridge.canonicalIdOf(String(recipe.id));
    if (seen.has(id)) continue;
    seen.add(id);
    top.push(recipe);
  }
  return top;
}

type CarriedField =
  | "description" | "elementalProperties" | "spirit" | "essence" | "matter" | "substance"
  | "monicaScore" | "monicaScoreLabel" | "prepTime" | "cookTime" | "mealType" | "season"
  | "isVegetarian" | "isVegan" | "isGlutenFree";

/** Carried fields may be undefined here; JSON drops them. */
type DiscoveryItem = { id: string; name: string; cuisine: string | undefined } & {
  [K in CarriedField]: Recipe[K] | undefined;
};

/** Slim a Recipe to the fields the discovery carousel needs, linked to its canonical page. */
function slim(r: Recipe, id: string): DiscoveryItem {
  return {
    id,
    name: r.name,
    description: r.description,
    cuisine: publicCuisine(r.cuisine),
    elementalProperties: r.elementalProperties,
    spirit: r.spirit,
    essence: r.essence,
    matter: r.matter,
    substance: r.substance,
    monicaScore: r.monicaScore,
    monicaScoreLabel: r.monicaScoreLabel,
    prepTime: r.prepTime,
    cookTime: r.cookTime,
    mealType: r.mealType,
    season: r.season,
    isVegetarian: r.isVegetarian,
    isVegan: r.isVegan,
    isGlutenFree: r.isGlutenFree,
  };
}

/** Authored times and meal only (the HSCA fill-in 15 is not a time). */
async function present(recipes: Recipe[], bridge: StaticTwinBridge): Promise<DiscoveryItem[]> {
  const shown = await withAuthoredFactsAll(recipes);
  return shown.map((r) => slim(r, bridge.canonicalIdOf(String(r.id))));
}

export async function GET(_req: Request, props: { params: Promise<{ recipeId: string }> }): Promise<NextResponse> {
  try {
    const { recipeId } = await props.params;
    const bridge = await loadStaticTwinBridge();
    const recipe = bridge.staticRecipeFor(recipeId);
    if (!recipe) {
      return NextResponse.json({ success: false, error: "Recipe not found" }, { status: 404 });
    }

    const selfId = bridge.canonicalIdOf(String(recipe.id));
    const others = bridge.staticRecipes.filter((r) => r.id !== recipe.id && r.name !== recipe.name);
    const top = (ranked: Recipe[], n: number): Recipe[] => topDistinct(ranked, n, bridge, selfId);
    const [similarElemental, similarAlchemical, sameCuisine] = await Promise.all([
      present(top(byElementalDistance(recipe, others), 6), bridge),
      present(top(byAlchemicalSimilarity(recipe, others), 6), bridge),
      present(top(bySameCuisine(recipe, others), 3), bridge),
    ]);

    return NextResponse.json({ success: true, similarElemental, similarAlchemical, sameCuisine });
  } catch (err) {
    _logger.error("[discover] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to compute discovery" },
      { status: 500 },
    );
  }
}
