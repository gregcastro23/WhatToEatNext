/**
 * GET/POST /api/recipes
 * Returns recipe catalog with optional filtering by element, cuisine, or search query.
 */
import { NextResponse } from "next/server";
import type { Recipe } from "@/types/recipe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const element = url.searchParams.get("element");
    const cuisine = url.searchParams.get("cuisine");
    const search = url.searchParams.get("q") || url.searchParams.get("search");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20", 10), 50);
    const offset = parseInt(url.searchParams.get("offset") || "0", 10);

    try {
      const { LocalRecipeService } = await import("@/services/LocalRecipeService");

      // Use the LocalRecipeService to fetch perfectly mapped recipes.
      let recipes: Recipe[] = [];
      if (cuisine) {
        recipes = await LocalRecipeService.getRecipesByCuisine(cuisine);
      } else if (search) {
        recipes = await LocalRecipeService.searchRecipes(search);
      } else {
        recipes = await LocalRecipeService.getAllRecipes();
      }

      if (element) {
        const lowerElement = element.toLowerCase();
        recipes = recipes.filter((recipe) => {
          const ep = recipe.elementalProperties;
          if (!ep) return false;
          let dom = "";
          let max = -1;
          for (const k of ["Fire", "Water", "Earth", "Air"]) {
            if (typeof ep[k] === "number" && ep[k] > max) {
              max = ep[k];
              dom = k.toLowerCase();
            }
          }
          return dom.includes(lowerElement);
        });
      }

      const total = recipes.length;
      const slicedRecipes = recipes.slice(offset, offset + limit);

      return NextResponse.json({
        success: true,
        recipes: slicedRecipes,
        total,
        limit,
        offset,
      });
    } catch (apiError) {
      console.warn("[recipes] backend service unavailable:", apiError);
      return NextResponse.json({
        success: true,
        recipes: [],
        total: 0,
        limit,
        offset,
        note: "Recipe database temporarily unavailable",
      });
    }
  } catch (error) {
    console.error("[recipes] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch recipes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Allow POST with body params as an alternative to GET query params
  try {
    const body = await request.json().catch(() => ({}));
    const { element, cuisine, search, limit = 20, offset = 0 } = body;
    const params = new URLSearchParams();
    if (element) params.set("element", element);
    if (cuisine) params.set("cuisine", cuisine);
    if (search) params.set("q", search);
    params.set("limit", String(limit));
    params.set("offset", String(offset));

    const syntheticReq = new Request(`${new URL(request.url).origin}/api/recipes?${params}`);
    return GET(syntheticReq);
  } catch (_error) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}
