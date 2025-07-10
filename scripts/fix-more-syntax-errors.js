const fs = require('fs');
const path = require('path');

console.log('🔧 Starting more targeted syntax error fixes...');

// Fix IngredientRecommender.tsx additional errors
function fixIngredientRecommender() {
  console.log('Fixing IngredientRecommender.tsx...');
  const filePath = path.join(process.cwd(), 'src/components/IngredientRecommender.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log('IngredientRecommender.tsx not found');
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix optional chaining in assignment expressions
  content = content.replace(/(\w+)\?\.([\w.]+)\s*=\s*/g, '$1.$2 = ');
  
  // Fix the specific oils array issue
  content = content.replace(/categories\?\.oils = \[\.\.\.(categories\?\.s.*)\]/g, 
    'if (categories && categories.oils) { categories.oils = [...(categories.oils || []), ...additionalOils].sort');
  
  // Fix ErrorBoundary component issues
  // Check if there's an import for ErrorBoundary
  if (!content.includes('import ErrorBoundary')) {
    // Add import for ErrorBoundary
    content = content.replace(
      /import React/,
      'import React\nimport { ErrorBoundary } from \'./ErrorBoundary\''
    );
  }
  
  // Write changes back to file
  fs.writeFileSync(filePath, content);
  console.log('✅ Fixed IngredientRecommender.tsx');
  return true;
}

// Fix import path errors more thoroughly
function fixImportPaths() {
  console.log('Fixing more import path errors...');
  const filesToCheck = [
    'src/utils/astrologyUtils.ts',
    'src/utils/alchemicalPillarUtils.ts',
    'src/utils/alchemicalTransformationUtils.ts',
    'src/utils/cookingMethodTips.ts'
  ];
  
  const fixedCount = 0;
  
  filesToCheck.forEach(relPath => {
    const filePath = path.join(process.cwd(), relPath);
    if (!fs.existsSync(filePath)) {
      console.log(`${relPath} not found`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Fix broken import paths - much more aggressive strategy
    // Replace all problematic imports with proper syntax
    content = content.replace(/import \.\.\/([\w\/]+)\s+from\s+['"]([^'"]+)['"]/g, 
      'import { $1 } from "../$2"');
    
    content = content.replace(/import @\/([\w\/]+)\s+from\s+['"]([^'"]+)['"]/g, 
      'import { $1 } from "@/$2"');
    
    // Deal with missing calculation imports
    if (relPath === 'src/utils/alchemicalTransformationUtils.ts') {
      content = content.replace(/from\s+['"]\.\.\/(calculations)[^'"]*['"]/g, 
        'from "../calculations/alchemicalTransformation"');
    }
    
    // Fix broken import statements from common patterns
    content = content.replace(/import\s+@\/data\s+from\s+['"]cooking\s+['"];/g, 'import { cookingMethods } from "@/data/cooking";');
    content = content.replace(/import\s+@\/types\s+from\s+['"]time\s+['"];/g, 'import { TimeOfDay } from "@/types/time";');
    content = content.replace(/import\s+@\/utils\s+from\s+['"]dateUtils\s+['"];/g, 'import { formatTime } from "@/utils/dateUtils";');
    content = content.replace(/import\s+@\/lib\s+from\s+['"]PlanetaryHourCalculator\s+['"];/g, 'import { calculatePlanetaryHour } from "@/lib/PlanetaryHourCalculator";');
    
    // Fix celestial and alchemy imports
    content = content.replace(/import\s+\.\.\/types\s+from\s+['"]celestial\s+['"];/g, 'import { CelestialBody, PlanetaryPosition } from "../types/celestial";');
    content = content.replace(/import\s+\.\.\/types\s+from\s+['"]alchemy\s+['"];/g, 'import { AlchemicalProfile, ElementalProperties } from "../types/alchemy";');
    
    // Write changes if the file was modified
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      fixedCount++;
      console.log(`✅ Fixed ${relPath}`);
    }
  });
  
  console.log(`Fixed import paths in ${fixedCount} files`);
  return fixedCount > 0;
}

// Create a basic ErrorBoundary component if it doesn't exist
function ensureErrorBoundaryExists() {
  console.log('Ensuring ErrorBoundary component exists...');
  const errorBoundaryPath = path.join(process.cwd(), 'src/components/ErrorBoundary/index.tsx');
  const errorBoundaryDir = path.dirname(errorBoundaryPath);
  
  if (!fs.existsSync(errorBoundaryDir)) {
    fs.mkdirSync(errorBoundaryDir, { recursive: true });
  }
  
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
    console.log('✅ Created ErrorBoundary component');
    return true;
  }
  
  console.log('ErrorBoundary component already exists');
  return false;
}

// Run all fixes
try {
  const errorBoundaryCreated = ensureErrorBoundaryExists();
  const ingredientFixed = fixIngredientRecommender();
  const importsFixed = fixImportPaths();
  
  if (errorBoundaryCreated || ingredientFixed || importsFixed) {
    console.log('\n🎉 More syntax errors fixed! Run "yarn build" to check the results.');
  } else {
    console.log('\n⚠️ No changes made. Issues may require manual inspection.');
  }
} catch (error) {
  console.error(`❌ Error fixing syntax: ${error.message}`);
} 