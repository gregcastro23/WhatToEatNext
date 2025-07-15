#!/usr/bin/env node

/**
 * Enhanced Thermodynamic Properties Type Fixer
 * 
 * This script comprehensively fixes issues with ThermodynamicProperties, 
 * BasicThermodynamicProperties, and ThermodynamicMetrics interfaces.
 * 
 * Main issues addressed:
 * 1. gregsEnergy property not existing in BasicThermodynamicProperties
 * 2. energy vs gregsEnergy naming inconsistencies
 * 3. Missing property definitions in type literals
 * 4. Type assertion errors with object literals
 * 5. Inconsistent return types in thermodynamic calculations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Flag for dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Enhanced file discovery - find all files that might have thermodynamic issues
function findThermodynamicFiles() {
  const patterns = [
    'src/utils/recommendation/*.ts',
    'src/calculations/**/*.ts',
    'src/types/alchemy.ts',
    'src/lib/*.ts',
    'src/services/*.ts',
    'src/components/**/*.tsx',
    'src/data/cooking/methods/**/*.ts'
  ];
  
  const files = [];
  
  // Add explicitly known problematic files
  const knownFiles = [
    'src/utils/recommendation/methodRecommendation.ts',
    'src/calculations/gregsEnergy.ts',
    'src/types/alchemy.ts',
    'src/lib/ThermodynamicCalculator.ts',
    'src/calculations/core/kalchmEngine.ts'
  ];
  
  knownFiles.forEach(file => {
    if (fs.existsSync(file)) {
      files.push(file);
    }
  });
  
  // Scan for additional files containing thermodynamic references
  function scanDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scanDirectory(fullPath);
      } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes('ThermodynamicProperties') || 
              content.includes('BasicThermodynamicProperties') ||
              content.includes('ThermodynamicMetrics') ||
              content.includes('gregsEnergy') ||
              content.includes('heat:') && content.includes('entropy:') && content.includes('reactivity:')) {
            if (!files.includes(fullPath)) {
              files.push(fullPath);
            }
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }
    }
  }
  
  // Scan key directories
  ['src/utils', 'src/calculations', 'src/lib', 'src/services'].forEach(dir => {
    scanDirectory(dir);
  });
  
  return files;
}

// Helper to log with highlighting
function logChange(message, oldCode, newCode) {
  console.log(`\n📝 ${message}:`);
  console.log(`❌ ${oldCode}`);
  console.log(`✅ ${newCode}`);
}

