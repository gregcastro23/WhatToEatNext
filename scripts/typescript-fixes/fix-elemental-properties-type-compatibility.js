import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get root directory
const rootDir = resolve(__dirname, '..', '..');

// Directories to check
const dirsToCheck = [
  'src/utils/elemental',
  'src/utils/elementalMappings',
  'src/utils/recommendation',
  'src/calculations/core'
];

// Function to recursively get all .ts files in a directory
function getTypeScriptFiles(dir) {
  const dirents = readdirSync(dir, { withFileTypes: true });
  const files = dirents.map((dirent) => {
    const res = join(dir, dirent.name);
    return dirent.isDirectory() ? getTypeScriptFiles(res) : res;
  });
  return Array.prototype.concat(...files).filter(file => file.endsWith('.ts'));
}

// Main function
function fixElementalPropertiesCompatibility(dryRun = false) {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Fixing ElementalProperties type compatibility issues...`);
  
  let totalFilesModified = 0;
  let totalOccurrencesFixed = 0;
  
  try {
    // Process each directory
    for (const dir of dirsToCheck) {
      const dirPath = resolve(rootDir, dir);
      console.log(`Scanning directory: ${dirPath}`);
      
      try {
        const files = getTypeScriptFiles(dirPath);
        
        for (const file of files) {
          let fileContent = readFileSync(file, 'utf8');
          let originalContent = fileContent;
          let occurrencesFixed = 0;
          
          // Fix 1: Replace ElementalProperties without import with imported type
          if (!fileContent.includes('import') || !fileContent.includes('ElementalProperties')) {
            const importRegex = /^(import.+from.+)$/m;
            if (importRegex.test(fileContent) && !fileContent.includes('ElementalProperties')) {
              fileContent = fileContent.replace(
                importRegex,
                `$1\nimport type { ElementalProperties } from '@/types/alchemy';`
              );
              occurrencesFixed++;
            } else if (!importRegex.test(fileContent)) {
              fileContent = `import type { ElementalProperties } from '@/types/alchemy';\n\n${fileContent}`;
              occurrencesFixed++;
            }
          }
          
          // Fix 2: Fix type assertions for ElementalProperties
          const elementalPropsAssertionRegex = /as\s+{\s*(Fire|2515Waterimport { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get root directory
const rootDir = resolve(__dirname, '..', '..');

// Directories to check
const dirsToCheck = [
  'src/utils/elemental',
  'src/utils/elementalMappings',
  'src/utils/recommendation',
  'src/calculations/core'
];

// Function to recursively get all .ts files in a directory
function getTypeScriptFiles(dir) {
  const dirents = readdirSync(dir, { withFileTypes: true });
  const files = dirents.map((dirent) => {
    const res = join(dir, dirent.name);
    return dirent.isDirectory() ? getTypeScriptFiles(res) : res;
  });
  return Array.prototype.concat(...files).filter(file => file.endsWith('.ts'));
}

// Main function
function fixElementalPropertiesCompatibility(dryRun = false) {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Fixing ElementalProperties type compatibility issues...`);
  
  let totalFilesModified = 0;
  let totalOccurrencesFixed = 0;
  
  try {
    // Process each directory
    for (const dir of dirsToCheck) {
      const dirPath = resolve(rootDir, dir);
      console.log(`Scanning directory: ${dirPath}`);
      
      try {
        const files = getTypeScriptFiles(dirPath);
        
        for (const file of files) {
          let fileContent = readFileSync(file, 'utf8');
          let originalContent = fileContent;
          let occurrencesFixed = 0;
          
          // Fix 1: Replace ElementalProperties without import with imported type
          if (!fileContent.includes('import') || !fileContent.includes('ElementalProperties')) {
            const importRegex = /^(import.+from.+)$/m;
            if (importRegex.test(fileContent) && !fileContent.includes('ElementalProperties')) {
              fileContent = fileContent.replace(
                importRegex,
                `$1\nimport type { ElementalProperties } from '@/types/alchemy';`
              );
              occurrencesFixed++;
            } else if (!importRegex.test(fileContent)) {
              fileContent = `import type { ElementalProperties } from '@/types/alchemy';\n\n${fileContent}`;
              occurrencesFixed++;
            }
          }
          
          // Fix 2: Fix type assertions for ElementalProperties
          const elementalPropsAssertionRegex = /as\s+{\s*(Fire|water|5045Earthimport { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get root directory
const rootDir = resolve(__dirname, '..', '..');

// Directories to check
const dirsToCheck = [
  'src/utils/elemental',
  'src/utils/elementalMappings',
  'src/utils/recommendation',
  'src/calculations/core'
];

// Function to recursively get all .ts files in a directory
function getTypeScriptFiles(dir) {
  const dirents = readdirSync(dir, { withFileTypes: true });
  const files = dirents.map((dirent) => {
    const res = join(dir, dirent.name);
    return dirent.isDirectory() ? getTypeScriptFiles(res) : res;
  });
  return Array.prototype.concat(...files).filter(file => file.endsWith('.ts'));
}

// Main function
function fixElementalPropertiesCompatibility(dryRun = false) {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Fixing ElementalProperties type compatibility issues...`);
  
  let totalFilesModified = 0;
  let totalOccurrencesFixed = 0;
  
  try {
    // Process each directory
    for (const dir of dirsToCheck) {
      const dirPath = resolve(rootDir, dir);
      console.log(`Scanning directory: ${dirPath}`);
      
      try {
        const files = getTypeScriptFiles(dirPath);
        
        for (const file of files) {
          let fileContent = readFileSync(file, 'utf8');
          let originalContent = fileContent;
          let occurrencesFixed = 0;
          
          // Fix 1: Replace ElementalProperties without import with imported type
          if (!fileContent.includes('import') || !fileContent.includes('ElementalProperties')) {
            const importRegex = /^(import.+from.+)$/m;
            if (importRegex.test(fileContent) && !fileContent.includes('ElementalProperties')) {
              fileContent = fileContent.replace(
                importRegex,
                `$1\nimport type { ElementalProperties } from '@/types/alchemy';`
              );
              occurrencesFixed++;
            } else if (!importRegex.test(fileContent)) {
              fileContent = `import type { ElementalProperties } from '@/types/alchemy';\n\n${fileContent}`;
              occurrencesFixed++;
            }
          }
          
          // Fix 2: Fix type assertions for ElementalProperties
          const elementalPropsAssertionRegex = /as\s+{\s*(Fire|2515Waterimport { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get root directory
const rootDir = resolve(__dirname, '..', '..');

// Directories to check
const dirsToCheck = [
  'src/utils/elemental',
  'src/utils/elementalMappings',
  'src/utils/recommendation',
  'src/calculations/core'
];

// Function to recursively get all .ts files in a directory
function getTypeScriptFiles(dir) {
  const dirents = readdirSync(dir, { withFileTypes: true });
  const files = dirents.map((dirent) => {
    const res = join(dir, dirent.name);
    return dirent.isDirectory() ? getTypeScriptFiles(res) : res;
  });
  return Array.prototype.concat(...files).filter(file => file.endsWith('.ts'));
}

// Main function
function fixElementalPropertiesCompatibility(dryRun = false) {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Fixing ElementalProperties type compatibility issues...`);
  
  let totalFilesModified = 0;
  let totalOccurrencesFixed = 0;
  
  try {
    // Process each directory
    for (const dir of dirsToCheck) {
      const dirPath = resolve(rootDir, dir);
      console.log(`Scanning directory: ${dirPath}`);
      
      try {
        const files = getTypeScriptFiles(dirPath);
        
        for (const file of files) {
          let fileContent = readFileSync(file, 'utf8');
          let originalContent = fileContent;
          let occurrencesFixed = 0;
          
          // Fix 1: Replace ElementalProperties without import with imported type
          if (!fileContent.includes('import') || !fileContent.includes('ElementalProperties')) {
            const importRegex = /^(import.+from.+)$/m;
            if (importRegex.test(fileContent) && !fileContent.includes('ElementalProperties')) {
              fileContent = fileContent.replace(
                importRegex,
                `$1\nimport type { ElementalProperties } from '@/types/alchemy';`
              );
              occurrencesFixed++;
            } else if (!importRegex.test(fileContent)) {
              fileContent = `import type { ElementalProperties } from '@/types/alchemy';\n\n${fileContent}`;
              occurrencesFixed++;
            }
          }
          
          // Fix 2: Fix type assertions for ElementalProperties
          const elementalPropsAssertionRegex = /as\s+{\s*(Fire|water|earth|Air)[^}]*}/g;
          fileContent = fileContent.replace(elementalPropsAssertionRegex, 'as ElementalProperties');
          
          // Count occurrences fixed
          const assertionsFixed = (originalContent.match(elementalPropsAssertionRegex) || []).length;
          occurrencesFixed += assertionsFixed;
          
          // Fix 3: Fix inline ElementalProperties type definitions
          const inlineElementalPropsRegex = /interface\s+ElementalProperties\s*{[^}]*}/g;
          fileContent = fileContent.replace(inlineElementalPropsRegex, (match) => {
            occurrencesFixed++;
            return '// Using imported ElementalProperties type';
          });
          
          // Fix 4: Fix type casting for non-ElementalProperties objects
          const castingRegex = /([\w.]+)\s+as\s+ElementalProperties/g;
          fileContent = fileContent.replace(castingRegex, (match, varName) => {
            // Only replace if the variable isn't already typed as ElementalProperties
            if (!fileContent.includes(`${varName}: ElementalProperties`)) {
              occurrencesFixed++;
              return `{...${varName}} as ElementalProperties`;
            }
            return match;
          });
          
          // Fix 5: Fix function parameters without explicit type
          const functionParamRegex = /function\s+\w+\s*\(\s*(\w+)\s*\)\s*(?!:)/g;
          fileContent = fileContent.replace(functionParamRegex, (match, paramName) => {
            // Check if the function body uses Fire, water, earth, Air properties
            const functionBody = fileContent.substring(fileContent.indexOf(match) + match.length);
            const usesElementalProps = /\b(Fire|water|earth|Air)\b/.test(functionBody.substring(0, functionBody.indexOf('}')));
            
            if (usesElementalProps) {
              occurrencesFixed++;
              return match.replace(`(${paramName})`, `(${paramName}: ElementalProperties)`);
            }
            return match;
          });
          
          if (originalContent !== fileContent) {
            totalFilesModified++;
            totalOccurrencesFixed += occurrencesFixed;
            
            console.log(`\nModified file: ${file}`);
            console.log(`Fixed ${occurrencesFixed} occurrences`);
            
            if (!dryRun) {
              writeFileSync(file, fileContent, 'utf8');
            }
          }
        }
      } catch (err) {
        console.error(`Error processing directory ${dir}:`, err);
      }
    }
    
    console.log(`\n${dryRun ? '[DRY RUN] Would have modified' : 'Modified'} ${totalFilesModified} files with ${totalOccurrencesFixed} fixes`);
    
  } catch (error) {
    console.error('❌ Error fixing ElementalProperties type compatibility:', error);
    process.exit(1);
  }
}

// Command line arguments handling
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// Run the function
fixElementalPropertiesCompatibility(dryRun); |earth|Air)[^}]*}/g;
          fileContent = fileContent.replace(elementalPropsAssertionRegex, 'as ElementalProperties');
          
          // Count occurrences fixed
          const assertionsFixed = (originalContent.match(elementalPropsAssertionRegex) || []).length;
          occurrencesFixed += assertionsFixed;
          
          // Fix 3: Fix inline ElementalProperties type definitions
          const inlineElementalPropsRegex = /interface\s+ElementalProperties\s*{[^}]*}/g;
          fileContent = fileContent.replace(inlineElementalPropsRegex, (match) => {
            occurrencesFixed++;
            return '// Using imported ElementalProperties type';
          });
          
          // Fix 4: Fix type casting for non-ElementalProperties objects
          const castingRegex = /([\w.]+)\s+as\s+ElementalProperties/g;
          fileContent = fileContent.replace(castingRegex, (match, varName) => {
            // Only replace if the variable isn't already typed as ElementalProperties
            if (!fileContent.includes(`${varName}: ElementalProperties`)) {
              occurrencesFixed++;
              return `{...${varName}} as ElementalProperties`;
            }
            return match;
          });
          
          // Fix 5: Fix function parameters without explicit type
          const functionParamRegex = /function\s+\w+\s*\(\s*(\w+)\s*\)\s*(?!:)/g;
          fileContent = fileContent.replace(functionParamRegex, (match, paramName) => {
            // Check if the function body uses Fire, water, earth, Air properties
            const functionBody = fileContent.substring(fileContent.indexOf(match) + match.length);
            const usesElementalProps = /\b(Fire|4228Waterimport { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get root directory
const rootDir = resolve(__dirname, '..', '..');

// Directories to check
const dirsToCheck = [
  'src/utils/elemental',
  'src/utils/elementalMappings',
  'src/utils/recommendation',
  'src/calculations/core'
];

// Function to recursively get all .ts files in a directory
function getTypeScriptFiles(dir) {
  const dirents = readdirSync(dir, { withFileTypes: true });
  const files = dirents.map((dirent) => {
    const res = join(dir, dirent.name);
    return dirent.isDirectory() ? getTypeScriptFiles(res) : res;
  });
  return Array.prototype.concat(...files).filter(file => file.endsWith('.ts'));
}

// Main function
function fixElementalPropertiesCompatibility(dryRun = false) {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Fixing ElementalProperties type compatibility issues...`);
  
  let totalFilesModified = 0;
  let totalOccurrencesFixed = 0;
  
  try {
    // Process each directory
    for (const dir of dirsToCheck) {
      const dirPath = resolve(rootDir, dir);
      console.log(`Scanning directory: ${dirPath}`);
      
      try {
        const files = getTypeScriptFiles(dirPath);
        
        for (const file of files) {
          let fileContent = readFileSync(file, 'utf8');
          let originalContent = fileContent;
          let occurrencesFixed = 0;
          
          // Fix 1: Replace ElementalProperties without import with imported type
          if (!fileContent.includes('import') || !fileContent.includes('ElementalProperties')) {
            const importRegex = /^(import.+from.+)$/m;
            if (importRegex.test(fileContent) && !fileContent.includes('ElementalProperties')) {
              fileContent = fileContent.replace(
                importRegex,
                `$1\nimport type { ElementalProperties } from '@/types/alchemy';`
              );
              occurrencesFixed++;
            } else if (!importRegex.test(fileContent)) {
              fileContent = `import type { ElementalProperties } from '@/types/alchemy';\n\n${fileContent}`;
              occurrencesFixed++;
            }
          }
          
          // Fix 2: Fix type assertions for ElementalProperties
          const elementalPropsAssertionRegex = /as\s+{\s*(Fire|water|earth|Air)[^}]*}/g;
          fileContent = fileContent.replace(elementalPropsAssertionRegex, 'as ElementalProperties');
          
          // Count occurrences fixed
          const assertionsFixed = (originalContent.match(elementalPropsAssertionRegex) || []).length;
          occurrencesFixed += assertionsFixed;
          
          // Fix 3: Fix inline ElementalProperties type definitions
          const inlineElementalPropsRegex = /interface\s+ElementalProperties\s*{[^}]*}/g;
          fileContent = fileContent.replace(inlineElementalPropsRegex, (match) => {
            occurrencesFixed++;
            return '// Using imported ElementalProperties type';
          });
          
          // Fix 4: Fix type casting for non-ElementalProperties objects
          const castingRegex = /([\w.]+)\s+as\s+ElementalProperties/g;
          fileContent = fileContent.replace(castingRegex, (match, varName) => {
            // Only replace if the variable isn't already typed as ElementalProperties
            if (!fileContent.includes(`${varName}: ElementalProperties`)) {
              occurrencesFixed++;
              return `{...${varName}} as ElementalProperties`;
            }
            return match;
          });
          
          // Fix 5: Fix function parameters without explicit type
          const functionParamRegex = /function\s+\w+\s*\(\s*(\w+)\s*\)\s*(?!:)/g;
          fileContent = fileContent.replace(functionParamRegex, (match, paramName) => {
            // Check if the function body uses Fire, water, earth, Air properties
            const functionBody = fileContent.substring(fileContent.indexOf(match) + match.length);
            const usesElementalProps = /\b(Fire|water|earth|Air)\b/.test(functionBody.substring(0, functionBody.indexOf('}')));
            
            if (usesElementalProps) {
              occurrencesFixed++;
              return match.replace(`(${paramName})`, `(${paramName}: ElementalProperties)`);
            }
            return match;
          });
          
          if (originalContent !== fileContent) {
            totalFilesModified++;
            totalOccurrencesFixed += occurrencesFixed;
            
            console.log(`\nModified file: ${file}`);
            console.log(`Fixed ${occurrencesFixed} occurrences`);
            
            if (!dryRun) {
              writeFileSync(file, fileContent, 'utf8');
            }
          }
        }
      } catch (err) {
        console.error(`Error processing directory ${dir}:`, err);
      }
    }
    
    console.log(`\n${dryRun ? '[DRY RUN] Would have modified' : 'Modified'} ${totalFilesModified} files with ${totalOccurrencesFixed} fixes`);
    
  } catch (error) {
    console.error('❌ Error fixing ElementalProperties type compatibility:', error);
    process.exit(1);
  }
}

// Command line arguments handling
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// Run the function
fixElementalPropertiesCompatibility(dryRun); |earth|Air)\b/.test(functionBody.substring(0, functionBody.indexOf('}')));
            
            if (usesElementalProps) {
              occurrencesFixed++;
              return match.replace(`(${paramName})`, `(${paramName}: ElementalProperties)`);
            }
            return match;
          });
          
          if (originalContent !== fileContent) {
            totalFilesModified++;
            totalOccurrencesFixed += occurrencesFixed;
            
            console.log(`\nModified file: ${file}`);
            console.log(`Fixed ${occurrencesFixed} occurrences`);
            
            if (!dryRun) {
              writeFileSync(file, fileContent, 'utf8');
            }
          }
        }
      } catch (err) {
        console.error(`Error processing directory ${dir}:`, err);
      }
    }
    
    console.log(`\n${dryRun ? '[DRY RUN] Would have modified' : 'Modified'} ${totalFilesModified} files with ${totalOccurrencesFixed} fixes`);
    
  } catch (error) {
    console.error('❌ Error fixing ElementalProperties type compatibility:', error);
    process.exit(1);
  }
}

// Command line arguments handling
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// Run the function
fixElementalPropertiesCompatibility(dryRun); |Air)[^}]*}/g;
          fileContent = fileContent.replace(elementalPropsAssertionRegex, 'as ElementalProperties');
          
          // Count occurrences fixed
          const assertionsFixed = (originalContent.match(elementalPropsAssertionRegex) || []).length;
          occurrencesFixed += assertionsFixed;
          
          // Fix 3: Fix inline ElementalProperties type definitions
          const inlineElementalPropsRegex = /interface\s+ElementalProperties\s*{[^}]*}/g;
          fileContent = fileContent.replace(inlineElementalPropsRegex, (match) => {
            occurrencesFixed++;
            return '// Using imported ElementalProperties type';
          });
          
          // Fix 4: Fix type casting for non-ElementalProperties objects
          const castingRegex = /([\w.]+)\s+as\s+ElementalProperties/g;
          fileContent = fileContent.replace(castingRegex, (match, varName) => {
            // Only replace if the variable isn't already typed as ElementalProperties
            if (!fileContent.includes(`${varName}: ElementalProperties`)) {
              occurrencesFixed++;
              return `{...${varName}} as ElementalProperties`;
            }
            return match;
          });
          
          // Fix 5: Fix function parameters without explicit type
          const functionParamRegex = /function\s+\w+\s*\(\s*(\w+)\s*\)\s*(?!:)/g;
          fileContent = fileContent.replace(functionParamRegex, (match, paramName) => {
            // Check if the function body uses Fire, water, earth, Air properties
            const functionBody = fileContent.substring(fileContent.indexOf(match) + match.length);
            const usesElementalProps = /\b(Fire|water|6758Earthimport { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get root directory
const rootDir = resolve(__dirname, '..', '..');

// Directories to check
const dirsToCheck = [
  'src/utils/elemental',
  'src/utils/elementalMappings',
  'src/utils/recommendation',
  'src/calculations/core'
];

// Function to recursively get all .ts files in a directory
function getTypeScriptFiles(dir) {
  const dirents = readdirSync(dir, { withFileTypes: true });
  const files = dirents.map((dirent) => {
    const res = join(dir, dirent.name);
    return dirent.isDirectory() ? getTypeScriptFiles(res) : res;
  });
  return Array.prototype.concat(...files).filter(file => file.endsWith('.ts'));
}

// Main function
function fixElementalPropertiesCompatibility(dryRun = false) {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Fixing ElementalProperties type compatibility issues...`);
  
  let totalFilesModified = 0;
  let totalOccurrencesFixed = 0;
  
  try {
    // Process each directory
    for (const dir of dirsToCheck) {
      const dirPath = resolve(rootDir, dir);
      console.log(`Scanning directory: ${dirPath}`);
      
      try {
        const files = getTypeScriptFiles(dirPath);
        
        for (const file of files) {
          let fileContent = readFileSync(file, 'utf8');
          let originalContent = fileContent;
          let occurrencesFixed = 0;
          
          // Fix 1: Replace ElementalProperties without import with imported type
          if (!fileContent.includes('import') || !fileContent.includes('ElementalProperties')) {
            const importRegex = /^(import.+from.+)$/m;
            if (importRegex.test(fileContent) && !fileContent.includes('ElementalProperties')) {
              fileContent = fileContent.replace(
                importRegex,
                `$1\nimport type { ElementalProperties } from '@/types/alchemy';`
              );
              occurrencesFixed++;
            } else if (!importRegex.test(fileContent)) {
              fileContent = `import type { ElementalProperties } from '@/types/alchemy';\n\n${fileContent}`;
              occurrencesFixed++;
            }
          }
          
          // Fix 2: Fix type assertions for ElementalProperties
          const elementalPropsAssertionRegex = /as\s+{\s*(Fire|2515Waterimport { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get root directory
const rootDir = resolve(__dirname, '..', '..');

// Directories to check
const dirsToCheck = [
  'src/utils/elemental',
  'src/utils/elementalMappings',
  'src/utils/recommendation',
  'src/calculations/core'
];

// Function to recursively get all .ts files in a directory
function getTypeScriptFiles(dir) {
  const dirents = readdirSync(dir, { withFileTypes: true });
  const files = dirents.map((dirent) => {
    const res = join(dir, dirent.name);
    return dirent.isDirectory() ? getTypeScriptFiles(res) : res;
  });
  return Array.prototype.concat(...files).filter(file => file.endsWith('.ts'));
}

// Main function
function fixElementalPropertiesCompatibility(dryRun = false) {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Fixing ElementalProperties type compatibility issues...`);
  
  let totalFilesModified = 0;
  let totalOccurrencesFixed = 0;
  
  try {
    // Process each directory
    for (const dir of dirsToCheck) {
      const dirPath = resolve(rootDir, dir);
      console.log(`Scanning directory: ${dirPath}`);
      
      try {
        const files = getTypeScriptFiles(dirPath);
        
        for (const file of files) {
          let fileContent = readFileSync(file, 'utf8');
          let originalContent = fileContent;
          let occurrencesFixed = 0;
          
          // Fix 1: Replace ElementalProperties without import with imported type
          if (!fileContent.includes('import') || !fileContent.includes('ElementalProperties')) {
            const importRegex = /^(import.+from.+)$/m;
            if (importRegex.test(fileContent) && !fileContent.includes('ElementalProperties')) {
              fileContent = fileContent.replace(
                importRegex,
                `$1\nimport type { ElementalProperties } from '@/types/alchemy';`
              );
              occurrencesFixed++;
            } else if (!importRegex.test(fileContent)) {
              fileContent = `import type { ElementalProperties } from '@/types/alchemy';\n\n${fileContent}`;
              occurrencesFixed++;
            }
          }
          
          // Fix 2: Fix type assertions for ElementalProperties
          const elementalPropsAssertionRegex = /as\s+{\s*(Fire|water|earth|Air)[^}]*}/g;
          fileContent = fileContent.replace(elementalPropsAssertionRegex, 'as ElementalProperties');
          
          // Count occurrences fixed
          const assertionsFixed = (originalContent.match(elementalPropsAssertionRegex) || []).length;
          occurrencesFixed += assertionsFixed;
          
          // Fix 3: Fix inline ElementalProperties type definitions
          const inlineElementalPropsRegex = /interface\s+ElementalProperties\s*{[^}]*}/g;
          fileContent = fileContent.replace(inlineElementalPropsRegex, (match) => {
            occurrencesFixed++;
            return '// Using imported ElementalProperties type';
          });
          
          // Fix 4: Fix type casting for non-ElementalProperties objects
          const castingRegex = /([\w.]+)\s+as\s+ElementalProperties/g;
          fileContent = fileContent.replace(castingRegex, (match, varName) => {
            // Only replace if the variable isn't already typed as ElementalProperties
            if (!fileContent.includes(`${varName}: ElementalProperties`)) {
              occurrencesFixed++;
              return `{...${varName}} as ElementalProperties`;
            }
            return match;
          });
          
          // Fix 5: Fix function parameters without explicit type
          const functionParamRegex = /function\s+\w+\s*\(\s*(\w+)\s*\)\s*(?!:)/g;
          fileContent = fileContent.replace(functionParamRegex, (match, paramName) => {
            // Check if the function body uses Fire, water, earth, Air properties
            const functionBody = fileContent.substring(fileContent.indexOf(match) + match.length);
            const usesElementalProps = /\b(Fire|water|earth|Air)\b/.test(functionBody.substring(0, functionBody.indexOf('}')));
            
            if (usesElementalProps) {
              occurrencesFixed++;
              return match.replace(`(${paramName})`, `(${paramName}: ElementalProperties)`);
            }
            return match;
          });
          
          if (originalContent !== fileContent) {
            totalFilesModified++;
            totalOccurrencesFixed += occurrencesFixed;
            
            console.log(`\nModified file: ${file}`);
            console.log(`Fixed ${occurrencesFixed} occurrences`);
            
            if (!dryRun) {
              writeFileSync(file, fileContent, 'utf8');
            }
          }
        }
      } catch (err) {
        console.error(`Error processing directory ${dir}:`, err);
      }
    }
    
    console.log(`\n${dryRun ? '[DRY RUN] Would have modified' : 'Modified'} ${totalFilesModified} files with ${totalOccurrencesFixed} fixes`);
    
  } catch (error) {
    console.error('❌ Error fixing ElementalProperties type compatibility:', error);
    process.exit(1);
  }
}

// Command line arguments handling
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// Run the function
fixElementalPropertiesCompatibility(dryRun); |earth|Air)[^}]*}/g;
          fileContent = fileContent.replace(elementalPropsAssertionRegex, 'as ElementalProperties');
          
          // Count occurrences fixed
          const assertionsFixed = (originalContent.match(elementalPropsAssertionRegex) || []).length;
          occurrencesFixed += assertionsFixed;
          
          // Fix 3: Fix inline ElementalProperties type definitions
          const inlineElementalPropsRegex = /interface\s+ElementalProperties\s*{[^}]*}/g;
          fileContent = fileContent.replace(inlineElementalPropsRegex, (match) => {
            occurrencesFixed++;
            return '// Using imported ElementalProperties type';
          });
          
          // Fix 4: Fix type casting for non-ElementalProperties objects
          const castingRegex = /([\w.]+)\s+as\s+ElementalProperties/g;
          fileContent = fileContent.replace(castingRegex, (match, varName) => {
            // Only replace if the variable isn't already typed as ElementalProperties
            if (!fileContent.includes(`${varName}: ElementalProperties`)) {
              occurrencesFixed++;
              return `{...${varName}} as ElementalProperties`;
            }
            return match;
          });
          
          // Fix 5: Fix function parameters without explicit type
          const functionParamRegex = /function\s+\w+\s*\(\s*(\w+)\s*\)\s*(?!:)/g;
          fileContent = fileContent.replace(functionParamRegex, (match, paramName) => {
            // Check if the function body uses Fire, water, earth, Air properties
            const functionBody = fileContent.substring(fileContent.indexOf(match) + match.length);
            const usesElementalProps = /\b(Fire|4228Waterimport { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get root directory
const rootDir = resolve(__dirname, '..', '..');

// Directories to check
const dirsToCheck = [
  'src/utils/elemental',
  'src/utils/elementalMappings',
  'src/utils/recommendation',
  'src/calculations/core'
];

// Function to recursively get all .ts files in a directory
function getTypeScriptFiles(dir) {
  const dirents = readdirSync(dir, { withFileTypes: true });
  const files = dirents.map((dirent) => {
    const res = join(dir, dirent.name);
    return dirent.isDirectory() ? getTypeScriptFiles(res) : res;
  });
  return Array.prototype.concat(...files).filter(file => file.endsWith('.ts'));
}

// Main function
function fixElementalPropertiesCompatibility(dryRun = false) {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Fixing ElementalProperties type compatibility issues...`);
  
  let totalFilesModified = 0;
  let totalOccurrencesFixed = 0;
  
  try {
    // Process each directory
    for (const dir of dirsToCheck) {
      const dirPath = resolve(rootDir, dir);
      console.log(`Scanning directory: ${dirPath}`);
      
      try {
        const files = getTypeScriptFiles(dirPath);
        
        for (const file of files) {
          let fileContent = readFileSync(file, 'utf8');
          let originalContent = fileContent;
          let occurrencesFixed = 0;
          
          // Fix 1: Replace ElementalProperties without import with imported type
          if (!fileContent.includes('import') || !fileContent.includes('ElementalProperties')) {
            const importRegex = /^(import.+from.+)$/m;
            if (importRegex.test(fileContent) && !fileContent.includes('ElementalProperties')) {
              fileContent = fileContent.replace(
                importRegex,
                `$1\nimport type { ElementalProperties } from '@/types/alchemy';`
              );
              occurrencesFixed++;
            } else if (!importRegex.test(fileContent)) {
              fileContent = `import type { ElementalProperties } from '@/types/alchemy';\n\n${fileContent}`;
              occurrencesFixed++;
            }
          }
          
          // Fix 2: Fix type assertions for ElementalProperties
          const elementalPropsAssertionRegex = /as\s+{\s*(Fire|water|earth|Air)[^}]*}/g;
          fileContent = fileContent.replace(elementalPropsAssertionRegex, 'as ElementalProperties');
          
          // Count occurrences fixed
          const assertionsFixed = (originalContent.match(elementalPropsAssertionRegex) || []).length;
          occurrencesFixed += assertionsFixed;
          
          // Fix 3: Fix inline ElementalProperties type definitions
          const inlineElementalPropsRegex = /interface\s+ElementalProperties\s*{[^}]*}/g;
          fileContent = fileContent.replace(inlineElementalPropsRegex, (match) => {
            occurrencesFixed++;
            return '// Using imported ElementalProperties type';
          });
          
          // Fix 4: Fix type casting for non-ElementalProperties objects
          const castingRegex = /([\w.]+)\s+as\s+ElementalProperties/g;
          fileContent = fileContent.replace(castingRegex, (match, varName) => {
            // Only replace if the variable isn't already typed as ElementalProperties
            if (!fileContent.includes(`${varName}: ElementalProperties`)) {
              occurrencesFixed++;
              return `{...${varName}} as ElementalProperties`;
            }
            return match;
          });
          
          // Fix 5: Fix function parameters without explicit type
          const functionParamRegex = /function\s+\w+\s*\(\s*(\w+)\s*\)\s*(?!:)/g;
          fileContent = fileContent.replace(functionParamRegex, (match, paramName) => {
            // Check if the function body uses Fire, water, earth, Air properties
            const functionBody = fileContent.substring(fileContent.indexOf(match) + match.length);
            const usesElementalProps = /\b(Fire|water|earth|Air)\b/.test(functionBody.substring(0, functionBody.indexOf('}')));
            
            if (usesElementalProps) {
              occurrencesFixed++;
              return match.replace(`(${paramName})`, `(${paramName}: ElementalProperties)`);
            }
            return match;
          });
          
          if (originalContent !== fileContent) {
            totalFilesModified++;
            totalOccurrencesFixed += occurrencesFixed;
            
            console.log(`\nModified file: ${file}`);
            console.log(`Fixed ${occurrencesFixed} occurrences`);
            
            if (!dryRun) {
              writeFileSync(file, fileContent, 'utf8');
            }
          }
        }
      } catch (err) {
        console.error(`Error processing directory ${dir}:`, err);
      }
    }
    
    console.log(`\n${dryRun ? '[DRY RUN] Would have modified' : 'Modified'} ${totalFilesModified} files with ${totalOccurrencesFixed} fixes`);
    
  } catch (error) {
    console.error('❌ Error fixing ElementalProperties type compatibility:', error);
    process.exit(1);
  }
}

// Command line arguments handling
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// Run the function
fixElementalPropertiesCompatibility(dryRun); |earth|Air)\b/.test(functionBody.substring(0, functionBody.indexOf('}')));
            
            if (usesElementalProps) {
              occurrencesFixed++;
              return match.replace(`(${paramName})`, `(${paramName}: ElementalProperties)`);
            }
            return match;
          });
          
          if (originalContent !== fileContent) {
            totalFilesModified++;
            totalOccurrencesFixed += occurrencesFixed;
            
            console.log(`\nModified file: ${file}`);
            console.log(`Fixed ${occurrencesFixed} occurrences`);
            
            if (!dryRun) {
              writeFileSync(file, fileContent, 'utf8');
            }
          }
        }
      } catch (err) {
        console.error(`Error processing directory ${dir}:`, err);
      }
    }
    
    console.log(`\n${dryRun ? '[DRY RUN] Would have modified' : 'Modified'} ${totalFilesModified} files with ${totalOccurrencesFixed} fixes`);
    
  } catch (error) {
    console.error('❌ Error fixing ElementalProperties type compatibility:', error);
    process.exit(1);
  }
}

