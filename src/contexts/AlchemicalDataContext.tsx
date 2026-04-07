'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { flattenCuisineRecipes } from '@/data/recipes/index';
import { alchmAPI } from '@/lib/api/alchm-client';
import type { Recipe } from '@/types/recipe';

interface AlchemicalDataContextType {
  cuisines: Record<string, any> | null;
  sauces: Record<string, any> | null;
  ingredients: Record<string, any> | null;
  recipes: Recipe[] | null;
  loading: boolean;
  error: string | null;
}

const AlchemicalDataContext = createContext<AlchemicalDataContextType>({
  cuisines: null,
  sauces: null,
  ingredients: null,
  recipes: null,
  loading: true,
  error: null,
});

export const useAlchemicalData = () => useContext(AlchemicalDataContext);

export function AlchemicalDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AlchemicalDataContextType>({
    cuisines: null,
    sauces: null,
    ingredients: null,
    recipes: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [cuisines, sauces, ingredients] = await Promise.all([
          alchmAPI.getCuisines(),
          alchmAPI.getSauces(),
          alchmAPI.getIngredients(),
        ]);
        
        const recipes = flattenCuisineRecipes(cuisines);
        
        if (isMounted) {
          setData({
            cuisines,
            sauces,
            ingredients,
            recipes,
            loading: false,
            error: null,
          });
        }
      } catch (err: any) {
        if (isMounted) {
          setData(prev => ({
            ...prev,
            loading: false,
            error: err.message || 'Failed to load alchemical data',
          }));
        }
      }
    };

    void fetchData();
    return () => { isMounted = false; };
  }, []);

  return (
    <AlchemicalDataContext.Provider value={data}>
      {children}
    </AlchemicalDataContext.Provider>
  );
}
