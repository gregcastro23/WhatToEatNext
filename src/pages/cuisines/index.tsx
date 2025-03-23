import React from 'react';
import { FoodData } from '@/data';
import Link from 'next/link';

export default function CuisinesPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">World Cuisines</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(FoodData.cuisines).map(([id, cuisine]) => (
          <Link 
            href={`/cuisines/${id}`} 
            key={id}
            className="p-4 border rounded-lg hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{cuisine.name}</h2>
            <p className="text-gray-600">{cuisine.description}</p>
            
            <div className="mt-4">
              <h3 className="font-medium mb-1">Elemental Balance:</h3>
              <div className="flex gap-2">
                {Object.entries(cuisine.elementalState).map(([element, value]) => (
                  <span 
                    key={element}
                    className="px-2 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {element}: {(value * 100).toFixed()}%
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 