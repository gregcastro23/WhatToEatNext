
import RecipeList from '@/components/RecipeList/RecipeList';
import RecipeListMigrated from '@/components/RecipeList/RecipeList.migrated';


/**
 * Test page to compare the original RecipeList with the migrated version
 */
export default function RecipeListTestPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">RecipeList Migration Test</h1>
      
      <div className="mb-8">
        <div className="bg-blue-100 p-3 mb-4 rounded">
          <p className="font-medium">This page compares the original context-based RecipeList with the migrated service-based version.</p>
          <p className="text-sm mt-1">Both components should display identical UI but with different data sources.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Original component */}
          <div className="border p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Original Component (Context-based)</h2>
            <RecipeList />
          </div>
          
          {/* Migrated component */}
          <div className="border p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Migrated Component (Service-based)</h2>
            <RecipeListMigrated />
          </div>
        </div>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Migration Notes</h2>
        <ul className="list-disc pl-5">
          <li>Replaced AlchemicalContext with useServices hook</li>
          <li>Added proper loading, error, and empty states</li>
          <li>Used async/await pattern for data fetching</li>
          <li>Improved type safety with explicit typing</li>
          <li>Used service interfaces for API calls instead of direct imports</li>
          <li>Added fallback values for when service data is not available</li>
          <li>Implemented dependency checks before using services</li>
          <li>Fetch reference data (cuisines, meal types, dietary options) from services</li>
          <li>Added consistent error handling throughout component</li>
        </ul>
      </div>
    </div>
  );
} 