// Define a proper interface for ingredients to avoid using unknown[]
interface ThermodynamicIngredient {
  name?: string;
  spiciness?: number;
  elementalProperties?: {
    Fire?: number;
    Water?: number;
    Earth?: number;
    Air?: number;
  };
  cookingTemperature?: number;
  category?: string;
  fermented?: boolean;
  complexity?: number;
  pH?: number;
  alcoholContent?: number;
  enzymeActivity?: number;
}

export class ThermodynamicCalculator {
  // Implementation for calculating thermodynamic properties of ingredients

  calculateHeatValue(ingredients: ThermodynamicIngredient[]): number {
    if (!ingredients || ingredients.length === 0) {
      return 0.5; // Default neutral value
    }

    // Calculate heat based on ingredient properties
    // Higher values for spicy, high-protein, or naturally hot ingredients
    let totalHeat = 0;
    let totalWeight = 0;

    ingredients.forEach((ingredient) => {
      let heatValue = 0.5; // Default neutral value
      let weight = 1; // Default weight

      // Adjust heat value based on ingredient properties
      if (ingredient.spiciness) {
        heatValue += ingredient.spiciness * 0.3;
        weight += 1;
      }

      if (ingredient.elementalProperties?.Fire) {
        heatValue += ingredient.elementalProperties.Fire * 0.4;
        weight += 2;
      }

      if (ingredient.cookingTemperature) {
        // Normalize cooking temperature (assuming max around 500°F)
        const normalizedTemp = Math.min(ingredient.cookingTemperature / 500, 1);
        heatValue += normalizedTemp * 0.2;
        weight += 1;
      }

      totalHeat += heatValue * weight;
      totalWeight += weight;
    });

    // Normalize to a value between 0 and 1
    return Math.min(1, Math.max(0, totalWeight > 0 ? totalHeat / (totalWeight || 1) : 0.5));
  }

  calculateEntropyValue(ingredients: ThermodynamicIngredient[]): number {
    if (!ingredients || ingredients.length === 0) {
      return 0.5; // Default neutral value
    }

    // Calculate entropy based on complexity, variety, and fermentation
    let totalEntropy = 0;
    let totalWeight = 0;

    // More ingredients = higher entropy
    const ingredientCountFactor = Math.min(ingredients.length / 10, 1) * 0.3;
    totalEntropy += ingredientCountFactor;
    totalWeight += 1;

    // Check for diversity in ingredient types
    const categories = new Set<string>();
    ingredients.forEach((ingredient) => {
      if (ingredient.category) {
        categories.add(ingredient.category);
      }

      // Fermented ingredients have high entropy
      if (ingredient.fermented) {
        totalEntropy += 0.8;
        totalWeight += 1;
      }

      // Molecular complexity
      if (ingredient.complexity) {
        totalEntropy += ingredient.complexity * 0.5;
        totalWeight += 1;
      }

      // Air element contributes to entropy (representing change and variability)
      if (ingredient.elementalProperties?.Air) {
        totalEntropy += ingredient.elementalProperties.Air * 0.3;
        totalWeight += 1;
      }
    });

    // Add diversity factor
    const diversityFactor = Math.min(categories.size / 5, 1) * 0.4;
    totalEntropy += diversityFactor;
    totalWeight += 1;

    // Normalize to a value between 0 and 1
    return Math.min(1, Math.max(0, totalWeight > 0 ? totalEntropy / (totalWeight || 1) : 0.5));
  }

  calculateReactivityValue(ingredients: ThermodynamicIngredient[]): number {
    if (!ingredients || ingredients.length === 0) {
      return 0.5; // Default neutral value
    }

    // Calculate reactivity based on acidity, alkalinity, and chemical properties
    let totalReactivity = 0;
    let totalWeight = 0;

    ingredients.forEach((ingredient) => {
      let reactivityValue = 0.5; // Default neutral value
      let weight = 1; // Default weight

      // pH value affects reactivity (further from neutral = more reactive)
      if (ingredient.pH) {
        const pHDeviation = Math.abs(ingredient.pH - 7) / 7; // Normalize pH deviation
        reactivityValue += pHDeviation * 0.5;
        weight += 2;
      }

      // Alcohol content increases reactivity
      if (ingredient.alcoholContent) {
        reactivityValue += ingredient.alcoholContent * 0.6;
        weight += 1;
      }

      // Enzyme activity increases reactivity
      if (ingredient.enzymeActivity) {
        reactivityValue += ingredient.enzymeActivity * 0.4;
        weight += 1;
      }

      // Water element relates to chemical reactions
      if (ingredient.elementalProperties?.Water) {
        reactivityValue += ingredient.elementalProperties.Water * 0.3;
        weight += 1;
      }

      totalReactivity += reactivityValue * weight;
      totalWeight += weight;
    });

    // Normalize to a value between 0 and 1
    return Math.min(1, Math.max(0, totalWeight > 0 ? totalReactivity / (totalWeight || 1) : 0.5));
  }
}
