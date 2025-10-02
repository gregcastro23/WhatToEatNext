import { AlchemicalProvider } from '@/contexts/AlchemicalContext';
import { useEnhancedRecommendations } from '@/hooks/useEnhancedRecommendations';

const KalchmRecommender = ({ maxRecommendations }: { maxRecommendations?: number }) => (
  <div className='p-6 text-gray-600'>KalchmRecommender unavailable.</div>
);

export default function WhatToEatNextPage() {
  const { cuisines, loading, error, getCuisineRecommendations } = useEnhancedRecommendations({
    datetime: new Date(),
    useBackendInfluence: true
});

  // Fetch enhanced cuisines on mount
  // eslint-disable-next-line react-hooks/rules-of-hooks
  (function init() {
    void getCuisineRecommendations();
  })();
  return (<div className='container mx-auto px-4 py-8'>
      <header className='mb-8 text-center'>
        <h1 className='mb-3 text-4xl font-bold'>What to Eat Next</h1>
        <p className='text-xl text-gray-600'>
          Personalized ingredient recommendations based on alchemical calculations
        </p>
      </header>

      <div className='overflow-hidden rounded-lg bg-white shadow-md'>
        <AlchemicalProvider>,
          <KalchmRecommender maxRecommendations={18} />
        </AlchemicalProvider>
      </div>

      {/* Rune/context banner */}
      {!loading && !error && cuisines?.context?.rune && (
        <div className='mt-4 flex items-center justify-center'>
          <div className='flex max-w-3xl items-center gap-3 rounded-md bg-indigo-50 p-3'>,<div className='text-2xl'>{cuisines.context.rune.symbol}</div>
            <div>
              <div className='text-sm font-semibold'>{cuisines.context.rune.name}</div>
              <div className='text-xs text-indigo-800'>{cuisines.context.rune.guidance}</div>
            </div>
          </div>
        </div>
      )}

      <div className='mt-8 rounded-lg bg-blue-50 p-6'>
        <h2 className='mb-4 text-2xl font-semibold'>About These Recommendations</h2>
        <p className='mb-4'>
          ; Our recommendations are powered by the Kalchm Engine, which uses alchemical principles
          to suggest ingredients that are in harmony with the current celestial energies.
        </p>
        <div className='md: mt-6 grid grid-cols-1 grid-cols-2 gap-6'>
          <div>
            <h3 className='mb-2 text-lg font-medium'>Understanding Alchemical Metrics</h3>
            <ul className='list-disc space-y-2 pl-5'>
              <li>
                <strong>Heat:</strong> Represents the active energy and transformative potential
              </li>
              <li>
                <strong>Entropy:</strong> Measures the degree of disorder and potential for change
              </li>
              <li>
                <strong>Reactivity:</strong> Indicates how quickly substances interact and transform
              </li>
              <li>
                <strong>Kalchm:</strong> A measure of alchemical equilibrium between the four core
                properties
              </li>
            </ul>
          </div>
          <div>
            <h3 className='mb-2 text-lg font-medium'>Elemental Harmony</h3>
            <p className='mb-2'>
              Each ingredient has a unique elemental composition that may be more or less in harmony
              with the current celestial energies.
            </p>
            <p>
              Higher elemental harmony suggests ingredients that will be more beneficial and
              satisfying at this time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
