/**
 * Script to update all ingredient category scripts with the improvements from updateHerbs.ts
 *
 * Run with: yarn node src/scripts/updateIngredientFiles.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Path to the source file with improvements
const SOURCE_FILE = path.resolve(process.cwd(), 'src/scripts/updateHerbs.ts');

// Files to update
const TARGET_FILES = [
  'updateVegetables.ts',
  'updateFruits.ts',
  'updateGrains.ts',
  'updateProteins.ts',
  'updateSpices.ts',
  'updateOils.ts',
  'updateVinegars.ts',
];

// Read the source file
const sourceContent = fs.readFileSync(SOURCE_FILE, 'utf8');

// Key improvements to apply to each file:
// 1. Update node-fetch import/require to nodeFetch for consistency
// 2. Update fetch calls to nodeFetch
// 3. Update API request headers for better compatibility
// 4. Update the findIngredientMatch function to use POST search method
// 5. Ensure improved API error handling and logging is in place

// console.log('Starting to update ingredient category scripts...');

// Process each target file
TARGET_FILES.forEach(filename => {
  const filePath = path.resolve(process.cwd(), 'src/scripts', filename);

  if (!fs.existsSync(filePath)) {
    // console.log(`File not found: ${filePath}`);
    return;
  }

  // console.log(`\nProcessing ${filename}...`);

  // Read the target file
  let content = fs.readFileSync(filePath, 'utf8');

  // Extract the category name from the file
  const categoryMatch = content.match(/const CATEGORY = ['"]([^'"]+)['"]/);
  const category = categoryMatch
    ? categoryMatch[1]
    : filename.replace('update', '').replace('.ts', '').toLowerCase();

  // console.log(`Identified category: ${category}`);

  // 1. Update the import/require statement
  content = content.replace(
    /const fetch = require\('node-fetch'\)/g,
    `const nodeFetch = require('node-fetch')`,
  );

  // 2. Update fetch calls to nodeFetch
  content = content.replace(
    /const response = await fetch\(url,/g,
    `const response = await nodeFetch(url,`,
  );

  // 3. Update the API request headers
  content = content.replace(
    /headers: { ['"]Content-Type['"]: ['"]application\/json['"] }/g,
    `headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }`,
  );

  // 4. Extract key functions from the source file (updateHerbs.ts)

  // Extract makeApiRequest function
  const makeApiRequestRegex =
    /async function makeApiRequest\(url, cacheKey\) {[\s\S]+?throw new Error\(`Failed API request after \${maxRetries} retries`\);\s+}/;
  const makeApiRequestFunc = sourceContent.match(makeApiRequestRegex);

  if (makeApiRequestFunc) {
    const targetMakeApiRequest = content.match(makeApiRequestRegex);
    if (targetMakeApiRequest) {
      content = content.replace(targetMakeApiRequest[0], makeApiRequestFunc[0]);
      // console.log(`Updated makeApiRequest function`);
    }
  }

  // Extract findIngredientMatch function
  const findIngredientMatchRegex =
    /async function findIngredientMatch\(ingredientName\) {[\s\S]+?return null;\s+}/;
  const findIngredientMatchFunc = sourceContent.match(findIngredientMatchRegex);

  if (findIngredientMatchFunc) {
    const targetFindIngredientMatch = content.match(findIngredientMatchRegex);
    if (targetFindIngredientMatch) {
      // Update the function but preserve the category-specific caching
      let newFunc = findIngredientMatchFunc[0];

      // Update any herbs-specific cache references to use the current category
      newFunc = newFunc.replace(
        /progress.processedIngredients\[ingredientKey\]/g,
        `progress.processedIngredients[ingredientKey]`,
      );

      content = content.replace(targetFindIngredientMatch[0], newFunc);
      // console.log(`Updated findIngredientMatch function`);
    }
  }

  // 5. Update the progress file path to be category-specific
  content = content.replace(
    /const PROGRESS_FILE = path\.resolve\(CACHE_DIR, ['"]herbs_progress\.json['"]\)/,
    `const PROGRESS_FILE = path.resolve(CACHE_DIR, '${category}_progress.json')`,
  );

  // 6. Update any logging mentions of herbs to the current category
  content = content.replace(
    /console\.log\(`Completed enhancing herbs\.`\)/g,
    'console.log(`Completed enhancing ${category}.`)',
  );

  // 7. Update function name in exports
  content = content.replace(
    /module\.exports = { updateHerbs }/,
    `module.exports = { update${category.charAt(0).toUpperCase() + category.slice(1)} }`,
  );

  // 8. Update main function name
  const updateFuncRegex = new RegExp(
    `async function update${category.charAt(0).toUpperCase() + category.slice(1)}() {`,
  );
  if (!content.match(updateFuncRegex)) {
    content = content.replace(
      /async function updateHerbs\(\) {/,
      `async function update${category.charAt(0).toUpperCase() + category.slice(1)}() {`,
    );
  }

  // 9. Replace script comment at top to match the category
  content = content.replace(
    /\/\*\*\n \* Script to update herb ingredients with nutritional information/,
    `/**\n * Script to update ${category} ingredients with nutritional information`,
  );

  // 10. Update the run command in comment
  content = content.replace(
    /Run with: yarn ts-node src\/scripts\/updateHerbs\.ts/,
    `Run with: yarn ts-node src/scripts/update${category.charAt(0).toUpperCase() + category.slice(1)}.ts`,
  );

  // Save the updated file
  fs.writeFileSync(filePath, content, 'utf8');
  // console.log(`Updated ${filename}`);

  // Format the file with Prettier if available
  try {
    execSync(`yarn prettier --write ${filePath}`);
    // console.log(`Formatted ${filename}`);
  } catch (error) {
    // console.log(`Note: Prettier formatting failed for ${filename}. The file is still updated.`);
  }
});

// console.log('\nAll files have been updated successfully!');
// console.log('Key improvements applied:');
// console.log('1. Updated node-fetch import to nodeFetch for consistency');
// console.log('2. Updated API request logic with better headers and error handling');
// console.log('3. Updated ingredient search function to use POST method');
// console.log('4. Ensured category-specific progress tracking and logging');
console.log(
  '\nNote: You should still manually verify each file to ensure everything works correctly.',
);
