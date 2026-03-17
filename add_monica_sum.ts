import * as fs from 'fs';
import * as path from 'path';
import {
  calculateMonicaOptimizationScore,
  AlchemicalProperties
} from './src/utils/monicaKalchmCalculations';

const BATCH_FILES = [
  'recipes_batch7.json',
  'recipes_batch8.json',
  'recipes_batch9.json'
];

async function processBatch(filename: string) {
  const filePath = path.resolve(process.cwd(), filename);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filename}`);
    return;
  }

  console.log(`Processing ${filename}...`);
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const recipes = JSON.parse(rawData);
  let updatedCount = 0;

  for (const recipe of recipes) {
    // 1. Get cooking methods
    let methods: string[] = [];
    if (recipe.classifications && recipe.classifications.cooking_methods) {
      methods = recipe.classifications.cooking_methods;
    } else if (recipe.details && recipe.details.cooking_methods) {
      methods = recipe.details.cooking_methods;
    }

    if (!methods || methods.length === 0) {
      // Provide a default method if none exist
      methods = ['assembling'];
    }

    // 2. Get base alchemical properties - use planetary if available or approximations
    // For this batch processing, we'll use a neutral base if missing, or derive from elemental
    const baseAlchemical: AlchemicalProperties = {
      Spirit: 4,
      Essence: 4,
      Matter: 4,
      Substance: 4
    };

    // 3. Get elemental properties
    const elementals = recipe.elemental_properties || {
      fire: 0.25, water: 0.25, earth: 0.25, air: 0.25
    };

    // Standardize to capital keys
    const elementalProps = {
      Fire: elementals.fire || elementals.Fire || 0,
      Water: elementals.water || elementals.Water || 0,
      Earth: elementals.earth || elementals.Earth || 0,
      Air: elementals.air || elementals.Air || 0
    };

    // 4. Calculate Monica Optimization Score including the new sum
    const result = calculateMonicaOptimizationScore(methods, baseAlchemical, elementalProps);

    // 5. Add to recipe profile
    recipe.circuit_theory = recipe.circuit_theory || {};
    recipe.circuit_theory.total_monica_potential = result.monicaSum;
    recipe.circuit_theory.monica_optimization_score = result.score;
    recipe.circuit_theory.thermodynamic_efficiency = result.breakdown.thermodynamicEfficiency;

    // Add per-method constants for P=IV circuit model visibility
    recipe.circuit_theory.method_monica_constants = result.methodScores.map(ms => ({
      method: ms.method,
      monica: ms.monica,
      gregsEnergy: ms.gregsEnergy,
      kalchm: ms.kalchm
    }));

    updatedCount++;
  }

  // Write back to file
  fs.writeFileSync(filePath, JSON.stringify(recipes, null, 2));
  console.log(`Updated ${updatedCount} recipes in ${filename}`);
}

async function main() {
  for (const file of BATCH_FILES) {
    await processBatch(file);
  }
  console.log('Finished processing all batches.');
}

main().catch(console.error);
