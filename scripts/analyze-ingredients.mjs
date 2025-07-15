#!/usr/bin/env node

/**
 * Ingredient Analysis Script for Phase 2 Consolidation
 * Analyzes all 59 ingredient files to understand structure and prepare for unification
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Analysis results
const analysis = {
  totalFiles: 0,
  totalIngredients: 0,
  categories: {},
  dataPatterns: {
    hasElementalProperties: 0,
    hasAlchemicalProperties: 0,
    hasKalchm: 0,
    hasNutritionalProfile: 0,
    hasPreparation: 0,
    hasStorage: 0,
    hasQualities: 0,
    hasAffinities: 0,
    hasCookingMethods: 0
  },
  fileSizes: [],
  errors: []
};

/**
 * Recursively find all TypeScript files in ingredients directory
 */
function findIngredientFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findIngredientFiles(fullPath));
    } else if (item.endsWith('.ts') && !item.includes('index') && !item.includes('types')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Analyze a single ingredient file
 */
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(rootDir, filePath);
    const category = relativePath.split('/')[2]; // src/data/ingredients/[category]
    const fileSize = content.length;
    
    analysis.totalFiles++;
    analysis.fileSizes.push({ file: relativePath, size: fileSize });
    
    // Initialize category if not exists
    if (!analysis.categories[category]) {
      analysis.categories[category] = {
        files: 0,
        ingredients: 0,
        avgFileSize: 0,
        patterns: { ...analysis.dataPatterns }
      };
    }
    
    analysis.categories[category].files++;
    
    // Count ingredients (look for export statements)
    const exportMatches = content.match(/export\s+(const|let)\s+\w+\s*[:=]/g) || [];
    const ingredientCount = exportMatches.filter(match => 
      !match.includes('index') && 
      !match.includes('all') && 
      !match.includes('raw')
    ).length;
    
    analysis.totalIngredients += ingredientCount;
    analysis.categories[category].ingredients += ingredientCount;
    
    // Analyze data patterns
    const patterns = {
      hasElementalProperties: /elementalProperties\s*:/g.test(content),
      hasAlchemicalProperties: /alchemicalProperties\s*:/g.test(content),
      hasKalchm: /kalchm\s*:/g.test(content),
      hasNutritionalProfile: /nutritionalProfile\s*:/g.test(content),
      hasPreparation: /preparation\s*:/g.test(content),
      hasStorage: /storage\s*:/g.test(content),
      hasQualities: /qualities\s*:/g.test(content),
      hasAffinities: /affinities\s*:/g.test(content),
      hasCookingMethods: /cookingMethods\s*:/g.test(content)
    };
    
    // Update global patterns
    Object.keys(patterns).forEach(pattern => {
      if (patterns[pattern]) {
        analysis.dataPatterns[pattern]++;
        analysis.categories[category].patterns[pattern]++;
      }
    });
    
    console.log(`✓ Analyzed ${relativePath} (${fileSize} bytes, ${ingredientCount} ingredients)`);
    
  } catch (error) {
    analysis.errors.push({ file: filePath, error: error.message });
    console.error(`✗ Error analyzing ${filePath}: ${error.message}`);
  }
}

/**
 * Generate analysis report
 */
function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('INGREDIENT ANALYSIS REPORT - PHASE 2 CONSOLIDATION');
  console.log('='.repeat(80));
  
  console.log(`\n📊 OVERVIEW:`);
  console.log(`   Total Files: ${analysis.totalFiles}`);
  console.log(`   Total Ingredients: ${analysis.totalIngredients}`);
  console.log(`   Categories: ${Object.keys(analysis.categories).length}`);
  console.log(`   Errors: ${analysis.errors.length}`);
  
  console.log(`\n📁 CATEGORIES:`);
  Object.entries(analysis.categories).forEach(([category, data]) => {
    console.log(`   ${category.padEnd(15)} | ${data.files.toString().padStart(2)} files | ${data.ingredients.toString().padStart(3)} ingredients`);
  });
  
  console.log(`\n🔍 DATA PATTERNS (Coverage %):`);
  Object.entries(analysis.dataPatterns).forEach(([pattern, count]) => {
    const percentage = ((count / analysis.totalFiles) * 100).toFixed(1);
    console.log(`   ${pattern.padEnd(25)} | ${count.toString().padStart(2)}/${analysis.totalFiles} (${percentage}%)`);
  });
  
  console.log(`\n📏 FILE SIZES:`);
  const sortedSizes = analysis.fileSizes.sort((a, b) => b.size - a.size);
  console.log(`   Largest: ${sortedSizes[0].file} (${(sortedSizes[0].size / 1024).toFixed(1)} KB)`);
  console.log(`   Smallest: ${sortedSizes[sortedSizes.length - 1].file} (${(sortedSizes[sortedSizes.length - 1].size / 1024).toFixed(1)} KB)`);
  const avgSize = analysis.fileSizes.reduce((sum, f) => sum + f.size, 0) / analysis.fileSizes.length;
  console.log(`   Average: ${(avgSize / 1024).toFixed(1)} KB`);
  const totalSize = analysis.fileSizes.reduce((sum, f) => sum + f.size, 0);
  console.log(`   Total: ${(totalSize / 1024).toFixed(1)} KB`);
  
  if (analysis.errors.length > 0) {
    console.log(`\n❌ ERRORS:`);
    analysis.errors.forEach(error => {
      console.log(`   ${error.file}: ${error.error}`);
    });
  }
  
  console.log(`\n🎯 CONSOLIDATION OPPORTUNITIES:`);
  console.log(`   • ${analysis.totalFiles - analysis.dataPatterns.hasElementalProperties} files missing elemental properties`);
  console.log(`   • ${analysis.totalFiles - analysis.dataPatterns.hasAlchemicalProperties} files missing alchemical properties`);
  console.log(`   • ${analysis.totalFiles - analysis.dataPatterns.hasKalchm} files missing Kalchm values`);
  console.log(`   • Performance gain potential: ~${((totalSize / 1024) * 0.6).toFixed(1)} KB reduction`);
  
  console.log(`\n✅ READY FOR PHASE 2 CONSOLIDATION`);
  console.log('='.repeat(80));
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Starting ingredient analysis for Phase 2 consolidation...\n');
  
  const ingredientsDir = path.join(rootDir, 'src', 'data', 'ingredients');
  
  if (!fs.existsSync(ingredientsDir)) {
    console.error('❌ Ingredients directory not found:', ingredientsDir);
    process.exit(1);
  }
  
  const ingredientFiles = findIngredientFiles(ingredientsDir);
  console.log(`Found ${ingredientFiles.length} ingredient files to analyze\n`);
  
  // Analyze each file
  ingredientFiles.forEach(analyzeFile);
  
  // Generate report
  generateReport();
  
  // Save analysis results
  const outputPath = path.join(rootDir, 'ingredient-analysis-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2));
  console.log(`\n💾 Analysis results saved to: ${outputPath}`);
}

// Run the analysis
main(); 