#!/usr/bin/env node

/**
 * create-missing-components.js
 * 
 * This script creates missing component files that are referenced in the codebase:
 * - @/components/debug/StateDebugger
 * - @/components/errors/ErrorBoundary
 * - @/components/errors/ErrorFallback
 * - @/components/Recipe/Recipe
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Track if we're in dry run mode
const isDryRun = process.argv.includes('--dry-run');

// Components to create and their content
const componentsToCreate = [
  {
    path: 'src/components/debug/StateDebugger.tsx',
    content: `import React from 'react';

interface StateDebuggerProps {
  state: Record<string, any>;
  title?: string;
  expanded?: boolean;
}

/**
 * StateDebugger component
 * Displays a JSON representation of state for debugging purposes
 */
const StateDebugger: React.FC<StateDebuggerProps> = ({ 
  state, 
  title = 'State Debug',
  expanded = false
}) => {
  const [isExpanded, setIsExpanded] = React.useState(expanded);
  
  return (
    <div className="state-debugger bg-gray-100 p-4 rounded-md mb-4 border border-gray-300">
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-medium text-gray-800">{title}</h3>
        <span className="text-gray-600">
          {isExpanded ? '▼' : '►'}
        </span>
      </div>
      
      {isExpanded && (
        <pre className="mt-3 p-3 bg-gray-800 text-green-400 rounded overflow-auto text-sm">
          {JSON.stringify(state, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default StateDebugger;
`
  },
  {
    path: 'src/components/errors/ErrorBoundary.tsx',
    content: `import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorFallback from './ErrorFallback';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary component
 * Catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI instead of crashing the whole app
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    this.setState({
      errorInfo
    });
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default fallback
      return (
        <ErrorFallback 
          error={this.state.error}
          resetErrorBoundary={() => this.setState({ hasError: false, error: null, errorInfo: null })}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
`
  },
  {
    path: 'src/components/errors/ErrorFallback.tsx',
    content: `import React from 'react';

interface ErrorFallbackProps {
  error: Error | null;
  resetErrorBoundary: () => void;
}

/**
 * ErrorFallback component
 * Displays a user-friendly error message with error details and a reset button
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  return (
    <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-md">
      <h2 className="text-lg font-semibold text-red-800 mb-2">
        Something went wrong
      </h2>
      
      <div className="text-red-700 mb-4">
        {error?.message || 'An unknown error occurred'}
      </div>
      
      {process.env.NODE_ENV !== 'production' && error && (
        <pre className="mt-2 p-3 text-sm bg-red-100 rounded overflow-auto max-h-40">
          {error.stack}
        </pre>
      )}
      
      <button
        onClick={resetErrorBoundary}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        Try again
      </button>
    </div>
  );
};

export default ErrorFallback;
`
  },
  {
    path: 'src/components/Recipe/Recipe.tsx',
    content: `import React from 'react';
import { Recipe as RecipeType } from '@/types/alchemy';

interface RecipeProps {
  recipe: RecipeType;
  isDetailed?: boolean;
}

/**
 * Recipe component
 * Displays a recipe with ingredients, instructions, and nutritional information
 */
const Recipe: React.FC<RecipeProps> = ({ recipe, isDetailed = false }) => {
  if (!recipe) {
    return <div className="p-4 text-red-500">Recipe not found</div>;
  }

  return (
    <div className="recipe-container">
      <div className="recipe-header mb-6">
        <h2 className="text-2xl font-bold mb-2">{recipe.name}</h2>
        {recipe.description && (
          <p className="text-gray-600 mb-4">{recipe.description}</p>
        )}
        
        <div className="recipe-meta flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <span className="mr-2">⏱️</span>
            <span>{recipe.timeToMake} minutes</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">👥</span>
            <span>{recipe.numberOfServings} servings</span>
          </div>
          {recipe.cuisine && (
            <div className="flex items-center">
              <span className="mr-2">🌍</span>
              <span>{recipe.cuisine}</span>
            </div>
          )}
          <div className="flex items-center">
            <span className="mr-2">🍳</span>
            <span>{recipe.cookingMethod}</span>
          </div>
        </div>
      </div>

      <div className="recipe-content flex flex-col md:flex-row gap-8">
        <div className="recipe-ingredients md:w-1/3">
          <h3 className="text-xl font-semibold mb-3">Ingredients</h3>
          <ul className="list-disc pl-5 space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>
                {ingredient.amount} {ingredient.unit} {ingredient.name}
                {isDetailed && ingredient.description && (
                  <span className="text-gray-500 text-sm ml-1">
                    ({ingredient.description})
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {isDetailed && (
          <div className="recipe-instructions md:w-2/3">
            <h3 className="text-xl font-semibold mb-3">Instructions</h3>
            <div className="prose max-w-none">
              {/* Instructions would typically come from recipe data */}
              <p>Instructions not available in the current data model.</p>
            </div>
          </div>
        )}
      </div>

      {isDetailed && recipe.nutrition && (
        <div className="recipe-nutrition mt-8 p-4 bg-gray-50 rounded-md">
          <h3 className="text-xl font-semibold mb-3">Nutritional Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="nutrition-item">
              <span className="block text-gray-500 text-sm">Calories</span>
              <span className="font-medium">{recipe.nutrition.calories} kcal</span>
            </div>
            <div className="nutrition-item">
              <span className="block text-gray-500 text-sm">Protein</span>
              <span className="font-medium">{recipe.nutrition.protein}g</span>
            </div>
            <div className="nutrition-item">
              <span className="block text-gray-500 text-sm">Carbs</span>
              <span className="font-medium">{recipe.nutrition.carbs}g</span>
            </div>
            <div className="nutrition-item">
              <span className="block text-gray-500 text-sm">Fat</span>
              <span className="font-medium">{recipe.nutrition.fat}g</span>
            </div>
          </div>
        </div>
      )}

      {isDetailed && recipe.tags && recipe.tags.length > 0 && (
        <div className="recipe-tags mt-6">
          <h3 className="text-lg font-semibold mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {recipe.tags.map((tag, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {isDetailed && recipe.elementalProperties && (
        <div className="recipe-elemental mt-6">
          <h3 className="text-lg font-semibold mb-2">Elemental Properties</h3>
          <div className="grid grid-cols-4 gap-2">
            <div className="p-2 bg-red-100 rounded text-center">
              <span className="block text-red-800 font-medium">Fire</span>
              <span className="text-sm">{Math.round(recipe.elementalProperties.Fire * 100)}%</span>
            </div>
            <div className="p-2 bg-blue-100 rounded text-center">
              <span className="block text-blue-800 font-medium">water</span>
              <span className="text-sm">{Math.round(recipe.elementalProperties.Water * 100)}%</span>
            </div>
            <div className="p-2 bg-yellow-100 rounded text-center">
              <span className="block text-yellow-800 font-medium">earth</span>
              <span className="text-sm">{Math.round(recipe.elementalProperties.Earth * 100)}%</span>
            </div>
            <div className="p-2 bg-gray-100 rounded text-center">
              <span className="block text-gray-800 font-medium">Air</span>
              <span className="text-sm">{Math.round(recipe.elementalProperties.Air * 100)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recipe;
`
  }
];

// Create directories recursively if they don't exist
function ensureDirectoryExists(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  
  ensureDirectoryExists(dirname);
  fs.mkdirSync(dirname);
}

// Process each component to create
for (const component of componentsToCreate) {
  console.log(`Processing ${component.path}...`);
  
  try {
    const fullPath = path.resolve(process.cwd(), component.path);
    
    // Check if file already exists
    if (fs.existsSync(fullPath)) {
      console.log(`File already exists: ${component.path}, skipping`);
      continue;
    }
    
    if (isDryRun) {
      console.log(`[DRY RUN] Would create ${component.path}`);
    } else {
      // Ensure the directory exists
      ensureDirectoryExists(fullPath);
      
      // Write the file
      fs.writeFileSync(fullPath, component.content, 'utf8');
      console.log(`Created ${component.path}`);
    }
  } catch (error) {
    console.error(`Error creating ${component.path}:`, error);
  }
}

console.log('Component creation completed.'); 