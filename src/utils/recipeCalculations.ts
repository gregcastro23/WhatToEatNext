export const recipeCalculations = {
  calculateCuisineAlignment(recipe: RecipeElementalMapping): number {
    const cuisineElements = recipe.cuisine.elementalAlignment;
    return Object.entries(recipe.elementalProperties).reduce((sum, [element, value]) => {
      return sum + (value * cuisineElements[element as keyof ElementalProperties]);
    }, 0);
  },

  getOptimalCookingWindow(recipe: RecipeElementalMapping): string[] {
    return [
      ...recipe.astrologicalProfile.rulingPlanets.map(p => `${p} dominant hours`),
      ...recipe.cuisine.astrologicalProfile.aspectEnhancers
    ];
  },

  determineElementalBoost(recipe: RecipeElementalMapping, userElements: ElementalProperties): number {
    const dominantElement = Object.entries(recipe.elementalProperties)
      .sort(([,a], [,b]) => b - a)[0][0];
    return userElements[dominantElement] * 1.5;
  }
}; 