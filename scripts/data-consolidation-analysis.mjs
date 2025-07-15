#!/usr/bin/env node

/**
 * Data Directory Consolidation Analysis Script
 * 
 * This script analyzes the current data directory structure and provides
 * detailed insights for the consolidation project.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DRY_RUN = process.argv.includes('--dry-run') || process.argv.includes('-d');
const VERBOSE = process.argv.includes('--verbose') || process.argv.includes('-v');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const OUTPUT_FILE = path.join(__dirname, '..', 'data-consolidation-analysis.json');

// Analysis results
const analysisResults = {
  timestamp: new Date().toISOString(),
  summary: {
    totalFiles: 0,
    totalSize: 0,
    flavorProfileFiles: [],
    ingredientFiles: [],
    integrationFiles: [],
    recipeFiles: [],
    issues: []
  },
  flavorProfileAnalysis: {
    files: [],
    redundancy: [],
    inconsistencies: []
  },
  ingredientAnalysis: {
    files: [],
    structures: [],
    missing: []
  },
  integrationAnalysis: {
    files: [],
    scattered: [],
    opportunities: []
  },
  recipeAnalysis: {
    files: [],
    complexity: [],
    redundancy: []
  },
  recommendations: []
};

/**
 * Get file size in bytes
 */
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

/**
 * Format file size for display
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Analyze file content for specific patterns
 */
