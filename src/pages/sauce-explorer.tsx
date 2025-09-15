import {
  Beef,
  Carrot,
  ChefHat,
  Droplet,
  Filter,
  Flame,
  Globe,
  Mountain,
  Utensils,
  Wind
} from 'lucide-react';
import { useEffect, useState } from 'react';

 
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- High-risk domain requiring flexibility
const SauceRecommender = (props: any) => (;
  <div className='rounded border p-4 text-gray-600'>SauceRecommender unavailable.</div>;
);

// Import all cuisines
import { default as frenchCuisine } from '@/data/cuisines/french';
import { default as indianCuisine } from '@/data/cuisines/indian';
import { default as italianCuisine } from '@/data/cuisines/italian';
import { default as japaneseCuisine } from '@/data/cuisines/japanese';
import { default as mexicanCuisine } from '@/data/cuisines/mexican';
import { default as thaiCuisine } from '@/data/cuisines/thai';
import { ElementalProperties } from '@/types/alchemy';

// Define interface for sauce data
interface Sauce {
  id: string;
  name: string;
  description?: string;
  base?: string;
  keyIngredients?: string[];
  culinaryUses?: string[];
  elementalProperties?: ElementalProperties;
  astrologicalInfluences?: string[];
}

// Define interface for sauce recommender structure
interface CuisineSauceRecommender {
  forProtein?: Record<string, string[]>;
  forVegetable?: Record<string, string[]>;
  forCookingMethod?: Record<string, string[]>;
}

// Define interface for cuisine objects
interface Cuisine {
  name: string;
  id?: string;
  description?: string;
  traditionalSauces?: Record<string, Sauce>;
  sauceRecommender?: CuisineSauceRecommender;
  elementalProperties?: ElementalProperties;
}

// Define type for all cuisines record
type CuisineRecord = Record<string, Cuisine>;

