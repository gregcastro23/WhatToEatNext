#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');

const DRY_RUN = process.argv.includes('--dry-run');

console.log('🔧 Fixing remaining critical TypeScript errors...');
console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLYING CHANGES'}`);

const fixes = [
  {
    file: 'src/components/errors/GlobalErrorBoundary.tsx',
    content: `import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div role="alert" className="error-boundary">
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

export function GlobalErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Global error:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

export default GlobalErrorBoundary;
`
  },
  
  {
    file: 'src/components/errors/ErrorDisplay.tsx',
    content: `import React from 'react';

interface ErrorDisplayProps {
  error: Error | string;
  title?: string;
  showDetails?: boolean;
}

export function ErrorDisplay({ 
  error, 
  title = 'An error occurred', 
  showDetails = false 
}: ErrorDisplayProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  return (
    <div className="error-display">
      <h3>{title}</h3>
      <p>{errorMessage}</p>
      {showDetails && typeof error === 'object' && (
        <details>
          <summary>Error Details</summary>
          <pre>{error.stack}</pre>
        </details>
      )}
    </div>
  );
}

export default ErrorDisplay;
`
  },
  
  {
    file: 'src/types/unified.ts',
    content: `// Unified types for the application
import type { ElementalProperties, AlchemicalProperties } from './alchemy';
import type { Season, Element } from './shared';

export interface UnifiedIngredient {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  elementalProperties: ElementalProperties;
  alchemicalProperties?: AlchemicalProperties;
  nutritionalProfile?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    vitamins?: Record<string, number>;
    minerals?: Record<string, number>;
  };
  season?: Season[];
  qualities?: string[];
  description?: string;
  cookingMethods?: string[];
  flavorProfile?: {
    sweet?: number;
    sour?: number;
    salty?: number;
    bitter?: number;
    umami?: number;
    spicy?: number;
  };
  origin?: string[];
  sustainabilityScore?: number;
  storageInstructions?: string;
  preparationTips?: string[];
}

export interface UnifiedRecipe {
  id: string;
  name: string;
  description: string;
  ingredients: Array<{
    ingredient: UnifiedIngredient;
    amount: string;
    preparation?: string;
  }>;
  instructions: string[];
  cookingTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine: string;
  mealType: string[];
  elementalProperties: ElementalProperties;
  nutritionalProfile: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  tags?: string[];
}

export type { UnifiedIngredient as default };
`
  },
  
  {
    file: 'src/types/ingredients.ts',
    content: `// Ingredient types
import type { ElementalProperties } from './alchemy';
import type { Season } from './shared';

export interface IngredientCategory {
  id: string;
  name: string;
  description: string;
  elementalAffinity: ElementalProperties;
}

export interface IngredientRecommendation {
  ingredient: {
    id: string;
    name: string;
    category: string;
    elementalProperties: ElementalProperties;
  };
  matchScore: number;
  reason: string;
  category: string;
}

export { Season, type ElementalProperties };
`
  },
  
  {
    file: 'src/types/common.ts',
    content: `// Common types used across the application
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export type ZodiacSign = 
  | 'aries' | 'taurus' | 'gemini' | 'cancer'
  | 'leo' | 'virgo' | 'libra' | 'scorpio'
  | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

export interface PlanetaryAlignment {
  Sun: string;
  Moon: string;
  Mercury: string;
  Venus: string;
  Mars: string;
  Jupiter: string;
  Saturn: string;
  Uranus: string;
  Neptune: string;
  Pluto: string;
  Ascendant?: string;
}

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
`
  },
  
  {
    file: 'src/components/Recipe/index.tsx',
    content: `import React from 'react';
import type { Recipe } from '@/types/recipe';

interface RecipeComponentProps {
  recipe: Recipe;
  showDetails?: boolean;
}

export default function RecipeComponent({ recipe, showDetails = true }: RecipeComponentProps) {
  return (
    <div className="recipe-component">
      <h2>{recipe.name}</h2>
      <p>{recipe.description}</p>
      
      {showDetails && (
        <div className="recipe-details">
          <div className="ingredients">
            <h3>Ingredients</h3>
            <ul>
              {recipe.ingredients?.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>
          
          <div className="instructions">
            <h3>Instructions</h3>
            <ol>
              {recipe.instructions?.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
          </div>
          
          {recipe.nutrition && (
            <div className="nutrition">
              <h3>Nutrition</h3>
              <p>Calories: {recipe.nutrition.calories}</p>
              <p>Protein: {recipe.nutrition.protein}g</p>
              <p>Carbs: {recipe.nutrition.carbs}g</p>
              <p>Fat: {recipe.nutrition.fat}g</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
`
  }
];

// Apply fixes
for (const fix of fixes) {
  const filePath = join(projectRoot, fix.file);
  const dirPath = dirname(filePath);
  
  if (DRY_RUN) {
    console.log(`Would create/update: ${fix.file}`);
    continue;
  }
  
  try {
    // Create directory if it doesn't exist
    if (!existsSync(dirPath)) {
      const { mkdirSync } = await import('fs');
      mkdirSync(dirPath, { recursive: true });
    }
    
    writeFileSync(filePath, fix.content);
    console.log(`✅ Created/updated: ${fix.file}`);
  } catch (error) {
    console.error(`❌ Error creating ${fix.file}:`, error.message);
  }
}

console.log(`\n🎉 ${DRY_RUN ? 'Would create' : 'Created'} ${fixes.length} files to fix critical TypeScript errors`); 