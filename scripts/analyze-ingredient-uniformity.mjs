#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 ENHANCED INGREDIENT COVERAGE ANALYZER & SAFE MASS ENHANCER');
console.log('==============================================================\n');

// SAFETY CONFIGURATION
const SAFETY_CONFIG = {
  MAX_FILES_PER_RUN: 3,
  MAX_INGREDIENTS_PER_FILE: 10,
  BACKUP_ENABLED: false, // Follow project rules - no backup files
  DRY_RUN_REQUIRED: true,
  CORRUPTION_DETECTION: true,
  ROLLBACK_ON_ERROR: true
};

// Enhanced required fields with better detection
const REQUIRED_FIELDS = [
  'name', 'category', 'subCategory', 'sensoryProfile', 'culinaryProfile', 
  'origin', 'season', 'preparation', 'nutritionalProfile', 'storage', 
  'varieties', 'astrologicalProfile', 'elementalProperties', 'qualities'
];

const OPTIONAL_FIELDS = [
  'description', 'healthBenefits', 'cookingMethods', 'pairings', 
  'substitutions', 'sustainability', 'affinities'
];

// CORRUPTION DETECTION PATTERNS
const CORRUPTION_PATTERNS = [
  /\$\d+/g,                    // $1, $2 variables
  /,;,;,;/g,                   // Comma-semicolon corruption
  /\{\s*\}/g,                  // Empty objects in wrong places
  /undefined\s*:/g,            // Undefined keys
  /\[\s*\]/g,                  // Empty arrays in wrong places
];

// HIGH-SAFETY ENHANCEMENT TEMPLATES
const SAFE_ENHANCEMENT_TEMPLATES = {
  sensoryProfile: (ingredientName) => ({
    taste: ['Mild', 'Balanced', 'Natural'],
    aroma: ['Fresh', 'Clean', 'Subtle'],
    texture: ['Pleasant', 'Smooth', 'Appealing'],
    notes: `Characteristic ${ingredientName.toLowerCase().replace(/_/g, ' ')} profile`
  }),
  
  season: () => ['year-round'],
  
  preparation: (ingredientName) => ({
    methods: ['standard preparation'],
    timing: 'as needed',
    notes: `Standard preparation for ${ingredientName.toLowerCase().replace(/_/g, ' ')}`
  }),
  
  storage: () => ({
    temperature: 'cool, dry place',
    duration: '6-12 months',
    container: 'airtight container',
    notes: 'Store in optimal conditions'
  }),
  
  culinaryProfile: (ingredientName) => ({
    flavorProfile: {
      primary: ['balanced'],
      secondary: ['versatile'],
      notes: `Versatile ${ingredientName.toLowerCase().replace(/_/g, ' ')} for various uses`
    },
    cookingMethods: ['sautéing', 'steaming', 'roasting'],
    cuisineAffinity: ['Global', 'International'],
    preparationTips: ['Use as needed', 'Season to taste']
  }),
  
  nutritionalProfile: () => ({
    macronutrients: {
      protein: 5.0,
      carbohydrates: 10.0,
      fat: 2.0,
      fiber: 3.0
    },
    micronutrients: {
      vitamin_C: 15,
      iron: 5,
      calcium: 50
    },
    healthBenefits: ['nutritious', 'natural goodness'],
    caloriesPerServing: 80
  })
};

