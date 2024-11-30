import { ElementalProperties, Ingredient } from '@/types/alchemy';

export class AlchemicalEngine {
  calculateElementalBalance(ingredients: Ingredient[]): ElementalProperties {
    const balance: ElementalProperties = { Fire: 0, Water: 0, Air: 0, Earth: 0 };

    ingredients.forEach(ingredient => {
      balance[ingredient.element] += ingredient.amount;
    });

    // Normalize the balance values
    const total = Object.values(balance).reduce((sum, value) => sum + value, 0);
    if (total > 0) {
      Object.keys(balance).forEach(element => {
        balance[element as keyof ElementalProperties] /= total;
      });
    }

    return balance;
  }
}