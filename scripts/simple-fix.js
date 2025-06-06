// Simple script to fix common issues in cuisine files
const fs = require('fs');
const path = require('path');

// Target files
const cuisineFiles = [
  'src/data/cuisines/italian.ts',
  'src/data/cuisines/japanese.ts'
];

// Simple fixes
function fixCuisineFile(filePath) {
  console.log(`Processing ${filePath}`);
  
  // Read the file
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  // Fix 1: Missing commas between array items
  content = content.replace(/}(\s*){/g, '},\n        {');
  
  // Fix 2: Missing commas between object properties
  content = content.replace(/(\s*["']?[a-zA-Z0-9_]+["']?\s*:\s*(?:["'][^"']*["']|[^,;{}\[\]]+))(\s+["']?[a-zA-Z0-9_]+["']?\s*:)/g, '$1,$2');
  
  // Fix 3: Missing id property based on name
  content = content.replace(/(\s+){\s*\n\s*name: "([^"]+)"/g, '$1{\n          id: "$2",\n          name: "$2"');
  
  // Fix 4: Missing description property if name exists but description doesn't
  content = content.replace(/(\s+name: "([^"]+)"[^\n]*\n)(?!\s*description)/g, '$1          description: "$2",\n');
  
  // Fix 5: Missing commas between ingredients in arrays
  content = content.replace(/(\s*\{ name:[^}]+}\s*)\{ name:/g, '$1, { name:');
  
  // Save the file if changes were made
  if (content !== original) {
    console.log(`Fixing ${filePath}`);
    fs.writeFileSync(filePath, content);
    return true;
  } else {
    console.log(`No changes needed for ${filePath}`);
    return false;
  }
}

// Process files
let fixed = 0;
for (const file of cuisineFiles) {
  try {
    if (fixCuisineFile(file)) {
      fixed++;
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
}

console.log(`Fixed ${fixed} files`); 