const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing final context provider issues...');

// Fix AlchemicalContext/provider.tsx more imports
function fixAlchemicalContextFurther() {
  console.log('Further fixing AlchemicalContext/provider.tsx...');
  const filePath = path.join(process.cwd(), 'src/contexts/AlchemicalContext/provider.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log('AlchemicalContext/provider.tsx not found');
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix more imports
  content = content.replace(
    /from ['"]@\/services \/ \(errorHandler \|\| 1\)['"]/g,
    "from '@/services/errorHandler'"
  );
  
  content = content.replace(
    /from ['"]@\/utils \/ \(alchemicalCalculations \|\| 1\)['"]/g,
    "from '@/utils/alchemicalCalculations'"
  );
  
  fs.writeFileSync(filePath, content);
  console.log('✅ Further fixed AlchemicalContext/provider.tsx');
  return true;
}

// Fix ChartContext/provider.tsx
function fixChartContextProvider() {
  console.log('Fixing ChartContext/provider.tsx...');
  const filePath = path.join(process.cwd(), 'src/contexts/ChartContext/provider.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log('ChartContext/provider.tsx not found');
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix imports
  content = content.replace(
    /from ['"]@\/utils \/ \(astrologyUtils \|\| 1\)['"]/g,
    "from '@/utils/astrologyUtils'"
  );
  
  content = content.replace(
    /from ['"]@\/data \/ \(integrations \|\| 1\) \/ \(seasonal \|\| 1\)['"]/g,
    "from '@/data/integrations/seasonal'"
  );
  
  content = content.replace(
    /from ['"]@\/contexts \/ \(AlchemicalContext \|\| 1\) \/ \(hooks \|\| 1\)['"]/g,
    "from '@/contexts/AlchemicalContext/hooks'"
  );
  
  fs.writeFileSync(filePath, content);
  console.log('✅ Fixed ChartContext/provider.tsx');
  return true;
}

// Create required placeholder files
function createMissingServiceFiles() {
  console.log('Creating missing service and utility files...');
  
  // 1. Create errorHandler service
  const servicesDir = path.join(process.cwd(), 'src/services');
  if (!fs.existsSync(servicesDir)) {
    fs.mkdirSync(servicesDir, { recursive: true });
  }
  
  const errorHandlerPath = path.join(servicesDir, 'errorHandler.ts');
  if (!fs.existsSync(errorHandlerPath)) {
    const errorHandlerContent = `// Basic error handling service

/**
 * Log error to service
 */
export function logError(error, context = {}) {
  console.error('Application error:', error, context);
}

/**
 * Formats an error for display
 */
export function formatError(error) {
  if (!error) return 'Unknown error';
  
  return {
    message: error.message || 'An error occurred',
    code: error.code || 'UNKNOWN_ERROR',
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  };
}

/**
 * Handle error with recovery options
 */
export function handleError(error, recovery = () => {}) {
  logError(error);
  
  // Attempt recovery
  try {
    recovery();
  } catch (recoveryError) {
    logError(recoveryError, { context: 'Recovery attempt failed' });
  }
}

export default {
  logError,
  formatError,
  handleError
};`;
    
    fs.writeFileSync(errorHandlerPath, errorHandlerContent);
    console.log('✅ Created errorHandler.ts');
  }
  
  // 2. Create alchemicalCalculations utility
  const utilsDir = path.join(process.cwd(), 'src/utils');
  if (!fs.existsSync(utilsDir)) {
    fs.mkdirSync(utilsDir, { recursive: true });
  }
  
  const alchemicalCalculationsPath = path.join(utilsDir, 'alchemicalCalculations.ts');
  if (!fs.existsSync(alchemicalCalculationsPath)) {
    const alchemicalCalculationsContent = `// Basic alchemical calculations
import { ElementalProperties } from '@/types/alchemy';

/**
 * Calculate elemental balance
 */
export function calculateElementalBalance(elements: Partial<ElementalProperties> = {}) {
  const total = Object.values(elements).reduce((sum, val) => sum + (val || 0), 0) || 1;
  
  return {
    Fire: (elements.Fire || 0) / total,
    Water: (elements.Water || 0) / total,
    Air: (elements.Air || 0) / total,
    Earth: (elements.Earth || 0) / total
  };
}

/**
 * Calculate heat property
 */
export function calculateHeat(elements: Partial<ElementalProperties> = {}) {
  const fire = elements.Fire || 0;
  const air = elements.Air || 0;
  
  return (fire * 0.7) + (air * 0.3);
}

export default {
  calculateElementalBalance,
  calculateHeat
};`;
    
    fs.writeFileSync(alchemicalCalculationsPath, alchemicalCalculationsContent);
    console.log('✅ Created alchemicalCalculations.ts');
  }
  
  // 3. Create AlchemicalContext hooks
  const alchemicalContextDir = path.join(process.cwd(), 'src/contexts/AlchemicalContext');
  if (!fs.existsSync(alchemicalContextDir)) {
    fs.mkdirSync(alchemicalContextDir, { recursive: true });
  }
  
  const alchemicalHooksPath = path.join(alchemicalContextDir, 'hooks.ts');
  if (!fs.existsSync(alchemicalHooksPath)) {
    const alchemicalHooksContent = `// Hooks for AlchemicalContext
import { useContext } from 'react';
import { AlchemicalContext } from './context';

/**
 * Hook to get alchemical state
 */
export function useAlchemicalState() {
  const context = useContext(AlchemicalContext);
  
  if (context === undefined) {
    throw new Error('useAlchemicalState must be used within an AlchemicalProvider');
  }
  
  return context.state;
}

/**
 * Hook to get alchemical dispatch
 */
export function useAlchemicalDispatch() {
  const context = useContext(AlchemicalContext);
  
  if (context === undefined) {
    throw new Error('useAlchemicalDispatch must be used within an AlchemicalProvider');
  }
  
  return context.dispatch;
}

export default {
  useAlchemicalState,
  useAlchemicalDispatch
};`;
    
    fs.writeFileSync(alchemicalHooksPath, alchemicalHooksContent);
    console.log('✅ Created AlchemicalContext/hooks.ts');
  }
  
  // 4. Create seasonal integration data
  const integrationsDir = path.join(process.cwd(), 'src/data/integrations');
  if (!fs.existsSync(integrationsDir)) {
    fs.mkdirSync(integrationsDir, { recursive: true });
  }
  
  const seasonalPath = path.join(integrationsDir, 'seasonal.ts');
  if (!fs.existsSync(seasonalPath)) {
    const seasonalContent = `// Seasonal data and integrations
export const seasonalCycles = {
  spring: {
    startMonth: 2, // March
    endMonth: 4, // May
    element: 'Air',
    foods: ['asparagus', 'peas', 'strawberries']
  },
  summer: {
    startMonth: 5, // June
    endMonth: 7, // August
    element: 'Fire',
    foods: ['tomatoes', 'corn', 'berries']
  },
  autumn: {
    startMonth: 8, // September
    endMonth: 10, // November
    element: 'Earth',
    foods: ['apples', 'pumpkin', 'squash']
  },
  winter: {
    startMonth: 11, // December
    endMonth: 1, // February
    element: 'Water',
    foods: ['citrus', 'root vegetables', 'cabbage']
  }
};

/**
 * Get current season
 */
export function getCurrentSeason() {
  const now = new Date();
  const month = now.getMonth();
  
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

export default {
  seasonalCycles,
  getCurrentSeason
};`;
    
    fs.writeFileSync(seasonalPath, seasonalContent);
    console.log('✅ Created integrations/seasonal.ts');
  }
  
  return true;
}

// Run all fixes
try {
  fixAlchemicalContextFurther();
  fixChartContextProvider();
  createMissingServiceFiles();
  
  console.log('\n🎉 All final context issues fixed! Run "yarn build" to check.');
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
} 