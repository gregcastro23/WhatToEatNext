import { Flame, Droplets, Mountain, Wind, Beaker, ChefHat, Star, Thermometer } from 'lucide-react';

import { Ingredient } from '@/types';

interface IngredientDisplayProps {
  ingredient: Ingredient;
  showDetails?: boolean;
}

export const IngredientDisplay = ({ ingredient, showDetails = false }: IngredientDisplayProps) => {
  // Safe accessor function for nested properties
  const _safeGet = (obj: unknown, path: string, defaultValue: unknown = 'N/A') => {
    return (
      path.split('.').reduce((prev, curr) => {
        return prev?.[curr] !== undefined ? prev[curr] : undefined;
      }, obj) ?? defaultValue
    );
  };

  // Safe formatter for numbers
  const formatNumber = (value: unknown, decimals: number = 2) => {
    if (value === undefined || value === null) return 'N/A';
    if (typeof value !== 'number') return String(value);
    return value.toFixed(decimals);
  };

  // Get the dominant element to highlight
  const getDominantElement = () => {
    if (!ingredient.elementalProperties) return null;

    const elements = Object.entries(ingredient.elementalProperties);
    if (elements.length === 0) return null;

    const sorted = [...elements].sort((a, b) => b[1] - a[1]);
    return sorted[0][0]; // Return the name of the dominant element
  };

  const dominantElement = getDominantElement();

  // Helper function to get icon for element
  const getElementIcon = (element: string) => {
    switch (element) {
      case 'Fire':
        return <Flame className='h-4 w-4 text-red-500' />;
      case 'Water':
        return <Droplets className='h-4 w-4 text-blue-500' />;
      case 'Earth':
        return <Mountain className='h-4 w-4 text-green-500' />;
      case 'Air':
        return <Wind className='h-4 w-4 text-purple-500' />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`ingredient-card rounded-lg bg-gradient-to-br p-4 shadow-md transition-all duration-300 ${
        dominantElement === 'Fire'
          ? 'border-l-4 border-red-500 from-red-50 to-orange-50'
          : dominantElement === 'Water'
            ? 'border-l-4 border-blue-500 from-blue-50 to-cyan-50'
            : dominantElement === 'Earth'
              ? 'border-l-4 border-green-500 from-green-50 to-emerald-50'
              : dominantElement === 'Air'
                ? 'border-l-4 border-purple-500 from-purple-50 to-indigo-50'
                : 'border-l-4 border-gray-400 from-gray-50 to-slate-50'
      } hover:-translate-y-1 hover:shadow-lg`}
    >
      <div className='flex items-start justify-between'>
        <h3 className='text-lg font-semibold'>{ingredient.name || 'Unknown Ingredient'}</h3>
        {dominantElement && (
          <div className='element-badge flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm'>
            {getElementIcon(dominantElement)}
          </div>
        )}
      </div>

      {/* Show description if available with safe property access */}
      {(() => {
        const ingredientData = ingredient as unknown as Record<string, unknown>;
        const description = ingredientData.description;
        return description ? (
          <p className='mt-2 text-sm italic text-gray-600'>{String(description)}</p>
        ) : null;
      })()}

      {/* Show category if available */}
      {ingredient.category && (
        <div className='mt-2 inline-block rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700'>
          {ingredient.category}
        </div>
      )}

      {showDetails && (
        <div className='mt-4 space-y-4'>
          {/* Elemental Properties Section */}
          <div className='rounded-md bg-white/60 p-3 shadow-sm'>
            <div className='mb-2 flex items-center'>
              <Beaker className='mr-2 h-4 w-4 text-indigo-600' />
              <h4 className='text-sm font-medium'>Elemental Properties</h4>
            </div>
            <div className='grid grid-cols-2 gap-2'>
              {Object.entries(ingredient.elementalProperties || {}).map(([element, value]) => (
                <div key={element} className='flex items-center justify-between'>
                  <div className='flex items-center'>
                    {getElementIcon(element)}
                    <span className='ml-1 text-xs'>{element}</span>
                  </div>
                  <div className='relative h-2 w-20 overflow-hidden rounded-full bg-gray-200'>
                    <div
                      className={`absolute h-full rounded-full ${
                        element === 'Fire'
                          ? 'bg-gradient-to-r from-red-400 to-red-600'
                          : element === 'Water'
                            ? 'bg-gradient-to-r from-blue-400 to-blue-600'
                            : element === 'Earth'
                              ? 'bg-gradient-to-r from-green-400 to-green-600'
                              : element === 'Air'
                                ? 'bg-gradient-to-r from-purple-400 to-purple-600'
                                : 'bg-gray-500'
                      }`}
                      style={{ width: `${Math.min(100, value * 100 || 0)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Energy Profile Section with safe property access */}
          {(() => {
            const ingredientData = ingredient as unknown as Record<string, unknown>;
            const energyProfile = ingredientData.energyProfile as Record<string, unknown>;

            if (!energyProfile) return null;

            return (
              <div className='rounded-md bg-white/60 p-3 shadow-sm'>
                <div className='mb-2 flex items-center'>
                  <Star className='mr-2 h-4 w-4 text-amber-500' />
                  <h4 className='text-sm font-medium'>Energy Profile</h4>
                </div>
                <div className='space-y-1 text-xs'>
                  {(() => {
                    const zodiac = energyProfile.zodiac as unknown[];
                    return zodiac.length > 0 ? (
                      <div className='flex flex-wrap gap-1'>
                        <span className='font-medium'>Zodiac:</span>
                        {zodiac.map((sign: unknown) => (
                          <span
                            key={String(sign)}
                            className='rounded-full bg-amber-100 px-2 py-0.5 text-amber-800'
                          >
                            {String(sign)}
                          </span>
                        ))}
                      </div>
                    ) : null;
                  })()}

                  {(() => {
                    const lunar = energyProfile.lunar as unknown[];
                    return lunar.length > 0 ? (
                      <div className='flex flex-wrap gap-1'>
                        <span className='font-medium'>Lunar:</span>
                        {lunar.map((phase: unknown) => (
                          <span
                            key={String(phase)}
                            className='rounded-full bg-indigo-100 px-2 py-0.5 text-indigo-800'
                          >
                            {String(phase)}
                          </span>
                        ))}
                      </div>
                    ) : null;
                  })()}

                  {(() => {
                    const planetary = energyProfile.planetary as unknown[];
                    return planetary.length > 0 ? (
                      <div className='flex flex-wrap gap-1'>
                        <span className='font-medium'>Planetary:</span>
                        {planetary.map((alignment: unknown) => (
                          <span
                            key={String(alignment)}
                            className='rounded-full bg-violet-100 px-2 py-0.5 text-violet-800'
                          >
                            {String(alignment)}
                          </span>
                        ))}
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
            );
          })()}

          {/* Sensory Profile Section with safe property access */}
          {(() => {
            const ingredientData = ingredient as unknown as Record<string, unknown>;
            const sensoryProfile = ingredientData.sensoryProfile as Record<string, unknown>;

            if (!sensoryProfile) return null;

            return (
              <div className='rounded-md bg-white/60 p-3 shadow-sm'>
                <div className='mb-2 flex items-center'>
                  <Thermometer className='mr-2 h-4 w-4 text-orange-500' />
                  <h4 className='text-sm font-medium'>Sensory Profile</h4>
                </div>
                {(() => {
                  const taste = sensoryProfile.taste as Record<string, unknown>;
                  return taste ? (
                    <div>
                      <h5 className='mb-1 text-xs font-medium'>Taste</h5>
                      <div className='grid grid-cols-2 gap-2'>
                        {Object.entries(taste).map(([tasteName, value]) => (
                          <div key={tasteName} className='flex items-center justify-between'>
                            <span className='text-xs capitalize'>{tasteName}</span>
                            <div className='relative h-2 w-20 overflow-hidden rounded-full bg-gray-200'>
                              <div
                                className='absolute h-full rounded-full bg-gradient-to-r from-orange-300 to-orange-500'
                                style={{ width: `${Math.min(100, Number(value) * 100 || 0)}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}

                {(() => {
                  const aroma = sensoryProfile.aroma as Record<string, unknown>;
                  return aroma ? (
                    <div className='mt-2'>
                      <h5 className='mb-1 text-xs font-medium'>Aroma</h5>
                      <div className='flex flex-wrap gap-1'>
                        {Object.entries(aroma)
                          .filter(([_, value]) => (Number(value) || 0) > 0.3) // Only show significant aromas
                          .map(([aromaName, _]) => (
                            <span
                              key={aromaName}
                              className='rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-800'
                            >
                              {aromaName}
                            </span>
                          ))}
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            );
          })()}

          {/* Cooking Methods Section with safe property access */}
          {(() => {
            const ingredientData = ingredient as unknown as Record<string, unknown>;
            const recommendedCookingMethods = ingredientData.recommendedCookingMethods as unknown[];

            return Array.isArray(recommendedCookingMethods) &&
              recommendedCookingMethods.length > 0 ? (
              <div className='rounded-md bg-white/60 p-3 shadow-sm'>
                <div className='mb-2 flex items-center'>
                  <ChefHat className='mr-2 h-4 w-4 text-emerald-600' />
                  <h4 className='text-sm font-medium'>Cooking Methods</h4>
                </div>
                <div className='flex flex-wrap gap-1'>
                  {recommendedCookingMethods.map((method: unknown) => (
                    <span
                      key={String(method)}
                      className='rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-800'
                    >
                      {String(method)}
                    </span>
                  ))}
                </div>
              </div>
            ) : null;
          })()}

          {/* Pairing Recommendations with safe property access */}
          {(() => {
            const ingredientData = ingredient as unknown as Record<string, unknown>;
            const pairingRecommendations = ingredientData.pairingRecommendations as Record<
              string,
              unknown
            >;

            if (!pairingRecommendations) return null;

            return (
              <div className='rounded-md bg-white/60 p-3 shadow-sm'>
                <h4 className='mb-2 text-sm font-medium'>Pairing Recommendations</h4>

                {(() => {
                  const complementary = pairingRecommendations.complementary as unknown[];
                  return Array.isArray(complementary) && complementary.length > 0 ? (
                    <div className='mb-2'>
                      <h5 className='mb-1 text-xs font-medium text-green-600'>Complementary</h5>
                      <div className='flex flex-wrap gap-1'>
                        {complementary.map((item: unknown) => (
                          <span
                            key={String(item)}
                            className='rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800'
                          >
                            {String(item)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}

                {(() => {
                  const contrasting = pairingRecommendations.contrasting as unknown[];
                  return Array.isArray(contrasting) && contrasting.length > 0 ? (
                    <div className='mb-2'>
                      <h5 className='mb-1 text-xs font-medium text-amber-600'>Contrasting</h5>
                      <div className='flex flex-wrap gap-1'>
                        {contrasting.map((item: unknown) => (
                          <span
                            key={String(item)}
                            className='rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800'
                          >
                            {String(item)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}

                {(() => {
                  const toAvoid = pairingRecommendations.toAvoid as unknown[];
                  return Array.isArray(toAvoid) && toAvoid.length > 0 ? (
                    <div>
                      <h5 className='mb-1 text-xs font-medium text-red-600'>To Avoid</h5>
                      <div className='flex flex-wrap gap-1'>
                        {toAvoid.map((item: unknown) => (
                          <span
                            key={String(item)}
                            className='rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800'
                          >
                            {String(item)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            );
          })()}

          {/* Nutrition Details with safe property access */}
          {(() => {
            const ingredientData = ingredient as unknown as Record<string, unknown>;
            const nutrition = ingredientData.nutrition as Record<string, unknown>;

            return nutrition ? (
              <div className='rounded-md bg-white/60 p-3 shadow-sm'>
                <h4 className='mb-2 text-sm font-medium'>Nutrition (per 100g)</h4>
                <div className='grid grid-cols-2 gap-2'>
                  <div className='text-xs'>
                    <span className='font-medium'>Calories:</span>{' '}
                    {formatNumber(nutrition.calories, 0)}
                  </div>
                  <div className='text-xs'>
                    <span className='font-medium'>Protein:</span> {formatNumber(nutrition.protein)}g
                  </div>
                  <div className='text-xs'>
                    <span className='font-medium'>Carbs:</span> {formatNumber(nutrition.carbs)}g
                  </div>
                  <div className='text-xs'>
                    <span className='font-medium'>Fat:</span> {formatNumber(nutrition.fat)}g
                  </div>
                </div>
              </div>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
};
