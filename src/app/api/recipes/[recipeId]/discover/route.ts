import { NextResponse } from "next/server";
import { UnifiedRecipeService } from "@/services/UnifiedRecipeService";
import type { Recipe } from "@/types/recipe";

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

/** Slim a Recipe to the fields the discovery carousel needs. */
function slim(r: Recipe) {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    cuisine: r.cuisine,
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

export async function GET(_req: Request, props: { params: Promise<{ recipeId: string }> }) {
  try {
    const { recipeId } = await props.params;
    const service = UnifiedRecipeService.getInstance();
    const recipe = await service.getRecipeById(recipeId);
    if (!recipe) {
      return NextResponse.json({ success: false, error: "Recipe not found" }, { status: 404 });
    }

    const all = await service.getAllRecipes();
    const others = all.filter((r) => r.id !== recipe.id && r.name !== recipe.name);

    const baseElemental = getElemental(recipe);
    const baseESMS = getESMS(recipe);

    const similarElemental = baseElemental
      ? others
          .map((r) => {
            const v = getElemental(r);
            return v ? { r, d: euclideanDistance(baseElemental, v) } : null;
          })
          .filter((x): x is { r: Recipe; d: number } => x !== null)
          .sort((a, b) => a.d - b.d)
          .slice(0, 6)
          .map(({ r }) => slim(r))
      : [];

    const similarAlchemical = baseESMS
      ? others
          .map((r) => {
            const v = getESMS(r);
            return v ? { r, s: cosineSimilarity(baseESMS, v) } : null;
          })
          .filter((x): x is { r: Recipe; s: number } => x !== null)
          .sort((a, b) => b.s - a.s)
          .slice(0, 6)
          .map(({ r }) => slim(r))
      : [];

    const sameCuisine = recipe.cuisine
      ? others
          .filter((r) => r.cuisine && r.cuisine.toLowerCase() === recipe.cuisine!.toLowerCase())
          .sort((a, b) => (b.monicaScore ?? 0) - (a.monicaScore ?? 0))
          .slice(0, 3)
          .map((r) => slim(r))
      : [];

    return NextResponse.json({
      success: true,
      similarElemental,
      similarAlchemical,
      sameCuisine,
    });
  } catch (err) {
    console.error("[discover] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to compute discovery" },
      { status: 500 },
    );
  }
}
