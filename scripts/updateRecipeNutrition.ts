import { Project, SyntaxKind, ObjectLiteralExpression } from 'ts-morph';
import { allRecipes } from '../src/data/recipes/index.js';
import ingredientData from '../src/data/ingredients/ingredients.js';
import { allIngredients } from '../src/data/ingredients/index.js';

// Flatten ingredients to search them
const flattenedIngredients = [
  ...Object.values(ingredientData.vegetables || {}),
  ...Object.values(ingredientData.fruits || {}),
  ...Object.values(ingredientData.grains || {}),
  ...Object.values(ingredientData.herbs || {}),
  ...Object.values(ingredientData.spices || {}),
  ...Object.values(ingredientData.meats || {}),
  ...Object.values(ingredientData.poultry || {}),
  ...Object.values(ingredientData.seafood || {}),
  ...Object.values(ingredientData.plantBased || {}),
  ...Object.values(ingredientData.oils || {}),
  ...Object.values(ingredientData.vinegars || {}),
  ...Object.values(ingredientData.seasonings || {}),
  ...Object.values(allIngredients || {})
];

function findIngredient(name: string) {
  const lowerName = name.toLowerCase();
  return flattenedIngredients.find(ing => 
    ing?.name?.toLowerCase() === lowerName || 
    ing?.id?.toLowerCase() === lowerName ||
    lowerName.includes(ing?.name?.toLowerCase()) ||
    (ing?.name && lowerName.includes(ing.name.toLowerCase()))
  );
}

function calculateNutrition(recipe) {
  let calories = 0;
  let proteinG = 0;
  let carbsG = 0;
  let fatG = 0;
  let fiberG = 0;
  let sodiumMg = 0;
  let sugarG = 0;
  const vitamins = new Set<string>();
  const minerals = new Set<string>();

  for (const ing of recipe.ingredients) {
    const matched = findIngredient(ing.name);
    
    let amount = Number(ing.amount) || 1;
    let factor = 1;
    if (ing.unit === 'g') factor = amount / 100;
    else if (ing.unit === 'kg') factor = amount * 10;
    else if (ing.unit === 'cup') factor = amount * 2.4; 
    else if (ing.unit === 'tbsp') factor = amount * 0.15;
    else factor = amount; 

    const nutrition = matched?.nutritionalProfile || matched?.nutrition || null;

    if (nutrition) {
      const cals = nutrition.calories || 0;
      const macros = nutrition.macros || nutrition;
      
      calories += cals * factor;
      proteinG += (macros.protein || macros.proteinG || 0) * factor;
      carbsG += (macros.carbs || macros.carbsG || 0) * factor;
      fatG += (macros.fat || macros.fatG || 0) * factor;
      fiberG += (macros.fiber || macros.fiberG || 0) * factor;
      sodiumMg += (macros.sodium || macros.sodiumMg || 0) * factor;
      sugarG += (macros.sugar || macros.sugarG || 0) * factor;

      if (nutrition.vitamins) Object.keys(nutrition.vitamins).forEach(v => vitamins.add(`Vitamin ${v}`));
      if (nutrition.minerals) Object.keys(nutrition.minerals).forEach(m => minerals.add(m.charAt(0).toUpperCase() + m.slice(1)));
    }
  }

  const servings = recipe.details?.baseServingSize || recipe.servingSize || 1;

  return {
    calories: Math.round(calories / servings),
    proteinG: Math.round(proteinG / servings),
    carbsG: Math.round(carbsG / servings),
    fatG: Math.round(fatG / servings),
    fiberG: Math.round(fiberG / servings),
    sodiumMg: Math.round(sodiumMg / servings),
    sugarG: Math.round(sugarG / servings),
    vitamins: Array.from(vitamins),
    minerals: Array.from(minerals)
  };
}

async function main() {
  const project = new Project();
  project.addSourceFilesAtPaths('src/data/cuisines/**/*.ts');

  let updatedRecipes = 0;

  for (const sourceFile of project.getSourceFiles()) {
    let modifiedFile = false;
    const objectsToUpdate: { obj: ObjectLiteralExpression, recipe: any }[] = [];

    // Collect first
    const objectLiterals = sourceFile.getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression);
    for (const obj of objectLiterals) {
      const nameProp = obj.getProperty('name');
      if (!nameProp) continue;
      
      let nameStr = '';
      if (nameProp.getKind() === SyntaxKind.PropertyAssignment) {
        const initializer = (nameProp as any).getInitializer();
        if (initializer && initializer.getKind() === SyntaxKind.StringLiteral) {
          nameStr = initializer.getLiteralText();
        }
      }
      if (!nameStr) continue;
      
      const recipe = allRecipes.find(r => r.name === nameStr);
      if (recipe && obj.getProperty('ingredients')) { // ensure it's a recipe object
        objectsToUpdate.push({ obj, recipe });
      }
    }

    // Now update
    for (const { obj, recipe } of objectsToUpdate) {
      const calculatedNutrition = calculateNutrition(recipe);
      
      const nutritionProp = obj.getProperty('nutritionPerServing');
      if (nutritionProp) {
        nutritionProp.remove();
      }
      
      obj.addPropertyAssignment({
        name: 'nutritionPerServing',
        initializer: JSON.stringify(calculatedNutrition)
      });
      modifiedFile = true;
      updatedRecipes++;
    }
    
    if (modifiedFile) {
      await sourceFile.save();
      console.log(`Saved ${sourceFile.getBaseName()}`);
    }
  }

  console.log(`Updated ${updatedRecipes} recipes.`);
}

main().catch(console.error);
