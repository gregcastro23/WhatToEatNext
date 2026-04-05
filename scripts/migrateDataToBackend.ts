
import fs from 'fs';
import path from 'path';
import { cuisinesMap } from '../src/data/cuisines/index.ts';
import { allSauces } from '../src/data/sauces.ts';
import { allIngredients } from '../src/data/ingredients/index.ts';

const JSON_DATA_PATH = path.join(process.cwd(), 'backend/alchm_kitchen/data/json');

async function migrate() {
  console.log('🚀 Starting Data Migration to Backend...');

  if (!fs.existsSync(JSON_DATA_PATH)) {
    fs.mkdirSync(JSON_DATA_PATH, { recursive: true });
  }

  // 1. Migrate Cuisines
  console.log('📦 Migrating Cuisines...');
  const cuisinesPath = path.join(JSON_DATA_PATH, 'cuisines');
  if (!fs.existsSync(cuisinesPath)) fs.mkdirSync(cuisinesPath, { recursive: true });
  
  // Save combined cuisines
  fs.writeFileSync(path.join(JSON_DATA_PATH, 'cuisines.json'), JSON.stringify(cuisinesMap, null, 2));
  
  // Save individual cuisines for optimized loading
  Object.entries(cuisinesMap).forEach(([id, data]) => {
    // Only save primary capitalized versions to the individual folder
    if (id[0] === id[0].toUpperCase()) {
      fs.writeFileSync(path.join(cuisinesPath, `${id}.json`), JSON.stringify(data, null, 2));
    }
  });

  // 2. Migrate Sauces
  console.log('📦 Migrating Sauces...');
  fs.writeFileSync(path.join(JSON_DATA_PATH, 'sauces.json'), JSON.stringify(allSauces, null, 2));

  // 3. Migrate Ingredients
  console.log('📦 Migrating Ingredients...');
  fs.writeFileSync(path.join(JSON_DATA_PATH, 'ingredients.json'), JSON.stringify(allIngredients, null, 2));

  console.log('✅ Migration Complete!');
}

migrate().catch(console.error);