// Command line arguments handling
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// Run the function
fixElementalPropertiesCompatibility(dryRun); |Air)\b/.test(functionBody.substring(0, functionBody.indexOf('}')));
            
            if (usesElementalProps) {
              occurrencesFixed++;
              return match.replace(`(${paramName})`, `(${paramName}: ElementalProperties)`);
            }
            return match;
          });
          
          if (originalContent !== fileContent) {
            totalFilesModified++;
            totalOccurrencesFixed += occurrencesFixed;
            
            console.log(`\nModified file: ${file}`);
            console.log(`Fixed ${occurrencesFixed} occurrences`);
            
            if (!dryRun) {
              writeFileSync(file, fileContent, 'utf8');
            }
          }
        }
      } catch (err) {
        console.error(`Error processing directory ${dir}:`, err);
      }
    }
    
    console.log(`\n${dryRun ? '[DRY RUN] Would have modified' : 'Modified'} ${totalFilesModified} files with ${totalOccurrencesFixed} fixes`);
    
  } catch (error) {
    console.error('❌ Error fixing ElementalProperties type compatibility:', error);
    process.exit(1);
  }
}

// Command line arguments handling
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// Run the function
fixElementalPropertiesCompatibility(dryRun); |8045Earthimport { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get root directory
const rootDir = resolve(__dirname, '..', '..');

// Directories to check
const dirsToCheck = [
  'src/utils/elemental',
  'src/utils/elementalMappings',
  'src/utils/recommendation',
  'src/calculations/core'
];

// Function to recursively get all .ts files in a directory
function getTypeScriptFiles(dir) {
  const dirents = readdirSync(dir, { withFileTypes: true });
  const files = dirents.map((dirent) => {
    const res = join(dir, dirent.name);
    return dirent.isDirectory() ? getTypeScriptFiles(res) : res;
  });
  return Array.prototype.concat(...files).filter(file => file.endsWith('.ts'));
}

// Main function
function fixElementalPropertiesCompatibility(dryRun = false) {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Fixing ElementalProperties type compatibility issues...`);
  
  let totalFilesModified = 0;
  let totalOccurrencesFixed = 0;
  
  try {
    // Process each directory
    for (const dir of dirsToCheck) {
      const dirPath = resolve(rootDir, dir);
      console.log(`Scanning directory: ${dirPath}`);
      
      try {
        const files = getTypeScriptFiles(dirPath);
        
        for (const file of files) {
          let fileContent = readFileSync(file, 'utf8');
          let originalContent = fileContent;
          let occurrencesFixed = 0;
          
          // Fix 1: Replace ElementalProperties without import with imported type
          if (!fileContent.includes('import') || !fileContent.includes('ElementalProperties')) {
            const importRegex = /^(import.+from.+)$/m;
            if (importRegex.test(fileContent) && !fileContent.includes('ElementalProperties')) {
              fileContent = fileContent.replace(
                importRegex,
                `$1\nimport type { ElementalProperties } from '@/types/alchemy';`
              );
              occurrencesFixed++;
            } else if (!importRegex.test(fileContent)) {
              fileContent = `import type { ElementalProperties } from '@/types/alchemy';\n\n${fileContent}`;
              occurrencesFixed++;
            }
          }
          
          // Fix 2: Fix type assertions for ElementalProperties
          const elementalPropsAssertionRegex = /as\s+{\s*(Fire|2515Waterimport { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get root directory
const rootDir = resolve(__dirname, '..', '..');

// Directories to check
const dirsToCheck = [
  'src/utils/elemental',
  'src/utils/elementalMappings',
  'src/utils/recommendation',
  'src/calculations/core'
];

// Function to recursively get all .ts files in a directory
function getTypeScriptFiles(dir) {
  const dirents = readdirSync(dir, { withFileTypes: true });
  const files = dirents.map((dirent) => {
    const res = join(dir, dirent.name);
    return dirent.isDirectory() ? getTypeScriptFiles(res) : res;
  });
  return Array.prototype.concat(...files).filter(file => file.endsWith('.ts'));
}

// Main function
function fixElementalPropertiesCompatibility(dryRun = false) {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Fixing ElementalProperties type compatibility issues...`);
  
  let totalFilesModified = 0;
  let totalOccurrencesFixed = 0;
  
  try {
    // Process each directory
    for (const dir of dirsToCheck) {
      const dirPath = resolve(rootDir, dir);
      console.log(`Scanning directory: ${dirPath}`);
      
      try {
        const files = getTypeScriptFiles(dirPath);
        
        for (const file of files) {
          let fileContent = readFileSync(file, 'utf8');
          let originalContent = fileContent;
          let occurrencesFixed = 0;
          
          // Fix 1: Replace ElementalProperties without import with imported type
          if (!fileContent.includes('import') || !fileContent.includes('ElementalProperties')) {
            const importRegex = /^(import.+from.+)$/m;
            if (importRegex.test(fileContent) && !fileContent.includes('ElementalProperties')) {
              fileContent = fileContent.replace(
                importRegex,
                `$1\nimport type { ElementalProperties } from '@/types/alchemy';`
              );
              occurrencesFixed++;
            } else if (!importRegex.test(fileContent)) {
              fileContent = `import type { ElementalProperties } from '@/types/alchemy';\n\n${fileContent}`;
              occurrencesFixed++;
            }
          }
          
          // Fix 2: Fix type assertions for ElementalProperties
          const elementalPropsAssertionRegex = /as\s+{\s*(Fire|water|earth|Air)[^}]*}/g;
          fileContent = fileContent.replace(elementalPropsAssertionRegex, 'as ElementalProperties');
          
          // Count occurrences fixed
          const assertionsFixed = (originalContent.match(elementalPropsAssertionRegex) || []).length;
          occurrencesFixed += assertionsFixed;
          
          // Fix 3: Fix inline ElementalProperties type definitions
          const inlineElementalPropsRegex = /interface\s+ElementalProperties\s*{[^}]*}/g;
          fileContent = fileContent.replace(inlineElementalPropsRegex, (match) => {
            occurrencesFixed++;
            return '// Using imported ElementalProperties type';
          });
          
          // Fix 4: Fix type casting for non-ElementalProperties objects
          const castingRegex = /([\w.]+)\s+as\s+ElementalProperties/g;
          fileContent = fileContent.replace(castingRegex, (match, varName) => {
            // Only replace if the variable isn't already typed as ElementalProperties
            if (!fileContent.includes(`${varName}: ElementalProperties`)) {
              occurrencesFixed++;
              return `{...${varName}} as ElementalProperties`;
            }
            return match;
          });
          
          // Fix 5: Fix function parameters without explicit type
          const functionParamRegex = /function\s+\w+\s*\(\s*(\w+)\s*\)\s*(?!:)/g;
          fileContent = fileContent.replace(functionParamRegex, (match, paramName) => {
            // Check if the function body uses Fire, water, earth, Air properties
            const functionBody = fileContent.substring(fileContent.indexOf(match) + match.length);
            const usesElementalProps = /\b(Fire|water|earth|Air)\b/.test(functionBody.substring(0, functionBody.indexOf('}')));
            
            if (usesElementalProps) {
              occurrencesFixed++;
              return match.replace(`(${paramName})`, `(${paramName}: ElementalProperties)`);
            }
            return match;
          });
          
          if (originalContent !== fileContent) {
            totalFilesModified++;
            totalOccurrencesFixed += occurrencesFixed;
            
            console.log(`\nModified file: ${file}`);
            console.log(`Fixed ${occurrencesFixed} occurrences`);
            
            if (!dryRun) {
              writeFileSync(file, fileContent, 'utf8');
            }
          }
        }
      } catch (err) {
        console.error(`Error processing directory ${dir}:`, err);
      }
    }
    
    console.log(`\n${dryRun ? '[DRY RUN] Would have modified' : 'Modified'} ${totalFilesModified} files with ${totalOccurrencesFixed} fixes`);
    
  } catch (error) {
    console.error('❌ Error fixing ElementalProperties type compatibility:', error);
    process.exit(1);
  }
}