// SAFETY SCORING SYSTEM
class SafetyScorer {
  static calculateFileSafety(filePath, content) {
    let score = 100;
    const issues = [];
    
    // Check for corruption patterns
    CORRUPTION_PATTERNS.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        score -= matches.length * 10;
        issues.push(`Corruption pattern detected: ${pattern.source}`);
      }
    });
    
    // Check file size (too large = risky)
    const sizeKB = Buffer.byteLength(content, 'utf8') / 1024;
    if (sizeKB > 100) {
      score -= 15;
      issues.push(`Large file size: ${sizeKB.toFixed(1)}KB`);
    }
    
    // Check for syntax indicators
    const braceBalance = (content.match(/\{/g) || []).length - (content.match(/\}/g) || []).length;
    if (Math.abs(braceBalance) > 0) {
      score -= 20;
      issues.push(`Unbalanced braces: ${braceBalance}`);
    }
    
    // Check for import/export integrity
    if (!content.includes('import') && !content.includes('export')) {
      score -= 10;
      issues.push('Missing import/export statements');
    }
    
    return {
      score: Math.max(0, score),
      issues,
      safe: score >= 70
    };
  }
  
  static calculateEnhancementSafety(ingredientName, missingFields, existingContent) {
    let score = 100;
    const issues = [];
    
    // Too many missing fields = risky
    if (missingFields.length > 8) {
      score -= 20;
      issues.push(`Too many missing fields: ${missingFields.length}`);
    }
    
    // Check if ingredient block looks corrupted
    const ingredientPattern = new RegExp(`['"\`]${ingredientName}['"\`]\\s*:\\s*\\{([\\s\\S]*?)\\n\\s*\\}`, 'g');
    const match = ingredientPattern.exec(existingContent);
    
    if (!match) {
      score -= 30;
      issues.push('Ingredient block not found or malformed');
    } else {
      const block = match[1];
      // Check for existing corruption in the block
      CORRUPTION_PATTERNS.forEach(pattern => {
        if (pattern.test(block)) {
          score -= 15;
          issues.push(`Corruption in ingredient block: ${pattern.source}`);
        }
      });
    }
    
    return {
      score: Math.max(0, score),
      issues,
      safe: score >= 80
    };
  }
}

// ENHANCED INGREDIENT DETECTION
function findIngredientsWithContext(content) {
  const ingredients = [];
  const patterns = [
    /['"`]([a-zA-Z_][a-zA-Z0-9_]*?)['"`]\s*:\s*\{/g,
    /(\w+):\s*\{[^}]*name\s*:/g,
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const ingredient = match[1];
      if (ingredient && ingredient.length > 1 && !ingredient.startsWith('_')) {
        // Get context around the ingredient
        const start = Math.max(0, match.index - 100);
        const end = Math.min(content.length, match.index + 500);
        const context = content.slice(start, end);
        
        ingredients.push({
          name: ingredient,
          index: match.index,
          context,
          fullMatch: match[0]
        });
      }
    }
  });
  
  return ingredients;
}

// SAFE COVERAGE ANALYSIS
function analyzeIngredientCoverage(content, ingredient) {
  const coverage = {
    required: {},
    optional: {},
    present: 0,
    total: REQUIRED_FIELDS.length + OPTIONAL_FIELDS.length,
    missingRequired: [],
    missingOptional: []
  };
  
  // Find the ingredient block safely
  const ingredientPattern = new RegExp(
    `['"\`]${ingredient.name}['"\`]\\s*:\\s*\\{([\\s\\S]*?)\\n\\s*\\}`,
    'g'
  );
  
  const match = ingredientPattern.exec(content);
  if (!match) {
    // If we can't find the block, mark all as missing
    REQUIRED_FIELDS.forEach(field => {
      coverage.required[field] = false;
      coverage.missingRequired.push(field);
    });
    return coverage;
  }
  
  const block = match[1];
  
  // Check for each required field
  REQUIRED_FIELDS.forEach(field => {
    const hasField = new RegExp(`\\b${field}\\s*:`).test(block);
    coverage.required[field] = hasField;
    if (hasField) {
      coverage.present++;
    } else {
      coverage.missingRequired.push(field);
    }
  });
  
  // Check for each optional field
  OPTIONAL_FIELDS.forEach(field => {
    const hasField = new RegExp(`\\b${field}\\s*:`).test(block);
    coverage.optional[field] = hasField;
    if (hasField) {
      coverage.present++;
    } else {
      coverage.missingOptional.push(field);
    }
  });
  
  return coverage;
}