// Enhanced interface fixing with better regex patterns
function fixThermodynamicInterfaces(filePath) {
  console.log(`\n🔧 Processing interface definitions in: ${filePath}`);
  
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`❌ Error reading file ${filePath}:`, error);
    return;
  }

  let replacements = 0;
  let newContent = content;
  
  // Fix BasicThermodynamicProperties interface
  const basicThermodynamicRegex = /export interface BasicThermodynamicProperties\s*\{([^}]+)\}/s;
  const match = content.match(basicThermodynamicRegex);
  
  if (match) {
    const currentProps = match[1];
    
    if (!currentProps.includes('gregsEnergy')) {
      const newProps = currentProps.trimEnd() + '  gregsEnergy?: number; // Added for compatibility with ThermodynamicMetrics\n';
      const newInterface = `export interface BasicThermodynamicProperties {${newProps}}`;
      newContent = newContent.replace(basicThermodynamicRegex, newInterface);
      replacements++;
      
      logChange(
        'Added gregsEnergy to BasicThermodynamicProperties',
        match[0],
        newInterface
      );
    }
  }
  
  // Fix ThermodynamicMetrics interface
  const thermodynamicMetricsRegex = /export interface ThermodynamicMetrics\s*\{([^}]+)\}/s;
  const metricsMatch = content.match(thermodynamicMetricsRegex);
  
  if (metricsMatch) {
    const currentMetricsProps = metricsMatch[1];
    let updatedMetricsProps = currentMetricsProps;
    let metricChanged = false;
    
    // Make energy required if it's optional
    if (currentMetricsProps.includes('energy?:') && !currentMetricsProps.includes('energy:')) {
      updatedMetricsProps = updatedMetricsProps.replace('energy?: number;', 'energy: number;');
      metricChanged = true;
    }
    
    // Add energy if missing entirely
    if (!currentMetricsProps.includes('energy')) {
      updatedMetricsProps = updatedMetricsProps.trimEnd() + '  energy: number; // Added for compatibility\n';
      metricChanged = true;
    }
    
    if (metricChanged) {
      const newMetricsInterface = `export interface ThermodynamicMetrics {${updatedMetricsProps}}`;
      newContent = newContent.replace(thermodynamicMetricsRegex, newMetricsInterface);
      replacements++;
      
      logChange(
        'Updated ThermodynamicMetrics interface',
        metricsMatch[0],
        newMetricsInterface
      );
    }
  }
  
  // Write changes
  if (replacements > 0) {
    console.log(`✅ Made ${replacements} interface updates in ${filePath}`);
    
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`💾 Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('🔍 (Dry run mode, no changes written)');
    }
  } else {
    console.log(`✨ No interface changes needed in ${filePath}`);
  }
  
  return newContent;
}

// Enhanced usage fixing with more comprehensive patterns
function fixThermodynamicUsages(filePath) {
  console.log(`\n🔧 Processing usages in: ${filePath}`);
  
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`❌ Error reading file ${filePath}:`, error);
    return;
  }

  let replacements = 0;
  let newContent = content;
  const fileName = path.basename(filePath);
  
  // 1. Fix type assertion errors for BasicThermodynamicProperties
  const typeAssertionRegex = /\{\s*heat:\s*([^,}]+),\s*entropy:\s*([^,}]+),\s*reactivity:\s*([^,}]+),\s*gregsEnergy:\s*([^}]+)\s*\}\s*as\s*BasicThermodynamicProperties/g;
  
  newContent = newContent.replace(typeAssertionRegex, (match, heat, entropy, reactivity, gregsEnergy) => {
    replacements++;
    logChange(
      'Removed invalid type assertion',
      match,
      `{ heat: ${heat}, entropy: ${entropy}, reactivity: ${reactivity}, gregsEnergy: ${gregsEnergy} }`
    );
    return `{ heat: ${heat}, entropy: ${entropy}, reactivity: ${reactivity}, gregsEnergy: ${gregsEnergy} }`;
  });
  
  // 2. Fix missing gregsEnergy in object literals used as BasicThermodynamicProperties
  const objectLiteralRegex = /return\s*\{\s*heat:\s*([^,}]+),\s*entropy:\s*([^,}]+),\s*reactivity:\s*([^,}]+)\s*\}(?!\s*as)/g;
  
  newContent = newContent.replace(objectLiteralRegex, (match, heat, entropy, reactivity) => {
    replacements++;
    // Calculate a reasonable gregsEnergy value
    const gregsEnergyValue = `(${heat} + ${entropy} + ${reactivity}) / 3`;
    const newReturn = `return { heat: ${heat}, entropy: ${entropy}, reactivity: ${reactivity}, gregsEnergy: ${gregsEnergyValue} }`;
    
    logChange(
      'Added missing gregsEnergy to return statement',
      match,
      newReturn
    );
    return newReturn;
  });
  
  // 3. Fix energy vs gregsEnergy inconsistencies in calculation files
  if (fileName.includes('gregsEnergy') || fileName.includes('Thermodynamic')) {
    // Replace thermodynamicProperties.energy with thermodynamicProperties.gregsEnergy
    newContent = newContent.replace(/(\w+)\.energy(?!\s*:)/g, (match, objName) => {
      if (objName.includes('thermodynamic') || objName.includes('properties')) {
        replacements++;
        return `${objName}.gregsEnergy`;
      }
      return match;
    });
    
    // Fix energy property names in return statements
    newContent = newContent.replace(/(\breturn\s*\{[^}]*?)energy:\s*([^,}]+)/g, (match, prefix, value) => {
      replacements++;
      return `${prefix}gregsEnergy: ${value}`;
    });
  }
  
  // 4. Fix function return type inconsistencies
  newContent = newContent.replace(
    /:\s*BasicThermodynamicProperties\s*=\s*\{[^}]*gregsEnergy:/g,
    (match) => {
      replacements++;
      return match.replace('BasicThermodynamicProperties', 'ThermodynamicMetrics');
    }
  );
  
  // 5. Fix missing properties in object spread operations
  const spreadRegex = /\{\s*\.\.\.(\w+),\s*gregsEnergy:\s*([^}]+)\s*\}/g;
  newContent = newContent.replace(spreadRegex, (match, objName, gregsEnergyValue) => {
    // Ensure the spread includes all required properties
    return match; // Keep as is for now, but could be enhanced
  });
  
  // 6. Fix method return types that should include gregsEnergy
  if (content.includes('methodRecommendation') || content.includes('CookingMethod')) {
    newContent = newContent.replace(
      /:\s*BasicThermodynamicProperties(?=\s*=)/g,
      (match) => {
        replacements++;
        return ': ThermodynamicMetrics';
      }
    );
  }
  
  // Write changes
  if (replacements > 0) {
    console.log(`✅ Made ${replacements} usage fixes in ${filePath}`);
    
    if (!isDryRun) {
      try {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`💾 Successfully updated ${filePath}`);
      } catch (error) {
        console.error(`❌ Error writing to ${filePath}:`, error);
      }
    } else {
      console.log('🔍 (Dry run mode, no changes written)');
    }
  } else {
    console.log(`✨ No usage changes needed in ${filePath}`);
  }
}

// Main execution
console.log(`${isDryRun ? '🔍 DRY RUN: ' : '🚀 '}Enhanced Thermodynamic Properties Type Fixer`);
console.log('=========================================================');

// Discover files that need fixing
console.log('📂 Discovering files with thermodynamic properties...');
const filesToFix = findThermodynamicFiles();

console.log(`📊 Found ${filesToFix.length} files to process:`);
filesToFix.forEach(file => console.log(`   📄 ${file}`));

let totalReplacements = 0;

// First pass: Fix interface definitions
console.log('\n🔧 Phase 1: Fixing interface definitions...');
filesToFix.forEach(filePath => {
  if (filePath.includes('alchemy.ts')) {
    fixThermodynamicInterfaces(filePath);
  }
});

// Second pass: Fix usages
console.log('\n🔧 Phase 2: Fixing property usages...');
filesToFix.forEach(filePath => {
  if (!filePath.includes('alchemy.ts')) {
    fixThermodynamicUsages(filePath);
  }
});

console.log('\n=========================================================');
console.log(`✨ Thermodynamic properties fixing completed!`);
console.log(`${isDryRun ? '🔍 This was a dry run - no files were modified.' : '💾 All changes have been written to disk.'}`);
console.log('========================================================='); 