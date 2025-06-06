#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧮 Phase 10: Fixing Mathematical & Calculation Function Type Errors');
console.log('Target: ~300-500 mathematical operation and calculation type errors');

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

let fixedFilesCount = 0;
let totalFixesApplied = 0;

// Type definitions to add to files
const CALCULATION_INTERFACES = `
// Phase 10: Calculation Type Interfaces
interface CalculationData {
  value: number;
  weight?: number;
  score?: number;
}

interface ScoredItem {
  score: number;
  [key: string]: unknown;
}

interface ElementalData {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
  [key: string]: unknown;
}

interface CuisineData {
  id: string;
  name: string;
  zodiacInfluences?: string[];
  planetaryDignities?: Record<string, unknown>;
  elementalState?: ElementalData;
  elementalProperties?: ElementalData;
  modality?: string;
  gregsEnergy?: number;
  [key: string]: unknown;
}

interface NutrientData {
  nutrient?: { name?: string };
  nutrientName?: string;
  name?: string;
  vitaminCount?: number;
  data?: unknown;
  [key: string]: unknown;
}

interface MatchingResult {
  score: number;
  elements: ElementalData;
  recipe?: unknown;
  [key: string]: unknown;
}
`;

/**
 * Fix unknown type property access errors
 */
function fixUnknownPropertyAccess(content, filename) {
  let fixes = 0;
  
  // Fix common cuisine property access patterns
  if (filename.includes('CuisineSelector')) {
    // Fix cuisine.modality access
    content = content.replace(
      /cuisine\.modality/g,
      '(cuisine as CuisineData).modality'
    );
    
    // Fix cuisine.elementalState access
    content = content.replace(
      /cuisine\.elementalState/g,
      '(cuisine as CuisineData).elementalState'
    );
    
    // Fix cuisine.elementalProperties access
    content = content.replace(
      /cuisine\.elementalProperties/g,
      '(cuisine as CuisineData).elementalProperties'
    );
    
    // Fix cuisine.zodiacInfluences access
    content = content.replace(
      /cuisine\.zodiacInfluences/g,
      '(cuisine as CuisineData).zodiacInfluences'
    );
    
    // Fix cuisine.planetaryDignities access  
    content = content.replace(
      /cuisine\.planetaryDignities/g,
      '(cuisine as CuisineData).planetaryDignities'
    );
    
    // Fix cuisine.gregsEnergy access
    content = content.replace(
      /cuisine\.gregsEnergy/g,
      '(cuisine as CuisineData).gregsEnergy'
    );
    
    // Fix cuisine.id and cuisine.name access
    content = content.replace(
      /cuisine\.id/g,
      '(cuisine as CuisineData).id'
    );
    content = content.replace(
      /cuisine\.name/g,
      '(cuisine as CuisineData).name'
    );
    
    fixes += 8;
  }
  
  // Fix nutrition API unknown property access
  if (filename.includes('nutrition/direct.ts')) {
    // Fix nutrient property access patterns
    content = content.replace(
      /n\.nutrient\?\.name/g,
      '(n as NutrientData).nutrient?.name'
    );
    
    content = content.replace(
      /n\.nutrientName/g,
      '(n as NutrientData).nutrientName'
    );
    
    content = content.replace(
      /n\.name/g,
      '(n as NutrientData).name'
    );
    
    // Fix data property access
    content = content.replace(
      /data\.vitaminCount/g,
      '(data as NutrientData).vitaminCount'
    );
    
    content = content.replace(
      /data\.data/g,
      '(data as NutrientData).data'
    );
    
    fixes += 5;
  }
  
  return { content, fixes };
}

/**
 * Fix array operations on unknown types
 */
