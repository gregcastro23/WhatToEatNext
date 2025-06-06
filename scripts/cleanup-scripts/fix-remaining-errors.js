const fs = require('fs');
const path = require('path');

console.log('🔧 Starting final error fixes...');

// Function to verify the JSX in IngredientRecommender.tsx
function fixIngredientRecommenderJSX() {
  console.log('Fixing JSX in IngredientRecommender.tsx...');
  const filePath = path.join(process.cwd(), 'src/components/IngredientRecommender.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log('IngredientRecommender.tsx not found');
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Update ErrorBoundary with curly braces
  const hasErrorBoundaryImport = content.includes('import ErrorBoundary') || content.includes('import { ErrorBoundary }');
  
  // Add the ErrorBoundary component locally if it's not imported
  if (!hasErrorBoundaryImport) {
    // Add a simple inline ErrorBoundary component
    content = `import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
    
// Simple error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="error-boundary">Something went wrong. Please try again.</div>;
    }
    return this.props.children;
  }
}

${content.replace(/import React[^;]*;/g, '')}`;
  }
  
  fs.writeFileSync(filePath, content);
  console.log('✅ Fixed JSX in IngredientRecommender.tsx');
  return true;
}

// Fix elementalUtils.ts syntax errors
function fixElementalUtilsMore() {
  console.log('Fixing elementalUtils.ts more thoroughly...');
  const filePath = path.join(process.cwd(), 'src/utils/elementalUtils.ts');
  
  if (!fs.existsSync(filePath)) {
    console.log('elementalUtils.ts not found');
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace the entire heat calculation with a fixed version
  const heatPattern = /let heat =[\s\S]*?2\s*\);/g;
  const heatReplacement = `const heat =
      (Math.pow(safeValue(boostedSpirit), 2) + Math.pow(safeValue(fire), 2)) / 
      Math.pow(safeValue(boostedSubstance + boostedEssence + boostedMatter + water + Air + earth), 2);`;
  
  content = content.replace(heatPattern, heatReplacement);
  
  // Fix any other Math.pow issues similarly
  content = content.replace(
    /let entropy =[\s\S]*?2\s*\);/g,
    `const entropy =
      (Math.pow(safeValue(boostedSpirit), 2) + Math.pow(safeValue(boostedSubstance), 2) + 
      Math.pow(safeValue(fire), 2) + Math.pow(safeValue(Air), 2)) / 
      Math.pow(safeValue(boostedEssence + boostedMatter + earth + water), 2);`
  );
  
  content = content.replace(
    /let reactivity =[\s\S]*?2\s*\);/g,
    `const reactivity =
      (Math.pow(safeValue(boostedSpirit), 2) + Math.pow(safeValue(boostedSubstance), 2) + 
      Math.pow(safeValue(boostedEssence), 2) + Math.pow(safeValue(fire), 2) + 
      Math.pow(safeValue(Air), 2) + Math.pow(safeValue(water), 2)) / 
      Math.pow(safeValue(boostedMatter + earth), 2);`
  );
  
  // Write changes back to file
  fs.writeFileSync(filePath, content);
  console.log('✅ Fixed elementalUtils.ts thoroughly');
  return true;
}

// Fix remaining import path errors
function fixRemainingImportPaths() {
  console.log('Fixing remaining import path errors...');
  const filesToCheck = [
    'src/utils/alchemicalPillarUtils.ts',
    'src/utils/ingredientUtils.ts',
    'src/utils/lunarUtils.ts'
  ];
  
  const fixedCount = 0;
  
  filesToCheck.forEach(relPath => {
    const filePath = path.join(process.cwd(), relPath);
    if (!fs.existsSync(filePath)) {
      console.log(`${relPath} not found`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix problematic imports with specific replacements for each file
    
    if (relPath === 'src/utils/alchemicalPillarUtils.ts') {
      content = content.replace(
        /from\s+['"]\.\.\/(constants \/ \(alchemicalPillars \|\| 1\))['"]/g,
        "from '../constants/alchemicalPillars'"
      );
    }
    
    if (relPath === 'src/utils/ingredientUtils.ts') {
      content = content.replace(
        /from\s+['"]@\/data \/ \(ingredients \|\| 1\) \/ \(types \|\| 1\)['"]/g,
        "from '@/data/ingredients/types'"
      );
      
      content = content.replace(
        /import @\/types\s+from\s+['"]alchemy\s+['"];/g,
        "import { ElementalProperties } from '@/types/alchemy';"
      );
    }
    
    if (relPath === 'src/utils/lunarUtils.ts') {
      content = content.replace(
        /import \.\.\/([\w\/]+)\s+from\s+['"]([^'"]+)['"]/g,
        "import { LunarPhase } from '../types/alchemy'"
      );
    }
    
    // Write changes
    fs.writeFileSync(filePath, content);
    fixedCount++;
    console.log(`✅ Fixed ${relPath}`);
  });
  
  console.log(`Fixed import paths in ${fixedCount} files`);
  return fixedCount > 0;
}

// Run all fixes
try {
  // First fix remaining import paths since they're likely causing most issues
  const importsFixed = fixRemainingImportPaths();
  
  // Then fix the elementalUtils.ts formulas
  const elementalUtilsFixed = fixElementalUtilsMore();
  
  // Finally, fix the JSX
  const jsxFixed = fixIngredientRecommenderJSX();
  
  if (importsFixed || elementalUtilsFixed || jsxFixed) {
    console.log('\n🎉 Final errors fixed! Run "yarn build" to check the results.');
  } else {
    console.log('\n⚠️ No changes made. Issues may require manual inspection.');
  }
} catch (error) {
  console.error(`❌ Error fixing syntax: ${error.message}`);
} 