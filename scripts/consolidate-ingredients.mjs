#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// ===== CONFIGURATION =====
const CONFIG = {
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
  ingredientsDir: path.join(projectRoot, 'src/data/ingredients'),
  unifiedDir: path.join(projectRoot, 'src/data/unified'),
  backupDir: path.join(projectRoot, 'ingredient-consolidation-backup'),
  outputFile: path.join(projectRoot, 'ingredient-consolidation-results.json')
};

// ===== ENHANCED INGREDIENT INTERFACE =====
const UNIFIED_INGREDIENT_TEMPLATE = `
export interface UnifiedIngredient {
  // Core Properties
  name: string;
  category: string;
  subcategory?: string;
  
  // Elemental Properties (Self-Reinforcement Compliant)
  elementalProperties: {
    Fire: number;    // 0-1 scale
    Water: number;   // 0-1 scale  
    Earth: number;   // 0-1 scale
    Air: number;     // 0-1 scale
  };
  
  // Alchemical Properties (Core Metrics)
  alchemicalProperties: {
    Spirit: number;    // Volatile, transformative Essence
    Essence: number;   // Active principles and qualities
    Matter: number;    // Physical Substance and structure
    Substance: number; // Stable, enduring components
  };
  
  // Kalchm Value (Intrinsic Alchemical Equilibrium)
  kalchm: number;      // K_alchm = (Spirit^Spirit * Essence^Essence) / (Matter^Matter * Substance^Substance)
  
  // Enhanced Properties
  flavorProfile?: Record<string, number>;
  nutritionalProfile?: any;
  astrologicalProfile?: any;
  culinaryProperties?: any;
  storage?: any;
  preparation?: any;
  qualities?: string[];
  origin?: string[];
  affinities?: string[];
  healthBenefits?: string[];
  
  // Metadata
  metadata?: {
    sourceFile: string;
    enhancedAt: string;
    kalchmCalculated: boolean;
  };
}
`;

// ===== ALCHEMICAL CALCULATION FUNCTIONS =====
function deriveAlchemicalFromElemental(elementalProps) {
  const { Fire = 0, water = 0, earth = 0, Air = 0 } = elementalProps;
  
  // Mapping based on alchemical principles:
  // Spirit: Volatile, transformative (Fire + Air dominant)
  // Essence: Active principles (water + Fire)
  // Matter: Physical structure (earth dominant)
  // Substance: Stable components (earth + water)
  
  return {
    Spirit: (Fire * 0.6 + Air * 0.4),
    Essence: (water * 0.5 + Fire * 0.3 + Air * 0.2),
    Matter: (earth * 0.7 + water * 0.3),
    Substance: (earth * 0.5 + water * 0.4 + Fire * 0.1)
  };
}

function calculateKalchm(alchemicalProps) {
  const { Spirit, Essence, Matter, Substance } = alchemicalProps;
  
  // Handle edge cases where values might be 0
  const safespirit = Math.max(Spirit, 0.01);
  const safeessence = Math.max(Essence, 0.01);
  const safematter = Math.max(Matter, 0.01);
  const safesubstance = Math.max(Substance, 0.01);
  
  const numerator = Math.pow(safespirit, safespirit) * Math.pow(safeessence, safeessence);
  const denominator = Math.pow(safematter, safematter) * Math.pow(safesubstance, safesubstance);
  
  return numerator / denominator;
}

// ===== UTILITY FUNCTIONS =====
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = CONFIG.dryRun ? '[DRY RUN] ' : '';
  
  if (level === 'verbose' && !CONFIG.verbose) return;
  
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    warning: '\x1b[33m', // Yellow
    error: '\x1b[31m',   // Red
    verbose: '\x1b[90m'  // Gray
  };
  
  console.log(`${colors[level]}${prefix}${message}\x1b[0m`);
}

