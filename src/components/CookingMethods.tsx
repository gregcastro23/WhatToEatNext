import { cookingMethods } from '@/data/cooking/cookingMethods';

export default function CookingMethods() {
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Cooking Methods</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(cookingMethods).map(([id, method]) => (
          <div key={id} className="p-4 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">{method.name}</h3>
            <p className="text-gray-600 mb-4">{method.description}</p>
            
            {/* Elemental Effects */}
            <div className="mb-4">
              <h4 className="font-medium mb-1">Elemental Effects:</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(method.elementalEffect).map(([element, value]) => (
                  <span 
                    key={element}
                    className="px-2 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {element}: {(value * 100).toFixed()}%
                  </span>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div>
              <h4 className="font-medium mb-1">Benefits:</h4>
              <ul className="list-disc list-inside text-sm">
                {method.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 