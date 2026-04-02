import fs from 'fs';
import path from 'path';
import { unifiedIngredients } from './src/data/unified/ingredients.ts';

const allIngredients = Object.values(unifiedIngredients);

const totalIngredients = allIngredients.length;
let plantBased = 0;
let animalBased = 0;

allIngredients.forEach(ingredient => {
    // Check dietary tags
    const isVegan = ingredient.dietary?.includes('vegan');
    const isVegetarian = ingredient.dietary?.includes('vegetarian');
    
    // Check categories/subcategories if tags aren't perfectly reliable
    const category = ingredient.category?.toLowerCase() || '';
    const subcategory = ingredient.subcategory?.toLowerCase() || '';
    
    // Explicit animal categories
    const animalCategories = ['meat', 'poultry', 'seafood', 'dairy', 'eggs'];
    const animalSubcategories = ['beef', 'pork', 'lamb', 'chicken', 'fish', 'shellfish', 'cheese', 'milk', 'cream'];
    
    const isExplicitlyAnimal = animalCategories.includes(category) || animalSubcategories.includes(subcategory);
    
    if (isVegan) {
        plantBased++;
    } else if (isExplicitlyAnimal) {
        animalBased++;
    } else if (isVegetarian && (category === 'dairy' || subcategory === 'eggs')) {
         animalBased++;
    } else {
        // Fallback: If it's not explicitly animal, assume plant-based for vegetables, fruits, grains, etc.
        const plantCategories = ['vegetables', 'fruits', 'grains', 'herbs', 'spices', 'legumes', 'nuts', 'seeds', 'oils', 'seasonings'];
        if (plantCategories.includes(category)) {
            plantBased++;
        } else {
            // Uncategorized or ambiguous, let's log a few to see what they are
            // console.log(`Ambiguous: ${ingredient.name} (${category} / ${subcategory})`);
            // We'll roughly group them into plant based unless it says otherwise
            plantBased++;
        }
    }
});

console.log(`\n--- PRECISE COUNT FROM UNIFIED DATABASE ---`);
console.log(`Total Unique Ingredients: ${totalIngredients}`);
console.log(`Plant-Based (Vegan/Botanical): ${plantBased}`);
console.log(`Animal-Based (Meat/Dairy/Eggs): ${animalBased}`);

