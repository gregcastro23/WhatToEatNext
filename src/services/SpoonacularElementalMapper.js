const logger = console;

class SpoonacularElementalMapper {
  static nutrientElementMap = {
    '301': 'Earth',  // Calcium
    '303': 'Fire',   // Iron
    '306': 'Water',  // Potassium
    '401': 'Air',    // Vitamin C
    '318': 'Fire',   // Vitamin A
    '328': 'Earth',  // Vitamin D
    '291': 'Earth',  // Fiber
    '269': 'Water'   // Sugars
  };

  static mapIngredient(ingredient) {
    return this.nutrientElementMap[ingredient.toLowerCase()] || 'Earth';
  }
  
  static mapRecipeToElemental(recipe) {
    // Default balanced elements
    const elements = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    
    // If recipe is null or doesn't have nutrition info, return default values
    if (!recipe || !recipe.nutrition) {
      return elements;
    }
    
    // Different recipes may have different nutrition structures
    const nutrients = 'nutrients' in recipe.nutrition 
      ? recipe.nutrition.nutrients
      : Array.isArray(recipe.nutrition) ? recipe.nutrition : [];
    
    if (nutrients && nutrients.length > 0) {
      // Initialize counters for each element
      let fireCount = 0, waterCount = 0, earthCount = 0, airCount = 0;
      
      // Process each nutrient
      nutrients.forEach((nutrient) => {
        // Handle different nutrient formats 
        const name = nutrient.name ? nutrient.name.toLowerCase() : '';
        const amount = typeof nutrient.amount === 'number' ? nutrient.amount : 0;
        
        // Map nutrients to elements
        if (['vitamin a', 'iron', 'calories', 'protein'].some(n => name.includes(n))) {
          fireCount += amount / 100;
        } else if (['potassium', 'sugars', 'carbohydrates'].some(n => name.includes(n))) {
          waterCount += amount / 100;
        } else if (['calcium', 'vitamin d', 'fiber'].some(n => name.includes(n))) {
          earthCount += amount / 100;
        } else if (['vitamin c', 'vitamin e'].some(n => name.includes(n))) {
          airCount += amount / 100;
        }
      });
      
      // Get total to normalize
      const total = fireCount + waterCount + earthCount + airCount;
      
      if (total > 0) {
        // Normalize to ensure values sum to 1
        elements.Fire = fireCount / total;
        elements.Water = waterCount / total;
        elements.Earth = earthCount / total;
        elements.Air = airCount / total;
      }
    }
    
    return elements;
  }

  // Get default elemental distribution
  static getDefaultElements() {
    return { Fire: 0.30, Water: 0.28, Earth: 0.22, Air: 0.20 };
  }

  // Map a Spoonacular ingredient to our internal ingredient format
  static mapSpoonacularIngredient(spoonacularIngredient) {
    try {
      if (!spoonacularIngredient) {
        return { name: 'Unknown Ingredient' };
      }
      
      // Extract basic properties
      const name = spoonacularIngredient.name || spoonacularIngredient.originalName || 'Unknown';
      const id = spoonacularIngredient.id?.toString() || Math.random().toString(36).substring(2, 9);
      const amount = spoonacularIngredient.amount || 1;
      const unit = spoonacularIngredient.unit || '';
      
      // Handle categories based on aisle if available
      let category = 'other';
      if (spoonacularIngredient.aisle) {
        if (spoonacularIngredient.aisle.includes('Produce')) {
          category = 'vegetables';
        } else if (spoonacularIngredient.aisle.includes('Meat')) {
          category = 'proteins';
        } else if (spoonacularIngredient.aisle.includes('Seafood')) {
          category = 'proteins';
        } else if (spoonacularIngredient.aisle.includes('Dairy')) {
          category = 'dairy';
        } else if (spoonacularIngredient.aisle.includes('Spices')) {
          category = 'spices';
        } else if (spoonacularIngredient.aisle.includes('Baking')) {
          category = 'grains';
        }
      }
      
      return {
        id,
        name,
        amount,
        unit,
        category,
        // Use nutritional mapping if available, otherwise default elements
        elementalProperties: spoonacularIngredient.nutrition 
          ? this.mapNutritionalToElemental(spoonacularIngredient.nutrition) 
          : this.getDefaultElements()
      };
    } catch (error) {
      logger.error('Error mapping Spoonacular ingredient:', error);
      return { 
        name: spoonacularIngredient?.name || 'Unknown',
        elementalProperties: this.getDefaultElements()
      };
    }
  }
}

module.exports = { SpoonacularElementalMapper }; 