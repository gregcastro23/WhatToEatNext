import { NextResponse } from "next/server";
import { resolveAsin, getStandardizedQuantity } from "@/data/amazon";
import { executeQuery } from "@/lib/database/connection";
import { rateLimit } from "@/lib/rateLimit";

interface IngredientAsin {
  ingredient_name: string;
  asin: string | null;
  default_quantity: number;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ recipeId: string }> },
) {
  try {
  const rl = await rateLimit(request, { window: 60_000, max: 60, bucket: "amazon-cart" });
  if (!rl.allowed) return rl.response!;

  const { recipeId } = await params;

  // 1. Try relational query first
  const result = await executeQuery<IngredientAsin>(
    `SELECT
       i.name AS ingredient_name,
       i.amazon_asin AS asin,
       COALESCE(ri.quantity, 1) AS default_quantity
     FROM recipe_ingredients ri
     JOIN ingredients i ON i.id = ri.ingredient_id
     WHERE ri.recipe_id = $1
     ORDER BY i.name`,
    [recipeId],
  );

  let rawIngredients: Array<{ name: string; quantity: number }> = [];

  if (result.rows.length > 0) {
    rawIngredients = result.rows.map(r => ({
      name: r.ingredient_name,
      quantity: r.default_quantity
    }));
  } else {
    // 2. Fallback to read_model if relational table is empty
    const recipeResult = await executeQuery(
      `SELECT read_model FROM recipes WHERE id = $1`,
      [recipeId]
    );
    
    if (recipeResult.rows[0]?.read_model?.ingredients) {
      rawIngredients = recipeResult.rows[0].read_model.ingredients.map((ing: any) => ({
        name: typeof ing === 'string' ? ing : ing.name,
        quantity: typeof ing === 'object' ? (ing.amount || 1) : 1
      }));
    }
  }

  const items = rawIngredients
    .map((ing) => {
      const asin = resolveAsin(ing.name);
      return {
        asin,
        quantity: getStandardizedQuantity(ing.name, ing.quantity),
        name: ing.name,
      };
    })
    .filter((item) => item.asin !== null);

  const missing = rawIngredients
    .filter((ing) => resolveAsin(ing.name) === null)
    .map((ing) => ing.name);

  return NextResponse.json({ items, missing });
  } catch (error) {
    console.error("[amazon-cart] Error:", error);
    return NextResponse.json({ error: "Failed to build cart" }, { status: 500 });
  }
}

