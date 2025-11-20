import type { IngredientMapping } from "@/data/ingredients/types";
import { dairyIngredients } from "./dairy";

// Re-export as 'dairy' for consistency with other ingredient categories
export const dairy: Record<string, IngredientMapping> = dairyIngredients;

// Export as default
export default dairy;
