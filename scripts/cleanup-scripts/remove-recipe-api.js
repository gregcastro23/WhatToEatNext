/**
 * Remove Recipe API Routes Script
 * 
 * This script removes the now-unnecessary recipe API routes,
 * since we're using direct data access instead.
 * 
 * Usage: 
 *   node scripts/cleanup-scripts/remove-recipe-api.js --dry-run
 *   node scripts/cleanup-scripts/remove-recipe-api.js
 */

import fs from 'fs';
import path from 'path';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const API_ROUTES_PATH = path.resolve('src/app/api/recipes');

// Utility to safely delete a directory
function safeDeleteDirectory(dirPath) {
  if (DRY_RUN) {
    console.log(`[DRY RUN] Would delete directory: ${dirPath}`);
    return;
  }
  
  try {
    // Recursively remove directory contents
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const currentPath = path.join(dirPath, file);
        
        if (fs.lstatSync(currentPath).isDirectory()) {
          // Recursively delete subdirectory
          safeDeleteDirectory(currentPath);
        } else {
          // Delete file
          console.log(`Deleting file: ${currentPath}`);
          fs.unlinkSync(currentPath);
        }
      }
      
      // Now that directory is empty, remove it
      console.log(`Deleting directory: ${dirPath}`);
      fs.rmdirSync(dirPath);
    }
  } catch (error) {
    console.error(`Error deleting directory ${dirPath}:`, error);
  }
}

// Main function
function removeRecipeApi() {
  console.log(`\n${DRY_RUN ? '[DRY RUN] ' : ''}Recipe API Routes Removal Script`);
  console.log('------------------------------------------------');
  
  if (!fs.existsSync(API_ROUTES_PATH)) {
    console.log(`Recipe API directory not found at: ${API_ROUTES_PATH}`);
    return;
  }
  
  console.log(`Found Recipe API directory at: ${API_ROUTES_PATH}`);
  
  // Perform the deletion
  safeDeleteDirectory(API_ROUTES_PATH);
  
  console.log('------------------------------------------------');
  console.log(`${DRY_RUN ? '[DRY RUN] ' : ''}Recipe API routes removal ${DRY_RUN ? 'would be' : 'was'} completed.\n`);
}

// Run the script
removeRecipeApi(); 