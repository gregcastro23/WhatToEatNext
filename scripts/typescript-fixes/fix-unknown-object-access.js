import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dryRun = process.argv.includes('--dry-run');
const verbose = process.argv.includes('--verbose');

// Root directory of the project (two levels up from this script)
const rootDir = path.resolve(__dirname, '..', '..');

// Track statistics
let filesScanned = 0;
let filesModified = 0;
let errorsFixed = 0;

// Patterns for fixing unknown type issues
const unknownTypePatterns = [
  // Pattern 1: recipe.propertyName issues - add type casting
  {
    regex: /(\w+)\.(\w+)(?=\s*[\.|\?|\|\||\)])/g,
    check: (content, match, filePath) => {
      // Specifically target files with known issues
      if (content.includes('TS2339: Property') || 
          filePath.includes('enhancedCuisineRecommender.ts') ||
          filePath.includes('elementalcalculations.ts') ||
          filePath.includes('CookingMethods.tsx')) {
        
        // Check if the accessed property is mentioned in an error
        const propertyAccess = `${match[1]}.${match[2]}`;
        return content.includes(`Property '${match[2]}' does not exist on type 'unknown'`) ||
               (match[1] === 'recipe' && 
                (match[2] === 'elementalProperties' || 
                 match[2] === 'season' || 
                 match[2] === 'mealType' ||
                 match[2] === 'tags' ||
                 match[2] === 'name' ||
                 match[2] === 'id' ||
                 match[2] === 'description' ||
                 match[2] === 'ingredients' ||
                 match[2] === 'astrologicalAffinities' ||
                 match[2] === 'lunarPhaseInfluences' ||
                 match[2] === 'zodiacInfluences' ||
                 match[2] === 'dietaryInfo' ||
                 match[2] === 'allergens'));
      }
      return false;
    },
    fix: (content, match) => {
      // Get the line where the match appears
      const lines = content.split('\n');
      const lineIndex = lines.findIndex(line => line.includes(`${match[1]}.${match[2]}`));
      
      if (lineIndex === -1) return content;
      
      // Determine the correct type for the property based on context
      let type = 'any';
      const property = match[2];
      
      if (property === 'elementalProperties') {
        type = 'Record<string, number>';
      } else if (property === 'season') {
        type = 'string[]';
      } else if (property === 'mealType') {
        type = 'string[]';
      } else if (property === 'tags') {
        type = 'string[]';
      } else if (property === 'name' || property === 'id' || property === 'description') {
        type = 'string';
      } else if (property === 'ingredients') {
        type = 'string[]';
      } else if (property === 'astrologicalAffinities') {
        type = '{ planets?: string[] }';
      } else if (property === 'lunarPhaseInfluences' || property === 'zodiacInfluences') {
        type = 'string[]';
      } else if (property === 'allergens' || property === 'dietaryInfo') {
        type = 'string[]';
      }
      
      // If it's a specific property access, add a type assertion
      if (match[1] === 'recipe' && ['elementalProperties', 'season', 'mealType', 'tags', 'name', 'id', 'description', 'ingredients', 'astrologicalAffinities', 'lunarPhaseInfluences', 'zodiacInfluences', 'dietaryInfo', 'allergens'].includes(property)) {
        const line = lines[lineIndex];
        
        // Handle object optional chaining (?.property)
        if (line.includes(`${match[1]}?.${match[2]}`)) {
          lines[lineIndex] = line.replace(
            `${match[1]}?.${match[2]}`,
            `(${match[1]} as any)?.${match[2]}`
          );
        } 
        // Handle normal property access
        else {
          lines[lineIndex] = line.replace(
            `${match[1]}.${match[2]}`,
            `(${match[1]} as any).${match[2]}`
          );
        }
        
        return lines.join('\n');
      }
      
      return content;
    }
  },
  
  // Pattern 2: Fix elementalEffect.Element access
  {
    regex: /elementalEffect\.(Fire|4168Waterimport fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dryRun = process.argv.includes('--dry-run');
const verbose = process.argv.includes('--verbose');

// Root directory of the project (two levels up from this script)
const rootDir = path.resolve(__dirname, '..', '..');

// Track statistics
let filesScanned = 0;
let filesModified = 0;
let errorsFixed = 0;

// Patterns for fixing unknown type issues
const unknownTypePatterns = [
  // Pattern 1: recipe.propertyName issues - add type casting
  {
    regex: /(\w+)\.(\w+)(?=\s*[\.|\?|\|\||\)])/g,
    check: (content, match, filePath) => {
      // Specifically target files with known issues
      if (content.includes('TS2339: Property') || 
          filePath.includes('enhancedCuisineRecommender.ts') ||
          filePath.includes('elementalcalculations.ts') ||
          filePath.includes('CookingMethods.tsx')) {
        
        // Check if the accessed property is mentioned in an error
        const propertyAccess = `${match[1]}.${match[2]}`;
        return content.includes(`Property '${match[2]}' does not exist on type 'unknown'`) ||
               (match[1] === 'recipe' && 
                (match[2] === 'elementalProperties' || 
                 match[2] === 'season' || 
                 match[2] === 'mealType' ||
                 match[2] === 'tags' ||
                 match[2] === 'name' ||
                 match[2] === 'id' ||
                 match[2] === 'description' ||
                 match[2] === 'ingredients' ||
                 match[2] === 'astrologicalAffinities' ||
                 match[2] === 'lunarPhaseInfluences' ||
                 match[2] === 'zodiacInfluences' ||
                 match[2] === 'dietaryInfo' ||
                 match[2] === 'allergens'));
      }
      return false;
    },
    fix: (content, match) => {
      // Get the line where the match appears
      const lines = content.split('\n');
      const lineIndex = lines.findIndex(line => line.includes(`${match[1]}.${match[2]}`));
      
      if (lineIndex === -1) return content;
      
      // Determine the correct type for the property based on context
      let type = 'any';
      const property = match[2];
      
      if (property === 'elementalProperties') {
        type = 'Record<string, number>';
      } else if (property === 'season') {
        type = 'string[]';
      } else if (property === 'mealType') {
        type = 'string[]';
      } else if (property === 'tags') {
        type = 'string[]';
      } else if (property === 'name' || property === 'id' || property === 'description') {
        type = 'string';
      } else if (property === 'ingredients') {
        type = 'string[]';
      } else if (property === 'astrologicalAffinities') {
        type = '{ planets?: string[] }';
      } else if (property === 'lunarPhaseInfluences' || property === 'zodiacInfluences') {
        type = 'string[]';
      } else if (property === 'allergens' || property === 'dietaryInfo') {
        type = 'string[]';
      }
      
      // If it's a specific property access, add a type assertion
      if (match[1] === 'recipe' && ['elementalProperties', 'season', 'mealType', 'tags', 'name', 'id', 'description', 'ingredients', 'astrologicalAffinities', 'lunarPhaseInfluences', 'zodiacInfluences', 'dietaryInfo', 'allergens'].includes(property)) {
        const line = lines[lineIndex];
        
        // Handle object optional chaining (?.property)
        if (line.includes(`${match[1]}?.${match[2]}`)) {
          lines[lineIndex] = line.replace(
            `${match[1]}?.${match[2]}`,
            `(${match[1]} as any)?.${match[2]}`
          );
        } 
        // Handle normal property access
        else {
          lines[lineIndex] = line.replace(
            `${match[1]}.${match[2]}`,
            `(${match[1]} as any).${match[2]}`
          );
        }
        
        return lines.join('\n');
      }
      
      return content;
    }
  },
  
  // Pattern 2: Fix elementalEffect.Element access
  {
    regex: /elementalEffect\.(Fire|water|8351Earthimport fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dryRun = process.argv.includes('--dry-run');
const verbose = process.argv.includes('--verbose');

// Root directory of the project (two levels up from this script)
const rootDir = path.resolve(__dirname, '..', '..');

// Track statistics
let filesScanned = 0;
let filesModified = 0;
let errorsFixed = 0;

// Patterns for fixing unknown type issues
const unknownTypePatterns = [
  // Pattern 1: recipe.propertyName issues - add type casting
  {
    regex: /(\w+)\.(\w+)(?=\s*[\.|\?|\|\||\)])/g,
    check: (content, match, filePath) => {
      // Specifically target files with known issues
      if (content.includes('TS2339: Property') || 
          filePath.includes('enhancedCuisineRecommender.ts') ||
          filePath.includes('elementalcalculations.ts') ||
          filePath.includes('CookingMethods.tsx')) {
        
        // Check if the accessed property is mentioned in an error
        const propertyAccess = `${match[1]}.${match[2]}`;
        return content.includes(`Property '${match[2]}' does not exist on type 'unknown'`) ||
               (match[1] === 'recipe' && 
                (match[2] === 'elementalProperties' || 
                 match[2] === 'season' || 
                 match[2] === 'mealType' ||
                 match[2] === 'tags' ||
                 match[2] === 'name' ||
                 match[2] === 'id' ||
                 match[2] === 'description' ||
                 match[2] === 'ingredients' ||
                 match[2] === 'astrologicalAffinities' ||
                 match[2] === 'lunarPhaseInfluences' ||
                 match[2] === 'zodiacInfluences' ||
                 match[2] === 'dietaryInfo' ||
                 match[2] === 'allergens'));
      }
      return false;
    },
    fix: (content, match) => {
      // Get the line where the match appears
      const lines = content.split('\n');
      const lineIndex = lines.findIndex(line => line.includes(`${match[1]}.${match[2]}`));
      
      if (lineIndex === -1) return content;
      
      // Determine the correct type for the property based on context
      let type = 'any';
      const property = match[2];
      
      if (property === 'elementalProperties') {
        type = 'Record<string, number>';
      } else if (property === 'season') {
        type = 'string[]';
      } else if (property === 'mealType') {
        type = 'string[]';
      } else if (property === 'tags') {
        type = 'string[]';
      } else if (property === 'name' || property === 'id' || property === 'description') {
        type = 'string';
      } else if (property === 'ingredients') {
        type = 'string[]';
      } else if (property === 'astrologicalAffinities') {
        type = '{ planets?: string[] }';
      } else if (property === 'lunarPhaseInfluences' || property === 'zodiacInfluences') {
        type = 'string[]';
      } else if (property === 'allergens' || property === 'dietaryInfo') {
        type = 'string[]';
      }
      
      // If it's a specific property access, add a type assertion
      if (match[1] === 'recipe' && ['elementalProperties', 'season', 'mealType', 'tags', 'name', 'id', 'description', 'ingredients', 'astrologicalAffinities', 'lunarPhaseInfluences', 'zodiacInfluences', 'dietaryInfo', 'allergens'].includes(property)) {
        const line = lines[lineIndex];
        
        // Handle object optional chaining (?.property)
        if (line.includes(`${match[1]}?.${match[2]}`)) {
          lines[lineIndex] = line.replace(
            `${match[1]}?.${match[2]}`,
            `(${match[1]} as any)?.${match[2]}`
          );
        } 
        // Handle normal property access
        else {
          lines[lineIndex] = line.replace(
            `${match[1]}.${match[2]}`,
            `(${match[1]} as any).${match[2]}`
          );
        }
        
        return lines.join('\n');
      }
      
      return content;
    }
  },
  
  // Pattern 2: Fix elementalEffect.Element access
  {
    regex: /elementalEffect\.(Fire|4168Waterimport fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dryRun = process.argv.includes('--dry-run');
const verbose = process.argv.includes('--verbose');

// Root directory of the project (two levels up from this script)
const rootDir = path.resolve(__dirname, '..', '..');

// Track statistics
let filesScanned = 0;
let filesModified = 0;
let errorsFixed = 0;

// Patterns for fixing unknown type issues
const unknownTypePatterns = [
  // Pattern 1: recipe.propertyName issues - add type casting
  {
    regex: /(\w+)\.(\w+)(?=\s*[\.|\?|\|\||\)])/g,
    check: (content, match, filePath) => {
      // Specifically target files with known issues
      if (content.includes('TS2339: Property') || 
          filePath.includes('enhancedCuisineRecommender.ts') ||
          filePath.includes('elementalcalculations.ts') ||
          filePath.includes('CookingMethods.tsx')) {
        
        // Check if the accessed property is mentioned in an error
        const propertyAccess = `${match[1]}.${match[2]}`;
        return content.includes(`Property '${match[2]}' does not exist on type 'unknown'`) ||
               (match[1] === 'recipe' && 
                (match[2] === 'elementalProperties' || 
                 match[2] === 'season' || 
                 match[2] === 'mealType' ||
                 match[2] === 'tags' ||
                 match[2] === 'name' ||
                 match[2] === 'id' ||
                 match[2] === 'description' ||
                 match[2] === 'ingredients' ||
                 match[2] === 'astrologicalAffinities' ||
                 match[2] === 'lunarPhaseInfluences' ||
                 match[2] === 'zodiacInfluences' ||
                 match[2] === 'dietaryInfo' ||
                 match[2] === 'allergens'));
      }
      return false;
    },
    fix: (content, match) => {
      // Get the line where the match appears
      const lines = content.split('\n');
      const lineIndex = lines.findIndex(line => line.includes(`${match[1]}.${match[2]}`));
      
      if (lineIndex === -1) return content;
      
      // Determine the correct type for the property based on context
      let type = 'any';
      const property = match[2];
      
      if (property === 'elementalProperties') {
        type = 'Record<string, number>';
      } else if (property === 'season') {
        type = 'string[]';
      } else if (property === 'mealType') {
        type = 'string[]';
      } else if (property === 'tags') {
        type = 'string[]';
      } else if (property === 'name' || property === 'id' || property === 'description') {
        type = 'string';
      } else if (property === 'ingredients') {
        type = 'string[]';
      } else if (property === 'astrologicalAffinities') {
        type = '{ planets?: string[] }';
      } else if (property === 'lunarPhaseInfluences' || property === 'zodiacInfluences') {
        type = 'string[]';
      } else if (property === 'allergens' || property === 'dietaryInfo') {
        type = 'string[]';
      }
      
      // If it's a specific property access, add a type assertion
      if (match[1] === 'recipe' && ['elementalProperties', 'season', 'mealType', 'tags', 'name', 'id', 'description', 'ingredients', 'astrologicalAffinities', 'lunarPhaseInfluences', 'zodiacInfluences', 'dietaryInfo', 'allergens'].includes(property)) {
        const line = lines[lineIndex];
        
        // Handle object optional chaining (?.property)
        if (line.includes(`${match[1]}?.${match[2]}`)) {
          lines[lineIndex] = line.replace(
            `${match[1]}?.${match[2]}`,
            `(${match[1]} as any)?.${match[2]}`
          );
        } 
        // Handle normal property access
        else {
          lines[lineIndex] = line.replace(
            `${match[1]}.${match[2]}`,
            `(${match[1]} as any).${match[2]}`
          );
        }
        
        return lines.join('\n');
      }
      
      return content;
    }
  },
  
  // Pattern 2: Fix elementalEffect.Element access
  {
    regex: /elementalEffect\.(Fire|water|earth|Air)/g,
    check: (content) => {
      return content.includes('Property \'Fire\' does not exist on type \'unknown\'') ||
             content.includes('Property \'water\' does not exist on type \'unknown\'') ||
             content.includes('Property \'earth\' does not exist on type \'unknown\'') ||
             content.includes('Property \'Air\' does not exist on type \'unknown\'');
    },
    fix: (content, match) => {
      return content.replace(
        `elementalEffect.${match[1]}`,
        `(elementalEffect as any).${match[1]}`
      );
    }
  },
  
  // Pattern 3: Fix position.sign access
  {
    regex: /position\.(sign)/g,
    check: (content) => {
      return content.includes('Property \'sign\' does not exist on type \'unknown\'');
    },
    fix: (content, match) => {
      return content.replace(
        `position.${match[1]}`,
        `(position as any).${match[1]}`
      );
    }
  },
  
  // Pattern 4: Add proper interface imports when fixing typed issues
  {
    regex: /import\s+{([^}]+)}\s+from\s+['"]@\/types\/alchemy['"]/g,
    check: (content, match, filePath) => {
      return (filePath.includes('enhancedCuisineRecommender.ts') || 
              filePath.includes('CookingMethods.tsx') || 
              filePath.includes('elementalcalculations.ts')) && 
             !match[1].includes('Recipe');
    },
    fix: (content, match) => {
      // Add Recipe interface to imports
      const imports = match[1];
      if (!imports.includes('Recipe')) {
        const newImports = imports.trim() + ', Recipe';
        return content.replace(
          `import {${imports}} from '@/types/alchemy'`,
          `import {${newImports}} from '@/types/alchemy'`
        );
      }
      return content;
    }
  }
];

// Process a single file
function processFile(filePath) {
  // Skip node_modules and .git directories
  if (filePath.includes('node_modules') || filePath.includes('.git')) {
    return;
  }

  const stats = fs.statSync(filePath);

  if (stats.isDirectory()) {
    // Process directories recursively
    const files = fs.readdirSync(filePath);
    files.forEach(file => {
      processFile(path.join(filePath, file));
    });
  } else if (stats.isFile() && (filePath.endsWith('.ts') || filePath.endsWith('.tsx'))) {
    filesScanned++;
    
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Apply fixes for unknown type issues
    let fileFixed = false;
    
    for (const pattern of unknownTypePatterns) {
      const matches = [...content.matchAll(pattern.regex)];
      
      for (const match of matches) {
        if (pattern.check(content, match, filePath)) {
          const oldContent = content;
          content = pattern.fix(content, match);
          
          if (content !== oldContent) {
            errorsFixed++;
            fileFixed = true;
            
            if (verbose) {
              console.log(`Fixed unknown type issue in ${filePath}:`);
              if (match.length > 1) {
                console.log(`  - Pattern: ${match[0]}`);
              } else {
                console.log(`  - Fixed pattern`);
              }
            }
          }
        }
      }
    }
    
    // Write changes to file if content was modified
    if (fileFixed && content !== originalContent) {
      filesModified++;
      
      if (verbose) {
        console.log(`Modified: ${filePath}`);
      }
      
      if (!dryRun) {
        fs.writeFileSync(filePath, content, 'utf8');
      }
    }
  }
}

console.log(`Running fix-unknown-object-access.js ${dryRun ? '(dry run)' : ''}`);

// Start processing from the root directory
processFile(rootDir);

console.log(`\nSummary:`);
console.log(`Files scanned: ${filesScanned}`);
console.log(`Files modified: ${filesModified}`);
console.log(`Unknown type issues fixed: ${errorsFixed}`);
console.log(`${dryRun ? '(DRY RUN - No changes were made)' : 'Changes applied successfully'}`); |earth|Air)/g,
    check: (content) => {
      return content.includes('Property \'Fire\' does not exist on type \'unknown\'') ||
             content.includes('Property \'water\' does not exist on type \'unknown\'') ||
             content.includes('Property \'earth\' does not exist on type \'unknown\'') ||
             content.includes('Property \'Air\' does not exist on type \'unknown\'');
    },
    fix: (content, match) => {
      return content.replace(
        `elementalEffect.${match[1]}`,
        `(elementalEffect as any).${match[1]}`
      );
    }
  },
  
  // Pattern 3: Fix position.sign access
  {
    regex: /position\.(sign)/g,
    check: (content) => {
      return content.includes('Property \'sign\' does not exist on type \'unknown\'');
    },
    fix: (content, match) => {
      return content.replace(
        `position.${match[1]}`,
        `(position as any).${match[1]}`
      );
    }
  },
  
  // Pattern 4: Add proper interface imports when fixing typed issues
  {
    regex: /import\s+{([^}]+)}\s+from\s+['"]@\/types\/alchemy['"]/g,
    check: (content, match, filePath) => {
      return (filePath.includes('enhancedCuisineRecommender.ts') || 
              filePath.includes('CookingMethods.tsx') || 
              filePath.includes('elementalcalculations.ts')) && 
             !match[1].includes('Recipe');
    },
    fix: (content, match) => {
      // Add Recipe interface to imports
      const imports = match[1];
      if (!imports.includes('Recipe')) {
        const newImports = imports.trim() + ', Recipe';
        return content.replace(
          `import {${imports}} from '@/types/alchemy'`,
          `import {${newImports}} from '@/types/alchemy'`
        );
      }
      return content;
    }
  }
];

// Process a single file
function processFile(filePath) {
  // Skip node_modules and .git directories
  if (filePath.includes('node_modules') || filePath.includes('.git')) {
    return;
  }

  const stats = fs.statSync(filePath);

  if (stats.isDirectory()) {
    // Process directories recursively
    const files = fs.readdirSync(filePath);
    files.forEach(file => {
      processFile(path.join(filePath, file));
    });
  } else if (stats.isFile() && (filePath.endsWith('.ts') || filePath.endsWith('.tsx'))) {
    filesScanned++;
    
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Apply fixes for unknown type issues
    let fileFixed = false;
    
    for (const pattern of unknownTypePatterns) {
      const matches = [...content.matchAll(pattern.regex)];
      
      for (const match of matches) {
        if (pattern.check(content, match, filePath)) {
          const oldContent = content;
          content = pattern.fix(content, match);
          
          if (content !== oldContent) {
            errorsFixed++;
            fileFixed = true;
            
            if (verbose) {
              console.log(`Fixed unknown type issue in ${filePath}:`);
              if (match.length > 1) {
                console.log(`  - Pattern: ${match[0]}`);
              } else {
                console.log(`  - Fixed pattern`);
              }
            }
          }
        }
      }
    }
    
    // Write changes to file if content was modified
    if (fileFixed && content !== originalContent) {
      filesModified++;
      
      if (verbose) {
        console.log(`Modified: ${filePath}`);
      }
      
      if (!dryRun) {
        fs.writeFileSync(filePath, content, 'utf8');
      }
    }
  }
}

console.log(`Running fix-unknown-object-access.js ${dryRun ? '(dry run)' : ''}`);

// Start processing from the root directory
processFile(rootDir);

console.log(`\nSummary:`);
console.log(`Files scanned: ${filesScanned}`);
console.log(`Files modified: ${filesModified}`);
console.log(`Unknown type issues fixed: ${errorsFixed}`);
console.log(`${dryRun ? '(DRY RUN - No changes were made)' : 'Changes applied successfully'}`); |Air)/g,
    check: (content) => {
      return content.includes('Property \'Fire\' does not exist on type \'unknown\'') ||
             content.includes('Property \'water\' does not exist on type \'unknown\'') ||
             content.includes('Property \'earth\' does not exist on type \'unknown\'') ||
             content.includes('Property \'Air\' does not exist on type \'unknown\'');
    },
    fix: (content, match) => {
      return content.replace(
        `elementalEffect.${match[1]}`,
        `(elementalEffect as any).${match[1]}`
      );
    }
  },
  
  // Pattern 3: Fix position.sign access
  {
    regex: /position\.(sign)/g,
    check: (content) => {
      return content.includes('Property \'sign\' does not exist on type \'unknown\'');
    },
    fix: (content, match) => {
      return content.replace(
        `position.${match[1]}`,
        `(position as any).${match[1]}`
      );
    }
  },
  
  // Pattern 4: Add proper interface imports when fixing typed issues
  {
    regex: /import\s+{([^}]+)}\s+from\s+['"]@\/types\/alchemy['"]/g,
    check: (content, match, filePath) => {
      return (filePath.includes('enhancedCuisineRecommender.ts') || 
              filePath.includes('CookingMethods.tsx') || 
              filePath.includes('elementalcalculations.ts')) && 
             !match[1].includes('Recipe');
    },
    fix: (content, match) => {
      // Add Recipe interface to imports
      const imports = match[1];
      if (!imports.includes('Recipe')) {
        const newImports = imports.trim() + ', Recipe';
        return content.replace(
          `import {${imports}} from '@/types/alchemy'`,
          `import {${newImports}} from '@/types/alchemy'`
        );
      }
      return content;
    }
  }
];