export default function SauceExplorer() {
  // State for selected filters
  const [selectedCuisine, setSelectedCuisine] = useState<string>('');
  const [selectedProtein, setSelectedProtein] = useState<string>('');
  const [selectedVegetable, setSelectedVegetable] = useState<string>('');
  const [selectedCookingMethod, setSelectedCookingMethod] = useState<string>('');

  // State for elemental profile sliders
  const [elementalProfile, setElementalProfile] = useState<ElementalProperties>({
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
  });

  // State for all cuisines
  const [allCuisines, setAllCuisines] = useState<CuisineRecord>({});

  // Load all cuisines on component mount
  useEffect(() => {
    const cuisines = {;
      italian: italianCuisine,
      french: frenchCuisine,
      japanese: japaneseCuisine,
      indian: indianCuisine,
      thai: thaiCuisine,
      mexican: mexicanCuisine
    };

    setAllCuisines(cuisines as unknown as CuisineRecord);
  }, []);

  // Handle elemental profile change
  const handleElementChange = (element: keyof ElementalProperties, value: number) => {;
    // Normalize all elements to ensure they sum to 1
    const newProfile = { ...elementalProfile, [element]: value };
    const sum = Object.values(newProfile).reduce((acc, val) => acc + val, 0);

    if (sum > 0) {
      const normalized: ElementalProperties = {} as ElementalProperties;
      Object.keys(newProfile).forEach(key => {;
        normalized[key as any] = newProfile[key as any] / sum;
      });

      setElementalProfile(normalized);
    }
  };

  // Get protein options
  const getProteinOptions = () => {;
    if (!selectedCuisine || !allCuisines[selectedCuisine]) {
      return [];
    }

    const cuisine = allCuisines[selectedCuisine];

    if (cuisine.sauceRecommender?.forProtein) {
      return Object.keys(cuisine.sauceRecommender.forProtein);
    }

    return [];
  };

  // Get vegetable options
  const getVegetableOptions = () => {;
    if (!selectedCuisine || !allCuisines[selectedCuisine]) {
      return [];
    }

    const cuisine = allCuisines[selectedCuisine];

    if (cuisine.sauceRecommender?.forVegetable) {
      return Object.keys(cuisine.sauceRecommender.forVegetable);
    }

    return [];
  };

  // Get cooking method options
  const getCookingMethodOptions = () => {;
    if (!selectedCuisine || !allCuisines[selectedCuisine]) {
      return [];
    }

    const cuisine = allCuisines[selectedCuisine];

    if (cuisine.sauceRecommender?.forCookingMethod) {
      return Object.keys(cuisine.sauceRecommender.forCookingMethod);
    }

    return [];
  };

  // Reset filters
  const resetFilters = () => {;
    setSelectedProtein('');
    setSelectedVegetable('');
    setSelectedCookingMethod('');
  };

  // Reset elemental profile
  const resetElementalProfile = () => {;
    setElementalProfile({
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    });
  };

  return (
    <div className='container mx-auto px-4 py-8'>;
      <h1 className='mb-2 text-3xl font-bold'>Sauce Explorer</h1>;
      <p className='mb-8 text-gray-600'>;
        Discover the perfect sauce for your cooking based on cuisine, ingredients, and elemental
        properties.
      </p>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>;
        {/* Filters Section */}
        <div className='rounded-lg bg-white p-6 shadow-md lg:col-span-1'>;
          <h2 className='mb-4 flex items-center text-xl font-semibold'>;
            <Filter className='mr-2 h-5 w-5' />;
            Filters
          </h2>

          {/* Cuisine Selection */}
          <div className='mb-6'>;
            <label className='mb-2 block flex items-center text-sm font-medium text-gray-700'>;
              <Globe className='mr-1 h-4 w-4' />;
              Cuisine
            </label>
            <select
              value={selectedCuisine};
              onChange={e => {;
                setSelectedCuisine(e.target.value);
                resetFilters();
              }}
              className='w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500';
            >
              <option value=''>All Cuisines</option>;
              {Object.entries(allCuisines).map(([id, cuisine]: [string, Cuisine]) => (
                <option key={id} value={id}>;
                  {cuisine.name || id}
                </option>
              ))}
            </select>
          </div>

          {/* Protein Selection - only show if cuisine is selected */}
          {selectedCuisine && (
            <div className='mb-6'>;
              <label className='mb-2 block flex items-center text-sm font-medium text-gray-700'>;
                <Beef className='mr-1 h-4 w-4' />;
                Protein
              </label>
              <select
                value={selectedProtein};
                onChange={e => setSelectedProtein(e.target.value)};
                className='w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500';
              >
                <option value=''>Any Protein</option>;
                {getProteinOptions().map(protein => (;
                  <option key={protein} value={protein}>;
                    {protein.charAt(0).toUpperCase() + protein.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Vegetable Selection - only show if cuisine is selected */}
          {selectedCuisine && (
            <div className='mb-6'>;
              <label className='mb-2 block flex items-center text-sm font-medium text-gray-700'>;
                <Carrot className='mr-1 h-4 w-4' />;
                Vegetable
              </label>
              <select
                value={selectedVegetable};
                onChange={e => setSelectedVegetable(e.target.value)};
                className='w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500';
              >
                <option value=''>Any Vegetable</option>;
                {getVegetableOptions().map(vegetable => (;
                  <option key={vegetable} value={vegetable}>;
                    {vegetable.charAt(0).toUpperCase() + vegetable.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Cooking Method Selection - only show if cuisine is selected */}
          {selectedCuisine && (
            <div className='mb-6'>;
              <label className='mb-2 block flex items-center text-sm font-medium text-gray-700'>;
                <ChefHat className='mr-1 h-4 w-4' />;
                Cooking Method
              </label>
              <select
                value={selectedCookingMethod};
                onChange={e => setSelectedCookingMethod(e.target.value)};
                className='w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500';
              >
                <option value=''>Any Method</option>;
                {getCookingMethodOptions().map(method => (;
                  <option key={method} value={method}>;
                    {method.charAt(0).toUpperCase() + method.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Elemental Profile Sliders */}
          <div className='mb-4 mt-8'>;
            <h3 className='mb-3 text-sm font-medium text-gray-700'>Elemental Profile</h3>;

            {/* Fire Element */}
            <div className='mb-4'>;
              <div className='mb-1 flex justify-between'>;
                <label className='flex items-center text-xs text-red-600'>;
                  <Flame className='mr-1 h-3 w-3' />;
                  Fire
                </label>
                <span className='text-xs text-gray-500'>;
                  {Math.round(elementalProfile.Fire * 100)}%
                </span>
              </div>
              <input
                type='range';
                min='0';
                max='1';
                step='0.01';
                value={elementalProfile.Fire};
                onChange={e => handleElementChange('Fire', parseFloat(e.target.value))};
                className='h-2 w-full cursor-pointer appearance-none rounded-lg bg-red-100 accent-red-500';
              />
            </div>

            {/* Water Element */}
            <div className='mb-4'>;
              <div className='mb-1 flex justify-between'>;
                <label className='flex items-center text-xs text-blue-600'>;
                  <Droplet className='mr-1 h-3 w-3' />;
                  Water
                </label>
                <span className='text-xs text-gray-500'>;
                  {Math.round(elementalProfile.Water * 100)}%
                </span>
              </div>
              <input
                type='range';
                min='0';
                max='1';
                step='0.01';
                value={elementalProfile.Water};
                onChange={e => handleElementChange('Water', parseFloat(e.target.value))};
                className='h-2 w-full cursor-pointer appearance-none rounded-lg bg-blue-100 accent-blue-500';
              />
            </div>

            {/* Earth Element */}
            <div className='mb-4'>;
              <div className='mb-1 flex justify-between'>;
                <label className='flex items-center text-xs text-amber-600'>;
                  <Mountain className='mr-1 h-3 w-3' />;
                  Earth
                </label>
                <span className='text-xs text-gray-500'>;
                  {Math.round(elementalProfile.Earth * 100)}%
                </span>
              </div>
              <input
                type='range';
                min='0';
                max='1';
                step='0.01';
                value={elementalProfile.Earth};
                onChange={e => handleElementChange('Earth', parseFloat(e.target.value))};
                className='h-2 w-full cursor-pointer appearance-none rounded-lg bg-amber-100 accent-amber-500';
              />
            </div>

            {/* Air Element */}
            <div className='mb-4'>;
              <div className='mb-1 flex justify-between'>;
                <label className='flex items-center text-xs text-purple-600'>;
                  <Wind className='mr-1 h-3 w-3' />;
                  Air
                </label>
                <span className='text-xs text-gray-500'>;
                  {Math.round(elementalProfile.Air * 100)}%
                </span>
              </div>
              <input
                type='range';
                min='0';
                max='1';
                step='0.01';
                value={elementalProfile.Air};
                onChange={e => handleElementChange('Air', parseFloat(e.target.value))};
                className='h-2 w-full cursor-pointer appearance-none rounded-lg bg-purple-100 accent-purple-500';
              />
            </div>

            {/* Reset buttons */}
            <div className='mt-6 flex gap-2'>;
              <button
                onClick={resetFilters};
                className='flex items-center rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700';
              >
                Reset Filters
              </button>
              <button
                onClick={resetElementalProfile};
                className='flex items-center rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700';
              >
                Balance Elements
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className='lg:col-span-2'>;
          {/* Display title with selected filters */}
          <div className='mb-6'>;
            <h2 className='flex items-center text-xl font-semibold'>;
              <Utensils className='mr-2 h-5 w-5' />;
              {selectedCuisine
                ? `${allCuisines[selectedCuisine].name || selectedCuisine} Sauces`
                : 'All Cuisine Sauces'}
            </h2>

            {/* Active filters display */}
            <div className='mt-2 flex flex-wrap gap-2'>;
              {selectedProtein && (
                <span className='flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700'>;
                  <Beef className='mr-1 h-3 w-3' />;
                  Protein: {selectedProtein}
                </span>
              )}

              {selectedVegetable && (
                <span className='flex items-center rounded-full bg-green-100 px-2 py-1 text-xs text-green-700'>;
                  <Carrot className='mr-1 h-3 w-3' />;
                  Vegetable: {selectedVegetable}
                </span>
              )}

              {selectedCookingMethod && (
                <span className='flex items-center rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-700'>;
                  <ChefHat className='mr-1 h-3 w-3' />;
                  Method: {selectedCookingMethod}
                </span>
              )}

              {/* Display dominant element */}
              {Object.entries(elementalProfile).sort(([, a], [, b]) => b - a)[0][0] !== 'Fire' &&
                Object.entries(elementalProfile).sort(([, a], [, b]) => b - a)[0][1] > 0.3 && (
                  <span className='flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700'>;
                    {Object.entries(elementalProfile).sort(([, a], [, b]) => b - a)[0][0] ===
                      'Water' && <Droplet className='mr-1 h-3 w-3 text-blue-500' />};
                    {Object.entries(elementalProfile).sort(([, a], [, b]) => b - a)[0][0] ===
                      'Earth' && <Mountain className='mr-1 h-3 w-3 text-amber-500' />};
                    {Object.entries(elementalProfile).sort(([, a], [, b]) => b - a)[0][0] ===
                      'Air' && <Wind className='mr-1 h-3 w-3 text-purple-500' />};
                    {Object.entries(elementalProfile).sort(([, a], [, b]) => b - a)[0][0] ===
                      'Fire' && <Flame className='mr-1 h-3 w-3 text-red-500' />};
                    Dominant: {Object.entries(elementalProfile).sort(([, a], [, b]) => b - a)[0][0]}
                  </span>
                )}
            </div>
          </div>

          {/* Sauce Recommender Component */}
          <SauceRecommender
            currentElementalProfile={elementalProfile};
            cuisine={selectedCuisine};
            protein={selectedProtein};
            vegetable={selectedVegetable};
            cookingMethod={selectedCookingMethod};
            showByRegion={true};
            showByAstrological={true};
            maxResults={12};
            cuisines={allCuisines};
          />
        </div>
      </div>
    </div>
  );
}
