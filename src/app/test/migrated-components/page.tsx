'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

import ChakraDisplay from '@/components/ChakraDisplay';
import ChakraDisplayMigrated from '@/components/ChakraDisplay.migrated';
import ElementalRecommendations from '@/components/ElementalDisplay/ElementalEnergyDisplay';
import ElementalRecommendationsMigrated from '@/components/ElementalRecommendations.migrated';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


const AstrologyChart = dynamic(
  () => import('@/components/AstrologyChart/AstrologyChart.migrated').then(mod => {
    return mod.default;
  }),
  { ssr: false }
);

const AstrologyChartMigrated = dynamic(
  () => import('@/components/AstrologyChart/AstrologyChart.migrated'),
  { ssr: false }
);

export default function MigratedComponentsTestPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Component Migration Test Page</h1>
      <p className="mb-6 text-gray-600">
        This page compares the original context-based components with their migrated service-based versions.
        Use the tabs to switch between different components.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Link 
          href="/test/migrated-components/recipe-recommender-test" 
          className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
        >
          <h2 className="text-lg font-semibold mb-2">Recipe Recommendations</h2>
          <p className="text-sm text-gray-600">Test the migrated Recipe Recommendations component</p>
        </Link>
        
        <Link 
          href="/test/migrated-components/ingredient-recommender-test" 
          className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
        >
          <h2 className="text-lg font-semibold mb-2">Ingredient Recommender</h2>
          <p className="text-sm text-gray-600">Test the migrated Ingredient Recommender component</p>
        </Link>
      </div>

      <Tabs defaultValue="chakra" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="chakra">Chakra Display</TabsTrigger>
          <TabsTrigger value="astrology">Astrology Chart</TabsTrigger>
          <TabsTrigger value="elemental">Elemental Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="chakra" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Original (Context-based)</h2>
              <ChakraDisplay />
            </div>
            <div className="border p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Migrated (Service-based)</h2>
              <ChakraDisplayMigrated />
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-md font-semibold mb-2">Migration Notes:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Replaced AlchemicalContext with astrologyService and chakraService</li>
              <li>Added proper loading and error states</li>
              <li>Implemented service initialization checks</li>
              <li>Consolidated chakra helper functions</li>
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="astrology" className="space-y-8">
          <div className="grid grid-cols-1 gap-8">
            <div className="border p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Original (Context-based)</h2>
              <AstrologyChart />
            </div>
            <div className="border p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Migrated (Service-based)</h2>
              <AstrologyChartMigrated />
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-md font-semibold mb-2">Migration Notes:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Replaced direct service instantiation with astrologyService and elementalCalculator</li>
              <li>Added memoization for calculated values</li>
              <li>Implemented loading, error, and empty states</li>
              <li>Added proper useEffect dependencies</li>
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="elemental" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Original (Context-based)</h2>
              <ElementalRecommendations />
            </div>
            <div className="border p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Migrated (Service-based)</h2>
              <ElementalRecommendationsMigrated />
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-md font-semibold mb-2">Migration Notes:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Replaced multiple context hooks with useServices hook</li>
              <li>Implemented proper service dependency checks</li>
              <li>Added consistent loading, error, and empty states</li>
              <li>Maintained original styling and UI elements</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 bg-blue-50 p-4 rounded-lg">
        <h3 className="text-md font-semibold mb-2">Migration Progress</h3>
        <p className="text-sm">
          11 components have been successfully migrated to the new service-based architecture.
          See the <Link href="/test" className="text-blue-600 underline">test directory</Link> for more examples.
        </p>
      </div>
    </div>
  );
} 