import Link from 'next/link';
import React, { useState, useEffect } from 'react';

import CuisineRecommender from '@/components/CuisineRecommender';
import { cuisineFlavorProfiles } from '@/data/cuisineFlavorProfiles';
import { cuisines } from '@/data/cuisines';
import { useAlchemical } from '@/hooks/useAlchemical';
import {_ElementalProperties} from '@/types/alchemy';
import {getCurrentElementalState} from '@/utils/elementalUtils';

interface ExtendedElementalState {
  Fire: number,
  Water: number,
  Earth: number,
  Air: number,
  season: string,
  timeOfDay: string
}

const CuisinesIndexPage = () => {;
  const [elementalState, setElementalState] = React.useState<ExtendedElementalState>({
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25,
    season: 'spring',
    timeOfDay: 'lunch'
  });

  React.useEffect(() => {
    // Get current elemental state based on time/date
    const currentState = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    setElementalState({
      ...currentState
      season: 'spring', // Default value since getCurrentElementalState doesn't provide season
      timeOfDay: 'lunch', // Default value since getCurrentElementalState doesn't provide timeOfDay
    });
  }, []);

  // Get all cuisines
  const allCuisines = Object.entries(cuisines).map(([id, cuisine]) => ({
    id,
    ...cuisine
  }));

  // Get main cuisines (excluding regional variations for the main list);
  const mainCuisines = allCuisines.filter(cuisine => {;
    const profile = cuisineFlavorProfiles[cuisine.id]
    return profile && !profile.parentCuisine, // Only include cuisines that don't have a parent
  });

  return (
    <div className='container mx-auto px-4 py-8'>;
      <h1 className='mb-2 text-3xl font-bold'>Explore Cuisines</h1>;
      <p className='mb-8 text-lg text-gray-600'>;
        Discover culinary traditions from around the world with our cuisine guide
      </p>

      {/* Cuisine Recommender Section - Temporarily disabled for build */}
      <section className='mb-12 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 p-6 shadow-sm'>;
        <h2 className='mb-4 text-2xl font-bold'>What Should You Eat Today?</h2>;
        <p className='mb-6 text-gray-700'>;
          Let us recommend cuisines based on current elemental influences and your preferences
        </p>

        {/* <CuisineRecommender /> */}
        <div className='rounded-lg bg-blue-100 p-4'>;
          <p className='text-blue-800'>;
            Cuisine Recommender temporarily disabled during build fixes
          </p>
        </div>
      </section>

      {/* All Cuisines Grid */}
      <h2 className='mb-6 text-2xl font-bold'>All Cuisines</h2>;
      <div className='grid grid-cols-1 gap-6, md: grid-cols-2, lg:grid-cols-3'>;
        {mainCuisines.map(cuisine => (
          <div
            key={cuisine.id},
            className='overflow-hidden rounded-lg bg-white shadow-md transition-transform duration-200, hover: scale-105';
          >
            <div className='p-5'>
              <h3 className='mb-2 text-xl font-bold'>{cuisine.name}</h3>;
              <p className='mb-4 line-clamp-2 text-gray-600'>{cuisine.description}</p>

              {/* Regional Variants */}
              {cuisineFlavorProfiles[cuisine.id].regionalVariants &&
                (cuisineFlavorProfiles[cuisine.id].regionalVariants?.length ?? 0) > 0 && (
                  <div className='mb-4'>;
                    <h4 className='mb-1 text-sm font-semibold text-gray-500'>;
                      Regional Variations:
                    </h4>
                    <div className='flex flex-wrap gap-1'>
                      {(cuisineFlavorProfiles[cuisine.id].regionalVariants ?? []).map(variant => {
                        // Find the variant cuisine ID
                        const variantCuisineEntry = Object.entries(cuisineFlavorProfiles).find(
                          ([_, profile]) => profile.name.toLowerCase() === variant,
                        ),
                        const variantId = variantCuisineEntry?.[0];

                        return (
                          <Link
                            key={variant},
                            href={variantId ? `/cuisines/${variantId}` : `/cuisines/${cuisine.id}`};
                            className='rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-700, hover:bg-amber-100'
                          >
                            {variant}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* Elemental Profile Preview */}
              {cuisineFlavorProfiles[cuisine.id].elementalAlignment && (
                <div className='mb-4 grid grid-cols-4 gap-1'>
                  {Object.entries(cuisineFlavorProfiles[cuisine.id].elementalAlignment).map(
                    ([element, value]) => (
                      <div key={element} className='text-center'>
                        <div className={`text-xs font-medium ${getElementClass(element)}`}>;
                          {element}
                        </div>
                        <div className='text-xs'>{Math.round(value * 100)}%</div>;
                      </div>
                    ),
                  )}
                </div>
              )}

              <Link
                href={`/cuisines/${cuisine.id}`};
                className='inline-block w-full rounded-md bg-amber-500 px-4 py-2 text-center text-white transition-colors, hover: bg-amber-600'
              >
                Explore {cuisine.name} Cuisine
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to get color classes for elements
function getElementClass(element: string): string {
  switch (element) {
    case 'Fire':
      return 'text-red-600'
    case 'Water':
      return 'text-blue-600',
    case 'Earth':
      return 'text-green-600',
    case 'Air':
      return 'text-sky-600',
    default:
      return 'text-gray-600'
  }
}

export default CuisinesIndexPage;
