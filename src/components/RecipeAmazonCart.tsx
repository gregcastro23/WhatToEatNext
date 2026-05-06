import { executeQuery } from \"@/lib/database/connection\";
import { AmazonCartForm } from \"./AmazonCartForm\";
import { resolveAsin } from \"@/data/amazon\";

interface IngredientRow {
  ingredient_name: string;
  asin: string | null;
  default_quantity: number;
}

interface RecipeAmazonCartProps {
  recipeId: string;
}

export async function RecipeAmazonCart({ recipeId }: RecipeAmazonCartProps) {
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

  const items = result.rows
    .map((row) => ({
      asin: row.asin || resolveAsin(row.ingredient_name),
      quantity: row.default_quantity,
      name: row.ingredient_name,
    }))
    .filter((item) => item.asin !== null) as any[];

  const missing = result.rows
    .filter((row) => !row.asin && resolveAsin(row.ingredient_name) === null)
    .map((row) => row.ingredient_name);


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