async function findIngredientFiles() {
  const files = [];
  
  async function scanDirectory(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await scanDirectory(fullPath);
        } else if (entry.name.endsWith('.ts') && !entry.name.includes('.test.') && !entry.name.includes('.spec.')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      log(`Error scanning directory ${dir}: ${error.message}`, 'error');
    }
  }
  
  await scanDirectory(CONFIG.ingredientsDir);
  return files;
}

async function parseIngredientFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const relativePath = path.relative(CONFIG.ingredientsDir, filePath);
    
    // Extract ingredient data using regex patterns
    const ingredientMatches = content.match(/const\s+raw\w+:\s*Record<string,\s*Partial<IngredientMapping>>\s*=\s*{([\s\S]*?)};/);
    const exportMatches = content.match(/export\s+(?:const|let)\s+(\w+):\s*Record<string,\s*IngredientMapping>\s*=/);
    
    if (!ingredientMatches) {
      log(`No ingredient data found in ${relativePath}`, 'warning');
      return null;
    }
    
    // Parse the ingredient object structure
    const ingredientData = ingredientMatches[1];
    const exportName = exportMatches ? exportMatches[1] : 'ingredients';
    
    // Extract individual ingredients
    const ingredients = [];
    const ingredientBlocks = ingredientData.split(/(?=\s*'[^']+'\s*:\s*{)/);
    
    for (const block of ingredientBlocks) {
      if (block.trim()) {
        const nameMatch = block.match(/'([^']+)'\s*:\s*{/);
        if (nameMatch) {
          const ingredientName = nameMatch[1];
          
          // Extract elemental properties
          const elementalMatch = block.match(/elementalProperties:\s*{\s*([^}]+)\s*}/);
          let elementalProperties = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
          
          if (elementalMatch) {
            const elementalStr = elementalMatch[1];
            const fireMatch = elementalStr.match(/Fire:\s*([\d.]+)/);
            const waterMatch = elementalStr.match(/Water:\s*([\d.]+)/);
            const earthMatch = elementalStr.match(/Earth:\s*([\d.]+)/);
            const AirMatch = elementalStr.match(/Air:\s*([\d.]+)/);
            
            if (fireMatch) elementalProperties.Fire = parseFloat(fireMatch[1]);
            if (waterMatch) elementalProperties.water = parseFloat(waterMatch[1]);
            if (earthMatch) elementalProperties.earth = parseFloat(earthMatch[1]);
            if (AirMatch) elementalProperties.Air = parseFloat(AirMatch[1]);
          }
          
          // Extract other properties
          const namePropertyMatch = block.match(/name:\s*'([^']+)'/);
          const categoryMatch = block.match(/category:\s*'([^']+)'/);
          const subcategoryMatch = block.match(/subcategory:\s*'([^']+)'/);
          
          ingredients.push({
            key: ingredientName,
            name: namePropertyMatch ? namePropertyMatch[1] : ingredientName,
            category: categoryMatch ? categoryMatch[1] : 'unknown',
            subcategory: subcategoryMatch ? subcategoryMatch[1] : undefined,
            elementalProperties,
            rawBlock: block
          });
        }
      }
    }
    
    return {
      filePath,
      relativePath,
      exportName,
      ingredients,
      originalContent: content
    };
    
  } catch (error) {
    log(`Error parsing ${filePath}: ${error.message}`, 'error');
    return null;
  }
}

function enhanceIngredientWithKalchm(ingredient) {
  // Derive alchemical properties from elemental properties
  const alchemicalProperties = deriveAlchemicalFromElemental(ingredient.elementalProperties);
  
  // Calculate Kalchm
  const kalchm = calculateKalchm(alchemicalProperties);
  
  return {
    ...ingredient,
    alchemicalProperties,
    kalchm,
    metadata: {
      sourceFile: ingredient.sourceFile || 'unknown',
      enhancedAt: new Date().toISOString(),
      kalchmCalculated: true
    }
  };
}

