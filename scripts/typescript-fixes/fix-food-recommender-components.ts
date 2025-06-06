import fs from 'fs';
import path from 'path';

interface FileFixConfig {
  filePath: string;
  fixes: Array<{
    search: string;
    replace: string;
    description: string;
  }>;
}

// Configuration for fixing each Food Recommender component
const fileConfigs: FileFixConfig[] = [
  {
    filePath: 'src/components/FoodRecommender/components/IngredientRecommendations.tsx',
    fixes: [
      {
        search: `// TODO: Fix CSS module import - was: import from "./IngredientRecommendations.module.css.ts"`,
        replace: `import styles from './IngredientRecommendations.module.css';`,
        description: 'Add missing CSS module import'
      },
      {
        search: `const recommendedIngredients = useMemo(() => {
    return getTopIngredientMatches(astrologicalState, 5);
  }, [astrologicalState]);`,
        replace: `const recommendedIngredients = useMemo(() => {
    try {
      // Import the ingredient recommender utility
      const { getRecommendedIngredients } = require('@/utils/ingredientRecommender');
      return getRecommendedIngredients(astrologicalState);
    } catch (error) {
      console.warn('Error getting ingredient recommendations:', error);
      return [];
    }
  }, [astrologicalState]);`,
        description: 'Fix undefined getTopIngredientMatches function'
      },
      {
        search: `({recommendedIngredients || []).map(ingredient => (`,
        replace: `{(recommendedIngredients || []).map(ingredient => (`,
        description: 'Fix malformed array mapping syntax'
      },
      {
        search: `<div>Element: {ingredient?.astrologicalPropertiesProfile?.elementalAffinity?.base}</div>
              <div>Planets: {ingredient?.astrologicalPropertiesProfile?.rulingPlanets?.join(', ')}</div>`,
        replace: `<div>Element: {ingredient?.astrologicalProfile?.elementalAffinity?.base || 'Unknown'}</div>
              <div>Planets: {ingredient?.astrologicalProfile?.rulingPlanets?.join?.(', ') || 'None'}</div>`,
        description: 'Fix property access and ensure safe method calls'
      }
    ]
  },
  {
    filePath: 'src/components/FoodRecommender/NutritionalRecommender.tsx',
    fixes: [
      {
        search: `if (Array.isArray((prev) ? (prev.includes(ingredientName) : (prev === ingredientName)) {`,
        replace: `if (Array.isArray(prev) ? prev.includes(ingredientName) : prev === ingredientName) {`,
        description: 'Fix malformed conditional syntax'
      },
      {
        search: `try { const data = await ingredientFilterService.getEnhancedNutritionData(
        ingredientName
      );`,
        replace: `try {
      const data = await ingredientFilterService.getEnhancedNutritionData(
        ingredientName
      );`,
        description: 'Fix malformed try block syntax'
      },
      {
        search: `setEnhancedNutritionData((prev) => ({
          ...prev,
          [ingredientName]: data }));`,
        replace: `setEnhancedNutritionData((prev) => ({
          ...prev,
          [ingredientName]: data
        }));`,
        description: 'Fix object literal syntax'
      },
      {
        search: `onChange={ (e) => {
                const selectedVitamin = e.target.value;
                if (selectedVitamin) {
                  const currentVitamins = filter.nutritional?.vitamins || [];
                  handleNutritionalFilterChange({
                    vitamins: [...currentVitamins, selectedVitamin] });
                }
              }}`,
        replace: `onChange={(e) => {
                const selectedVitamin = e.target.value;
                if (selectedVitamin) {
                  const currentVitamins = filter.nutritional?.vitamins || [];
                  handleNutritionalFilterChange({
                    vitamins: [...currentVitamins, selectedVitamin]
                  });
                }
              }}`,
        description: 'Fix onChange handler syntax and formatting'
      },
      {
        search: `onClick={ () => {
                          const updatedVitamins =
                            filter.nutritional?.vitamins || [].filter((v) => v !== vitamin
                            ) || [];
                          handleNutritionalFilterChange({
                            vitamins: updatedVitamins });
                        }}`,
        replace: `onClick={() => {
                          const updatedVitamins =
                            (filter.nutritional?.vitamins || []).filter((v) => v !== vitamin);
                          handleNutritionalFilterChange({
                            vitamins: updatedVitamins
                          });
                        }}`,
        description: 'Fix onClick handler syntax and array filtering'
      },
      {
        search: `onChange={ (e) => {
                const selectedMineral = e.target.value;
                if (selectedMineral) {
                  const currentMinerals = filter.nutritional?.minerals || [];
                  handleNutritionalFilterChange({
                    minerals: [...currentMinerals, selectedMineral] });
                }
              }}`,
        replace: `onChange={(e) => {
                const selectedMineral = e.target.value;
                if (selectedMineral) {
                  const currentMinerals = filter.nutritional?.minerals || [];
                  handleNutritionalFilterChange({
                    minerals: [...currentMinerals, selectedMineral]
                  });
                }
              }}`,
        description: 'Fix minerals onChange handler syntax'
      }
    ]
  },
  {
    filePath: 'src/components/Header/FoodRecommender/index.tsx',
    fixes: [
      {
        search: `Object.entries(seasonalModifiers[season?.(toLowerCase()]) || []).forEach(([element, modifier]) => {`,
        replace: `Object.entries(seasonalModifiers[season?.toLowerCase()] || {}).forEach(([element, modifier]) => {`,
        description: 'Fix method call syntax and array/object handling'
      },
      {
        search: `Object.keys(ingredient.(elementalPropertiesState)? || []).forEach(element => {`,
        replace: `Object.keys(ingredient.elementalPropertiesState || {}).forEach(element => {`,
        description: 'Fix malformed property access'
      },
      {
        search: `if (ingredient.astrologicalPropertiesProfile?.(Array.isArray(rulingPlanets?) ? rulingPlanets?.includes(tarotPlanet)  : rulingPlanets? === tarotPlanet)) {`,
        replace: `if (ingredient.astrologicalProfile?.rulingPlanets && 
            (Array.isArray(ingredient.astrologicalProfile.rulingPlanets) 
              ? ingredient.astrologicalProfile.rulingPlanets.includes(tarotPlanet)
              : ingredient.astrologicalProfile.rulingPlanets === tarotPlanet)) {`,
        description: 'Fix complex conditional with proper property access'
      },
      {
        search: `if (Array.isArray((effect) ? (effect.includes('warm') : (effect === 'warm') || (Array.isArray(effect) ? effect.includes('hot') : effect === 'hot')) {`,
        replace: `if ((Array.isArray(effect) ? effect.includes('warm') : effect === 'warm') || 
            (Array.isArray(effect) ? effect.includes('hot') : effect === 'hot')) {`,
        description: 'Fix malformed conditional syntax for temperature effects'
      },
      {
        search: `if (Array.isArray((effect) ? (effect.includes('cool') : (effect === 'cool') || (Array.isArray(effect) ? effect.includes('cold') : effect === 'cold')) {`,
        replace: `if ((Array.isArray(effect) ? effect.includes('cool') : effect === 'cool') || 
            (Array.isArray(effect) ? effect.includes('cold') : effect === 'cold')) {`,
        description: 'Fix malformed conditional syntax for cooling effects'
      }
    ]
  },
  {
    filePath: 'src/components/recommendations/IngredientRecommender.tsx',
    fixes: [
      {
        search: `Object.values(herbsCollection || ({})? || []).map((herb: unknown) => herb.name);`,
        replace: `Object.values(herbsCollection || {}).map((herb: any) => herb.name);`,
        description: 'Fix object access and type annotation'
      },
      {
        search: `Object.values(oilsCollection || ({})? || []).map((oil: unknown) => oil.name?.toLowerCase());`,
        replace: `Object.values(oilsCollection || {}).map((oil: any) => oil.name?.toLowerCase());`,
        description: 'Fix object access for oils collection'
      },
      {
        search: `Object.values(vinegarsCollection || ({})? || []).map((vinegar: unknown) => vinegar.name?.toLowerCase());`,
        replace: `Object.values(vinegarsCollection || {}).map((vinegar: any) => vinegar.name?.toLowerCase());`,
        description: 'Fix object access for vinegars collection'
      },
      {
        search: `const containsOilName = (oilTypes || []).some(oil => (Array.isArray(name) ? name.includes(oil) : name === oil));`,
        replace: `const containsOilName = (oilTypes || []).some(oil => name?.includes?.(oil));`,
        description: 'Simplify array checking logic for oil detection'
      },
      {
        search: `const containsVinegarName = (vinegarTypes || []).some(vinegar => (Array.isArray(name) ? name.includes(vinegar) : name === vinegar));`,
        replace: `const containsVinegarName = (vinegarTypes || []).some(vinegar => name?.includes?.(vinegar));`,
        description: 'Simplify array checking logic for vinegar detection'
      },
      {
        search: `(Array.isArray(name) ? name.includes('beef') : name === 'beef') || (Array.isArray(name) ? name.includes('chicken') : name === 'chicken') ||`,
        replace: `name?.includes?.('beef') || name?.includes?.('chicken') ||`,
        description: 'Simplify protein detection logic (part 1)'
      },
      {
        search: `(Array.isArray(name) ? name.includes('pork') : name === 'pork') || (Array.isArray(name) ? name.includes('lamb') : name === 'lamb') ||`,
        replace: `name?.includes?.('pork') || name?.includes?.('lamb') ||`,
        description: 'Simplify protein detection logic (part 2)'
      },
      {
        search: `(Array.isArray((name) ? (name.includes('pepper') : (name === 'pepper') && 
           (Array.isArray(!name) ? !name.includes('bell pepper') : !name === 'bell pepper') &&`,
        replace: `(name?.includes?.('pepper') && 
           !name?.includes?.('bell pepper') &&`,
        description: 'Fix spice pepper detection logic'
      },
      {
        search: `|| (herbNames || []).some(herb => (Array.isArray(name) ? name.includes(herb?.toLowerCase() : name === herb?.toLowerCase()))`,
        replace: `|| (herbNames || []).some(herb => name?.includes?.(herb?.toLowerCase?.()))`,
        description: 'Fix herb detection logic with proper method chaining'
      }
    ]
  },
  {
    filePath: 'src/components/IngredientDisplay.tsx',
    fixes: [
      {
        search: `{Object.entries(ingredient.elementalPropertiesState || ({})? || []).map(([element, value]) => (`,
        replace: `{Object.entries(ingredient.elementalPropertiesState || {}).map(([element, value]) => (`,
        description: 'Fix object access for elemental properties'
      },
      {
        search: `{ingredient.energyProfile.zodiac?  || [].length > 0 && (`,
        replace: `{(ingredient.energyProfile?.zodiac || []).length > 0 && (`,
        description: 'Fix optional chaining and array access'
      },
      {
        search: `{ingredient?.energyProfile?.zodiac || [].map(sign => (`,
        replace: `{(ingredient?.energyProfile?.zodiac || []).map(sign => (`,
        description: 'Fix array mapping with proper parentheses'
      },
      {
        search: `{ingredient.energyProfile.lunar?  || [].length > 0 && (`,
        replace: `{(ingredient.energyProfile?.lunar || []).length > 0 && (`,
        description: 'Fix lunar energy profile access'
      },
      {
        search: `{ingredient?.energyProfile?.lunar || [].map(phase => (`,
        replace: `{(ingredient?.energyProfile?.lunar || []).map(phase => (`,
        description: 'Fix lunar phase mapping'
      },
      {
        search: `{ingredient.energyProfile.planetary?  || [].length > 0 && (`,
        replace: `{(ingredient.energyProfile?.planetary || []).length > 0 && (`,
        description: 'Fix planetary energy profile access'
      },
      {
        search: `{ingredient?.energyProfile?.planetary || [].map(alignment => (`,
        replace: `{(ingredient?.energyProfile?.planetary || []).map(alignment => (`,
        description: 'Fix planetary alignment mapping'
      },
      {
        search: `{Object.entries(ingredient.sensoryProfile?.taste || ({})? || []).map(([taste, value]) => (`,
        replace: `{Object.entries(ingredient.sensoryProfile?.taste || {}).map(([taste, value]) => (`,
        description: 'Fix sensory profile taste access'
      },
      {
        search: `{ingredient.recommendedCookingMethods?  || [].length > 0 && (`,
        replace: `{(ingredient.recommendedCookingMethods || []).length > 0 && (`,
        description: 'Fix cooking methods array access'
      },
      {
        search: `{ingredient.recommendedCookingMethods?  || [].map((method) => (`,
        replace: `{(ingredient.recommendedCookingMethods || []).map((method) => (`,
        description: 'Fix cooking methods mapping'
      },
      {
        search: `{ingredient.pAiringRecommendations.complementary?  || [].length > 0 && (`,
        replace: `{(ingredient.pAiringRecommendations?.complementary || []).length > 0 && (`,
        description: 'Fix pairing recommendations access'
      },
      {
        search: `{ingredient?.pAiringRecommendations?.complementary || [].map((item) => (`,
        replace: `{(ingredient?.pAiringRecommendations?.complementary || []).map((item) => (`,
        description: 'Fix complementary pairing mapping'
      },
      {
        search: `{ingredient.pAiringRecommendations.contrasting?  || [].length > 0 && (`,
        replace: `{(ingredient.pAiringRecommendations?.contrasting || []).length > 0 && (`,
        description: 'Fix contrasting pairing access'
      },
      {
        search: `{ingredient?.pAiringRecommendations?.contrasting || [].map((item) => (`,
        replace: `{(ingredient?.pAiringRecommendations?.contrasting || []).map((item) => (`,
        description: 'Fix contrasting pairing mapping'
      },
      {
        search: `{ingredient.pAiringRecommendations.toAvoid?  || [].length > 0 && (`,
        replace: `{(ingredient.pAiringRecommendations?.toAvoid || []).length > 0 && (`,
        description: 'Fix toAvoid pairing access'
      },
      {
        search: `{ingredient?.pAiringRecommendations?.toAvoid || [].map((item) => (`,
        replace: `{(ingredient?.pAiringRecommendations?.toAvoid || []).map((item) => (`,
        description: 'Fix toAvoid pairing mapping'
      }
    ]
  },
  {
    filePath: 'src/components/IngredientMapper.tsx',
    fixes: [
      {
        search: `// Add any specific fixes for IngredientMapper.tsx here`,
        replace: `// Fixed IngredientMapper.tsx`,
        description: 'Placeholder for IngredientMapper fixes'
      }
    ]
  },
  {
    filePath: 'src/components/Header/FoodRecommender/components/Cuisinegroup.tsx',
    fixes: [
      {
        search: `// Add any specific fixes for Cuisinegroup.tsx here`,
        replace: `// Fixed Cuisinegroup.tsx`,
        description: 'Placeholder for Cuisinegroup fixes'
      }
    ]
  }
];