// Command line arguments handling
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// Run the function
fixElementalPropertiesCompatibility(dryRun); |earth|Air)[^}]*}/g;
          fileContent = fileContent.replace(elementalPropsAssertionRegex, 'as ElementalProperties');
          
          // Count occurrences fixed
          const assertionsFixed = (originalContent.match(elementalPropsAssertionRegex) || []).length;
          occurrencesFixed += assertionsFixed;
          
          // Fix 3: Fix inline ElementalProperties type definitions
          const inlineElementalPropsRegex = /interface\s+ElementalProperties\s*{[^}]*}/g;
          fileContent = fileContent.replace(inlineElementalPropsRegex, (match) => {
            occurrencesFixed++;
            return '// Using imported ElementalProperties type';
          });
          
          // Fix 4: Fix type casting for non-ElementalProperties objects
          const castingRegex = /([\w.]+)\s+as\s+ElementalProperties/g;
          fileContent = fileContent.replace(castingRegex, (match, varName) => {
            // Only replace if the variable isn't already typed as ElementalProperties
            if (!fileContent.includes(`${varName}: ElementalProperties`)) {
              occurrencesFixed++;
              return `{...${varName}} as ElementalProperties`;
            }
            return match;
          });
          
          // Fix 5: Fix function parameters without explicit type
          const functionParamRegex = /function\s+\w+\s*\(\s*(\w+)\s*\)\s*(?!:)/g;
          fileContent = fileContent.replace(functionParamRegex, (match, paramName) => {
            // Check if the function body uses Fire, water, earth, Air properties
            const functionBody = fileContent.substring(fileContent.indexOf(match) + match.length);
            const usesElementalProps = /\b(Fire|4228Waterimport { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get root directory
const rootDir = resolve(__dirname, '..', '..');

// Directories to check
const dirsToCheck = [
  'src/utils/elemental',
  'src/utils/elementalMappings',
  'src/utils/recommendation',
  'src/calculations/core'
];

// Function to recursively get all .ts files in a directory
function getTypeScriptFiles(dir) {
  const dirents = readdirSync(dir, { withFileTypes: true });
  const files = dirents.map((dirent) => {
    const res = join(dir, dirent.name);
    return dirent.isDirectory() ? getTypeScriptFiles(res) : res;
  });
  return Array.prototype.concat(...files).filter(file => file.endsWith('.ts'));
}

// Main function
function fixElementalPropertiesCompatibility(dryRun = false) {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Fixing ElementalProperties type compatibility issues...`);
  
  let totalFilesModified = 0;
  let totalOccurrencesFixed = 0;
  
  try {
    // Process each directory
    for (const dir of dirsToCheck) {
      const dirPath = resolve(rootDir, dir);
      console.log(`Scanning directory: ${dirPath}`);
      
      try {
        const files = getTypeScriptFiles(dirPath);
        
        for (const file of files) {
          let fileContent = readFileSync(file, 'utf8');
          let originalContent = fileContent;
          let occurrencesFixed = 0;
          
          // Fix 1: Replace ElementalProperties without import with imported type
          if (!fileContent.includes('import') || !fileContent.includes('ElementalProperties')) {
            const importRegex = /^(import.+from.+)$/m;
            if (importRegex.test(fileContent) && !fileContent.includes('ElementalProperties')) {
              fileContent = fileContent.replace(
                importRegex,
                `$1\nimport type { ElementalProperties } from '@/types/alchemy';`
              );
              occurrencesFixed++;
            } else if (!importRegex.test(fileContent)) {
              fileContent = `import type { ElementalProperties } from '@/types/alchemy';\n\n${fileContent}`;
              occurrencesFixed++;
            }
          }
          
          // Fix 2: Fix type assertions for ElementalProperties
          const elementalPropsAssertionRegex = /as\s+{\s*(Fire|water|earth|Air)[^}]*}/g;
          fileContent = fileContent.replace(elementalPropsAssertionRegex, 'as ElementalProperties');
          
          // Count occurrences fixed
          const assertionsFixed = (originalContent.match(elementalPropsAssertionRegex) || []).length;
          occurrencesFixed += assertionsFixed;
          
          // Fix 3: Fix inline ElementalProperties type definitions
          const inlineElementalPropsRegex = /interface\s+ElementalProperties\s*{[^}]*}/g;
          fileContent = fileContent.replace(inlineElementalPropsRegex, (match) => {
            occurrencesFixed++;
            return '// Using imported ElementalProperties type';
          });
          
          // Fix 4: Fix type casting for non-ElementalProperties objects
          const castingRegex = /([\w.]+)\s+as\s+ElementalProperties/g;
          fileContent = fileContent.replace(castingRegex, (match, varName) => {
            // Only replace if the variable isn't already typed as ElementalProperties
            if (!fileContent.includes(`${varName}: ElementalProperties`)) {
              occurrencesFixed++;
              return `{...${varName}} as ElementalProperties`;
            }
            return match;
          });
          
          // Fix 5: Fix function parameters without explicit type
          const functionParamRegex = /function\s+\w+\s*\(\s*(\w+)\s*\)\s*(?!:)/g;
          fileContent = fileContent.replace(functionParamRegex, (match, paramName) => {
            // Check if the function body uses Fire, water, earth, Air properties
            const functionBody = fileContent.substring(fileContent.indexOf(match) + match.length);
            const usesElementalProps = /\b(Fire|water|earth|Air)\b/.test(functionBody.substring(0, functionBody.indexOf('}')));
            
            if (usesElementalProps) {
              occurrencesFixed++;
              return match.replace(`(${paramName})`, `(${paramName}: ElementalProperties)`);
            }
            return match;
          });
          
          if (originalContent !== fileContent) {
            totalFilesModified++;
            totalOccurrencesFixed += occurrencesFixed;
            
            console.log(`\nModified file: ${file}`);
            console.log(`Fixed ${occurrencesFixed} occurrences`);
            
            if (!dryRun) {
              writeFileSync(file, fileContent, 'utf8');
            }
          }
        }
      } catch (err) {
        console.error(`Error processing directory ${dir}:`, err);
      }
    }
    
    console.log(`\n${dryRun ? '[DRY RUN] Would have modified' : 'Modified'} ${totalFilesModified} files with ${totalOccurrencesFixed} fixes`);
    
  } catch (error) {
    console.error('❌ Error fixing ElementalProperties type compatibility:', error);
    process.exit(1);
  }
}

// Command line arguments handling
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// Run the function
fixElementalPropertiesCompatibility(dryRun); |earth|Air)\b/.test(functionBody.substring(0, functionBody.indexOf('}')));
            
            if (usesElementalProps) {
              occurrencesFixed++;
              return match.replace(`(${paramName})`, `(${paramName}: ElementalProperties)`);
            }
            return match;
          });
          
          if (originalContent !== fileContent) {
            totalFilesModified++;
            totalOccurrencesFixed += occurrencesFixed;
            
            console.log(`\nModified file: ${file}`);
            console.log(`Fixed ${occurrencesFixed} occurrences`);
            
            if (!dryRun) {
              writeFileSync(file, fileContent, 'utf8');
            }
          }
        }
      } catch (err) {
        console.error(`Error processing directory ${dir}:`, err);
      }
    }
    
    console.log(`\n${dryRun ? '[DRY RUN] Would have modified' : 'Modified'} ${totalFilesModified} files with ${totalOccurrencesFixed} fixes`);
    
  } catch (error) {
    console.error('❌ Error fixing ElementalProperties type compatibility:', error);
    process.exit(1);
  }
}

// Command line arguments handling
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// Run the function
fixElementalPropertiesCompatibility(dryRun); |Air)[^}]*}/g;
          fileContent = fileContent.replace(elementalPropsAssertionRegex, 'as ElementalProperties');
          
          // Count occurrences fixed
          const assertionsFixed = (originalContent.match(elementalPropsAssertionRegex) || []).length;
          occurrencesFixed += assertionsFixed;
          
          // Fix 3: Fix inline ElementalProperties type definitions
          const inlineElementalPropsRegex = /interface\s+ElementalProperties\s*{[^}]*}/g;
          fileContent = fileContent.replace(inlineElementalPropsRegex, (match) => {
            occurrencesFixed++;
            return '// Using imported ElementalProperties type';
          });
          
          // Fix 4: Fix type casting for non-ElementalProperties objects
          const castingRegex = /([\w.]+)\s+as\s+ElementalProperties/g;
          fileContent = fileContent.replace(castingRegex, (match, varName) => {
            // Only replace if the variable isn't already typed as ElementalProperties
            if (!fileContent.includes(`${varName}: ElementalProperties`)) {
              occurrencesFixed++;
              return `{...${varName}} as ElementalProperties`;
            }
            return match;
          });
          
          // Fix 5: Fix function parameters without explicit type
          const functionParamRegex = /function\s+\w+\s*\(\s*(\w+)\s*\)\s*(?!:)/g;
          fileContent = fileContent.replace(functionParamRegex, (match, paramName) => {
            // Check if the function body uses Fire, water, earth, Air properties
            const functionBody = fileContent.substring(fileContent.indexOf(match) + match.length);
            const usesElementalProps = /\b(Fire|4228Waterimport { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get root directory
const rootDir = resolve(__dirname, '..', '..');

// Directories to check
const dirsToCheck = [
  'src/utils/elemental',
  'src/utils/elementalMappings',
  'src/utils/recommendation',
  'src/calculations/core'
];

// Function to recursively get all .ts files in a directory
function getTypeScriptFiles(dir) {
  const dirents = readdirSync(dir, { withFileTypes: true });
  const files = dirents.map((dirent) => {
    const res = join(dir, dirent.name);
    return dirent.isDirectory() ? getTypeScriptFiles(res) : res;
  });
  return Array.prototype.concat(...files).filter(file => file.endsWith('.ts'));
}

// Main function
function fixElementalPropertiesCompatibility(dryRun = false) {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Fixing ElementalProperties type compatibility issues...`);
  
  let totalFilesModified = 0;
  let totalOccurrencesFixed = 0;
  
  try {
    // Process each directory
    for (const dir of dirsToCheck) {
      const dirPath = resolve(rootDir, dir);
      console.log(`Scanning directory: ${dirPath}`);
      
      try {
        const files = getTypeScriptFiles(dirPath);
        
        for (const file of files) {
          let fileContent = readFileSync(file, 'utf8');
          let originalContent = fileContent;
          let occurrencesFixed = 0;
          
          // Fix 1: Replace ElementalProperties without import with imported type
          if (!fileContent.includes('import') || !fileContent.includes('ElementalProperties')) {
            const importRegex = /^(import.+from.+)$/m;
            if (importRegex.test(fileContent) && !fileContent.includes('ElementalProperties')) {
              fileContent = fileContent.replace(
                importRegex,
                `$1\nimport type { ElementalProperties } from '@/types/alchemy';`
              );
              occurrencesFixed++;
            } else if (!importRegex.test(fileContent)) {
              fileContent = `import type { ElementalProperties } from '@/types/alchemy';\n\n${fileContent}`;
              occurrencesFixed++;
            }
          }
          
          // Fix 2: Fix type assertions for ElementalProperties
          const elementalPropsAssertionRegex = /as\s+{\s*(Fire|water|12282Earthimport { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get root directory
const rootDir = resolve(__dirname, '..', '..');

// Directories to check
const dirsToCheck = [
  'src/utils/elemental',
  'src/utils/elementalMappings',
  'src/utils/recommendation',
  'src/calculations/core'
];

// Function to recursively get all .ts files in a directory
function getTypeScriptFiles(dir) {
  const dirents = readdirSync(dir, { withFileTypes: true });
  const files = dirents.map((dirent) => {
    const res = join(dir, dirent.name);
    return dirent.isDirectory() ? getTypeScriptFiles(res) : res;
  });
  return Array.prototype.concat(...files).filter(file => file.endsWith('.ts'));
}

// Main function
function fixElementalPropertiesCompatibility(dryRun = false) {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Fixing ElementalProperties type compatibility issues...`);
  
  let totalFilesModified = 0;
  let totalOccurrencesFixed = 0;
  
  try {
    // Process each directory
    for (const dir of dirsToCheck) {
      const dirPath = resolve(rootDir, dir);
      console.log(`Scanning directory: ${dirPath}`);
      
      try {
        const files = getTypeScriptFiles(dirPath);
        
        for (const file of files) {
          let fileContent = readFileSync(file, 'utf8');
          let originalContent = fileContent;
          let occurrencesFixed = 0;
          
          // Fix 1: Replace ElementalProperties without import with imported type
          if (!fileContent.includes('import') || !fileContent.includes('ElementalProperties')) {
            const importRegex = /^(import.+from.+)$/m;
            if (importRegex.test(fileContent) && !fileContent.includes('ElementalProperties')) {
              fileContent = fileContent.replace(
                importRegex,
                `$1\nimport type { ElementalProperties } from '@/types/alchemy';`
              );
              occurrencesFixed++;
            } else if (!importRegex.test(fileContent)) {
              fileContent = `import type { ElementalProperties } from '@/types/alchemy';\n\n${fileContent}`;
              occurrencesFixed++;
            }
          }
          
          // Fix 2: Fix type assertions for ElementalProperties
          const elementalPropsAssertionRegex = /as\s+{\s*(Fire|2515Waterimport { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get root directory
const rootDir = resolve(__dirname, '..', '..');

// Directories to check
const dirsToCheck = [
  'src/utils/elemental',
  'src/utils/elementalMappings',
  'src/utils/recommendation',
  'src/calculations/core'
];

// Function to recursively get all .ts files in a directory
function getTypeScriptFiles(dir) {
  const dirents = readdirSync(dir, { withFileTypes: true });
  const files = dirents.map((dirent) => {
    const res = join(dir, dirent.name);
    return dirent.isDirectory() ? getTypeScriptFiles(res) : res;
  });
  return Array.prototype.concat(...files).filter(file => file.endsWith('.ts'));
}

// Main function
function fixElementalPropertiesCompatibility(dryRun = false) {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Fixing ElementalProperties type compatibility issues...`);
  
  let totalFilesModified = 0;
  let totalOccurrencesFixed = 0;
  
  try {
    // Process each directory
    for (const dir of dirsToCheck) {
      const dirPath = resolve(rootDir, dir);
      console.log(`Scanning directory: ${dirPath}`);
      
      try {
        const files = getTypeScriptFiles(dirPath);
        
        for (const file of files) {
          let fileContent = readFileSync(file, 'utf8');
          let originalContent = fileContent;
          let occurrencesFixed = 0;
          
          // Fix 1: Replace ElementalProperties without import with imported type
          if (!fileContent.includes('import') || !fileContent.includes('ElementalProperties')) {
            const importRegex = /^(import.+from.+)$/m;
            if (importRegex.test(fileContent) && !fileContent.includes('ElementalProperties')) {
              fileContent = fileContent.replace(
                importRegex,
                `$1\nimport type { ElementalProperties } from '@/types/alchemy';`
              );
              occurrencesFixed++;
            } else if (!importRegex.test(fileContent)) {
              fileContent = `import type { ElementalProperties } from '@/types/alchemy';\n\n${fileContent}`;
              occurrencesFixed++;
            }
          }
          
          // Fix 2: Fix type assertions for ElementalProperties
          const elementalPropsAssertionRegex = /as\s+{\s*(Fire|water|earth|Air)[^}]*}/g;
          fileContent = fileContent.replace(elementalPropsAssertionRegex, 'as ElementalProperties');
          
          // Count occurrences fixed
          const assertionsFixed = (originalContent.match(elementalPropsAssertionRegex) || []).length;
          occurrencesFixed += assertionsFixed;
          
          // Fix 3: Fix inline ElementalProperties type definitions
          const inlineElementalPropsRegex = /interface\s+ElementalProperties\s*{[^}]*}/g;
          fileContent = fileContent.replace(inlineElementalPropsRegex, (match) => {
            occurrencesFixed++;
            return '// Using imported ElementalProperties type';
          });
          
          // Fix 4: Fix type casting for non-ElementalProperties objects
          const castingRegex = /([\w.]+)\s+as\s+ElementalProperties/g;
          fileContent = fileContent.replace(castingRegex, (match, varName) => {
            // Only replace if the variable isn't already typed as ElementalProperties
            if (!fileContent.includes(`${varName}: ElementalProperties`)) {
              occurrencesFixed++;
              return `{...${varName}} as ElementalProperties`;
            }
            return match;
          });
          
          // Fix 5: Fix function parameters without explicit type
          const functionParamRegex = /function\s+\w+\s*\(\s*(\w+)\s*\)\s*(?!:)/g;
          fileContent = fileContent.replace(functionParamRegex, (match, paramName) => {
            // Check if the function body uses Fire, water, earth, Air properties
            const functionBody = fileContent.substring(fileContent.indexOf(match) + match.length);
            const usesElementalProps = /\b(Fire|water|earth|Air)\b/.test(functionBody.substring(0, functionBody.indexOf('}')));
            
            if (usesElementalProps) {
              occurrencesFixed++;
              return match.replace(`(${paramName})`, `(${paramName}: ElementalProperties)`);
            }
            return match;
          });
          
          if (originalContent !== fileContent) {
            totalFilesModified++;
            totalOccurrencesFixed += occurrencesFixed;
            
            console.log(`\nModified file: ${file}`);
            console.log(`Fixed ${occurrencesFixed} occurrences`);
            
            if (!dryRun) {
              writeFileSync(file, fileContent, 'utf8');
            }
          }
        }
      } catch (err) {
        console.error(`Error processing directory ${dir}:`, err);
      }
    }
    
    console.log(`\n${dryRun ? '[DRY RUN] Would have modified' : 'Modified'} ${totalFilesModified} files with ${totalOccurrencesFixed} fixes`);
    
  } catch (error) {
    console.error('❌ Error fixing ElementalProperties type compatibility:', error);
    process.exit(1);
  }
}

// Command line arguments handling
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// Run the function
fixElementalPropertiesCompatibility(dryRun); |earth|Air)[^}]*}/g;
          fileContent = fileContent.replace(elementalPropsAssertionRegex, 'as ElementalProperties');
          
          // Count occurrences fixed
          const assertionsFixed = (originalContent.match(elementalPropsAssertionRegex) || []).length;
          occurrencesFixed += assertionsFixed;
          
          // Fix 3: Fix inline ElementalProperties type definitions
          const inlineElementalPropsRegex = /interface\s+ElementalProperties\s*{[^}]*}/g;
          fileContent = fileContent.replace(inlineElementalPropsRegex, (match) => {
            occurrencesFixed++;
            return '// Using imported ElementalProperties type';
          });
          
          // Fix 4: Fix type casting for non-ElementalProperties objects
          const castingRegex = /([\w.]+)\s+as\s+ElementalProperties/g;
          fileContent = fileContent.replace(castingRegex, (match, varName) => {
            // Only replace if the variable isn't already typed as ElementalProperties
            if (!fileContent.includes(`${varName}: ElementalProperties`)) {
              occurrencesFixed++;
              return `{...${varName}} as ElementalProperties`;
            }
            return match;
          });
          
          // Fix 5: Fix function parameters without explicit type
          const functionParamRegex = /function\s+\w+\s*\(\s*(\w+)\s*\)\s*(?!:)/g;
          fileContent = fileContent.replace(functionParamRegex, (match, paramName) => {
            // Check if the function body uses Fire, water, earth, Air properties
            const functionBody = fileContent.substring(fileContent.indexOf(match) + match.length);
            const usesElementalProps = /\b(Fire|4228Waterimport { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get root directory
const rootDir = resolve(__dirname, '..', '..');

// Directories to check
const dirsToCheck = [
  'src/utils/elemental',
  'src/utils/elementalMappings',
  'src/utils/recommendation',
  'src/calculations/core'
];

// Function to recursively get all .ts files in a directory
function getTypeScriptFiles(dir) {
  const dirents = readdirSync(dir, { withFileTypes: true });
  const files = dirents.map((dirent) => {
    const res = join(dir, dirent.name);
    return dirent.isDirectory() ? getTypeScriptFiles(res) : res;
  });
  return Array.prototype.concat(...files).filter(file => file.endsWith('.ts'));
}

// Main function
function fixElementalPropertiesCompatibility(dryRun = false) {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Fixing ElementalProperties type compatibility issues...`);
  
  let totalFilesModified = 0;
  let totalOccurrencesFixed = 0;
  
  try {
    // Process each directory
    for (const dir of dirsToCheck) {
      const dirPath = resolve(rootDir, dir);
      console.log(`Scanning directory: ${dirPath}`);
      
      try {
        const files = getTypeScriptFiles(dirPath);
        
        for (const file of files) {
          let fileContent = readFileSync(file, 'utf8');
          let originalContent = fileContent;
          let occurrencesFixed = 0;
          
          // Fix 1: Replace ElementalProperties without import with imported type
          if (!fileContent.includes('import') || !fileContent.includes('ElementalProperties')) {
            const importRegex = /^(import.+from.+)$/m;
            if (importRegex.test(fileContent) && !fileContent.includes('ElementalProperties')) {
              fileContent = fileContent.replace(
                importRegex,
                `$1\nimport type { ElementalProperties } from '@/types/alchemy';`
              );
              occurrencesFixed++;
            } else if (!importRegex.test(fileContent)) {
              fileContent = `import type { ElementalProperties } from '@/types/alchemy';\n\n${fileContent}`;
              occurrencesFixed++;
            }
          }
          
          // Fix 2: Fix type assertions for ElementalProperties
          const elementalPropsAssertionRegex = /as\s+{\s*(Fire|water|earth|Air)[^}]*}/g;
          fileContent = fileContent.replace(elementalPropsAssertionRegex, 'as ElementalProperties');
          
          // Count occurrences fixed
          const assertionsFixed = (originalContent.match(elementalPropsAssertionRegex) || []).length;
          occurrencesFixed += assertionsFixed;
          
          // Fix 3: Fix inline ElementalProperties type definitions
          const inlineElementalPropsRegex = /interface\s+ElementalProperties\s*{[^}]*}/g;
          fileContent = fileContent.replace(inlineElementalPropsRegex, (match) => {
            occurrencesFixed++;
            return '// Using imported ElementalProperties type';
          });
          
          // Fix 4: Fix type casting for non-ElementalProperties objects
          const castingRegex = /([\w.]+)\s+as\s+ElementalProperties/g;
          fileContent = fileContent.replace(castingRegex, (match, varName) => {
            // Only replace if the variable isn't already typed as ElementalProperties
            if (!fileContent.includes(`${varName}: ElementalProperties`)) {
              occurrencesFixed++;
              return `{...${varName}} as ElementalProperties`;
            }
            return match;
          });
          
          // Fix 5: Fix function parameters without explicit type
          const functionParamRegex = /function\s+\w+\s*\(\s*(\w+)\s*\)\s*(?!:)/g;
          fileContent = fileContent.replace(functionParamRegex, (match, paramName) => {
            // Check if the function body uses Fire, water, earth, Air properties
            const functionBody = fileContent.substring(fileContent.indexOf(match) + match.length);
            const usesElementalProps = /\b(Fire|water|earth|Air)\b/.test(functionBody.substring(0, functionBody.indexOf('}')));
            
            if (usesElementalProps) {
              occurrencesFixed++;
              return match.replace(`(${paramName})`, `(${paramName}: ElementalProperties)`);
            }
            return match;
          });
          
          if (originalContent !== fileContent) {
            totalFilesModified++;
            totalOccurrencesFixed += occurrencesFixed;
            
            console.log(`\nModified file: ${file}`);
            console.log(`Fixed ${occurrencesFixed} occurrences`);
            
            if (!dryRun) {
              writeFileSync(file, fileContent, 'utf8');
            }
          }
        }
      } catch (err) {
        console.error(`Error processing directory ${dir}:`, err);
      }
    }
    
    console.log(`\n${dryRun ? '[DRY RUN] Would have modified' : 'Modified'} ${totalFilesModified} files with ${totalOccurrencesFixed} fixes`);
    
  } catch (error) {
    console.error('❌ Error fixing ElementalProperties type compatibility:', error);
    process.exit(1);
  }
}

// Command line arguments handling
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// Run the function
fixElementalPropertiesCompatibility(dryRun); |earth|Air)\b/.test(functionBody.substring(0, functionBody.indexOf('}')));
            
            if (usesElementalProps) {
              occurrencesFixed++;
              return match.replace(`(${paramName})`, `(${paramName}: ElementalProperties)`);
            }
            return match;
          });
          
          if (originalContent !== fileContent) {
            totalFilesModified++;
            totalOccurrencesFixed += occurrencesFixed;
            
            console.log(`\nModified file: ${file}`);
            console.log(`Fixed ${occurrencesFixed} occurrences`);
            
            if (!dryRun) {
              writeFileSync(file, fileContent, 'utf8');
            }
          }
        }
      } catch (err) {
        console.error(`Error processing directory ${dir}:`, err);
      }
    }
    
    console.log(`\n${dryRun ? '[DRY RUN] Would have modified' : 'Modified'} ${totalFilesModified} files with ${totalOccurrencesFixed} fixes`);
    
  } catch (error) {
    console.error('❌ Error fixing ElementalProperties type compatibility:', error);
    process.exit(1);
  }
}

// Command line arguments handling
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// Run the function
fixElementalPropertiesCompatibility(dryRun); |Air)[^}]*}/g;
          fileContent = fileContent.replace(elementalPropsAssertionRegex, 'as ElementalProperties');
          
          // Count occurrences fixed
          const assertionsFixed = (originalContent.match(elementalPropsAssertionRegex) || []).length;
          occurrencesFixed += assertionsFixed;
          
          // Fix 3: Fix inline ElementalProperties type definitions
          const inlineElementalPropsRegex = /interface\s+ElementalProperties\s*{[^}]*}/g;
          fileContent = fileContent.replace(inlineElementalPropsRegex, (match) => {
            occurrencesFixed++;
            return '// Using imported ElementalProperties type';
          });
          
          // Fix 4: Fix type casting for non-ElementalProperties objects
          const castingRegex = /([\w.]+)\s+as\s+ElementalProperties/g;
          fileContent = fileContent.replace(castingRegex, (match, varName) => {
            // Only replace if the variable isn't already typed as ElementalProperties
            if (!fileContent.includes(`${varName}: ElementalProperties`)) {
              occurrencesFixed++;
              return `{...${varName}} as ElementalProperties`;
            }
            return match;
          });
          
          // Fix 5: Fix function parameters without explicit type
          const functionParamRegex = /function\s+\w+\s*\(\s*(\w+)\s*\)\s*(?!:)/g;
          fileContent = fileContent.replace(functionParamRegex, (match, paramName) => {
            // Check if the function body uses Fire, water, earth, Air properties
            const functionBody = fileContent.substring(fileContent.indexOf(match) + match.length);
            const usesElementalProps = /\b(Fire|water|13995Earthimport { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get root directory
const rootDir = resolve(__dirname, '..', '..');

// Directories to check
const dirsToCheck = [
  'src/utils/elemental',
  'src/utils/elementalMappings',
  'src/utils/recommendation',
  'src/calculations/core'
];

// Function to recursively get all .ts files in a directory
function getTypeScriptFiles(dir) {
  const dirents = readdirSync(dir, { withFileTypes: true });
  const files = dirents.map((dirent) => {
    const res = join(dir, dirent.name);
    return dirent.isDirectory() ? getTypeScriptFiles(res) : res;
  });
  return Array.prototype.concat(...files).filter(file => file.endsWith('.ts'));
}

// Main function
function fixElementalPropertiesCompatibility(dryRun = false) {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Fixing ElementalProperties type compatibility issues...`);
  
  let totalFilesModified = 0;
  let totalOccurrencesFixed = 0;
  
  try {
    // Process each directory
    for (const dir of dirsToCheck) {
      const dirPath = resolve(rootDir, dir);
      console.log(`Scanning directory: ${dirPath}`);
      
      try {
        const files = getTypeScriptFiles(dirPath);
        
        for (const file of files) {
          let fileContent = readFileSync(file, 'utf8');
          let originalContent = fileContent;
          let occurrencesFixed = 0;
          
          // Fix 1: Replace ElementalProperties without import with imported type
          if (!fileContent.includes('import') || !fileContent.includes('ElementalProperties')) {
            const importRegex = /^(import.+from.+)$/m;
            if (importRegex.test(fileContent) && !fileContent.includes('ElementalProperties')) {
              fileContent = fileContent.replace(
                importRegex,
                `$1\nimport type { ElementalProperties } from '@/types/alchemy';`
              );
              occurrencesFixed++;
            } else if (!importRegex.test(fileContent)) {
              fileContent = `import type { ElementalProperties } from '@/types/alchemy';\n\n${fileContent}`;
              occurrencesFixed++;
            }
          }
          
          // Fix 2: Fix type assertions for ElementalProperties
          const elementalPropsAssertionRegex = /as\s+{\s*(Fire|2515Waterimport { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get root directory
const rootDir = resolve(__dirname, '..', '..');

// Directories to check
const dirsToCheck = [
  'src/utils/elemental',
  'src/utils/elementalMappings',
  'src/utils/recommendation',
  'src/calculations/core'
];

// Function to recursively get all .ts files in a directory
function getTypeScriptFiles(dir) {
  const dirents = readdirSync(dir, { withFileTypes: true });
  const files = dirents.map((dirent) => {
    const res = join(dir, dirent.name);
    return dirent.isDirectory() ? getTypeScriptFiles(res) : res;
  });
  return Array.prototype.concat(...files).filter(file => file.endsWith('.ts'));
}

// Main function
function fixElementalPropertiesCompatibility(dryRun = false) {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Fixing ElementalProperties type compatibility issues...`);
  
  let totalFilesModified = 0;
  let totalOccurrencesFixed = 0;
  
  try {
    // Process each directory
    for (const dir of dirsToCheck) {
      const dirPath = resolve(rootDir, dir);
      console.log(`Scanning directory: ${dirPath}`);
      
      try {
        const files = getTypeScriptFiles(dirPath);
        
        for (const file of files) {
          let fileContent = readFileSync(file, 'utf8');
          let originalContent = fileContent;
          let occurrencesFixed = 0;
          
          // Fix 1: Replace ElementalProperties without import with imported type
          if (!fileContent.includes('import') || !fileContent.includes('ElementalProperties')) {
            const importRegex = /^(import.+from.+)$/m;
            if (importRegex.test(fileContent) && !fileContent.includes('ElementalProperties')) {
              fileContent = fileContent.replace(
                importRegex,
                `$1\nimport type { ElementalProperties } from '@/types/alchemy';`
              );
              occurrencesFixed++;
            } else if (!importRegex.test(fileContent)) {
              fileContent = `import type { ElementalProperties } from '@/types/alchemy';\n\n${fileContent}`;
              occurrencesFixed++;
            }
          }
          
          // Fix 2: Fix type assertions for ElementalProperties
          const elementalPropsAssertionRegex = /as\s+{\s*(Fire|water|earth|Air)[^}]*}/g;
          fileContent = fileContent.replace(elementalPropsAssertionRegex, 'as ElementalProperties');
          
          // Count occurrences fixed
          const assertionsFixed = (originalContent.match(elementalPropsAssertionRegex) || []).length;
          occurrencesFixed += assertionsFixed;
          
          // Fix 3: Fix inline ElementalProperties type definitions
          const inlineElementalPropsRegex = /interface\s+ElementalProperties\s*{[^}]*}/g;
          fileContent = fileContent.replace(inlineElementalPropsRegex, (match) => {
            occurrencesFixed++;
            return '// Using imported ElementalProperties type';
          });
          
          // Fix 4: Fix type casting for non-ElementalProperties objects
          const castingRegex = /([\w.]+)\s+as\s+ElementalProperties/g;
          fileContent = fileContent.replace(castingRegex, (match, varName) => {
            // Only replace if the variable isn't already typed as ElementalProperties
            if (!fileContent.includes(`${varName}: ElementalProperties`)) {
              occurrencesFixed++;
              return `{...${varName}} as ElementalProperties`;
            }
            return match;
          });
          
          // Fix 5: Fix function parameters without explicit type
          const functionParamRegex = /function\s+\w+\s*\(\s*(\w+)\s*\)\s*(?!:)/g;
          fileContent = fileContent.replace(functionParamRegex, (match, paramName) => {
            // Check if the function body uses Fire, water, earth, Air properties
            const functionBody = fileContent.substring(fileContent.indexOf(match) + match.length);
            const usesElementalProps = /\b(Fire|water|earth|Air)\b/.test(functionBody.substring(0, functionBody.indexOf('}')));
            
            if (usesElementalProps) {
              occurrencesFixed++;
              return match.replace(`(${paramName})`, `(${paramName}: ElementalProperties)`);
            }
            return match;
          });
          
          if (originalContent !== fileContent) {
            totalFilesModified++;
            totalOccurrencesFixed += occurrencesFixed;
            
            console.log(`\nModified file: ${file}`);
            console.log(`Fixed ${occurrencesFixed} occurrences`);
            
            if (!dryRun) {
              writeFileSync(file, fileContent, 'utf8');
            }
          }
        }
      } catch (err) {
        console.error(`Error processing directory ${dir}:`, err);
      }
    }
    
    console.log(`\n${dryRun ? '[DRY RUN] Would have modified' : 'Modified'} ${totalFilesModified} files with ${totalOccurrencesFixed} fixes`);
    
  } catch (error) {
    console.error('❌ Error fixing ElementalProperties type compatibility:', error);
    process.exit(1);
  }
}

// Command line arguments handling
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// Run the function
fixElementalPropertiesCompatibility(dryRun); |earth|Air)[^}]*}/g;
          fileContent = fileContent.replace(elementalPropsAssertionRegex, 'as ElementalProperties');
          
          // Count occurrences fixed
          const assertionsFixed = (originalContent.match(elementalPropsAssertionRegex) || []).length;
          occurrencesFixed += assertionsFixed;
          
          // Fix 3: Fix inline ElementalProperties type definitions
          const inlineElementalPropsRegex = /interface\s+ElementalProperties\s*{[^}]*}/g;
          fileContent = fileContent.replace(inlineElementalPropsRegex, (match) => {
            occurrencesFixed++;
            return '// Using imported ElementalProperties type';
          });
          
          // Fix 4: Fix type casting for non-ElementalProperties objects
          const castingRegex = /([\w.]+)\s+as\s+ElementalProperties/g;
          fileContent = fileContent.replace(castingRegex, (match, varName) => {
            // Only replace if the variable isn't already typed as ElementalProperties
            if (!fileContent.includes(`${varName}: ElementalProperties`)) {
              occurrencesFixed++;
              return `{...${varName}} as ElementalProperties`;
            }
            return match;
          });
          
          // Fix 5: Fix function parameters without explicit type
          const functionParamRegex = /function\s+\w+\s*\(\s*(\w+)\s*\)\s*(?!:)/g;
          fileContent = fileContent.replace(functionParamRegex, (match, paramName) => {
            // Check if the function body uses Fire, water, earth, Air properties
            const functionBody = fileContent.substring(fileContent.indexOf(match) + match.length);
            const usesElementalProps = /\b(Fire|4228Waterimport { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get root directory
const rootDir = resolve(__dirname, '..', '..');

// Directories to check
const dirsToCheck = [
  'src/utils/elemental',
  'src/utils/elementalMappings',
  'src/utils/recommendation',
  'src/calculations/core'
];

// Function to recursively get all .ts files in a directory
function getTypeScriptFiles(dir) {
  const dirents = readdirSync(dir, { withFileTypes: true });
  const files = dirents.map((dirent) => {
    const res = join(dir, dirent.name);
    return dirent.isDirectory() ? getTypeScriptFiles(res) : res;
  });
  return Array.prototype.concat(...files).filter(file => file.endsWith('.ts'));
}

// Main function
function fixElementalPropertiesCompatibility(dryRun = false) {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Fixing ElementalProperties type compatibility issues...`);
  
  let totalFilesModified = 0;
  let totalOccurrencesFixed = 0;
  
  try {
    // Process each directory
    for (const dir of dirsToCheck) {
      const dirPath = resolve(rootDir, dir);
      console.log(`Scanning directory: ${dirPath}`);
      
      try {
        const files = getTypeScriptFiles(dirPath);
        
        for (const file of files) {
          let fileContent = readFileSync(file, 'utf8');
          let originalContent = fileContent;
          let occurrencesFixed = 0;
          
          // Fix 1: Replace ElementalProperties without import with imported type
          if (!fileContent.includes('import') || !fileContent.includes('ElementalProperties')) {
            const importRegex = /^(import.+from.+)$/m;
            if (importRegex.test(fileContent) && !fileContent.includes('ElementalProperties')) {
              fileContent = fileContent.replace(
                importRegex,
                `$1\nimport type { ElementalProperties } from '@/types/alchemy';`
              );
              occurrencesFixed++;
            } else if (!importRegex.test(fileContent)) {
              fileContent = `import type { ElementalProperties } from '@/types/alchemy';\n\n${fileContent}`;
              occurrencesFixed++;
            }
          }
          
          // Fix 2: Fix type assertions for ElementalProperties
          const elementalPropsAssertionRegex = /as\s+{\s*(Fire|water|earth|Air)[^}]*}/g;
          fileContent = fileContent.replace(elementalPropsAssertionRegex, 'as ElementalProperties');
          
          // Count occurrences fixed
          const assertionsFixed = (originalContent.match(elementalPropsAssertionRegex) || []).length;
          occurrencesFixed += assertionsFixed;
          
          // Fix 3: Fix inline ElementalProperties type definitions
          const inlineElementalPropsRegex = /interface\s+ElementalProperties\s*{[^}]*}/g;
          fileContent = fileContent.replace(inlineElementalPropsRegex, (match) => {
            occurrencesFixed++;
            return '// Using imported ElementalProperties type';
          });
          
          // Fix 4: Fix type casting for non-ElementalProperties objects
          const castingRegex = /([\w.]+)\s+as\s+ElementalProperties/g;
          fileContent = fileContent.replace(castingRegex, (match, varName) => {
            // Only replace if the variable isn't already typed as ElementalProperties
            if (!fileContent.includes(`${varName}: ElementalProperties`)) {
              occurrencesFixed++;
              return `{...${varName}} as ElementalProperties`;
            }
            return match;
          });
          
          // Fix 5: Fix function parameters without explicit type
          const functionParamRegex = /function\s+\w+\s*\(\s*(\w+)\s*\)\s*(?!:)/g;
          fileContent = fileContent.replace(functionParamRegex, (match, paramName) => {
            // Check if the function body uses Fire, water, earth, Air properties
            const functionBody = fileContent.substring(fileContent.indexOf(match) + match.length);
            const usesElementalProps = /\b(Fire|water|earth|Air)\b/.test(functionBody.substring(0, functionBody.indexOf('}')));
            
            if (usesElementalProps) {
              occurrencesFixed++;
              return match.replace(`(${paramName})`, `(${paramName}: ElementalProperties)`);
            }
            return match;
          });
          
          if (originalContent !== fileContent) {
            totalFilesModified++;
            totalOccurrencesFixed += occurrencesFixed;
            
            console.log(`\nModified file: ${file}`);
            console.log(`Fixed ${occurrencesFixed} occurrences`);
            
            if (!dryRun) {
              writeFileSync(file, fileContent, 'utf8');
            }
          }
        }
      } catch (err) {
        console.error(`Error processing directory ${dir}:`, err);
      }
    }
    
    console.log(`\n${dryRun ? '[DRY RUN] Would have modified' : 'Modified'} ${totalFilesModified} files with ${totalOccurrencesFixed} fixes`);
    
  } catch (error) {
    console.error('❌ Error fixing ElementalProperties type compatibility:', error);
    process.exit(1);
  }
}

// Command line arguments handling
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// Run the function
fixElementalPropertiesCompatibility(dryRun); |earth|Air)\b/.test(functionBody.substring(0, functionBody.indexOf('}')));
            
            if (usesElementalProps) {
              occurrencesFixed++;
              return match.replace(`(${paramName})`, `(${paramName}: ElementalProperties)`);
            }
            return match;
          });
          
          if (originalContent !== fileContent) {
            totalFilesModified++;
            totalOccurrencesFixed += occurrencesFixed;
            
            console.log(`\nModified file: ${file}`);
            console.log(`Fixed ${occurrencesFixed} occurrences`);
            
            if (!dryRun) {
              writeFileSync(file, fileContent, 'utf8');
            }
          }
        }
      } catch (err) {
        console.error(`Error processing directory ${dir}:`, err);
      }
    }
    
    console.log(`\n${dryRun ? '[DRY RUN] Would have modified' : 'Modified'} ${totalFilesModified} files with ${totalOccurrencesFixed} fixes`);
    
  } catch (error) {
    console.error('❌ Error fixing ElementalProperties type compatibility:', error);
    process.exit(1);
  }
}

// Command line arguments handling
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// Run the function
fixElementalPropertiesCompatibility(dryRun); |Air)\b/.test(functionBody.substring(0, functionBody.indexOf('}')));
            
            if (usesElementalProps) {
              occurrencesFixed++;
              return match.replace(`(${paramName})`, `(${paramName}: ElementalProperties)`);
            }
            return match;
          });
          
          if (originalContent !== fileContent) {
            totalFilesModified++;
            totalOccurrencesFixed += occurrencesFixed;
            
            console.log(`\nModified file: ${file}`);
            console.log(`Fixed ${occurrencesFixed} occurrences`);
            
            if (!dryRun) {
              writeFileSync(file, fileContent, 'utf8');
            }
          }
        }
      } catch (err) {
        console.error(`Error processing directory ${dir}:`, err);
      }
    }
    
    console.log(`\n${dryRun ? '[DRY RUN] Would have modified' : 'Modified'} ${totalFilesModified} files with ${totalOccurrencesFixed} fixes`);
    
  } catch (error) {
    console.error('❌ Error fixing ElementalProperties type compatibility:', error);
    process.exit(1);
  }
}