async function createUnifiedIngredientsFile(enhancedIngredients) {
  const unifiedContent = `// ===== UNIFIED INGREDIENTS SYSTEM =====
// Generated by ingredient consolidation script
// Phase 2 of WhatToEatNext Data Consolidation
// 
// This file consolidates all ingredient data with Kalchm integration
// while maintaining backward compatibility and elemental self-reinforcement principles.

import type { IngredientMapping } from '@/types/alchemy';
import { enhanceIngredientWithAlchemy } from './alchemicalCalculations';

${UNIFIED_INGREDIENT_TEMPLATE}

// ===== CONSOLIDATED INGREDIENT DATA =====
export const unifiedIngredients: Record<string, UnifiedIngredient> = {
${enhancedIngredients.map(ingredient => {
  const kalchmFormatted = ingredient.kalchm.toFixed(6);
  const alchemical = ingredient.alchemicalProperties;
  
  return `  '${ingredient.key}': {
    name: '${ingredient.name}',
    category: '${ingredient.category}',
    ${ingredient.subcategory ? `subcategory: '${ingredient.subcategory}',` : ''}
    elementalProperties: {
      Fire: ${ingredient.elementalProperties.Fire},
      Water: ${ingredient.elementalProperties.water},
      Earth: ${ingredient.elementalProperties.earth},
      Air: ${ingredient.elementalProperties.Air}
    },
    alchemicalProperties: {
      Spirit: ${alchemical.Spirit.toFixed(3)},
      Essence: ${alchemical.Essence.toFixed(3)},
      Matter: ${alchemical.Matter.toFixed(3)},
      Substance: ${alchemical.Substance.toFixed(3)}
    },
    kalchm: ${kalchmFormatted},
    metadata: {
      sourceFile: '${ingredient.metadata.sourceFile}',
      enhancedAt: '${ingredient.metadata.enhancedAt}',
      kalchmCalculated: true
    }
  }`;
}).join(',\n')}
};

// ===== KALCHM-BASED UTILITIES =====

/**
 * Find ingredients with similar Kalchm values (compatibility)
 */
export function findKalchmCompatibleIngredients(
  targetKalchm: number,
  tolerance = 0.2
): UnifiedIngredient[] {
  return Object.values(unifiedIngredients).filter(ingredient =>
    Math.abs(ingredient.kalchm - targetKalchm) <= tolerance
  );
}

/**
 * Get ingredients sorted by Kalchm value
 */
export function getIngredientsByKalchm(ascending = true): UnifiedIngredient[] {
  return Object.values(unifiedIngredients).sort((a, b) =>
    ascending ? a.kalchm - b.kalchm : b.kalchm - a.kalchm
  );
}

/**
 * Calculate Kalchm compatibility between two ingredients
 */
export function calculateIngredientCompatibility(
  ingredient1: string | UnifiedIngredient,
  ingredient2: string | UnifiedIngredient
): number {
  const ing1 = typeof ingredient1 === 'string' ? unifiedIngredients[ingredient1] : ingredient1;
  const ing2 = typeof ingredient2 === 'string' ? unifiedIngredients[ingredient2] : ingredient2;
  
  if (!ing1 || !ing2) return 0;
  
  const ratio = Math.min(ing1.kalchm, ing2.kalchm) / Math.max(ing1.kalchm, ing2.kalchm);
  return 0.7 + (ratio * 0.3); // Self-reinforcement: 0.7 minimum compatibility
}

// ===== CATEGORY EXPORTS =====
${generateCategoryExports(enhancedIngredients)}

// ===== BACKWARD COMPATIBILITY =====
// Export individual ingredient collections for existing imports
${generateBackwardCompatibilityExports(enhancedIngredients)}

export default unifiedIngredients;
`;

  return unifiedContent;
}

function generateCategoryExports(ingredients) {
  const categories = {};
  
  ingredients.forEach(ingredient => {
    if (!categories[ingredient.category]) {
      categories[ingredient.category] = [];
    }
    categories[ingredient.category].push(ingredient);
  });
  
  return Object.entries(categories).map(([category, items]) => {
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
    return `export const ${categoryName}Ingredients = {
${items.map(item => `  '${item.key}': unifiedIngredients['${item.key}']`).join(',\n')}
};`;
  }).join('\n\n');
}