// Process a single file
function processFile(filePath) {
  // Skip node_modules and .git directories
  if (filePath.includes('node_modules') || filePath.includes('.git')) {
    return;
  }

  const stats = fs.statSync(filePath);

  if (stats.isDirectory()) {
    // Process directories recursively
    const files = fs.readdirSync(filePath);
    files.forEach(file => {
      processFile(path.join(filePath, file));
    });
  } else if (stats.isFile() && (filePath.endsWith('.ts') || filePath.endsWith('.tsx'))) {
    filesScanned++;
    
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Apply fixes for unknown type issues
    let fileFixed = false;
    
    for (const pattern of unknownTypePatterns) {
      const matches = [...content.matchAll(pattern.regex)];
      
      for (const match of matches) {
        if (pattern.check(content, match, filePath)) {
          const oldContent = content;
          content = pattern.fix(content, match);
          
          if (content !== oldContent) {
            errorsFixed++;
            fileFixed = true;
            
            if (verbose) {
              console.log(`Fixed unknown type issue in ${filePath}:`);
              if (match.length > 1) {
                console.log(`  - Pattern: ${match[0]}`);
              } else {
                console.log(`  - Fixed pattern`);
              }
            }
          }
        }
      }
    }
    
    // Write changes to file if content was modified
    if (fileFixed && content !== originalContent) {
      filesModified++;
      
      if (verbose) {
        console.log(`Modified: ${filePath}`);
      }
      
      if (!dryRun) {
        fs.writeFileSync(filePath, content, 'utf8');
      }
    }
  }
}