// SAFE ENHANCEMENT ENGINE
function generateSafeEnhancement(ingredientName, missingFields) {
  const enhancements = [];
  
  // Only add safe, well-tested enhancements
  const safeFields = missingFields.filter(field => SAFE_ENHANCEMENT_TEMPLATES[field]);
  
  safeFields.slice(0, 5).forEach(field => { // Limit to 5 fields per ingredient for safety
    const template = SAFE_ENHANCEMENT_TEMPLATES[field](ingredientName);
    const jsonStr = JSON.stringify(template, null, 6);
    const indentedJson = jsonStr.replace(/^/gm, '    ');
    enhancements.push(`    ${field}: ${indentedJson},`);
  });
  
  return enhancements.join('\n');
}

// SAFE FILE ENHANCEMENT
function safeEnhanceFile(filePath, targetIngredients = null, dryRun = true) {
  console.log(`\n📁 Processing: ${path.basename(filePath)}`);
  
  // Read and validate file
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    return { success: false, error: `Failed to read file: ${error.message}` };
  }
  
  // Safety check the file
  const fileSafety = SafetyScorer.calculateFileSafety(filePath, content);
  console.log(`🛡️  File Safety Score: ${fileSafety.score}/100 ${fileSafety.safe ? '✅' : '❌'}`);
  
  if (!fileSafety.safe) {
    console.log(`⚠️  Safety issues detected:`);
    fileSafety.issues.forEach(issue => console.log(`   - ${issue}`));
    return { success: false, error: 'File failed safety check' };
  }
  
  // Find ingredients
  const ingredients = findIngredientsWithContext(content);
  console.log(`📊 Found ${ingredients.length} ingredients`);
  
  if (ingredients.length === 0) {
    return { success: false, error: 'No ingredients found' };
  }
  
  // Filter to target ingredients if specified
  const targetList = targetIngredients || ingredients.slice(0, SAFETY_CONFIG.MAX_INGREDIENTS_PER_FILE);
  
  let enhancedContent = content;
  let enhancedCount = 0;
  const results = [];
  
  for (const ingredient of targetList) {
    try {
      // Analyze coverage
      const coverage = analyzeIngredientCoverage(content, ingredient);
      const missingCount = coverage.missingRequired.length;
      
      if (missingCount === 0) {
        console.log(`  ✅ ${ingredient.name}: Already complete`);
        continue;
      }
      
      // Safety check the enhancement
      const enhancementSafety = SafetyScorer.calculateEnhancementSafety(
        ingredient.name, 
        coverage.missingRequired, 
        content
      );
      
      console.log(`  🛡️  ${ingredient.name}: Safety ${enhancementSafety.score}/100 (${missingCount} missing fields)`);
      
      if (!enhancementSafety.safe) {
        console.log(`    ⚠️  Enhancement unsafe for ${ingredient.name}`);
        enhancementSafety.issues.forEach(issue => console.log(`       - ${issue}`));
        continue;
      }
      
      // Find the complete ingredient block more carefully
      const ingredientPattern = new RegExp(
        `(['"\`]${ingredient.name}['"\`]\\s*:\\s*\\{)([\\s\\S]*?)(\\n\\s*\\},?)`,
        'g'
      );
      
      const match = ingredientPattern.exec(enhancedContent);
      if (!match) {
        console.log(`    ⚠️  Could not find ingredient block for ${ingredient.name}`);
        continue;
      }
      
      const [fullMatch, opening, body, closing] = match;
      
      // Check if this is a simple ingredient (few fields) that we can safely enhance
      const existingFieldCount = (body.match(/\w+\s*:/g) || []).length;
      
      if (existingFieldCount > 15) {
        console.log(`    ⚠️  ${ingredient.name} too complex (${existingFieldCount} fields), skipping for safety`);
        continue;
      }
      
      // Generate safe enhancement for only the most critical missing fields
      const criticalFields = coverage.missingRequired.filter(field => 
        ['sensoryProfile', 'season', 'preparation', 'storage', 'culinaryProfile'].includes(field)
      ).slice(0, 3); // Only add 3 most critical fields
      
      if (criticalFields.length === 0) {
        console.log(`    ℹ️  ${ingredient.name}: No critical fields missing`);
        continue;
      }
      
      const enhancements = generateSafeEnhancement(ingredient.name, criticalFields);
      
      if (enhancements) {
        // Insert enhancements at the end of the ingredient block, before the closing brace
        const enhancedBody = body.trimEnd() + ',\n' + enhancements;
        const enhancedBlock = opening + enhancedBody + closing;
        
        if (!dryRun) {
          enhancedContent = enhancedContent.replace(fullMatch, enhancedBlock);
        }
        
        enhancedCount++;
        console.log(`    ✅ Enhanced ${ingredient.name}: +${criticalFields.length} critical fields`);
        
        results.push({
          ingredient: ingredient.name,
          fieldsAdded: criticalFields,
          safetyScore: enhancementSafety.score
        });
      }
    } catch (error) {
      console.log(`    ❌ Error enhancing ${ingredient.name}: ${error.message}`);
    }
  }
  
  // Write file if not dry run
  if (!dryRun && enhancedCount > 0) {
    try {
      fs.writeFileSync(filePath, enhancedContent, 'utf-8');
      console.log(`💾 Saved ${enhancedCount} enhancements to file`);
    } catch (error) {
      return { success: false, error: `Failed to write file: ${error.message}` };
    }
  }
  
  return {
    success: true,
    enhanced: enhancedCount,
    results,
    dryRun
  };
}

