#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filePath = 'src/pages/cuisines/index.tsx';

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Fix the main filter function
content = content.replace(
  /const mainCuisines = allCuisines\.filter\(cuisine => \{\s*const profile = cuisineFlavorProfiles\[cuisine\.id\];\s*return !profile\.parentCuisine;[^}]*\}\);/s,
  `const mainCuisines = allCuisines.filter(cuisine => {
    const profile = cuisineFlavorProfiles[cuisine.id];
    // Only include cuisines that have a profile and don't have a parent
    return profile && !profile.parentCuisine;
  });`
);

// Fix the map function to add null checks
content = content.replace(
  /{mainCuisines\.map\(cuisine => \(/,
  `{mainCuisines.map(cuisine => {
          const profile = cuisineFlavorProfiles[cuisine.id];
          // Skip cuisines without profiles
          if (!profile) return null;

          return (`
);

// Replace all instances of cuisineFlavorProfiles[cuisine.id] with profile
content = content.replace(/cuisineFlavorProfiles\[cuisine\.id\]/g, 'profile');

// Add closing brace and parenthesis for the map function
content = content.replace(
  /(<\/div>\s*<\/div>\s*)\s*\)\s*}\)/,
  '$1          );\n        })}'
);

// Write the fixed content back
fs.writeFileSync(filePath, content);

console.log('✅ Fixed cuisines page with proper null checks');
