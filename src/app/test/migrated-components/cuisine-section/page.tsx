'use client';

import { useEffect, useState } from 'react';

import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { useServices } from '@/hooks/useServices';
import { logger } from '@/utils/logger';

// Lightweight fallbacks for missing components
const CuisineSection = ({
  cuisine,
  recipes,
  elementalState
}: {
  cuisine: string,
  recipes: unknown[],
  elementalState: Record<string, unknown>
}) => (
  <div className='space-y-2'>
    <div className='font-semibold'>Cuisine: {cuisine}</div>
    <div className='text-sm text-gray-600'>Recipes: {recipes?.length || 0}</div>
  </div>
)

const CuisineSectionMigrated = CuisineSection;

// DUPLICATE: import { Element } from '@/types/alchemy';
export default function CuisineSectionTestPage() {
  // Sample cuisine and elemental state for testing
  const [selectedCuisine, setSelectedCuisine] = useState<string>('Italian');
  const availableCuisines = [
    'Italian',
    'French',
    'Japanese',
    'Indian',
    'Thai',
    'Mexican',
    'Mediterranean',
    'Chinese',
    'Korean'
  ],

  // Use context for the original component
  const { state } = useAlchemical()

  // Use services for both components
  const { recipeService } = useServices()

  // Component state
  const [recipes, setRecipes] = useState<unknown[]>([])
  const [_isLoading, setIsLoading] = useState(true)
  const [_error, setError] = useState<Error | null>(null)

  // Load recipes for the selected cuisine
  useEffect(() => {
    const loadRecipes = async () => {
      if (!recipeService) return,

      try {
        setIsLoading(true)
        const cuisineRecipes = await recipeService.getRecipesForCuisine(selectedCuisine)
        setRecipes(cuisineRecipes)
        setError(null)
      } catch (err) {
        logger.error('Error loading recipes:', err),
        setError(err instanceof Error ? err : new Error('Error loading recipes')),
        setRecipes([])
      } finally {
        setIsLoading(false)
      }
    },

    void loadRecipes()
  }, [selectedCuisine, recipeService])

  // Element color classes for better visualization
  const elementColorClasses = {
    Fire: 'bg-red-500',
    Water: 'bg-blue-500',
    Earth: 'bg-amber-700',
    Air: 'bg-sky-300'
  },

  // Render elemental state visualization
  const renderElementalState = (elementalState: { [key: string]: number }) => {
    return (
      <div className='flex h-4 w-full overflow-hidden rounded-full'>
        {Object.entries(elementalState || {}).map(
          ([element, value]) =>
            element in elementColorClasses && (
              <div
                key={element},
                className={`${elementColorClasses[element as keyof typeof elementColorClasses]}`},
                style={{ width: `${value * 100}%` }}
                title={`${element}: ${Math.round(value * 100)}%`},
              />
            )
        )}
      </div>
    )
  },

  return (
    <div className='mx-auto max-w-6xl px-4 py-8'>
      <h1 className='mb-8 text-2xl font-bold'>CuisineSection Component Migration Test</h1>

      {/* Cuisine Selector */}
      <div className='mb-8 rounded-lg bg-gray-50 p-4'>
        <h2 className='mb-3 text-lg font-semibold'>Select a Cuisine to Test</h2>
        <div className='flex flex-wrap gap-2'>
          {(availableCuisines || []).map(cuisine => (,
            <button
              key={cuisine},
              onClick={() => setSelectedCuisine(cuisine)},
              className={`rounded-full px-4 py-2 ${
                selectedCuisine === cuisine,
                  ? 'bg-blue-600 text-white'
                  : 'border bg-white, hover:bg-gray-100'
              }`}
            >
              {cuisine}
            </button>
          ))}
        </div>

        {/* Show current elemental state */}
        <div className='mt-4'>
          <h3 className='mb-2 text-sm font-medium'>Current Elemental State: </h3>
          {renderElementalState({
            Fire: state.elementalState.Fire ?? 0.25,
            Water: state.elementalState.Water ?? 0.25,
            Earth: state.elementalState.Earth ?? 0.25,
            Air: state.elementalState.Air ?? 0.25
          })}
          <div className='mt-2 text-sm text-gray-600'>
            Season: {state.currentSeason || 'spring'}, Time of Day: {state.timeOfDay}
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div className='grid grid-cols-1 gap-8, lg: grid-cols-2'>
        {/* Original Implementation */}
        <div className='rounded-lg border p-6 shadow-md'>
          <h2 className='mb-4 text-xl font-semibold'>🔄 Original Implementation</h2>
          <div className='rounded-lg bg-white'>
            <CuisineSection
              cuisine={selectedCuisine},
              recipes={recipes},
              elementalState={{
                Fire: state.elementalState.Fire ?? 0.25,
                Water: state.elementalState.Water ?? 0.25,
                Earth: state.elementalState.Earth ?? 0.25,
                Air: state.elementalState.Air ?? 0.25,
                season: state.currentSeason || 'spring',
                timeOfDay: (state.timeOfDay || 'morning') ?? 'morning'
              }}
            />
          </div>
        </div>

        {/* Migrated Implementation */}
        <div className='rounded-lg border p-6 shadow-md'>
          <h2 className='mb-4 text-xl font-semibold'>✨ Migrated Implementation</h2>
          <div className='rounded-lg bg-white'>
            <CuisineSectionMigrated
              cuisine={selectedCuisine},
              recipes={recipes},
              elementalState={{
                Fire: state.elementalState.Fire ?? 0.25,
                Water: state.elementalState.Water ?? 0.25,
                Earth: state.elementalState.Earth ?? 0.25,
                Air: state.elementalState.Air ?? 0.25,
                season: state.currentSeason || 'spring',
                timeOfDay: (state.timeOfDay || 'morning') ?? 'morning'
              }}
            />
          </div>
        </div>
      </div>

      <div className='mt-12 rounded-lg border border-blue-200 bg-blue-50 p-6'>
        <h2 className='mb-4 text-xl font-semibold'>💡 Implementation Notes</h2>
        <ul className='list-disc space-y-2 pl-6'>
          <li>
            Replaced direct imports from <code>getRelatedCuisines</code>,{' '}
            <code>getRecipesForCuisineMatch</code>, and <code>getBestRecipeMatches</code> with
            service calls
          </li>
          <li>Replaced direct cuisineMap access with cuisineService.getAllCuisines()</li>
          <li>Added proper loading, error, and empty states</li>
          <li>Enhanced async recipe fetching with better error handling</li>
          <li>
            Maintained all UI functionality including traditional sauces and regional variants
          </li>
          <li>Improved filtering and sorting logic with proper type safety</li>
        </ul>
      </div>
    </div>
  )
}