console.log(`Running fix-unknown-object-access.js ${dryRun ? '(dry run)' : ''}`);

// Start processing from the root directory
processFile(rootDir);

console.log(`\nSummary:`);
console.log(`Files scanned: ${filesScanned}`);
console.log(`Files modified: ${filesModified}`);
console.log(`Unknown type issues fixed: ${errorsFixed}`);
console.log(`${dryRun ? '(DRY RUN - No changes were made)' : 'Changes applied successfully'}`); |12334Earthimport fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dryRun = process.argv.includes('--dry-run');
const verbose = process.argv.includes('--verbose');

// Root directory of the project (two levels up from this script)
const rootDir = path.resolve(__dirname, '..', '..');

// Track statistics
let filesScanned = 0;
let filesModified = 0;
let errorsFixed = 0;

// Patterns for fixing unknown type issues
const unknownTypePatterns = [
  // Pattern 1: recipe.propertyName issues - add type casting
  {
    regex: /(\w+)\.(\w+)(?=\s*[\.|\?|\|\||\)])/g,
    check: (content, match, filePath) => {
      // Specifically target files with known issues
      if (content.includes('TS2339: Property') || 
          filePath.includes('enhancedCuisineRecommender.ts') ||
          filePath.includes('elementalcalculations.ts') ||
          filePath.includes('CookingMethods.tsx')) {
        
        // Check if the accessed property is mentioned in an error
        const propertyAccess = `${match[1]}.${match[2]}`;
        return content.includes(`Property '${match[2]}' does not exist on type 'unknown'`) ||
               (match[1] === 'recipe' && 
                (match[2] === 'elementalProperties' || 
                 match[2] === 'season' || 
                 match[2] === 'mealType' ||
                 match[2] === 'tags' ||
                 match[2] === 'name' ||
                 match[2] === 'id' ||
                 match[2] === 'description' ||
                 match[2] === 'ingredients' ||
                 match[2] === 'astrologicalAffinities' ||
                 match[2] === 'lunarPhaseInfluences' ||
                 match[2] === 'zodiacInfluences' ||
                 match[2] === 'dietaryInfo' ||
                 match[2] === 'allergens'));
      }
      return false;
    },
    fix: (content, match) => {
      // Get the line where the match appears
      const lines = content.split('\n');
      const lineIndex = lines.findIndex(line => line.includes(`${match[1]}.${match[2]}`));
      
      if (lineIndex === -1) return content;
      
      // Determine the correct type for the property based on context
      let type = 'any';
      const property = match[2];
      
      if (property === 'elementalProperties') {
        type = 'Record<string, number>';
      } else if (property === 'season') {
        type = 'string[]';
      } else if (property === 'mealType') {
        type = 'string[]';
      } else if (property === 'tags') {
        type = 'string[]';
      } else if (property === 'name' || property === 'id' || property === 'description') {
        type = 'string';
      } else if (property === 'ingredients') {
        type = 'string[]';
      } else if (property === 'astrologicalAffinities') {
        type = '{ planets?: string[] }';
      } else if (property === 'lunarPhaseInfluences' || property === 'zodiacInfluences') {
        type = 'string[]';
      } else if (property === 'allergens' || property === 'dietaryInfo') {
        type = 'string[]';
      }
      
      // If it's a specific property access, add a type assertion
      if (match[1] === 'recipe' && ['elementalProperties', 'season', 'mealType', 'tags', 'name', 'id', 'description', 'ingredients', 'astrologicalAffinities', 'lunarPhaseInfluences', 'zodiacInfluences', 'dietaryInfo', 'allergens'].includes(property)) {
        const line = lines[lineIndex];
        
        // Handle object optional chaining (?.property)
        if (line.includes(`${match[1]}?.${match[2]}`)) {
          lines[lineIndex] = line.replace(
            `${match[1]}?.${match[2]}`,
            `(${match[1]} as any)?.${match[2]}`
          );
        } 
        // Handle normal property access
        else {
          lines[lineIndex] = line.replace(
            `${match[1]}.${match[2]}`,
            `(${match[1]} as any).${match[2]}`
          );
        }
        
        return lines.join('\n');
      }
      
      return content;
    }
  },
  
  // Pattern 2: Fix elementalEffect.Element access
  {
    regex: /elementalEffect\.(Fire|4168Waterimport fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dryRun = process.argv.includes('--dry-run');
const verbose = process.argv.includes('--verbose');

// Root directory of the project (two levels up from this script)
const rootDir = path.resolve(__dirname, '..', '..');

// Track statistics
let filesScanned = 0;
let filesModified = 0;
let errorsFixed = 0;

// Patterns for fixing unknown type issues
const unknownTypePatterns = [
  // Pattern 1: recipe.propertyName issues - add type casting
  {
    regex: /(\w+)\.(\w+)(?=\s*[\.|\?|\|\||\)])/g,
    check: (content, match, filePath) => {
      // Specifically target files with known issues
      if (content.includes('TS2339: Property') || 
          filePath.includes('enhancedCuisineRecommender.ts') ||
          filePath.includes('elementalcalculations.ts') ||
          filePath.includes('CookingMethods.tsx')) {
        
        // Check if the accessed property is mentioned in an error
        const propertyAccess = `${match[1]}.${match[2]}`;
        return content.includes(`Property '${match[2]}' does not exist on type 'unknown'`) ||
               (match[1] === 'recipe' && 
                (match[2] === 'elementalProperties' || 
                 match[2] === 'season' || 
                 match[2] === 'mealType' ||
                 match[2] === 'tags' ||
                 match[2] === 'name' ||
                 match[2] === 'id' ||
                 match[2] === 'description' ||
                 match[2] === 'ingredients' ||
                 match[2] === 'astrologicalAffinities' ||
                 match[2] === 'lunarPhaseInfluences' ||
                 match[2] === 'zodiacInfluences' ||
                 match[2] === 'dietaryInfo' ||
                 match[2] === 'allergens'));
      }
      return false;
    },
    fix: (content, match) => {
      // Get the line where the match appears
      const lines = content.split('\n');
      const lineIndex = lines.findIndex(line => line.includes(`${match[1]}.${match[2]}`));
      
      if (lineIndex === -1) return content;
      
      // Determine the correct type for the property based on context
      let type = 'any';
      const property = match[2];
      
      if (property === 'elementalProperties') {
        type = 'Record<string, number>';
      } else if (property === 'season') {
        type = 'string[]';
      } else if (property === 'mealType') {
        type = 'string[]';
      } else if (property === 'tags') {
        type = 'string[]';
      } else if (property === 'name' || property === 'id' || property === 'description') {
        type = 'string';
      } else if (property === 'ingredients') {
        type = 'string[]';
      } else if (property === 'astrologicalAffinities') {
        type = '{ planets?: string[] }';
      } else if (property === 'lunarPhaseInfluences' || property === 'zodiacInfluences') {
        type = 'string[]';
      } else if (property === 'allergens' || property === 'dietaryInfo') {
        type = 'string[]';
      }
      
      // If it's a specific property access, add a type assertion
      if (match[1] === 'recipe' && ['elementalProperties', 'season', 'mealType', 'tags', 'name', 'id', 'description', 'ingredients', 'astrologicalAffinities', 'lunarPhaseInfluences', 'zodiacInfluences', 'dietaryInfo', 'allergens'].includes(property)) {
        const line = lines[lineIndex];
        
        // Handle object optional chaining (?.property)
        if (line.includes(`${match[1]}?.${match[2]}`)) {
          lines[lineIndex] = line.replace(
            `${match[1]}?.${match[2]}`,
            `(${match[1]} as any)?.${match[2]}`
          );
        } 
        // Handle normal property access
        else {
          lines[lineIndex] = line.replace(
            `${match[1]}.${match[2]}`,
            `(${match[1]} as any).${match[2]}`
          );
        }
        
        return lines.join('\n');
      }
      
      return content;
    }
  },
  
  // Pattern 2: Fix elementalEffect.Element access
  {
    regex: /elementalEffect\.(Fire|water|earth|Air)/g,
    check: (content) => {
      return content.includes('Property \'Fire\' does not exist on type \'unknown\'') ||
             content.includes('Property \'water\' does not exist on type \'unknown\'') ||
             content.includes('Property \'earth\' does not exist on type \'unknown\'') ||
             content.includes('Property \'Air\' does not exist on type \'unknown\'');
    },
    fix: (content, match) => {
      return content.replace(
        `elementalEffect.${match[1]}`,
        `(elementalEffect as any).${match[1]}`
      );
    }
  },
  
  // Pattern 3: Fix position.sign access
  {
    regex: /position\.(sign)/g,
    check: (content) => {
      return content.includes('Property \'sign\' does not exist on type \'unknown\'');
    },
    fix: (content, match) => {
      return content.replace(
        `position.${match[1]}`,
        `(position as any).${match[1]}`
      );
    }
  },
  
  // Pattern 4: Add proper interface imports when fixing typed issues
  {
    regex: /import\s+{([^}]+)}\s+from\s+['"]@\/types\/alchemy['"]/g,
    check: (content, match, filePath) => {
      return (filePath.includes('enhancedCuisineRecommender.ts') || 
              filePath.includes('CookingMethods.tsx') || 
              filePath.includes('elementalcalculations.ts')) && 
             !match[1].includes('Recipe');
    },
    fix: (content, match) => {
      // Add Recipe interface to imports
      const imports = match[1];
      if (!imports.includes('Recipe')) {
        const newImports = imports.trim() + ', Recipe';
        return content.replace(
          `import {${imports}} from '@/types/alchemy'`,
          `import {${newImports}} from '@/types/alchemy'`
        );
      }
      return content;
    }
  }
];

// Process a single file
function processFile(filePath) {
  // Skip node_modules and .git directories
  if (filePath.includes('node_modules') || filePath.includes('.git')) {
    return;
  }

  const stats = fs.statSync(filePath);

  if (stats.isDirectory()) {
    // Process directories recursively
    const files = fs.readdirSync(filePath);
    files.forEach(file => {
      processFile(path.join(filePath, file));
    });
  } else if (stats.isFile() && (filePath.endsWith('.ts') || filePath.endsWith('.tsx'))) {
    filesScanned++;
    
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Apply fixes for unknown type issues
    let fileFixed = false;
    
    for (const pattern of unknownTypePatterns) {
      const matches = [...content.matchAll(pattern.regex)];
      
      for (const match of matches) {
        if (pattern.check(content, match, filePath)) {
          const oldContent = content;
          content = pattern.fix(content, match);
          
          if (content !== oldContent) {
            errorsFixed++;
            fileFixed = true;
            
            if (verbose) {
              console.log(`Fixed unknown type issue in ${filePath}:`);
              if (match.length > 1) {
                console.log(`  - Pattern: ${match[0]}`);
              } else {
                console.log(`  - Fixed pattern`);
              }
            }
          }
        }
      }
    }
    
    // Write changes to file if content was modified
    if (fileFixed && content !== originalContent) {
      filesModified++;
      
      if (verbose) {
        console.log(`Modified: ${filePath}`);
      }
      
      if (!dryRun) {
        fs.writeFileSync(filePath, content, 'utf8');
      }
    }
  }
}

console.log(`Running fix-unknown-object-access.js ${dryRun ? '(dry run)' : ''}`);

// Start processing from the root directory
processFile(rootDir);

console.log(`\nSummary:`);
console.log(`Files scanned: ${filesScanned}`);
console.log(`Files modified: ${filesModified}`);
console.log(`Unknown type issues fixed: ${errorsFixed}`);
console.log(`${dryRun ? '(DRY RUN - No changes were made)' : 'Changes applied successfully'}`); |earth|Air)/g,
    check: (content) => {
      return content.includes('Property \'Fire\' does not exist on type \'unknown\'') ||
             content.includes('Property \'water\' does not exist on type \'unknown\'') ||
             content.includes('Property \'earth\' does not exist on type \'unknown\'') ||
             content.includes('Property \'Air\' does not exist on type \'unknown\'');
    },
    fix: (content, match) => {
      return content.replace(
        `elementalEffect.${match[1]}`,
        `(elementalEffect as any).${match[1]}`
      );
    }
  },
  
  // Pattern 3: Fix position.sign access
  {
    regex: /position\.(sign)/g,
    check: (content) => {
      return content.includes('Property \'sign\' does not exist on type \'unknown\'');
    },
    fix: (content, match) => {
      return content.replace(
        `position.${match[1]}`,
        `(position as any).${match[1]}`
      );
    }
  },
  
  // Pattern 4: Add proper interface imports when fixing typed issues
  {
    regex: /import\s+{([^}]+)}\s+from\s+['"]@\/types\/alchemy['"]/g,
    check: (content, match, filePath) => {
      return (filePath.includes('enhancedCuisineRecommender.ts') || 
              filePath.includes('CookingMethods.tsx') || 
              filePath.includes('elementalcalculations.ts')) && 
             !match[1].includes('Recipe');
    },
    fix: (content, match) => {
      // Add Recipe interface to imports
      const imports = match[1];
      if (!imports.includes('Recipe')) {
        const newImports = imports.trim() + ', Recipe';
        return content.replace(
          `import {${imports}} from '@/types/alchemy'`,
          `import {${newImports}} from '@/types/alchemy'`
        );
      }
      return content;
    }
  }
];

