import React from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import cuisinesMap from '@/data/cuisines';
import { getCurrentElementalState } from '@/utils/elementalUtils';

interface SauceItem {
  id: string;
  name: string;
  description?: string;
  base?: string;
  cuisine: string;
  cuisineId: string;
  seasonality?: string;
  elementalProperties?: Record<string, number>;
}

const SaucesPage: NextPage = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCuisine, setSelectedCuisine] = React.useState('');
  const [selectedBase, setSelectedBase] = React.useState('');
  const [elementalState, setElementalState] = React.useState({
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25,
    season: 'spring',
    timeOfDay: 'lunch',
  });

  React.useEffect(() => {
    // Get current elemental state based on time, date, etc.
    const currentState = getCurrentElementalState();
    setElementalState(currentState);
  }, []);

  // Collect all sauces from all cuisines
  const allSauces = React.useMemo<SauceItem[]>(() => {
    const sauces: SauceItem[] = [];
    
    Object.entries(cuisinesMap).forEach(([cuisineId, cuisineData]) => {
      if (cuisineData.traditionalSauces) {
        Object.entries(cuisineData.traditionalSauces).forEach(([sauceId, sauceData]) => {
          sauces.push({
            id: sauceId,
            name: sauceData.name || sauceId,
            description: sauceData.description,
            base: sauceData.base,
            cuisine: cuisineData.name,
            cuisineId: cuisineId,
            seasonality: sauceData.seasonality,
            elementalProperties: sauceData.elementalProperties
          });
        });
      }
    });
    
    return sauces;
  }, []);

  // Get all unique cuisines
  const availableCuisines = React.useMemo(() => {
    const cuisines = new Set<string>();
    allSauces.forEach(sauce => cuisines.add(sauce.cuisine));
    return Array.from(cuisines).sort();
  }, [allSauces]);

  // Get all unique bases
  const availableBases = React.useMemo(() => {
    const bases = new Set<string>();
    allSauces.forEach(sauce => {
      if (sauce.base) bases.add(sauce.base);
    });
    return Array.from(bases).sort();
  }, [allSauces]);

  // Filter sauces based on search and filters
  const filteredSauces = React.useMemo(() => {
    return allSauces.filter(sauce => {
      // Filter by search term
      if (searchTerm && !sauce.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !(sauce.description && sauce.description.toLowerCase().includes(searchTerm.toLowerCase()))) {
        return false;
      }
      
      // Filter by cuisine
      if (selectedCuisine && sauce.cuisine !== selectedCuisine) {
        return false;
      }
      
      // Filter by base
      if (selectedBase && sauce.base !== selectedBase) {
        return false;
      }
      
      return true;
    });
  }, [allSauces, searchTerm, selectedCuisine, selectedBase]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Traditional Sauces</h1>
      
      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex flex-wrap gap-4">
          <div className="w-full md:w-1/3">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Sauces
            </label>
            <input
              type="text"
              id="search"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-1/4">
            <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Cuisine
            </label>
            <select
              id="cuisine"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
            >
              <option value="">All Cuisines</option>
              {availableCuisines.map(cuisine => (
                <option key={cuisine} value={cuisine}>{cuisine}</option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-1/4">
            <label htmlFor="base" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Base
            </label>
            <select
              id="base"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={selectedBase}
              onChange={(e) => setSelectedBase(e.target.value)}
            >
              <option value="">All Bases</option>
              {availableBases.map(base => (
                <option key={base} value={base}>{base}</option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-auto flex items-end">
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCuisine('');
                setSelectedBase('');
              }}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Results */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4 text-gray-600">
          {filteredSauces.length} {filteredSauces.length === 1 ? 'sauce' : 'sauces'} found
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSauces.map(sauce => {
            // Create URL-friendly IDs
            const cuisineId = sauce.cuisineId.toLowerCase();
            const sauceId = sauce.id.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
            
            return (
              <Link 
                href={`/sauces/${cuisineId}/${sauceId}`}
                key={`${cuisineId}-${sauceId}`}
                className="block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  <h2 className="text-xl font-semibold mb-2 hover:text-blue-600">{sauce.name}</h2>
                  
                  {sauce.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{sauce.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded">
                      {sauce.cuisine}
                    </span>
                    
                    {sauce.base && (
                      <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                        {sauce.base} base
                      </span>
                    )}
                    
                    {sauce.seasonality && (
                      <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded">
                        {sauce.seasonality}
                      </span>
                    )}
                  </div>
                  
                  {sauce.elementalProperties && (
                    <div className="mt-3 grid grid-cols-4 gap-1">
                      {Object.entries(sauce.elementalProperties).map(([element, value]) => (
                        <div key={element} className="text-center text-xs">
                          <div className="rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-1" style={{
                            backgroundColor: element === 'Fire' ? 'rgba(239, 68, 68, 0.1)' : 
                                            element === 'Water' ? 'rgba(59, 130, 246, 0.1)' :
                                            element === 'Earth' ? 'rgba(75, 85, 99, 0.1)' :
                                            'rgba(167, 139, 250, 0.1)',
                            color: element === 'Fire' ? 'rgb(185, 28, 28)' : 
                                   element === 'Water' ? 'rgb(29, 78, 216)' :
                                   element === 'Earth' ? 'rgb(55, 65, 81)' :
                                   'rgb(109, 40, 217)'
                          }}>
                            {typeof value === 'number' ? Math.round(value * 100) : value}%
                          </div>
                          <div className="text-gray-600">{element}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
        
        {filteredSauces.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-600 mb-4">No sauces found</h3>
            <p className="text-gray-500">Try adjusting your filters or search term</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SaucesPage; 