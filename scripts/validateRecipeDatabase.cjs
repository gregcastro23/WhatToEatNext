#!/usr/bin/env node

/**
 * Recipe Database Validation Script
 *
 * Comprehensive validation of the recipe database for the hierarchical
 * culinary data system, ensuring data quality and completeness.
 */

const fs = require('fs');
const path = require('path');

// Mock validation functions (would be imported from actual validation module)
function validateRecipe(recipe) {
  const errors = [];
  const warnings = [];

  // Check required fields
  if (!recipe.id) errors.push('Missing id');
  if (!recipe.name) errors.push('Missing name');
  if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) errors.push('Missing or invalid ingredients');
  if (!recipe.instructions || !Array.isArray(recipe.instructions)) errors.push('Missing or invalid instructions');
  if (!recipe.elementalProperties) errors.push('Missing elemental properties');

  // Check elemental properties
  if (recipe.elementalProperties) {
    const elements = ['Fire', 'Water', 'Earth', 'Air'];
    let total = 0;
    for (const element of elements) {
      const value = recipe.elementalProperties[element];
      if (typeof value !== 'number') {
        errors.push(`Invalid ${element} value: ${value}`);
      } else {
        total += value;
      }
    }
    if (Math.abs(total - 1.0) > 0.01) {
      warnings.push(`Elemental properties don't sum to 1.0 (sum: ${total})`);
    }
  }

  // Check ingredients
  if (recipe.ingredients) {
    for (const ingredient of recipe.ingredients) {
      if (!ingredient.name) errors.push('Ingredient missing name');
      if (typeof ingredient.amount !== 'number') errors.push(`Invalid amount for ${ingredient.name}`);
      if (!ingredient.unit) errors.push(`Missing unit for ${ingredient.name}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    qualityScore: calculateQualityScore(recipe, errors, warnings)
  };
}

function calculateQualityScore(recipe, errors, warnings) {
  let score = 100;

  // Deduct for errors
  score -= errors.length * 20;

  // Deduct for warnings
  score -= warnings.length * 5;

  // Bonus for additional metadata
  if (recipe.astrologicalTiming) score += 10;
  if (recipe.cookingMethod && recipe.cookingMethod.length > 0) score += 5;
  if (recipe.nutrition) score += 5;
  if (recipe.prepTime) score += 5;

  return Math.max(0, Math.min(100, score));
}

// Configuration
const RECIPE_DIRECTORIES = [
  'src/data/cuisines',
  'src/data/enhanced_recipes'
];

const REPORT_FILE = 'reports/recipe_validation_report.json';

/**
 * Load and validate recipes from a directory
 */
function validateRecipesInDirectory(dirPath) {
  const results = {
    directory: dirPath,
    totalFiles: 0,
    validRecipes: 0,
    invalidRecipes: 0,
    totalRecipes: 0,
    recipes: [],
    errors: [],
    warnings: []
  };

  if (!fs.existsSync(dirPath)) {
    results.errors.push(`Directory not found: ${dirPath}`);
    return results;
  }

  const files = fs.readdirSync(dirPath);
  results.totalFiles = files.length;

  for (const file of files) {
    if (!file.endsWith('.ts') && !file.endsWith('.js') && !file.endsWith('.json')) continue;

    const filePath = path.join(dirPath, file);

    try {
      let recipes = [];

      if (file.endsWith('.json')) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        recipes = data.enhancedRecipes || data.recipes || [];
      } else {
        // For TypeScript/JavaScript files, use a simple regex approach
        const content = fs.readFileSync(filePath, 'utf8');
        const recipeMatches = content.match(/export const \w+ = ({[\s\S]*?});/g);

        if (recipeMatches) {
          for (const match of recipeMatches) {
            try {
              // Extract recipe name
              const nameMatch = match.match(/export const (\w+) =/);
              if (nameMatch) {
                const recipeName = nameMatch[1];
                console.log(`Found recipe: ${recipeName} in ${file}`);
                // In a real implementation, you'd parse the actual object
                recipes.push({ id: recipeName, name: recipeName });
              }
            } catch (e) {
              results.errors.push(`Failed to parse recipe in ${file}: ${e.message}`);
            }
          }
        }
      }

      // Validate each recipe
      for (const recipe of recipes) {
        results.totalRecipes++;
        const validation = validateRecipe(recipe);

        if (validation.isValid) {
          results.validRecipes++;
        } else {
          results.invalidRecipes++;
        }

        results.recipes.push({
          id: recipe.id || 'unknown',
          name: recipe.name || 'unknown',
          file,
          isValid: validation.isValid,
          errors: validation.errors,
          warnings: validation.warnings,
          qualityScore: validation.qualityScore
        });

        // Collect all errors and warnings
        results.errors.push(...validation.errors);
        results.warnings.push(...validation.warnings);
      }

    } catch (e) {
      results.errors.push(`Failed to process file ${file}: ${e.message}`);
    }
  }

  return results;
}

/**
 * Generate validation report
 */
function generateValidationReport(allResults) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalDirectories: allResults.length,
      totalFiles: allResults.reduce((sum, r) => sum + r.totalFiles, 0),
      totalRecipes: allResults.reduce((sum, r) => sum + r.totalRecipes, 0),
      validRecipes: allResults.reduce((sum, r) => sum + r.validRecipes, 0),
      invalidRecipes: allResults.reduce((sum, r) => sum + r.invalidRecipes, 0),
      averageQualityScore: 0
    },
    directories: allResults,
    recommendations: []
  };

  // Calculate average quality score
  const totalQualityScore = allResults.reduce((sum, r) => {
    return sum + r.recipes.reduce((recipeSum, recipe) => recipeSum + (recipe.qualityScore || 0), 0);
  }, 0);

  report.summary.averageQualityScore = report.summary.totalRecipes > 0
    ? Math.round(totalQualityScore / report.summary.totalRecipes)
    : 0;

  // Generate recommendations
  const invalidPercentage = (report.summary.invalidRecipes / report.summary.totalRecipes) * 100;

  if (invalidPercentage > 20) {
    report.recommendations.push('High error rate detected. Focus on fixing validation errors before proceeding.');
  }

  if (report.summary.averageQualityScore < 70) {
    report.recommendations.push('Low average quality score. Consider enhancing recipes with additional metadata.');
  }

  // Directory-specific recommendations
  for (const dirResult of allResults) {
    const dirInvalidPercentage = (dirResult.invalidRecipes / dirResult.totalRecipes) * 100;
    if (dirInvalidPercentage > 30) {
      report.recommendations.push(`High error rate in ${dirResult.directory}. Prioritize validation fixes.`);
    }
  }

  return report;
}

/**
 * Save validation report
 */
function saveValidationReport(report) {
  const reportDir = path.dirname(REPORT_FILE);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  console.log(`Validation report saved to ${REPORT_FILE}`);
}

/**
 * Display summary to console
 */
function displaySummary(report) {
  console.log('\n=== Recipe Database Validation Report ===');
  console.log(`Generated: ${report.timestamp}`);
  console.log('\n--- Summary ---');
  console.log(`Total Directories: ${report.summary.totalDirectories}`);
  console.log(`Total Files: ${report.summary.totalFiles}`);
  console.log(`Total Recipes: ${report.summary.totalRecipes}`);
  console.log(`Valid Recipes: ${report.summary.validRecipes}`);
  console.log(`Invalid Recipes: ${report.summary.invalidRecipes}`);
  console.log(`Average Quality Score: ${report.summary.averageQualityScore}/100`);

  const validPercentage = Math.round((report.summary.validRecipes / report.summary.totalRecipes) * 100);
  console.log(`Validation Rate: ${validPercentage}%`);

  if (report.recommendations.length > 0) {
    console.log('\n--- Recommendations ---');
    report.recommendations.forEach(rec => console.log(`• ${rec}`));
  }

  console.log('\n--- Directory Breakdown ---');
  for (const dir of report.directories) {
    const validPct = dir.totalRecipes > 0 ? Math.round((dir.validRecipes / dir.totalRecipes) * 100) : 0;
    console.log(`${dir.directory}: ${dir.validRecipes}/${dir.totalRecipes} valid (${validPct}%)`);
  }
}

/**
 * Main validation function
 */
function validateRecipeDatabase() {
  console.log('Starting recipe database validation...');

  const allResults = [];

  // Validate recipes in each directory
  for (const dir of RECIPE_DIRECTORIES) {
    console.log(`\nValidating recipes in ${dir}...`);
    const results = validateRecipesInDirectory(dir);
    allResults.push(results);

    console.log(`Found ${results.totalRecipes} recipes in ${results.totalFiles} files`);
    console.log(`Valid: ${results.validRecipes}, Invalid: ${results.invalidRecipes}`);
  }

  // Generate and save report
  const report = generateValidationReport(allResults);
  saveValidationReport(report);
  displaySummary(report);

  console.log('\nRecipe database validation complete!');

  // Exit with error code if validation rate is too low
  const validPercentage = (report.summary.validRecipes / report.summary.totalRecipes) * 100;
  if (validPercentage < 80) {
    console.log('\n⚠️  Validation rate below 80%. Consider fixing issues before deployment.');
    process.exit(1);
  } else {
    console.log('\n✅ Validation successful!');
  }
}

// Run validation if called directly
if (require.main === module) {
  validateRecipeDatabase();
}

module.exports = {
  validateRecipe,
  validateRecipesInDirectory,
  generateValidationReport
};