// Process a single file
function processFile(filePath) {
  // Skip node_modules and .git directories
  if (filePath.includes('node_modules') || filePath.includes('.git')) {
    return;
  }

  const stats = fs.statSync(filePath);

  if (stats.isDirectory()) {
    // Process directories recursively
    const files = fs.readdirSync(filePath);
    files.forEach(file => {
      processFile(path.join(filePath, file));
    });
  } else if (stats.isFile() && (filePath.endsWith('.ts') || filePath.endsWith('.tsx'))) {
    filesScanned++;
    
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Apply fixes for unknown type issues
    let fileFixed = false;
    
    for (const pattern of unknownTypePatterns) {
      const matches = [...content.matchAll(pattern.regex)];
      
      for (const match of matches) {
        if (pattern.check(content, match, filePath)) {
          const oldContent = content;
          content = pattern.fix(content, match);
          
          if (content !== oldContent) {
            errorsFixed++;
            fileFixed = true;
            
            if (verbose) {
              console.log(`Fixed unknown type issue in ${filePath}:`);
              if (match.length > 1) {
                console.log(`  - Pattern: ${match[0]}`);
              } else {
                console.log(`  - Fixed pattern`);
              }
            }
          }
        }
      }
    }
    
    // Write changes to file if content was modified
    if (fileFixed && content !== originalContent) {
      filesModified++;
      
      if (verbose) {
        console.log(`Modified: ${filePath}`);
      }
      
      if (!dryRun) {
        fs.writeFileSync(filePath, content, 'utf8');
      }
    }
  }
}

