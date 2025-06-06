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

// Interface property fixes
const interfacePropertyFixes = [
  {
    // Fix missing 'energy' property in BasicThermodynamicProperties
    regex: /return\s*{\s*heat:\s*([^,]+),\s*entropy:\s*([^,]+),\s*reactivity:\s*([^,]+)\s*};/g,
    check: (content) => {
      return content.includes('BasicThermodynamicProperties') || 
             content.includes('import type { BasicThermodynamicProperties }');
    },
    fix: (content, match) => {
      // Add energy property to the returned object
      return content.replace(
        match[0],
        `return { heat: ${match[1]}, entropy: ${match[2]}, reactivity: ${match[3]}, energy: (${match[1]} * ${match[3]}) / ${match[2]} };`
      );
    }
  },
  {
    // Fix missing properties in CelestialPosition interface
    regex: /sign:\s*['"](\w+)['"]\s*,\s*degree:\s*([^,]+)\s*,\s*(?:exactLongitude:\s*([^,]+)\s*,\s*)?isRetrograde:\s*(true|false)/g,
    check: (content) => {
      return content.includes('CelestialPosition') && content.includes('exactLongitude') && 
             !content.includes('interface CelestialPosition ') && // Don't modify the interface definition itself
             content.includes('error TS2322'); // Check if there's actually an error
    },
    fix: (content, match) => {
      // Update CelestialPosition interface import if needed
      if (!content.includes('import type { CelestialPosition }')) {
        // Try to find where to add the import
        if (content.includes('import ')) {
          const lastImportIndex = content.lastIndexOf('import ');
          const endOfImport = content.indexOf('\n', lastImportIndex);
          
          if (endOfImport !== -1) {
            content = content.substring(0, endOfImport + 1) + 
                    "import type { CelestialPosition } from '@/types/alchemy';\n" + 
                    content.substring(endOfImport + 1);
          }
        }
      }
      
      // No need to modify the object itself since we'll fix the interface
      return content;
    }
  },
  {
    // Fix ZodiacSign type issues
    regex: /return\s*validSigns\.find\(\w+\s*=>\s*\w+\.toLowerCase\(\)\s*===\s*\w+\)\s*\|\|\s*['"](\w+)['"]\s*;/g,
    check: (content) => {
      return content.includes('ZodiacSign');
    },
    fix: (content, match) => {
      // Add type assertion
      return content.replace(
        match[0],
        `return (validSigns.find(sign => sign.toLowerCase() === normalized) || '${match[1]}') as ZodiacSign;`
      );
    }
  },
  {
    // Fix PlanetaryAspect missing properties
    regex: /aspects\.push\(\{\s*planet1,\s*planet2,\s*orb:\s*([^,]+),\s*influence:\s*([^,]+),\s*planets:\s*\[[^\]]+\],\s*additionalInfo:\s*{\s*aspectType:\s*([^}]+)\s*}\s*\}\);/g,
    check: (content) => {
      return content.includes('PlanetaryAspect') && content.includes('error TS2345');
    },
    fix: (content, match) => {
      // Add missing properties
      return content.replace(
        match[0],
        `aspects.push({
          planet1,
          planet2,
          orb: ${match[1]},
          influence: ${match[2]},
          planets: [planet1, planet2],
          type: aspect.type, // Add missing 'type' property
          strength: aspect.strength || Math.abs(1 - ${match[1]}), // Add missing 'strength' property
          additionalInfo: { aspectType: ${match[3]} }
        });`
      );
    }
  },
  {
    // Fix missing Record properties, e.g. for PlanetName
    regex: /const\s+(PLANET_\w+):\s*Record<(PlanetName),\s*[^>]+>\s*=\s*{([^}]+)}/g,
    check: (content, match) => {
      // Check if match exists and has the expected groups
      if (!match || match.length < 4) {
        return false;
      }
      
      // Check if some planets are missing
      return !match[3].includes('Uranusuranus') || !match[3].includes('Neptuneneptune') || !match[3].includes('Plutopluto');
    },
    fix: (content, match) => {
      // Add missing planets
      let objectContents = match[3].trim();
      
      if (!objectContents.includes('Uranusuranus')) {
        objectContents += ',\n  Uranusuranus: []';
      }
      
      if (!objectContents.includes('Neptuneneptune')) {
        objectContents += ',\n  Neptuneneptune: []';
      }
      
      if (!objectContents.includes('Plutopluto')) {
        objectContents += ',\n  Plutopluto: []';
      }
      
      return content.replace(
        `const ${match[1]}: Record<${match[2]}, string[]> = {${match[3]}}`,
        `const ${match[1]}: Record<${match[2]}, string[]> = {${objectContents}}`
      );
    }
  }
];

