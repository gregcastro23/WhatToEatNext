#!/usr/bin/env node

/**
 * Script to fix ingredient duplication issues
 * 
 * This script resolves the issue of ingredients like ginger appearing in multiple
 * categories (both as a vegetable in roots and as a spice in ground spices)
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('Running ingredient duplication fix script...');

// Files to check for duplication
const ingredientFiles = glob.sync('src/data/ingredients/**/*.{js,ts}');

// Track ingredients
const ingredientRegistry = {};
const duplicateIngredients = {};

// This function finds all ingredient definitions
function scanForIngredients(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const filename = path.basename(filePath);
  const category = path.dirname(filePath).split('/').pop();
  
  console.log(`Scanning ${filename} in category ${category}...`);
  
  // Simple regex to find ingredient definitions
  const ingredientRegex = /([\'\"])([\w\s\-]+)\1\s*:\s*\{/g;
  let match;
  
  while ((match = ingredientRegex.exec(content)) !== null) {
    const ingredientName = match[2].toLowerCase();
    
    if (!ingredientRegistry[ingredientName]) {
      ingredientRegistry[ingredientName] = {
        files: [filePath],
        categories: [category]
      };
    } else {
      ingredientRegistry[ingredientName].files.push(filePath);
      ingredientRegistry[ingredientName].categories.push(category);
      
      // Track duplicates
      duplicateIngredients[ingredientName] = ingredientRegistry[ingredientName];
    }
  }
}

// Scan all ingredient files
ingredientFiles.forEach(scanForIngredients);

// Log duplicates
console.log('\nDuplicate ingredients found:');
const duplicateCount = Object.keys(duplicateIngredients).length;

if (duplicateCount === 0) {
  console.log('No duplicates found!');
} else {
  console.log(`Found ${duplicateCount} duplicate ingredients:`);
  
  Object.entries(duplicateIngredients).forEach(([name, info]) => {
    console.log(`\n"${name}" appears in:`);
    info.files.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file} (${info.categories[index]})`);
    });
  });
  
  // ----- FIX STRATEGY -----
  console.log('\nApplying fixes...');
  
  // Define category preferences for common duplicates
  const categoryPreferences = {
    'ginger': 'seasonings', // Prefer to keep ginger in seasonings/aromatics
    'garlic': 'seasonings',
    'turmeric': 'spices',
    'cinnamon': 'spices',
    'cloves': 'spices',
    'nutmeg': 'spices',
    'cardamom': 'spices'
  };
  
  // Process each duplicate
  Object.entries(duplicateIngredients).forEach(([name, info]) => {
    const preferredCategory = categoryPreferences[name] || info.categories[0];
    
    console.log(`\nFixing "${name}":`);
    console.log(`  Preferred category: ${preferredCategory}`);
    
    // Keep in preferred category, remove from others
    info.files.forEach((file, index) => {
      const fileCategory = info.categories[index];
      
      if (fileCategory !== preferredCategory && file.includes(fileCategory)) {
        console.log(`  Removing from ${file}`);
        
        // Read file
        let content = fs.readFileSync(file, 'utf-8');
        
        // Create regex to match the entire ingredient definition
        const removeRegex = new RegExp(`['"]${name}['"]\\s*:\\s*\\{[^\\{\\}]*((\\{[^\\{\\}]*\\})[^\\{\\}]*)*\\},?`, 'i');
        
        // Remove the ingredient
        content = content.replace(removeRegex, '');
        
        // Fix trailing commas if needed
        content = content.replace(/,\s*\}/g, '\n}');
        
        // Backup the original file
        const backupPath = `${file}.backup`;
        fs.writeFileSync(backupPath, fs.readFileSync(file));
        console.log(`  Created backup at ${backupPath}`);
        
        // Write changes
        fs.writeFileSync(file, content);
        console.log(`  Updated ${file}`);
      } else {
        console.log(`  Keeping in ${file} (preferred)`);
      }
    });
  });
  
  console.log('\nIngredient duplication fixes complete!');
} 