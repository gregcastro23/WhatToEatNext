/**
 * Script to add serving_size_oz to all protein ingredient files
 * This standardizes the nutritional data format and adds serving size information
 *
 * Run with: yarn node src/scripts/add-serving-sizes.js
 */

const fs = require('fs');
const path = require('path');

// Set the default serving size (in ounces) for different protein types
const DEFAULT_SERVING_SIZES = {
  beef: 3,
  pork: 3,
  lamb: 3,
  venison: 3,
  fish: 3,
  chicken: 3,
  duck: 3,
  turkey: 3,
  seafood: 3,
  shellfish: 3,
  legumes: 3,
  plant_based: 3,
  soy: 3,
  tempeh: 3,
  seitan: 3,
  tofu: 3,
  egg: 1.8, // Large chicken egg is about 1.8 oz
  chicken_egg: 1.8,
  duck_egg: 2.5,
  quail_egg: 0.4,
};

// Path to the protein ingredients directory
const PROTEINS_DIR = path.resolve(
  process.cwd(),
  'src/data/ingredients/proteins'
);

// Process a single ingredient file
function processFile(filePath) {
  // console.log(`Processing ${filePath}...`);

  // Read the file
  const content = fs.readFileSync(filePath, 'utf8');
  const fileModified = false;

  // Check if file uses rawX pattern with fixIngredientMappings
  const usesFixIngredientMappings = content.includes('fixIngredientMappings');

  // Find all nutritionalProfile objects
  const profileRegex = /nutritionalProfile\s*:\s*{([^}]*)}/g;
  let match;

  // Replace nutritionalProfile without serving size
  while ((match = profileRegex.exec(content)) !== null) {
    const profile = match[0];

    if (!profile.includes('serving_size_oz')) {
      // Get the ingredient context to determine the right serving size
      const contextStart = content.lastIndexOf("'", match.index);
      const contextEnd = content.indexOf("'", contextStart + 1);
      const ingredientKey = '';

      if (contextStart !== -1 && contextEnd !== -1) {
        ingredientKey = content
          .substring(contextStart + 1, contextEnd)
          .toLowerCase();
      }

      // Find the category in the surrounding text
      const categoryMatch = content
        .substring(Math.max(0, match.index - 500), match.index)
        .match(/category\s*:\s*['"]([^'"]+)['"]/);

      // Determine serving size based on ingredient key or category
      const servingSize = 3; // Default

      if (ingredientKey && DEFAULT_SERVING_SIZES[ingredientKey]) {
        servingSize = DEFAULT_SERVING_SIZES[ingredientKey];
      } else if (categoryMatch && DEFAULT_SERVING_SIZES[categoryMatch[1]]) {
        servingSize = DEFAULT_SERVING_SIZES[categoryMatch[1]];
      }

      // Add serving_size_oz to the profile
      const updatedProfile = profile.replace(
        /nutritionalProfile\s*:\s*{/,
        `nutritionalProfile: {
      serving_size_oz: ${servingSize},`
      );

      content = content.replace(profile, updatedProfile);
      fileModified = true;
    }
  }

  // Find all nutritionalContent objects and convert to nutritionalProfile
  const contentRegex = /nutritionalContent\s*:\s*{([^}]*)}/g;

  while ((match = contentRegex.exec(content)) !== null) {
    const nutritionalContent = match[0];
    const contentBody = match[1];

    // Get the ingredient context to determine the right serving size
    const contextStart = content.lastIndexOf("'", match.index);
    const contextEnd = content.indexOf("'", contextStart + 1);
    const ingredientKey = '';

    if (contextStart !== -1 && contextEnd !== -1) {
      ingredientKey = content
        .substring(contextStart + 1, contextEnd)
        .toLowerCase();
    }

    // Find the category in the surrounding text
    const categoryMatch = content
      .substring(Math.max(0, match.index - 500), match.index)
      .match(/category\s*:\s*['"]([^'"]+)['"]/);

    // Determine serving size based on ingredient key or category
    const servingSize = 3; // Default for proteins

    if (ingredientKey && DEFAULT_SERVING_SIZES[ingredientKey]) {
      servingSize = DEFAULT_SERVING_SIZES[ingredientKey];
    } else if (categoryMatch && DEFAULT_SERVING_SIZES[categoryMatch[1]]) {
      servingSize = DEFAULT_SERVING_SIZES[categoryMatch[1]];
    }

    // Extract values from nutritionalContent
    const proteinMatch = contentBody.match(/protein\s*:\s*(\d+(\.\d+)?)/);
    const fatMatch = contentBody.match(/fat\s*:\s*(\d+(\.\d+)?)/);
    const carbsMatch = contentBody.match(/carbs\s*:\s*(\d+(\.\d+)?)/);
    const caloriesMatch = contentBody.match(/calories\s*:\s*(\d+(\.\d+)?)/);

    // Prepare the new nutritionalProfile
    const profileContent = `nutritionalProfile: {
      serving_size_oz: ${servingSize},`;

    if (caloriesMatch) {
      profileContent += `
      calories: ${caloriesMatch[1]},`;
    }

    if (proteinMatch) {
      profileContent += `
      protein_g: ${proteinMatch[1]},`;
    }

    if (fatMatch) {
      profileContent += `
      fat_g: ${fatMatch[1]},`;
    }

    if (carbsMatch) {
      profileContent += `
      carbs_g: ${carbsMatch[1]},`;
    }

    // Add default vitamins and minerals if they don't exist
    profileContent += `
      vitamins: ['Vitamin B12', 'Vitamin B6'],
      minerals: ['Iron', 'Zinc']
    }`;

    // Replace the old nutritionalContent with the new nutritionalProfile
    content = content.replace(nutritionalContent, profileContent);
    fileModified = true;
  }

  // Only write the file if modifications were made
  if (fileModified) {
    fs.writeFileSync(filePath, content, 'utf8');
    // console.log(`  Updated with serving sizes.`);
    return true;
  } else {
    // console.log(`  No updates needed.`);
    return false;
  }
}

// Process all TypeScript files in the proteins directory
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  const filesProcessed = 0;
  const filesUpdated = 0;

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      // Recursively process subdirectories
      const results = processDirectory(fullPath);
      filesProcessed += results.processed;
      filesUpdated += results.updated;
    } else if (
      file.endsWith('.ts') &&
      !file.endsWith('.d.ts') &&
      file !== 'index.ts'
    ) {
      filesProcessed++;
      if (processFile(fullPath)) {
        filesUpdated++;
      }
    }
  }

  return { processed: filesProcessed, updated: filesUpdated };
}

// Main function
async function main() {
  // console.log('Starting to add serving sizes to protein ingredients...');

  if (!fs.existsSync(PROTEINS_DIR)) {
    // console.error(`Proteins directory not found: ${PROTEINS_DIR}`);
    process.exit(1);
  }

  const results = processDirectory(PROTEINS_DIR);

  // console.log(`\nCompleted processing ${results.processed} files.`);
  // console.log(`Updated ${results.updated} files with serving size information.`);
}

// Run the script
main()
  .then(() => {
    // console.log('All protein files have been processed.');
    process.exit(0);
  })
  .catch((error) => {
    // console.error('Error during processing:', error);
    process.exit(1);
  });
