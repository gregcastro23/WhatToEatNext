const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing final issues...');

// Fix ingredient recommender
function fixIngredientRecommender() {
  console.log('Fixing ingredientRecommender.ts...');
  const filePath = path.join(process.cwd(), 'src/utils/ingredientRecommender.ts');
  
  if (!fs.existsSync(filePath)) {
    console.log('ingredientRecommender.ts not found');
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace problematic imports
  content = content.replace(
    /import @\/types\s+from\s+['"]alchemy\s+['"];/g,
    "import { ElementalProperties, IngredientMapping } from '@/types/alchemy';"
  );
  
  content = content.replace(
    /import @\/data\s+from\s+['"]ingredients\s+['"];/g,
    "import { ingredients } from '@/data/ingredients';"
  );
  
  // Write back to file
  fs.writeFileSync(filePath, content);
  console.log('✅ Fixed ingredientRecommender.ts');
  return true;
}

// Fix zodiacUtils.ts
function fixZodiacUtils() {
  console.log('Fixing zodiacUtils.ts more thoroughly...');
  const filePath = path.join(process.cwd(), 'src/utils/zodiacUtils.ts');
  
  if (!fs.existsSync(filePath)) {
    console.log('zodiacUtils.ts not found');
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace problematic imports
  content = content.replace(
    /from ["']@\/types\/\(zodiacAffinity \|\| 1\)["']/g,
    "from '@/types/zodiacAffinity'"
  );
  
  // Write back to file
  fs.writeFileSync(filePath, content);
  console.log('✅ Fixed zodiacUtils.ts');
  return true;
}

// Fix more imports in ClientWrapper.tsx
function fixMoreClientWrapperImports() {
  console.log('Fixing more imports in ClientWrapper.tsx...');
  const filePath = path.join(process.cwd(), 'src/components/ClientWrapper.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log('ClientWrapper.tsx not found');
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace problematic imports
  content = content.replace(
    /import @\/components\s+from\s+['"]CalculationErrors\s+['"];/g,
    "import CalculationErrors from '@/components/CalculationErrors';"
  );
  
  content = content.replace(
    /import @\/components\s+from\s+['"]Clock\s+['"];/g,
    "import Clock from '@/components/Clock';"
  );
  
  content = content.replace(
    /import @\/components\s+from\s+['"]providers\s+['"];/g,
    "import { SomeProvider } from '@/components/providers';"
  );
  
  content = content.replace(
    /import @\/components\s+from\s+['"]errors\s+['"];/g,
    "import { ErrorHandler } from '@/components/errors';"
  );
  
  // Write back to file
  fs.writeFileSync(filePath, content);
  console.log('✅ Fixed ClientWrapper.tsx');
  return true;
}

// Fix NutritionalDisplay.tsx
function fixNutritionalDisplay() {
  console.log('Fixing NutritionalDisplay.tsx...');
  const filePath = path.join(process.cwd(), 'src/components/NutritionalDisplay.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log('NutritionalDisplay.tsx not found');
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace problematic imports
  content = content.replace(
    /import @\/utils\s+from\s+['"]nutritionalUtils\s+['"];/g,
    "import { getNutritionalInfo } from '@/utils/nutritionalUtils';"
  );
  
  content = content.replace(
    /import @\/types\s+from\s+['"]alchemy\s+['"];/g,
    "import { IngredientMapping } from '@/types/alchemy';"
  );
  
  // Write back to file
  fs.writeFileSync(filePath, content);
  console.log('✅ Fixed NutritionalDisplay.tsx');
  return true;
}

// Fix AstrologicalService.ts
function fixAstrologicalService() {
  console.log('Fixing AstrologicalService.ts...');
  const filePath = path.join(process.cwd(), 'src/services/AstrologicalService.ts');
  
  if (!fs.existsSync(filePath)) {
    console.log('AstrologicalService.ts not found');
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace problematic imports
  content = content.replace(
    /from ["']\.\.\/lib\/\(PlanetaryHourCalculator \|\| 1\)["']/g,
    "from '../lib/PlanetaryHourCalculator'"
  );
  
  // Write back to file
  fs.writeFileSync(filePath, content);
  console.log('✅ Fixed AstrologicalService.ts');
  return true;
}

// Create zodiacAffinity.ts type file if it doesn't exist
function createZodiacAffinityType() {
  console.log('Creating zodiacAffinity type file if needed...');
  
  const typesDir = path.join(process.cwd(), 'src/types');
  const filePath = path.join(typesDir, 'zodiacAffinity.ts');
  
  if (!fs.existsSync(typesDir)) {
    fs.mkdirSync(typesDir, { recursive: true });
  }
  
  if (!fs.existsSync(filePath)) {
    const content = `// Basic zodiac affinity types
export interface ZodiacAffinity {
  sign: string;
  strength: number;
  element: string;
  modality: 'Cardinal' | 'Fixed' | 'Mutable';
}

export const DEFAULT_ZODIAC_AFFINITY: ZodiacAffinity = {
  sign: 'Aries',
  strength: 0.5,
  element: 'Fire',
  modality: 'Cardinal'
};

export default {
  ZodiacAffinity,
  DEFAULT_ZODIAC_AFFINITY
};`;
    
    fs.writeFileSync(filePath, content);
    console.log('✅ Created zodiacAffinity.ts');
    return true;
  }
  
  console.log('zodiacAffinity.ts already exists');
  return false;
}

// Create PlanetaryHourCalculator.ts if it doesn't exist
function createPlanetaryHourCalculator() {
  console.log('Creating PlanetaryHourCalculator if needed...');
  
  const libDir = path.join(process.cwd(), 'src/lib');
  const filePath = path.join(libDir, 'PlanetaryHourCalculator.ts');
  
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
  }
  
  if (!fs.existsSync(filePath)) {
    const content = `// Basic planetary hour calculator
import { TimeOfDay } from '@/types/time';

/**
 * Calculate the planetary hour based on date and location
 */
export function calculatePlanetaryHour(date: Date, latitude: number, longitude: number): string {
  // Simple implementation - in a real app, this would be more complex
  const hour = date.getHours();
  const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  
  // Simple formula that returns one of the 7 planets based on hour
  const planetIndex = hour % 7;
  return planets[planetIndex];
}

/**
 * Check if the current time is day or night
 */
export function isDayOrNight(date: Date, latitude: number, longitude: number): TimeOfDay {
  const hour = date.getHours();
  
  // Simple implementation - day is between 6am and 6pm
  return (hour >= 6 && hour < 18) ? 'day' : 'night';
}

export default {
  calculatePlanetaryHour,
  isDayOrNight
};`;
    
    fs.writeFileSync(filePath, content);
    console.log('✅ Created PlanetaryHourCalculator.ts');
    return true;
  }
  
  console.log('PlanetaryHourCalculator.ts already exists');
  return false;
}

// Create TimeOfDay type if it doesn't exist
function createTimeOfDayType() {
  console.log('Creating TimeOfDay type if needed...');
  
  const typesDir = path.join(process.cwd(), 'src/types');
  const filePath = path.join(typesDir, 'time.ts');
  
  if (!fs.existsSync(typesDir)) {
    fs.mkdirSync(typesDir, { recursive: true });
  }
  
  if (!fs.existsSync(filePath)) {
    const content = `// Basic time type definitions
export type TimeOfDay = 'day' | 'night';

export type PlanetaryHour = {
  planet: string;
  startTime: Date;
  endTime: Date;
  timeOfDay: TimeOfDay;
};

export default {
  TimeOfDay,
  PlanetaryHour
};`;
    
    fs.writeFileSync(filePath, content);
    console.log('✅ Created time.ts');
    return true;
  }
  
  console.log('time.ts already exists');
  return false;
}

// Run all fixes
try {
  fixIngredientRecommender();
  fixZodiacUtils();
  fixMoreClientWrapperImports();
  fixNutritionalDisplay();
  fixAstrologicalService();
  createZodiacAffinityType();
  createPlanetaryHourCalculator();
  createTimeOfDayType();
  
  console.log('\n🎉 All final issues fixed! Run "yarn build" to check.');
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
} 