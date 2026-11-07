/**
 * @file src/lib/mcp/culinaryTools.ts
 *
 * Facade re-exporting culinary intelligence tools and profile gating.
 */
export {
  getUserCulinaryProfile,
  isRecipeSafeForProfile,
  profileSafeRecipeFilter,
  updateCulinaryProfileHandler,
  type CallerCulinaryProfile,
} from "./culinaryProfile";

export {
  CULINARY_SUBSTITUTIONS,
  substituteIngredientHandler,
  type CulinarySubstitutionEntry,
} from "./culinarySubstitutions";

export {
  buildConsolidatedGroceryListHandler,
  fetchAllCatalogRecipes,
} from "./culinaryGrocery";

export {
  whatToCookNowHandler,
  parseCookingMinutes,
} from "./culinaryWhatToCook";
