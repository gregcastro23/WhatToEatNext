// A script to update all ingredient files to use the fixIngredientMappings utility
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

// Process a single ingredient file
function processFile(filePath) {
  console.log(`Processing ${filePath}...`);
  
  // Read the file
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Skip files that are already fixed
  if (content.includes('fixIngredientMappings') && content.includes('rawAromatic') || 
      content.includes('rawAlliums') || content.includes('rawPome') || 
      content.includes('rawMeats') || content.includes('rawRefined') ||
      content.includes('rawWhole')) {
    console.log(`  Already fixed, skipping.`);
    return false;
  }
  
  // Find the export statement
  const exportMatch = content.match(/export\s+const\s+(\w+)\s*(?::\s*Record<string,\s*[^>]+>)?\s*=\s*{/);
  if (!exportMatch) {
    console.log(`  No export statement found, skipping.`);
    return false;
  }
  
  const variableName = exportMatch[1];
  console.log(`  Found export for ${variableName}`);
  
  // Update the imports
  let updatedContent = content;
  
  // Fix alchemy import if needed
  if (content.includes("from '@/types/ingredients'")) {
    updatedContent = updatedContent.replace(
      "from '@/types/ingredients'",
      "from '@/types/alchemy'"
    );
  }
  
  // Add fixIngredientMappings import if not present
  if (!content.includes('fixIngredientMappings')) {
    if (content.includes('import type')) {
      updatedContent = updatedContent.replace(
        /(import type .+?;)/,
        '$1\nimport { fixIngredientMappings } from \'@/utils/elementalUtils\';'
      );
    } else {
      updatedContent = 'import type { IngredientMapping } from \'@/types/alchemy\';\n' +
                       'import { fixIngredientMappings } from \'@/utils/elementalUtils\';\n\n' + 
                       updatedContent;
    }
  }
  
  // Transform the variable declaration
  const rawVarName = 'raw' + variableName.charAt(0).toUpperCase() + variableName.slice(1);
  
  // Replace the export statement with raw declaration
  updatedContent = updatedContent.replace(
    new RegExp(`export\\s+const\\s+${variableName}\\s*(?::\\s*Record<string,\\s*[^>]+>)?\\s*=\\s*{`),
    `const ${rawVarName}: Record<string, Partial<IngredientMapping>> = {`
  );
  
  // Add name properties to objects
  let match;
  const objectRegex = /'([^']+)':\s*{/g;
  while ((match = objectRegex.exec(updatedContent)) !== null) {
    const key = match[1];
    const index = match.index + match[0].length;
    
    // Check if name property already exists
    const nextLines = updatedContent.substring(index, index + 100);
    if (!nextLines.includes('name:')) {
      const formattedName = key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      updatedContent = 
        updatedContent.substring(0, index) + 
        `\n    name: '${formattedName}',` + 
        updatedContent.substring(index);
    }
  }
  
  // Add export statement at the end
  const closingBraceIndex = updatedContent.lastIndexOf('};');
  if (closingBraceIndex !== -1) {
    updatedContent = 
      updatedContent.substring(0, closingBraceIndex + 2) + 
      `\n\n// Fix the ingredient mappings to ensure they have all required properties\nexport const ${variableName}: Record<string, IngredientMapping> = fixIngredientMappings(${rawVarName});` +
      updatedContent.substring(closingBraceIndex + 2);
  }
  
  // Write updated content back to file
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log(`  Updated successfully.`);
  return true;
}

// Process all TypeScript files in a directory
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  let processed = 0;
  
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stats = fs.statSync(fullPath);
    
    if (stats.isDirectory()) {
      processed += processDirectory(fullPath);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts') && file !== 'index.ts') {
      if (processFile(fullPath)) {
        processed++;
      }
    }
  }
  
  return processed;
}

// Main function
async function main() {
  let totalProcessed = 0;
  
  for (const category of CATEGORIES) {
    const categoryPath = path.join(INGREDIENTS_BASE_PATH, category);
    
    if (!fs.existsSync(categoryPath)) {
      console.warn(`Category directory not found: ${categoryPath}`);
      continue;
    }
    
    console.log(`\nProcessing category: ${category}`);
    const processed = processDirectory(categoryPath);
    totalProcessed += processed;
    console.log(`Processed ${processed} files in ${category}`);
  }
  
  console.log(`\nTotal files processed: ${totalProcessed}`);
}

// Run the script
main()
  .then(() => {
    console.log('All ingredient files have been processed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error during processing:', error);
    process.exit(1);
  }); 