// Fix CelestialPosition interface in types file
function fixCelestialPositionInterface() {
  const typesFilePath = path.join(rootDir, 'src', 'types', 'alchemy.ts');
  
  if (fs.existsSync(typesFilePath)) {
    let content = fs.readFileSync(typesFilePath, 'utf8');
    const originalContent = content;
    
    // Find CelestialPosition interface
    const celestialPositionRegex = /export\s+interface\s+CelestialPosition\s*{[^}]+}/g;
    const match = celestialPositionRegex.exec(content);
    
    if (match) {
      const interfaceContent = match[0];
      
      // Check if exactLongitude is missing
      if (!interfaceContent.includes('exactLongitude')) {
        const updatedInterface = interfaceContent.replace(
          /export\s+interface\s+CelestialPosition\s*{/,
          `export interface CelestialPosition {
  exactLongitude?: number; // Add exactLongitude property`
        );
        
        content = content.replace(interfaceContent, updatedInterface);
        
        if (content !== originalContent) {
          errorsFixed++;
          filesModified++;
          
          if (verbose) {
            console.log(`Updated CelestialPosition interface in ${typesFilePath}`);
          }
          
          if (!dryRun) {
            fs.writeFileSync(typesFilePath, content, 'utf8');
          }
        }
      }
    }
  }
}

// Fix BasicThermodynamicProperties interface in types file
function fixBasicThermodynamicProperties() {
  const typesFilePath = path.join(rootDir, 'src', 'types', 'alchemy.ts');
  
  if (fs.existsSync(typesFilePath)) {
    let content = fs.readFileSync(typesFilePath, 'utf8');
    const originalContent = content;
    
    // Find BasicThermodynamicProperties interface
    const interfaceRegex = /export\s+interface\s+BasicThermodynamicProperties\s*{[^}]+}/g;
    const match = interfaceRegex.exec(content);
    
    if (match) {
      const interfaceContent = match[0];
      
      // Ensure energy is properly documented
      if (interfaceContent.includes('energy:')) {
        // Already has energy property, no changes needed
      } else {
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
    
    // Apply interface property fixes
    let fileFixed = false;
    
    for (const fix of interfacePropertyFixes) {
      const matches = [...content.matchAll(fix.regex)];
      
      for (const match of matches) {
        if (fix.check(content)) {
          const oldContent = content;
          content = fix.fix(content, match);
          
          if (content !== oldContent) {
            errorsFixed++;
            fileFixed = true;
            
            if (verbose) {
              console.log(`Fixed interface property issue in ${filePath}:`);
              console.log(`  - Pattern: ${fix.regex}`);
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

console.log(`Running fix-interface-properties.js ${dryRun ? '(dry run)' : ''}`);

// Fix interfaces in type definition files
fixCelestialPositionInterface();
fixBasicThermodynamicProperties();

// Start processing from the root directory
processFile(rootDir);

console.log(`\nSummary:`);
console.log(`Files scanned: ${filesScanned}`);
console.log(`Files modified: ${filesModified}`);
console.log(`Interface property issues fixed: ${errorsFixed}`);
console.log(`${dryRun ? '(DRY RUN - No changes were made)' : 'Changes applied successfully'}`); 