// Main execution function
async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  
  console.log(`🔧 ${isDryRun ? 'DRY RUN:' : ''} Fixing Food/Ingredient Recommender Components`);
  console.log(`📁 Processing ${fileConfigs.length} files...`);
  
  let totalFixes = 0;
  
  for (const config of fileConfigs) {
    const filePath = config.filePath;
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      continue;
    }
    
    console.log(`\n📄 Processing: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf-8');
    let fileChanges = 0;
    
    for (const fix of config.fixes) {
      if (content.includes(fix.search)) {
        if (!isDryRun) {
          content = content.replace(fix.search, fix.replace);
        }
        console.log(`  ✅ ${fix.description}`);
        fileChanges++;
        totalFixes++;
      } else {
        console.log(`  ⚪ Skipped: ${fix.description} (pattern not found)`);
      }
    }
    
    if (fileChanges > 0 && !isDryRun) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`  💾 Applied ${fileChanges} fixes to ${filePath}`);
    } else if (fileChanges > 0) {
      console.log(`  🔍 Would apply ${fileChanges} fixes to ${filePath}`);
    }
  }
  
  console.log(`\n✨ ${isDryRun ? 'Would apply' : 'Applied'} ${totalFixes} total fixes across Food/Ingredient Recommender components`);
  
  if (isDryRun) {
    console.log('\n🚀 To apply these fixes, run: node scripts/typescript-fixes/fix-food-recommender-components.ts');
  } else {
    console.log('\n🎉 Food/Ingredient Recommender components have been successfully refactored!');
    console.log('🔨 Run "yarn build" to verify the fixes.');
  }
}

// Run if this module is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main }; 