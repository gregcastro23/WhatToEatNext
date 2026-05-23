/**
 * GET/POST /api/recipes
 * Returns recipe catalog with optional filtering by element, cuisine, or search query.
 */
import { NextResponse } from "next/server";
import { getServerRecipes } from "@/actions/recipes";
import { withObservability } from "@/lib/observability/withObservability";
import { rateLimit } from "@/lib/rateLimit";
import type { Recipe } from "@/types/recipe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const HONO_API_URL = process.env.HONO_API_URL;

function filterRecipes(
  recipes: Recipe[],
  options: { element?: string | null; cuisine?: string | null; search?: string | null },
): Recipe[] {
  const searchTerm = options.search?.toLowerCase().trim();
  const cuisineTerm = options.cuisine?.toLowerCase().trim();
  const elementTerm = options.element?.toLowerCase().trim();

  return recipes.filter((recipe) => {
    if (cuisineTerm) {
      const recipeCuisine = recipe.cuisine?.toLowerCase().trim() ?? "";
      if (!recipeCuisine.includes(cuisineTerm)) {
        return false;
      }
    }

    if (searchTerm) {
      const haystack = [
        recipe.name,
        recipe.description,
        recipe.cuisine,
        ...(recipe.ingredients?.map((ingredient) => ingredient.name) ?? []),
      ]
        .filter((value): value is string => typeof value === "string")
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(searchTerm)) {
        return false;
      }
    }

    if (elementTerm) {
      const ep = recipe.elementalProperties;
      if (!ep) return false;
      let dominantElement = "";
      let maxValue = -1;
      for (const key of ["Fire", "Water", "Earth", "Air"] as const) {
        if (typeof ep[key] === "number" && ep[key] > maxValue) {
          maxValue = ep[key];
          dominantElement = key.toLowerCase();
        }
      }
      if (!dominantElement.includes(elementTerm)) {
        return false;
      }
    }

    return true;
  });
}

async function handleGet(request: Request) {
  const rl = await rateLimit(request, { window: 60_000, max: 60, bucket: "recipes-list" });
  if (!rl.allowed) return rl.response!;
  try {
    const url = new URL(request.url);

    // Proxy to Hono if configured
    if (HONO_API_URL) {
      try {
        const honoResponse = await fetch(`${HONO_API_URL}/api/recipes${url.search}`);
        if (honoResponse.ok) {
          const data = await honoResponse.json();
          return NextResponse.json(data);
        }
      } catch (err) {
        console.error("Hono Gateway proxy failed:", err);
      }
    }

    const element = url.searchParams.get("element");
    const cuisine = url.searchParams.get("cuisine");
    const search = url.searchParams.get("q") || url.searchParams.get("search");
    // Default page size stays modest, but the catalog page legitimately
    // needs the full set (~580 recipes) in one request — it scores and
    // sorts every recipe client-side — so the hard cap is generous.
    const limitParam = parseInt(url.searchParams.get("limit") || "20", 10);
    const limit = Math.min(
      Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 20,
      1000,
    );
    const offsetParam = parseInt(url.searchParams.get("offset") || "0", 10);
    const offset =
      Number.isFinite(offsetParam) && offsetParam > 0 ? offsetParam : 0;

    try {
      const { LocalRecipeService } = await import("@/services/LocalRecipeService");

      let recipes = await LocalRecipeService.getAllRecipes();
      if (recipes.length === 0) {
        recipes = await getServerRecipes();
      }
      recipes = filterRecipes(recipes, { element, cuisine, search });

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
      const recipes = filterRecipes(await getServerRecipes(), { element, cuisine, search });
      return NextResponse.json({
        success: true,
        recipes: recipes.slice(offset, offset + limit),
        total: recipes.length,
        limit,
        offset,
        note: "Recipe database temporarily unavailable; using static cuisine fallback",
      });
    }
  } catch (error) {
    console.error("[recipes] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch recipes" }, { status: 500 });
  }
}

async function handlePost(request: Request) {
  const rl = await rateLimit(request, { window: 60_000, max: 60, bucket: "recipes-list" });
  if (!rl.allowed) return rl.response!;
  // Allow POST with body params as an alternative to GET query params
  try {
    const body = await request.json().catch(() => ({}));

    // Proxy to Hono if configured
    if (HONO_API_URL) {
      try {
        const honoResponse = await fetch(`${HONO_API_URL}/api/recipes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (honoResponse.ok) {
          const data = await honoResponse.json();
          return NextResponse.json(data);
        }
      } catch (err) {
        console.error("Hono Gateway proxy failed:", err);
      }
    }

    const { element, cuisine, search, limit = 20, offset = 0 } = body;
    const params = new URLSearchParams();
    if (element) params.set("element", element);
    if (cuisine) params.set("cuisine", cuisine);
    if (search) params.set("q", search);
    params.set("limit", String(limit));
    params.set("offset", String(offset));

    const syntheticReq = new Request(`${new URL(request.url).origin}/api/recipes?${params}`);
    return handleGet(syntheticReq);
  } catch (_error) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}

export const GET = withObservability({ routeName: "/api/recipes" }, handleGet);
export const POST = withObservability({ routeName: "/api/recipes" }, handlePost);