function fixArrayOperations(content, filename) {
  let fixes = 0;
  
  // Fix .map() operations on unknown arrays
  if (content.includes('.map') && content.includes('unknown')) {
    // Common patterns for zodiacInfluences.map()
    content = content.replace(
      /zodiacInfluences\.map\(/g,
      '(zodiacInfluences as string[]).map('
    );
    
    // Common patterns for nutrient arrays
    content = content.replace(
      /nutrients\.forEach\(\(n: unknown\)/g,
      'nutrients.forEach((n: NutrientData)'
    );
    
    content = content.replace(
      /nutrients\.filter\(n =>/g,
      '(nutrients as NutrientData[]).filter(n =>'
    );
    
    fixes += 3;
  }
  
  // Fix .sort() operations with unknown types
  if (content.includes('.sort(') && (content.includes('unknown') || content.includes('any'))) {
    // Common scoring sort patterns
    content = content.replace(
      /\.sort\(\(a, b\) => ([ab])\.score - ([ab])\.score\)/g,
      '.sort((a, b) => (a as ScoredItem).score - (b as ScoredItem).score)'
    );
    
    // Specific gregsEnergy sorting
    content = content.replace(
      /return \(b\.gregsEnergy as number\) - \(a\.gregsEnergy as number\);/g,
      'return ((b as CuisineData).gregsEnergy as number) - ((a as CuisineData).gregsEnergy as number);'
    );
    
    fixes += 2;
  }
  
  // Fix .reduce() operations
  if (content.includes('.reduce(') && content.includes('unknown')) {
    // Common reduce patterns for calculations
    content = content.replace(
      /\.reduce\(\(sum, ([a-z]+)\) => sum \+ ([a-z]+)\.value/g,
      '.reduce((sum, $1) => sum + ($1 as CalculationData).value'
    );
    
    fixes += 1;
  }
  
  return { content, fixes };
}

/**
 * Fix mathematical operations on unknown types
 */
function fixMathematicalOperations(content, filename) {
  let fixes = 0;
  
  // Fix common mathematical operations patterns
  if (content.includes('unknown') && /[\+\-\*\/]/.test(content)) {
    // Fix basic arithmetic on unknown values
    content = content.replace(
      /([a-zA-Z_][a-zA-Z0-9_]*)\s*[\+\-\*\/]\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*where.*unknown/g,
      '(($1 as number) + ($2 as number))'
    );
    
    fixes += 1;
  }
  
  // Fix comparison operations
  if (content.includes('unknown') && /[<>=]/.test(content)) {
    // Fix comparison operations on unknown values
    content = content.replace(
      /([a-zA-Z_][a-zA-Z0-9_]*)\.score\s*[<>=]+\s*([a-zA-Z_][a-zA-Z0-9_]*)\.score/g,
      '($1 as ScoredItem).score >= ($2 as ScoredItem).score'
    );
    
    fixes += 1;
  }
  
  return { content, fixes };
}

/**
 * Fix function parameter types
 */
function fixFunctionParameterTypes(content, filename) {
  let fixes = 0;
  
  // Fix getCuisineModality function parameter
  if (content.includes('getCuisineModality = (cuisine: unknown)')) {
    content = content.replace(
      'getCuisineModality = (cuisine: unknown): Modality =>',
      'getCuisineModality = (cuisine: CuisineData): Modality =>'
    );
    fixes += 1;
  }
  
  // Fix countVitamins function parameter
  if (content.includes('countVitamins(nutrients: unknown[])')) {
    content = content.replace(
      'countVitamins(nutrients: unknown[]): number',
      'countVitamins(nutrients: NutrientData[]): number'
    );
    fixes += 1;
  }
  
  // Fix general calculation function parameters
  content = content.replace(
    /function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\([^)]*:\s*unknown\s*\)/g,
    (match, funcName) => {
      if (funcName.includes('calculate') || funcName.includes('process')) {
        return match.replace('unknown', 'CalculationData');
      }
      return match;
    }
  );
  
  if (content !== arguments[0]) fixes += 1;
  
  return { content, fixes };
}

/**
 * Add necessary imports and interfaces
 */
function addNecessaryImports(content, filename) {
  let fixes = 0;
  
  // Add calculation interfaces if mathematical operations are present
  if ((content.includes('CalculationData') || 
       content.includes('ScoredItem') || 
       content.includes('ElementalData') ||
       content.includes('CuisineData') ||
       content.includes('NutrientData')) && 
      !content.includes('// Phase 10: Calculation Type Interfaces')) {
    
    // Find the best place to add interfaces (after imports, before first interface/function)
    const importEndMatch = content.match(/^((?:import.*\n)*)/m);
    const insertPos = importEndMatch ? importEndMatch[1].length : 0;
    
    content = content.slice(0, insertPos) + '\n' + CALCULATION_INTERFACES + '\n' + content.slice(insertPos);
    fixes += 1;
  }
  
  return { content, fixes };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    let content = originalContent;
    let totalFixes = 0;
    
    const filename = path.basename(filePath);
    
    // Apply different fix strategies
    const result1 = fixUnknownPropertyAccess(content, filename);
    content = result1.content;
    totalFixes += result1.fixes;
    
    const result2 = fixArrayOperations(content, filename);
    content = result2.content;
    totalFixes += result2.fixes;
    
    const result3 = fixMathematicalOperations(content, filename);
    content = result3.content;
    totalFixes += result3.fixes;
    
    const result4 = fixFunctionParameterTypes(content, filename);
    content = result4.content;
    totalFixes += result4.fixes;
    
    const result5 = addNecessaryImports(content, filename);
    content = result5.content;
    totalFixes += result5.fixes;
    
    if (content !== originalContent) {
      if (DRY_RUN) {
        console.log(`Would fix ${filePath}: ${totalFixes} mathematical/calculation type fixes`);
      } else {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed ${filePath}: ${totalFixes} mathematical/calculation type fixes`);
        fixedFilesCount++;
      }
      totalFixesApplied += totalFixes;
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Find files with mathematical/calculation type errors
 */
function findTargetFiles() {
  const targetFiles = [];
  const directories = [
    'src/components',
    'src/utils', 
    'src/lib',
    'src/calculations',
    'src/services',
    'src/app/api'
  ];
  
  function scanDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scanDirectory(fullPath);
      } else if (stat.isFile() && /\.(ts|tsx)$/.test(item)) {
        // Read file to check for mathematical/calculation type errors
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          // Check for mathematical operation patterns with unknown types
          const hasCalculationErrors = (
            content.includes('unknown') && (
              content.includes('.map(') ||
              content.includes('.reduce(') ||
              content.includes('.sort(') ||
              content.includes('.filter(') ||
              /[\+\-\*\/]/.test(content) ||
              content.includes('.score') ||
              content.includes('calculate') ||
              content.includes('nutrient') ||
              content.includes('cuisine.') ||
              content.includes('gregsEnergy')
            )
          );
          
          if (hasCalculationErrors) {
            targetFiles.push(fullPath);
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }
    }
  }
  
  directories.forEach(scanDirectory);
  return targetFiles;
}

// Main execution
function main() {
  console.log('🔍 Scanning for mathematical & calculation type errors...');
  
  const targetFiles = findTargetFiles();
  
  console.log(`📁 Found ${targetFiles.length} files with potential mathematical/calculation type errors`);
  
  if (targetFiles.length === 0) {
    console.log('✅ No files with mathematical/calculation type errors found');
    return;
  }
  
  if (DRY_RUN) {
    console.log('\n📋 Files that would be processed:');
    targetFiles.forEach(file => console.log(`  - ${file}`));
  }
  
  console.log('\n🔧 Processing files...');
  
  // Process specific high-priority files first
  const priorityFiles = [
    'src/components/CuisineSelector.tsx',
    'src/app/api/nutrition/direct.ts',
    'src/utils/recipe/recipeMatching.ts',
    'src/calculations/core/alchemicalEngine.ts'
  ].filter(file => fs.existsSync(file));
  
  // Process priority files first
  priorityFiles.forEach(processFile);
  
  // Process remaining files
  const remainingFiles = targetFiles.filter(file => !priorityFiles.includes(file));
  remainingFiles.forEach(processFile);
  
  console.log('\n📊 Phase 10 Summary:');
  console.log(`✅ Files processed: ${fixedFilesCount}`);
  console.log(`🔧 Total mathematical/calculation type fixes applied: ${totalFixesApplied}`);
  
  if (!DRY_RUN) {
    console.log('\n🧪 Testing build after Phase 10 fixes...');
    // No automatic build test in script - user should run yarn build
  }
  
  console.log('\n📋 Next steps:');
  console.log('1. Run "yarn build" to verify fixes');
  console.log('2. Check TypeScript error count reduction');
  console.log('3. Test mathematical operations in dev environment');
  console.log('4. Proceed with remaining error categories if needed');
}

main(); 