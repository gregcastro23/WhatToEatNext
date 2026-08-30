'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { cuisines as staticCuisines } from '@/data/cuisines';
import { allIngredients as staticIngredients } from '@/data/ingredients/index';
import { flattenCuisineRecipes } from '@/data/recipes/index';
import { allSauces as staticSauces } from '@/data/sauces';
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

const defaultStaticRecipes = flattenCuisineRecipes(staticCuisines);

const AlchemicalDataContext = createContext<AlchemicalDataContextType>({
  cuisines: staticCuisines,
  sauces: staticSauces,
  ingredients: staticIngredients,
  recipes: defaultStaticRecipes,
  loading: false,
  error: null,
});

export const useAlchemicalData = () => useContext(AlchemicalDataContext);

export function AlchemicalDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AlchemicalDataContextType>({
    cuisines: staticCuisines,
    sauces: staticSauces,
    ingredients: staticIngredients,
    recipes: defaultStaticRecipes,
    loading: false,
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
        
        const effectiveCuisines = cuisines || staticCuisines;
        const effectiveSauces = sauces || staticSauces;
        const effectiveIngredients = ingredients || staticIngredients;
        const recipes = flattenCuisineRecipes(effectiveCuisines) || defaultStaticRecipes;
        
        if (isMounted) {
          setData({
            cuisines: effectiveCuisines,
            sauces: effectiveSauces,
            ingredients: effectiveIngredients,
            recipes,
            loading: false,
            error: null,
          });
        }
      } catch (err: any) {
        if (isMounted) {
          setData(prev => ({
            ...prev,
            cuisines: prev.cuisines || staticCuisines,
            sauces: prev.sauces || staticSauces,
            ingredients: prev.ingredients || staticIngredients,
            recipes: prev.recipes || defaultStaticRecipes,
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
