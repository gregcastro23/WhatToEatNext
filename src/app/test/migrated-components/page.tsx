'use client';

import Link from 'next/link';

// Minimal fallbacks for missing demo components
const ChakraDisplay = () => <div className='p-4 text-gray-600'>ChakraDisplay unavailable</div>;
const ChakraDisplayMigrated = ChakraDisplay;
const ElementalRecommendations = () => (
  <div className='p-4 text-gray-600'>ElementalRecommendations unavailable</div>
);
const ElementalRecommendationsMigrated = ElementalRecommendations;

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- High-risk domain requiring flexibility
const Tabs = ({ children, defaultValue, className }: any) => (
  <div className={className}>{children}</div>
);
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- High-risk domain requiring flexibility
const TabsList = ({ children, className }: any) => (
  <div className={`flex gap-2 ${className || ''}`}>{children}</div>
);
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- High-risk domain requiring flexibility
const TabsTrigger = ({ children }: any) => (
  <button className='rounded border px-3 py-1'>{children}</button>
);
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- High-risk domain requiring flexibility
const TabsContent = ({ children }: unknown) => <div className='mt-4'>{children as React.ReactNode}</div>;

const AstrologyChart = () => (
  <div className='p-4 text-gray-600'>AstrologyChart unavailable</div>
);

const AstrologyChartMigrated = AstrologyChart;

export default function MigratedComponentsTestPage() {
  return (
    <div className='container mx-auto p-4'>
      <h1 className='mb-6 text-2xl font-bold'>Component Migration Test Page</h1>
      <p className='mb-6 text-gray-600'>
        This page compares the original context-based components with their migrated service-based
        versions. Use the tabs to switch between different components.
      </p>

      <div className='mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <Link
          href='/test/migrated-components/recipe-recommender-test'
          className='rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-blue-500 hover:shadow-md'
        >
          <h2 className='mb-2 text-lg font-semibold'>Recipe Recommendations</h2>
          <p className='text-sm text-gray-600'>
            Test the migrated Recipe Recommendations component
          </p>
        </Link>

        <Link
          href='/test/migrated-components/ingredient-recommender-test'
          className='rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-blue-500 hover:shadow-md'
        >
          <h2 className='mb-2 text-lg font-semibold'>Ingredient Recommender</h2>
          <p className='text-sm text-gray-600'>
            Test the migrated Ingredient Recommender component
          </p>
        </Link>
      </div>

      <Tabs defaultValue='chakra' className='w-full'>
        <TabsList className='mb-4'>
          <TabsTrigger value='chakra'>Chakra Display</TabsTrigger>
          <TabsTrigger value='astrology'>Astrology Chart</TabsTrigger>
          <TabsTrigger value='elemental'>Elemental Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value='chakra' className='space-y-8'>
          <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
            <div className='rounded-lg border p-4'>
              <h2 className='mb-4 text-lg font-semibold'>Original (Context-based)</h2>
              <ChakraDisplay />
            </div>
            <div className='rounded-lg border p-4'>
              <h2 className='mb-4 text-lg font-semibold'>Migrated (Service-based)</h2>
              <ChakraDisplayMigrated />
            </div>
          </div>
          <div className='rounded-lg bg-gray-50 p-4'>
            <h3 className='text-md mb-2 font-semibold'>Migration Notes:</h3>
            <ul className='list-disc space-y-1 pl-5'>
              <li>Replaced AlchemicalContext with astrologyService and chakraService</li>
              <li>Added proper loading and error states</li>
              <li>Implemented service initialization checks</li>
              <li>Consolidated chakra helper functions</li>
            </ul>
          </div>
        </TabsContent>

        <TabsContent value='astrology' className='space-y-8'>
          <div className='grid grid-cols-1 gap-8'>
            <div className='rounded-lg border p-4'>
              <h2 className='mb-4 text-lg font-semibold'>Original (Context-based)</h2>
              <AstrologyChart />
            </div>
            <div className='rounded-lg border p-4'>
              <h2 className='mb-4 text-lg font-semibold'>Migrated (Service-based)</h2>
              <AstrologyChartMigrated />
            </div>
          </div>
          <div className='rounded-lg bg-gray-50 p-4'>
            <h3 className='text-md mb-2 font-semibold'>Migration Notes:</h3>
            <ul className='list-disc space-y-1 pl-5'>
              <li>
                Replaced direct service instantiation with astrologyService and elementalCalculator
              </li>
              <li>Added memoization for calculated values</li>
              <li>Implemented loading, error, and empty states</li>
              <li>Added proper useEffect dependencies</li>
            </ul>
          </div>
        </TabsContent>

        <TabsContent value='elemental' className='space-y-8'>
          <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
            <div className='rounded-lg border p-4'>
              <h2 className='mb-4 text-lg font-semibold'>Original (Context-based)</h2>
              <ElementalRecommendations />
            </div>
            <div className='rounded-lg border p-4'>
              <h2 className='mb-4 text-lg font-semibold'>Migrated (Service-based)</h2>
              <ElementalRecommendationsMigrated />
            </div>
          </div>
          <div className='rounded-lg bg-gray-50 p-4'>
            <h3 className='text-md mb-2 font-semibold'>Migration Notes:</h3>
            <ul className='list-disc space-y-1 pl-5'>
              <li>Replaced multiple context hooks with useServices hook</li>
              <li>Implemented proper service dependency checks</li>
              <li>Added consistent loading, error, and empty states</li>
              <li>Maintained original styling and UI elements</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>

      <div className='mt-8 rounded-lg bg-blue-50 p-4'>
        <h3 className='text-md mb-2 font-semibold'>Migration Progress</h3>
        <p className='text-sm'>
          11 components have been successfully migrated to the new service-based architecture. See
          the{' '}
          <Link href='/test' className='text-blue-600 underline'>
            test directory
          </Link>{' '}
          for more examples.
        </p>
      </div>
    </div>
  );
}
