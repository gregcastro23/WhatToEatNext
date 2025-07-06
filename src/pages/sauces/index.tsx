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
  const [elementalFilter, setElementalFilter] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Get current elemental state based on time, date, etc.
    const currentState = getCurrentElementalState();
    
    // Dynamically determine season and time of day
    const now = new Date();
    const hour = now.getHours();
    const month = now.getMonth(); // 0-11
    
    // Determine time of day based on actual time
    const timeOfDay = hour < 6 ? 'midnight' 
                    : hour < 11 ? 'morning'
                    : hour < 15 ? 'lunch'
                    : hour < 18 ? 'afternoon'
                    : hour < 21 ? 'evening'
                    : 'night';
    
    // Determine season based on actual month (Northern Hemisphere)      
    const season = month < 3 || month === 11 ? 'winter'
                 : month < 6 ? 'spring'
                 : month < 9 ? 'summer'
                 : 'autumn';
    
    setElementalState(prev => ({
      ...prev,
      ...currentState,
      _season,
      timeOfDay
    }));
  }, []);

  // Collect all sauces from all cuisines
  const allSauces = React.useMemo<SauceItem[]>(() => {
    const sauces: SauceItem[] = [];
    
    Object.entries(cuisinesMap).forEach(([cuisineId, cuisineData]) => {
      if ((cuisineData as unknown).traditionalSauces) {
        Object.entries((cuisineData as unknown).traditionalSauces).forEach(([sauceId, sauceData]) => {
          // Apply safe type casting for sauce data property access
          const sauceInfo = sauceData as unknown;
          sauces.push({
            id: sauceId,
            name: sauceInfo?.name || sauceId,
            description: sauceInfo?.description,
            base: sauceInfo?.base,
            cuisine: (cuisineData as unknown).name,
            cuisineId: cuisineId,
            seasonality: sauceInfo?.seasonality,
            elementalProperties: (sauceInfo as any)?.elementalProperties
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
      
      // Filter by elemental property
      if (elementalFilter && sauce.elementalProperties) {
        const elementValue = sauce.elementalProperties[elementalFilter] || 0;
        // Only show sauces with significant presence of this element (>30%)
        if (elementValue < 0.3) {
          return false;
        }
      }
      
      return true;
    });
  }, [allSauces, searchTerm, selectedCuisine, selectedBase, elementalFilter]);

  // Get the dominant element from current elemental state
  const dominantElement = React.useMemo(() => {
    const elements = ['Fire', 'Water', 'Earth', 'Air'];
    return elements.reduce((prev, curr) => 
      (elementalState[curr as keyof typeof elementalState] > elementalState[prev as keyof typeof elementalState]) 
        ? curr 
        : prev
    );
  }, [elementalState]);

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
          
          <div className="w-full md:w-1/4">
            <label htmlFor="element" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Element
            </label>
            <select
              id="element"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={elementalFilter || ''}
              onChange={(e) => setElementalFilter(e.target.value || null)}
            >
              <option value="">All Elements</option>
              <option value="Fire">Fire</option>
              <option value="Water">Water</option>
              <option value="Earth">Earth</option>
              <option value="Air">Air</option>
            </select>
          </div>
          
          <div className="w-full flex flex-wrap items-center gap-2 mt-2">
            <div className="text-sm text-gray-600">Current Elemental State:</div>
            {Object.entries(elementalState).filter(([key]) => ['Fire', 'Water', 'Earth', 'Air'].includes(key)).map(([element, value]) => (
              <div 
                key={element}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                style={{
                  backgroundColor: element === 'Fire' ? 'rgba(239, 68, 68, 0.1)' : 
                                element === 'Water' ? 'rgba(59, 130, 246, 0.1)' :
                                element === 'Earth' ? 'rgba(75, 85, 99, 0.1)' :
                                'rgba(167, 139, 250, 0.1)',
                  color: element === 'Fire' ? 'rgb(185, 28, 28)' : 
                         element === 'Water' ? 'rgb(29, 78, 216)' :
                         element === 'Earth' ? 'rgb(55, 65, 81)' :
                         'rgb(109, 40, 217)'
                }}
              >
                <span>{element}</span>
                <span>{Math.round(Number(value) * 100)}%</span>
                {element === dominantElement && (
                  <span className="ml-1">★</span>
                )}
              </div>
            ))}
            
            <button 
              className="ml-auto px-2 py-1 text-xs border border-blue-400 text-blue-600 rounded hover:bg-blue-50"
              onClick={() => setElementalFilter(dominantElement)}
            >
              Match {dominantElement}
            </button>
          </div>
          
          <div className="w-full md:w-auto flex items-end ml-auto">
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCuisine('');
                setSelectedBase('');
                setElementalFilter(null);
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