import fs from 'fs';
import { execSync } from 'child_process';
import { ingredientSummaries } from './src/data/ingredients/ingredientSummaries.ts';

const getIngredientsCmd = "grep -ro 'name: \"[^\"]*\"' src/data/ingredients/ | awk -F'\"' '{print $2}' | sort | uniq";
const allIngredientsRaw = execSync(getIngredientsCmd).toString().split('\n').filter(i => i.trim() !== '');

const existingKeys = Object.keys(ingredientSummaries);
const missingKeys = allIngredientsRaw.filter(i => !existingKeys.includes(i) && !existingKeys.includes(i.toLowerCase().replace(/\s+/g, '_')));

fs.writeFileSync('missing_ingredients.json', JSON.stringify(missingKeys, null, 2));
console.log(`Missing summaries for ${missingKeys.length} ingredients.`);
