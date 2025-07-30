import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

import cuisinesMap from '@/data/cuisines';
import { getCurrentElementalState } from '@/utils/elementalUtils';

// Define interface for sauce properties
interface Sauce {
  id: string;
  name: string;
  description?: string;
  base?: string;
  seasonality?: string;
  keyIngredients?: string[];
  culinaryUses?: string[];
  variants?: string[];
  elementalProperties?: Record<string, number>;
  astrologicalInfluences?: string[];
  preparationNotes?: string;
  technicalTips?: string;
}

const SauceDetailsPage: NextPage = () => {
  const router = useRouter();
  const { cuisine, id } = router.query;
  const [sauce, setSauce] = React.useState<Sauce | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [elementalState, setElementalState] = React.useState({
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25,
    season: 'spring',
    timeOfDay: 'lunch',
  });

  React.useEffect(() => {
    // Get current elemental state based on time, date, etc.
    const currentState = getCurrentElementalState();
    setElementalState({
      ...currentState,
      season: 'spring', // Default value since getCurrentElementalState doesn't provide season
      timeOfDay: 'lunch' // Default value since getCurrentElementalState doesn't provide timeOfDay
    });
  }, []);

  React.useEffect(() => {
    if (cuisine && id) {
      // Find the sauce by cuisine and ID
      try {
        const cuisineKey = Object.keys(cuisinesMap).find(
          (key) => key.toLowerCase() === String(cuisine).toLowerCase()
        );

        if (cuisineKey && cuisinesMap[cuisineKey].traditionalSauces) {
          // Find the sauce with the matching ID
          const sauceId = Object.keys(
            cuisinesMap[cuisineKey].traditionalSauces || {}
          ).find((sKey) => {
            const urlFriendlySauceId = sKey
              .toLowerCase()
              .replace(/ /g, '-')
              .replace(/[^\w-]/g, '');
            return urlFriendlySauceId === id;
          });

          if (sauceId) {
            const foundSauce = {
              id: sauceId,
              ...(cuisinesMap[cuisineKey].traditionalSauces as Record<string, any>)[sauceId],
            };
            setSauce(foundSauce);
          } else {
            setSauce(null);
          }
        } else {
          setSauce(null);
        }
      } catch (error) {
        // console.error('Error finding sauce:', error);
        setSauce(null);
      }

      setLoading(false);
    }
  }, [cuisine, id]);

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
          <div className="h-64 bg-gray-200 rounded w-full mx-auto"></div>
        </div>
      </div>
    );
  }

  // Sauce not found
  if (!sauce) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8">Sauce not found</h1>
        <p className="text-lg mb-8">
          The sauce you're looking for doesn&amp;apos;t exist or may have been
          removed.
        </p>
        <Link
          href={`/cuisines/${cuisine}`}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Back to {cuisine} cuisine
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6">
        <Link
          href={`/cuisines/${cuisine}`}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to {cuisine} cuisine
        </Link>
      </nav>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-3">{sauce.name}</h1>

          {sauce.description && (
            <p className="text-lg text-gray-700 mb-4">{sauce.description}</p>
          )}

          <div className="flex flex-wrap gap-2 mt-4">
            {sauce.base && (
              <span className="text-sm px-3 py-1 bg-amber-100 text-amber-800 rounded-full">
                {sauce.base} base
              </span>
            )}
            {sauce.seasonality && (
              <span className="text-sm px-3 py-1 bg-green-100 text-green-800 rounded-full">
                {sauce.seasonality}
              </span>
            )}
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Key Ingredients Section */}
          {sauce.keyIngredients && sauce.keyIngredients.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Key Ingredients</h2>
              <div className="flex flex-wrap gap-2">
                {sauce.keyIngredients.map((ingredient: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Culinary Uses Section */}
          {sauce.culinaryUses && sauce.culinaryUses.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Culinary Uses</h2>
              <ul className="list-disc list-inside space-y-2">
                {sauce.culinaryUses.map((use: string, idx: number) => (
                  <li key={idx} className="text-gray-700">
                    {use}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Variants Section */}
        {sauce.variants && sauce.variants.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Variants</h2>
            <div className="flex flex-wrap gap-2">
              {sauce.variants.map((variant: string, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-50 text-blue-800 rounded-full"
                >
                  {variant}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Elemental Properties */}
        {sauce.elementalProperties && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Elemental Balance</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(sauce.elementalProperties).map(
                ([element, value]) => (
                  <div
                    key={element}
                    className="text-center p-4 rounded-lg"
                    style={{
                      backgroundColor:
                        element === 'Fire'
                          ? 'rgba(239, 68, 68, 0.1)'
                          : element === 'Water'
                          ? 'rgba(59, 130, 246, 0.1)'
                          : element === 'Earth'
                          ? 'rgba(75, 85, 99, 0.1)'
                          : 'rgba(167, 139, 250, 0.1)',
                    }}
                  >
                    <div
                      className="text-lg font-bold"
                      style={{
                        color:
                          element === 'Fire'
                            ? 'rgb(185, 28, 28)'
                            : element === 'Water'
                            ? 'rgb(29, 78, 216)'
                            : element === 'Earth'
                            ? 'rgb(55, 65, 81)'
                            : 'rgb(109, 40, 217)',
                      }}
                    >
                      {typeof value === 'number'
                        ? Math.round(value * 100)
                        : value}
                      %
                    </div>
                    <div className="text-sm text-gray-600">{element}</div>
                  </div>
                )
              )}
            </div>
          </section>
        )}

        {/* Astrological Influences */}
        {sauce.astrologicalInfluences &&
          sauce.astrologicalInfluences.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xl font-semibold mb-4">
                Astrological Influences
              </h2>
              <div className="flex flex-wrap gap-2">
                {sauce.astrologicalInfluences.map(
                  (influence: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-purple-50 text-purple-800 rounded-full"
                    >
                      {influence}
                    </span>
                  )
                )}
              </div>
            </section>
          )}

        {/* Preparation Notes */}
        {sauce.preparationNotes && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Preparation Notes</h2>
            <div className="p-4 bg-yellow-50 rounded-lg text-gray-800">
              {sauce.preparationNotes}
            </div>
          </section>
        )}

        {/* Technical Tips */}
        {sauce.technicalTips && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Technical Tips</h2>
            <div className="p-4 bg-blue-50 rounded-lg text-gray-800">
              {sauce.technicalTips}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default SauceDetailsPage;
