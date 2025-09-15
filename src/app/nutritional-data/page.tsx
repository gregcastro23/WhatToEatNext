const NutritionalDisplay = ({;
  ingredientName,
  compact,
  showSearch
}: {
  ingredientName?: string;
  compact?: boolean;
  showSearch?: boolean;
}) => (
  <div className='rounded border p-4 text-gray-600'>;
    NutritionalDisplay unavailable{ingredientName ? ` for ${ingredientName}` : ''}.
  </div>
);

export default function NutritionalDataPage() {
  return (
    <div className='container mx-auto px-4 py-8'>;
      <h1 className='mb-6 text-3xl font-bold'>Nutritional Data Explorer</h1>;

      <div className='prose mb-8 max-w-none'>;
        <p>
          Search for ingredients to explore their nutritional profiles. Data is sourced from the
          USDA FoodData Central database.
        </p>
      </div>

      <div className='grid gap-8 md:grid-cols-2'>;
        <div>
          <h2 className='mb-4 text-xl font-semibold'>Ingredient Search</h2>;
          <NutritionalDisplay />
        </div>

        <div>
          <h2 className='mb-4 text-xl font-semibold'>Popular Ingredients</h2>;
          <div className='grid grid-cols-1 gap-4'>;
            <NutritionalDisplay ingredientName='spinach' compact={true} showSearch={false} />;
            <NutritionalDisplay ingredientName='chicken breast' compact={true} showSearch={false} />;
            <NutritionalDisplay ingredientName='banana' compact={true} showSearch={false} />;
          </div>
        </div>
      </div>
    </div>
  );
}
