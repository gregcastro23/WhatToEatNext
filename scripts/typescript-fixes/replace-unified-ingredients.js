// Script to safely replace the unified ingredients file with our new implementation
// This script performs a safe replacement with backup

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

// Paths
const oldFilePath = path.join(projectRoot, 'src/data/unified/ingredients.ts');
const newFilePath = path.join(projectRoot, 'src/data/unified/ingredients.ts.new');
const backupPath = path.join(projectRoot, 'src/data/unified/ingredients.ts.bak');

// Function to check if a file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

// Main function
async function replaceUnifiedIngredientsFile() {
  console.log('Starting unified ingredients file replacement...');
  
  // Check that the new file exists
  if (!fileExists(newFilePath)) {
    console.error('Error: New file does not exist at', newFilePath);
    return;
  }
  
  // Check that the old file exists
  if (!fileExists(oldFilePath)) {
    console.error('Error: Original file does not exist at', oldFilePath);
    return;
  }
  
  try {
    // Create a backup of the old file
    console.log('Creating backup of the original file...');
    fs.copyFileSync(oldFilePath, backupPath);
    console.log('Backup created at', backupPath);
    
    // Replace the old file with the new one
    console.log('Replacing the file...');
    fs.copyFileSync(newFilePath, oldFilePath);
    
    // Remove the .new file
    console.log('Cleaning up...');
    fs.unlinkSync(newFilePath);
    
    console.log('Success! The unified ingredients file has been replaced.');
    console.log('The original file has been backed up to', backupPath);
  } catch (error) {
    console.error('Error during file replacement:', error.message);
  }
}

// Run the script
replaceUnifiedIngredientsFile(); 