import { resolveAsin, getStandardizedQuantity } from "@/data/amazon";
import { executeQuery } from "@/lib/database/connection";
import { AmazonCartForm } from "./AmazonCartForm";

interface IngredientRow {
  ingredient_name: string;
  asin: string | null;
  default_quantity: number;
}

interface RecipeAmazonCartProps {
  recipeId: string;
}

export async function RecipeAmazonCart({ recipeId }: RecipeAmazonCartProps) {
  // 1. Try relational query first
  const result = await executeQuery<IngredientRow>(
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

  let rawIngredients: Array<{ name: string; quantity: number; asin?: string | null }> = [];

  if (result.rows.length > 0) {
    rawIngredients = result.rows.map(r => ({
      name: r.ingredient_name,
      quantity: r.default_quantity,
      asin: r.asin
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
    .map((row) => ({
      asin: row.asin || resolveAsin(row.name),
      quantity: getStandardizedQuantity(row.name, row.quantity),
      name: row.name,
    }))
    .filter((item) => item.asin !== null) as any[];

  const missing = rawIngredients
    .filter((row) => !row.asin && resolveAsin(row.name) === null)
    .map((row) => row.name);


  return (
    <div className="space-y-4">
      <AmazonCartForm items={items} />

      {missing.length > 0 && (
        <details className="text-xs text-gray-500">
          <summary className="cursor-pointer hover:text-gray-700">
            {missing.length} ingredient{missing.length !== 1 ? "s" : ""} not
            available on Amazon
          </summary>
          <ul className="mt-1 list-inside list-disc pl-2">
            {missing.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
