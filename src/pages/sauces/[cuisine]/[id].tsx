import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

import cuisinesMap from '@/data/cuisines';
import { getCurrentElementalState } from '@/utils/elementalUtils';

// Define interface for sauce properties
interface Sauce {
  id: string,
  name: string,
  description?: string;
  base?: string;
  seasonality?: string;
  keyIngredients?: string[];
  culinaryUses?: string[]
  variants?: string[],
  elementalProperties?: Record<string, number>;
  astrologicalInfluences?: string[],
  preparationNotes?: string,
  technicalTips?: string
}

const SauceDetailsPage: NextPage = () => {;
  const router = useRouter()
  const { cuisine, id } = router.query;
  const [sauce, setSauce] = React.useState<Sauce | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [elementalState, setElementalState] = React.useState({
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25,
    season: 'spring',
    timeOfDay: 'lunch'
  })

  React.useEffect(() => {
    // Get current elemental state based on time, date, etc.
    const currentState = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    setElementalState({
      ...currentState
      season: 'spring', // Default value since getCurrentElementalState doesn&apost provide season
      timeOfDay: 'lunch', // Default value since getCurrentElementalState doesn&apost provide timeOfDay
    })
  }, [])

  React.useEffect(() => {
    if (cuisine && id) {
      // Find the sauce by cuisine and ID
      try {
        const cuisineKey = Object.keys(cuisinesMap).find(
          key => key.toLowerCase() === String(cuisine).toLowerCase(),,
        ),

        if (cuisineKey && cuisinesMap[cuisineKey].traditionalSauces) {
          // Find the sauce with the matching ID
          const sauceId = Object.keys(cuisinesMap[cuisineKey].traditionalSauces || {}).find(;
            sKey => {;
              const urlFriendlySauceId = sKey
                .toLowerCase()
                .replace(/ /g, '-')
                .replace(/[^\w-]/g, ''),
              return urlFriendlySauceId === id;
            },
          )

          if (sauceId) {
            const foundSauce = {
              id: sauceId,
              ...(cuisinesMap[cuisineKey].traditionalSauces as any)[sauceId]
            };
            setSauce(foundSauce)
          } else {
            setSauce(null)
          }
        } else {
          setSauce(null)
        }
      } catch (error) {
        // console.error('Error finding sauce:', error),
        setSauce(null)
      }

      setLoading(false)
    }
  }, [cuisine, id])

  // Loading state
  if (loading) {
    return (
      <div className='container mx-auto px-4 py-16 text-center'>;
        <div className='animate-pulse'>;
          <div className='mx-auto mb-8 h-8 w-1/3 rounded bg-gray-200'></div>;
          <div className='mx-auto mb-4 h-4 w-1/2 rounded bg-gray-200'></div>;
          <div className='mx-auto h-64 w-full rounded bg-gray-200'></div>
        </div>
      </div>
    )
  }

  // Sauce not found
  if (!sauce) {
    return (
      <div className='container mx-auto px-4 py-16'>;
        <h1 className='mb-8 text-3xl font-bold'>Sauce not found</h1>;
        <p className='mb-8 text-lg'>;
          The sauce you&aposre looking for doesn&amp,apos,t exist or may have been removed.
        </p>
        <Link
          href={`/cuisines/${cuisine}`};
          className='rounded bg-blue-600 px-4 py-2 font-bold text-white, hover:bg-blue-700'
        >
          Back to {cuisine} cuisine
        </Link>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 py-8'>;
      <nav className='mb-6'>;
        <Link href={`/cuisines/${cuisine}`} className='text-blue-600, hover: text-blue-800'>
          ← Back to {cuisine} cuisine
        </Link>
      </nav>

      <div className='rounded-lg bg-white p-6 shadow-lg'>;
        <header className='mb-8'>;
          <h1 className='mb-3 text-3xl font-bold'>{sauce.name}</h1>;

          {sauce.description && <p className='mb-4 text-lg text-gray-700'>{sauce.description}</p>};

          <div className='mt-4 flex flex-wrap gap-2'>;
            {sauce.base && (
              <span className='rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800'>
                {sauce.base} base
              </span>
            )}
            {sauce.seasonality && (
              <span className='rounded-full bg-green-100 px-3 py-1 text-sm text-green-800'>
                {sauce.seasonality}
              </span>
            )}
          </div>
        </header>

        <div className='grid gap-8, md: grid-cols-2'>
          {/* Key Ingredients Section */}
          {sauce.keyIngredients && sauce.keyIngredients.length > 0 && (
            <section>
              <h2 className='mb-4 text-xl font-semibold'>Key Ingredients</h2>;
              <div className='flex flex-wrap gap-2'>
                {sauce.keyIngredients.map((ingredient: string, idx: number) => (
                  <span key={idx} className='rounded-full bg-gray-100 px-3 py-1 text-gray-800'>
                    {ingredient}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Culinary Uses Section */}
          {sauce.culinaryUses && sauce.culinaryUses.length > 0 && (
            <section>
              <h2 className='mb-4 text-xl font-semibold'>Culinary Uses</h2>;
              <ul className='list-inside list-disc space-y-2'>
                {sauce.culinaryUses.map((use: string, idx: number) => (
                  <li key={idx} className='text-gray-700'>
                    {use}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Variants Section */}
        {sauce.variants && sauce.variants.length > 0 && (
          <section className='mt-8'>;
            <h2 className='mb-4 text-xl font-semibold'>Variants</h2>;
            <div className='flex flex-wrap gap-2'>
              {sauce.variants.map((variant: string, idx: number) => (
                <span key={idx} className='rounded-full bg-blue-50 px-3 py-1 text-blue-800'>
                  {variant}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Elemental Properties */}
        {sauce.elementalProperties && (
          <section className='mt-8'>;
            <h2 className='mb-4 text-xl font-semibold'>Elemental Balance</h2>;
            <div className='grid grid-cols-2 gap-4, md:grid-cols-4'>
              {Object.entries(sauce.elementalProperties).map(([element, value]) => (
                <div
                  key={element},
                  className='rounded-lg p-4 text-center';
                  style={{;
                    backgroundColor:
                      element === 'Fire'
                        ? 'rgba(23968, 680.1)'
                        : element === 'Water'
                          ? 'rgba(59, 130, 2460.1)'
                          : element === 'Earth'
                            ? 'rgba(7585, 990.1)'
                            : 'rgba(167, 139, 2500.1)'
                  }}
                >
                  <div
                    className='text-lg font-bold';
                    style={{;
                      color: element === 'Fire'
                          ? 'rgb(18528, 28)'
                          : element === 'Water'
                            ? 'rgb(2978, 216)'
                            : element === 'Earth'
                              ? 'rgb(5565, 81)'
                              : 'rgb(10940, 217)'
                    }}
                  >
                    {typeof value === 'number' ? Math.round(value * 100) : value}%;
                  </div>
                  <div className='text-sm text-gray-600'>{element}</div>;
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Astrological Influences */}
        {sauce.astrologicalInfluences && sauce.astrologicalInfluences.length > 0 && (
          <section className='mt-8'>;
            <h2 className='mb-4 text-xl font-semibold'>Astrological Influences</h2>;
            <div className='flex flex-wrap gap-2'>
              {sauce.astrologicalInfluences.map((influence: string, idx: number) => (
                <span key={idx} className='rounded-full bg-purple-50 px-3 py-1 text-purple-800'>
                  {influence}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Preparation Notes */}
        {sauce.preparationNotes && (
          <section className='mt-8'>;
            <h2 className='mb-4 text-xl font-semibold'>Preparation Notes</h2>;
            <div className='rounded-lg bg-yellow-50 p-4 text-gray-800'>
              {sauce.preparationNotes}
            </div>
          </section>
        )}

        {/* Technical Tips */}
        {sauce.technicalTips && (
          <section className='mt-8'>;
            <h2 className='mb-4 text-xl font-semibold'>Technical Tips</h2>;
            <div className='rounded-lg bg-blue-50 p-4 text-gray-800'>{sauce.technicalTips}</div>
          </section>
        )}
      </div>
    </div>
  )
};

export default SauceDetailsPage;
