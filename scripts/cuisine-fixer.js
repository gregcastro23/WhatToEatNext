/**
 * Cuisine File Fixer
 * 
 * This script fixes common issues in cuisine data files:
 * 1. Fixes missing commas between array items and object properties
 * 2. Moves description properties inside their parent objects
 * 3. Adds missing ID properties to dish objects
 * 4. Ensures proper formatting of ingredients arrays
 * 
 * Usage: 
 *   node cuisine-fixer.js
 * 
 * Requirements:
 *   Node.js 12+
 */

const fs = require('fs');
const path = require('path');

// Target cuisine files
const CUISINE_FILES = [
  'src/data/cuisines/italian.ts',
  'src/data/cuisines/japanese.ts',
  'src/data/cuisines/korean.ts',
  'src/data/cuisines/mexican.ts',
  'src/data/cuisines/middle-eastern.ts',
  'src/data/cuisines/russian.ts',
  'src/data/cuisines/thai.ts',
  'src/data/cuisines/vietnamese.ts'
];

// Backup directory
const BACKUP_DIR = `cuisine-fixes-backup-${new Date().toISOString().replace(/[:.]/g, '-')}`;
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Create a backup of a file
function backupFile(filePath) {
  try {
    const relativeFilePath = path.relative(process.cwd(), filePath);
    const backupPath = path.join(BACKUP_DIR, relativeFilePath);
    const backupDir = path.dirname(backupPath);
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    fs.copyFileSync(filePath, backupPath);
    return true;
  } catch (error) {
    console.error(`Failed to backup ${filePath}: ${error.message}`);
    return false;
  }
}

// Process a single cuisine file
function processCuisineFile(filePath) {
  console.log(`Processing ${filePath}...`);
  
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return false;
    }
    
    // Create backup
    if (!backupFile(filePath)) {
      return false;
    }
    
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Fix 1: Missing commas between object properties
    content = content.replace(/(\s*["']?[a-zA-Z0-9_]+["']?\s*:\s*(?:["'][^"']*["']|[^,;{}\[\]]+))(\s+["']?[a-zA-Z0-9_]+["']?\s*:)/g, '$1,$2');
    
    // Fix 2: Missing commas between ingredients in arrays
    content = content.replace(/}(\s*)\{ name:/g, '}, { name:');
    
    // Fix 3: Fix ingredient descriptions outside of objects
    content = fixDescriptionsOutsideObjects(content);
    
    // Fix 4: Add missing id property to dish objects
    content = content.replace(/(\s+){\s*\n\s*cuisine: "([^"]+)",/g, '$1{\n          id: "$2-dish",\n          cuisine: "$2",');
    content = content.replace(/(\s+){\s*\n\s*name: "([^"]+)"/g, '$1{\n          id: "$2",\n          name: "$2"');
    
    // Fix 5: Fix missing commas in elemental properties
    content = content.replace(/(\s*[A-Za-z]+: [0-9.]+)(\s+[A-Za-z]+: [0-9.]+)/g, '$1,$2');
    
    // Fix 6: Fix closing braces with missing commas in nested objects
    content = content.replace(/(\s*})(\s*[a-zA-Z0-9_]+:)/g, '$1,$2');
    
    // Save if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed issues in ${filePath}`);
      return true;
    } else {
      console.log(`No changes needed for ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`Error processing ${filePath}: ${error.message}`);
    return false;
  }
}

// Fix descriptions outside of objects
function fixDescriptionsOutsideObjects(content) {
  // Pattern to find ingredient objects followed by standalone description
  const pattern = /(\s*\{ name: "[^"]+",[^}]*}\s*)\n\s*description: "([^"]+)",?/g;
  
  // Replace with description inside the object
  return content.replace(pattern, (match, objectPart, description) => {
    // Check if object already has a description
    if (objectPart.includes('description:')) {
      return objectPart;
    }
    
    // Find the closing brace position
    const closeBraceIndex = objectPart.lastIndexOf('}');
    
    // Insert description before the closing brace
    const fixedObject = 
      objectPart.substring(0, closeBraceIndex) + 
      `, description: "${description}"` + 
      objectPart.substring(closeBraceIndex);
    
    return fixedObject;
  });
}

// Main function
function main() {
  console.log('=== Cuisine File Fixer ===');
  console.log(`Creating backups in: ${BACKUP_DIR}`);
  
  let fixedCount = 0;
  for (const file of CUISINE_FILES) {
    try {
      if (processCuisineFile(file)) {
        fixedCount++;
      }
    } catch (error) {
      console.error(`Failed to process ${file}: ${error.message}`);
    }
  }
  
  console.log('\n=== Fix Summary ===');
  console.log(`Total files processed: ${CUISINE_FILES.length}`);
  console.log(`Files fixed: ${fixedCount}`);
  
  console.log('\nNext steps:');
  console.log('1. Run: yarn build');
  console.log('2. If build fails, check remaining errors');
}

// Run the script
main(); 