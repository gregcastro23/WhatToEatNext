import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Mapping from old constants files to new consolidated files
const constantsMapping = {
  // Elemental consolidation
  'elementalConstants': 'elementalCore',
  'elements': 'elementalCore',
  
  // Seasonal consolidation
  'seasonalConstants': 'seasonalCore',
  'seasonalModifiers': 'seasonalCore',
  'seasons': 'seasonalCore',
  
  // Defaults consolidation
  'defaults': 'systemDefaults',
  
  // Keep these files as they are comprehensive and functional
  'alchemicalEnergyMapping': 'alchemicalEnergyMapping',
  'planetaryFoodAssociations': 'planetaryFoodAssociations'
};

// Import path mapping
const importPathMapping = {
  // Elemental paths
  '@/constants/elementalConstants': '@/constants/elementalCore',
  '@/constants/elements': '@/constants/elementalCore',
  '../constants/elementalConstants': '../constants/elementalCore',
  '../constants/elements': '../constants/elementalCore',
  './elementalConstants': './elementalCore',
  './elements': './elementalCore',
  
  // Seasonal paths
  '@/constants/seasonalConstants': '@/constants/seasonalCore',
  '@/constants/seasonalModifiers': '@/constants/seasonalCore',
  '@/constants/seasons': '@/constants/seasonalCore',
  '../constants/seasonalConstants': '../constants/seasonalCore',
  '../constants/seasonalModifiers': '../constants/seasonalCore',
  '../constants/seasons': '../constants/seasonalCore',
  './seasonalConstants': './seasonalCore',
  './seasonalModifiers': './seasonalCore',
  './seasons': './seasonalCore',
  
  // Defaults paths
  '@/constants/defaults': '@/constants/systemDefaults',
  '../constants/defaults': '../constants/systemDefaults',
  './defaults': './systemDefaults'
};

// Check if we're in dry run mode
const isDryRun = process.argv.includes('--dry-run');
console.log(`Running in ${isDryRun ? 'dry run' : 'actual change'} mode`);

// Find all TypeScript and JavaScript files in the project
async function findTsAndJsFiles() {
  return glob('**/*.{ts,tsx,js,jsx}', {
    cwd: rootDir,
    ignore: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/scripts/update-constants-imports.js',
      '**/constants/elementalCore.ts',
      '**/constants/seasonalCore.ts',
      '**/constants/systemDefaults.ts'
    ]
  });
}

// Update imports in a file
async function updateFileImports(filePath) {
  const fullPath = path.join(rootDir, filePath);
  
  try {
    // Read file content
    let content = fs.readFileSync(fullPath, 'utf-8');
    const originalContent = content;
    let modified = false;
    
    // Update direct imports from constants files
    for (const [oldPath, newPath] of Object.entries(importPathMapping)) {
      // Match import statements for the old path
      const importRegex = new RegExp(`import\\s+([^;]+)\\s+from\\s+['"]${oldPath.replace(/\//g, '\\/')}['"]`, 'g');
      content = content.replace(importRegex, (match, importedItems) => {
        modified = true;
        return `import ${importedItems} from '${newPath}'`;
      });
      
      // Match dynamic imports
      const dynamicImportRegex = new RegExp(`import\\s*\\(\\s*['"]${oldPath.replace(/\//g, '\\/')}['"]\\s*\\)`, 'g');
      content = content.replace(dynamicImportRegex, (match) => {
        modified = true;
        return `import('${newPath}')`;
      });
    }
    
    // Update specific import patterns that might need adjustment
    
    // Update ELEMENT_COMBINATIONS import path (moved from utils/constants/elements to elementalCore)
    const elementCombinationsRegex = /import\s+\{\s*ELEMENT_COMBINATIONS\s*\}\s+from\s+['"]@\/utils\/constants\/elements['"]/g;
    content = content.replace(elementCombinationsRegex, (match) => {
      modified = true;
      return `import { ELEMENT_COMBINATIONS } from '@/constants/elementalCore'`;
    });
    
    // Update DEFAULT_PROPERTIES import (moved to systemDefaults)
    const defaultPropertiesRegex = /import\s+\{\s*DEFAULT_PROPERTIES\s*\}\s+from\s+['"]@\/constants\/defaults['"]/g;
    content = content.replace(defaultPropertiesRegex, (match) => {
      modified = true;
      return `import { DEFAULT_ELEMENTAL_PROPERTIES as DEFAULT_PROPERTIES } from '@/constants/systemDefaults'`;
    });
    
    // Update DEFAULT_VALUES import (moved to systemDefaults)
    const defaultValuesRegex = /import\s+\{\s*DEFAULT_VALUES\s*\}\s+from\s+['"]@\/constants\/defaults['"]/g;
    content = content.replace(defaultValuesRegex, (match) => {
      modified = true;
      return `import { DEFAULT_ELEMENTAL_PROPERTIES as DEFAULT_VALUES } from '@/constants/systemDefaults'`;
    });
    
    // Update SEASONAL_MODIFIERS import with type annotation
    const seasonalModifiersRegex = /import\s+\{\s*SEASONAL_MODIFIERS,\s*SeasonalModifiers\s*\}\s+from\s+['"]@\/constants\/seasonalModifiers['"]/g;
    content = content.replace(seasonalModifiersRegex, (match) => {
      modified = true;
      return `import { SEASONAL_MODIFIERS } from '@/constants/seasonalCore'`;
    });
    
    // Only write changes if the file was modified
    if (modified) {
      console.log(`${isDryRun ? 'Would update' : 'Updated'}: ${filePath}`);
      
      if (!isDryRun) {
        fs.writeFileSync(fullPath, content, 'utf-8');
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Main function
async function main() {
  try {
    const files = await findTsAndJsFiles();
    console.log(`Found ${files.length} files to check`);
    
    let updatedCount = 0;
    
    for (const file of files) {
      const updated = await updateFileImports(file);
      if (updated) {
        updatedCount++;
      }
    }
    
    console.log(`${isDryRun ? 'Would update' : 'Updated'} ${updatedCount} files`);
    
    if (isDryRun) {
      console.log('Run again without --dry-run to apply changes');
    } else {
      console.log('\nConsolidation complete! You can now:');
      console.log('1. Delete the old constants files:');
      console.log('   - src/constants/elementalConstants.ts');
      console.log('   - src/constants/elements.ts');
      console.log('   - src/constants/seasonalConstants.ts');
      console.log('   - src/constants/seasonalModifiers.ts');
      console.log('   - src/constants/seasons.ts');
      console.log('   - src/constants/defaults.ts');
      console.log('2. Run yarn build to verify everything works');
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the script
main(); 