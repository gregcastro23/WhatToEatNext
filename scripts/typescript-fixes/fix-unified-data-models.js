import fs from 'fs';
import path from 'path';

const dryRun = process.argv.includes('--dry-run');

const unifiedDataDir = path.resolve(process.cwd(), 'src/data/unified');
const filesToProcess = [
  'flavorProfileMigration.ts',
  'unifiedFlavorEngine.ts',
  'enhancedIngredients.ts',
  'cuisineIntegrations.ts',
  'alchemicalCalculations.ts',
  'recipes.ts',
  'seasonal.ts',
  'cuisines.ts'
];

function fixUnifiedDataModels() {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Fixing unified data models...`);

  // Process each file
  filesToProcess.forEach(fileName => {
    const filePath = path.join(unifiedDataDir, fileName);
    
    if (!fs.existsSync(filePath)) {
      console.log(`File does not exist: ${filePath}`);
      return;
    }

    console.log(`Processing ${fileName}...`);
    
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Apply fixes based on the file
    if (fileName === 'flavorProfileMigration.ts') {
      content = fixFlavorProfileMigration(content);
    } else if (fileName === 'unifiedFlavorEngine.ts') {
      content = fixUnifiedFlavorEngine(content);
    } else {
      // General fixes for all other files
      content = fixMissingExports(content);
      content = fixAsyncAwaitPatterns(content);
      content = fixImportStatements(content);
    }
    
    // Write the changes if not a dry run
    if (!dryRun) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed ${fileName}`);
    } else {
      console.log(`[DRY RUN] Would fix ${fileName}`);
    }
  });
}

function fixFlavorProfileMigration(content) {
  // Fix missing exports for interfaces
  content = content.replace(
    /interface MigrationStats \{/g,
    'export interface MigrationStats {'
  );
  
  content = content.replace(
    /interface LegacyProfile \{/g,
    'export interface LegacyProfile {'
  );
  
  // Fix async/await patterns
  content = fixAsyncAwaitPatterns(content);
  
  // Fix import statements for types
  content = fixImportStatements(content);
  
  return content;
}

function fixUnifiedFlavorEngine(content) {
  // Fix async/await patterns
  content = fixAsyncAwaitPatterns(content);
  
  // Fix import statements for types
  content = fixImportStatements(content);
  
  return content;
}

function fixMissingExports(content) {
  // Find interfaces that aren't exported
  const interfaceRegex = /^\s*interface\s+(\w+)\s*\{/gm;
  
  content = content.replace(interfaceRegex, (match, interfaceName) => {
    // Exclude commented lines
    if (match.trim().startsWith('//')) {
      return match;
    }
    
    // Check if this interface is already exported elsewhere in the file
    const exportRegex = new RegExp(`export\\s+(type|interface)\\s+${interfaceName}\\s*=?\\s*`, 'g');
    if (content.match(exportRegex)) {
      return match; // Already exported
    }
    
    // Add export keyword
    return `export interface ${interfaceName} {`;
  });
  
  return content;
}

function fixAsyncAwaitPatterns(content) {
  // Fix async methods that return promises but don't have async keyword
  const promiseMethodRegex = /(public|private|protected)?\s+(\w+)\s*\([^)]*\)\s*:\s*Promise<[^>]+>\s*\{/g;
  
  content = content.replace(promiseMethodRegex, (match, access, methodName) => {
    // Skip if already async
    if (match.includes('async')) {
      return match;
    }
    
    // Add async keyword
    const accessPart = access ? `${access} ` : '';
    return `${accessPart}async ${methodName}(...): Promise<`;
  });
  
  // Add missing awaits for async calls
  const asyncCallRegex = /(this\.\w+|\w+)\s*\(\s*[^)]*\s*\)\s*\.then\(/g;
  
  content = content.replace(asyncCallRegex, (match, methodCall) => {
    // Check if it's in an async context and not already awaited
    const prevText = content.substring(Math.max(0, content.indexOf(match) - 30), content.indexOf(match));
    if (prevText.includes('async') && !prevText.includes('await') && !match.includes('Promise.all')) {
      return `await ${methodCall}(`;
    }
    return match;
  });
  
  return content;
}

function fixImportStatements(content) {
  // Convert imports from types directories to use 'type' keyword
  const typeImportRegex = /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]([^'"]+)['"]/g;
  
  return content.replace(typeImportRegex, (match, imports, source) => {
    // Skip if already using 'type'
    if (imports.includes('type ')) {
      return match;
    }
    
    // Check if it's importing from a types directory
    if (source.includes('/types/')) {
      // Convert to type imports
      const typeImports = imports
        .split(',')
        .map(item => item.trim())
        .filter(Boolean)
        .map(item => `type ${item}`)
        .join(', ');
      
      return `import { ${typeImports} } from '${source}'`;
    }
    
    return match;
  });
}

// Run the fix function
try {
  fixUnifiedDataModels();
} catch (error) {
  console.error('Error fixing unified data models:', error);
  process.exit(1);
} 