function generateBackwardCompatibilityExports(ingredients) {
  // Group by source file to maintain original exports
  const sourceFiles = {};
  
  ingredients.forEach(ingredient => {
    const sourceFile = ingredient.metadata.sourceFile;
    if (!sourceFiles[sourceFile]) {
      sourceFiles[sourceFile] = [];
    }
    sourceFiles[sourceFile].push(ingredient);
  });
  
  return Object.entries(sourceFiles).map(([sourceFile, items]) => {
    const exportName = sourceFile.replace(/\.ts$/, '').replace(/[^a-zA-Z0-9]/g, '');
    return `// From ${sourceFile}
export const ${exportName} = {
${items.map(item => `  '${item.key}': unifiedIngredients['${item.key}']`).join(',\n')}
};`;
  }).join('\n\n');
}

async function createBackwardCompatibilityFiles(parsedFiles) {
  const compatibilityFiles = [];
  
  for (const fileData of parsedFiles) {
    if (!fileData) continue;
    
    // Calculate the correct relative path to unified/ingredients.ts
    const relativePath = fileData.relativePath;
    const pathDepth = relativePath.split('/').length - 1; // -1 for the filename
    const unifiedPath = '../'.repeat(pathDepth) + 'unified/ingredients';
    
    const compatibilityContent = `// ===== BACKWARD COMPATIBILITY FILE =====
// This file maintains compatibility for existing imports
// while redirecting to the unified ingredients system

import { unifiedIngredients } from '${unifiedPath}';
import type { IngredientMapping } from '@/types/alchemy';

// Re-export ingredients from unified system
export const ${fileData.exportName}: Record<string, IngredientMapping> = {
${fileData.ingredients.map(ingredient => 
  `  '${ingredient.key}': unifiedIngredients['${ingredient.key}'] as IngredientMapping`
).join(',\n')}
};

// Legacy export for backward compatibility
export const all${fileData.exportName.charAt(0).toUpperCase() + fileData.exportName.slice(1)} = Object.values(${fileData.exportName});

export default ${fileData.exportName};
`;

    // Create backup compatibility file instead of overwriting original
    const backupPath = fileData.filePath.replace('.ts', '.backup.ts');
    
    compatibilityFiles.push({
      path: backupPath,
      content: compatibilityContent,
      originalPath: fileData.filePath
    });
  }
  
  return compatibilityFiles;
}

