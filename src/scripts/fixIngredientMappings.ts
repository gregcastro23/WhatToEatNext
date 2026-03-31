const fs = require('fs');
const path = require('path');

const INGREDIENTS_BASE_PATH = path.resolve(__dirname, '../data/ingredients');
const CATEGORIES = [
  'fruits',
  'grains',
  'herbs',
  'proteins',
  'seasonings',
  'spices',
  'vegetables'
];

// Regular expression patterns
const EXPORT_CONST_REGEX = /export\s+const\s+(\w+)\s*:\s*Record<string,\s*(\w+)>\s*=\s*{/;
const IMPORT_STATEMENT_REGEX = /import\s+.*from\s+['"](.*)['"]\s*;/g;

/**
 * Fix a single ingredient file
 */
function fixIngredientFile(filePath) {
  console.log(`Processing ${filePath}...`);
  
  // Read the file
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if file has already been fixed
  if (content.includes('fixIngredientMappings')) {
    console.log(`  Already fixed, skipping.`);
    return false;
  }
  
  // Extract variable name and type
  const exportMatch = content.match(EXPORT_CONST_REGEX);
  if (!exportMatch) {
    console.log(`  No export statement found, skipping.`);
    return false;
  }
  
  const variableName = exportMatch[1];
  const mappingType = exportMatch[2];
  
  // Add import for fixIngredientMappings
  const importPaths = [];
  let importMatch;
  while ((importMatch = IMPORT_STATEMENT_REGEX.exec(content)) !== null) {
    importPaths.push(importMatch[1]);
  }
  
  // Check if utils import already exists
  const hasUtilsImport = importPaths.some(path => path.includes('elementalUtils'));
  
  if (!hasUtilsImport) {
    // Find the last import statement
    const lastImportMatch = content.match(/import[^;]*;/g);
    const lastImport = lastImportMatch ? lastImportMatch[lastImportMatch.length - 1] : null;
    
    if (lastImport) {
      content = content.replace(
        lastImport,
        `${lastImport}\nimport { fixIngredientMappings } from '@/utils/elementalUtils';`
      );
    } else {
      content = `import { fixIngredientMappings } from '@/utils/elementalUtils';\n${content}`;
    }
  }
  
  // Replace export declaration with raw declaration
  content = content.replace(
    `export const ${variableName}: Record<string, ${mappingType}> = {`,
    `const raw${variableName.charAt(0).toUpperCase() + variableName.slice(1)}: Record<string, Partial<${mappingType}>> = {`
  );
  
  // Add fix statement before export
  const lastBraceIndex = content.lastIndexOf(';');
  if (lastBraceIndex !== -1) {
    content = content.slice(0, lastBraceIndex + 1) +
      `\n\n// Fix the ingredient mappings to ensure they have all required properties` +
      `\nexport const ${variableName}: Record<string, ${mappingType}> = fixIngredientMappings(raw${variableName.charAt(0).toUpperCase() + variableName.slice(1)});\n` +
      content.slice(lastBraceIndex + 1);
  }
  
  // Write the fixed content back to the file
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`  Fixed successfully.`);
  return true;
}

/**
 * Recursively get all TypeScript files in a directory
 */
function getAllTypeScriptFiles(dirPath) {
  const files = [];
  
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      files.push(...getAllTypeScriptFiles(fullPath));
    } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Main function to fix all ingredient files
 */
async function fixAllIngredientFiles() {
  let totalFiles = 0;
  let fixedFiles = 0;
  
  for (const category of CATEGORIES) {
    const categoryPath = path.join(INGREDIENTS_BASE_PATH, category);
    
    if (!fs.existsSync(categoryPath)) {
      console.warn(`Category directory not found: ${categoryPath}`);
      continue;
    }
    
    const tsFiles = getAllTypeScriptFiles(categoryPath);
    totalFiles += tsFiles.length;
    
    for (const file of tsFiles) {
      try {
        if (fixIngredientFile(file)) {
          fixedFiles++;
        }
      } catch (error) {
        console.error(`Error fixing file ${file}:`, error);
      }
    }
  }
  
  console.log(`\nSummary: Fixed ${fixedFiles} out of ${totalFiles} files.`);
}

// Run the script when directly executed
if (require.main === module) {
  fixAllIngredientFiles()
    .then(() => {
      console.log('All ingredient files have been processed.');
      process.exit(0);
    })
    .catch(error => {
      console.error('Error during processing:', error);
      process.exit(1);
    });
}

module.exports = { fixAllIngredientFiles }; 