console.log(`Running fix-unknown-object-access.js ${dryRun ? '(dry run)' : ''}`);

// Start processing from the root directory
processFile(rootDir);

console.log(`\nSummary:`);
console.log(`Files scanned: ${filesScanned}`);
console.log(`Files modified: ${filesModified}`);
console.log(`Unknown type issues fixed: ${errorsFixed}`);
console.log(`${dryRun ? '(DRY RUN - No changes were made)' : 'Changes applied successfully'}`); |Air)/g,
    check: (content) => {
      return content.includes('Property \'Fire\' does not exist on type \'unknown\'') ||
             content.includes('Property \'water\' does not exist on type \'unknown\'') ||
             content.includes('Property \'earth\' does not exist on type \'unknown\'') ||
             content.includes('Property \'Air\' does not exist on type \'unknown\'');
    },
    fix: (content, match) => {
      return content.replace(
        `elementalEffect.${match[1]}`,
        `(elementalEffect as any).${match[1]}`
      );
    }
  },
  
  // Pattern 3: Fix position.sign access
  {
    regex: /position\.(sign)/g,
    check: (content) => {
      return content.includes('Property \'sign\' does not exist on type \'unknown\'');
    },
    fix: (content, match) => {
      return content.replace(
        `position.${match[1]}`,
        `(position as any).${match[1]}`
      );
    }
  },
  
  // Pattern 4: Add proper interface imports when fixing typed issues
  {
    regex: /import\s+{([^}]+)}\s+from\s+['"]@\/types\/alchemy['"]/g,
    check: (content, match, filePath) => {
      return (filePath.includes('enhancedCuisineRecommender.ts') || 
              filePath.includes('CookingMethods.tsx') || 
              filePath.includes('elementalcalculations.ts')) && 
             !match[1].includes('Recipe');
    },
    fix: (content, match) => {
      // Add Recipe interface to imports
      const imports = match[1];
      if (!imports.includes('Recipe')) {
        const newImports = imports.trim() + ', Recipe';
        return content.replace(
          `import {${imports}} from '@/types/alchemy'`,
          `import {${newImports}} from '@/types/alchemy'`
        );
      }
      return content;
    }
  }
];

