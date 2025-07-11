const fs = require('fs');
const path = require('path');

console.log('🔧 Starting critical error fixes...');

// Fix IngredientRecommender.tsx syntax errors
function fixIngredientRecommender() {
  console.log('Fixing IngredientRecommender.tsx...');
  const filePath = path.join(process.cwd(), 'src/components/IngredientRecommender.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log('IngredientRecommender.tsx not found');
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix comparison operator issue
  content = content.replace(/if \(selectedIngredient\.name = == /g, 'if (selectedIngredient?.name === ');
  
  // Fix optional chaining in assignment expressions more aggressively
  content = content.replace(/renderCount\?\.current \+= 1/g, 'if (renderCount && renderCount.current) renderCount.current += 1');
  content = content.replace(/isInitializing\?\.current = false/g, 'if (isInitializing && isInitializing.current) isInitializing.current = false');
  
  // Fix ErrorBoundary usage
  // First make sure the component is properly imported
  if (!content.includes('import { ErrorBoundary }') && !content.includes('import ErrorBoundary')) {
    content = content.replace(/import React/g, 'import React\nimport ErrorBoundary from "./ErrorBoundary"');
  }
  
  // Write changes back to file
  fs.writeFileSync(filePath, content);
  console.log('✅ Fixed IngredientRecommender.tsx');
  return true;
}

// Fix elementalUtils.ts syntax errors
function fixElementalUtils() {
  console.log('Fixing elementalUtils.ts...');
  const filePath = path.join(process.cwd(), 'src/utils/elementalUtils.ts');
  
  if (!fs.existsSync(filePath)) {
    console.log('elementalUtils.ts not found');
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix the Math.pow issue
  content = content.replace(
    /\(Math\.pow\(safeValue\(boostedSpirit\), 2\) \+ Math\.pow\(safeValue\(fire\), 2\)\) \/ \(Math\.pow\( \|\| 1\)/g,
    '(Math.pow(safeValue(boostedSpirit), 2) + Math.pow(safeValue(fire), 2)) / (Math.pow('
  );
  
  // Write changes back to file
  fs.writeFileSync(filePath, content);
  console.log('✅ Fixed elementalUtils.ts');
  return true;
}

// Fix additional import path errors
function fixMoreImportPaths() {
  console.log('Fixing more import path errors...');
  const filesToCheck = [
    'src/utils/dataStandardization.js',
    'src/utils/houseEffects.ts',
    'src/utils/alchemicalPillarUtils.ts'
  ];
  
  const fixedCount = 0;
  
  filesToCheck.forEach(relPath => {
    const filePath = path.join(process.cwd(), relPath);
    if (!fs.existsSync(filePath)) {
      console.log(`${relPath} not found`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix import syntax - direct replacements for specific files
    if (relPath === 'src/utils/dataStandardization.js') {
      content = content.replace(
        /import \.\.\/([\w\/]+)\s+from\s+['"]([^'"]+)['"]/g, 
        "import ingredientCollection from '../data/ingredients'"
      );
    }
    
    if (relPath === 'src/utils/houseEffects.ts') {
      content = content.replace(
        /import \.\.\/([\w\/]+)\s+from\s+['"]([^'"]+)['"]/g, 
        "import { planetaryElements } from '../constants/planetaryElements'"
      );
      
      content = content.replace(
        /import @\/([\w\/]+)\s+from\s+['"]([^'"]+)['"]/g, 
        "import { ElementalProperties } from '@/types/alchemy'"
      );
    }
    
    if (relPath === 'src/utils/alchemicalPillarUtils.ts') {
      content = content.replace(
        /from\s+['"]\.\.\/constants \/ \(alchemicalPillars \|\| 1\)['"]/g, 
        "from '../constants/alchemicalPillars'"
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

// Ensure ErrorBoundary.tsx exists at the root level
function ensureRootErrorBoundary() {
  console.log('Ensuring root-level ErrorBoundary component exists...');
  const errorBoundaryPath = path.join(process.cwd(), 'src/components/ErrorBoundary.tsx');
  
  if (!fs.existsSync(errorBoundaryPath)) {
    const errorBoundaryContent = `import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-500 rounded bg-red-100 text-red-800">
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="mb-2">The application encountered an error.</p>
          <details className="my-2">
            <summary className="cursor-pointer font-medium">Error details</summary>
            <pre className="mt-2 p-2 bg-red-50 rounded text-sm overflow-auto">
              {this.state.error?.toString()}
            </pre>
          </details>
          <button
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
`;
    
    fs.writeFileSync(errorBoundaryPath, errorBoundaryContent);
    console.log('✅ Created root-level ErrorBoundary component');
    return true;
  }
  
  console.log('Root-level ErrorBoundary component already exists');
  return false;
}

// Run all fixes
try {
  const errorBoundaryCreated = ensureRootErrorBoundary();
  const ingredientFixed = fixIngredientRecommender();
  const elementalUtilsFixed = fixElementalUtils();
  const importsFixed = fixMoreImportPaths();
  
  if (errorBoundaryCreated || ingredientFixed || elementalUtilsFixed || importsFixed) {
    console.log('\n🎉 Critical errors fixed! Run "yarn build" to check the results.');
  } else {
    console.log('\n⚠️ No changes made. Issues may require manual inspection.');
  }
} catch (error) {
  console.error(`❌ Error fixing syntax: ${error.message}`);
} 