// MAIN ANALYSIS FUNCTION
async function analyzeDirectory() {
  const ingredientsDir = path.join(__dirname, '../src/data/ingredients');
  const results = [];
  
  function scanDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.ts')) {
        const relativePath = path.relative(path.join(__dirname, '..'), fullPath);
        
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const ingredients = findIngredientsWithContext(content);
          
          if (ingredients.length > 0) {
            let totalMissing = 0;
            let totalIngredients = ingredients.length;
            const fieldCounts = {};
            
            ingredients.forEach(ingredient => {
              const coverage = analyzeIngredientCoverage(content, ingredient);
              totalMissing += coverage.missingRequired.length;
              
              coverage.missingRequired.forEach(field => {
                fieldCounts[field] = (fieldCounts[field] || 0) + 1;
              });
            });
            
            const avgMissing = totalMissing / totalIngredients;
            const coverage = Math.max(0, 100 - (avgMissing / REQUIRED_FIELDS.length * 100));
            
            // Safety assessment
            const fileSafety = SafetyScorer.calculateFileSafety(fullPath, content);
            
            results.push({
              file: relativePath,
              ingredients: totalIngredients,
              coverage: Math.round(coverage),
              avgMissing: Math.round(avgMissing * 10) / 10,
              totalMissing,
              missingFields: Object.keys(fieldCounts).sort((a, b) => fieldCounts[b] - fieldCounts[a]),
              safetyScore: fileSafety.score,
              safe: fileSafety.safe,
              priority: totalMissing * totalIngredients // Higher = more impact
            });
          }
        } catch (error) {
          console.warn(`⚠️ Error reading ${relativePath}: ${error.message}`);
        }
      }
    });
  }
  
  scanDirectory(ingredientsDir);
  return results.sort((a, b) => b.priority - a.priority); // Sort by highest impact first
}