// ===== MAIN CONSOLIDATION PROCESS =====
async function consolidateIngredients() {
  log('🚀 Starting Phase 2: Ingredient Consolidation with Kalchm Integration');
  
  const results = {
    startTime: new Date().toISOString(),
    totalFiles: 0,
    processedFiles: 0,
    enhancedIngredients: 0,
    errors: [],
    kalchmStats: {
      min: Infinity,
      max: -Infinity,
      average: 0,
      distribution: {}
    }
  };
  
  try {
    // Step 1: Find all ingredient files
    log('📁 Scanning ingredient files...');
    const ingredientFiles = await findIngredientFiles();
    results.totalFiles = ingredientFiles.length;
    log(`Found ${ingredientFiles.length} ingredient files`, 'success');
    
    // Step 2: Parse all ingredient files
    log('📖 Parsing ingredient files...');
    const parsedFiles = [];
    
    for (const filePath of ingredientFiles) {
      const parsed = await parseIngredientFile(filePath);
      if (parsed) {
        parsedFiles.push(parsed);
        results.processedFiles++;
        log(`✓ Parsed ${path.relative(CONFIG.ingredientsDir, filePath)} (${parsed.ingredients.length} ingredients)`, 'verbose');
      }
    }
    
    // Step 3: Enhance ingredients with Kalchm
    log('⚗️ Enhancing ingredients with alchemical properties...');
    const enhancedIngredients = [];
    
    for (const fileData of parsedFiles) {
      if (!fileData) continue;
      
      for (const ingredient of fileData.ingredients) {
        ingredient.sourceFile = fileData.relativePath;
        const enhanced = enhanceIngredientWithKalchm(ingredient);
        enhancedIngredients.push(enhanced);
        
        // Update Kalchm statistics
        results.kalchmStats.min = Math.min(results.kalchmStats.min, enhanced.kalchm);
        results.kalchmStats.max = Math.max(results.kalchmStats.max, enhanced.kalchm);
        
        results.enhancedIngredients++;
        log(`✓ Enhanced ${enhanced.name} (Kalchm: ${enhanced.kalchm.toFixed(6)})`, 'verbose');
      }
    }
    
    // Calculate Kalchm statistics
    results.kalchmStats.average = enhancedIngredients.reduce((sum, ing) => sum + ing.kalchm, 0) / enhancedIngredients.length;
    
    // Step 4: Create unified ingredients file
    if (!CONFIG.dryRun) {
      log('📝 Creating unified ingredients system...');
      await fs.mkdir(CONFIG.unifiedDir, { recursive: true });
      
      const unifiedContent = await createUnifiedIngredientsFile(enhancedIngredients);
      const unifiedPath = path.join(CONFIG.unifiedDir, 'ingredients.ts');
      await fs.writeFile(unifiedPath, unifiedContent);
      log(`✓ Created unified ingredients file: ${unifiedPath}`, 'success');
      
      // Step 5: Create index file for easy imports
      log('🔄 Creating unified index file...');
      const indexContent = `// ===== UNIFIED INGREDIENTS INDEX =====
// Centralized exports for all ingredient data with Kalchm integration

export { 
  unifiedIngredients,
  findKalchmCompatibleIngredients,
  getIngredientsByKalchm,
  calculateIngredientCompatibility,
  type UnifiedIngredient
} from './ingredients';

// Category-specific exports
export {
  FruitIngredients,
  UnknownIngredients,
  GrainIngredients,
  HerbIngredients,
  OilIngredients,
  ProteinIngredients,
  SeasoningIngredients,
  SpiceIngredients,
  VegetableIngredients,
  VinegarIngredients
} from './ingredients';

export default unifiedIngredients;
`;
      
      const indexPath = path.join(CONFIG.unifiedDir, 'index.ts');
      await fs.writeFile(indexPath, indexContent);
      log(`✓ Created unified index file: ${indexPath}`, 'success');
    }
    
    // Step 6: Generate results
    results.endTime = new Date().toISOString();
    results.duration = new Date(results.endTime) - new Date(results.startTime);
    
    log('📊 Consolidation Results:', 'success');
    log(`   • Files processed: ${results.processedFiles}/${results.totalFiles}`, 'info');
    log(`   • Ingredients enhanced: ${results.enhancedIngredients}`, 'info');
    log(`   • Kalchm range: ${results.kalchmStats.min.toFixed(6)} - ${results.kalchmStats.max.toFixed(6)}`, 'info');
    log(`   • Average Kalchm: ${results.kalchmStats.average.toFixed(6)}`, 'info');
    log(`   • Duration: ${results.duration}ms`, 'info');
    
    if (!CONFIG.dryRun) {
      await fs.writeFile(CONFIG.outputFile, JSON.stringify(results, null, 2));
      log(`📄 Results saved to: ${CONFIG.outputFile}`, 'success');
    }
    
    log('✅ Phase 2 ingredient consolidation completed successfully!', 'success');
    
  } catch (error) {
    log(`❌ Consolidation failed: ${error.message}`, 'error');
    results.errors.push(error.message);
    throw error;
  }
  
  return results;
}

// ===== SCRIPT EXECUTION =====
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    await consolidateIngredients();
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  }
}

export { consolidateIngredients }; 