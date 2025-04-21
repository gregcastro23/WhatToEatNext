'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { createFuseInstance, getStringSimilarity, tokenize } from '../utils/searchConfig';
import { format } from 'date-fns';
import { 
  ingredientsMap, 
  standardizedIngredients,
} from '../data/ingredients';
import type { Ingredient } from '../types/alchemy';
import type { RecipeData } from '../data/recipes';

// Define search categories
const SEARCH_CATEGORIES = ['All', 'Ingredients', 'Recipes', 'Cuisines'];

// Define the type for search results
interface SearchResult {
  item: unknown;
  refIndex: number;
  score?: number;
  category: string;
}

export default function SearchComponent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [allItems, setAllItems] = useState<any[]>([]);

  // Load all searchable items
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Dynamically import recipes and cuisines
        const recipes = await import('../data/recipes/elementalMappings').then(module => module.recipeElementalMappings || []);
        const cuisines = await import('../data/cuisines').then(module => module.cuisines || []);
        
        // Prepare items with category information
        const ingredientItems = Array.isArray(standardizedIngredients) 
          ? standardizedIngredients.map(item => ({
              ...(item as object),
              _searchCategory: 'Ingredients'
            }))
          : [];
        
        const recipeItems = Array.isArray(recipes) ? recipes.map(item => ({
          ...item,
          _searchCategory: 'Recipes'
        })) : [];
        
        const cuisineItems = Object.values(cuisines || {}).map(item => ({
          ...item,
          _searchCategory: 'Cuisines'
        }));
        
        setAllItems([...ingredientItems, ...recipeItems, ...cuisineItems]);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading search data:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Create Fuse instance with all items
  const fuseInstance = useMemo(() => {
    return createFuseInstance(allItems);
  }, [allItems]);

  // Perform search when query changes
  useEffect(() => {
    if (!searchQuery || !fuseInstance) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    
    // Simulate async search
    const timer = setTimeout(() => {
      let results = fuseInstance.search(searchQuery);
      
      // Filter by category if needed
      if (activeCategory !== 'All') {
        results = results.filter(result => 
          result.item._searchCategory === activeCategory
        );
      }
      
      // Add category to search results
      const formattedResults = results.map(result => ({
        ...result,
        category: result.item._searchCategory || 'Unknown'
      }));
      
      setSearchResults(formattedResults);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, fuseInstance, activeCategory]);

  // Format date for recipes
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '';
    try {
      return format(new Date(date), 'MMM d, yyyy');
    } catch {
      return '';
    }
  };

  return (
    <div className="w-full mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-indigo-800 mb-4">Alchemical Search</h2>
      
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            id="search"
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Search for ingredients, recipes, or cuisines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {isLoading && (
            <div className="absolute right-3 top-2">
              <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>
      </div>
      
      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {SEARCH_CATEGORIES.map((category) => (
          <button
            key={category}
            className={`px-3 py-1 text-sm rounded-full ${
              activeCategory === category
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Display search results */}
      {searchQuery && (
        <div className="bg-white rounded-md border border-gray-200 max-h-96 overflow-y-auto">
          {searchResults.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {isLoading ? 'Searching...' : 'No results found'}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {searchResults.map((result, index) => (
                <li key={index} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between">
                    <h3 className="text-sm font-medium text-gray-900">{(result.item as any).name}</h3>
                    <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                      {result.category}
                    </span>
                  </div>
                  
                  {/* Show match score */}
                  {result.score !== undefined && (
                    <div className="mt-1">
                      <span className="text-xs text-gray-500">
                        Match: {Math.round((1 - result.score) * 100)}%
                      </span>
                    </div>
                  )}
                  
                  {/* Ingredient-specific display */}
                  {result.category === 'Ingredients' && (
                    <>
                      {(result.item as any).category && (
                        <p className="text-xs text-gray-600 mt-1">
                          Category: {(result.item as any).category}
                        </p>
                      )}
                      {(result.item as any).attributes?.elements && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {Object.entries((result.item as any).elementalProperties || (result.item as any).attributes?.elements || {}).map(([element, value]) => (
                            <span
                              key={element}
                              className={`px-2 py-0.5 rounded-full text-xs ${getElementColor(element)}`}
                            >
                              {element} {typeof value === 'number' ? `${Math.round(value * 100)}%` : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Recipe-specific display */}
                  {result.category === 'Recipes' && (
                    <>
                      <p className="text-xs text-gray-600 mt-1">
                        {(result.item as any).cuisine && `Cuisine: ${(result.item as any).cuisine}`}
                        {(result.item as any).timeToMake && ` • Prep time: ${(result.item as any).timeToMake} min`}
                      </p>
                      {(result.item as any).tags && (result.item as any).tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {(result.item as any).tags.slice(0, 3).map((tag: string) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800"
                            >
                              {tag}
                            </span>
                          ))}
                          {(result.item as any).tags.length > 3 && (
                            <span className="text-xs text-gray-500">+{(result.item as any).tags.length - 3} more</span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Cuisine-specific display */}
                  {result.category === 'Cuisines' && (
                    <>
                      <p className="text-xs text-gray-600 mt-1">
                        {result.item && typeof result.item === 'object' && 'region' in result.item && result.item.region ? 
                          `Region: ${result.item.region}` : ''}
                      </p>
                      {result.item && typeof result.item === 'object' && 'elementalProfile' in result.item && result.item.elementalProfile && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {Object.entries(result.item.elementalProfile as Record<string, number>).map(([element, value]) => (
                            <span
                              key={element}
                              className={`px-2 py-0.5 rounded-full text-xs ${getElementColor(element)}`}
                            >
                              {element} {typeof value === 'number' ? `${Math.round(value * 100)}%` : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// Helper function to get color class for elements
function getElementColor(element: string): string {
  switch (element.toLowerCase()) {
    case 'fire':
      return 'bg-red-100 text-red-800';
    case 'water':
      return 'bg-blue-100 text-blue-800';
    case 'earth':
      return 'bg-green-100 text-green-800';
    case 'air':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
} 