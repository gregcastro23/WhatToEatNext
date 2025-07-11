const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing absolute final issues...');

// Fix context providers
function fixContextProviders() {
  console.log('Fixing remaining context provider issues...');
  
  // Fix AlchemicalContext provider - need to directly check the file content
  const alchemicalProviderPath = path.join(process.cwd(), 'src/contexts/AlchemicalContext/provider.tsx');
  if (fs.existsSync(alchemicalProviderPath)) {
    let content = fs.readFileSync(alchemicalProviderPath, 'utf8');
    
    // Exact string replacement - replace the whole line
    content = content.replace(
      /import\s+.*\s+from\s+['"]@\/utils \/ \(alchemicalCalculations \|\| 1\)['"]/g, 
      "import { calculateElementalBalance } from '@/utils/alchemicalCalculations';"
    );
    
    fs.writeFileSync(alchemicalProviderPath, content);
    console.log('✅ Fixed AlchemicalContext provider');
  }
  
  // Fix ThemeContext provider
  const themeProviderPath = path.join(process.cwd(), 'src/contexts/ThemeContext/provider.tsx');
  if (fs.existsSync(themeProviderPath)) {
    let content = fs.readFileSync(themeProviderPath, 'utf8');
    
    // Replace the import
    content = content.replace(
      /from\s+['"]@\/utils \/ \(theme \|\| 1\)['"]/g,
      "from '@/utils/theme'"
    );
    
    fs.writeFileSync(themeProviderPath, content);
    console.log('✅ Fixed ThemeContext provider');
  }
  
  return true;
}

// Fix problematic imports in remaining files
function fixRemainingImports() {
  console.log('Fixing remaining problematic imports...');
  
  // Fix ingredientRecommender.ts
  const ingredientRecommenderPath = path.join(process.cwd(), 'src/utils/ingredientRecommender.ts');
  if (fs.existsSync(ingredientRecommenderPath)) {
    let content = fs.readFileSync(ingredientRecommenderPath, 'utf8');
    
    // Remove duplicate planet imports
    content = content.replace(
      /import @\/data\s+from\s+['"]planets\s+['"];(\s*import @\/data\s+from\s+['"]planets\s+['"];)*/g,
      "import { planetaryData } from '@/data/planets';"
    );
    
    fs.writeFileSync(ingredientRecommenderPath, content);
    console.log('✅ Fixed ingredientRecommender.ts');
  }
  
  // Fix safeAstrology.ts
  const safeAstrologyPath = path.join(process.cwd(), 'src/utils/safeAstrology.ts');
  if (fs.existsSync(safeAstrologyPath)) {
    let content = fs.readFileSync(safeAstrologyPath, 'utf8');
    
    // Fix import from alchemy types
    content = content.replace(
      /from\s+["']@\/types\/\(alchemy \|\| 1\)["']/g,
      "from '@/types/alchemy'"
    );
    
    // Fix logger import
    content = content.replace(
      /import @\/utils\s+from\s+['"]logger\s+['"];/g,
      "import { logger } from '@/utils/logger';"
    );
    
    // Remove any createLogger reference if it doesn't exist
    content = content.replace(
      /const logger = createLogger\('SafeAstrology'\);/g,
      "// Using imported logger"
    );
    
    fs.writeFileSync(safeAstrologyPath, content);
    console.log('✅ Fixed safeAstrology.ts');
  }
  
  // Fix AstrologicalService.ts
  const astrologyServicePath = path.join(process.cwd(), 'src/services/AstrologicalService.ts');
  if (fs.existsSync(astrologyServicePath)) {
    let content = fs.readFileSync(astrologyServicePath, 'utf8');
    
    // Fix logger import
    content = content.replace(
      /from\s+['"]\.\.\/utils\/\(logger \|\| 1\)['"]/g,
      "from '../utils/logger'"
    );
    
    fs.writeFileSync(astrologyServicePath, content);
    console.log('✅ Fixed AstrologicalService.ts');
  }
  
  return true;
}

// Create missing files
function createMissingFiles() {
  console.log('Creating missing files...');
  
  // 1. Create theme utils
  const utilsDir = path.join(process.cwd(), 'src/utils');
  if (!fs.existsSync(utilsDir)) {
    fs.mkdirSync(utilsDir, { recursive: true });
  }
  
  const themePath = path.join(utilsDir, 'theme.ts');
  if (!fs.existsSync(themePath)) {
    const themeContent = `// Theme utilities
export type Theme = 'light' | 'dark' | 'system';

/**
 * Get system theme preference
 */
export function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/**
 * Apply theme to document
 */
export function applyTheme(theme: Theme) {
  if (typeof window === 'undefined') return;
  
  const effectiveTheme = theme === 'system' ? getSystemTheme() : theme;
  
  if (effectiveTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export default {
  getSystemTheme,
  applyTheme
};`;
    
    fs.writeFileSync(themePath, themeContent);
    console.log('✅ Created theme.ts');
  }
  
  // 2. Create planets data
  const dataDir = path.join(process.cwd(), 'src/data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const planetsPath = path.join(dataDir, 'planets.ts');
  if (!fs.existsSync(planetsPath)) {
    const planetsContent = `// Planetary data
export const planetaryData = {
  Sun: {
    element: 'Fire',
    foodCorrespondences: ['sunflower seeds', 'oranges', 'cinnamon'],
    cookingMethods: ['grilling', 'roasting'],
    governs: ['vitality', 'ego', 'expression']
  },
  Moon: {
    element: 'Water',
    foodCorrespondences: ['milk', 'cucumber', 'melon'],
    cookingMethods: ['steaming', 'poaching'],
    governs: ['emotions', 'intuition', 'nurturing']
  },
  Mercury: {
    element: 'Air',
    foodCorrespondences: ['nuts', 'beans', 'herbs'],
    cookingMethods: ['quick sautéing', 'stir-frying'],
    governs: ['communication', 'intellect', 'perception']
  },
  Venus: {
    element: 'Earth',
    foodCorrespondences: ['apples', 'berries', 'chocolate'],
    cookingMethods: ['baking', 'confectionery'],
    governs: ['love', 'beauty', 'harmony']
  },
  Mars: {
    element: 'Fire',
    foodCorrespondences: ['red meat', 'spicy foods', 'garlic'],
    cookingMethods: ['grilling', 'high-heat cooking'],
    governs: ['energy', 'passion', 'action']
  },
  Jupiter: {
    element: 'Fire',
    foodCorrespondences: ['fruits', 'honey', 'nutmeg'],
    cookingMethods: ['roasting', 'slow cooking'],
    governs: ['expansion', 'abundance', 'optimism']
  },
  Saturn: {
    element: 'Earth',
    foodCorrespondences: ['root vegetables', 'grains', 'bitter foods'],
    cookingMethods: ['slow cooking', 'fermenting'],
    governs: ['discipline', 'structure', 'time']
  }
};

export default planetaryData;`;
    
    fs.writeFileSync(planetsPath, planetsContent);
    console.log('✅ Created planets.ts');
  }
  
  return true;
}

// Run all fixes
try {
  fixContextProviders();
  fixRemainingImports();
  createMissingFiles();
  
  console.log('\n🎉 Absolute final issues fixed! Run "yarn build" to check.');
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
} 