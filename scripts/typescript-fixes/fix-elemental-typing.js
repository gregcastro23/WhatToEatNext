// scripts/typescript-fixes/fix-elemental-typing.js
// Script to fix critical elemental-related TypeScript errors

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// Files that need to be fixed
const filesToFix = [
  'src/types/time.ts',
  'src/types/alchemy.ts',
  'src/types/index.ts',
  'src/types/recipeIngredient.ts',
  'src/types/recipe.ts',
  'src/services/unifiedRecipeService.ts',
];

// Type fixes to apply
const typeFixes = {
  'src/types/alchemy.ts': {
    find: [
      /import type \{ ZodiacSign \} from '@\/types\/zodiac';/,
      /import type \{ Season \} from '@\/types\/seasons';/
    ],
    replace: [
      `import type { ZodiacSign } from '../types/zodiac';`,
      `import type { Season } from '../types/seasons';`
    ]
  },
  'src/types/recipeIngredient.ts': {
    find: [
      /import type \{ ElementalProperties \} from '@\/types\/alchemy';/
    ],
    replace: [
      `import type { ElementalProperties } from '../types/alchemy';`
    ]
  },
  'src/types/index.ts': {
    find: [
      /export \* from '\.\/seasons';/,
      /export \* from '\.\/seasonal';/,
      /export \* from '\.\/recipeIngredient';/
    ],
    replace: [
      `// Export seasonal types with explicit names to avoid conflicts
export { 
  type Season,
  type SeasonalProfile,
  type SeasonalAdjustment 
} from './seasons';`,
      `export { 
  type SeasonalProfile as SeasonProfile
} from './seasonal';`,
      `// Export RecipeIngredient interface and validateIngredient function with explicit names
export { 
  type RecipeIngredient,
  type SimpleIngredient,
  validateIngredient as validateRecipeIngredient
} from './recipeIngredient';`
    ]
  },
  'src/services/unifiedRecipeService.ts': {
    find: [
      /import \{\s*Season,\s*PlanetName[^}]*\} from '\.\.\/types\/celestial';/
    ],
    replace: [
      `import { 
  ZodiacSign,
  PlanetaryAlignment,
  ThermodynamicProperties
} from '../types/celestial';
import { Season } from '../types/seasons';
import { PlanetName } from '../types/alchemy';`
    ]
  }
};

// Function to fix a file
function fixFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Apply fixes
  if (typeFixes[filePath]) {
    const { find, replace } = typeFixes[filePath];
    
    for (let i = 0; i < find.length; i++) {
      const pattern = find[i];
      const replacement = replace[i];
      
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
        console.log(`Fixed pattern in ${filePath}: ${pattern}`);
      }
    }
  }
  
  // Write changes back
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated file: ${filePath}`);
    return true;
  } else {
    console.log(`No changes needed in ${filePath}`);
    return false;
  }
}

// Main function
function main() {
  console.log('Fixing elemental-related TypeScript errors...');
  
  let fixedCount = 0;
  for (const file of filesToFix) {
    const filePath = path.join(rootDir, file);
    if (fixFile(filePath)) {
      fixedCount++;
    }
  }
  
  console.log(`Fixed ${fixedCount} files`);
}

// Run the script
main(); 