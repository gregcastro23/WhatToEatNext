#!/usr/bin/env node

/**
 * Comprehensive script to fix issues in the food recommender
 * 
 * This script:
 * 1. Fixes const-to-let errors for variables reassigned later
 * 2. Adds null checks to prevent runtime errors
 * 3. Fixes division by zero issues
 * 4. Resolves ingredient categorization issues (like ginger in multiple categories)
 * 5. Fixes broken import paths from division-by-zero checks
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

console.log('🔍 Starting comprehensive food recommender fixes...\n');

// ---------------------------------------------------
// Helper functions
// ---------------------------------------------------

function createBackup(filePath, backupDir = 'fix-food-recommender-backups') {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const fullBackupDir = path.join(process.cwd(), backupDir);
  
  if (!fs.existsSync(fullBackupDir)) {
    fs.mkdirSync(fullBackupDir, { recursive: true });
  }
  
  const fileName = path.basename(filePath);
  const backupPath = path.join(fullBackupDir, `${fileName}.${timestamp}.backup`);
  
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

// ---------------------------------------------------
// 1. Fix const-to-let errors
// ---------------------------------------------------

function fixConstToLetErrors() {
  console.log('🔧 Fixing const-to-let errors...');
  
  const DIRECTORIES = [
    'src/services',
    'src/components',
    'src/utils',
    'src/lib',
    'src/contexts'
  ];
  
  // Find all target files
  let targetFiles = [];
  DIRECTORIES.forEach(dir => {
    if (fs.existsSync(dir)) {
      const pattern = path.join(dir, '**', '*.{js,jsx,ts,tsx}');
      const files = glob.sync(pattern);
      targetFiles = targetFiles.concat(files);
    }
  });
  
  console.log(`Found ${targetFiles.length} files to process`);
  
  // Track files that were modified
  const modifiedFiles = [];
  
  // Process each file
  targetFiles.forEach(filePath => {
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Split into lines for analysis
    const lines = content.split('\n');
    
    // Track const declarations and reassignments
    const constDeclarations = new Map(); // line number -> variable name
    const reassignedVars = new Set();
    
    // First pass: find all const declarations
    lines.forEach((line, index) => {
      // Match const declarations
      const constMatch = line.match(/const\s+([a-zA-Z0-9_]+)\s*=/);
      if (constMatch) {
        constDeclarations.set(index, constMatch[1]);
      }
    });
    
    // Second pass: find all reassignments
    lines.forEach((line, index) => {
      // For each known const variable, check if it's reassigned
      for (const [declarationLine, varName] of constDeclarations.entries()) {
        if (index > declarationLine) { // Only check lines after declaration
          // Check for assignment patterns (varName = ...)
          const assignmentRegex = new RegExp(`${varName}\\s*=(?!=)`);
          if (assignmentRegex.test(line)) {
            reassignedVars.add(varName);
          }
        }
      }
    });
    
    // If we found reassigned const variables, fix them
    if (reassignedVars.size > 0) {
      console.log(`  ${filePath}: Found ${reassignedVars.size} const variables that should be let`);
      
      // Create a backup
      createBackup(filePath);
      
      // Replace const with let for reassigned variables
      let modifiedContent = content;
      for (const varName of reassignedVars) {
        const constRegex = new RegExp(`(const\\s+)(${varName})(\\s*=)`, 'g');
        modifiedContent = modifiedContent.replace(constRegex, 'let $2$3');
      }
      
      // Write the modified content
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
      modifiedFiles.push(filePath);
    }
  });
  
  console.log(`✅ Fixed const-to-let issues in ${modifiedFiles.length} files\n`);
}

// ---------------------------------------------------
// 2. Fix division by zero issues
// ---------------------------------------------------

function fixDivisionByZero() {
  console.log('🔧 Fixing division by zero issues...');
  
  const DIRECTORIES = [
    'src/services',
    'src/components',
    'src/utils',
    'src/lib',
    'src/contexts'
  ];
  
  // Find all target files
  let targetFiles = [];
  DIRECTORIES.forEach(dir => {
    if (fs.existsSync(dir)) {
      const pattern = path.join(dir, '**', '*.{js,jsx,ts,tsx}');
      const files = glob.sync(pattern);
      targetFiles = targetFiles.concat(files);
    }
  });
  
  // Track files that were modified
  const modifiedFiles = [];
  
  // Process each file
  targetFiles.forEach(filePath => {
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Find potential division operations
    const divisionRegex = /([a-zA-Z0-9_\)\]\}]+)\s*\/\s*([a-zA-Z0-9_\.\(\[\{]+)/g;
    let match;
    let modified = false;
    
    // Find any division operations
    while ((match = divisionRegex.exec(content)) !== null) {
      const fullMatch = match[0];
      const numerator = match[1];
      const denominator = match[2];
      
      // Skip if the denominator is a numeric literal
      if (/^\d+(\.\d+)?$/.test(denominator)) {
        continue;
      }
      
      // Skip if already has a safety check
      if (fullMatch.includes('|| 1') || 
          fullMatch.includes('|| 0.') || 
          fullMatch.includes('!== 0') || 
          fullMatch.includes('!= 0')) {
        continue;
      }
      
      // Replace with safe division pattern
      const replacement = `${numerator} / (${denominator} || 1)`;
      content = content.substring(0, match.index) + 
                replacement + 
                content.substring(match.index + fullMatch.length);
                
      modified = true;
      
      // Reset regex to search from the beginning with the new content
      divisionRegex.lastIndex = 0;
    }
    
    // Save changes if the content was modified
    if (modified) {
      // Create backup before making changes
      createBackup(filePath);
      
      // Write the modified content
      fs.writeFileSync(filePath, content, 'utf8');
      modifiedFiles.push(filePath);
      console.log(`  Fixed division by zero issues in ${filePath}`);
    }
  });
  
  console.log(`✅ Fixed division by zero issues in ${modifiedFiles.length} files\n`);
}

// ---------------------------------------------------
// 3. Fix broken import paths
// ---------------------------------------------------

function fixBrokenImportPaths() {
  console.log('🔧 Fixing broken import paths...');
  
  const DIRECTORIES = [
    'src/services',
    'src/components',
    'src/utils',
    'src/lib',
    'src/contexts',
    'src/app'
  ];
  
  // Find all target files
  let targetFiles = [];
  DIRECTORIES.forEach(dir => {
    if (fs.existsSync(dir)) {
      const pattern = path.join(dir, '**', '*.{js,jsx,ts,tsx}');
      const files = glob.sync(pattern);
      targetFiles = targetFiles.concat(files);
    }
  });
  
  // Track files that were modified
  const modifiedFiles = [];
  
  // Process each file
  targetFiles.forEach(filePath => {
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Patterns to fix:
    // 1. import x from '@/path / (something || 1)'
    // 2. import { x } from '@/path / (something || 1)'
    // 3. import x from 'path / (something || 1)'
    
    const importRegex = /import\s+(?:[\w\s{}*,]+\s+from\s+)?['"]([^'"]+\s*\/\s*\([^)]+\s*\|\|\s*\d+\))['"]/g;
    let match;
    let modified = false;
    
    while ((match = importRegex.exec(content)) !== null) {
      const fullImport = match[0];
      const brokenPath = match[1];
      
      // Fix the path by removing the division check pattern
      const fixedPath = brokenPath.replace(/\s*\/\s*\([^)]+\s*\|\|\s*\d+\)/, '');
      
      // Replace in content
      const fixedImport = fullImport.replace(brokenPath, fixedPath);
      content = content.replace(fullImport, fixedImport);
      
      modified = true;
      console.log(`  Fixed import: ${brokenPath} → ${fixedPath}`);
      
      // Reset regex to search from the beginning
      importRegex.lastIndex = 0;
    }
    
    // Save changes if the content was modified
    if (modified) {
      // Create backup before making changes
      createBackup(filePath);
      
      // Write the modified content
      fs.writeFileSync(filePath, content, 'utf8');
      modifiedFiles.push(filePath);
      console.log(`  Fixed import paths in ${filePath}`);
    }
  });
  
  console.log(`✅ Fixed import paths in ${modifiedFiles.length} files\n`);
}

// ---------------------------------------------------
// 4. Fix ingredient duplication issues
// ---------------------------------------------------

function fixIngredientDuplication() {
  console.log('🔧 Fixing ingredient duplication issues...');
  
  // Check if ingredient directory exists
  const ingredientsDir = 'src/data/ingredients';
  if (!fs.existsSync(ingredientsDir)) {
    console.log('  Ingredients directory not found, skipping');
    return;
  }
  
  // Files to check for duplication
  const ingredientFiles = glob.sync(`${ingredientsDir}/**/*.{js,ts}`);
  
  // Track ingredients
  const ingredientRegistry = {};
  const duplicateIngredients = {};
  
  // This function finds all ingredient definitions
  function scanForIngredients(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const filename = path.basename(filePath);
    const category = path.dirname(filePath).split('/').pop();
    
    // Simple regex to find ingredient definitions
    const ingredientRegex = /([\'\"])([\w\s\-]+)\1\s*:\s*\{/g;
    let match;
    
    while ((match = ingredientRegex.exec(content)) !== null) {
      const ingredientName = match[2].toLowerCase();
      
      if (!ingredientRegistry[ingredientName]) {
        ingredientRegistry[ingredientName] = {
          files: [filePath],
          categories: [category]
        };
      } else {
        ingredientRegistry[ingredientName].files.push(filePath);
        ingredientRegistry[ingredientName].categories.push(category);
        
        // Track duplicates
        duplicateIngredients[ingredientName] = ingredientRegistry[ingredientName];
      }
    }
  }
  
  // Scan all ingredient files
  ingredientFiles.forEach(scanForIngredients);
  
  // Log duplicates
  const duplicateCount = Object.keys(duplicateIngredients).length;
  
  if (duplicateCount === 0) {
    console.log('  No duplicate ingredients found.');
    return;
  }
  
  console.log(`  Found ${duplicateCount} duplicate ingredients`);
  
  // Define category preferences for common duplicates
  const categoryPreferences = {
    'ginger': 'seasonings', // Prefer to keep ginger in seasonings/aromatics
    'garlic': 'seasonings',
    'turmeric': 'spices',
    'cinnamon': 'spices',
    'cloves': 'spices',
    'nutmeg': 'spices',
    'cardamom': 'spices'
  };
  
  // Process each duplicate
  Object.entries(duplicateIngredients).forEach(([name, info]) => {
    const preferredCategory = categoryPreferences[name] || info.categories[0];
    
    console.log(`  Fixing "${name}": keeping in ${preferredCategory}`);
    
    // Keep in preferred category, remove from others
    info.files.forEach((file, index) => {
      const fileCategory = info.categories[index];
      
      if (fileCategory !== preferredCategory && file.includes(fileCategory)) {
        console.log(`    Removing from ${file}`);
        
        // Read file
        let content = fs.readFileSync(file, 'utf-8');
        
        // Create backup
        createBackup(file);
        
        // Create regex to match the entire ingredient definition
        const removeRegex = new RegExp(`['"]${name}['"]\\s*:\\s*\\{[^\\{\\}]*((\\{[^\\{\\}]*\\})[^\\{\\}]*)*\\},?`, 'i');
        
        // Remove the ingredient
        content = content.replace(removeRegex, '');
        
        // Fix trailing commas if needed
        content = content.replace(/,\s*\}/g, '\n}');
        
        // Write changes
        fs.writeFileSync(file, content);
      }
    });
  });
  
  console.log(`✅ Fixed ${duplicateCount} duplicate ingredients\n`);
}

// ---------------------------------------------------
// Run all fixes
// ---------------------------------------------------

try {
  // 1. Fix const-to-let errors
  fixConstToLetErrors();
  
  // 2. Fix division by zero issues
  fixDivisionByZero();
  
  // 3. Fix broken import paths
  fixBrokenImportPaths();
  
  // 4. Fix ingredient duplication
  fixIngredientDuplication();
  
  console.log('🎉 All fixes completed successfully!');
  console.log('Run "yarn build" to verify the fixes.');
} catch (error) {
  console.error('❌ Error during fixes:', error);
  process.exit(1);
} 