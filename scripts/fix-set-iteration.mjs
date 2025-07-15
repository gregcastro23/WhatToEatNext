// fix-set-iteration.mjs
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// Flag to run in dry mode (no changes)
const DRY_RUN = process.argv.includes('--dry-run');

console.log(`Running in ${DRY_RUN ? 'dry run' : 'write'} mode`);

// Define specific fixes for each file
const fixes = {
  'src/data/nutritional.ts': [
    // Fix 1: getEnhancedPlanetaryNutritionalRecommendations function
    {
      find: `const bothPlanetsFoods = [...hourFoods].filter(food => dayFoods.has(food));`,
      replace: `const bothPlanetsFoods = Array.from(hourFoods).filter(food => dayFoods.has(food));`
    },
    {
      find: `const hourOnlyFoods = [...hourFoods].filter(food => !dayFoods.has(food));`,
      replace: `const hourOnlyFoods = Array.from(hourFoods).filter(food => !dayFoods.has(food));`
    },
    {
      find: `const dayOnlyFoods = [...dayFoods].filter(food => !hourFoods.has(food));`,
      replace: `const dayOnlyFoods = Array.from(dayFoods).filter(food => !hourFoods.has(food));`
    },
    // Fix for lines 1133-1135
    {
      find: `const uniqueFocusNutrients = [...new Set(focusNutrients)];`,
      replace: `const uniqueFocusNutrients = Array.from(new Set(focusNutrients));`
    },
    {
      find: `const uniqueHealthAreas = [...new Set(healthAreas)];`,
      replace: `const uniqueHealthAreas = Array.from(new Set(healthAreas));`
    },
    {
      find: `const uniqueRecommendedFoods = [...new Set(recommendedFoods)];`,
      replace: `const uniqueRecommendedFoods = Array.from(new Set(recommendedFoods));`
    },
    // Fix for profile.fdcId issue
    {
      find: `profile.fdcId = food.fdcId;`,
      replace: `profile.fdcId = food.fdcId ? Number(food.fdcId) : undefined;`
    }
  ],
  
  'src/data/cuisineFlavorProfiles.ts': [
    // Fix 1: calculateTechniquesSimilarity function
    {
      find: `const common = [...set1].filter(t => set2.has(t));`,
      replace: `const common = Array.from(set1).filter(t => set2.has(t));`
    },
    {
      find: `const union = new Set([...set1, ...set2]);`,
      replace: `const union = new Set([...Array.from(set1), ...Array.from(set2)]);`
    },
    
    // Fix 2: calculateIngredientsSimilarity function
    {
      find: `const common = [...set1].filter(i => set2.has(i));`,
      replace: `const common = Array.from(set1).filter(i => set2.has(i));`
    },
    {
      find: `const union = new Set([...set1, ...set2]);`,
      replace: `const union = new Set([...Array.from(set1), ...Array.from(set2)]);`
    },
    
    // Fix 3: getFusionSuggestions function
    {
      find: `const techniques = [...new Set([
    ...profile1.signatureTechniques.slice(0, 2),
    ...profile2.signatureTechniques.slice(0, 2)
  ])];`,
      replace: `const techniques = Array.from(new Set([
    ...profile1.signatureTechniques.slice(0, 2),
    ...profile2.signatureTechniques.slice(0, 2)
  ]));`
    },
    {
      find: `const ingredients = [...new Set([
    ...profile1.signatureIngredients.slice(0, 3),
    ...profile2.signatureIngredients.slice(0, 3)
  ])];`,
      replace: `const ingredients = Array.from(new Set([
    ...profile1.signatureIngredients.slice(0, 3),
    ...profile2.signatureIngredients.slice(0, 3)
  ]));`
    }
  ]
};

// Process each file
for (const [filePath, replacements] of Object.entries(fixes)) {
  console.log(`Processing ${filePath}...`);
  
  try {
    // Read the file
    const fullPath = resolve(process.cwd(), filePath);
    const content = readFileSync(fullPath, 'utf8');
    
    // Apply replacements
    let newContent = content;
    let replacementCount = 0;
    
    for (const { find, replace } of replacements) {
      if (newContent.includes(find)) {
        newContent = newContent.replace(find, replace);
        replacementCount++;
      }
    }
    
    // Report changes
    if (newContent === content) {
      console.log(`No changes made to ${filePath}`);
    } else {
      console.log(`Made ${replacementCount} replacements in ${filePath}`);
      
      if (!DRY_RUN) {
        // Write the updated file
        writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${filePath}`);
      } else {
        console.log('Changes would be made (dry run mode)');
      }
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

console.log('Done.'); 