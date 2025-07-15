#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Required fields for ingredient coverage analysis
const REQUIRED_FIELDS = [
  'name', 'category', 'subCategory', 'sensoryProfile', 'culinaryProfile', 
  'origin', 'season', 'preparation', 'nutritionalProfile', 'storage', 
  'varieties', 'astrologicalProfile', 'elementalProperties', 'qualities'
];

function analyzeIngredientFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip files that don't contain ingredient objects
    if (!content.includes('elementalProperties') || !content.includes('name')) {
      return null;
    }
    
    // Count ingredients by looking for object definitions with names
    const ingredientMatches = content.match(/['"][\w_]+['"]:\s*{[^}]*name:/g) || [];
    const ingredientCount = ingredientMatches.length;
    
    if (ingredientCount === 0) {
      return null;
    }
    
    // Count required field occurrences
    const fieldCounts = {};
    REQUIRED_FIELDS.forEach(field => {
      const regex = new RegExp(`${field}:`, 'g');
      const matches = content.match(regex) || [];
      fieldCounts[field] = matches.length;
    });
    
    // Calculate coverage
    const totalPossibleFields = REQUIRED_FIELDS.length * ingredientCount;
    const actualFields = Object.values(fieldCounts).reduce((sum, count) => sum + count, 0);
    const coverage = Math.round((actualFields / totalPossibleFields) * 100);
    
    return {
      file: path.relative(process.cwd(), filePath),
      ingredients: ingredientCount,
      coverage,
      missingFields: REQUIRED_FIELDS.filter(field => fieldCounts[field] < ingredientCount)
    };
  } catch (error) {
    return null;
  }
}

function findIngredientFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item.endsWith('.ts') && !item.includes('index') && !item.includes('types')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

// Main analysis
const ingredientsDir = path.join(process.cwd(), 'src/data/ingredients');
const ingredientFiles = findIngredientFiles(ingredientsDir);

console.log('🔍 TARGETED LOW COVERAGE ANALYSIS\\n');

const analyses = ingredientFiles
  .map(file => analyzeIngredientFile(file))
  .filter(analysis => analysis !== null)
  .sort((a, b) => {
    // Sort by coverage (lowest first), then by ingredient count (highest first)
    if (a.coverage !== b.coverage) {
      return a.coverage - b.coverage;
    }
    return b.ingredients - a.ingredients;
  });

// Categorize files
const redZone = analyses.filter(a => a.coverage < 71);
const yellowZone = analyses.filter(a => a.coverage >= 71 && a.coverage < 86);
const greenZone = analyses.filter(a => a.coverage >= 86);

console.log('📊 COVERAGE ZONES:');
console.log(`🟢 Green Zone (86%+): ${greenZone.length} files`);
console.log(`🟡 Yellow Zone (71-85%): ${yellowZone.length} files`);
console.log(`🔴 Red Zone (<71%): ${redZone.length} files\\n`);

// Show top targets for enhancement
console.log('🎯 TOP ENHANCEMENT TARGETS (High Impact):');
console.log('\\n🔴 RED ZONE FILES:');
redZone.slice(0, 10).forEach((analysis, index) => {
  console.log(`${index + 1}. ${analysis.file}: ${analysis.coverage}% (${analysis.ingredients} ingredients)`);
  if (analysis.missingFields.length > 0) {
    console.log(`   Missing: ${analysis.missingFields.slice(0, 3).join(', ')}${analysis.missingFields.length > 3 ? '...' : ''}`);
  }
});

console.log('\\n🟡 YELLOW ZONE FILES:');
yellowZone.forEach((analysis, index) => {
  console.log(`${index + 1}. ${analysis.file}: ${analysis.coverage}% (${analysis.ingredients} ingredients)`);
  if (analysis.missingFields.length > 0) {
    console.log(`   Missing: ${analysis.missingFields.slice(0, 3).join(', ')}${analysis.missingFields.length > 3 ? '...' : ''}`);
  }
});

// Calculate impact potential
const totalFiles = analyses.length;
const currentGreenPercentage = Math.round((greenZone.length / totalFiles) * 100);

console.log(`\\n📈 IMPACT ANALYSIS:`);
console.log(`Current Green Zone: ${currentGreenPercentage}% (${greenZone.length}/${totalFiles} files)`);
console.log(`Files needing enhancement: ${redZone.length + yellowZone.length}`);

// Show specific recommendations
if (redZone.length > 0 || yellowZone.length > 0) {
  console.log(`\\n🚀 RECOMMENDED ENHANCEMENT ORDER:`);
  
  const targets = [...yellowZone, ...redZone.slice(0, 5)]
    .sort((a, b) => b.ingredients - a.ingredients)
    .slice(0, 8);
    
  targets.forEach((target, index) => {
    const impact = target.ingredients > 20 ? 'HIGH' : target.ingredients > 10 ? 'MEDIUM' : 'LOW';
    console.log(`${index + 1}. ${target.file} - ${target.coverage}% → Target 90%+ (${target.ingredients} ingredients, ${impact} impact)`);
  });
} 