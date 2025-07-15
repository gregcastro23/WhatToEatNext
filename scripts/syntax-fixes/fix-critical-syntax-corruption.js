#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🚨 EMERGENCY: Fixing Critical Syntax Corruption');
console.log('================================================');

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
  console.log('');
}

let changesMade = 0;

// Helper function to apply changes
function applyFix(filePath, content, description) {
  if (DRY_RUN) {
    console.log(`Would fix: ${filePath}`);
    console.log(`  - ${description}`);
    return;
  }
  
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    console.log(`  - ${description}`);
    changesMade++;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

// 1. Fix CookingMethods.tsx - corrupted conditional expressions
function fixCookingMethods() {
  console.log('\n1. Fixing CookingMethods.tsx syntax corruption');
  
  const filePath = path.join(ROOT_DIR, 'src/components/CookingMethods.tsx');
  if (!fs.existsSync(filePath)) {
    console.log('❌ CookingMethods.tsx not found');
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix corrupted conditional expressions - these seem to be ternary operator corruption
  content = content.replace(
    /Array\.isArray\(\([^)]+\)\s*\?\s*\([^)]+\.includes\([^)]+\)\s*:\s*\([^)]+\s*===\s*[^)]+\)\s*&&[^{]*\{/g,
    (match) => {
      // Extract the variable name from the first part
      const varMatch = match.match(/Array\.isArray\(\(([^)]+)\)/);
      if (varMatch) {
        const varName = varMatch[1].trim();
        const cleanMatch = match.replace(/Array\.isArray\(\([^)]+\)\s*\?\s*\([^)]+/, `Array.isArray(${varName}) ? ${varName}`);
        return cleanMatch.replace(/\)\s*:\s*\([^)]+\s*===\s*[^)]+\)/, `) : ${varName} === value)`);
      }
      return match;
    }
  );
  
  // Fix basic corrupted patterns
  content = content.replace(/\$1\.\$2/g, 'variable.property');
  content = content.replace(/\$1/g, 'variable');
  content = content.replace(/\$3/g, 'value');
  
  // Fix missing closing parentheses
  content = content.replace(/if \(Array\.isArray\([^)]+\) \? [^:]+ : [^{]+\{/g, (match) => {
    const openParens = (match.match(/\(/g) || []).length;
    const closeParens = (match.match(/\)/g) || []).length;
    const missing = openParens - closeParens;
    return match.slice(0, -1) + ')'.repeat(missing) + ' {';
  });
  
  applyFix(filePath, content, 'Fixed corrupted conditional expressions and syntax');
}

// 2. Fix CuisineRecommender - corrupted property access
function fixCuisineRecommender() {
  console.log('\n2. Fixing CuisineRecommender syntax corruption');
  
  const filePath = path.join(ROOT_DIR, 'src/components/CuisineRecommender/index.tsx');
  if (!fs.existsSync(filePath)) {
    console.log('❌ CuisineRecommender not found');
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix corrupted property access patterns
  content = content.replace(/\.\([^)]+\)\?/g, '?.elementalState');
  content = content.replace(/\(\{[^}]+\}\)\?/g, '{}');
  content = content.replace(/\(5\)\?/g, '5');
  
  // Fix corrupted array expressions
  content = content.replace(/\(\{([^}]+)\s+\|\|\s+\[\]\}\)/g, '($1 || [])');
  
  applyFix(filePath, content, 'Fixed corrupted property access and array expressions');
}

// 3. Fix CuisineSection - similar corruption
function fixCuisineSection() {
  console.log('\n3. Fixing CuisineSection syntax corruption');
  
  const filePath = path.join(ROOT_DIR, 'src/components/CuisineSection/index.tsx');
  if (!fs.existsExists(filePath)) {
    console.log('❌ CuisineSection not found');
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix similar corruption patterns
  content = content.replace(/\.\([^)]+\)\?/g, '?.dishes');
  content = content.replace(/\(\{[^}]+\}\)\?/g, '{}');
  
  applyFix(filePath, content, 'Fixed corrupted property access patterns');
}

// 4. Fix CuisineSelector files
function fixCuisineSelectors() {
  console.log('\n4. Fixing CuisineSelector files');
  
  const files = [
    'src/components/CuisineSelector.tsx',
    'src/components/CuisineSelector.migrated.tsx'
  ];
  
  files.forEach(filePath => {
    const fullPath = path.join(ROOT_DIR, filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ ${filePath} not found`);
      return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Fix corrupted patterns
    content = content.replace(/\.\([^)]+\)\?/g, '?.favorableZodiacSigns');
    content = content.replace(/\(\{[^}]+\}\)\?/g, '{}');
    content = content.replace(/\(\{([^}]+)\s+\|\|\s+\[\]\}/g, '($1 || [])');
    
    applyFix(fullPath, content, 'Fixed corrupted selector patterns');
  });
}

// 5. Fix debug components
function fixDebugComponents() {
  console.log('\n5. Fixing debug components');
  
  const files = [
    'src/components/debug/AlchemicalDebugger.tsx',
    'src/components/debug/CuisineRecommenderDebug.tsx',
    'src/components/dailyFoodAlchemy.tsx'
  ];
  
  files.forEach(filePath => {
    const fullPath = path.join(ROOT_DIR, filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ ${filePath} not found`);
      return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Fix corrupted patterns
    content = content.replace(/\.\([^)]+\)\?/g, '?.elementalPreference');
    content = content.replace(/\(\{[^}]+\}\)\?/g, '{}');
    content = content.replace(/expanded=\{[^}]+\}/g, 'expanded={expanded}');
    
    applyFix(fullPath, content, 'Fixed debug component corruption');
  });
}

// Run all fixes
console.log('Starting emergency syntax fixes...\n');

fixCookingMethods();
fixCuisineRecommender(); 
fixCuisineSection();
fixCuisineSelectors();
fixDebugComponents();

console.log('\n' + '='.repeat(50));
console.log(`Emergency syntax fixes completed!`);
console.log(`Changes made: ${changesMade}`);

if (DRY_RUN) {
  console.log('\n⚠️  This was a dry run. No files were actually modified.');
  console.log('Run without --dry-run to apply the changes.');
} else {
  console.log('\n✅ Emergency fixes applied.');
  console.log('🔍 Next step: Run "yarn build" to test the fixes.');
  console.log('⚠️  Manual review recommended for complex patterns.');
} 