// Process a single file
function processFile(filePath) {
  // Skip node_modules and .git directories
  if (filePath.includes('node_modules') || filePath.includes('.git')) {
    return;
  }

  const stats = fs.statSync(filePath);

  if (stats.isDirectory()) {
    // Process directories recursively
    const files = fs.readdirSync(filePath);
    files.forEach(file => {
      processFile(path.join(filePath, file));
    });
  } else if (stats.isFile() && (filePath.endsWith('.ts') || filePath.endsWith('.tsx'))) {
    filesScanned++;
    
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Apply fixes for unknown type issues
    let fileFixed = false;
    
    for (const pattern of unknownTypePatterns) {
      const matches = [...content.matchAll(pattern.regex)];
      
      for (const match of matches) {
        if (pattern.check(content, match, filePath)) {
          const oldContent = content;
          content = pattern.fix(content, match);
          
          if (content !== oldContent) {
            errorsFixed++;
            fileFixed = true;
            
            if (verbose) {
              console.log(`Fixed unknown type issue in ${filePath}:`);
              if (match.length > 1) {
                console.log(`  - Pattern: ${match[0]}`);
              } else {
                console.log(`  - Fixed pattern`);
              }
            }
          }
        }
      }
    }
    
    // Write changes to file if content was modified
    if (fileFixed && content !== originalContent) {
      filesModified++;
      
      if (verbose) {
        console.log(`Modified: ${filePath}`);
      }
      
      if (!dryRun) {
        fs.writeFileSync(filePath, content, 'utf8');
      }
    }
  }
}

console.log(`Running fix-unknown-object-access.js ${dryRun ? '(dry run)' : ''}`);

// Start processing from the root directory
processFile(rootDir);

console.log(`\nSummary:`);
console.log(`Files scanned: ${filesScanned}`);
console.log(`Files modified: ${filesModified}`);
console.log(`Unknown type issues fixed: ${errorsFixed}`);
console.log(`${dryRun ? '(DRY RUN - No changes were made)' : 'Changes applied successfully'}`); 