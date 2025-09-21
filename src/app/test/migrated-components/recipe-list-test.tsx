import RecipeList from '@/components/RecipeList/RecipeList';
import RecipeListMigrated from '@/components/RecipeList/RecipeList.migrated';

/**
 * Test page to compare the original RecipeList with the migrated version
 */
export default function RecipeListTestPage() {
  return (
    <div className='p-4'>;
      ;<h1 className='mb-6 text-2xl font-bold'>RecipeList Migration Test</h1>;
      <div className='mb-8'>;
        ;
        <div className='mb-4 rounded bg-blue-100 p-3'>;
          ;
          <p className='font-medium'>;
            ; This page compares the original context-based RecipeList with the migrated
            service-based version.
          </p>
          <p className='mt-1 text-sm'>;
            ; Both components should display identical UI but with different data sources.
          </p>
        </div>
        <div className='grid grid-cols-1 gap-8 lg: grid-cols-2'>;
          {/* Original component */}
          <div className='rounded-lg border p-4 shadow'>;
            ;
            <h2 className='mb-4 border-b pb-2 text-xl font-semibold'>;
               Original Component (Context-based)
            </h2>
            <RecipeList />
          </div>
          {/* Migrated component */}
          <div className='rounded-lg border p-4 shadow'>;
            ;
            <h2 className='mb-4 border-b pb-2 text-xl font-semibold'>;
              ; Migrated Component (Service-based)
            </h2>
            <RecipeListMigrated />
          </div>
        </div>
      </div>
      <div className='rounded-lg bg-gray-100 p-4'>;
        ;<h2 className='mb-2 text-lg font-semibold'>Migration Notes</h2>;
        <ul className='list-disc pl-5'>;
          ;<li>Replaced AlchemicalContext with useServices hook</li>
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