function analyzeFileContent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').length;
    
    const analysis = {
      path: filePath,
      size: getFileSize(filePath),
      lines: lines,
      hasFlavorProfile: content.includes('flavorProfile') || content.includes('FlavorProfile'),
      hasElementalProperties: content.includes('elementalProperties') || content.includes('ElementalProperties'),
      hasOpposingElements: content.includes('opposing') || content.includes('opposite') || content.includes('balance'),
      hasSeasonalData: content.includes('seasonal') || content.includes('Season'),
      hasPlanetaryData: content.includes('planetary') || content.includes('Planet'),
      hasCuisineData: content.includes('cuisine') || content.includes('Cuisine'),
      hasRecipeData: content.includes('recipe') || content.includes('Recipe'),
      hasIngredientData: content.includes('ingredient') || content.includes('Ingredient'),
      imports: [],
      exports: []
    };
    
    // Extract imports
    const importMatches = content.match(/import.*from.*['"`]([^'"`]+)['"`]/g);
    if (importMatches) {
      analysis.imports = importMatches.map(match => {
        const pathMatch = match.match(/['"`]([^'"`]+)['"`]/);
        return pathMatch ? pathMatch[1] : '';
      }).filter(Boolean);
    }
    
    // Extract exports
    const exportMatches = content.match(/export\s+(const|interface|type|function|class)\s+(\w+)/g);
    if (exportMatches) {
      analysis.exports = exportMatches.map(match => {
        const nameMatch = match.match(/export\s+(?:const|interface|type|function|class)\s+(\w+)/);
        return nameMatch ? nameMatch[1] : '';
      }).filter(Boolean);
    }
    
    return analysis;
  } catch (error) {
    console.error(`Error analyzing file ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Recursively scan directory for TypeScript files
 */
function scanDirectory(dirPath, relativePath = '') {
  const files = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const relativeItemPath = path.join(relativePath, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        // Recursively scan subdirectories
        files.push(...scanDirectory(fullPath, relativeItemPath));
      } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
        // Analyze TypeScript files
        const analysis = analyzeFileContent(fullPath);
        if (analysis) {
          analysis.relativePath = relativeItemPath;
          files.push(analysis);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error.message);
  }
  
  return files;
}

/**
 * Categorize files based on their content and path
 */
function categorizeFiles(files) {
  const categories = {
    flavorProfile: [],
    ingredient: [],
    integration: [],
    recipe: [],
    other: []
  };
  
  for (const file of files) {
    const pathLower = file.relativePath.toLowerCase();
    
    if (pathLower.includes('flavorprofile') || file.hasFlavorProfile) {
      categories.flavorProfile.push(file);
    } else if (pathLower.includes('ingredient') || file.hasIngredientData) {
      categories.ingredient.push(file);
    } else if (pathLower.includes('integration') || pathLower.includes('seasonal') || pathLower.includes('elemental')) {
      categories.integration.push(file);
    } else if (pathLower.includes('recipe') || pathLower.includes('dish') || file.hasRecipeData) {
      categories.recipe.push(file);
    } else {
      categories.other.push(file);
    }
  }
  
  return categories;
}

/**
 * Analyze flavor profile redundancy
 */
function analyzeFlavorProfileRedundancy(flavorFiles) {
  const redundancy = [];
  const inconsistencies = [];
  
  // Check for multiple flavor profile systems
  if (flavorFiles.length > 1) {
    redundancy.push({
      type: 'Multiple Flavor Profile Systems',
      files: flavorFiles.map(f => f.relativePath),
      impact: 'High',
      description: 'Multiple separate flavor profile systems create inconsistency and maintenance overhead'
    });
  }
  
  // Check for opposing element logic
  for (const file of flavorFiles) {
    if (file.hasOpposingElements) {
      inconsistencies.push({
        type: 'Opposing Element Logic',
        file: file.relativePath,
        impact: 'Critical',
        description: 'File contains opposing element logic that violates self-reinforcement principles'
      });
    }
  }
  
  return { redundancy, inconsistencies };
}

/**
 * Analyze ingredient data structure consistency
 */
function analyzeIngredientConsistency(ingredientFiles) {
  const structures = [];
  const missing = [];
  
  for (const file of ingredientFiles) {
    const structure = {
      file: file.relativePath,
      hasElementalProperties: file.hasElementalProperties,
      hasFlavorProfile: file.hasFlavorProfile,
      hasSeasonalData: file.hasSeasonalData,
      hasPlanetaryData: file.hasPlanetaryData,
      size: file.size,
      lines: file.lines
    };
    
    structures.push(structure);
    
    // Check for missing essential properties
    if (!file.hasElementalProperties) {
      missing.push({
        file: file.relativePath,
        missing: 'Elemental Properties',
        impact: 'Medium'
      });
    }
    
    if (!file.hasFlavorProfile) {
      missing.push({
        file: file.relativePath,
        missing: 'Flavor Profile',
        impact: 'Medium'
      });
    }
  }
  
  return { structures, missing };
}

/**
 * Analyze integration logic scattering
 */
function analyzeIntegrationScattering(integrationFiles) {
  const scattered = [];
  const opportunities = [];
  
  // Group by functionality
  const seasonalFiles = integrationFiles.filter(f => f.hasSeasonalData);
  const elementalFiles = integrationFiles.filter(f => f.hasElementalProperties);
  const cuisineFiles = integrationFiles.filter(f => f.hasCuisineData);
  
  if (seasonalFiles.length > 1) {
    scattered.push({
      type: 'Seasonal Logic Scattered',
      files: seasonalFiles.map(f => f.relativePath),
      count: seasonalFiles.length,
      impact: 'Medium'
    });
    
    opportunities.push({
      type: 'Consolidate Seasonal Logic',
      files: seasonalFiles.map(f => f.relativePath),
      benefit: 'Unified seasonal calculations and improved maintainability'
    });
  }
  
  if (cuisineFiles.length > 1) {
    scattered.push({
      type: 'Cuisine Logic Scattered',
      files: cuisineFiles.map(f => f.relativePath),
      count: cuisineFiles.length,
      impact: 'Medium'
    });
  }
  
  return { scattered, opportunities };
}

/**
 * Analyze recipe complexity and redundancy
 */
function analyzeRecipeComplexity(recipeFiles) {
  const complexity = [];
  const redundancy = [];
  
  for (const file of recipeFiles) {
    if (file.size > 30000) { // Files larger than 30KB
      complexity.push({
        file: file.relativePath,
        size: file.size,
        lines: file.lines,
        impact: 'High',
        description: 'Large file may benefit from refactoring and optimization'
      });
    }
  }
  
  // Check for potential redundancy
  const recipeDataFiles = recipeFiles.filter(f => 
    f.relativePath.includes('recipe') || f.relativePath.includes('dish')
  );
  
  if (recipeDataFiles.length > 1) {
    redundancy.push({
      type: 'Multiple Recipe Data Systems',
      files: recipeDataFiles.map(f => f.relativePath),
      impact: 'Medium',
      description: 'Multiple recipe data files may contain redundant logic'
    });
  }
  
  return { complexity, redundancy };
}

/**
 * Generate consolidation recommendations
 */
function generateRecommendations(analysis) {
  const recommendations = [];
  
  // Flavor Profile Consolidation
  if (analysis.flavorProfileAnalysis.files.length > 1) {
    recommendations.push({
      priority: 'High',
      phase: 'Phase 1',
      title: 'Consolidate Flavor Profile Systems',
      description: `Merge ${analysis.flavorProfileAnalysis.files.length} flavor profile files into unified system`,
      files: analysis.flavorProfileAnalysis.files.map(f => f.relativePath),
      estimatedImpact: 'High performance improvement, reduced maintenance overhead',
      estimatedEffort: 'Medium'
    });
  }
  
  // Ingredient Standardization
  if (analysis.ingredientAnalysis.missing.length > 0) {
    recommendations.push({
      priority: 'High',
      phase: 'Phase 2',
      title: 'Standardize Ingredient Data Structure',
      description: `Fix ${analysis.ingredientAnalysis.missing.length} missing properties across ingredient files`,
      files: [...new Set(analysis.ingredientAnalysis.missing.map(m => m.file))],
      estimatedImpact: 'Improved data consistency and component reliability',
      estimatedEffort: 'Medium'
    });
  }
  
  // Integration Consolidation
  if (analysis.integrationAnalysis.scattered.length > 0) {
    recommendations.push({
      priority: 'Medium',
      phase: 'Phase 3',
      title: 'Consolidate Integration Logic',
      description: `Merge scattered integration logic across ${analysis.integrationAnalysis.files.length} files`,
      files: analysis.integrationAnalysis.files.map(f => f.relativePath),
      estimatedImpact: 'Simplified data relationships and improved maintainability',
      estimatedEffort: 'Medium'
    });
  }
  
  // Recipe Optimization
  if (analysis.recipeAnalysis.complexity.length > 0) {
    recommendations.push({
      priority: 'Medium',
      phase: 'Phase 4',
      title: 'Optimize Recipe Data Processing',
      description: `Refactor ${analysis.recipeAnalysis.complexity.length} complex recipe files`,
      files: analysis.recipeAnalysis.complexity.map(c => c.file),
      estimatedImpact: 'Improved performance and simplified recipe processing',
      estimatedEffort: 'High'
    });
  }
  
  return recommendations;
}

/**
 * Main analysis function
 */
function runAnalysis() {
  console.log('🔍 Starting Data Directory Consolidation Analysis...\n');
  
  if (DRY_RUN) {
    console.log('🧪 DRY RUN MODE - No files will be modified\n');
  }
  
  // Scan all files in data directory
  console.log('📁 Scanning data directory...');
  const allFiles = scanDirectory(DATA_DIR);
  
  console.log(`Found ${allFiles.length} TypeScript files\n`);
  
  // Categorize files
  const categories = categorizeFiles(allFiles);
  
  // Update summary
  analysisResults.summary.totalFiles = allFiles.length;
  analysisResults.summary.totalSize = allFiles.reduce((sum, file) => sum + file.size, 0);
  analysisResults.summary.flavorProfileFiles = categories.flavorProfile.map(f => f.relativePath);
  analysisResults.summary.ingredientFiles = categories.ingredient.map(f => f.relativePath);
  analysisResults.summary.integrationFiles = categories.integration.map(f => f.relativePath);
  analysisResults.summary.recipeFiles = categories.recipe.map(f => f.relativePath);
  
  // Detailed analysis
  console.log('🔬 Analyzing flavor profile redundancy...');
  const flavorAnalysis = analyzeFlavorProfileRedundancy(categories.flavorProfile);
  analysisResults.flavorProfileAnalysis = {
    files: categories.flavorProfile,
    ...flavorAnalysis
  };
  
  console.log('🥕 Analyzing ingredient data consistency...');
  const ingredientAnalysis = analyzeIngredientConsistency(categories.ingredient);
  analysisResults.ingredientAnalysis = {
    files: categories.ingredient,
    ...ingredientAnalysis
  };
  
  console.log('🔗 Analyzing integration logic scattering...');
  const integrationAnalysis = analyzeIntegrationScattering(categories.integration);
  analysisResults.integrationAnalysis = {
    files: categories.integration,
    ...integrationAnalysis
  };
  
  console.log('🍳 Analyzing recipe complexity...');
  const recipeAnalysis = analyzeRecipeComplexity(categories.recipe);
  analysisResults.recipeAnalysis = {
    files: categories.recipe,
    ...recipeAnalysis
  };
  
  // Generate recommendations
  console.log('💡 Generating recommendations...');
  analysisResults.recommendations = generateRecommendations(analysisResults);
  
  // Display results
  displayResults();
  
  // Save results to file
  if (!DRY_RUN) {
    console.log(`\n💾 Saving analysis results to ${OUTPUT_FILE}...`);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(analysisResults, null, 2));
    console.log('✅ Analysis complete!');
  } else {
    console.log('\n🧪 DRY RUN - Results not saved to file');
  }
}

/**
 * Display analysis results
 */
function displayResults() {
  console.log('\n📊 ANALYSIS RESULTS');
  console.log('==================\n');
  
  // Summary
  console.log('📈 Summary:');
  console.log(`   Total Files: ${analysisResults.summary.totalFiles}`);
  console.log(`   Total Size: ${formatFileSize(analysisResults.summary.totalSize)}`);
  console.log(`   Flavor Profile Files: ${analysisResults.summary.flavorProfileFiles.length}`);
  console.log(`   Ingredient Files: ${analysisResults.summary.ingredientFiles.length}`);
  console.log(`   Integration Files: ${analysisResults.summary.integrationFiles.length}`);
  console.log(`   Recipe Files: ${analysisResults.summary.recipeFiles.length}\n`);
  
  // Critical Issues
  console.log('🚨 Critical Issues:');
  const criticalIssues = [
    ...analysisResults.flavorProfileAnalysis.inconsistencies.filter(i => i.impact === 'Critical'),
    ...analysisResults.flavorProfileAnalysis.redundancy.filter(r => r.impact === 'High')
  ];
  
  if (criticalIssues.length > 0) {
    criticalIssues.forEach(issue => {
      console.log(`   ❌ ${issue.type}: ${issue.description}`);
    });
  } else {
    console.log('   ✅ No critical issues found');
  }
  console.log('');
  
  // Top Recommendations
  console.log('💡 Top Recommendations:');
  const topRecommendations = analysisResults.recommendations
    .filter(r => r.priority === 'High')
    .slice(0, 3);
  
  topRecommendations.forEach((rec, index) => {
    console.log(`   ${index + 1}. ${rec.title} (${rec.phase})`);
    console.log(`      Impact: ${rec.estimatedImpact}`);
    console.log(`      Files: ${rec.files.length} files affected`);
  });
  
  if (VERBOSE) {
    console.log('\n📋 Detailed Breakdown:');
    console.log('   Flavor Profile Files:');
    analysisResults.flavorProfileAnalysis.files.forEach(file => {
      console.log(`     - ${file.relativePath} (${formatFileSize(file.size)}, ${file.lines} lines)`);
    });
    
    console.log('\n   Integration Files:');
    analysisResults.integrationAnalysis.files.forEach(file => {
      console.log(`     - ${file.relativePath} (${formatFileSize(file.size)}, ${file.lines} lines)`);
    });
  }
}

// Run the analysis
runAnalysis(); 