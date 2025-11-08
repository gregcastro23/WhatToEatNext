import { fruits } from "./ingredients/fruits";
import { grains } from "./ingredients/grains";
import { herbs } from "./ingredients/herbs";
// import { oils } from "./ingredients/oils";
const oils: any = null; // Commented out non-existent export
import { _proteins } from "./ingredients/proteins";
import { seasonings } from "./ingredients/seasonings";
import { spices } from "./ingredients/spices";
import { vegetables } from "./ingredients/vegetables";

// Export all ingredient categories combined into a single object
export const ingredientCategories = {
  vegetables,
  fruits,
  herbs,
  spices,
  proteins: _proteins,
  grains,
  seasonings,
  oils,
};

export default ingredientCategories;
