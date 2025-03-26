import { FoodData } from '@/data';
import { useRouter } from 'next/router';

export default function CuisinePage() {
  const router = useRouter();
  const { id } = router.query;
  
  const cuisine = id ? FoodData.cuisines[id as string] : null;

  if (!cuisine) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{cuisine.name}</h1>
      <p className="text-gray-600 mb-8">{cuisine.description}</p>

      {/* Meal Types */}
      {Object.entries(cuisine.dishes).map(([mealType, mealData]) => (
        <section key={mealType} className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 capitalize">{mealType}</h2>
          
          {/* Seasonal Categories */}
          {Object.entries(mealData).map(([season, dishes]) => (
            <div key={season} className="mb-6">
              <h3 className="text-xl font-medium mb-3 capitalize">{season}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dishes.map((dish) => (
                  <div key={dish.name} className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">{dish.name}</h4>
                    <p className="text-gray-600 text-sm mb-3">{dish.description}</p>
                    
                    {/* Ingredients */}
                    <div className="text-sm">
                      <h5 className="font-medium mb-1">Ingredients:</h5>
                      <ul className="list-disc list-inside">
                        {dish.ingredients.map((ing) => (
                          <li key={ing.name}>
                            {ing.amount} {ing.unit} {ing.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
} 