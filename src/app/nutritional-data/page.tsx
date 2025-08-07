
import NutritionalDisplay from '@/components/NutritionalDisplay';

export default function NutritionalDataPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Nutritional Data Explorer</h1>
      
      <div className="prose max-w-none mb-8">
        <p>
          Search for ingredients to explore their nutritional profiles. Data is sourced from the USDA FoodData Central database.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Ingredient Search</h2>
          <NutritionalDisplay />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Popular Ingredients</h2>
          <div className="grid grid-cols-1 gap-4">
            <NutritionalDisplay ingredientName="spinach" compact={true} showSearch={false} />
            <NutritionalDisplay ingredientName="chicken breast" compact={true} showSearch={false} />
            <NutritionalDisplay ingredientName="banana" compact={true} showSearch={false} />
          </div>
        </div>
      </div>
    </div>
  );
} 