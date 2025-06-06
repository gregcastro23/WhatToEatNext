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

// Patterns for fixing BasicThermodynamicProperties issues
const thermodynamicPatterns = [
  // Pattern 1: Missing energy property in objects with heat, entropy, and reactivity
  {
    regex: /return\s*{\s*heat:\s*([^,]+),\s*entropy:\s*([^,]+),\s*reactivity:\s*([^,]+)\s*};/g,
    check: (content) => true, // Always check this pattern
    fix: (content, match) => {
      // Add energy property to the returned object
      return content.replace(
        match[0],
        `return { heat: ${match[1]}, entropy: ${match[2]}, reactivity: ${match[3]}, energy: (${match[1]} * ${match[2]}) / ${match[3]} };`
      );
    }
  },
  // Pattern 2: Objects with heat, entropy, reactivity but no energy property
  {
    regex: /{\s*heat:\s*([^,]+),\s*entropy:\s*([^,]+),\s*reactivity:\s*([^,]+)\s*}/g,
    check: (content, match) => {
      // Only fix if this isn't already handled by another pattern
      // and doesn't already have energy
      return !match[0].includes('energy:');
    },
    fix: (content, match) => {
      // Add energy property to the object
      return content.replace(
        match[0],
        `{ heat: ${match[1]}, entropy: ${match[2]}, reactivity: ${match[3]}, energy: (${match[1]} * ${match[2]}) / ${match[3]} }`
      );
    }
  },
  // Pattern 3: Fix in CookingMethods.tsx - methods returning thermodynamic properties
  {
    regex: /return\s*{\s*heat:\s*([^,]+),\s*entropy:\s*([^,]+),\s*reactivity:\s*([^,]+)\s*};(?!\s*\/\/\s*.*energy)/g,
    check: (content) => {
      return content.includes('CookingMethods.tsx');
    },
    fix: (content, match) => {
      return content.replace(
        match[0],
        `return { heat: ${match[1]}, entropy: ${match[2]}, reactivity: ${match[3]}, energy: ${match[1]} * 0.8 };`
      );
    }
  },
  // Pattern 4: Fix ElementalProperties empty objects
  {
    regex: /(spring|summer|autumn|fall|winter):\s*{}/g,
    check: (content) => {
      return content.includes('ElementalProperties');
    },
    fix: (content, match) => {
      return content.replace(
        match[0],
        `${match[1]}: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }`
      );
    }
  },
  // Pattern 5: Fix 'any' used as value in seasonalAdjustments.ts
  {
    regex: /'(new Moonmoon|waxing crescent|first quarter|waxing gibbous|full Moonmoon|waning gibbous|third quarter|waning crescent)':\s*any/g,
    check: (content) => {
      return content.includes('seasonalAdjustments.ts');
    },
    fix: (content, match) => {
      return content.replace(
        match[0],
        `'${match[1]}': { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }`
      );
    }
  }
];

// Fix BasicThermodynamicProperties interface in types file
function fixBasicThermodynamicPropertiesInterface() {
  const typesFilePath = path.join(rootDir, 'src', 'types', 'alchemy.ts');
  
  if (fs.existsSync(typesFilePath)) {
    let content = fs.readFileSync(typesFilePath, 'utf8');
    const originalContent = content;
    
    // Find BasicThermodynamicProperties interface
    const interfaceRegex = /export\s+interface\s+BasicThermodynamicProperties\s*{[^}]+}/g;
    const match = interfaceRegex.exec(content);
    
    if (match) {
      const interfaceContent = match[0];
      
      // Ensure energy is properly defined
      if (!interfaceContent.includes('energy:')) {
        // Add energy property to the interface
        const updatedInterface = interfaceContent.replace(
          /export\s+interface\s+BasicThermodynamicProperties\s*{/,
          `export interface BasicThermodynamicProperties {
  energy: number;     // Overall energy transfer efficiency`
        );
        
        content = content.replace(interfaceContent, updatedInterface);
        
        if (content !== originalContent) {
          errorsFixed++;
          filesModified++;
          
          if (verbose) {
            console.log(`Updated BasicThermodynamicProperties interface in ${typesFilePath}`);
          }
          
          if (!dryRun) {
            fs.writeFileSync(typesFilePath, content, 'utf8');
          }
        }
      }
    }
  }
}

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
    
    // Apply thermodynamic property fixes
    let fileFixed = false;
    
    for (const pattern of thermodynamicPatterns) {
      const matches = [...content.matchAll(pattern.regex)];
      
      for (const match of matches) {
        if (pattern.check(content, match)) {
          const oldContent = content;
          content = pattern.fix(content, match);
          
          if (content !== oldContent) {
            errorsFixed++;
            fileFixed = true;
            
            if (verbose) {
              console.log(`Fixed thermodynamic property issue in ${filePath}:`);
              console.log(`  - Before: ${match[0]}`);
              console.log(`  - After: ${content.substring(content.indexOf(match[1]) - 20, content.indexOf(match[1]) + 100)}`);
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

console.log(`Running fix-basic-thermodynamic-properties.js ${dryRun ? '(dry run)' : ''}`);

// Fix interface in type definition file
fixBasicThermodynamicPropertiesInterface();

// Start processing from the root directory
processFile(rootDir);

console.log(`\nSummary:`);
console.log(`Files scanned: ${filesScanned}`);
console.log(`Files modified: ${filesModified}`);
console.log(`Thermodynamic property issues fixed: ${errorsFixed}`);
console.log(`${dryRun ? '(DRY RUN - No changes were made)' : 'Changes applied successfully'}`); 