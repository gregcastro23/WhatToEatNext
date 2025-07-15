import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Analyze scripts to determine their utility and whether they should be kept or deleted
const SCRIPT_ANALYSIS = {
  // Scripts that are likely obsolete (data update scripts from specific API calls)
  OBSOLETE: [
    'updateFruits.ts',
    'updateGrains.ts', 
    'updateHerbs.ts',
    'updateOils.ts',
    'updateProteins.ts',
    'updateSpices.ts',
    'updateVinegars.ts',
    'updateVegetables.ts',
    'updateOilsAndVinegars.ts',
    'updateAllIngredients.ts',
    'updateIngredientCategory.ts',
    'fix-nutritional-types.ts', // Likely one-time fix
  ],
  
  // Scripts that might be useful to keep
  POTENTIALLY_USEFUL: [
    'fixIngredientMappings.ts',
    'fixTypeInconsistencies.ts',
    'updateCookingMethodTypes.ts',
    'updateLunarPhaseModifiers.ts',
    'fixZodiacSignLiterals.ts',
    'fix-unused-vars.ts',
  ],
  
  // Scripts that are definitely useful (generic tools)
  KEEP: [
    'fix-ingredient-type.ts',
    'fix-planetary-types.ts', 
    'fix-promise-awaits.ts',
    'fix-season-types.ts',
  ]
};

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function getFileStats(filePath) {
  try {
    const stats = await fs.stat(filePath);
    const content = await fs.readFile(filePath, 'utf8');
    
    return {
      size: stats.size,
      lines: content.split('\n').length,
      lastModified: stats.mtime,
      containsApiCalls: /fetch|axios|http|api/i.test(content),
      containsSpoonacular: /spoonacular/i.test(content),
      containsUpdateLogic: /update.*ingredient|ingredient.*update/i.test(content),
      isOneTimeScript: /one.time|temporary|temp/i.test(content)
    };
  } catch {
    return null;
  }
}

async function analyzeScript(filePath) {
  const fileName = path.basename(filePath);
  const stats = await getFileStats(filePath);
  
  if (!stats) {
    return { category: 'ERROR', reason: 'Cannot read file' };
  }
  
  // Check explicit categorization first
  for (const [category, scripts] of Object.entries(SCRIPT_ANALYSIS)) {
    if (scripts.includes(fileName)) {
      return { category, reason: 'Explicitly categorized', stats };
    }
  }
  
  // Analyze based on content patterns
  if (stats.containsApiCalls || stats.containsSpoonacular) {
    return { 
      category: 'OBSOLETE', 
      reason: 'Contains API calls - likely one-time data fetch',
      stats 
    };
  }
  
  if (stats.containsUpdateLogic && stats.size > 20000) {
    return { 
      category: 'OBSOLETE', 
      reason: 'Large update script - likely one-time data migration',
      stats 
    };
  }
  
  if (fileName.startsWith('update') && fileName.includes('Ingredient')) {
    return { 
      category: 'OBSOLETE', 
      reason: 'Ingredient update script - likely one-time use',
      stats 
    };
  }
  
  return { 
    category: 'POTENTIALLY_USEFUL', 
    reason: 'Default - needs manual review',
    stats 
  };
}

async function getAllTsFiles() {
  const tsFiles = [];
  const scriptsDirs = [
    'scripts/ingredient-scripts',
    'scripts/typescript-fixes', 
    'scripts/syntax-fixes',
    'scripts/uncategorized'
  ];
  
  for (const dir of scriptsDirs) {
    const dirPath = path.resolve(ROOT_DIR, dir);
    
    if (await fileExists(dirPath)) {
      const files = await fs.readdir(dirPath);
      const dirTsFiles = files
        .filter(f => f.endsWith('.ts'))
        .map(f => path.resolve(dirPath, f));
      
      tsFiles.push(...dirTsFiles);
    }
  }
  
  return tsFiles;
}

async function main() {
  console.log('🔍 Analyzing script utility...\n');
  
  try {
    const tsFiles = await getAllTsFiles();
    
    const analysis = {
      OBSOLETE: [],
      POTENTIALLY_USEFUL: [],
      KEEP: [],
      ERROR: []
    };
    
    for (const filePath of tsFiles) {
      const relativePath = path.relative(ROOT_DIR, filePath);
      const result = await analyzeScript(filePath);
      
      analysis[result.category].push({
        path: relativePath,
        reason: result.reason,
        stats: result.stats
      });
    }
    
    // Print analysis results
    console.log('📊 ANALYSIS RESULTS:\n');
    
    console.log('❌ OBSOLETE (recommend deletion):');
    analysis.OBSOLETE.forEach(item => {
      console.log(`  ${item.path}`);
      console.log(`    Reason: ${item.reason}`);
      if (item.stats) {
        console.log(`    Size: ${(item.stats.size / 1024).toFixed(1)}KB, Lines: ${item.stats.lines}`);
      }
      console.log('');
    });
    
    console.log('⚠️  POTENTIALLY USEFUL (review needed):');
    analysis.POTENTIALLY_USEFUL.forEach(item => {
      console.log(`  ${item.path}`);
      console.log(`    Reason: ${item.reason}`);
      if (item.stats) {
        console.log(`    Size: ${(item.stats.size / 1024).toFixed(1)}KB, Lines: ${item.stats.lines}`);
      }
      console.log('');
    });
    
    console.log('✅ KEEP (useful tools):');
    analysis.KEEP.forEach(item => {
      console.log(`  ${item.path}`);
      console.log(`    Reason: ${item.reason}`);
      if (item.stats) {
        console.log(`    Size: ${(item.stats.size / 1024).toFixed(1)}KB, Lines: ${item.stats.lines}`);
      }
      console.log('');
    });
    
    if (analysis.ERROR.length > 0) {
      console.log('❗ ERRORS:');
      analysis.ERROR.forEach(item => {
        console.log(`  ${item.path}: ${item.reason}`);
      });
      console.log('');
    }
    
    console.log('📈 SUMMARY:');
    console.log(`  Total files: ${tsFiles.length}`);
    console.log(`  Recommend deletion: ${analysis.OBSOLETE.length}`);
    console.log(`  Need review: ${analysis.POTENTIALLY_USEFUL.length}`);
    console.log(`  Keep: ${analysis.KEEP.length}`);
    
    const totalObsoleteSize = analysis.OBSOLETE.reduce((sum, item) => 
      sum + (item.stats ? item.stats.size : 0), 0);
    console.log(`  Size saved by deletion: ${(totalObsoleteSize / 1024).toFixed(1)}KB`);
    
  } catch (error) {
    console.error('❌ Error during analysis:', error);
    process.exit(1);
  }
}

main(); 