// Command line arguments handling
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// Run the function
fixElementalPropertiesCompatibility(dryRun); |15282Earthimport { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get root directory
const rootDir = resolve(__dirname, '..', '..');

// Directories to check
const dirsToCheck = [
  'src/utils/elemental',
  'src/utils/elementalMappings',
  'src/utils/recommendation',
  'src/calculations/core'
];

// Function to recursively get all .ts files in a directory
function getTypeScriptFiles(dir) {
  const dirents = readdirSync(dir, { withFileTypes: true });
  const files = dirents.map((dirent) => {
    const res = join(dir, dirent.name);
    return dirent.isDirectory() ? getTypeScriptFiles(res) : res;
  });
  return Array.prototype.concat(...files).filter(file => file.endsWith('.ts'));
}

// Main function
function fixElementalPropertiesCompatibility(dryRun = false) {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Fixing ElementalProperties type compatibility issues...`);
  
  let totalFilesModified = 0;
  let totalOccurrencesFixed = 0;
  
  try {
    // Process each directory
    for (const dir of dirsToCheck) {
      const dirPath = resolve(rootDir, dir);
      console.log(`Scanning directory: ${dirPath}`);
      
      try {
        const files = getTypeScriptFiles(dirPath);
        
        for (const file of files) {
          let fileContent = readFileSync(file, 'utf8');
          let originalContent = fileContent;
          let occurrencesFixed = 0;
          
          // Fix 1: Replace ElementalProperties without import with imported type
          if (!fileContent.includes('import') || !fileContent.includes('ElementalProperties')) {
            const importRegex = /^(import.+from.+)$/m;
            if (importRegex.test(fileContent) && !fileContent.includes('ElementalProperties')) {
              fileContent = fileContent.replace(
                importRegex,
                `$1\nimport type { ElementalProperties } from '@/types/alchemy';`
              );
              occurrencesFixed++;
            } else if (!importRegex.test(fileContent)) {
              fileContent = `import type { ElementalProperties } from '@/types/alchemy';\n\n${fileContent}`;
              occurrencesFixed++;
            }
          }
          
          // Fix 2: Fix type assertions for ElementalProperties
          const elementalPropsAssertionRegex = /as\s+{\s*(Fire|2515Waterimport { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get root directory
const rootDir = resolve(__dirname, '..', '..');

// Directories to check
const dirsToCheck = [
  'src/utils/elemental',
  'src/utils/elementalMappings',
  'src/utils/recommendation',
  'src/calculations/core'
];

// Function to recursively get all .ts files in a directory
function getTypeScriptFiles(dir) {
  const dirents = readdirSync(dir, { withFileTypes: true });
  const files = dirents.map((dirent) => {
    const res = join(dir, dirent.name);
    return dirent.isDirectory() ? getTypeScriptFiles(res) : res;
  });
  return Array.prototype.concat(...files).filter(file => file.endsWith('.ts'));
}

// Main function
function fixElementalPropertiesCompatibility(dryRun = false) {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Fixing ElementalProperties type compatibility issues...`);
  
  let totalFilesModified = 0;
  let totalOccurrencesFixed = 0;
  
  try {
    // Process each directory
    for (const dir of dirsToCheck) {
      const dirPath = resolve(rootDir, dir);
      console.log(`Scanning directory: ${dirPath}`);
      
      try {
        const files = getTypeScriptFiles(dirPath);
        
        for (const file of files) {
          let fileContent = readFileSync(file, 'utf8');
          let originalContent = fileContent;
          let occurrencesFixed = 0;
          
          // Fix 1: Replace ElementalProperties without import with imported type
          if (!fileContent.includes('import') || !fileContent.includes('ElementalProperties')) {
            const importRegex = /^(import.+from.+)$/m;
            if (importRegex.test(fileContent) && !fileContent.includes('ElementalProperties')) {
              fileContent = fileContent.replace(
                importRegex,
                `$1\nimport type { ElementalProperties } from '@/types/alchemy';`
              );
              occurrencesFixed++;
            } else if (!importRegex.test(fileContent)) {
              fileContent = `import type { ElementalProperties } from '@/types/alchemy';\n\n${fileContent}`;
              occurrencesFixed++;
            }
          }
          
          // Fix 2: Fix type assertions for ElementalProperties
          const elementalPropsAssertionRegex = /as\s+{\s*(Fire|water|earth|Air)[^}]*}/g;
          fileContent = fileContent.replace(elementalPropsAssertionRegex, 'as ElementalProperties');
          
          // Count occurrences fixed
          const assertionsFixed = (originalContent.match(elementalPropsAssertionRegex) || []).length;
          occurrencesFixed += assertionsFixed;
          
          // Fix 3: Fix inline ElementalProperties type definitions
          const inlineElementalPropsRegex = /interface\s+ElementalProperties\s*{[^}]*}/g;
          fileContent = fileContent.replace(inlineElementalPropsRegex, (match) => {
            occurrencesFixed++;
            return '// Using imported ElementalProperties type';
          });
          
          // Fix 4: Fix type casting for non-ElementalProperties objects
          const castingRegex = /([\w.]+)\s+as\s+ElementalProperties/g;
          fileContent = fileContent.replace(castingRegex, (match, varName) => {
            // Only replace if the variable isn't already typed as ElementalProperties
            if (!fileContent.includes(`${varName}: ElementalProperties`)) {
              occurrencesFixed++;
              return `{...${varName}} as ElementalProperties`;
            }
            return match;
          });
          
          // Fix 5: Fix function parameters without explicit type
          const functionParamRegex = /function\s+\w+\s*\(\s*(\w+)\s*\)\s*(?!:)/g;
          fileContent = fileContent.replace(functionParamRegex, (match, paramName) => {
            // Check if the function body uses Fire, water, earth, Air properties
            const functionBody = fileContent.substring(fileContent.indexOf(match) + match.length);
            const usesElementalProps = /\b(Fire|water|earth|Air)\b/.test(functionBody.substring(0, functionBody.indexOf('}')));
            
            if (usesElementalProps) {
              occurrencesFixed++;
              return match.replace(`(${paramName})`, `(${paramName}: ElementalProperties)`);
            }
            return match;
          });
          
          if (originalContent !== fileContent) {
            totalFilesModified++;
            totalOccurrencesFixed += occurrencesFixed;
            
            console.log(`\nModified file: ${file}`);
            console.log(`Fixed ${occurrencesFixed} occurrences`);
            
            if (!dryRun) {
              writeFileSync(file, fileContent, 'utf8');
            }
          }
        }
      } catch (err) {
        console.error(`Error processing directory ${dir}:`, err);
      }
    }
    
    console.log(`\n${dryRun ? '[DRY RUN] Would have modified' : 'Modified'} ${totalFilesModified} files with ${totalOccurrencesFixed} fixes`);
    
  } catch (error) {
    console.error('❌ Error fixing ElementalProperties type compatibility:', error);
    process.exit(1);
  }
}

