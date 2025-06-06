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
const recipeDirsToCheck = [
  'src/data/recipes',
  'src/data/unified/recipes'
];

// Main function
function fixRecipeDietaryProperties(dryRun = false) {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Fixing missing dietary properties in recipe data...`);
  
  let totalFilesModified = 0;
  let totalRecipesFixed = 0;
  
  try {
    // Process each directory
    for (const dir of recipeDirsToCheck) {
      const dirPath = resolve(rootDir, dir);
      
      try {
        console.log(`Scanning directory: ${dirPath}`);
        const files = getJsonAndTsFiles(dirPath);
        
        for (const file of files) {
          console.log(`Processing file: ${file}`);
          let fileContent = readFileSync(file, 'utf8');
          const originalContent = fileContent;
          let recipesFixed = 0;
          
          // Handle JSON files
          if (file.endsWith('.json')) {
            try {
              const recipeData = JSON.parse(fileContent);
              
              // Check if it's an array of recipes
              if (Array.isArray(recipeData)) {
                recipeData.forEach((recipe, index) => {
                  if (isRecipeObject(recipe)) {
                    const fixed = addMissingDietaryProperties(recipe);
                    if (fixed) {
                      recipesFixed++;
                    }
                  }
                });
                
                if (recipesFixed > 0) {
                  fileContent = JSON.stringify(recipeData, null, 2);
                }
              } 
              // Check if it's a single recipe
              else if (isRecipeObject(recipeData)) {
                const fixed = addMissingDietaryProperties(recipeData);
                if (fixed) {
                  recipesFixed++;
                  fileContent = JSON.stringify(recipeData, null, 2);
                }
              }
              // Check if it's an object with recipe properties
              else if (typeof recipeData === 'object') {
                let objectModified = false;
                
                Object.keys(recipeData).forEach(key => {
                  if (isRecipeObject(recipeData[key])) {
                    const fixed = addMissingDietaryProperties(recipeData[key]);
                    if (fixed) {
                      recipesFixed++;
                      objectModified = true;
                    }
                  } else if (Array.isArray(recipeData[key])) {
                    recipeData[key].forEach((item, index) => {
                      if (isRecipeObject(item)) {
                        const fixed = addMissingDietaryProperties(item);
                        if (fixed) {
                          recipesFixed++;
                          objectModified = true;
                        }
                      }
                    });
                  }
                });
                
                if (objectModified) {
                  fileContent = JSON.stringify(recipeData, null, 2);
                }
              }
            } catch (error) {
              console.error(`Error parsing JSON in file ${file}:`, error);
            }
          } 
          // Handle TypeScript files
          else if (file.endsWith('.ts')) {
            // Find recipe object literals in TS files
            let recipeObjectRegex = /{\s*id:\s*['"]([^'"]+)['"]\s*,\s*name:\s*['"]([^'"]+)['"]/g;
            let match;
            let newContent = fileContent;
            
            while ((match = recipeObjectRegex.exec(fileContent)) !== null) {
              const objectStart = match.index;
              
              // Find the end of this object
              let braceCount = 1;
              let objectEnd = objectStart + 1;
              
              while (braceCount > 0 && objectEnd < fileContent.length) {
                if (fileContent[objectEnd] === '{') braceCount++;
                if (fileContent[objectEnd] === '}') braceCount--;
                objectEnd++;
              }
              
              // Extract the recipe object
              const recipeStr = fileContent.substring(objectStart, objectEnd);
              
              // Check if it has dietary properties
              const hasDietaryProps = /\b(isVegetarian|isVegan|isGlutenFree|isDAiryFree|dietaryRestrictions)\b/.test(recipeStr);
              
              if (!hasDietaryProps) {
                // Add missing dietary properties before the closing brace
                const lastBraceIndex = recipeStr.lastIndexOf('}');
                const insertionPoint = objectStart + lastBraceIndex;
                
                const dietaryProps = `,
  // Default dietary properties
  isVegetarian: false,
  isVegan: false,
  isGlutenFree: false,
  isDAiryFree: false,
  dietaryRestrictions: []`;
                
                newContent = newContent.substring(0, insertionPoint) + 
                             dietaryProps + 
                             newContent.substring(insertionPoint);
                
                // Adjust regex to account for the inserted text
                const lengthDiff = dietaryProps.length;
                recipeObjectRegex.lastIndex += lengthDiff;
                
                recipesFixed++;
              }
            }
            
            fileContent = newContent;
          }
          
          if (originalContent !== fileContent && recipesFixed > 0) {
            totalFilesModified++;
            totalRecipesFixed += recipesFixed;
            
            console.log(`Modified file: ${file}`);
            console.log(`Fixed ${recipesFixed} recipes`);
            
            if (!dryRun) {
              writeFileSync(file, fileContent, 'utf8');
            }
          }
        }
      } catch (err) {
        console.error(`Error processing directory ${dir}:`, err);
      }
    }
    
    console.log(`\n${dryRun ? '[DRY RUN] Would have modified' : 'Modified'} ${totalFilesModified} files with ${totalRecipesFixed} recipes fixed`);
    
  } catch (error) {
    console.error('❌ Error fixing recipe dietary properties:', error);
    process.exit(1);
  }
}

// Helper function to get JSON and TS files in a directory recursively
function getJsonAndTsFiles(dir) {
  const dirents = readdirSync(dir, { withFileTypes: true });
  const files = dirents.map((dirent) => {
    const res = join(dir, dirent.name);
    return dirent.isDirectory() ? getJsonAndTsFiles(res) : res;
  });
  return Array.prototype.concat(...files).filter(file => 
    file.endsWith('.json') || file.endsWith('.ts')
  );
}

// Helper function to check if an object is likely a recipe
function isRecipeObject(obj) {
  return (
    obj && 
    typeof obj === 'object' && 
    obj.name && 
    typeof obj.name === 'string' &&
    (obj.id || obj.ingredients)
  );
}

// Helper function to add missing dietary properties to a recipe
function addMissingDietaryProperties(recipe) {
  let modified = false;
  
  // Add missing boolean flags
  if (recipe.isVegetarian === undefined) {
    recipe.isVegetarian = false;
    modified = true;
  }
  
  if (recipe.isVegan === undefined) {
    recipe.isVegan = false;
    modified = true;
  }
  
  if (recipe.isGlutenFree === undefined) {
    recipe.isGlutenFree = false;
    modified = true;
  }
  
  if (recipe.isDAiryFree === undefined) {
    recipe.isDAiryFree = false;
    modified = true;
  }
  
  // Add dietaryRestrictions array if missing
  if (recipe.dietaryRestrictions === undefined) {
    recipe.dietaryRestrictions = [];
    modified = true;
  }
  
  return modified;
}

// Command line arguments handling
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

// Run the function
fixRecipeDietaryProperties(dryRun); 