import { executeQuery } from "@/lib/database/connection";
import { NextResponse } from "next/server";

interface IngredientAsin {
  ingredient_name: string;
  asin: string | null;
  default_quantity: number;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const result = await executeQuery<IngredientAsin>(
    `SELECT
       i.name AS ingredient_name,
       i.amazon_asin AS asin,
       COALESCE(ri.quantity, 1) AS default_quantity
     FROM recipe_ingredients ri
     JOIN ingredients i ON i.id = ri.ingredient_id
     WHERE ri.recipe_id = $1
     ORDER BY i.name`,
    [id],
  );

  const items = result.rows
    .filter((row) => row.asin !== null)
    .map((row) => ({
      asin: row.asin!,
      quantity: row.default_quantity,
      name: row.ingredient_name,
    }));

  const missing = result.rows
    .filter((row) => row.asin === null)
    .map((row) => row.ingredient_name);

  return NextResponse.json({ items, missing });
}
