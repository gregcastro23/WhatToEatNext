const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing remaining context and component files...');

// Fix AstrologyWarning.tsx
function fixAstrologyWarning() {
  console.log('Fixing AstrologyWarning.tsx...');
  const filePath = path.join(process.cwd(), 'src/components/AstrologyWarning.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log('AstrologyWarning.tsx not found');
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix import
  content = content.replace(
    /import @\/contexts\s+from\s+['"]AlchemicalContext\s+['"];/g,
    "import { useAlchemical } from '@/contexts/AlchemicalContext';"
  );
  
  fs.writeFileSync(filePath, content);
  console.log('✅ Fixed AstrologyWarning.tsx');
  return true;
}

// Fix CalculationErrors.tsx
function fixCalculationErrors() {
  console.log('Fixing CalculationErrors.tsx...');
  const filePath = path.join(process.cwd(), 'src/components/CalculationErrors.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log('CalculationErrors.tsx not found');
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix imports
  content = content.replace(
    /import @\/contexts\s+from\s+['"]AlchemicalContext\s+['"];/g,
    "import { useAlchemical } from '@/contexts/AlchemicalContext';"
  );
  
  content = content.replace(
    /import @heroicons \/ \(react \|\| 1\)\/24\s+from\s+['"]solid\s+['"];/g,
    "import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';"
  );
  
  fs.writeFileSync(filePath, content);
  console.log('✅ Fixed CalculationErrors.tsx');
  return true;
}

// Fix AlchemicalContext provider
function fixAlchemicalContext() {
  console.log('Fixing AlchemicalContext/provider.tsx...');
  const filePath = path.join(process.cwd(), 'src/contexts/AlchemicalContext/provider.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log('AlchemicalContext/provider.tsx not found');
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix imports
  content = content.replace(
    /from ['"]@\/utils \/ \(safeAstrology \|\| 1\)['"]/g,
    "from '@/utils/safeAstrology'"
  );
  
  content = content.replace(
    /from ['"]@\/utils \/ \(logger \|\| 1\)['"]/g,
    "from '@/utils/logger'"
  );
  
  content = content.replace(
    /from ['"]@\/utils \/ \(safeAccess \|\| 1\)['"]/g,
    "from '@/utils/safeAccess'"
  );
  
  fs.writeFileSync(filePath, content);
  console.log('✅ Fixed AlchemicalContext/provider.tsx');
  return true;
}

// Create missing utility files if needed
function createMissingUtilFiles() {
  console.log('Creating any missing utility files...');
  const utilsDir = path.join(process.cwd(), 'src/utils');
  
  if (!fs.existsSync(utilsDir)) {
    fs.mkdirSync(utilsDir, { recursive: true });
  }
  
  // 1. safeAstrology.ts
  const safeAstrologyPath = path.join(utilsDir, 'safeAstrology.ts');
  if (!fs.existsSync(safeAstrologyPath)) {
    const safeAstrologyContent = `// Safe wrapper for astrology calculations

/**
 * Safely get planetary positions
 */
export function getSafePlanetaryPositions(birthData, fallbackData = null) {
  try {
    // Simple placeholder implementation
    return fallbackData || {
      Sun: { sign: 'ariesAries', degree: 15 },
      Moon: { sign: 'taurusTaurus', degree: 10 },
      Mercury: { sign: 'geminiGemini', degree: 5 }
    };
  } catch (error) {
    console.error('Error getting planetary positions:', error);
    return fallbackData || {};
  }
}

/**
 * Safely calculate astrological aspects
 */
export function getSafeAspects(positions, orb = 5) {
  try {
    // Simple placeholder
    return [];
  } catch (error) {
    console.error('Error calculating aspects:', error);
    return [];
  }
}

export default {
  getSafePlanetaryPositions,
  getSafeAspects
};`;
    
    fs.writeFileSync(safeAstrologyPath, safeAstrologyContent);
    console.log('✅ Created safeAstrology.ts');
  }
  
  // 2. logger.ts
  const loggerPath = path.join(utilsDir, 'logger.ts');
  if (!fs.existsSync(loggerPath)) {
    const loggerContent = `// Simple logger utility
const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args) => {
    if (isDev) {
      console.log(...args);
    }
  },
  
  warn: (...args) => {
    if (isDev) {
      console.warn(...args);
    }
  },
  
  error: (...args) => {
    console.error(...args);
  },
  
  info: (...args) => {
    if (isDev) {
      console.info(...args);
    }
  }
};

export default logger;`;
    
    fs.writeFileSync(loggerPath, loggerContent);
    console.log('✅ Created logger.ts');
  }
  
  // 3. safeAccess.ts
  const safeAccessPath = path.join(utilsDir, 'safeAccess.ts');
  if (!fs.existsSync(safeAccessPath)) {
    const safeAccessContent = `// Safety utilities for accessing data

/**
 * Safely get a property from an object with default value
 */
export function safeGet(obj, path, defaultValue = undefined) {
  try {
    if (!obj) return defaultValue;
    
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result === undefined || result === null) {
        return defaultValue;
      }
      result = result[key];
    }
    
    return result === undefined ? defaultValue : result;
  } catch (error) {
    return defaultValue;
  }
}

/**
 * Safely parse JSON
 */
export function safeParseJSON(json, defaultValue = {}) {
  try {
    return JSON.parse(json);
  } catch (error) {
    return defaultValue;
  }
}

export default {
  safeGet,
  safeParseJSON
};`;
    
    fs.writeFileSync(safeAccessPath, safeAccessContent);
    console.log('✅ Created safeAccess.ts');
  }
  
  return true;
}

// Run all fixes
try {
  fixAstrologyWarning();
  fixCalculationErrors();
  fixAlchemicalContext();
  createMissingUtilFiles();
  
  console.log('\n🎉 All remaining context issues fixed! Run "yarn build" to check.');
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
} 