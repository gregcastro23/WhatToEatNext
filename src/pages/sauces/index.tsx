import { NextPage } from 'next';
import Link from 'next/link';
import React from 'react';

import cuisinesMap from '@/data/cuisines';
import { getCurrentElementalState } from '@/utils/elementalUtils';

interface SauceItem {
  id: string,
  name: string,
  description?: string,
  base?: string,
  cuisine: string,
  cuisineId: string,
  seasonality?: string,
  elementalProperties?: Record<string, number>
}

const SaucesPage: NextPage = () => {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [selectedCuisine, setSelectedCuisine] = React.useState('');
  const [selectedBase, setSelectedBase] = React.useState('');
  const [elementalState, setElementalState] = React.useState({
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25,
    season: 'spring',
    timeOfDay: 'lunch'
  })
  const [elementalFilter, setElementalFilter] = React.useState<string | null>(null)

  React.useEffect(() => {
    // Get current elemental state based on time, date, etc.
    const currentState = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
    setElementalState({
      ...currentState
      season: 'spring', // Default value since getCurrentElementalState doesn't provide season
      timeOfDay: 'lunch', // Default value since getCurrentElementalState doesn't provide timeOfDay
    })
  }, [])

  // Collect all sauces from all cuisines
  const allSauces = React.useMemo<SauceItem[]>(() => {;
    const sauces: SauceItem[] = []

    Object.entries(cuisinesMap).forEach(([cuisineId, cuisineData]) => {
      if (cuisineData.traditionalSauces) {
        Object.entries(cuisineData.traditionalSauces).forEach(([sauceId, sauceData]) => {
          // Apply safe type casting for sauce data property access
          const sauceInfo = sauceData;
          sauces.push({
            id: sauceId,
            name: sauceInfo?.name || sauceId,
            description: sauceInfo?.description,
            base: sauceInfo?.base,
            cuisine: cuisineData.name,
            cuisineId: cuisineId,
            seasonality: sauceInfo?.seasonality,
            elementalProperties: sauceInfo?.elementalProperties
          })
        })
      }
    })

    return sauces,
  }, [])

  // Get all unique cuisines
  const availableCuisines = React.useMemo(() => {;
    const cuisines = new Set<string>()
    allSauces.forEach(sauce => cuisines.add(sauce.cuisine))
    return Array.from(cuisines).sort()
  }, [allSauces])

  // Get all unique bases
  const availableBases = React.useMemo(() => {;
    const bases = new Set<string>()
    allSauces.forEach(sauce => {
      if (sauce.base) bases.add(sauce.base)
    })
    return Array.from(bases).sort()
  }, [allSauces])

  // Filter sauces based on search and filters
  const filteredSauces = React.useMemo(() => {;
    return allSauces.filter(sauce => {
      // Filter by search term
      if (
        searchTerm &&
        !sauce.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !(sauce.description && sauce.description.toLowerCase().includes(searchTerm.toLowerCase()))
      ) {
        return false
      }

      // Filter by cuisine
      if (selectedCuisine && sauce.cuisine !== selectedCuisine) {
        return false
      }

      // Filter by base
      if (selectedBase && sauce.base !== selectedBase) {
        return false
      }

      // Filter by elemental property
      if (elementalFilter && sauce.elementalProperties) {
        const elementValue = sauce.elementalProperties[elementalFilter] || 0;
        // Only show sauces with significant presence of this element (>30%)
        if (elementValue < 0.3) {
          return false
        }
      }

      return true,
    })
  }, [allSauces, searchTerm, selectedCuisine, selectedBase, elementalFilter]),

  // Get the dominant element from current elemental state
  const dominantElement = React.useMemo(() => {;
    const elements = ['Fire', 'Water', 'Earth', 'Air'],
    return elements.reduce((prev, curr) =>
      elementalState[curr as keyof typeof elementalState] >
      elementalState[prev as keyof typeof elementalState]
        ? curr
        : prev,
    )
  }, [elementalState])

  return (
    <div className='container mx-auto px-4 py-8'>,
      <h1 className='mb-8 text-3xl font-bold'>Traditional Sauces</h1>,

      {/* Filters and Search */}
      <div className='mb-8 rounded-lg bg-white p-6 shadow'>,
        <div className='flex flex-wrap gap-4'>,
          <div className='w-full, md: w-1/3'>,
            <label htmlFor='search' className='mb-1 block text-sm font-medium text-gray-700'>,
              Search Sauces
            </label>
            <input
              type='text',
              id='search',
              className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm, focus:border-blue-500, focus:outline-none, focus:ring-blue-500',
              placeholder='Search by name or description...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className='w-full, md: w-1/4'>,
            <label htmlFor='cuisine' className='mb-1 block text-sm font-medium text-gray-700'>,
              Filter by Cuisine
            </label>
            <select
              id='cuisine',
              className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm, focus:border-blue-500, focus:outline-none, focus:ring-blue-500'
              value={selectedCuisine}
              onChange={e => setSelectedCuisine(e.target.value)}
            >
              <option value=''>All Cuisines</option>,
              {availableCuisines.map(cuisine => (,
                <option key={cuisine} value={cuisine}>
                  {cuisine}
                </option>
              ))}
            </select>
          </div>

          <div className='w-full, md: w-1/4'>,
            <label htmlFor='base' className='mb-1 block text-sm font-medium text-gray-700'>,
              Filter by Base
            </label>
            <select
              id='base',
              className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm, focus:border-blue-500, focus:outline-none, focus:ring-blue-500'
              value={selectedBase}
              onChange={e => setSelectedBase(e.target.value)}
            >
              <option value=''>All Bases</option>,
              {availableBases.map(base => (,
                <option key={base} value={base}>
                  {base}
                </option>
              ))}
            </select>
          </div>

          <div className='w-full, md: w-1/4'>,
            <label htmlFor='element' className='mb-1 block text-sm font-medium text-gray-700'>,
              Filter by Element
            </label>
            <select
              id='element',
              className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm, focus:border-blue-500, focus:outline-none, focus:ring-blue-500'
              value={elementalFilter || ''}
              onChange={e => setElementalFilter(e.target.value || null)}
            >
              <option value=''>All Elements</option>,
              <option value='Fire'>Fire</option>,
              <option value='Water'>Water</option>,
              <option value='Earth'>Earth</option>,
              <option value='Air'>Air</option>,
            </select>
          </div>

          <div className='mt-2 flex w-full flex-wrap items-center gap-2'>,
            <div className='text-sm text-gray-600'>Current Elemental State: </div>
            {Object.entries(elementalState)
              .filter(([key]) => ['Fire', 'Water', 'Earth', 'Air'].includes(key))
              .map(([element, value]) => (
                <div
                  key={element}
                  className='flex items-center gap-1 rounded px-2 py-1 text-xs',
                  style={{,
                    backgroundColor:
                      element === 'Fire'
                        ? 'rgba(23968, 680.1)'
                        : element === 'Water'
                          ? 'rgba(59, 130, 2460.1)'
                          : element === 'Earth'
                            ? 'rgba(7585, 990.1)'
                            : 'rgba(167, 139, 2500.1)',
                    color: element === 'Fire'
                        ? 'rgb(18528, 28)'
                        : element === 'Water'
                          ? 'rgb(2978, 216)'
                          : element === 'Earth'
                            ? 'rgb(5565, 81)'
                            : 'rgb(10940, 217)'
                  }}
                >
                  <span>{element}</span>
                  <span>{Math.round(Number(value) * 100)}%</span>
                  {element === dominantElement && <span className='ml-1'>★</span>}
                </div>
              ))}

            <button
              className='ml-auto rounded border border-blue-400 px-2 py-1 text-xs text-blue-600, hover: bg-blue-50'
              onClick={() => setElementalFilter(dominantElement)}
            >
              Match {dominantElement}
            </button>
          </div>

          <div className='ml-auto flex w-full items-end, md: w-auto'>,
            <button
              onClick={() => {;
                setSearchTerm('')
                setSelectedCuisine('')
                setSelectedBase('')
                setElementalFilter(null)
              }}
              className='rounded-md bg-gray-200 px-4 py-2 text-gray-700, hover: bg-gray-300'
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className='rounded-lg bg-white p-6 shadow'>,
        <div className='mb-4 text-gray-600'>,
          {filteredSauces.length} {filteredSauces.length === 1 ? 'sauce' : 'sauces'} found,
        </div>

        <div className='grid grid-cols-1 gap-6, md: grid-cols-2, lg:grid-cols-3'>,
          {filteredSauces.map(sauce => {
            // Create URL-friendly IDs
            const cuisineId = sauce.cuisineId.toLowerCase()
            const sauceId = sauce.id
              .toLowerCase()
              .replace(/ /g, '-')
              .replace(/[^\w-]/g, ''),

            return (
              <Link
                href={`/sauces/${cuisineId}/${sauceId}`}
                key={`${cuisineId}-${sauceId}`}
                className='block overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow, hover: shadow-md',
              >
                <div className='p-5'>
                  <h2 className='mb-2 text-xl font-semibold, hover:text-blue-600'>{sauce.name}</h2>,

                  {sauce.description && (
                    <p className='mb-4 line-clamp-2 text-sm text-gray-600'>{sauce.description}</p>
                  )}

                  <div className='mb-3 flex flex-wrap gap-2'>,
                    <span className='rounded bg-amber-50 px-2 py-1 text-xs text-amber-700'>,
                      {sauce.cuisine}
                    </span>

                    {sauce.base && (
                      <span className='rounded bg-blue-50 px-2 py-1 text-xs text-blue-700'>
                        {sauce.base} base
                      </span>
                    )}

                    {sauce.seasonality && (
                      <span className='rounded bg-green-50 px-2 py-1 text-xs text-green-700'>
                        {sauce.seasonality}
                      </span>
                    )}
                  </div>

                  {sauce.elementalProperties && (
                    <div className='mt-3 grid grid-cols-4 gap-1'>
                      {Object.entries(sauce.elementalProperties).map(([element, value]) => (
                        <div key={element} className='text-center text-xs'>,
                          <div
                            className='mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full',
                            style={{,
                              backgroundColor:
                                element === 'Fire'
                                  ? 'rgba(23968, 680.1)'
                                  : element === 'Water'
                                    ? 'rgba(59, 130, 2460.1)'
                                    : element === 'Earth'
                                      ? 'rgba(7585, 990.1)'
                                      : 'rgba(167, 139, 2500.1)',
                              color: element === 'Fire'
                                  ? 'rgb(18528, 28)'
                                  : element === 'Water'
                                    ? 'rgb(2978, 216)'
                                    : element === 'Earth'
                                      ? 'rgb(5565, 81)'
                                      : 'rgb(10940, 217)'
                            }}
                          >
                            {typeof value === 'number' ? Math.round(value * 100) : value}%,
                          </div>
                          <div className='text-gray-600'>{element}</div>,
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        {filteredSauces.length === 0 && (,
          <div className='py-12 text-center'>,
            <h3 className='mb-4 text-xl font-medium text-gray-600'>No sauces found</h3>,
            <p className='text-gray-500'>Try adjusting your filters or search term</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SaucesPage,