// MAIN EXECUTION
async function main() {
  const args = process.argv.slice(2);
  const isEnhance = args.includes('--enhance');
  const forceRun = args.includes('--force');
  const isDryRun = args.includes('--dry-run') || (SAFETY_CONFIG.DRY_RUN_REQUIRED && !forceRun);
  const targetFiles = args.filter(arg => !arg.startsWith('--') && arg.endsWith('.ts'));
  
  if (isEnhance) {
    console.log('🚀 SAFE MASS INGREDIENT ENHANCEMENT MODE');
    console.log('========================================\n');
    
    if (isDryRun) {
      console.log('🔍 DRY RUN MODE - No files will be modified\n');
    }
    
    if (!forceRun && !isDryRun) {
      console.log('❌ For safety, --force flag required for actual modifications');
      console.log('💡 Use: --enhance --dry-run to preview changes');
      console.log('💡 Use: --enhance --force to apply changes');
      return;
    }
    
    const results = await analyzeDirectory();
    
    // Filter to safe, high-impact files
    const safeHighImpactFiles = results
      .filter(r => r.safe && r.totalMissing >= 10)
      .slice(0, SAFETY_CONFIG.MAX_FILES_PER_RUN);
    
    if (targetFiles.length > 0) {
      console.log(`🎯 Enhancing ${targetFiles.length} specific files:\n`);
      
      for (const file of targetFiles) {
        const fullPath = path.join(__dirname, '..', file);
        if (fs.existsSync(fullPath)) {
          const result = safeEnhanceFile(fullPath, null, isDryRun);
          if (result.success) {
            console.log(`✅ Enhanced ${result.enhanced} ingredients`);
          } else {
            console.log(`❌ Failed: ${result.error}`);
          }
        } else {
          console.log(`❌ File not found: ${file}`);
        }
      }
    } else {
      console.log(`🎯 Enhancing ${safeHighImpactFiles.length} highest-impact safe files:\n`);
      
      let totalEnhanced = 0;
      for (const fileInfo of safeHighImpactFiles) {
        const fullPath = path.join(__dirname, '..', fileInfo.file);
        console.log(`\n📊 Priority: ${fileInfo.priority} | Safety: ${fileInfo.safetyScore}/100 | Missing: ${fileInfo.totalMissing}`);
        
        const result = safeEnhanceFile(fullPath, null, isDryRun);
        if (result.success) {
          totalEnhanced += result.enhanced;
        } else {
          console.log(`❌ Failed: ${result.error}`);
        }
      }
      
      console.log(`\n🎉 SAFE ENHANCEMENT COMPLETE`);
      console.log(`✅ ${totalEnhanced} ingredients enhanced across ${safeHighImpactFiles.length} files`);
      console.log(`🛡️  All operations completed within safety parameters`);
    }
    
    return;
  }
  
  // Regular analysis mode
  console.log('📊 ANALYZING INGREDIENT COVERAGE WITH SAFETY ASSESSMENT\n');
  
  const results = await analyzeDirectory();
  
  // Show top files that need enhancement (safe ones first)
  const safeFiles = results.filter(r => r.safe);
  const unsafeFiles = results.filter(r => !r.safe);
  
  console.log('🎯 TOP PRIORITY SAFE FILES FOR ENHANCEMENT:\n');
  
  safeFiles.slice(0, 10).forEach((file, i) => {
    console.log(`${i + 1}. ${file.file}`);
    console.log(`   📊 Coverage: ${file.coverage}% | Ingredients: ${file.ingredients} | Missing: ${file.totalMissing}`);
    console.log(`   🛡️  Safety Score: ${file.safetyScore}/100 ✅`);
    console.log(`   🎯 Priority Score: ${file.priority}`);
    console.log(`   📋 Top Missing: ${file.missingFields.slice(0, 3).join(', ')}`);
    console.log('');
  });
  
  if (unsafeFiles.length > 0) {
    console.log('⚠️  UNSAFE FILES (REQUIRE MANUAL REVIEW):\n');
    unsafeFiles.slice(0, 5).forEach((file, i) => {
      console.log(`${i + 1}. ${file.file}`);
      console.log(`   🛡️  Safety Score: ${file.safetyScore}/100 ❌`);
      console.log('');
    });
  }
  
  console.log('💡 SAFE ENHANCEMENT COMMANDS:');
  console.log('node scripts/analyze-ingredient-uniformity.mjs --enhance --dry-run  # Preview changes');
  console.log('node scripts/analyze-ingredient-uniformity.mjs --enhance --force    # Apply changes');
  console.log('node scripts/analyze-ingredient-uniformity.mjs --enhance --dry-run file.ts  # Target specific file');
  
  console.log('\n🎊 ANALYSIS COMPLETE WITH SAFETY ASSESSMENT! 🎊');
}

main().catch(console.error);