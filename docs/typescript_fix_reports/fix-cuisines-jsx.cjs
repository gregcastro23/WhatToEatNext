#!/usr/bin/env node

const fs = require('fs');

const filePath = 'src/pages/cuisines/index.tsx';

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Add null check at the beginning of the map function
content = content.replace(
  '{mainCuisines.map(cuisine => (',
  `{mainCuisines.map(cuisine => {
          const profile = cuisineFlavorProfiles[cuisine.id];
          if (!profile) return null;

          return (`,
);

// Replace cuisineFlavorProfiles[cuisine.id] with profile in the JSX
content = content.replace(/cuisineFlavorProfiles\[cuisine\.id\]/g, 'profile');

// Fix the closing of the map function
content = content.replace(/(\s+<\/div>\s+<\/div>\s+)\)\s*}\)/, '$1          );\n        })}');

// Write the fixed content back
fs.writeFileSync(filePath, content);

console.log('✅ Fixed cuisines JSX with profile variable');
