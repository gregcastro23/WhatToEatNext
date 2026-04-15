import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/database/connection";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const q1 = await executeQuery("SELECT column_name FROM information_schema.columns WHERE table_name = 'recipes'", []);
    let q2;
    try {
      q2 = await executeQuery("SELECT id, cuisine_type, is_public, popularity_score FROM recipes LIMIT 1", []);
    } catch (innerE) {
      q2 = { error: String(innerE) };
    }
    
    let LocalRecipeServiceTest;
    try {
      const { LocalRecipeService } = await import("@/services/LocalRecipeService");
      const mapped = await LocalRecipeService.getAllRecipes();
      LocalRecipeServiceTest = { count: mapped.length };
    } catch (innerE2) {
      LocalRecipeServiceTest = { error: String(innerE2) };
    }

    let exactQueryError = null;
    let recipesCount = 0;
    try {
      const RECIPE_QUERY = `
  SELECT
    r.*,
    COALESCE((SELECT json_agg(json_build_object('id', ri.id, 'name', i.name, 'amount', COALESCE(ri.quantity, 0), 'unit', COALESCE(ri.unit, ''), 'optional', COALESCE(ri.is_optional, false), 'notes', ri.preparation_notes, 'category', i.category) ORDER BY ri.order_index) FROM recipe_ingredients ri JOIN ingredients i ON i.id = ri.ingredient_id WHERE ri.recipe_id = r.id AND i.is_active = true), '[]'::json) AS ingredients,
    COALESCE((SELECT rc.time_of_day FROM recipe_contexts rc WHERE rc.recipe_id = r.id LIMIT 1), ARRAY[]::text[]) AS meal_types,
    COALESCE((SELECT rc.recommended_seasons FROM recipe_contexts rc WHERE rc.recipe_id = r.id LIMIT 1), ARRAY[]::text[]) AS seasons,
    COALESCE((SELECT json_build_object('Fire', ep.fire, 'Water', ep.water, 'Earth', ep.earth, 'Air', ep.air) FROM elemental_properties ep WHERE ep.entity_type = 'recipe' AND ep.entity_id = r.id LIMIT 1), json_build_object('Fire', 0.25, 'Water', 0.25, 'Earth', 0.25, 'Air', 0.25)) AS elemental_properties
  FROM recipes r
  WHERE 1=1
      `;
      const res = await executeQuery(RECIPE_QUERY, []);
      recipesCount = res.rows.length;
    } catch (innerE3: any) {
      exactQueryError = String(innerE3);
    }

    return NextResponse.json({ 
      columns: q1.rows.map((r: any) => r.column_name), 
      sample: q2, 
      exactQueryError,
      recipesCount
    });
  } catch (e: any) {
    return NextResponse.json({ error: String(e.message) }, { status: 500 });
  }
}