// Command line arguments handling
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// Run the function
fixElementalPropertiesCompatibility(dryRun); |earth|Air)[^}]*}/g;
          fileContent = fileContent.replace(elementalPropsAssertionRegex, 'as ElementalProperties');
          
          // Count occurrences fixed
          const assertionsFixed = (originalContent.match(elementalPropsAssertionRegex) || []).length;
          occurrencesFixed += assertionsFixed;
          
          // Fix 3: Fix inline ElementalProperties type definitions
          const inlineElementalPropsRegex = /interface\s+ElementalProperties\s*{[^}]*}/g;
          fileContent = fileContent.replace(inlineElementalPropsRegex, (match) => {
            occurrencesFixed++;
            return '// Using imported ElementalProperties type';
          });
          
          // Fix 4: Fix type casting for non-ElementalProperties objects
          const castingRegex = /([\w.]+)\s+as\s+ElementalProperties/g;
          fileContent = fileContent.replace(castingRegex, (match, varName) => {
            // Only replace if the variable isn't already typed as ElementalProperties
            if (!fileContent.includes(`${varName}: ElementalProperties`)) {
              occurrencesFixed++;
              return `{...${varName}} as ElementalProperties`;
            }
            return match;
          });
          
          // Fix 5: Fix function parameters without explicit type
          const functionParamRegex = /function\s+\w+\s*\(\s*(\w+)\s*\)\s*(?!:)/g;
          fileContent = fileContent.replace(functionParamRegex, (match, paramName) => {
            // Check if the function body uses Fire, water, earth, Air properties
            const functionBody = fileContent.substring(fileContent.indexOf(match) + match.length);
            const usesElementalProps = /\b(Fire|4228Waterimport { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get root directory
const rootDir = resolve(__dirname, '..', '..');

// Directories to check
const dirsToCheck = [
  'src/utils/elemental',
  'src/utils/elementalMappings',
  'src/utils/recommendation',
  'src/calculations/core'
];

// Function to recursively get all .ts files in a directory
function getTypeScriptFiles(dir) {
  const dirents = readdirSync(dir, { withFileTypes: true });
  const files = dirents.map((dirent) => {
    const res = join(dir, dirent.name);
    return dirent.isDirectory() ? getTypeScriptFiles(res) : res;
  });
  return Array.prototype.concat(...files).filter(file => file.endsWith('.ts'));
}

// Main function
function fixElementalPropertiesCompatibility(dryRun = false) {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Fixing ElementalProperties type compatibility issues...`);
  
  let totalFilesModified = 0;
  let totalOccurrencesFixed = 0;
  
  try {
    // Process each directory
    for (const dir of dirsToCheck) {
      const dirPath = resolve(rootDir, dir);
      console.log(`Scanning directory: ${dirPath}`);
      
      try {
        const files = getTypeScriptFiles(dirPath);
        
        for (const file of files) {
          let fileContent = readFileSync(file, 'utf8');
          let originalContent = fileContent;
          let occurrencesFixed = 0;
          
          // Fix 1: Replace ElementalProperties without import with imported type
          if (!fileContent.includes('import') || !fileContent.includes('ElementalProperties')) {
            const importRegex = /^(import.+from.+)$/m;
            if (importRegex.test(fileContent) && !fileContent.includes('ElementalProperties')) {
              fileContent = fileContent.replace(
                importRegex,
                `$1\nimport type { ElementalProperties } from '@/types/alchemy';`
              );
              occurrencesFixed++;
            } else if (!importRegex.test(fileContent)) {
              fileContent = `import type { ElementalProperties } from '@/types/alchemy';\n\n${fileContent}`;
              occurrencesFixed++;
            }
          }
          
          // Fix 2: Fix type assertions for ElementalProperties
          const elementalPropsAssertionRegex = /as\s+{\s*(Fire|water|earth|Air)[^}]*}/g;
          fileContent = fileContent.replace(elementalPropsAssertionRegex, 'as ElementalProperties');
          
          // Count occurrences fixed
          const assertionsFixed = (originalContent.match(elementalPropsAssertionRegex) || []).length;
          occurrencesFixed += assertionsFixed;
          
          // Fix 3: Fix inline ElementalProperties type definitions
          const inlineElementalPropsRegex = /interface\s+ElementalProperties\s*{[^}]*}/g;
          fileContent = fileContent.replace(inlineElementalPropsRegex, (match) => {
            occurrencesFixed++;
            return '// Using imported ElementalProperties type';
          });
          
          // Fix 4: Fix type casting for non-ElementalProperties objects
          const castingRegex = /([\w.]+)\s+as\s+ElementalProperties/g;
          fileContent = fileContent.replace(castingRegex, (match, varName) => {
            // Only replace if the variable isn't already typed as ElementalProperties
            if (!fileContent.includes(`${varName}: ElementalProperties`)) {
              occurrencesFixed++;
              return `{...${varName}} as ElementalProperties`;
            }
            return match;
          });
          
          // Fix 5: Fix function parameters without explicit type
          const functionParamRegex = /function\s+\w+\s*\(\s*(\w+)\s*\)\s*(?!:)/g;
          fileContent = fileContent.replace(functionParamRegex, (match, paramName) => {
            // Check if the function body uses Fire, water, earth, Air properties
            const functionBody = fileContent.substring(fileContent.indexOf(match) + match.length);
            const usesElementalProps = /\b(Fire|water|earth|Air)\b/.test(functionBody.substring(0, functionBody.indexOf('}')));
            
            if (usesElementalProps) {
              occurrencesFixed++;
              return match.replace(`(${paramName})`, `(${paramName}: ElementalProperties)`);
            }
            return match;
          });
          
          if (originalContent !== fileContent) {
            totalFilesModified++;
            totalOccurrencesFixed += occurrencesFixed;
            
            console.log(`\nModified file: ${file}`);
            console.log(`Fixed ${occurrencesFixed} occurrences`);
            
            if (!dryRun) {
              writeFileSync(file, fileContent, 'utf8');
            }
          }
        }
      } catch (err) {
        console.error(`Error processing directory ${dir}:`, err);
      }
    }
    
    console.log(`\n${dryRun ? '[DRY RUN] Would have modified' : 'Modified'} ${totalFilesModified} files with ${totalOccurrencesFixed} fixes`);
    
  } catch (error) {
    console.error('❌ Error fixing ElementalProperties type compatibility:', error);
    process.exit(1);
  }
}

// Command line arguments handling
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// Run the function
fixElementalPropertiesCompatibility(dryRun); |earth|Air)\b/.test(functionBody.substring(0, functionBody.indexOf('}')));
            
            if (usesElementalProps) {
              occurrencesFixed++;
              return match.replace(`(${paramName})`, `(${paramName}: ElementalProperties)`);
            }
            return match;
          });
          
          if (originalContent !== fileContent) {
            totalFilesModified++;
            totalOccurrencesFixed += occurrencesFixed;
            
            console.log(`\nModified file: ${file}`);
            console.log(`Fixed ${occurrencesFixed} occurrences`);
            
            if (!dryRun) {
              writeFileSync(file, fileContent, 'utf8');
            }
          }
        }
      } catch (err) {
        console.error(`Error processing directory ${dir}:`, err);
      }
    }
    
    console.log(`\n${dryRun ? '[DRY RUN] Would have modified' : 'Modified'} ${totalFilesModified} files with ${totalOccurrencesFixed} fixes`);
    
  } catch (error) {
    console.error('❌ Error fixing ElementalProperties type compatibility:', error);
    process.exit(1);
  }
}

// Command line arguments handling
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// Run the function
fixElementalPropertiesCompatibility(dryRun); |Air)\b/.test(functionBody.substring(0, functionBody.indexOf('}')));
            
            if (usesElementalProps) {
              occurrencesFixed++;
              return match.replace(`(${paramName})`, `(${paramName}: ElementalProperties)`);
            }
            return match;
          });
          
          if (originalContent !== fileContent) {
            totalFilesModified++;
            totalOccurrencesFixed += occurrencesFixed;
            
            console.log(`\nModified file: ${file}`);
            console.log(`Fixed ${occurrencesFixed} occurrences`);
            
            if (!dryRun) {
              writeFileSync(file, fileContent, 'utf8');
            }
          }
        }
      } catch (err) {
        console.error(`Error processing directory ${dir}:`, err);
      }
    }
    
    console.log(`\n${dryRun ? '[DRY RUN] Would have modified' : 'Modified'} ${totalFilesModified} files with ${totalOccurrencesFixed} fixes`);
    
  } catch (error) {
    console.error('❌ Error fixing ElementalProperties type compatibility:', error);
    process.exit(1);
  }
}

// Command line arguments handling
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// Run the function
fixElementalPropertiesCompatibility(dryRun); 