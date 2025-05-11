import { SpoonacularService } from '../services/SpoonacularService';
const { fixIngredientMappings } = require('@/utils/elementalUtils');
const fs = require('fs');
const path = require('path');

// List of vegetables to fetch from Spoonacular
const VEGETABLES_TO_FETCH = [
  'asparagus',
  'artichoke',
  'cucumber',
  'okra',
  'zucchini',
  'peas',
  'green beans',
  'celery',
  'fennel',
  'kohlrabi',
  'bok choy',
  'mustard greens',
  'collard greens',
  'swiss chard',
  'arugula',
  'endive',
  'radicchio',
  'watercress',
  'turnip',
  'daikon radish',
  'parsnip',
  'rutabaga',
  'celeriac',
];

async function fetchVegetableData() {
  // console.log('Fetching vegetable data from Spoonacular...');

  const vegetablesData = {};

  // Process each vegetable
  for (const vegetableName of VEGETABLES_TO_FETCH) {
    // console.log(`Fetching data for ${vegetableName}...`);

    try {
      const data = await SpoonacularService.fetchVegetableData(vegetableName);

      if (Object.keys(data).length > 0) {
        // Create a key for the vegetable (lowercase, spaces replaced with underscores)
        const key = vegetableName.toLowerCase().replace(/\s+/g, '_');
        vegetablesData[key] = data;
        // console.log(`Successfully fetched data for ${vegetableName}`);
      } else {
        // console.warn(`No data returned for ${vegetableName}`);
      }

      // Sleep to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      // console.error(`Error fetching data for ${vegetableName}:`, error);
    }
  }

  // Determine which category to save the vegetables to
  const categories = {
    leafyGreens: [
      'swiss chard',
      'arugula',
      'endive',
      'radicchio',
      'watercress',
      'mustard greens',
      'collard greens',
    ],
    rootVegetables: [
      'turnip',
      'daikon radish',
      'parsnip',
      'rutabaga',
      'celeriac',
    ],
    otherVegetables: [
      'asparagus',
      'artichoke',
      'cucumber',
      'okra',
      'zucchini',
      'peas',
      'green beans',
      'celery',
      'fennel',
      'kohlrabi',
      'bok choy',
    ],
  };

  // Categorize vegetables
  const categorizedVegetables = {
    leafyGreens: {},
    rootVegetables: {},
    otherVegetables: {},
  };

  for (const [key, data] of Object.entries(vegetablesData)) {
    const vegetableData = data || {};
    const vegetableName = vegetableData.name
      ? vegetableData.name.toLowerCase()
      : key;

    if (categories.leafyGreens.some((v) => vegetableName.includes(v))) {
      categorizedVegetables.leafyGreens[key] = {
        ...vegetableData,
        subCategory: 'leafy green',
      };
    } else if (
      categories.rootVegetables.some((v) => vegetableName.includes(v))
    ) {
      categorizedVegetables.rootVegetables[key] = {
        ...vegetableData,
        subCategory: 'root',
      };
    } else {
      categorizedVegetables.otherVegetables[key] = {
        ...vegetableData,
        subCategory: 'other',
      };
    }
  }

  // Create a new file for other vegetables if needed
  if (Object.keys(categorizedVegetables.otherVegetables).length > 0) {
    const otherVegetablesPath = path.resolve(
      __dirname,
      '../../src/data/ingredients/vegetables/otherVegetables.ts'
    );

    const fileContent = `import type { IngredientMapping } from '@/types/alchemy';
import { fixIngredientMappings } from '@/utils/elementalUtils';

const rawOtherVegetables: Record<string, Partial<IngredientMapping>> = ${JSON.stringify(
      categorizedVegetables.otherVegetables,
      null,
      2
    )};

// Fix the ingredient mappings to ensure they have all required properties
export const otherVegetables: Record<string, IngredientMapping> = fixIngredientMappings(rawOtherVegetables);
`;

    fs.writeFileSync(otherVegetablesPath, fileContent);
    // console.log(`Created otherVegetables.ts with ${Object.keys(categorizedVegetables.otherVegetables).length} vegetables`);
  }

  // Update index.ts to include the new file
  const indexPath = path.resolve(
    __dirname,
    '../../src/data/ingredients/vegetables/index.ts'
  );
  if (Object.keys(categorizedVegetables.otherVegetables).length > 0) {
    const indexContent = fs.readFileSync(indexPath, 'utf8');

    // Check if otherVegetables is already imported
    if (!indexContent.includes('otherVegetables')) {
      // Add import statement
      indexContent = indexContent.replace(
        "import { rootVegetables as roots } from './roots';",
        "import { rootVegetables as roots } from './roots';\nimport { otherVegetables } from './otherVegetables';"
      );

      // Add to vegetables object
      indexContent = indexContent.replace(
        '  ...roots',
        '  ...roots,\n  ...otherVegetables'
      );

      // Add to export statement
      indexContent = indexContent.replace(
        '  roots',
        '  roots,\n  otherVegetables'
      );

      fs.writeFileSync(indexPath, indexContent);
      // console.log('Updated index.ts to include otherVegetables');
    }
  }

  // console.log('Vegetable data fetch complete!');
}

// Run the function
fetchVegetableData().catch(console.error);
