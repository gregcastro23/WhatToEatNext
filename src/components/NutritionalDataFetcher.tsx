'use client';

import React, { useState } from 'react';

import {
  fetchNutritionalData,
  nutritionalToElemental,
  zodiacNutritionalNeeds,
} from '@/data/nutritional';
import { NutritionalProfile, Element, ZodiacSign } from '@/types/alchemy';

// Loading spinner component
function LoadingSpinner() {
  return (
    <div className='my-8 flex justify-center'>
      <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500'></div>
    </div>
  );
}

// Empty state component
function EmptyState() {
  return (
    <div className='rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-12 text-center'>
      <svg
        className='mx-auto h-12 w-12 text-gray-400'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'
        aria-hidden='true'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
        />
      </svg>
      <h3 className='mt-2 text-sm font-semibold text-gray-900'>No data to display</h3>
      <p className='mt-1 text-sm text-gray-500'>
        Enter a food name in the search box above to see nutritional information and elemental
        properties.
      </p>
      <p className='mt-3 text-xs text-gray-500'>
        Try searching for foods like "apple", "chicken breast", or "quinoa".
      </p>
    </div>
  );
}

// Add this component to display zodiac sign recommendations
function ZodiacRecommendations({ dominantElement }: { dominantElement: Element }) {
  const compatibleSigns = Object.entries(zodiacNutritionalNeeds)
    .filter(([_sign, data]) => {
      // Find signs that need this element the most
      const elementNeeds = data.elementalNeeds;
      const dominantElementNeeded = Object.entries(elementNeeds).sort(
        ([_a, valueA], [_b, valueB]) => valueB - valueA,
      )[0][0];
      return dominantElementNeeded === dominantElement;
    })
    .map(([sign]) => sign as ZodiacSign);

  if (compatibleSigns.length === 0) return null;

  return (
    <div className='mt-6 rounded border border-purple-200 bg-purple-50 p-4'>
      <h3 className='mb-2 text-lg font-semibold text-purple-800'>Astrological Affinity</h3>
      <p className='mb-3 text-sm text-purple-700'>
        This food's dominant {dominantElement} element makes it especially beneficial for:
      </p>
      <div className='flex flex-wrap gap-2'>
        {compatibleSigns.map(sign => (
          <span
            key={sign}
            className='inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800'
          >
            {sign.charAt(0).toUpperCase() + sign.slice(1)}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function NutritionalDataFetcher() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [nutritionalData, setNutritionalData] = useState<NutritionalProfile | null>(null);
  const [elementalData, setElementalData] = useState<{
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a food name to search');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchNutritionalData(searchTerm);

      if (!data) {
        setError(`No nutritional data found for "${searchTerm}". Try a different food name.`);
        setNutritionalData(null);
        setElementalData(null);
        return;
      }

      setNutritionalData(data as unknown as NutritionalProfile | null);
      const elemental = nutritionalToElemental(data);
      setElementalData(elemental);
    } catch (err) {
      console.error('Error in nutritional search:', err);
      setError('Error fetching nutritional data. Please try again or try a different food name.');
      setNutritionalData(null);
      setElementalData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='mx-auto max-w-4xl p-4'>
      <h1 className='mb-4 text-2xl font-bold'>Nutritional Data Fetcher</h1>

      <div className='mb-6 flex gap-2'>
        <input
          type='text'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder='Enter food name (e.g., apple, chicken)'
          className='flex-1 rounded border border-gray-300 p-2'
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-400'
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && (
        <div className='mb-4 rounded border border-red-300 bg-red-100 p-4 text-red-700'>
          {error}
        </div>
      )}

      {isLoading && <LoadingSpinner />}

      {!isLoading && !nutritionalData && !error && <EmptyState />}

      {!isLoading && nutritionalData && (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <div className='rounded border bg-white p-4 shadow'>
            <h2 className='mb-2 text-xl font-semibold'>Nutritional Profile</h2>
            {Boolean((nutritionalData as Record<string, unknown>).name) && (
              <p className='mb-2 text-lg font-medium'>
                {String((nutritionalData as Record<string, unknown>).name)}
              </p>
            )}
            <p>
              <strong>Calories:</strong>{' '}
              {(((nutritionalData as Record<string, unknown>).calories as number) || 0).toFixed(1)}
            </p>

            <h3 className='mb-2 mt-4 text-lg font-semibold'>Macronutrients</h3>
            <ul className='list-disc pl-5'>
              <li>
                Protein:{' '}
                {(
                  (((nutritionalData as Record<string, unknown>).macros as Record<string, unknown>)
                    .protein as number) || 0
                ).toFixed(1)}
                g
              </li>
              <li>
                Carbohydrates:{' '}
                {(
                  (((nutritionalData as Record<string, unknown>).macros as Record<string, unknown>)
                    .carbs as number) || 0
                ).toFixed(1)}
                g
              </li>
              <li>
                Fat:{' '}
                {(
                  (((nutritionalData as Record<string, unknown>).macros as Record<string, unknown>)
                    .fat as number) || 0
                ).toFixed(1)}
                g
              </li>
              <li>
                Fiber:{' '}
                {(
                  (((nutritionalData as Record<string, unknown>).macros as Record<string, unknown>)
                    .fiber as number) || 0
                ).toFixed(1)}
                g
              </li>
            </ul>

            {nutritionalData.vitamins && Object.keys(nutritionalData.vitamins).length > 0 && (
              <>
                <h3 className='mb-2 mt-4 text-lg font-semibold'>Vitamins</h3>

                {/* Calculate if we have any non-zero values */}
                {Object.values(nutritionalData.vitamins).some(v => v > 0) ? (
                  <>
                    <ul className='list-disc pl-5'>
                      {Object.entries(nutritionalData.vitamins).map(([vitamin, value]) => {
                        const percentage = value * 100;
                        // Choose appropriate styling based on percentage
                        let textClass = 'text-gray-500'; // Default for 0%
                        if (percentage > 50) textClass = 'text-green-600 font-medium';
                        else if (percentage > 20) textClass = 'text-blue-600';
                        else if (percentage > 0) textClass = 'text-gray-700';

                        return (
                          <li key={vitamin} className={textClass}>
                            Vitamin {vitamin}: {percentage.toFixed(1)}% DV
                            {percentage > 20 && ' ★'}
                          </li>
                        );
                      })}
                    </ul>
                    <p className='mt-2 text-xs text-gray-500'>
                      DV = Daily Value based on 2,000 calorie diet. ★ indicates good source.
                    </p>
                  </>
                ) : (
                  <div className='rounded bg-amber-50 p-3 text-sm text-amber-800'>
                    <p>
                      <span className='font-medium'>Note:</span> Detailed vitamin data is not
                      available for this food in the USDA database.
                    </p>
                    <p className='mt-1 text-xs'>
                      Try searching for a similar food or a less processed version of this food.
                    </p>
                  </div>
                )}
              </>
            )}

            {nutritionalData.minerals && Object.keys(nutritionalData.minerals).length > 0 && (
              <>
                <h3 className='mb-2 mt-4 text-lg font-semibold'>Minerals</h3>

                {/* Calculate if we have any non-zero values */}
                {Object.values(nutritionalData.minerals).some(v => v > 0) ? (
                  <>
                    <ul className='list-disc pl-5'>
                      {Object.entries(nutritionalData.minerals).map(([mineral, value]) => {
                        const percentage = value * 100;
                        // Choose appropriate styling based on percentage
                        let textClass = 'text-gray-500'; // Default for 0%
                        if (percentage > 50) textClass = 'text-green-600 font-medium';
                        else if (percentage > 20) textClass = 'text-blue-600';
                        else if (percentage > 0) textClass = 'text-gray-700';

                        return (
                          <li key={mineral} className={textClass}>
                            {mineral.charAt(0).toUpperCase() + mineral.slice(1)}:{' '}
                            {percentage.toFixed(1)}% DV
                            {percentage > 20 && ' ★'}
                          </li>
                        );
                      })}
                    </ul>
                    <p className='mt-2 text-xs text-gray-500'>
                      DV = Daily Value based on 2,000 calorie diet. ★ indicates good source.
                    </p>
                  </>
                ) : (
                  <div className='rounded bg-amber-50 p-3 text-sm text-amber-800'>
                    <p>
                      <span className='font-medium'>Note:</span> Detailed mineral data is not
                      available for this food in the USDA database.
                    </p>
                    <p className='mt-1 text-xs'>
                      Try searching for a similar food or a less processed version of this food.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {elementalData && (
            <div className='rounded border bg-white p-4 shadow'>
              <h2 className='mb-4 text-xl font-semibold'>Elemental Properties</h2>

              <div className='space-y-3'>
                <div className='flex items-center'>
                  <span className='w-16 font-medium'>Fire:</span>
                  <div className='h-4 flex-1 rounded-full bg-gray-200'>
                    <div
                      className='h-4 rounded-full bg-red-500'
                      style={{ width: `${elementalData.Fire * 100}%` }}
                    ></div>
                  </div>
                  <span className='ml-2'>{(elementalData.Fire * 100).toFixed(1)}%</span>
                </div>

                <div className='flex items-center'>
                  <span className='w-16 font-medium'>Water:</span>
                  <div className='h-4 flex-1 rounded-full bg-gray-200'>
                    <div
                      className='h-4 rounded-full bg-blue-500'
                      style={{ width: `${elementalData.Water * 100}%` }}
                    ></div>
                  </div>
                  <span className='ml-2'>{(elementalData.Water * 100).toFixed(1)}%</span>
                </div>

                <div className='flex items-center'>
                  <span className='w-16 font-medium'>Earth:</span>
                  <div className='h-4 flex-1 rounded-full bg-gray-200'>
                    <div
                      className='h-4 rounded-full bg-green-500'
                      style={{ width: `${elementalData.Earth * 100}%` }}
                    ></div>
                  </div>
                  <span className='ml-2'>{(elementalData.Earth * 100).toFixed(1)}%</span>
                </div>

                <div className='flex items-center'>
                  <span className='w-16 font-medium'>Air:</span>
                  <div className='h-4 flex-1 rounded-full bg-gray-200'>
                    <div
                      className='h-4 rounded-full bg-yellow-400'
                      style={{ width: `${elementalData.Air * 100}%` }}
                    ></div>
                  </div>
                  <span className='ml-2'>{(elementalData.Air * 100).toFixed(1)}%</span>
                </div>
              </div>

              <div className='mt-6'>
                <h3 className='mb-2 text-lg font-semibold'>Dominant Element</h3>
                <p className='text-xl'>
                  {Object.entries(elementalData).sort(([, a], [, b]) => b - a)[0][0]}
                </p>
              </div>

              <ZodiacRecommendations
                dominantElement={
                  Object.entries(elementalData).sort(([, a], [, b]) => b - a)[0][0] as Element
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
